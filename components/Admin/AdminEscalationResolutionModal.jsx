"use client";

import { useState, useEffect } from "react";
import {
  X,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Sparkles,
  Zap,
  Shield,
  FileText,
  Tag,
  MapPin,
  Loader2,
  Info,
  Building2,
  Activity,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const ESCALATION_ACTION_LABELS = {
  escalate: "Issue Escalated",
  issue_escalated: "Issue Escalated",
  review_escalation: "Escalation Acknowledged",
  extend_sla: "SLA Deadline Extended",
  reassign_unit_officer: "Unit Officer Reassigned",
  reassign_field_officer: "Field Officer Reassigned",
  reassign_officer: "Officer Assignment Updated",
  change_classification: "Issue Classification Changed",
  change_category: "Issue Classification Changed",
  update_priority: "Issue Priority Updated",
  request_corrective_action: "Corrective Action Requested",
  reject_escalation: "Escalation Rejected",
  reject_escalation_response: "Escalation Response Rejected",
  approve_escalation: "Escalation Approved",
  resolve_escalation: "Escalation Resolved",
  dismiss_escalation: "Escalation Dismissed",
  send_message: "Administrative Message Sent",
};

function formatTimelineAction(value) {
  if (!value) return "Action Performed";
  return (
    ESCALATION_ACTION_LABELS[value] ||
    String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function formatPerformerRole(value) {
  switch (String(value || "").toLowerCase()) {
    case "city_admin":
      return "City Admin";
    case "admin":
      return "System Admin";
    case "unit_officer":
      return "Unit Officer";
    case "field_officer":
      return "Field Officer";
    default:
      return "Administrator";
  }
}

function formatDateTime(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseHistoryValue(value) {
  if (!value) return value;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function formatHistoryValue(value) {
  if (!value) return "N/A";

  const parsed = parseHistoryValue(value);

  if (typeof parsed === "object" && parsed !== null) {
    if (parsed.category) {
      const cat = String(parsed.category)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const subs = Array.isArray(parsed.subcategory)
        ? parsed.subcategory
        : parsed.subcategory
          ? [parsed.subcategory]
          : [];

      return (
        <span className="block space-y-1">
          <span className="font-extrabold text-slate-900 dark:text-slate-100">
            {cat}
          </span>
          {subs.length > 0 && (
            <span className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {subs.map((s) => `• ${s}`).join(" ")}
            </span>
          )}
        </span>
      );
    }
    return JSON.stringify(parsed);
  }

  if (
    typeof value === "string" &&
    value.includes("T") &&
    value.endsWith("Z") &&
    !Number.isNaN(Date.parse(value))
  ) {
    return formatDateTime(value);
  }

  return String(value);
}

export function AdminEscalationResolutionModal({ issue, onClose, onResolved }) {
  const adminUserId = "2"; // fallback local admin userId matching AdminDashboard context
  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const issueId = issue?.id || issue?._id;

  // Incompatibility prompt states for System Admin
  const [crossCityPrompt, setCrossCityPrompt] = useState(null);
  const [deptMismatchPrompt, setDeptMismatchPrompt] = useState(null);

  const rawTimeline =
    issue.escalation_resolution_actions ||
    issue.escalation?.resolutionActions ||
    issue.escalationResolutionActions ||
    [];

  const normalisedTimeline = (rawTimeline || [])
    .map((event) => {
      const rawTs = event.performed_at || event.performedAt;
      const parsedTs =
        rawTs !== null && rawTs !== undefined && rawTs !== ""
          ? typeof rawTs === "number"
            ? rawTs
            : new Date(rawTs).getTime()
          : null;
      const performedAt = Number.isFinite(parsedTs) ? parsedTs : null;

      return {
        id:
          event.id ||
          event._id ||
          `${event.type || event.actionType}-${performedAt}`,
        type: event.type || event.actionType,
        performedAt,
        performedBy:
          event.performed_by || event.performedByName || "Administrator",
        performedByRole: event.performedByRole || event.role || "admin",
        notes: event.notes || event.reason || event.comment,
        oldValue: event.old_value || event.oldValue,
        newValue: event.new_value || event.newValue,
      };
    })
    .filter((e) => e.type && e.performedAt !== null)
    .sort((a, b) => Number(a.performedAt) - Number(b.performedAt));

  const currentActions = (
    issue.escalation_resolution_actions ||
    issue.escalation?.resolutionActions ||
    []
  ).filter(
    (a) =>
      a.performed_at >=
      (issue.escalated_at || issue.escalation?.escalatedAt || 0),
  );
  const resolutionActions = currentActions.filter(
    (a) =>
      a.type !== "escalate" &&
      a.type !== "review_escalation" &&
      a.actionType !== "review_escalation",
  );
  const hasResolutionAction = resolutionActions.length > 0;

  const isSlaBreached =
    issue.sla_status === "breached" ||
    issue.sla?.status === "breached" ||
    (issue.sla_deadline &&
      new Date(issue.sla_deadline).getTime() < Date.now()) ||
    (issue.sla?.deadline && issue.sla.deadline < Date.now());

  const isSlaAtRisk =
    issue.sla_status === "at_risk" || issue.sla?.status === "at_risk";
  const escalationResolved = Boolean(
    issue.escalation_resolved || issue.escalation?.resolved,
  );

  const shouldAllowFreshSlaActions =
    isSlaBreached || isSlaAtRisk || (escalationResolved && isSlaBreached);

  const [actionType, setActionType] = useState(
    shouldAllowFreshSlaActions
      ? "extend_sla"
      : hasResolutionAction
        ? "approve"
        : "extend_sla",
  );

  useEffect(() => {
    if (shouldAllowFreshSlaActions) {
      setActionType("extend_sla");
    } else if (hasResolutionAction) {
      setActionType("approve");
    } else {
      setActionType("extend_sla");
    }
  }, [issueId, shouldAllowFreshSlaActions, hasResolutionAction]);

  const [newSlaDeadline, setNewSlaDeadline] = useState("");
  const [selectedUnitOfficerProfileId, setSelectedUnitOfficerProfileId] =
    useState("");
  const [selectedFieldOfficerProfileId, setSelectedFieldOfficerProfileId] =
    useState("");
  const [newCategory, setNewCategory] = useState(issue.category || "road");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Candidate queries for System Admin with explicit officerType
  const isUnitReassignment = actionType === "reassign_unit_officer";
  const isFieldReassignment = actionType === "reassign_field_officer";

  const candidateQuery = useQuery(
    api.admin.getAssignableOfficers,
    issueId && (isUnitReassignment || isFieldReassignment)
      ? {
          issueId,
          officerType: isUnitReassignment ? "unit_officer" : "field_officer",
        }
      : "skip",
  );

  const candidates = candidateQuery?.candidates ?? [];
  const isCandidatesLoading =
    (isUnitReassignment || isFieldReassignment) && candidateQuery === undefined;

  const extendSla = useMutation(api.escalation.extendIssueSla);
  const reassignOfficer = useMutation(api.escalation.reassignIssueOfficer);
  const changeCategory = useMutation(api.escalation.changeIssueCategory);
  const approveEscalation = useMutation(api.escalation.approveEscalation);
  const rejectEscalation = useMutation(api.escalation.rejectEscalation);

  // Initialize selected officer profile IDs from current issue assignments
  useEffect(() => {
    if (issue) {
      setSelectedUnitOfficerProfileId(
        issue.assignedUnitOfficer?.profileId ||
          issue.assigned_officer?.id ||
          issue.assignedUnitOfficer ||
          "",
      );
      setSelectedFieldOfficerProfileId(
        issue.assignedFieldOfficer?.profileId ||
          issue.field_officer?.id ||
          issue.assignedFieldOfficer ||
          "",
      );
    }
  }, [issue]);

  // Set default SLA deadline string
  useEffect(() => {
    const d = issue.sla_deadline || issue.sla?.deadline;
    if (d) {
      const formatted = new Date(d).toISOString().slice(0, 16);
      setNewSlaDeadline(formatted);
    }
  }, [issue]);

  const handleExecuteResolution = async (overrides = {}) => {
    setModalError("");

    if (actionType === "extend_sla") {
      if (!newSlaDeadline) {
        setModalError("Please select a valid new SLA deadline.");
        return;
      }
      if (!resolutionNotes.trim()) {
        setModalError("Please provide resolution notes for the SLA extension.");
        return;
      }
    } else if (actionType === "reassign_unit_officer") {
      if (!selectedUnitOfficerProfileId) {
        setModalError("Please select a Unit Officer candidate.");
        return;
      }
      if (!resolutionNotes.trim()) {
        setModalError("Please provide resolution notes for reassignment.");
        return;
      }
    } else if (actionType === "reassign_field_officer") {
      if (!selectedFieldOfficerProfileId) {
        setModalError("Please select a Field Officer candidate.");
        return;
      }
      if (!resolutionNotes.trim()) {
        setModalError("Please provide resolution notes for reassignment.");
        return;
      }
    } else if (actionType === "change_category") {
      if (newCategory === issue.category) {
        setModalError("Please select a different category.");
        return;
      }
      if (!resolutionNotes.trim()) {
        setModalError("Please provide resolution notes for category change.");
        return;
      }
    } else if (actionType === "reject_response") {
      if (!rejectionReason.trim()) {
        setModalError(
          "Please provide a reason for rejecting the escalation response.",
        );
        return;
      }
    } else if (actionType === "approve") {
      if (!resolutionNotes.trim()) {
        setModalError("Please provide resolution notes to approve resolution.");
        return;
      }
    }

    setLoading(true);
    try {
      if (actionType === "extend_sla") {
        await extendSla({
          issueId,
          newDeadline: new Date(newSlaDeadline).getTime(),
          notes: resolutionNotes,
          adminId: adminUserId,
        });
      } else if (actionType === "reassign_unit_officer") {
        const res = await reassignOfficer({
          issueId,
          officerType: "unit_officer",
          newOfficerProfileId: selectedUnitOfficerProfileId,
          notes: resolutionNotes,
          adminId: adminUserId,
          confirmCrossCity: overrides.confirmCrossCity,
          confirmDepartmentMismatch: overrides.confirmDepartmentMismatch,
        });
        if (res?.code === "CROSS_CITY_CONFIRMATION_REQUIRED") {
          setCrossCityPrompt({
            message: res.message,
            officerCity: res.officerCity,
            issueCity: res.issueCity,
          });
          setLoading(false);
          return;
        }
        if (res?.code === "DEPARTMENT_MISMATCH_CONFIRMATION_REQUIRED") {
          setDeptMismatchPrompt({
            message: res.message,
            officerDept: res.officerDept,
            issueDept: res.issueDept,
          });
          setLoading(false);
          return;
        }
      } else if (actionType === "reassign_field_officer") {
        const res = await reassignOfficer({
          issueId,
          officerType: "field_officer",
          newOfficerProfileId: selectedFieldOfficerProfileId,
          notes: resolutionNotes,
          adminId: adminUserId,
          confirmCrossCity: overrides.confirmCrossCity,
          confirmDepartmentMismatch: overrides.confirmDepartmentMismatch,
        });
        if (res?.code === "CROSS_CITY_CONFIRMATION_REQUIRED") {
          setCrossCityPrompt({
            message: res.message,
            officerCity: res.officerCity,
            issueCity: res.issueCity,
          });
          setLoading(false);
          return;
        }
        if (res?.code === "DEPARTMENT_MISMATCH_CONFIRMATION_REQUIRED") {
          setDeptMismatchPrompt({
            message: res.message,
            officerDept: res.officerDept,
            issueDept: res.issueDept,
          });
          setLoading(false);
          return;
        }
      } else if (actionType === "change_category") {
        await changeCategory({
          issueId,
          newCategory,
          notes: resolutionNotes,
          adminId: adminUserId,
        });
      } else if (actionType === "reject_response") {
        await rejectEscalation({
          issueId,
          reason: rejectionReason,
          adminId: adminUserId,
        });
      } else if (actionType === "approve") {
        await approveEscalation({
          issueId,
          notes: resolutionNotes,
          adminId: adminUserId,
        });
      }

      onResolved?.();
      onClose();
    } catch (error) {
      console.error("Error resolving escalation:", error);
      setModalError("Failed to execute action: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionConfig = () => {
    switch (actionType) {
      case "extend_sla":
        return {
          icon: Clock,
          gradient: "from-blue-500 to-cyan-500",
          bgGradient:
            "from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-cyan-950/30",
          borderColor: "border-blue-500",
          title: "Extend SLA Deadline",
          description:
            "Grant additional time for issue resolution and log history",
        };
      case "reassign_unit_officer":
        return {
          icon: Shield,
          gradient: "from-purple-500 to-pink-500",
          bgGradient:
            "from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-950/30",
          borderColor: "border-purple-500",
          title: "Reassign Unit Officer",
          description: "Transfer unit oversight to a candidate officer",
        };
      case "reassign_field_officer":
        return {
          icon: Users,
          gradient: "from-indigo-500 to-purple-500",
          bgGradient:
            "from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950/30",
          borderColor: "border-indigo-500",
          title: "Reassign Field Officer",
          description: "Assign a candidate field officer to ground execution",
        };
      case "change_category":
        return {
          icon: Tag,
          gradient: "from-amber-500 to-orange-500",
          bgGradient:
            "from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950/30",
          borderColor: "border-amber-500",
          title: "Change Category & Department",
          description: "Reclassify issue category and derived department",
        };
      case "approve":
        return {
          icon: CheckCircle,
          gradient: "from-green-500 to-emerald-500",
          bgGradient:
            "from-green-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950/30",
          borderColor: "border-green-500",
          title: "Approve Escalation Resolution",
          description:
            "Resolves administrative escalation while keeping civic issue open",
        };
      case "reject_response":
        return {
          icon: XCircle,
          gradient: "from-red-500 to-rose-500",
          bgGradient:
            "from-red-50 to-rose-50 dark:from-slate-900 dark:to-rose-950/30",
          borderColor: "border-red-500",
          title: "Reject Escalation Response",
          description:
            "Mark response as insufficient and require further corrective action",
        };
      default:
        return {
          icon: Shield,
          gradient: "from-blue-500 to-cyan-500",
          bgGradient: "from-blue-50 to-cyan-50",
          borderColor: "border-blue-500",
          title: "Resolution Action",
          description: "Perform administrative resolution",
        };
    }
  };

  const config = getActionConfig();
  const ActionIcon = config.icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border-2 border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 flex flex-col text-xs font-semibold">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 overflow-hidden flex-shrink-0 border-b border-slate-800">
          <div className="relative flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/20">
                <AlertTriangle
                  size={28}
                  className="text-yellow-400 animate-pulse"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black tracking-tight">
                    System Admin Escalation Control
                  </h2>
                  <Sparkles
                    size={20}
                    className="text-yellow-300 animate-pulse"
                  />
                </div>
                <p className="text-slate-300 text-xs font-medium flex items-center gap-2">
                  <code className="bg-white/10 px-2.5 py-0.5 rounded-lg font-mono text-xs backdrop-blur-sm text-cyan-300">
                    {issue.ticket_id || issue.code}
                  </code>
                  <span>•</span>
                  <span>{issue.title}</span>
                  <span>•</span>
                  <span className="capitalize">
                    {issue.city}, {issue.state}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all border border-white/20 text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {/* Error Banner */}
          {modalError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-2xl font-bold flex items-center gap-3">
              <AlertTriangle className="flex-shrink-0" size={18} />
              <p>{modalError}</p>
            </div>
          )}

          {/* Cross-City Confirmation Card */}
          {crossCityPrompt && (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm">
                <Building2 size={18} />
                <span>Cross-City Officer Reassignment Warning</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-normal">
                The selected officer belongs to{" "}
                <strong>{crossCityPrompt.officerCity}</strong>, while this issue
                belongs to <strong>{crossCityPrompt.issueCity}</strong>. This
                cross-city assignment will shift workload ownership across
                municipal boundaries.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCrossCityPrompt(null)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCrossCityPrompt(null);
                    handleExecuteResolution({ confirmCrossCity: true });
                  }}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                >
                  Confirm Cross-City Reassignment
                </button>
              </div>
            </div>
          )}

          {/* Department Mismatch Confirmation Card */}
          {deptMismatchPrompt && (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm">
                <AlertTriangle size={18} />
                <span>Department Compatibility Warning</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-normal">
                Issue Department:{" "}
                <strong>{deptMismatchPrompt.issueDept}</strong>. Selected
                Officer Department:{" "}
                <strong>{deptMismatchPrompt.officerDept}</strong>. This officer
                may not be operationally suitable for this issue category.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeptMismatchPrompt(null)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeptMismatchPrompt(null);
                    handleExecuteResolution({
                      confirmDepartmentMismatch: true,
                    });
                  }}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                >
                  Confirm Department Mismatch & Reassign
                </button>
              </div>
            </div>
          )}

          {/* Issue Context Card */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Issue Context Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Category
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {issue.category}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Department
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {issue.department || issue.category}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Status
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {issue.status}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  SLA Target
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {issue.sla_deadline
                    ? new Date(issue.sla_deadline).toLocaleString()
                    : "No deadline"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Selector Grid */}
          <div>
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">
              Choose Resolution Action
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {[
                { id: "extend_sla", label: "Extend SLA", icon: Clock },
                {
                  id: "reassign_unit_officer",
                  label: "Unit Officer",
                  icon: Shield,
                },
                {
                  id: "reassign_field_officer",
                  label: "Field Officer",
                  icon: Users,
                },
                { id: "change_category", label: "Category", icon: Tag },
                {
                  id: "approve",
                  label: "Approve Resolution",
                  icon: CheckCircle,
                },
                {
                  id: "reject_response",
                  label: "Reject Response",
                  icon: XCircle,
                },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const active = actionType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActionType(tab.id)}
                    className={`p-3 rounded-2xl text-center font-extrabold transition-all border cursor-pointer flex flex-col items-center gap-1.5 ${
                      active
                        ? "bg-cyan-500 text-white border-cyan-600 shadow-md shadow-cyan-500/20"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <TabIcon size={18} />
                    <span className="text-[11px] leading-tight">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Action Form */}
          <div
            className={`bg-slate-50 dark:bg-slate-950/80 border-2 ${config.borderColor} rounded-2xl p-5 space-y-4`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-white shadow-md`}
              >
                <ActionIcon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {config.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {config.description}
                </p>
              </div>
            </div>

            {/* Extend SLA */}
            {actionType === "extend_sla" && (
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Proposed New SLA Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={newSlaDeadline}
                  onChange={(e) => setNewSlaDeadline(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-100"
                />
              </div>
            )}

            {/* Reassign Officer Candidate Cards UI */}
            {(isUnitReassignment || isFieldReassignment) && (
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Select {isUnitReassignment ? "Unit Officer" : "Field Officer"}{" "}
                  Candidate *
                </label>

                {isCandidatesLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-cyan-500 font-bold">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading candidate officers...</span>
                  </div>
                ) : candidates.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    No matching officers found across platform.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {candidates.map((cand) => {
                      const selectedId = isUnitReassignment
                        ? selectedUnitOfficerProfileId
                        : selectedFieldOfficerProfileId;
                      const isSelected = selectedId === cand.profileId;
                      const isCapacityFull = cand.availableCapacity <= 0;

                      return (
                        <div
                          key={cand.profileId}
                          onClick={() => {
                            if (!isCapacityFull) {
                              if (isUnitReassignment)
                                setSelectedUnitOfficerProfileId(cand.profileId);
                              else
                                setSelectedFieldOfficerProfileId(
                                  cand.profileId,
                                );
                            }
                          }}
                          className={`p-3.5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-500/20 shadow-md"
                              : isCapacityFull
                                ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="candidate_officer"
                                    checked={isSelected}
                                    onChange={() => {
                                      if (isUnitReassignment)
                                        setSelectedUnitOfficerProfileId(
                                          cand.profileId,
                                        );
                                      else
                                        setSelectedFieldOfficerProfileId(
                                          cand.profileId,
                                        );
                                    }}
                                    disabled={isCapacityFull}
                                    className="accent-cyan-500 cursor-pointer"
                                  />
                                  <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                                    {cand.name || cand.fullName}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                  {isUnitReassignment
                                    ? "Unit Officer"
                                    : "Field Officer"}
                                </span>
                              </div>
                              {cand.isRecommended && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300">
                                  Recommended
                                </span>
                              )}
                            </div>

                            {/* Location & Dept Badges */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold ${
                                  cand.isSameCity
                                    ? "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300"
                                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                                }`}
                              >
                                {cand.city}, {cand.state} (
                                {cand.isSameCity ? "Same City" : "Cross-City"})
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[9.5px] font-extrabold ${
                                  cand.isSameDepartment
                                    ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                                    : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                                }`}
                              >
                                {cand.department} (
                                {cand.isSameDepartment
                                  ? "Dept Match"
                                  : "Dept Mismatch"}
                                )
                              </span>
                            </div>
                          </div>

                          {/* Workload Progress */}
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>
                                Workload: {cand.currentWorkload}/
                                {cand.maximumCapacity}
                              </span>
                              <span>
                                Avail: {cand.availableCapacity} | Score:{" "}
                                {cand.performanceScore}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  cand.currentWorkload >= cand.maximumCapacity
                                    ? "bg-red-500"
                                    : cand.currentWorkload /
                                          cand.maximumCapacity >=
                                        0.7
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, (cand.currentWorkload / cand.maximumCapacity) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Change Category */}
            {actionType === "change_category" && (
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Proposed New Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 capitalize cursor-pointer"
                >
                  <option value="road">Road</option>
                  <option value="electricity">Electricity / Lighting</option>
                  <option value="waste">Waste Management</option>
                  <option value="water">Water Supply</option>
                  <option value="drainage">Drainage</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="public_health">Public Health</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Reject Escalation Response */}
            {actionType === "reject_response" && (
              <div className="space-y-3">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 font-semibold">
                  <Info size={14} className="inline mr-1 -mt-0.5" />
                  This action does not reject or close the civic issue. The
                  issue will keep its current operational status, and the
                  escalation will remain open for further corrective action.
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Reason for Rejecting the Escalation Response *
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why the submitted corrective action or escalation response is insufficient and what further action is required."
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Approve Escalation Resolution */}
            {actionType === "approve" && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                Approving this escalation resolves the administrative review.
                The civic issue maintains its operational resolution workflow.
              </div>
            )}

            {/* Resolution Notes */}
            {actionType !== "reject_response" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Resolution Notes *
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Provide detailed administrative notes regarding your resolution decision for audit records..."
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                />
              </div>
            )}
          </div>

          {/* Escalation / Activity Timeline */}
          {normalisedTimeline.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Escalation / Activity Timeline
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Shared administrative action history log
                  </p>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {normalisedTimeline.length}{" "}
                  {normalisedTimeline.length === 1 ? "Event" : "Events"}
                </span>
              </div>

              <div className="relative space-y-0 pl-1">
                {normalisedTimeline.map((event, index) => {
                  const isLast = index === normalisedTimeline.length - 1;
                  return (
                    <div key={event.id} className="relative flex gap-4 pb-5">
                      {!isLast && (
                        <div className="absolute bottom-0 left-[17px] top-9 w-px bg-slate-200 dark:bg-slate-700" />
                      )}

                      <div className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-400 shadow-sm">
                        <Activity className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/80">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <p className="text-xs font-black text-slate-900 dark:text-white">
                            {formatTimelineAction(event.type)}
                          </p>
                          <time className="text-[10px] font-bold text-slate-400">
                            {formatDateTime(event.performedAt)}
                          </time>
                        </div>

                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Performed by {event.performedBy}{" "}
                          <span className="text-[10px] text-slate-400 font-normal">
                            · {formatPerformerRole(event.performedByRole)}
                          </span>
                        </p>

                        {event.notes && (
                          <p className="mt-2 whitespace-pre-wrap break-words text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                            {event.notes}
                          </p>
                        )}

                        {(event.oldValue || event.newValue) && (
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {event.oldValue && (
                              <div className="rounded-lg bg-rose-50 p-2.5 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                                <p className="text-[9px] font-black uppercase text-rose-500">
                                  Previous Value
                                </p>
                                <p className="mt-0.5 break-words text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {formatHistoryValue(event.oldValue)}
                                </p>
                              </div>
                            )}
                            {event.newValue && (
                              <div className="rounded-lg bg-emerald-50 p-2.5 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                                <p className="text-[9px] font-black uppercase text-emerald-500">
                                  Updated Value
                                </p>
                                <p className="mt-0.5 break-words text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {formatHistoryValue(event.newValue)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 p-4 border-t border-slate-800 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleExecuteResolution()}
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl font-black text-white text-xs shadow-lg transition-all cursor-pointer ${
              loading
                ? "bg-slate-600 cursor-not-allowed"
                : actionType === "reject_response"
                  ? "bg-red-600 hover:bg-red-700 shadow-red-600/30"
                  : "bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/30"
            }`}
          >
            {loading
              ? "Processing..."
              : actionType === "reject_response"
                ? "Reject Escalation Response"
                : "Approve Escalation Resolution"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminEscalationResolutionModal;
