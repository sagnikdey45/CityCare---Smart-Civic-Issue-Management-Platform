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
  Sparkles,
  Shield,
  FileText,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CityAdminEscalationResolutionModal({
  issue,
  cityAdminUserId,
  onClose,
  onResolved,
}) {
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const currentActions =
    issue.escalation_resolution_actions?.filter(
      (a) => a.performed_at >= (issue.escalated_at || 0),
    ) || [];
  const resolutionActions = currentActions.filter(
    (a) => a.type !== "escalate" && a.type !== "review_escalation",
  );
  const hasResolutionAction = resolutionActions.length > 0;

  const isSlaBreached =
    issue.sla_status === "breached" ||
    (issue.sla_deadline && new Date(issue.sla_deadline).getTime() < Date.now());

  const isSlaAtRisk = issue.sla_status === "at_risk";
  const escalationResolved = !!issue.escalation_resolved;

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
  }, [issue.id, issue._id, shouldAllowFreshSlaActions, hasResolutionAction]);

  const [newSlaDeadline, setNewSlaDeadline] = useState("");
  const [selectedWardOfficer, setSelectedWardOfficer] = useState("");
  const [selectedFieldOfficer, setSelectedFieldOfficer] = useState("");
  const [newCategory, setNewCategory] = useState(issue.category);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [officerMismatchWarning, setOfficerMismatchWarning] = useState(false);

  // Scoped assignable officers query
  const assignable = useQuery(api.slaMonitoring.getScopedAssignableOfficers, {
    cityAdminUserId,
    issueId: issue.id || issue._id,
  });

  const wardOfficers = assignable?.unitOfficers || [];
  const fieldOfficers = assignable?.fieldOfficers || [];

  // Scoped mutations
  const extendSla = useMutation(api.slaMonitoring.extendIssueSla);
  const reassignOfficer = useMutation(api.slaMonitoring.reassignIssueOfficer);
  const changeCategory = useMutation(api.slaMonitoring.changeIssueCategory);
  const approveEscalation = useMutation(api.slaMonitoring.approveEscalation);
  const rejectEscalation = useMutation(api.slaMonitoring.rejectEscalation);
  const dismissEscalation = useMutation(api.slaMonitoring.dismissEscalation);
  const reviewEscalation = useMutation(api.slaMonitoring.reviewEscalation);

  useEffect(() => {
    if (assignable && issue) {
      const currentUoProfile = wardOfficers.find(
        (o) =>
          String(o.userId) ===
          String(issue.assigned_officer?.userId || issue.assignedUnitOfficer),
      );
      const currentFoProfile = fieldOfficers.find(
        (o) =>
          String(o.userId) ===
          String(issue.field_officer?.userId || issue.assignedFieldOfficer),
      );

      if (currentUoProfile) setSelectedWardOfficer(currentUoProfile.profileId);
      if (currentFoProfile) setSelectedFieldOfficer(currentFoProfile.profileId);
    }
  }, [assignable, issue]);

  useEffect(() => {
    if (issue.sla_deadline) {
      const deadline = new Date(issue.sla_deadline);
      const formatted = deadline.toISOString().slice(0, 16);
      setNewSlaDeadline(formatted);
    }
  }, [issue]);

  const handleUoChange = (newVal) => {
    setSelectedWardOfficer(newVal);
    if (newVal) {
      const selectedUo = wardOfficers.find(
        (o) => String(o.profileId) === String(newVal),
      );
      const currentFo = fieldOfficers.find(
        (o) => String(o.profileId) === String(selectedFieldOfficer),
      );

      if (
        selectedUo &&
        currentFo &&
        selectedUo.department !== currentFo.department
      ) {
        setOfficerMismatchWarning(true);
      } else {
        setOfficerMismatchWarning(false);
      }
    } else {
      setOfficerMismatchWarning(false);
    }
  };

  const handleFoChange = (newVal) => {
    setSelectedFieldOfficer(newVal);
    if (newVal) {
      const selectedFo = fieldOfficers.find(
        (o) => String(o.profileId) === String(newVal),
      );
      const currentUo = wardOfficers.find(
        (o) => String(o.profileId) === String(selectedWardOfficer),
      );

      if (
        selectedFo &&
        currentUo &&
        selectedFo.department !== currentUo.department
      ) {
        setOfficerMismatchWarning(true);
      } else {
        setOfficerMismatchWarning(false);
      }
    } else {
      setOfficerMismatchWarning(false);
    }
  };

  const handleAcknowledgeEscalation = async () => {
    setLoading(true);
    setErrorBanner("");
    try {
      await reviewEscalation({
        cityAdminUserId,
        issueId: issue.id || issue._id,
      });
      setSuccessToast("Escalation successfully marked as reviewed.");
      onResolved();
    } catch (e) {
      console.error(e);
      setErrorBanner("Acknowledgement failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveEscalation = async () => {
    setErrorBanner("");
    if (!resolutionNotes.trim()) {
      setErrorBanner("Resolution notes are required.");
      return;
    }

    setLoading(true);
    try {
      if (actionType === "extend_sla") {
        if (!newSlaDeadline) {
          setErrorBanner("Please select a new SLA deadline");
          setLoading(false);
          return;
        }
        await extendSla({
          cityAdminUserId,
          issueId: issue.id || issue._id,
          newDeadline: new Date(newSlaDeadline).getTime(),
          notes: resolutionNotes,
        });
      } else if (actionType === "reassign_ward") {
        if (!selectedWardOfficer) {
          setErrorBanner("Please select a Unit Officer");
          setLoading(false);
          return;
        }
        await reassignOfficer({
          cityAdminUserId,
          issueId: issue.id || issue._id,
          newUnitOfficerId: selectedWardOfficer,
          notes: resolutionNotes,
        });
      } else if (actionType === "reassign_field") {
        if (!selectedFieldOfficer) {
          setErrorBanner("Please select a Field Officer");
          setLoading(false);
          return;
        }
        await reassignOfficer({
          cityAdminUserId,
          issueId: issue.id || issue._id,
          newFieldOfficerId: selectedFieldOfficer,
          notes: resolutionNotes,
        });
      } else if (actionType === "change_category") {
        if (newCategory === issue.category) {
          setErrorBanner("Please select a different category");
          setLoading(false);
          return;
        }
        await changeCategory({
          cityAdminUserId,
          issueId: issue.id || issue._id,
          newCategory: newCategory,
          notes: resolutionNotes,
        });
      } else if (actionType === "reject") {
        if (!rejectionReason.trim()) {
          setErrorBanner("Please provide a rejection reason");
          setLoading(false);
          return;
        }
        await rejectEscalation({
          cityAdminUserId,
          issueId: issue.id || issue._id,
          reason: rejectionReason || resolutionNotes,
        });
      } else if (actionType === "dismiss") {
        if (!rejectionReason.trim()) {
          setErrorBanner("Please provide a dismissal reason");
          setLoading(false);
          return;
        }
        await dismissEscalation({
          cityAdminUserId,
          issueId: issue.id || issue._id,
          reason: rejectionReason || resolutionNotes,
        });
      } else if (actionType === "approve") {
        await approveEscalation({
          cityAdminUserId,
          issueId: issue.id || issue._id,
          notes: resolutionNotes,
        });
      }

      setSuccessToast("Action processed successfully.");
      setTimeout(() => {
        onResolved();
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error resolving escalation:", error);
      setErrorBanner("Failed to process action: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionConfig = () => {
    switch (actionType) {
      case "extend_sla":
        return {
          icon: Clock,
          color: "blue",
          gradient:
            "from-cyan-500 to-blue-600 dark:from-cyan-900/60 dark:to-blue-900/40",
          bgGradient:
            "from-cyan-50/50 to-blue-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
          borderColor: "border-cyan-200 dark:border-cyan-900/40",
          title: "Extend SLA Deadline",
          description: "Grant additional time to resolve this issue",
        };
      case "reassign_ward":
        return {
          icon: Shield,
          color: "purple",
          gradient:
            "from-purple-500 to-pink-500 dark:from-purple-900/60 dark:to-pink-900/40",
          bgGradient:
            "from-purple-50/50 to-pink-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
          borderColor: "border-purple-200 dark:border-purple-900/40",
          title: "Reassign Unit Officer",
          description: "Transfer oversight to a different unit officer",
        };
      case "reassign_field":
        return {
          icon: Users,
          color: "indigo",
          gradient:
            "from-indigo-500 to-purple-500 dark:from-indigo-900/60 dark:to-purple-900/40",
          bgGradient:
            "from-indigo-50/50 to-purple-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
          borderColor: "border-indigo-200 dark:border-indigo-900/40",
          title: "Reassign Field Officer",
          description: "Assign a different field officer to handle this",
        };
      case "change_category":
        return {
          icon: Tag,
          color: "amber",
          gradient:
            "from-amber-500 to-orange-500 dark:from-amber-900/60 dark:to-orange-900/40",
          bgGradient:
            "from-amber-50/50 to-orange-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
          borderColor: "border-amber-200 dark:border-amber-900/40",
          title: "Change Category",
          description: "Reclassify issue to correct department",
        };
      case "approve":
        return {
          icon: CheckCircle,
          color: "green",
          gradient:
            "from-emerald-500 to-teal-500 dark:from-emerald-900/60 dark:to-teal-900/40",
          bgGradient:
            "from-emerald-50/50 to-teal-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
          borderColor: "border-emerald-200 dark:border-emerald-900/40",
          title: "Approve Resolution",
          description:
            "Accept current approach and resolve administrative escalation",
        };
      case "reject":
        return {
          icon: XCircle,
          color: "red",
          gradient:
            "from-red-500 to-rose-500 dark:from-red-900/60 dark:to-rose-900/40",
          bgGradient:
            "from-red-50/50 to-rose-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
          borderColor: "border-rose-200 dark:border-rose-900/40",
          title: "Reject Civic Issue",
          description: "Reject issue and close permanently",
        };
      case "dismiss":
        return {
          icon: XCircle,
          color: "slate",
          gradient:
            "from-slate-500 to-zinc-600 dark:from-slate-800 dark:to-zinc-800",
          bgGradient:
            "from-slate-50 to-zinc-50 dark:from-slate-900/60 dark:to-slate-850",
          borderColor: "border-slate-200 dark:border-slate-800",
          title: "Dismiss Escalation",
          description: "Close escalation request while preserving issue state",
        };
      default:
        return {
          icon: Clock,
          color: "blue",
          gradient: "from-blue-500 to-cyan-500",
          bgGradient: "from-blue-50 to-cyan-50",
          borderColor: "border-blue-500",
          title: "Extend SLA Deadline",
          description: "Grant additional time to resolve this issue",
        };
    }
  };

  const config = getActionConfig();
  const ActionIcon = config.icon;

  const isPendingReview =
    issue.is_escalated &&
    (issue.escalation_admin_review_status === "pending" ||
      !issue.escalation_admin_review_status);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-end z-50 animate-fadeIn">
      {/* Background click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Drawer content body */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-slideOver overflow-hidden text-xs font-semibold text-slate-800 dark:text-slate-200">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
              City Admin SLA & Escalation Control
            </h2>
            <p className="text-[10px] text-teal-650 dark:text-teal-400 font-extrabold uppercase mt-0.5">
              Administrative Scope: {issue.city}, {issue.state}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorBanner && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="flex-shrink-0" size={16} />
              <p>{errorBanner}</p>
            </div>
          )}

          {/* Success Toast banner */}
          {successToast && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="flex-shrink-0" size={16} />
              <p>{successToast}</p>
            </div>
          )}

          {/* Acknowledge Escalation panel */}
          {isPendingReview && (
            <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="text-amber-500" size={16} />
                Awaiting Acknowledgment
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                This administrative escalation has not been formally
                acknowledged yet. Please verify receipt to move its review state
                to under review.
              </p>
              <button
                onClick={handleAcknowledgeEscalation}
                disabled={loading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
              >
                Acknowledge Escalation
              </button>
            </div>
          )}

          {/* Issue Context Summary */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Issue Context
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">
                  Issue Code
                </span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-extrabold">
                  {issue.ticket_id}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-bold">
                  Current Category
                </span>
                <span className="font-extrabold uppercase">
                  {issue.category}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">
                  Location
                </span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {issue.location}
                </p>
              </div>
              <div className="col-span-2">
                <span className="block text-[10px] text-slate-400 uppercase font-bold">
                  Description
                </span>
                <p className="font-semibold text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                  {issue.description}
                </p>
              </div>
            </div>

            {issue.escalation_reason && (
              <div className="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 rounded-xl p-3.5 space-y-1">
                <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-black uppercase">
                  Escalation Trigger Reason
                </span>
                <p className="font-extrabold text-slate-800 dark:text-white leading-normal">
                  "{issue.escalation_reason}"
                </p>
              </div>
            )}
          </div>

          {/* Choose administrative action */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Choose Administrative Action
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "extend_sla",
                "reassign_ward",
                "reassign_field",
                "change_category",
                "approve",
                "dismiss",
                "reject",
              ].map((type) => {
                const label = {
                  extend_sla: "Extend SLA",
                  reassign_ward: "Reassign UO",
                  reassign_field: "Reassign FO",
                  change_category: "Recategorize",
                  approve: "Approve Resolution",
                  dismiss: "Dismiss Escalation",
                  reject: "Reject Issue",
                }[type];

                const isSelected = actionType === type;

                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setActionType(type)}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all duration-200 ${
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-950/20 border-teal-500 text-teal-650 dark:text-teal-450"
                        : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action configuration forms */}
          <div
            className={`bg-gradient-to-br ${config.bgGradient} border ${config.borderColor} rounded-2xl p-5 space-y-4`}
          >
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <ActionIcon size={16} />
                {config.title}
              </h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                {config.description}
              </p>
            </div>

            {actionType === "extend_sla" && (
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 uppercase font-bold">
                  New SLA Target Deadline
                </label>
                <input
                  type="datetime-local"
                  value={newSlaDeadline}
                  onChange={(e) => setNewSlaDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  Current deadline:{" "}
                  {issue.sla_deadline
                    ? new Date(issue.sla_deadline).toLocaleString()
                    : "None"}
                </p>
              </div>
            )}

            {actionType === "reassign_ward" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Select Unit Officer Profile
                  </label>
                  <select
                    value={selectedWardOfficer}
                    onChange={(e) => handleUoChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="">-- Choose Unit Officer --</option>
                    {wardOfficers.map((o) => (
                      <option key={o.profileId} value={o.profileId}>
                        {o.fullName} ({o.department}) - Active Workload:{" "}
                        {o.currentWorkload}/{o.maximumCapacity}
                      </option>
                    ))}
                  </select>
                </div>

                {officerMismatchWarning && (
                  <div className="bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex gap-2">
                    <AlertTriangle className="flex-shrink-0" size={15} />
                    <p>
                      Department incompatibility detected between selected Unit
                      Officer and current Field Officer.
                    </p>
                  </div>
                )}
              </div>
            )}

            {actionType === "reassign_field" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                    Select Field Officer Profile
                  </label>
                  <select
                    value={selectedFieldOfficer}
                    onChange={(e) => handleFoChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="">-- Choose Field Officer --</option>
                    {fieldOfficers.map((o) => (
                      <option key={o.profileId} value={o.profileId}>
                        {o.fullName} ({o.department}) - Workload:{" "}
                        {o.currentWorkload}/{o.maximumCapacity}
                      </option>
                    ))}
                  </select>
                </div>

                {officerMismatchWarning && (
                  <div className="bg-red-500/5 border border-red-500/20 text-red-650 dark:text-red-400 p-3 rounded-xl flex gap-2">
                    <AlertTriangle className="flex-shrink-0" size={15} />
                    <p>
                      Department incompatibility detected between selected Field
                      Officer and current Unit Officer.
                    </p>
                  </div>
                )}
              </div>
            )}

            {actionType === "change_category" && (
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 uppercase font-bold">
                  Correct Category Classification
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-100 cursor-pointer capitalize"
                >
                  <option value="road">Road</option>
                  <option value="electricity">Electricity</option>
                  <option value="water">Water</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="drainage">Drainage</option>
                  <option value="solid_waste">Solid Waste</option>
                  <option value="public_health">Public Health</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {actionType === "reject" && (
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 uppercase font-bold">
                  Civic Issue Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none h-16 resize-none"
                  placeholder="State the reason why the citizen reported issue is rejected..."
                />
              </div>
            )}

            {actionType === "dismiss" && (
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-450 uppercase font-bold">
                  Escalation Dismissal Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none h-16 resize-none"
                  placeholder="State the reason why the escalation review is rejected/dismissed..."
                />
              </div>
            )}

            {/* Resolution/Audit Notes */}
            <div className="space-y-2">
              <label className="block text-[10px] text-slate-400 uppercase font-bold">
                Resolution Notes *
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                required
                rows={3}
                className="w-full px-3.5 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none h-20 resize-none"
                placeholder="Provide details of resolution decision..."
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 dark:bg-slate-950/80 px-6 py-4 border-t border-slate-200 dark:border-slate-800/80 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleResolveEscalation}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors text-center ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-teal-650 hover:bg-teal-700 shadow"
            }`}
          >
            {loading
              ? "Processing..."
              : actionType === "reject"
                ? "Reject Civic Issue"
                : "Confirm Action"}
          </button>
        </div>
      </div>
    </div>
  );
}
