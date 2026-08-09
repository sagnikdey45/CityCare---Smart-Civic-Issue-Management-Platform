"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  FileText,
  Tag,
  CheckCircle2,
  Send,
  Activity,
  UserCheck,
  Plus,
  Info,
  Loader2,
  ArrowUpRight,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ISSUE_CATEGORIES,
  ISSUE_SUBCATEGORIES,
} from "@/lib/issueClassificationConfig";

// --- Lookups and Normalisation Helpers ---

function normalizeDepartment(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function formatDepartmentLabel(value) {
  return String(value || "Not Assigned")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

const ESCALATION_CATEGORY_LABELS = {
  sla_breach: "SLA Breach",
  resource_shortage: "Resource Shortage",
  officer_non_responsiveness: "Officer Non-Responsiveness",
  technical_complexity: "Technical Complexity",
  technical_dependency: "Technical Dependency",
  third_party_dependency: "Third-Party Dependency",
  public_safety_risk: "Public Safety Risk",
  environmental_risk: "Environmental Risk",
  citizen_escalation: "Citizen Escalation",
  repeat_failure: "Repeat Failure",
  cross_department_dependency: "Cross-Department Dependency",
  budget_approval_required: "Budget Approval Required",
  legal_or_regulatory: "Legal or Regulatory",
  emergency_response: "Emergency Response",
  administrative_approval_pending: "Administrative Approval Pending",
  other: "Other",
};

function formatEscalationCategory(value) {
  if (!value) return "Other";
  return (
    ESCALATION_CATEGORY_LABELS[value] ||
    String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

const ESCALATION_ACTION_LABELS = {
  escalate: "Issue Escalated",
  issue_escalated: "Issue Escalated",
  review_escalation: "Escalation Acknowledged",
  extend_sla: "SLA Deadline Extended",
  reassign_unit_officer: "Unit Officer Reassigned",
  reassign_field_officer: "Field Officer Reassigned",
  reassign_officer: "Officer Assignment Updated",
  change_classification: "Issue Classification Changed",
  change_category: "Issue Category Changed",
  update_priority: "Issue Priority Updated",
  request_corrective_action: "Corrective Action Requested",
  reject_escalation_response: "Escalation Response Rejected",
  approve_escalation: "Escalation Resolution Approved",
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

const ESCALATION_STATUS_STYLES = {
  pending: {
    label: "Pending Review",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  reviewed: {
    label: "Under Review",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300",
  },
  corrective_action_required: {
    label: "Corrective Action Required",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300",
  },
  resolved: {
    label: "Resolved",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
};

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

function formatHistoryValue(value) {
  if (!value) return "N/A";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function EscalationField({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
      <p className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">
        {label}
      </p>
      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize mt-0.5 break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}

export function CityAdminEscalationResolutionModal({
  issue,
  cityAdminUserId,
  onClose,
  onResolved,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stable Issue ID
  const issueId = issue?.id || issue?._id;

  // Derive Normalized Issue Department
  const issueDepartment = normalizeDepartment(
    issue?.department || issue?.category,
  );

  // Identify Currently Assigned Officer Profile IDs
  const currentUnitOfficerProfileId =
    issue?.assignedUnitOfficer?.profileId ||
    issue?.assigned_officer?.profileId ||
    null;

  const currentFieldOfficerProfileId =
    issue?.assignedFieldOfficer?.profileId ||
    issue?.field_officer?.profileId ||
    null;

  const currentUnitOfficer =
    issue?.assignedUnitOfficer || issue?.assigned_officer || null;

  const currentFieldOfficer =
    issue?.assignedFieldOfficer || issue?.field_officer || null;

  // In-modal feedback states
  const [modalError, setModalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successToast, setSuccessToast] = useState("");

  // Incompatibility & Department Mismatch Confirmation States
  const [uoIncompatibilityPrompt, setUoIncompatibilityPrompt] = useState(null);
  const [classIncompatibilityPrompt, setClassIncompatibilityPrompt] =
    useState(null);
  const [officerDepartmentWarning, setOfficerDepartmentWarning] =
    useState(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // --- SLA Deadline Validation ---
  const existingSlaDeadline =
    issue?.sla?.deadline ?? issue?.sla_deadline ?? issue?.slaDeadline ?? null;

  const existingSlaTimestamp = existingSlaDeadline
    ? new Date(existingSlaDeadline).getTime()
    : null;

  const hasExistingSlaDeadline = Number.isFinite(existingSlaTimestamp);

  // --- Normalise Escalation State ---
  const escalationData = issue?.escalation || {};

  const isEscalated =
    escalationData.isEscalated === true ||
    issue?.is_escalated === true ||
    issue?.escalatedToAdmin === true ||
    issue?.status === "escalated";

  const escalationReviewStatus =
    escalationData.status ||
    escalationData.adminReviewStatus ||
    issue?.escalation_admin_review_status ||
    "pending";

  const isEscalationResolved =
    escalationData.resolved === true ||
    issue?.escalation_resolved === true ||
    escalationReviewStatus === "resolved" ||
    escalationReviewStatus === "rejected" ||
    escalationReviewStatus === "dismissed";

  const hasActiveUnresolvedEscalation = isEscalated && !isEscalationResolved;

  const responseRejectedAt =
    escalationData.responseRejectedAt || issue?.escalation_response_rejected_at;

  const responseRejectionReason =
    escalationData.responseRejectionReason ||
    issue?.escalation_response_rejection_reason;

  const requiresCorrectiveAction =
    Boolean(responseRejectedAt) && !isEscalationResolved;

  const escalationDisplayStatus = isEscalationResolved
    ? "resolved"
    : requiresCorrectiveAction
      ? "corrective_action_required"
      : escalationReviewStatus;

  const hasEscalationData =
    isEscalated ||
    isEscalationResolved ||
    Boolean(issue?.escalation_reason || escalationData.reason);

  // --- Action Visibility & Selection Logic ---
  const escalationDecisionActions = [
    { id: "approve", label: "Approve Escalation", icon: CheckCircle },
    { id: "reject_response", label: "Reject Escalation", icon: XCircle },
  ];

  const operationalActions = [
    {
      id: "extend_sla",
      label: "Extend SLA",
      icon: Clock,
      disabled: !hasExistingSlaDeadline,
      disabledReason: !hasExistingSlaDeadline
        ? "No SLA deadline has been assigned by the Unit Officer."
        : null,
    },
    {
      id: "reassign_unit_officer",
      label: "Reassign Unit Officer",
      icon: UserCheck,
    },
    {
      id: "reassign_field_officer",
      label: "Reassign Field Officer",
      icon: Users,
    },
    { id: "change_classification", label: "Classification", icon: Tag },
    { id: "update_priority", label: "Update Priority", icon: AlertTriangle },
    { id: "send_message", label: "Send Message", icon: Send },
    { id: "request_action", label: "Request Action", icon: Activity },
  ];

  const firstEnabledOperationalAction =
    operationalActions.find((a) => !a.disabled)?.id ?? "reassign_unit_officer";

  const availableActions = hasActiveUnresolvedEscalation
    ? [...operationalActions, ...escalationDecisionActions]
    : operationalActions;

  const [actionType, setActionType] = useState(
    hasActiveUnresolvedEscalation ? "approve" : firstEnabledOperationalAction,
  );

  // Replacement selection state (initialised empty, NOT auto-selecting current officer)
  const [selectedUnitOfficerId, setSelectedUnitOfficerId] = useState("");
  const [selectedFieldOfficerId, setSelectedFieldOfficerId] = useState("");

  // Reset selected action & replacement choices when switching tabs or issue
  useEffect(() => {
    setActionType(
      hasActiveUnresolvedEscalation ? "approve" : firstEnabledOperationalAction,
    );
    setSelectedUnitOfficerId("");
    setSelectedFieldOfficerId("");
    setModalError("");
    setFieldErrors({});
    setOfficerDepartmentWarning(null);
  }, [issueId, hasActiveUnresolvedEscalation]);

  useEffect(() => {
    if (actionType === "reassign_unit_officer") {
      setSelectedUnitOfficerId("");
      setSelectedFieldOfficerId("");
    }
    if (actionType === "reassign_field_officer") {
      setSelectedFieldOfficerId("");
      setSelectedUnitOfficerId("");
    }
    setModalError("");
    setFieldErrors({});
    setOfficerDepartmentWarning(null);
  }, [actionType]);

  // Scoped Queries for Candidates
  const isUnitReassignment = actionType === "reassign_unit_officer";
  const isFieldReassignment = actionType === "reassign_field_officer";

  const unitOfficerQuery = useQuery(
    api.cityAdmin.getAssignmentCandidates,
    issueId && cityAdminUserId && isUnitReassignment
      ? { cityAdminUserId, issueId, officerType: "unit_officer" }
      : "skip",
  );

  const fieldOfficerQuery = useQuery(
    api.cityAdmin.getAssignmentCandidates,
    issueId && cityAdminUserId && isFieldReassignment
      ? { cityAdminUserId, issueId, officerType: "field_officer" }
      : "skip",
  );

  const unitOfficers = unitOfficerQuery?.candidates ?? unitOfficerQuery ?? [];
  const fieldOfficers =
    fieldOfficerQuery?.candidates ?? fieldOfficerQuery ?? [];

  const isUnitOfficerLoading =
    isUnitReassignment && unitOfficerQuery === undefined;
  const isFieldOfficerLoading =
    isFieldReassignment && fieldOfficerQuery === undefined;

  // Form State
  const [newSlaDeadline, setNewSlaDeadline] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    issue?.category || "other",
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState(
    Array.isArray(issue?.subcategory) ? issue.subcategory : [],
  );
  const [customSubcategoryInput, setCustomSubcategoryInput] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(
    issue?.priority || "medium",
  );
  const [messageRecipient, setMessageRecipient] = useState("both");
  const [messageText, setMessageText] = useState("");
  const [reason, setReason] = useState("");

  // Default SLA Deadline
  useEffect(() => {
    if (issue?.sla?.deadline || issue?.sla_deadline) {
      const deadline = new Date(issue.sla?.deadline || issue.sla_deadline);
      setNewSlaDeadline(deadline.toISOString().slice(0, 16));
    }
  }, [issue]);

  // Mutations
  const assignUnitOfficerMut = useMutation(
    api.cityAdmin.assignOrReassignUnitOfficer,
  );
  const assignFieldOfficerMut = useMutation(
    api.cityAdmin.assignOrReassignFieldOfficer,
  );
  const changeClassificationMut = useMutation(
    api.cityAdmin.changeIssueClassification,
  );
  const updatePriorityMut = useMutation(api.cityAdmin.updateIssuePriority);
  const updateSlaDeadlineMut = useMutation(api.cityAdmin.updateSlaDeadline);
  const sendIssueMessageMut = useMutation(api.cityAdmin.sendIssueMessage);

  const reviewEscalationMut = useMutation(api.slaMonitoring.reviewEscalation);
  const approveEscalationMut = useMutation(api.slaMonitoring.approveEscalation);
  const rejectEscalationResponseMut = useMutation(
    api.slaMonitoring.rejectEscalationResponse,
  );
  const requestCorrectiveActionMut = useMutation(
    api.slaMonitoring.requestCorrectiveAction,
  );

  const derivedDepartment = selectedCategory;

  function normalizeSubcategoryInput(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ");
  }

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    setSelectedSubcategories([]);
    setCustomSubcategoryInput("");
  };

  const handleToggleSubcategory = (sub) => {
    const trimmed = normalizeSubcategoryInput(sub);
    if (!trimmed) return;
    const exists = selectedSubcategories.some(
      (s) =>
        normalizeSubcategoryInput(s).toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      setSelectedSubcategories(
        selectedSubcategories.filter(
          (s) =>
            normalizeSubcategoryInput(s).toLowerCase() !==
            trimmed.toLowerCase(),
        ),
      );
    } else {
      setSelectedSubcategories([...selectedSubcategories, trimmed]);
    }
  };

  const handleAddCustomSubcategory = () => {
    const trimmed = normalizeSubcategoryInput(customSubcategoryInput);
    if (!trimmed) return;

    const alreadyExists = selectedSubcategories.some(
      (existing) =>
        normalizeSubcategoryInput(existing).toLowerCase() ===
        trimmed.toLowerCase(),
    );

    if (alreadyExists) {
      setCustomSubcategoryInput("");
      return;
    }

    setSelectedSubcategories((previous) => [...previous, trimmed]);
    setCustomSubcategoryInput("");
  };

  // Defensive Candidate Sorting (Current Assignment at top, then Suitable with capacity, then others)
  const sortedUnitOfficers = useMemo(() => {
    return [...unitOfficers].sort((a, b) => {
      const aCurrent =
        String(a.profileId) === String(currentUnitOfficerProfileId);
      const bCurrent =
        String(b.profileId) === String(currentUnitOfficerProfileId);
      if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;

      const aMatch = normalizeDepartment(a.department) === issueDepartment;
      const bMatch = normalizeDepartment(b.department) === issueDepartment;
      if (aMatch !== bMatch) return aMatch ? -1 : 1;

      const aAvailable = Number(a.availableCapacity ?? 0) > 0;
      const bAvailable = Number(b.availableCapacity ?? 0) > 0;
      if (aAvailable !== bAvailable) return aAvailable ? -1 : 1;

      if (Boolean(a.isRecommended) !== Boolean(b.isRecommended)) {
        return a.isRecommended ? -1 : 1;
      }

      return Number(a.currentWorkload ?? 0) - Number(b.currentWorkload ?? 0);
    });
  }, [unitOfficers, currentUnitOfficerProfileId, issueDepartment]);

  const sortedFieldOfficers = useMemo(() => {
    return [...fieldOfficers].sort((a, b) => {
      const aCurrent =
        String(a.profileId) === String(currentFieldOfficerProfileId);
      const bCurrent =
        String(b.profileId) === String(currentFieldOfficerProfileId);
      if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;

      const aMatch = normalizeDepartment(a.department) === issueDepartment;
      const bMatch = normalizeDepartment(b.department) === issueDepartment;
      if (aMatch !== bMatch) return aMatch ? -1 : 1;

      const aAvailable = Number(a.availableCapacity ?? 0) > 0;
      const bAvailable = Number(b.availableCapacity ?? 0) > 0;
      if (aAvailable !== bAvailable) return aAvailable ? -1 : 1;

      if (Boolean(a.isRecommended) !== Boolean(b.isRecommended)) {
        return a.isRecommended ? -1 : 1;
      }

      return Number(a.currentWorkload ?? 0) - Number(b.currentWorkload ?? 0);
    });
  }, [fieldOfficers, currentFieldOfficerProfileId, issueDepartment]);

  // Normalised Timeline
  const escalationTimeline =
    issue?.escalation?.resolutionActions ||
    issue?.escalation_resolution_actions ||
    issue?.escalationResolutionActions ||
    [];

  const normalisedTimeline = useMemo(() => {
    const list = escalationTimeline
      .map((event) => {
        const rawTs = event.performedAt || event.performed_at;
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
            event.performedByName || event.performed_by || "Administrator",
          performedByRole: event.performedByRole || event.role || "admin",
          notes: event.notes || event.reason || event.comment,
          oldValue: event.oldValue || event.old_value,
          newValue: event.newValue || event.new_value,
        };
      })
      .filter((e) => e.type && e.performedAt !== null);

    const rawEscAt = isEscalated
      ? (escalationData.escalatedAt ??
        issue?.escalatedAt ??
        issue?.escalated_at ??
        null)
      : null;

    const parsedEscAt =
      rawEscAt !== null && rawEscAt !== undefined && rawEscAt !== ""
        ? typeof rawEscAt === "number"
          ? rawEscAt
          : new Date(rawEscAt).getTime()
        : null;

    const escAt = Number.isFinite(parsedEscAt) ? parsedEscAt : null;

    const hasEscalationEvent = list.some(
      (e) => e.type === "escalate" || e.type === "issue_escalated",
    );

    if (isEscalated && escAt !== null && !hasEscalationEvent) {
      list.unshift({
        id: `escalated-${escAt}`,
        type: "escalate",
        performedAt: escAt,
        performedBy:
          escalationData.escalatedByName ||
          escalationData.escalatedBy ||
          issue?.escalatedBy ||
          issue?.escalated_by ||
          "Officer",
        notes:
          escalationData.reason ||
          issue?.escalationReason ||
          issue?.escalation_reason ||
          "Issue escalated to admin oversight.",
      });
    }

    const validTimelineEvents = list.filter((event) => {
      if (!event) return false;
      if (event.performedAt === null || event.performedAt === undefined)
        return false;
      if (
        (event.type === "escalate" || event.type === "issue_escalated") &&
        !isEscalated
      ) {
        return false;
      }
      return true;
    });

    validTimelineEvents.sort(
      (a, b) => Number(a.performedAt) - Number(b.performedAt),
    );

    if (process.env.NODE_ENV === "development") {
      console.log("[Escalation timeline input]", {
        issueId: issue?.id || issue?._id,
        isEscalated,
        escalatedAt: escAt,
        reviewStatus: escalationReviewStatus,
        actionCount: (escalationTimeline || []).length,
        timelineEventCount: validTimelineEvents.length,
      });
    }

    return validTimelineEvents;
  }, [
    escalationTimeline,
    issue,
    escalationData,
    isEscalated,
    escalationReviewStatus,
  ]);

  const getActionConfig = () => {
    switch (actionType) {
      case "extend_sla":
        return {
          title: "Extend SLA Deadline",
          description:
            "Grant additional time to resolve this issue and log extension history.",
          color: "text-cyan-500",
        };
      case "reassign_unit_officer":
        return {
          title: "Reassign Unit Officer",
          description:
            "Transfer unit oversight to a compatible Unit Officer in this city.",
          color: "text-purple-500",
        };
      case "reassign_field_officer":
        return {
          title: "Reassign Field Officer",
          description:
            "Assign a compatible Field Officer for ground execution.",
          color: "text-indigo-500",
        };
      case "change_classification":
        return {
          title: "Change Classification & Department",
          description:
            "Update issue category, subcategories, and derived department.",
          color: "text-amber-500",
        };
      case "update_priority":
        return {
          title: "Update Operational Priority",
          description: "Adjust priority level to change queue urgency.",
          color: "text-rose-500",
        };
      case "send_message":
        return {
          title: "Send Message to Assigned Officers",
          description:
            "Send direct instructions or clarifications to officers.",
          color: "text-blue-500",
        };
      case "approve":
        return {
          title: "Approve Escalation Resolution",
          description:
            "Resolves administrative escalation while maintaining civic issue status.",
          color: "text-emerald-500",
        };
      case "request_action":
        return {
          title: "Request Corrective Action",
          description:
            "Send corrective instructions to the currently assigned Unit Officer and Field Officer.",
          color: "text-amber-500",
        };
      case "reject_response":
        return {
          title: "Reject Escalation Response",
          description:
            "Mark the submitted escalation response as insufficient and require further corrective action.",
          color: "text-rose-500",
        };
      default:
        return {
          title: "Administrative Action",
          description: "Perform administrative action on issue.",
          color: "text-cyan-500",
        };
    }
  };

  const handleAcknowledgeEscalation = async () => {
    setLoading(true);
    setModalError("");
    try {
      await reviewEscalationMut({ cityAdminUserId, issueId });
      setSuccessToast("Escalation formally acknowledged and reviewed.");
      onResolved?.();
    } catch (err) {
      console.error(err);
      setModalError("Acknowledgement failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    setModalError("");
    setFieldErrors({});

    // Safety check for allowed action
    const allowedActionIds = availableActions.map((a) => a.id);
    if (!allowedActionIds.includes(actionType)) {
      setModalError(
        "This action is not available for the current issue state.",
      );
      return;
    }

    if (actionType === "extend_sla") {
      if (!hasExistingSlaDeadline) {
        setModalError(
          "This issue does not have an SLA deadline to extend. The Unit Officer must assign the initial SLA deadline first.",
        );
        return;
      }
      if (!newSlaDeadline) {
        setFieldErrors({
          newSlaDeadline: "A valid new SLA deadline is required.",
        });
        setModalError("Please specify a valid new SLA deadline.");
        return;
      }
      const newDeadlineTimestamp = new Date(newSlaDeadline).getTime();
      if (!Number.isFinite(newDeadlineTimestamp)) {
        setModalError("Enter a valid new SLA deadline.");
        return;
      }
      if (newDeadlineTimestamp <= existingSlaTimestamp) {
        setFieldErrors({
          newSlaDeadline:
            "The new deadline must be later than the current SLA deadline.",
        });
        setModalError("SLA extension must increase the existing deadline.");
        return;
      }
      if (!reason.trim()) {
        setFieldErrors({ reason: "Justification reason is required." });
        setModalError("A reason is required to extend the SLA deadline.");
        return;
      }
    } else if (actionType === "reassign_unit_officer") {
      if (!selectedUnitOfficerId) {
        setFieldErrors({
          selectedUnitOfficerId: "Select a replacement Unit Officer candidate.",
        });
        setModalError("Please select a replacement Unit Officer candidate.");
        return;
      }
      if (
        String(selectedUnitOfficerId) === String(currentUnitOfficerProfileId)
      ) {
        setFieldErrors({
          selectedUnitOfficerId:
            "Select a different Unit Officer. This officer is already assigned.",
        });
        setModalError(
          "Select a different Unit Officer. This officer is already assigned.",
        );
        return;
      }

      // Check Department Mismatch Warning
      const candidate = unitOfficers.find(
        (u) => String(u.profileId) === String(selectedUnitOfficerId),
      );
      if (
        candidate &&
        normalizeDepartment(candidate.department) !== issueDepartment &&
        !officerDepartmentWarning
      ) {
        setOfficerDepartmentWarning({
          officerType: "unit_officer",
          officerName: candidate.name || candidate.fullName,
          officerDepartment: candidate.department,
          selectedId: selectedUnitOfficerId,
        });
        return;
      }

      if (!reason.trim()) {
        setFieldErrors({ reason: "Justification reason is required." });
        setModalError("A reason is required to reassign the Unit Officer.");
        return;
      }
    } else if (actionType === "reassign_field_officer") {
      if (!selectedFieldOfficerId) {
        setFieldErrors({
          selectedFieldOfficerId:
            "Select a replacement Field Officer candidate.",
        });
        setModalError("Please select a replacement Field Officer candidate.");
        return;
      }
      if (
        String(selectedFieldOfficerId) === String(currentFieldOfficerProfileId)
      ) {
        setFieldErrors({
          selectedFieldOfficerId:
            "Select a different Field Officer. This officer is already assigned.",
        });
        setModalError(
          "Select a different Field Officer. This officer is already assigned.",
        );
        return;
      }

      // Check Department Mismatch Warning
      const candidate = fieldOfficers.find(
        (f) => String(f.profileId) === String(selectedFieldOfficerId),
      );
      if (
        candidate &&
        normalizeDepartment(candidate.department) !== issueDepartment &&
        !officerDepartmentWarning
      ) {
        setOfficerDepartmentWarning({
          officerType: "field_officer",
          officerName: candidate.name || candidate.fullName,
          officerDepartment: candidate.department,
          selectedId: selectedFieldOfficerId,
        });
        return;
      }

      if (!reason.trim()) {
        setFieldErrors({ reason: "Justification reason is required." });
        setModalError("A reason is required to reassign the Field Officer.");
        return;
      }
    } else if (actionType === "change_classification") {
      if (selectedSubcategories.length === 0) {
        setFieldErrors({ subcategory: "Select at least one subcategory." });
        setModalError("Select at least one subcategory.");
        return;
      }
      if (!reason.trim()) {
        setFieldErrors({ reason: "Justification reason is required." });
        setModalError("A reason is required to change classification.");
        return;
      }
    } else if (actionType === "update_priority") {
      if (!reason.trim()) {
        setFieldErrors({ reason: "Justification reason is required." });
        setModalError("A reason is required to update priority.");
        return;
      }
    } else if (actionType === "send_message") {
      if (!messageText.trim()) {
        setFieldErrors({ messageText: "Message text cannot be empty." });
        setModalError("Please enter a message to send to assigned officers.");
        return;
      }
    } else if (actionType === "approve") {
      if (!reason.trim()) {
        setFieldErrors({ reason: "Resolution notes are required." });
        setModalError(
          "Resolution notes are required to approve escalation resolution.",
        );
        return;
      }
    } else if (actionType === "reject_response") {
      if (!reason.trim()) {
        setFieldErrors({ reason: "Rejection reason is required." });
        setModalError(
          "Please state why the officer's escalation response was insufficient.",
        );
        return;
      }
    } else if (actionType === "request_action") {
      const hasAssignedOfficers = Boolean(
        issue?.assignedUnitOfficer ||
          issue?.assignedFieldOfficer ||
          issue?.assigned_officer ||
          issue?.field_officer,
      );
      if (!hasAssignedOfficers) {
        setModalError(
          "No Unit Officer or Field Officer is currently assigned. Assign an officer before sending corrective instructions.",
        );
        return;
      }
      if (!reason.trim()) {
        setFieldErrors({ reason: "Corrective instructions are required." });
        setModalError(
          "Enter the corrective instructions that should be sent to the assigned officers.",
        );
        return;
      }
    }

    setLoading(true);

    try {
      if (actionType === "extend_sla") {
        await updateSlaDeadlineMut({
          cityAdminUserId,
          issueId,
          oldDeadline: issue.sla?.deadline || issue.sla_deadline,
          newDeadline: new Date(newSlaDeadline).getTime(),
          reason,
        });
        setSuccessToast("SLA deadline updated successfully.");
      } else if (actionType === "reassign_unit_officer") {
        const res = await assignUnitOfficerMut({
          cityAdminUserId,
          issueId,
          newUnitOfficerId: selectedUnitOfficerId,
          reason,
        });
        if (res?.code === "INCOMPATIBLE_FIELD_OFFICER") {
          setUoIncompatibilityPrompt({
            message:
              res.message ||
              "The current Field Officer reports to a different Unit Officer.",
            selectedUnitOfficerId,
            reason,
          });
          setLoading(false);
          return;
        }
        setSuccessToast("Unit Officer reassigned successfully.");
      } else if (actionType === "reassign_field_officer") {
        await assignFieldOfficerMut({
          cityAdminUserId,
          issueId,
          newFieldOfficerId: selectedFieldOfficerId,
          reason,
        });
        setSuccessToast("Field Officer reassigned successfully.");
      } else if (actionType === "change_classification") {
        const res = await changeClassificationMut({
          cityAdminUserId,
          issueId,
          category: selectedCategory,
          subcategory: selectedSubcategories,
          reason,
        });
        if (res?.code === "INCOMPATIBLE_OFFICERS") {
          setClassIncompatibilityPrompt({
            message:
              res.message ||
              "Changing classification makes current officer assignments incompatible.",
            selectedCategory,
            selectedSubcategories,
            reason,
          });
          setLoading(false);
          return;
        }
        setSuccessToast("Issue classification updated successfully.");
      } else if (actionType === "update_priority") {
        await updatePriorityMut({
          cityAdminUserId,
          issueId,
          priority: selectedPriority,
          reason,
        });
        setSuccessToast("Issue priority updated successfully.");
      } else if (actionType === "send_message") {
        await sendIssueMessageMut({
          cityAdminUserId,
          issueId,
          recipientRole: messageRecipient,
          message: messageText,
        });
        setSuccessToast("Message sent to assigned officers.");
      } else if (actionType === "approve") {
        await approveEscalationMut({
          cityAdminUserId,
          issueId,
          notes: reason,
        });
        setSuccessToast("Administrative escalation resolved.");
      } else if (actionType === "reject_response") {
        await rejectEscalationResponseMut({
          cityAdminUserId,
          issueId,
          reason,
        });
        setSuccessToast(
          "Officer escalation response rejected. Corrective action requested.",
        );
      } else if (actionType === "request_action") {
        const result = await requestCorrectiveActionMut({
          cityAdminUserId,
          issueId,
          actionRequest: reason.trim(),
        });
        const count = result?.notifiedOfficerCount || 1;
        setSuccessToast(
          `Corrective instructions sent to ${count} assigned officer${count === 1 ? "" : "s"}.`,
        );
      }

      const shouldCloseAfterAction =
        actionType === "approve" || actionType === "reject_response";

      onResolved?.();
      if (shouldCloseAfterAction) {
        onClose();
      } else {
        setReason("");
      }
    } catch (err) {
      console.error(err);
      setModalError("Action failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUoIncompatibilityOverride = async () => {
    if (!uoIncompatibilityPrompt) return;
    setLoading(true);
    setModalError("");
    try {
      await assignUnitOfficerMut({
        cityAdminUserId,
        issueId,
        newUnitOfficerId: uoIncompatibilityPrompt.selectedUnitOfficerId,
        reason: uoIncompatibilityPrompt.reason,
        clearIncompatibleFieldOfficer: true,
      });
      setUoIncompatibilityPrompt(null);
      setSuccessToast(
        "Unit Officer assigned and incompatible Field Officer cleared.",
      );
      onResolved?.();
      onClose();
    } catch (err) {
      console.error(err);
      setModalError("Failed to proceed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClassificationOverride = async () => {
    if (!classIncompatibilityPrompt) return;
    setLoading(true);
    setModalError("");
    try {
      await changeClassificationMut({
        cityAdminUserId,
        issueId,
        category: classIncompatibilityPrompt.selectedCategory,
        subcategory: classIncompatibilityPrompt.selectedSubcategories,
        reason: classIncompatibilityPrompt.reason,
        clearIncompatibleOfficers: true,
      });
      setClassIncompatibilityPrompt(null);
      setSuccessToast(
        "Classification changed and incompatible officer assignments cleared.",
      );
      onResolved?.();
      onClose();
    } catch (err) {
      console.error(err);
      setModalError("Failed to proceed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  const isPendingReview =
    hasActiveUnresolvedEscalation &&
    (escalationReviewStatus === "pending" ||
      issue?.escalation_admin_review_status === "pending");

  const config = getActionConfig();

  const modalJSX = (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-end z-[200] animate-fadeIn">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 h-dvh flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-slideOver overflow-hidden text-xs font-semibold text-slate-800 dark:text-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-cyan-400 text-sm">
                {issue?.code || issue?.ticket_id}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {issue?.city}, {issue?.state}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                Priority: {issue?.priority || issue?.severity}
              </span>
            </div>
            <h2 className="text-base font-black tracking-tight mt-1 text-white truncate max-w-xl">
              {issue?.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {modalError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-2xl font-bold flex items-center gap-3">
              <AlertTriangle className="flex-shrink-0" size={18} />
              <p>{modalError}</p>
            </div>
          )}

          {successToast && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl font-bold flex items-center gap-3">
              <CheckCircle2 className="flex-shrink-0" size={18} />
              <p>{successToast}</p>
            </div>
          )}

          {/* Department Mismatch Confirmation Banner */}
          {officerDepartmentWarning && (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm">
                <AlertTriangle size={18} />
                <span>Officer Department Mismatch Warning</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-normal">
                Issue Department:{" "}
                <strong>{formatDepartmentLabel(issueDepartment)}</strong>
                <br />
                Selected Officer Department:{" "}
                <strong>
                  {formatDepartmentLabel(
                    officerDepartmentWarning.officerDepartment,
                  )}
                </strong>
                <br />
                This officer belongs to a different department than the issue
                requires. Confirm that you still want to continue with this
                officer reassignment.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOfficerDepartmentWarning(null)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAction}
                  disabled={loading}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                >
                  Confirm Mismatched Reassignment
                </button>
              </div>
            </div>
          )}

          {/* Incompatibility Prompt Confirmation Cards */}
          {uoIncompatibilityPrompt && (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm">
                <AlertTriangle size={18} />
                <span>Unit Officer Incompatibility Warning</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-normal">
                {uoIncompatibilityPrompt.message}
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUoIncompatibilityPrompt(null)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300"
                >
                  Cancel Reassignment
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUoIncompatibilityOverride}
                  disabled={loading}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                >
                  Clear Incompatible Field Officer & Continue
                </button>
              </div>
            </div>
          )}

          {classIncompatibilityPrompt && (
            <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm">
                <AlertTriangle size={18} />
                <span>Classification Incompatibility Warning</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-normal">
                {classIncompatibilityPrompt.message}
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setClassIncompatibilityPrompt(null)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClassificationOverride}
                  disabled={loading}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold"
                >
                  Clear Incompatible Officer Assignments & Continue
                </button>
              </div>
            </div>
          )}

          {/* Pending Acknowledgement Banner */}
          {isPendingReview && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 font-bold">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Escalation Awaiting Acknowledgement
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    This escalation has not been formally acknowledged by City
                    Admin yet.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAcknowledgeEscalation}
                disabled={loading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs transition-colors shadow flex-shrink-0 cursor-pointer"
              >
                Acknowledge Escalation
              </button>
            </div>
          )}

          {/* 1. Issue Overview & SLA Details */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Issue Context Overview & SLA Health
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">
                  Category
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {issue?.category}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">
                  Department
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {formatDepartmentLabel(issueDepartment)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">
                  Operational Status
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {issue?.status}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">
                  SLA Target
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {issue?.sla?.deadline
                    ? formatDateTime(issue.sla.deadline)
                    : "No deadline"}
                </span>
              </div>
            </div>

            {/* SLA Extension History */}
            {issue?.sla?.extensionHistory &&
              issue.sla.extensionHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    SLA Extension History ({issue.sla.extensionHistory.length}{" "}
                    extensions)
                  </span>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {issue.sla.extensionHistory.map((ext, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]"
                      >
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">
                          Extended to {formatDateTime(ext.newDeadline)}
                        </span>
                        <span className="text-slate-400 ml-2">
                          Reason: "{ext.notes || ext.reason}"
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* 2. Persistent Escalation Details Section */}
          {hasEscalationData && (
            <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white dark:border-purple-900/50 dark:bg-slate-950/70">
              <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-4 dark:border-purple-900/40 dark:from-purple-950/30 dark:to-indigo-950/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Escalation Details
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Administrative escalation context and current review
                        state
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${
                      ESCALATION_STATUS_STYLES[escalationDisplayStatus]
                        ?.className ||
                      "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {ESCALATION_STATUS_STYLES[escalationDisplayStatus]?.label ||
                      escalationDisplayStatus}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <EscalationField
                    label="Escalation Category"
                    value={formatEscalationCategory(
                      escalationData.category ||
                        issue?.escalation_category ||
                        issue?.category,
                    )}
                  />
                  <EscalationField
                    label="Priority"
                    value={String(
                      escalationData.priority ||
                        issue?.escalation_priority ||
                        issue?.priority ||
                        "medium",
                    ).toUpperCase()}
                  />
                  <EscalationField
                    label="Escalated At"
                    value={formatDateTime(
                      escalationData.escalatedAt || issue?.escalated_at,
                    )}
                  />
                  <EscalationField
                    label="Escalation Count"
                    value={
                      escalationData.count ||
                      escalationData.escalationCount ||
                      issue?.escalation_count ||
                      1
                    }
                  />
                  {(escalationData.escalatedByName || issue?.escalated_by) && (
                    <EscalationField
                      label="Escalated By"
                      value={
                        escalationData.escalatedByName || issue?.escalated_by
                      }
                    />
                  )}
                  {(escalationData.reviewedByName ||
                    issue?.escalation_reviewed_by_name) && (
                    <EscalationField
                      label="Reviewed By"
                      value={
                        escalationData.reviewedByName ||
                        issue?.escalation_reviewed_by_name
                      }
                    />
                  )}
                  {(escalationData.reviewedAt ||
                    issue?.escalation_reviewed_at) && (
                    <EscalationField
                      label="Reviewed At"
                      value={formatDateTime(
                        escalationData.reviewedAt ||
                          issue?.escalation_reviewed_at,
                      )}
                    />
                  )}
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Escalation Reason
                  </p>
                  <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4 dark:border-purple-900/40 dark:bg-purple-950/20">
                    <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-relaxed text-slate-800 dark:text-slate-200">
                      {escalationData.reason ||
                        issue?.escalation_reason ||
                        "No escalation reason was recorded."}
                    </p>
                  </div>
                </div>

                {(escalationData.comments || issue?.escalation_comments) && (
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Additional Escalation Comments
                    </p>
                    <p className="whitespace-pre-wrap break-words text-xs font-semibold leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{escalationData.comments || issue?.escalation_comments}"
                    </p>
                  </div>
                )}

                {isEscalationResolved && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">
                          Escalation Resolution Approved
                        </p>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <EscalationField
                            label="Resolved At"
                            value={formatDateTime(
                              escalationData.resolvedAt ||
                                issue?.escalation_resolved_at,
                            )}
                          />
                          <EscalationField
                            label="Resolved By"
                            value={
                              escalationData.resolvedByName ||
                              issue?.escalation_resolved_by_name ||
                              "City Admin"
                            }
                          />
                        </div>

                        <div className="mt-3">
                          <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Resolution Notes
                          </p>
                          <p className="whitespace-pre-wrap break-words text-xs font-semibold leading-relaxed text-emerald-900 dark:text-emerald-200">
                            {escalationData.resolutionNotes ||
                              escalationData.resolutionNote ||
                              issue?.escalation_resolution_notes ||
                              "No resolution notes were recorded."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {responseRejectedAt && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
                    <div className="flex items-start gap-3">
                      <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-rose-800 dark:text-rose-300">
                          Previous Escalation Response Rejected
                        </p>
                        <div className="mt-2 text-xs font-semibold space-y-1">
                          <p className="text-rose-700 dark:text-rose-300">
                            <strong>Rejected At:</strong>{" "}
                            {formatDateTime(responseRejectedAt)}
                          </p>
                          <p className="whitespace-pre-wrap break-words text-rose-800 dark:text-rose-200 leading-relaxed pt-1">
                            <strong>Rejection Reason:</strong>{" "}
                            {responseRejectionReason ||
                              "Further corrective action was requested."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 3. Persistent Escalation Timeline Section */}
          {normalisedTimeline.length > 0 ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Escalation / Activity Timeline
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Complete administrative history of this issue
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {normalisedTimeline.length}{" "}
                  {normalisedTimeline.length === 1 ? "Event" : "Events"}
                </span>
              </div>

              <div className="relative space-y-0 pl-1">
                {normalisedTimeline.map((event, index) => {
                  const isLast = index === normalisedTimeline.length - 1;
                  return (
                    <div key={event.id} className="relative flex gap-4 pb-6">
                      {!isLast && (
                        <div className="absolute bottom-0 left-[17px] top-9 w-px bg-slate-200 dark:bg-slate-700" />
                      )}

                      <div className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-400 shadow-sm">
                        <Activity className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <p className="text-xs font-black text-slate-900 dark:text-white">
                            {formatTimelineAction(event.type)}
                          </p>
                          <time className="text-[10px] font-bold text-slate-400">
                            {formatDateTime(event.performedAt)}
                          </time>
                        </div>

                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Performed by {event.performedBy}
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
            </section>
          ) : isEscalated ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Escalation / Activity Timeline
              </h3>
              <p className="mt-2 text-xs font-medium text-slate-400">
                No escalation activity has been recorded yet.
              </p>
            </section>
          ) : null}

          {/* 4. Administrative Action Selector Section */}
          <div className="space-y-4">
            {hasActiveUnresolvedEscalation && (
              <div className="bg-gradient-to-r from-purple-900/30 via-slate-900 to-purple-950/40 p-4 rounded-2xl border border-purple-500/30 flex items-start gap-3">
                <Shield className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white">
                      Handle Escalation
                    </h3>
                    {escalationReviewStatus === "pending" && (
                      <button
                        type="button"
                        onClick={handleAcknowledgeEscalation}
                        disabled={loading}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <UserCheck size={12} />
                        <span>Acknowledge & Start Handling</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">
                    Apply administrative corrective actions before approving or
                    rejecting the escalation.
                  </p>
                </div>
              </div>
            )}

            {hasActiveUnresolvedEscalation ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    Corrective Actions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {operationalActions.map((tab) => {
                      const TabIcon = tab.icon;
                      const active = actionType === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          disabled={tab.disabled}
                          title={tab.disabled ? tab.disabledReason : undefined}
                          onClick={() => {
                            if (!tab.disabled) setActionType(tab.id);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                            tab.disabled
                              ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                              : active
                                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20 cursor-pointer"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                          }`}
                        >
                          <TabIcon size={14} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-wider mb-2">
                    Final Escalation Decision
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {escalationDecisionActions.map((tab) => {
                      const TabIcon = tab.icon;
                      const active = actionType === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActionType(tab.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                            active
                              ? tab.id === "approve"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                : "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                              : "bg-purple-950/20 dark:bg-purple-950/40 border border-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-900/30"
                          }`}
                        >
                          <TabIcon size={14} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                  SLA / Administrative Controls
                </h3>
                <div className="flex flex-wrap gap-2">
                  {operationalActions.map((tab) => {
                    const TabIcon = tab.icon;
                    const active = actionType === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        disabled={tab.disabled}
                        title={tab.disabled ? tab.disabledReason : undefined}
                        onClick={() => {
                          if (!tab.disabled) setActionType(tab.id);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                          tab.disabled
                            ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                            : active
                              ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20 cursor-pointer"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        }`}
                      >
                        <TabIcon size={14} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. Selected Action Form */}
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <h4
                className={`text-sm font-black flex items-center gap-1.5 ${config.color}`}
              >
                {config.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {config.description}
              </p>
            </div>

            {/* Extend SLA Form */}
            {actionType === "extend_sla" && (
              <div className="space-y-4">
                {!hasExistingSlaDeadline && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300 text-xs">
                    <p className="font-extrabold uppercase tracking-wider text-[10px]">
                      SLA extension unavailable
                    </p>
                    <p className="mt-1 font-semibold leading-relaxed">
                      The Unit Officer has not assigned an SLA deadline to this
                      issue yet. An SLA must first be created through the Unit
                      Officer workflow before the City Admin can extend it.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Current SLA Deadline
                    </label>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300">
                      {issue?.sla?.deadline
                        ? formatDateTime(issue.sla.deadline)
                        : "None"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Proposed SLA Target Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      value={newSlaDeadline}
                      onChange={(e) => setNewSlaDeadline(e.target.value)}
                      className={`w-full p-2.5 bg-white dark:bg-slate-900 border rounded-xl font-semibold text-slate-800 dark:text-slate-100 ${
                        fieldErrors.newSlaDeadline
                          ? "border-red-500"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Reassign Unit Officer Form */}
            {!hasActiveUnresolvedEscalation &&
              actionType === "reassign_unit_officer" && (
                <div className="space-y-4">
                  {/* Issue Compatibility Header Summary */}
                  <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                    <p className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                      Required Issue Department
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                      {formatDepartmentLabel(issueDepartment)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                      Officers from this department are prioritised as suitable
                      candidates.
                    </p>
                  </div>

                  {/* Current Unit Officer Summary */}
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                    <p className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                      Currently Assigned Unit Officer
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                      {currentUnitOfficer?.name ||
                        currentUnitOfficer?.fullName ||
                        "No Unit Officer Assigned"}
                    </p>
                    {currentUnitOfficer && (
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Department:{" "}
                        {formatDepartmentLabel(currentUnitOfficer.department)}
                      </p>
                    )}
                  </div>

                  {/* Candidate List */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                      Select Unit Officer Candidate (City Admin Scope:{" "}
                      {issue?.city || "Local"}) *
                    </label>
                    {isUnitOfficerLoading ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-cyan-500 font-bold">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading Unit Officer candidates...</span>
                      </div>
                    ) : sortedUnitOfficers.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        No Unit Officers available in{" "}
                        {issue?.city || "your city"}.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {sortedUnitOfficers.map((uo, idx) => {
                          const candidateDept = normalizeDepartment(
                            uo.department,
                          );
                          const isDepartmentMatch =
                            candidateDept === issueDepartment;
                          const isCurrentlyAssigned =
                            String(uo.profileId) ===
                            String(currentUnitOfficerProfileId);
                          const isCapacityFull =
                            Number(uo.availableCapacity ?? 0) <= 0;
                          const isSuitable =
                            isDepartmentMatch && !isCapacityFull;
                          const isSelected =
                            String(selectedUnitOfficerId) ===
                            String(uo.profileId);
                          const isCandidateDisabled =
                            isCurrentlyAssigned || isCapacityFull;

                          const candidateCardClass = isSelected
                            ? "border-purple-500 bg-purple-50 ring-2 ring-purple-500/20 dark:bg-purple-950/30"
                            : isCurrentlyAssigned
                              ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20"
                              : isCapacityFull
                                ? "cursor-not-allowed border-rose-200 bg-rose-50/50 opacity-70 dark:border-rose-900/40 dark:bg-rose-950/10"
                                : isDepartmentMatch
                                  ? "border-emerald-300 bg-emerald-50/50 hover:border-emerald-500 dark:border-emerald-900/50 dark:bg-emerald-950/10"
                                  : "border-amber-200 bg-amber-50/40 hover:border-amber-400 dark:border-amber-900/40 dark:bg-amber-950/10";

                          const prevCandidate = sortedUnitOfficers[idx - 1];
                          const isFirstMismatch =
                            !isDepartmentMatch &&
                            (!prevCandidate ||
                              normalizeDepartment(prevCandidate.department) ===
                                issueDepartment);

                          return (
                            <div key={uo.profileId} className="space-y-2">
                              {isFirstMismatch && (
                                <div className="pt-2 pb-1 text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-2">
                                  <span>
                                    Other Officers — Department Mismatch
                                  </span>
                                  <div className="flex-1 h-px bg-amber-200 dark:bg-amber-900/50" />
                                </div>
                              )}

                              <div
                                onClick={() => {
                                  if (!isCandidateDisabled) {
                                    setSelectedUnitOfficerId(uo.profileId);
                                  }
                                }}
                                className={`rounded-2xl border p-4 transition-all ${candidateCardClass} ${
                                  !isCandidateDisabled ? "cursor-pointer" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="uo_candidate"
                                    checked={isSelected}
                                    disabled={isCandidateDisabled}
                                    onChange={() => {
                                      if (!isCandidateDisabled) {
                                        setSelectedUnitOfficerId(uo.profileId);
                                      }
                                    }}
                                    className="mt-1 accent-purple-600 cursor-pointer"
                                  />

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-black text-slate-900 dark:text-white">
                                        {uo.name || uo.fullName}
                                      </p>

                                      {isCurrentlyAssigned && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300 bg-cyan-100 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300">
                                          <Shield size={10} />
                                          Current Assignment
                                        </span>
                                      )}

                                      {isSelected && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-100 px-2 py-0.5 text-[9px] font-black uppercase text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
                                          <CheckCircle size={10} />
                                          Selected Replacement
                                        </span>
                                      )}

                                      {isSuitable && !isCurrentlyAssigned && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                          <CheckCircle2 size={10} />
                                          Suitable for Issue
                                        </span>
                                      )}

                                      {!isDepartmentMatch && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                          <AlertTriangle size={10} />
                                          Department Mismatch
                                        </span>
                                      )}

                                      {isCapacityFull && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-[9px] font-black uppercase text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                                          <XCircle size={10} />
                                          Capacity Reached
                                        </span>
                                      )}

                                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[9px] font-bold text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-300">
                                        Within Scope
                                      </span>
                                    </div>

                                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                      <div>
                                        <span className="text-[9.5px] font-black uppercase text-slate-400 block">
                                          Officer Department
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                                          {formatDepartmentLabel(uo.department)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[9.5px] font-black uppercase text-slate-400 block">
                                          Required Issue Dept
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                                          {formatDepartmentLabel(
                                            issueDepartment,
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[9.5px] font-black uppercase text-slate-400 block">
                                          Workload
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                          {uo.currentWorkload ?? 0}/
                                          {uo.maximumCapacity ?? 10}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[9.5px] font-black uppercase text-slate-400 block">
                                          Available Capacity
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                          {uo.availableCapacity ?? 0}
                                        </span>
                                      </div>
                                    </div>

                                    <p className="mt-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                      {isCurrentlyAssigned
                                        ? "This officer is currently assigned to the issue."
                                        : isCapacityFull
                                          ? "Unavailable because the officer has reached the maximum active-issue capacity."
                                          : isDepartmentMatch
                                            ? "Suitable because the officer’s department matches the issue department and capacity is available."
                                            : `Not recommended because the officer belongs to ${formatDepartmentLabel(uo.department)}, while this issue requires ${formatDepartmentLabel(issueDepartment)}.`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Reassign Field Officer Form */}
            {!hasActiveUnresolvedEscalation &&
              actionType === "reassign_field_officer" && (
                <div className="space-y-4">
                  {/* Issue Compatibility Header Summary */}
                  <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                    <p className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                      Required Issue Department
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                      {formatDepartmentLabel(issueDepartment)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                      Officers from this department are prioritised as suitable
                      candidates.
                    </p>
                  </div>

                  {/* Current Field Officer Summary */}
                  <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                    <p className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                      Currently Assigned Field Officer
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                      {currentFieldOfficer?.name ||
                        currentFieldOfficer?.fullName ||
                        "No Field Officer Assigned"}
                    </p>
                    {currentFieldOfficer && (
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Department:{" "}
                        {formatDepartmentLabel(currentFieldOfficer.department)}
                      </p>
                    )}
                  </div>

                  {/* Candidate List */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                      Select Field Officer Candidate (City Admin Scope:{" "}
                      {issue?.city || "Local"}) *
                    </label>
                    {isFieldOfficerLoading ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-indigo-500 font-bold">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading Field Officer candidates...</span>
                      </div>
                    ) : sortedFieldOfficers.length === 0 ? (
                      <p className="text-xs text-slate-400 italic p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        No Field Officers available in{" "}
                        {issue?.city || "your city"}.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {sortedFieldOfficers.map((fo, idx) => {
                          const candidateDept = normalizeDepartment(
                            fo.department,
                          );
                          const isDepartmentMatch =
                            candidateDept === issueDepartment;
                          const isCurrentlyAssigned =
                            String(fo.profileId) ===
                            String(currentFieldOfficerProfileId);
                          const isCapacityFull =
                            Number(fo.availableCapacity ?? 0) <= 0;
                          const hasReportingMismatch =
                            fo.compatibilityWarnings?.some(
                              (warning) =>
                                String(warning)
                                  .toLowerCase()
                                  .includes("unit officer") ||
                                String(warning)
                                  .toLowerCase()
                                  .includes("reporting"),
                            );
                          const isSuitable =
                            isDepartmentMatch &&
                            !isCapacityFull &&
                            !hasReportingMismatch;
                          const isSelected =
                            String(selectedFieldOfficerId) ===
                            String(fo.profileId);
                          const isCandidateDisabled =
                            isCurrentlyAssigned || isCapacityFull;

                          const candidateCardClass = isSelected
                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:bg-indigo-950/30"
                            : isCurrentlyAssigned
                              ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20"
                              : isCapacityFull
                                ? "cursor-not-allowed border-rose-200 bg-rose-50/50 opacity-70 dark:border-rose-900/40 dark:bg-rose-950/10"
                                : isDepartmentMatch && !hasReportingMismatch
                                  ? "border-emerald-300 bg-emerald-50/50 hover:border-emerald-500 dark:border-emerald-900/50 dark:bg-emerald-950/10"
                                  : "border-amber-200 bg-amber-50/40 hover:border-amber-400 dark:border-amber-900/40 dark:bg-amber-950/10";

                          const prevCandidate = sortedFieldOfficers[idx - 1];
                          const isFirstMismatch =
                            !isDepartmentMatch &&
                            (!prevCandidate ||
                              normalizeDepartment(prevCandidate.department) ===
                                issueDepartment);

                          return (
                            <div key={fo.profileId} className="space-y-2">
                              {isFirstMismatch && (
                                <div className="pt-2 pb-1 text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-2">
                                  <span>
                                    Other Officers — Department Mismatch
                                  </span>
                                  <div className="flex-1 h-px bg-amber-200 dark:bg-amber-900/50" />
                                </div>
                              )}

                              <div
                                onClick={() => {
                                  if (!isCandidateDisabled) {
                                    setSelectedFieldOfficerId(fo.profileId);
                                  }
                                }}
                                className={`rounded-2xl border p-4 transition-all ${candidateCardClass} ${
                                  !isCandidateDisabled ? "cursor-pointer" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="radio"
                                    name="fo_candidate"
                                    checked={isSelected}
                                    disabled={isCandidateDisabled}
                                    onChange={() => {
                                      if (!isCandidateDisabled) {
                                        setSelectedFieldOfficerId(fo.profileId);
                                      }
                                    }}
                                    className="mt-1 accent-indigo-600 cursor-pointer"
                                  />

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-black text-slate-900 dark:text-white">
                                        {fo.name || fo.fullName}
                                      </p>

                                      {isCurrentlyAssigned && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300 bg-cyan-100 px-2 py-0.5 text-[9px] font-black uppercase text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300">
                                          <Shield size={10} />
                                          Current Assignment
                                        </span>
                                      )}

                                      {isSelected && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-300 bg-indigo-100 px-2 py-0.5 text-[9px] font-black uppercase text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                                          <CheckCircle size={10} />
                                          Selected Replacement
                                        </span>
                                      )}

                                      {isSuitable && !isCurrentlyAssigned && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                          <CheckCircle2 size={10} />
                                          Suitable for Issue
                                        </span>
                                      )}

                                      {!isDepartmentMatch && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                          <AlertTriangle size={10} />
                                          Department Mismatch
                                        </span>
                                      )}

                                      {hasReportingMismatch && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-[9px] font-black uppercase text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                                          <AlertTriangle size={10} />
                                          Reporting Relationship Mismatch
                                        </span>
                                      )}

                                      {isCapacityFull && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-[9px] font-black uppercase text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                                          <XCircle size={10} />
                                          Capacity Reached
                                        </span>
                                      )}

                                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[9px] font-bold text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-300">
                                        Within Scope
                                      </span>
                                    </div>

                                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                      <div>
                                        <span className="text-[9.5px] font-black uppercase text-slate-400 block">
                                          Officer Department
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                                          {formatDepartmentLabel(fo.department)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[9.5px] font-black uppercase text-slate-400 block">
                                          Required Issue Dept
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                                          {formatDepartmentLabel(
                                            issueDepartment,
                                          )}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[9.5px] font-black uppercase text-slate-400 block">
                                          Workload
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                          {fo.currentWorkload ?? 0}/
                                          {fo.maximumCapacity ?? 10}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[9.5px] font-black uppercase text-slate-400 block">
                                          Available Capacity
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                          {fo.availableCapacity ?? 0}
                                        </span>
                                      </div>
                                    </div>

                                    <p className="mt-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                      {isCurrentlyAssigned
                                        ? "This officer is currently assigned to the issue."
                                        : isCapacityFull
                                          ? "Unavailable because the officer has reached the maximum active-issue capacity."
                                          : hasReportingMismatch
                                            ? `Reporting relationship warning: ${fo.compatibilityWarnings?.join("; ") || "Officer reports to a different Unit Officer"}`
                                            : isDepartmentMatch
                                              ? "Suitable because the officer’s department matches the issue department and capacity is available."
                                              : `Not recommended because the officer belongs to ${formatDepartmentLabel(fo.department)}, while this issue requires ${formatDepartmentLabel(issueDepartment)}.`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Reassign Unit Officer Form */}
            {actionType === "reassign_unit_officer" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                  <p className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Required Issue Department
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    {formatDepartmentLabel(issueDepartment)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                    Officers from this department are prioritised as suitable
                    candidates.
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                  <p className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Currently Assigned Unit Officer
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    {currentUnitOfficer?.name ||
                      currentUnitOfficer?.fullName ||
                      "No Unit Officer Assigned"}
                  </p>
                  {currentUnitOfficer && (
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Department:{" "}
                      {formatDepartmentLabel(currentUnitOfficer.department)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Select Unit Officer Candidate (City Admin Scope:{" "}
                    {issue?.city || "Local"}) *
                  </label>
                  {isUnitOfficerLoading ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-cyan-500 font-bold">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading Unit Officer candidates...</span>
                    </div>
                  ) : sortedUnitOfficers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      No Unit Officers available in {issue?.city || "your city"}
                      .
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {sortedUnitOfficers.map((uo) => {
                        const isSelected =
                          String(selectedUnitOfficerId) ===
                          String(uo.profileId);
                        const isCurrentlyAssigned =
                          String(uo.profileId) ===
                          String(currentUnitOfficerProfileId);
                        const isDepartmentMatch =
                          normalizeDepartment(uo.department) ===
                          issueDepartment;
                        const isCapacityFull = (uo.activeIssueCount || 0) >= 10;

                        return (
                          <div
                            key={uo.profileId}
                            onClick={() => {
                              if (isCurrentlyAssigned || isCapacityFull) return;
                              setSelectedUnitOfficerId(uo.profileId);
                              setOfficerDepartmentWarning(null);
                            }}
                            className={`p-3 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 shadow-sm"
                                : isCurrentlyAssigned
                                  ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
                                  : isCapacityFull
                                    ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="selectedUnitOfficer"
                                  checked={isSelected}
                                  disabled={
                                    isCurrentlyAssigned || isCapacityFull
                                  }
                                  onChange={() => {}}
                                  className="h-4 w-4 text-cyan-600 cursor-pointer"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                      {uo.name || uo.fullName}
                                    </span>
                                    {isCurrentlyAssigned && (
                                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                        Currently Assigned
                                      </span>
                                    )}
                                    {isDepartmentMatch ? (
                                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        Suitable Match
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        Department Mismatch
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    <span>
                                      Department:{" "}
                                      {formatDepartmentLabel(uo.department)}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      Active Workload:{" "}
                                      {uo.activeIssueCount || 0} / 10
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reassign Field Officer Form */}
            {actionType === "reassign_field_officer" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                  <p className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Required Issue Department
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    {formatDepartmentLabel(issueDepartment)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                    Officers from this department are prioritised as suitable
                    candidates.
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
                  <p className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Currently Assigned Field Officer
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                    {currentFieldOfficer?.name ||
                      currentFieldOfficer?.fullName ||
                      "No Field Officer Assigned"}
                  </p>
                  {currentFieldOfficer && (
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Department:{" "}
                      {formatDepartmentLabel(currentFieldOfficer.department)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Select Field Officer Candidate (City Admin Scope:{" "}
                    {issue?.city || "Local"}) *
                  </label>
                  {isFieldOfficerLoading ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-cyan-500 font-bold">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading Field Officer candidates...</span>
                    </div>
                  ) : sortedFieldOfficers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      No Field Officers available in{" "}
                      {issue?.city || "your city"}.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {sortedFieldOfficers.map((fo) => {
                        const isSelected =
                          String(selectedFieldOfficerId) ===
                          String(fo.profileId);
                        const isCurrentlyAssigned =
                          String(fo.profileId) ===
                          String(currentFieldOfficerProfileId);
                        const isDepartmentMatch =
                          normalizeDepartment(fo.department) ===
                          issueDepartment;
                        const isCapacityFull =
                          (fo.activeIssueCount || 0) >= (fo.maxCapacity || 10);
                        const hasReportingMismatch = Boolean(
                          fo.hasReportingMismatch,
                        );

                        return (
                          <div
                            key={fo.profileId}
                            onClick={() => {
                              if (isCurrentlyAssigned || isCapacityFull) return;
                              setSelectedFieldOfficerId(fo.profileId);
                              setOfficerDepartmentWarning(null);
                            }}
                            className={`p-3 rounded-xl border transition-all ${
                              isSelected
                                ? "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 shadow-sm"
                                : isCurrentlyAssigned
                                  ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
                                  : isCapacityFull
                                    ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="selectedFieldOfficer"
                                  checked={isSelected}
                                  disabled={
                                    isCurrentlyAssigned || isCapacityFull
                                  }
                                  onChange={() => {}}
                                  className="h-4 w-4 text-cyan-600 cursor-pointer"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                      {fo.name || fo.fullName}
                                    </span>
                                    {isCurrentlyAssigned && (
                                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                                        Currently Assigned
                                      </span>
                                    )}
                                    {isDepartmentMatch ? (
                                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        Suitable Match
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        Department Mismatch
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    <span>
                                      Department:{" "}
                                      {formatDepartmentLabel(fo.department)}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      Active Workload:{" "}
                                      {fo.activeIssueCount || 0} /{" "}
                                      {fo.maxCapacity || 10}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Change Classification Form */}
            {actionType === "change_classification" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Proposed Category *
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 capitalize cursor-pointer"
                    >
                      {ISSUE_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label} ({c.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Responsible Department (Derived)
                    </label>
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-extrabold text-cyan-600 dark:text-cyan-400">
                      {formatDepartmentLabel(derivedDepartment)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Select Subcategories *
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(ISSUE_SUBCATEGORIES[selectedCategory] || []).map(
                      (sub) => {
                        const selected = selectedSubcategories.some(
                          (s) => s.toLowerCase() === sub.toLowerCase(),
                        );
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => handleToggleSubcategory(sub)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              selected
                                ? "bg-amber-500 text-white shadow-sm"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Additional Custom Subcategories
                  </label>
                  <div className="flex items-center gap-2 mb-3">
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
                      placeholder="Type subcategory and press Enter"
                      className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSubcategory}
                      className="px-3 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>

                  {selectedSubcategories.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Active Selected Subcategories Array
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSubcategories.map((sub) => (
                          <span
                            key={sub}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20"
                          >
                            <span>{sub}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleSubcategory(sub)}
                              className="hover:text-rose-500 transition-colors cursor-pointer ml-0.5"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Update Priority Form */}
            {actionType === "update_priority" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Proposed Priority *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["low", "medium", "high", "critical"].map((p) => {
                      const selected = selectedPriority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSelectedPriority(p)}
                          className={`p-2.5 rounded-xl border text-center font-black uppercase text-xs transition-all cursor-pointer ${
                            selected
                              ? p === "critical"
                                ? "bg-red-500 text-white border-red-600"
                                : p === "high"
                                  ? "bg-orange-500 text-white border-orange-600"
                                  : p === "medium"
                                    ? "bg-amber-500 text-white border-amber-600"
                                    : "bg-emerald-500 text-white border-emerald-600"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Send Message Form */}
            {actionType === "send_message" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Select Recipient *
                  </label>
                  <select
                    value={messageRecipient}
                    onChange={(e) => setMessageRecipient(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="both">
                      Both Unit Officer & Field Officer
                    </option>
                    <option value="unit_officer">Unit Officer Only</option>
                    <option value="field_officer">Field Officer Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Message Content *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter explicit operational instruction or clarification message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Approve Escalation Resolution Form */}
            {hasActiveUnresolvedEscalation && actionType === "approve" && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                This action resolves the administrative escalation. It does not
                automatically close or reject the civic issue.
              </div>
            )}

            {/* Reject Escalation Response Form */}
            {hasActiveUnresolvedEscalation &&
              actionType === "reject_response" && (
                <div className="space-y-3">
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 font-semibold">
                    <Info size={14} className="inline mr-1 -mt-0.5" />
                    This action does not reject or close the civic issue. The
                    escalation will remain active and further corrective action
                    will be required.
                  </div>
                </div>
              )}

            {/* Request Corrective Action Form */}
            {actionType === "request_action" && (
              <div className="space-y-3">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300 font-semibold">
                  <Info size={14} className="inline mr-1 -mt-0.5" />
                  This action sends an officer-only instruction. It does not
                  change the issue status, SLA status, escalation review status,
                  or escalation timeline.
                </div>

                <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 dark:border-cyan-900/50 dark:bg-cyan-950/20 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Recipients (Officers Only)
                  </p>
                  {(issue?.assignedUnitOfficer?.name ||
                    issue?.assigned_officer?.name) && (
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Unit Officer:{" "}
                      {issue?.assignedUnitOfficer?.name ||
                        issue?.assigned_officer?.name}
                    </p>
                  )}
                  {(issue?.assignedFieldOfficer?.name ||
                    issue?.field_officer?.name) && (
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Field Officer:{" "}
                      {issue?.assignedFieldOfficer?.name ||
                        issue?.field_officer?.name}
                    </p>
                  )}
                  {!issue?.assignedUnitOfficer &&
                    !issue?.assignedFieldOfficer &&
                    !issue?.assigned_officer &&
                    !issue?.field_officer && (
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        No Unit Officer or Field Officer is currently assigned.
                        Assign an officer before sending corrective
                        instructions.
                      </p>
                    )}
                  <p className="text-[10px] text-slate-500 font-medium pt-1">
                    Visibility: Officers only (Citizen will not receive this
                    notification)
                  </p>
                </div>
              </div>
            )}

            {/* Common Reason / Notes Textarea */}
            {actionType !== "send_message" && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {actionType === "approve"
                    ? "Resolution Notes *"
                    : actionType === "reject_response"
                      ? "Reason for Rejecting the Escalation Response *"
                      : actionType === "request_action"
                        ? "Corrective Instructions *"
                        : "Administrative Justification Reason *"}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    actionType === "reject_response"
                      ? "Explain why the submitted corrective action or escalation response is insufficient and what further action is required."
                      : actionType === "request_action"
                        ? "Describe the exact corrective action the assigned officers must perform."
                        : "Provide explicit operational justification or resolution notes..."
                  }
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`w-full p-3 bg-white dark:bg-slate-900 border rounded-xl text-xs font-semibold ${
                    fieldErrors.reason
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
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
            onClick={handleExecuteAction}
            disabled={
              loading ||
              (actionType === "request_action" &&
                !issue?.assignedUnitOfficer &&
                !issue?.assignedFieldOfficer &&
                !issue?.assigned_officer &&
                !issue?.field_officer)
            }
            className={`px-6 py-2.5 rounded-xl font-black text-white text-xs shadow-lg transition-all cursor-pointer ${
              loading ||
              (actionType === "request_action" &&
                !issue?.assignedUnitOfficer &&
                !issue?.assignedFieldOfficer &&
                !issue?.assigned_officer &&
                !issue?.field_officer)
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
                : "Submit Action"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}

export default CityAdminEscalationResolutionModal;
