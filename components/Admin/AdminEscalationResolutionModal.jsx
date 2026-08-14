"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Sparkles,
  Zap,
  Shield,
  FileText,
  Tag,
  MapPin,
  Loader2,
  Building2,
  Activity,
  Plus,
  Search,
  Filter,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
  Star,
  Layers,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ISSUE_CATEGORIES,
  ISSUE_SUBCATEGORIES,
} from "@/lib/issueClassificationConfig";

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
  reject_escalation: "Escalation Response Rejected",
  approve_escalation: "Escalation Approved & Resolved",
  resolve_escalation: "Escalation Resolved",
  dismiss_escalation: "Escalation Dismissed",
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

export function AdminEscalationResolutionModal({
  issue,
  adminUserId,
  initialAction = null,
  onClose,
  onResolved,
}) {
  const [loading, setLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const issueId = issue?.id || issue?._id;

  // Existing SLA state validation
  const existingSlaDeadline =
    issue?.sla?.deadline ?? issue?.sla_deadline ?? issue?.slaDeadline ?? null;
  const existingSlaTimestamp = existingSlaDeadline
    ? typeof existingSlaDeadline === "number"
      ? existingSlaDeadline
      : new Date(existingSlaDeadline).getTime()
    : null;
  const hasExistingSlaDeadline =
    existingSlaTimestamp !== null && Number.isFinite(existingSlaTimestamp);

  // Review status
  const reviewStatus = String(
    issue?.escalation?.adminReviewStatus ??
      issue?.escalation?.status ??
      issue?.escalation_admin_review_status ??
      "",
  )
    .trim()
    .toLowerCase();

  // Active escalation state
  const isEscalationActive =
    issue?.escalation?.isActive === true ||
    issue?.escalatedToAdmin === true ||
    issue?.is_escalated === true;

  const isEscalationReviewed = reviewStatus === "reviewed";
  const isEscalationPendingReview =
    isEscalationActive && reviewStatus === "pending";

  // Action options definition
  const actionOptions = useMemo(() => {
    return [
      {
        id: "extend_sla",
        label: "Extend SLA",
        category: "corrective",
        icon: Clock,
        disabled: !hasExistingSlaDeadline || isEscalationPendingReview,
        disabledReason: isEscalationPendingReview
          ? "Review and start handling this escalation before extending SLA."
          : "No SLA deadline has been assigned to this issue. An SLA must exist before System Admin can extend it.",
      },
      {
        id: "reassign_unit_officer",
        label: "Reassign Unit Officer",
        category: "corrective",
        icon: Shield,
        disabled: isEscalationPendingReview,
        disabledReason:
          "Review and start handling this escalation before reassigning officers.",
      },
      {
        id: "reassign_field_officer",
        label: "Reassign Field Officer",
        category: "corrective",
        icon: Zap,
        disabled: isEscalationPendingReview,
        disabledReason:
          "Review and start handling this escalation before reassigning officers.",
      },
      {
        id: "change_classification",
        label: "Change Classification",
        category: "corrective",
        icon: Tag,
        disabled: isEscalationPendingReview,
        disabledReason:
          "Review and start handling this escalation before changing classification.",
      },
      {
        id: "update_priority",
        label: "Update Priority",
        category: "corrective",
        icon: Flame,
        disabled: isEscalationPendingReview,
        disabledReason:
          "Review and start handling this escalation before updating priority.",
      },
      {
        id: "approve",
        label: "Approve Escalation",
        category: "decision",
        icon: CheckCircle,
        disabled: !isEscalationActive || isEscalationPendingReview,
        disabledReason: isEscalationPendingReview
          ? "Review and start handling this escalation before approving."
          : "This issue does not currently have an active escalation.",
      },
      {
        id: "reject",
        label: "Reject Escalation",
        category: "decision",
        icon: XCircle,
        disabled: !isEscalationActive || isEscalationPendingReview,
        disabledReason: isEscalationPendingReview
          ? "Review and start handling this escalation before rejecting."
          : "This issue does not currently have an active escalation.",
      },
    ];
  }, [hasExistingSlaDeadline, isEscalationActive, isEscalationPendingReview]);

  // Pick first enabled action or initialAction
  const getDefaultAction = () => {
    if (
      initialAction &&
      actionOptions.some(
        (action) => action.id === initialAction && !action.disabled,
      )
    ) {
      return initialAction;
    }
    const firstEnabled = actionOptions.find((action) => !action.disabled);
    return firstEnabled?.id ?? "reassign_unit_officer";
  };
  const [actionType, setActionType] = useState(getDefaultAction);

  useEffect(() => {
    if (
      initialAction &&
      actionOptions.some(
        (action) => action.id === initialAction && !action.disabled,
      )
    ) {
      setActionType(initialAction);
      return;
    }

    const firstEnabled = actionOptions.find((action) => !action.disabled);
    setActionType(firstEnabled?.id ?? "reassign_unit_officer");
  }, [issueId, initialAction, actionOptions]);

  // Incompatible officer confirmation state
  const [incompatibleOfficerPrompt, setIncompatibleOfficerPrompt] =
    useState(null);

  // Dynamic form state
  const [newSlaDeadline, setNewSlaDeadline] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [officerSearch, setOfficerSearch] = useState("");
  const [officerFilter, setOfficerFilter] = useState("all");

  // Classification state
  const [selectedCategory, setSelectedCategory] = useState(
    issue?.category || "road",
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState(
    Array.isArray(issue?.subcategory)
      ? issue.subcategory
      : issue?.subcategory
        ? [issue.subcategory]
        : [],
  );
  const [customSubcategoryInput, setCustomSubcategoryInput] = useState("");

  // Priority state
  const [selectedPriority, setSelectedPriority] = useState(
    issue?.priority || issue?.severity || "medium",
  );

  // Common notes / reason
  const [resolutionNotes, setResolutionNotes] = useState("");

  // Candidate query for Unit / Field Officer
  const isUnitReassignment = actionType === "reassign_unit_officer";
  const isFieldReassignment = actionType === "reassign_field_officer";
  const isReassignmentActive = isUnitReassignment || isFieldReassignment;

  const candidateQuery = useQuery(
    api.admin.getAssignableOfficers,
    issueId && isReassignmentActive
      ? {
          issueId,
          officerType: isUnitReassignment ? "unit_officer" : "field_officer",
        }
      : "skip",
  );

  const rawCandidates = candidateQuery?.candidates ?? [];
  const currentAssignedOfficer = candidateQuery?.currentOfficer ?? null;
  const isCandidatesLoading =
    isReassignmentActive && candidateQuery === undefined;

  // Filter candidates client-side
  const filteredCandidates = useMemo(() => {
    let list = [...rawCandidates];

    if (officerSearch.trim()) {
      const q = officerSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q),
      );
    }

    if (officerFilter === "recommended") {
      list = list.filter((c) => c.isRecommended);
    } else if (officerFilter === "available") {
      list = list.filter((c) => !c.isAtCapacity);
    }

    return list;
  }, [rawCandidates, officerSearch, officerFilter]);

  // Reset form states on action change or issue change
  useEffect(() => {
    setSelectedCandidate(null);
    setIncompatibleOfficerPrompt(null);
    setModalError("");
    setModalSuccess("");
    setOfficerSearch("");
    setOfficerFilter("all");
  }, [actionType, issueId]);

  // Mutations
  const reviewEscalationMut = useMutation(api.escalation.reviewEscalation);
  const extendSla = useMutation(api.escalation.extendIssueSla);
  const reassignOfficer = useMutation(api.escalation.reassignIssueOfficer);
  const changeClassification = useMutation(
    api.escalation.changeIssueClassification,
  );
  const updatePriority = useMutation(api.escalation.updateIssuePriority);
  const approveEscalation = useMutation(api.escalation.approveEscalation);
  const rejectEscalation = useMutation(api.escalation.rejectEscalation);

  const [reviewLoading, setReviewLoading] = useState(false);

  const handleStartHandlingEscalation = async () => {
    if (!issueId || !adminUserId) {
      setModalError("Authenticated System Admin user ID is missing.");
      return;
    }
    setReviewLoading(true);
    setModalError("");
    setModalSuccess("");
    try {
      await reviewEscalationMut({
        issueId,
        adminUserId,
      });
      setModalSuccess("Escalation acknowledged by System Admin.");
    } catch (err) {
      setModalError(err.message || "Failed to start handling escalation.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Subcategory management handlers
  const handleToggleSubcategory = (subName) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subName)
        ? prev.filter((s) => s !== subName)
        : [...prev, subName],
    );
  };

  const handleAddCustomSubcategory = () => {
    const trimmed = customSubcategoryInput.trim();
    if (!trimmed) return;
    if (
      !selectedSubcategories.some(
        (s) => s.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setSelectedSubcategories((prev) => [...prev, trimmed]);
    }
    setCustomSubcategoryInput("");
  };

  // Submit Handler
  const handleSubmitAction = async () => {
    setModalError("");
    setModalSuccess("");

    if (!adminUserId) {
      setModalError("Authenticated System Admin user ID is missing.");
      return;
    }

    if (resolutionNotes.trim().length < 5) {
      setModalError(
        "Please provide a meaningful reason/note (at least 5 characters).",
      );
      return;
    }

    setLoading(true);
    try {
      if (actionType === "extend_sla") {
        if (!newSlaDeadline) {
          throw new Error("Please select a valid new SLA deadline.");
        }
        const newDeadlineTime = new Date(newSlaDeadline).getTime();
        if (Number.isNaN(newDeadlineTime)) {
          throw new Error("Invalid SLA deadline date selection.");
        }
        if (hasExistingSlaDeadline && newDeadlineTime <= existingSlaTimestamp) {
          throw new Error(
            "The new SLA deadline must be later than the current deadline.",
          );
        }

        await extendSla({
          issueId,
          newDeadline: newDeadlineTime,
          notes: resolutionNotes.trim(),
          adminUserId,
        });
        setModalSuccess("SLA deadline extended successfully.");
      } else if (actionType === "reassign_unit_officer") {
        if (!selectedCandidate) {
          throw new Error(
            "Please select a candidate Unit Officer for reassignment.",
          );
        }

        await reassignOfficer({
          issueId,
          officerType: "unit_officer",
          newUnitOfficerProfileId: selectedCandidate.profileId,
          notes: resolutionNotes.trim(),
          adminUserId,
        });

        setModalSuccess("Unit Officer reassigned successfully.");
      } else if (actionType === "reassign_field_officer") {
        if (!selectedCandidate) {
          throw new Error(
            "Please select a candidate Field Officer for reassignment.",
          );
        }

        await reassignOfficer({
          issueId,
          officerType: "field_officer",
          newFieldOfficerProfileId: selectedCandidate.profileId,
          notes: resolutionNotes.trim(),
          adminUserId,
        });

        setModalSuccess("Field Officer reassigned successfully.");
      } else if (actionType === "change_classification") {
        const res = await changeClassification({
          issueId,
          newCategory: selectedCategory,
          category: selectedCategory,
          newSubcategories: selectedSubcategories,
          subcategory: selectedSubcategories,
          department: selectedCategory,
          notes: resolutionNotes.trim(),
          reason: resolutionNotes.trim(),
          adminUserId,
        });

        if (res?.code === "INCOMPATIBLE_OFFICERS_CONFIRMATION_REQUIRED") {
          setIncompatibleOfficerPrompt(res);
          setLoading(false);
          return;
        }

        const clearedCount = res?.clearedOfficers?.length ?? 0;
        if (clearedCount > 0) {
          setModalSuccess(
            `Classification updated successfully. ${clearedCount} incompatible officer assignment${clearedCount > 1 ? "s were" : " was"} cleared.`,
          );
        } else {
          setModalSuccess(
            "Classification updated successfully. All existing officer assignments remain compatible.",
          );
        }
      } else if (actionType === "update_priority") {
        await updatePriority({
          issueId,
          priority: selectedPriority,
          notes: resolutionNotes.trim(),
          adminUserId,
        });
        setModalSuccess("Issue priority updated successfully.");
      } else if (actionType === "approve") {
        await approveEscalation({
          issueId,
          notes: resolutionNotes.trim(),
          adminUserId,
        });
        setModalSuccess("Escalation approved and resolved.");
      } else if (actionType === "reject") {
        await rejectEscalation({
          issueId,
          reason: resolutionNotes.trim(),
          adminUserId,
        });
        setModalSuccess("Escalation response rejected.");
      }

      if (onResolved) onResolved();

      const isFinalDecision =
        actionType === "approve" || actionType === "reject";
      if (isFinalDecision) {
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setResolutionNotes("");
        setSelectedCandidate(null);
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("ESCALATION_REVIEW_REQUIRED")) {
        setModalError(
          "Review Required: This escalation has not been acknowledged yet. Start handling the escalation before taking corrective action.",
        );
      } else {
        setModalError(msg || "Action failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClearIncompatibleOfficers = async () => {
    if (!incompatibleOfficerPrompt) return;
    setModalError("");
    setModalSuccess("");
    setLoading(true);

    try {
      const res = await changeClassification({
        issueId,
        newCategory: selectedCategory,
        category: selectedCategory,
        newSubcategories: selectedSubcategories,
        subcategory: selectedSubcategories,
        department: selectedCategory,
        notes: resolutionNotes.trim(),
        reason: resolutionNotes.trim(),
        adminUserId,
        confirmClearIncompatibleOfficers: true,
      });

      setIncompatibleOfficerPrompt(null);
      const clearedCount = res?.clearedOfficers?.length ?? 0;
      if (clearedCount > 0) {
        setModalSuccess(
          `Classification updated successfully. ${clearedCount} incompatible officer assignment${clearedCount > 1 ? "s were" : " was"} cleared.`,
        );
      } else {
        setModalSuccess(
          "Classification updated successfully. All existing officer assignments remain compatible.",
        );
      }

      if (onResolved) onResolved();
      setResolutionNotes("");
      setSelectedCandidate(null);
    } catch (err) {
      setModalError(err.message || "Failed to update classification.");
    } finally {
      setLoading(false);
    }
  };

  // Timeline preparation
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

  const configuredSubcategoriesForCat =
    ISSUE_SUBCATEGORIES[selectedCategory] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-6xl max-h-[94vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                  {issue.ticket_id || issue.code || issue.issueCode}
                </code>
                {isEscalationActive ? (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isEscalationPendingReview
                        ? "bg-amber-500 text-white animate-pulse"
                        : isEscalationReviewed
                          ? "bg-blue-600 text-white"
                          : "bg-rose-500 text-white"
                    }`}
                  >
                    <Shield size={11} />
                    {isEscalationPendingReview
                      ? "Pending Review"
                      : isEscalationReviewed
                        ? "Reviewed"
                        : "Active Escalation"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Standard Administrative View
                  </span>
                )}
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                {issue.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Review Required Banner */}
          {isEscalationPendingReview && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 rounded-3xl p-5 mb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Activity size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-900 dark:text-amber-100">
                    Escalation Review Required
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    This escalation must be acknowledged by System Admin before
                    taking corrective or final resolution actions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={reviewLoading}
                onClick={handleStartHandlingEscalation}
                className="px-4 py-2.5 rounded-2xl font-black text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-lg transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer disabled:opacity-50"
              >
                {reviewLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Acknowledging...</span>
                  </>
                ) : (
                  <>
                    <Shield size={14} />
                    <span>Start Handling Escalation</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Alerts / Error messages */}
          {modalError && (
            <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-xs font-bold animate-in fade-in">
              <AlertTriangle size={16} className="shrink-0 text-rose-500" />
              <span>{modalError}</span>
            </div>
          )}

          {modalSuccess && (
            <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in">
              <CheckCircle size={16} className="shrink-0 text-emerald-500" />
              <span>{modalSuccess}</span>
            </div>
          )}

          {/* Incompatible Officer Confirmation Card */}
          {incompatibleOfficerPrompt && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                />
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    Officer Compatibility Check
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                    The new classification changes this issue to{" "}
                    <strong className="font-extrabold text-amber-950 dark:text-amber-100">
                      {incompatibleOfficerPrompt.newDepartment ||
                        incompatibleOfficerPrompt.newCategory}
                    </strong>
                    . The following currently assigned officer(s) are no longer
                    compatible:
                  </p>
                  <div className="space-y-2 pt-1">
                    {incompatibleOfficerPrompt.incompatibleOfficers?.map(
                      (off, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs"
                        >
                          <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 block">
                            {off.type === "unit_officer"
                              ? "Unit Officer"
                              : "Field Officer"}
                          </span>
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {off.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Department: {off.department || "Unknown"} • City:{" "}
                            {off.city || "Unknown"}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200 pt-1">
                    Changing the classification will remove these officer(s)
                    from the issue.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                <button
                  type="button"
                  onClick={() => setIncompatibleOfficerPrompt(null)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearIncompatibleOfficers}
                  className="px-4 py-1.5 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all"
                >
                  Change Classification & Clear Officers
                </button>
              </div>
            </div>
          )}

          {/* 2-Column Grid for Form & Context */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3): Action Selection & Dynamic Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Action Tabs Header */}
              <div className="space-y-3">
                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Administrative Action Selection
                </p>

                <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                  {actionOptions.map((act) => {
                    const Icon = act.icon;
                    const isSelected = actionType === act.id;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => !act.disabled && setActionType(act.id)}
                        disabled={act.disabled}
                        title={act.disabledReason || ""}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-xl transition-all ${
                          isSelected
                            ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-md border border-purple-200 dark:border-purple-800"
                            : act.disabled
                              ? "opacity-40 cursor-not-allowed text-slate-400"
                              : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        <Icon size={14} />
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Form Container */}
              <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5">
                {/* 1. EXTEND SLA FORM */}
                {actionType === "extend_sla" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="text-amber-500" size={18} />
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Extend Target SLA Deadline
                      </h3>
                    </div>

                    {!hasExistingSlaDeadline ? (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-300 text-xs font-medium">
                        No SLA deadline has been assigned to this issue. An SLA
                        must exist before System Admin can extend it.
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            New SLA Target Date & Time *
                          </label>
                          <input
                            type="datetime-local"
                            value={newSlaDeadline}
                            onChange={(e) => setNewSlaDeadline(e.target.value)}
                            min={
                              existingSlaTimestamp
                                ? new Date(existingSlaTimestamp + 60000)
                                    .toISOString()
                                    .slice(0, 16)
                                : undefined
                            }
                            className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 2. REASSIGN OFFICERS FORM (UO & FO) */}
                {isReassignmentActive && (
                  <div className="space-y-4">
                    {/* Current Assignment Card */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                        Current{" "}
                        {isUnitReassignment ? "Unit Officer" : "Field Officer"}
                      </p>
                      {currentAssignedOfficer ? (
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">
                              {currentAssignedOfficer.name ||
                                currentAssignedOfficer.fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {currentAssignedOfficer.department} •{" "}
                              {currentAssignedOfficer.city}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400">
                              Workload
                            </span>
                            <p className="font-black text-slate-800 dark:text-slate-200">
                              {currentAssignedOfficer.currentWorkload ?? 0}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          No{" "}
                          {isUnitReassignment
                            ? "Unit Officer"
                            : "Field Officer"}{" "}
                          currently assigned
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isUnitReassignment ? (
                          <Shield className="text-cyan-500" size={18} />
                        ) : (
                          <Zap className="text-emerald-500" size={18} />
                        )}
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Eligible Replacement Officers (
                          {isUnitReassignment
                            ? "Unit Officers"
                            : "Field Officers"}
                          )
                        </h3>
                      </div>
                    </div>

                    {/* Search & Quick Filters */}
                    <div className="space-y-2.5">
                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          value={officerSearch}
                          onChange={(e) => setOfficerSearch(e.target.value)}
                          placeholder="Search eligible officers by name or email..."
                          className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "all", label: "All Candidates" },
                          { id: "recommended", label: "Recommended" },
                          { id: "available", label: "Available Capacity" },
                        ].map((flt) => (
                          <button
                            key={flt.id}
                            type="button"
                            onClick={() => setOfficerFilter(flt.id)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                              officerFilter === flt.id
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {flt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Candidate Selectable Cards */}
                    {isCandidatesLoading ? (
                      <div className="py-8 text-center space-y-2">
                        <Loader2
                          size={24}
                          className="animate-spin text-purple-600 mx-auto"
                        />
                        <p className="text-xs text-slate-500 font-medium">
                          Loading eligible officer candidates...
                        </p>
                      </div>
                    ) : filteredCandidates.length === 0 ? (
                      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-xs font-bold text-slate-500">
                          No eligible{" "}
                          {isUnitReassignment
                            ? "Unit Officer"
                            : "Field Officer"}{" "}
                          candidates found.
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Only officers matching the issue's city and exact
                          department are eligible.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                        {filteredCandidates.map((candidate) => {
                          const isSelected =
                            selectedCandidate?.profileId ===
                            candidate.profileId;

                          return (
                            <button
                              key={candidate.profileId}
                              type="button"
                              onClick={() => setSelectedCandidate(candidate)}
                              className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all ${
                                isSelected
                                  ? "bg-purple-50/80 dark:bg-purple-950/40 border-purple-600 ring-2 ring-purple-500/20"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <p className="font-black text-xs text-slate-900 dark:text-white">
                                      {candidate.name}
                                    </p>

                                    {candidate.isRecommended && (
                                      <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                        Recommended
                                      </span>
                                    )}

                                    {candidate.isAtCapacity && (
                                      <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                        At Capacity
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                    {candidate.department} • {candidate.city},{" "}
                                    {candidate.state}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[10px] font-bold text-slate-400">
                                    Workload
                                  </span>
                                  <p className="text-xs font-black text-slate-900 dark:text-white">
                                    {candidate.currentWorkload}
                                    {candidate.maximumCapacity !== null
                                      ? ` / ${candidate.maximumCapacity}`
                                      : " active"}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-[10px]">
                                <div>
                                  <span className="text-slate-400">
                                    Rating:
                                  </span>{" "}
                                  <span className="font-bold text-amber-500">
                                    ★ {candidate.rating || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400">
                                    Efficiency:
                                  </span>{" "}
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {candidate.efficiencyScore}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400">
                                    Available:
                                  </span>{" "}
                                  <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {candidate.availableCapacity !== null
                                      ? candidate.availableCapacity
                                      : "Unlimited"}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Selection Summary */}
                    {selectedCandidate && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl text-xs space-y-1">
                        <p className="font-bold text-purple-900 dark:text-purple-200">
                          Selected Candidate: {selectedCandidate.name} (
                          {selectedCandidate.department})
                        </p>
                        <p className="text-[11px] text-purple-700 dark:text-purple-300">
                          Location: {selectedCandidate.city},{" "}
                          {selectedCandidate.state} • Workload:{" "}
                          {selectedCandidate.currentWorkload} active issues
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. CHANGE CLASSIFICATION FORM */}
                {actionType === "change_classification" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Tag className="text-purple-500" size={18} />
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Update Issue Classification
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Category & Department *
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setSelectedSubcategories([]);
                        }}
                        className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      >
                        {ISSUE_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategories */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                        Subcategories
                      </label>

                      {configuredSubcategoriesForCat.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {configuredSubcategoriesForCat.map((subName) => {
                            const isChecked =
                              selectedSubcategories.includes(subName);
                            return (
                              <button
                                key={subName}
                                type="button"
                                onClick={() => handleToggleSubcategory(subName)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all border ${
                                  isChecked
                                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300"
                                }`}
                              >
                                {subName}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Custom subcategory input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customSubcategoryInput}
                          onChange={(e) =>
                            setCustomSubcategoryInput(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCustomSubcategory();
                            }
                          }}
                          placeholder="Type custom subcategory & press Enter..."
                          className="flex-1 px-3 py-2 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomSubcategory}
                          className="px-3 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 flex items-center gap-1"
                        >
                          <Plus size={14} /> Add
                        </button>
                      </div>

                      {/* Selected subcategory chips */}
                      {selectedSubcategories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedSubcategories.map((sub) => (
                            <span
                              key={sub}
                              className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200 text-xs font-bold px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800"
                            >
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleSubcategory(sub)}
                                className="text-purple-500 hover:text-purple-700"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. UPDATE PRIORITY FORM */}
                {actionType === "update_priority" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Flame className="text-rose-500" size={18} />
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Update Issue Priority
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Select New Priority Level *
                      </label>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="critical">Critical Priority</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 5. APPROVE / REJECT DECISION CONFIRMATIONS */}
                {actionType === "approve" && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                    <p className="font-bold">
                      Approving this escalation will mark the administrative
                      escalation as resolved and return the issue to its
                      operational status.
                    </p>
                  </div>
                )}

                {actionType === "reject" && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-900 dark:text-rose-200 space-y-1">
                    <p className="font-bold">
                      Rejecting the escalation will close the administrative
                      escalation review as rejected and restore normal
                      operational status.
                    </p>
                  </div>
                )}

                {/* Notes / Reason Textarea for All Actions */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Administrative Reason / Action Notes *
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Provide detailed administrative notes/justification for this action..."
                    className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSubmitAction()}
                    disabled={loading || isEscalationPendingReview}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Processing Action...</span>
                      </>
                    ) : isEscalationPendingReview ? (
                      <span>Review Required Before Submitting</span>
                    ) : (
                      <span>Execute Action</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column (1/3): Sidebar Overview & Current Assignments */}
            <div className="space-y-6">
              {/* Current Assignment Card */}
              <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Users size={14} className="text-purple-500" />
                  Current Assignment
                </h3>

                {/* Unit Officer */}
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Unit Officer
                    </span>
                    {issue.assignedUnitOfficer && (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="font-black text-xs text-slate-900 dark:text-white">
                    {issue.assignedUnitOfficer?.name ||
                      issue.assignedUnitOfficer?.fullName ||
                      "No Unit Officer Assigned"}
                  </p>
                  {issue.assignedUnitOfficer && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {issue.assignedUnitOfficer.department} •{" "}
                      {issue.assignedUnitOfficer.city}
                    </p>
                  )}
                </div>

                {/* Field Officer */}
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Field Officer
                    </span>
                    {issue.assignedFieldOfficer && (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="font-black text-xs text-slate-900 dark:text-white">
                    {issue.assignedFieldOfficer?.name ||
                      issue.assignedFieldOfficer?.fullName ||
                      "No Field Officer Assigned"}
                  </p>
                  {issue.assignedFieldOfficer && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {issue.assignedFieldOfficer.department} •{" "}
                      {issue.assignedFieldOfficer.city}
                    </p>
                  )}
                </div>
              </div>

              {/* Escalation Context Summary */}
              {isEscalationActive && issue.escalation && (
                <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 rounded-3xl p-5 space-y-3">
                  <h3 className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wider flex items-center gap-2">
                    <Flame size={14} className="text-rose-500" />
                    Escalation Details
                  </h3>

                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">
                        Category:
                      </span>
                      <span className="font-black capitalize">
                        {issue.escalation.category}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">
                        Priority:
                      </span>
                      <span className="font-black capitalize text-rose-600 dark:text-rose-400">
                        {issue.escalation.priority}
                      </span>
                    </div>

                    {issue.escalation.reason && (
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">
                          Reason:
                        </span>
                        <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40 text-[11px]">
                          {issue.escalation.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Width Bottom: Shared Escalation / Activity Timeline */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-purple-600" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Shared Administrative Timeline
              </h3>
            </div>

            {normalisedTimeline.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-xs font-medium text-slate-500">
                No administrative history recorded for this issue.
              </div>
            ) : (
              <div className="space-y-3">
                {normalisedTimeline.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatTimelineAction(item.type)}
                      </span>
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                        Performed by {item.performedBy} ·{" "}
                        {formatPerformerRole(item.performedByRole)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {formatDateTime(item.performedAt)}
                    </div>

                    {(item.oldValue || item.newValue) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                        {item.oldValue && (
                          <div>
                            <span className="text-slate-400 block font-bold">
                              Previous:
                            </span>
                            {formatHistoryValue(item.oldValue)}
                          </div>
                        )}
                        {item.newValue && (
                          <div>
                            <span className="text-slate-400 block font-bold">
                              New:
                            </span>
                            {formatHistoryValue(item.newValue)}
                          </div>
                        )}
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 flex justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
