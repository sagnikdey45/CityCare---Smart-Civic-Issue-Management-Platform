import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  X,
  Calendar,
  MapPin,
  Tag,
  Clock,
  User,
  MessageSquare,
  Save,
  XCircle,
  UserPlus,
  Shield,
  CheckCircle2,
  AlertTriangle,
  MapPinned,
  Zap,
  Search,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  Check,
  Sparkles,
  Plus,
} from "lucide-react";

function resolveIssueId(issue) {
  return issue?._id ?? issue?.issueId ?? issue?.id ?? null;
}

const ADMIN_ACTIONS = {
  ASSIGN_UO: "assign_uo",
  ASSIGN_FO: "assign_fo",
  REASSIGN_UO: "reassign_uo",
  REASSIGN_FO: "reassign_fo",
  EXTEND_SLA: "extend_sla",
  CHANGE_CLASSIFICATION: "change_classification",
  UPDATE_PRIORITY: "update_priority",
  ESCALATE: "escalate",
  REJECT: "reject",
  REWORK: "rework",
  CLOSE: "close",
  REOPEN: "reopen",
  REVOKE: "revoke",
  VIEW_EVIDENCE: "view_evidence",
};

const ACTION_META = {
  assign_uo: {
    label: "Assign Unit Officer",
    description:
      "Assign a Ward / Unit Officer to inspect and verify this issue.",
    icon: UserPlus,
    color: "from-blue-500 to-indigo-600",
    textColor: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/10 hover:bg-blue-100 dark:hover:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-900/50",
  },
  assign_fo: {
    label: "Assign Field Officer",
    description: "Assign a Field Officer to execute on-ground repairs.",
    icon: UserPlus,
    color: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/10 hover:bg-emerald-100 dark:hover:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900/50",
  },
  reassign_uo: {
    label: "Reassign Unit Officer",
    description:
      "Change the Unit Officer currently assigned to verify this issue.",
    icon: UserPlus,
    color: "from-blue-600 to-cyan-600",
    textColor: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-50 dark:bg-cyan-950/10 hover:bg-cyan-100 dark:hover:bg-cyan-950/20",
    border: "border-cyan-200 dark:border-cyan-900/50",
  },
  reassign_fo: {
    label: "Reassign Field Officer",
    description:
      "Change the Field Officer assigned to this issue's resolution.",
    icon: UserPlus,
    color: "from-teal-500 to-cyan-600",
    textColor: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-50 dark:bg-teal-950/10 hover:bg-teal-100 dark:hover:bg-teal-950/20",
    border: "border-teal-200 dark:border-teal-900/50",
  },
  extend_sla: {
    label: "Extend SLA",
    description: "Extend the current resolution deadline for this issue.",
    icon: Calendar,
    color: "from-indigo-500 to-purple-600",
    textColor: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-950/10 hover:bg-indigo-100 dark:hover:bg-indigo-950/20",
    border: "border-indigo-200 dark:border-indigo-900/50",
  },
  change_classification: {
    label: "Change Classification",
    description:
      "Change issue category and subcategories while validating officer compatibility.",
    icon: Tag,
    color: "from-purple-500 to-indigo-600",
    textColor: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-950/10 hover:bg-purple-100 dark:hover:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-900/50",
  },
  update_priority: {
    label: "Update Priority",
    description: "Change the operational priority of this issue.",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    textColor: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/10 hover:bg-amber-100 dark:hover:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900/50",
  },
  reject: {
    label: "Reject Issue",
    description: "Decline this issue report. Reporter will be notified.",
    icon: XCircle,
    color: "from-red-500 to-rose-600",
    textColor: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-950/10 hover:bg-red-100 dark:hover:bg-red-950/20",
    border: "border-red-200 dark:border-red-900/50",
  },
  rework: {
    label: "Request Rework",
    description: "Flag work as incomplete and return to Field Officer.",
    icon: AlertTriangle,
    color: "from-orange-500 to-amber-600",
    textColor: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-orange-950/10 hover:bg-orange-100 dark:hover:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-900/50",
  },
  close: {
    label: "Close Issue",
    description: "Mark issue as permanently resolved and closed.",
    icon: CheckCircle2,
    color: "from-emerald-600 to-green-600",
    textColor: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/10 hover:bg-emerald-100 dark:hover:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900/50",
  },
  reopen: {
    label: "Reopen Issue",
    description: "Reopen resolved issue to pending verification status.",
    icon: Clock,
    color: "from-purple-500 to-violet-600",
    textColor: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-950/10 hover:bg-purple-100 dark:hover:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-900/50",
  },
  revoke: {
    label: "Revoke Assignment",
    description:
      "Unassign current officer and return issue to unassigned queue.",
    icon: XCircle,
    color: "from-amber-600 to-red-600",
    textColor: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/10 hover:bg-amber-100 dark:hover:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900/50",
  },
  escalate: {
    label: "Escalate Issue",
    description:
      "Escalate to admin control queue, flagged for critical attention.",
    icon: AlertTriangle,
    color: "from-rose-600 to-red-700",
    textColor: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/10 hover:bg-rose-100 dark:hover:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-900/50",
  },
  view_evidence: {
    label: "View Evidence",
    description:
      "Examine resolution details, notes and photos uploaded by Field Officer.",
    icon: MapPinned,
    color: "from-teal-600 to-emerald-600",
    textColor: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-50 dark:bg-teal-950/10 hover:bg-teal-100 dark:hover:bg-teal-950/20",
    border: "border-teal-200 dark:border-teal-900/50",
  },
};

const ISSUE_CATEGORIES = [
  { value: "road", label: "Road & Infrastructure", icon: "🛣️" },
  { value: "electricity", label: "Electricity & Lighting", icon: "⚡" },
  { value: "water", label: "Water Supply", icon: "💧" },
  { value: "sanitation", label: "Sanitation & Hygiene", icon: "🧹" },
  { value: "drainage", label: "Drainage & Sewerage", icon: "🌊" },
  { value: "solid_waste", label: "Solid Waste Management", icon: "🗑️" },
  { value: "public_health", label: "Public Health & Safety", icon: "🏥" },
  { value: "other", label: "Other Civic Issues", icon: "📦" },
];

const SUBCATEGORIES_BY_CATEGORY = {
  road: [
    "Pothole",
    "Damaged Asphalt",
    "Manhole Issue",
    "Pavement Damage",
    "Street Name Board",
    "Footpath Repair",
  ],
  electricity: [
    "Streetlight Outage",
    "Flickering Light",
    "Exposed Wiring",
    "Transformer Issue",
    "Power Cable Failure",
  ],
  water: [
    "Pipe Leakage",
    "Low Water Pressure",
    "Contaminated Water",
    "No Water Supply",
    "Valve Damage",
  ],
  sanitation: [
    "Public Toilet Cleaning",
    "Garbage Overflow",
    "Sewage Overflow",
    "Street Sweeping",
    "Dead Animal Removal",
  ],
  drainage: [
    "Blocked Drain",
    "Drain Cover Broken",
    "Stormwater Overflow",
    "Sewer Line Leakage",
  ],
  solid_waste: [
    "Uncollected Trash",
    "Illegal Dumping",
    "Bin Replacement",
    "Debris Clearance",
  ],
  public_health: [
    "Stray Dog Control",
    "Mosquito Fogging",
    "Fumigation Drive",
    "Hazardous Waste",
  ],
  other: ["General Inquiry", "Unspecified Civic Concern"],
};

const PRIORITY_OPTIONS = [
  {
    value: "low",
    label: "Low",
    bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300",
  },
  {
    value: "medium",
    label: "Medium",
    bg: "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-400",
  },
  {
    value: "high",
    label: "High",
    bg: "bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 border-orange-400",
  },
  {
    value: "critical",
    label: "Critical",
    bg: "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-400",
  },
];

const rejectionReasons = [
  "Duplicate Report",
  "Insufficient Information / Unclear Evidence",
  "Out of Municipal Jurisdiction",
  "Invalid / Fraudulent Complaint",
  "Already Resolved by Local Team",
];

const reworkReasons = [
  "Incomplete Physical Repairs",
  "Substandard Quality of Work",
  "Insufficient Photo Evidence",
  "Citizen Feedback Unresolved",
];

const escalationCategories = [
  { value: "sla_breach", label: "SLA Deadline Breach" },
  { value: "officer_unresponsive", label: "Assigned Officer Unresponsive" },
  { value: "resource_shortage", label: "Resource / Equipment Shortage" },
  { value: "public_safety_risk", label: "Public Safety Emergency" },
  { value: "inter_departmental_delay", label: "Inter-Departmental Delay" },
];

const statusStyles = {
  pending: {
    label: "Pending Verification",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    icon: Clock,
  },
  verified: {
    label: "Verified",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: Shield,
  },
  assigned: {
    label: "Assigned to FO",
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/30",
    icon: User,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    icon: Clock,
  },
  pending_uo_verification: {
    label: "Pending UO Verification",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/30",
    icon: AlertTriangle,
  },
  rework_required: {
    label: "Rework Required",
    color: "bg-red-500/10 text-red-500 border-red-500/30",
    icon: AlertTriangle,
  },
  resolved: {
    label: "Resolved",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    color: "bg-slate-500/10 text-slate-500 border-slate-500/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-500 border-red-500/30",
    icon: XCircle,
  },
  escalated: {
    label: "Escalated",
    color: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    icon: AlertTriangle,
  },
};

const statusLabels = {
  pending: "Pending Verification",
  verified: "Verified",
  assigned: "Assigned to FO",
  in_progress: "In Progress",
  pending_uo_verification: "Pending UO Verification",
  rework_required: "Rework Required",
  resolved: "Resolved",
  closed: "Closed",
  rejected: "Rejected",
  escalated: "Escalated",
};

function normalizeOfficer(officerData, fallback = {}) {
  if (!officerData) return null;
  if (typeof officerData === "string") {
    return {
      id: officerData,
      name: fallback.name || "Assigned Officer",
      email: fallback.email || "",
      department: fallback.department || "General",
    };
  }
  return {
    id: officerData._id || officerData.userId || fallback.id || "",
    name:
      officerData.fullName ||
      officerData.name ||
      fallback.name ||
      "Assigned Officer",
    email: officerData.email || fallback.email || "",
    department: officerData.department || fallback.department || "General",
  };
}

function formatCategory(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value) {
  if (!value) return "No deadline configured";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "No deadline configured";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getValidActions(issue) {
  const status = String(issue?.status || "")
    .trim()
    .toLowerCase();
  const hasUo = Boolean(issue?.assignedUnitOfficer);
  const hasFo = Boolean(issue?.assignedFieldOfficer);

  switch (status) {
    case "pending":
    case "reopened":
      return [
        hasUo ? "reassign_uo" : "assign_uo",
        "change_classification",
        "update_priority",
        "escalate",
      ];

    case "verified":
      return [
        hasUo ? "reassign_uo" : "assign_uo",
        hasFo ? "reassign_fo" : "assign_fo",
        "extend_sla",
        "change_classification",
        "update_priority",
        "reject",
        "escalate",
      ];

    case "assigned":
    case "in_progress":
      return [
        "reassign_uo",
        "reassign_fo",
        "extend_sla",
        "change_classification",
        "update_priority",
        "revoke",
        "escalate",
      ];

    case "pending_uo_verification":
      return [
        "view_evidence",
        "reassign_uo",
        "reassign_fo",
        "extend_sla",
        "update_priority",
        "escalate",
      ];

    case "rework_required":
      return [
        "reassign_uo",
        "reassign_fo",
        "extend_sla",
        "change_classification",
        "update_priority",
        "escalate",
      ];

    case "resolved":
      return ["close", "reopen"];

    case "escalated":
      return [];

    case "closed":
    case "rejected":
    case "withdrawn":
    default:
      return [];
  }
}

export function AdminIssueModal({
  issue,
  adminUserId,
  onClose,
  onUpdated,
  onOpenEscalation,
}) {
  const [step, setStep] = useState(1); // 1 = Summary, 2 = Actions, 3 = Form, 4 = Confirmation
  const [selectedAction, setSelectedAction] = useState(null);

  // Form states
  const [selectedOfficerUserId, setSelectedOfficerUserId] = useState("");
  const [officerSearch, setOfficerSearch] = useState("");
  const [rejectionCategory, setRejectionCategory] = useState("");
  const [reworkReason, setReworkReason] = useState("");
  const [commentText, setCommentText] = useState("");
  const [newSlaDeadline, setNewSlaDeadline] = useState("");

  // Dropdown UI toggles
  const [rejectionDropdownOpen, setRejectionDropdownOpen] = useState(false);
  const [reworkDropdownOpen, setReworkDropdownOpen] = useState(false);
  const [escalationCategoryDropdownOpen, setEscalationCategoryDropdownOpen] =
    useState(false);

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

  // Escalation Form states
  const [escalationCategory, setEscalationCategory] = useState("");
  const [escalationPriority, setEscalationPriority] = useState("medium");

  // Confirmation prompts
  const [pendingClassificationPayload, setPendingClassificationPayload] =
    useState(null);
  const [incompatibleOfficerPrompt, setIncompatibleOfficerPrompt] =
    useState(null);

  // System States
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Active escalation check
  const isEscalationActive =
    issue?.escalation?.isActive === true ||
    (issue?.escalatedToAdmin === true && issue?.escalation?.resolved !== true);

  // SLA Deadline resolution
  const currentSlaDeadline =
    issue?.sla?.deadline ?? issue?.slaDeadline ?? issue?.sla_deadline ?? null;

  const minimumSlaDateTime = useMemo(() => {
    const base = currentSlaDeadline
      ? Number(currentSlaDeadline) + 60000
      : Date.now() + 60000;
    return new Date(base).toISOString().slice(0, 16);
  }, [currentSlaDeadline]);

  // Candidate Query for UO / FO Reassignment
  const isUnitOfficerAction =
    selectedAction === "assign_uo" || selectedAction === "reassign_uo";
  const isFieldOfficerAction =
    selectedAction === "assign_fo" || selectedAction === "reassign_fo";
  const isOfficerAction = isUnitOfficerAction || isFieldOfficerAction;

  const selectedOfficerRole = isUnitOfficerAction
    ? "unit_officer"
    : isFieldOfficerAction
      ? "field_officer"
      : null;
  const selectedOfficerType = selectedOfficerRole;

  const issueId = resolveIssueId(issue);

  const officerCandidatesQuery = useQuery(
    api.admin.getAssignableOfficers,
    issueId && selectedOfficerType
      ? {
          issueId,
          officerType: selectedOfficerType,
        }
      : "skip",
  );

  const officerQueryLoading =
    isOfficerAction && officerCandidatesQuery === undefined;

  const rawOfficerCandidates = Array.isArray(officerCandidatesQuery?.candidates)
    ? officerCandidatesQuery.candidates
    : [];

  const currentOfficer = officerCandidatesQuery?.currentOfficer ?? null;

  // Filter candidates client-side safely
  const filteredOfficers = useMemo(() => {
    if (!isOfficerAction) return [];
    const query = officerSearch.trim().toLowerCase();
    if (!query) return rawOfficerCandidates;

    return rawOfficerCandidates.filter((officer) => {
      const name = officer.name ?? officer.fullName ?? "";
      return [name, officer.email, officer.department, officer.city].some(
        (value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
      );
    });
  }, [isOfficerAction, rawOfficerCandidates, officerSearch]);

  const selectedOfficerProfile = useMemo(() => {
    return (
      rawOfficerCandidates.find((o) => o.userId === selectedOfficerUserId) ??
      null
    );
  }, [rawOfficerCandidates, selectedOfficerUserId]);

  // Shared Mutations
  const assignIssueMut = useMutation(api.admin.adminAssignIssue);
  const reassignIssueMut = useMutation(api.admin.adminReassignIssue);
  const rejectIssueMut = useMutation(api.admin.adminRejectIssue);
  const extendSlaMut = useMutation(api.admin.adminExtendSLA);
  const sendReworkMut = useMutation(api.admin.adminSendForRework);
  const closeIssueMut = useMutation(api.admin.adminCloseIssue);
  const escalateIssueMut = useMutation(api.admin.adminEscalateIssue);
  const reopenIssueMut = useMutation(api.admin.adminReopenIssue);
  const changeClassificationMut = useMutation(
    api.escalation.changeIssueClassification,
  );
  const updatePriorityMut = useMutation(api.escalation.updateIssuePriority);

  // Reset candidate selection & classification prompt when action or issue changes
  useEffect(() => {
    setSelectedOfficerUserId("");
    setOfficerSearch("");
    setIncompatibleOfficerPrompt(null);
    setPendingClassificationPayload(null);
  }, [selectedAction, issueId]);

  // Reset states on issue change
  useEffect(() => {
    if (issue) {
      setStep(1);
      setSelectedAction(null);
      setSelectedOfficerUserId("");
      setOfficerSearch("");
      setRejectionCategory("");
      setReworkReason("");
      setCommentText("");
      setNewSlaDeadline("");
      setEscalationCategory("");
      setEscalationPriority("medium");
      setIncompatibleOfficerPrompt(null);
      setPendingClassificationPayload(null);
      setSuccessMsg("");
      setErrorMsg("");
      setSelectedCategory(issue.category || "road");
      setSelectedSubcategories(
        Array.isArray(issue.subcategory)
          ? issue.subcategory
          : issue.subcategory
            ? [issue.subcategory]
            : [],
      );
      setSelectedPriority(issue.priority || issue.severity || "medium");
    }
  }, [issue]);

  if (!issue) return null;

  // Normalized Officers
  const currentUnitOfficer = normalizeOfficer(
    issue.assignedUnitOfficer ?? issue.assigned_officer,
    { name: issue.assignedUnitOfficerName },
  );
  const currentFieldOfficer = normalizeOfficer(
    issue.assignedFieldOfficer ?? issue.field_officer,
    { name: issue.assignedFieldOfficerName },
  );

  const validActions = getValidActions(issue);
  const isReadOnly = validActions.length === 0;

  const currentStatusStyle = statusStyles[issue.status] || statusStyles.pending;
  const categoryItem = ISSUE_CATEGORIES.find(
    (c) => c.value === issue.category,
  ) || {
    label: formatCategory(issue.category),
    icon: "📋",
  };

  const isSlaBreached =
    currentSlaDeadline &&
    currentSlaDeadline < Date.now() &&
    !["resolved", "closed", "rejected", "withdrawn"].includes(issue.status);

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
    if (trimmed && !selectedSubcategories.includes(trimmed)) {
      setSelectedSubcategories((prev) => [...prev, trimmed]);
      setCustomSubcategoryInput("");
    }
  };

  const handleActionClick = (actionKey) => {
    setSelectedAction(actionKey);
    setErrorMsg("");

    if (actionKey === "extend_sla") {
      const defaultNext = currentSlaDeadline
        ? new Date(Number(currentSlaDeadline) + 24 * 3600 * 1000)
            .toISOString()
            .slice(0, 16)
        : new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16);
      setNewSlaDeadline(defaultNext);
    } else if (actionKey === "change_classification") {
      setSelectedCategory(issue.category || "road");
      setSelectedSubcategories(
        Array.isArray(issue.subcategory)
          ? issue.subcategory
          : issue.subcategory
            ? [issue.subcategory]
            : [],
      );
    } else if (actionKey === "update_priority") {
      setSelectedPriority(issue.priority || issue.severity || "medium");
    }

    setStep(3);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (isOfficerAction) {
      if (!selectedOfficerUserId) {
        setErrorMsg(
          `Please select an eligible ${isUnitOfficerAction ? "Unit Officer" : "Field Officer"}.`,
        );
        return;
      }
    }

    if (selectedAction === "extend_sla") {
      if (!currentSlaDeadline) {
        setErrorMsg(
          "This issue does not currently have an SLA deadline to extend.",
        );
        return;
      }
      if (!newSlaDeadline) {
        setErrorMsg("Please select a new SLA deadline.");
        return;
      }
      const nextDeadline = new Date(newSlaDeadline).getTime();
      if (
        !Number.isFinite(nextDeadline) ||
        nextDeadline <= Number(currentSlaDeadline)
      ) {
        setErrorMsg(
          "The new SLA deadline must be later than the current deadline.",
        );
        return;
      }
      if (!commentText.trim()) {
        setErrorMsg("Please provide a reason for extending the SLA.");
        return;
      }
    }

    if (selectedAction === "change_classification") {
      if (!selectedCategory) {
        setErrorMsg("Please select a category.");
        return;
      }
      if (!commentText.trim()) {
        setErrorMsg("Please provide a reason for changing classification.");
        return;
      }
    }

    if (selectedAction === "update_priority") {
      if (!selectedPriority) {
        setErrorMsg("Please select a priority level.");
        return;
      }
      if (!commentText.trim()) {
        setErrorMsg("Please provide a reason for updating the priority.");
        return;
      }
    }

    if (selectedAction === "reject") {
      if (!rejectionCategory) {
        setErrorMsg("Please select a rejection category.");
        return;
      }
      if (commentText.length < 30) {
        setErrorMsg("Rejection reason must be at least 30 characters long.");
        return;
      }
    }

    if (selectedAction === "rework") {
      if (!reworkReason) {
        setErrorMsg("Please select a rework reason category.");
        return;
      }
      if (!commentText.trim()) {
        setErrorMsg("Please provide specific rework instructions.");
        return;
      }
    }

    if (selectedAction === "escalate") {
      if (!escalationCategory) {
        setErrorMsg("Please select an escalation category.");
        return;
      }
      if (commentText.length < 50) {
        setErrorMsg("Escalation reason must be at least 50 characters long.");
        return;
      }
    }

    if (["close", "reopen", "revoke"].includes(selectedAction)) {
      if (!commentText.trim()) {
        setErrorMsg(
          `Please provide a reason for executing this ${selectedAction} operation.`,
        );
        return;
      }
    }

    setStep(4);
  };

  const confirmClassificationWithClear = async () => {
    if (!pendingClassificationPayload) return;
    const currentIssueId = resolveIssueId(issue);
    if (!currentIssueId) {
      setErrorMsg(
        "Unable to perform this action because the issue identifier is missing.",
      );
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await changeClassificationMut({
        ...pendingClassificationPayload,
        issueId: currentIssueId,
        confirmClearIncompatibleOfficers: true,
      });

      if (!res?.success) {
        throw new Error(res?.message ?? "Unable to change classification.");
      }

      setIncompatibleOfficerPrompt(null);
      setPendingClassificationPayload(null);
      const clearedCount = res?.clearedOfficers?.length ?? 0;
      if (clearedCount > 0) {
        setSuccessMsg(
          `Classification updated successfully. ${clearedCount} incompatible officer assignment${clearedCount > 1 ? "s were" : " was"} cleared.`,
        );
      } else {
        setSuccessMsg(
          "Classification updated successfully. Existing officer assignments remain compatible.",
        );
      }
      setTimeout(() => {
        if (onUpdated) onUpdated();
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      setErrorMsg(error?.message ?? "Failed to change classification.");
    } finally {
      setLoading(false);
    }
  };

  const executeTransaction = async (confirmClear = false) => {
    if (!issue || !selectedAction) return;

    const currentIssueId = resolveIssueId(issue);
    if (!currentIssueId) {
      setErrorMsg(
        "Unable to perform this action because the issue identifier is missing.",
      );
      console.error(
        "AdminIssueModal received an issue without a Convex issue ID:",
        issue,
      );
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (selectedAction === "assign_uo" || selectedAction === "assign_fo") {
        if (!selectedOfficerRole) {
          setErrorMsg("Officer role could not be determined for assignment.");
          setLoading(false);
          return;
        }
        await assignIssueMut({
          issueId: currentIssueId,
          officerUserId: selectedOfficerUserId,
          role: selectedOfficerRole,
          adminUserId,
          comment: commentText.trim() || undefined,
        });
        setSuccessMsg(
          `${isUnitOfficerAction ? "Unit Officer" : "Field Officer"} assigned successfully.`,
        );
      } else if (
        selectedAction === "reassign_uo" ||
        selectedAction === "reassign_fo"
      ) {
        if (!selectedOfficerRole) {
          setErrorMsg("Officer role could not be determined for reassignment.");
          setLoading(false);
          return;
        }
        await reassignIssueMut({
          issueId: currentIssueId,
          newOfficerUserId: selectedOfficerUserId,
          role: selectedOfficerRole,
          adminUserId,
          reason:
            commentText.trim() ||
            `The ${isUnitOfficerAction ? "Unit Officer" : "Field Officer"} is being reassigned.`,
          comment: commentText.trim() || undefined,
        });
        setSuccessMsg(
          `${isUnitOfficerAction ? "Unit Officer" : "Field Officer"} reassigned successfully.`,
        );
      } else if (selectedAction === "extend_sla") {
        await extendSlaMut({
          issueId: currentIssueId,
          adminUserId,
          newDeadline: new Date(newSlaDeadline).getTime(),
          reason: commentText.trim(),
        });
        setSuccessMsg("SLA deadline extended successfully.");
      } else if (selectedAction === "change_classification") {
        const classificationPayload = {
          issueId: currentIssueId,
          adminUserId,
          newCategory: selectedCategory,
          newSubcategories: selectedSubcategories,
          notes: commentText.trim(),
          confirmClearIncompatibleOfficers: confirmClear,
        };

        setPendingClassificationPayload(classificationPayload);

        const res = await changeClassificationMut(classificationPayload);

        if (
          res?.code === "INCOMPATIBLE_OFFICERS_CONFIRMATION_REQUIRED" ||
          res?.requiresConfirmation === true
        ) {
          setIncompatibleOfficerPrompt({
            newClassification: res.newClassification,
            officers: res.incompatibleOfficers ?? [],
          });
          setLoading(false);
          return;
        }

        if (!res?.success) {
          throw new Error(res?.message ?? "Unable to change classification.");
        }

        setIncompatibleOfficerPrompt(null);
        setPendingClassificationPayload(null);
        const clearedCount = res?.clearedOfficers?.length ?? 0;
        if (clearedCount > 0) {
          setSuccessMsg(
            `Classification updated successfully. ${clearedCount} incompatible officer assignment${clearedCount > 1 ? "s were" : " was"} cleared.`,
          );
        } else {
          setSuccessMsg(
            "Classification updated successfully. All assignments remain compatible.",
          );
        }
      } else if (selectedAction === "update_priority") {
        await updatePriorityMut({
          issueId: currentIssueId,
          priority: selectedPriority,
          notes: commentText.trim(),
          adminUserId,
        });
        setSuccessMsg("Issue priority updated successfully.");
      } else if (selectedAction === "reject") {
        await rejectIssueMut({
          issueId: currentIssueId,
          adminUserId,
          rejectionCategory,
          reason: commentText.trim(),
        });
        setSuccessMsg("Issue report rejected.");
      } else if (selectedAction === "rework") {
        await sendReworkMut({
          issueId: currentIssueId,
          adminUserId,
          reworkReason,
          notes: commentText.trim(),
        });
        setSuccessMsg("Issue returned for rework.");
      } else if (selectedAction === "close") {
        await closeIssueMut({
          issueId: currentIssueId,
          adminUserId,
          notes: commentText.trim(),
        });
        setSuccessMsg("Issue closed permanently.");
      } else if (selectedAction === "reopen") {
        await reopenIssueMut({
          issueId: currentIssueId,
          adminUserId,
          notes: commentText.trim(),
        });
        setSuccessMsg("Issue reopened.");
      } else if (selectedAction === "escalate") {
        await escalateIssueMut({
          issueId: currentIssueId,
          adminUserId,
          escalationCategory,
          priority: escalationPriority,
          reason: commentText.trim(),
        });
        setSuccessMsg("Issue escalated to admin queue.");
      }

      setLoading(false);
      setTimeout(() => {
        if (onUpdated) onUpdated();
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error(`Failed to execute ${selectedAction}:`, err);
      setErrorMsg(
        err.message || `Failed to execute ${selectedAction} operation.`,
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-6 bg-white dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center font-black">
              {categoryItem.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-slate-800 dark:text-white leading-tight">
                  {issue.issueCode || "ISSUE"}
                </h2>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${currentStatusStyle.color}`}
                >
                  {currentStatusStyle.label}
                </span>
                {isSlaBreached && (
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-red-500/10 text-red-600 border border-red-500/30">
                    SLA Breached
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-lg mt-0.5">
                {issue.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* MESSAGES */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-semibold shrink-0">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shrink-0">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ACTIVE ESCALATION BANNER */}
        {isEscalationActive && (
          <div className="mx-6 mt-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <AlertTriangle
                className="text-amber-600 dark:text-amber-400 shrink-0"
                size={20}
              />
              <div>
                <h4 className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                  Active Escalation Protocol
                </h4>
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  This issue has an open escalation. Resolution must be handled
                  through the Escalation Hub.
                </p>
              </div>
            </div>
            {onOpenEscalation && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEscalation(issue);
                }}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0"
              >
                Resolve Escalation
              </button>
            )}
          </div>
        )}

        {/* MAIN BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Issue Overview */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Details Card */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Issue Description
                    </h3>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                      {issue.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <MapPin size={12} /> Location & City
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {issue.location || "City Location"} (
                        {issue.city || "Unknown City"})
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <Calendar size={12} /> SLA Deadline
                      </span>
                      <p
                        className={`text-xs font-bold ${isSlaBreached ? "text-red-500" : "text-slate-800 dark:text-white"}`}
                      >
                        {formatDateTime(currentSlaDeadline)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Officer Status Sidebar */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Assigned Officers
                    </span>

                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                          Unit Officer
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {currentUnitOfficer?.name || "Unassigned"}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 block">
                          Field Officer
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                          {currentFieldOfficer?.name || "Unassigned"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Classification
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 text-[10px] font-black bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-lg">
                        {categoryItem.label}
                      </span>
                      {selectedSubcategories.map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER BUTTON */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                {isReadOnly ? (
                  <div className="text-xs font-bold text-slate-400 italic">
                    This issue is in status '{issue.status.toUpperCase()}' and
                    is now closed to administrative changes.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2"
                  >
                    <span>Proceed to Recommended Actions</span>
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Recommended Actions Selector */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-500" size={18} />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Recommended Interventions for{" "}
                  {statusLabels[issue.status] || issue.status} Status
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {validActions.map((actionKey, index) => {
                  const meta = ACTION_META[actionKey];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  const isThirdOfThree =
                    validActions.length === 3 && index === 2;
                  return (
                    <button
                      key={actionKey}
                      type="button"
                      onClick={() => handleActionClick(actionKey)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-start gap-4 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 group ${meta.bg} ${meta.border} ${isThirdOfThree ? "md:col-span-2" : ""}`}
                    >
                      <div
                        className={`p-3.5 bg-gradient-to-br ${meta.color} rounded-xl shadow-md text-white flex-shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <Icon size={22} />
                      </div>
                      <div>
                        <h4
                          className={`font-extrabold text-sm mb-1 uppercase tracking-wider ${meta.textColor}`}
                        >
                          {meta.label}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                          {meta.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl text-sm transition-all"
                >
                  Back to Summary
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Action Form Context */}
          {step === 3 && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Form Action Title Card */}
              {(() => {
                const meta = ACTION_META[selectedAction];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <div
                    className={`p-4 rounded-xl border ${meta.bg} ${meta.border} flex items-center gap-3 shadow-inner`}
                  >
                    <div
                      className={`p-2 bg-gradient-to-br ${meta.color} rounded-lg text-white`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4
                        className={`font-extrabold text-sm ${meta.textColor}`}
                      >
                        {meta.label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Please fill in the necessary fields to record this
                        action.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* DYNAMIC FORMS */}

              {/* 1. Assign or Reassign Officer Selectors */}
              {isOfficerAction && (
                <div className="space-y-4">
                  {(selectedAction === "reassign_uo" ||
                    selectedAction === "reassign_fo") && (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Current Officer Assignment
                      </span>
                      {currentOfficer ||
                      (isUnitOfficerAction
                        ? currentUnitOfficer
                        : currentFieldOfficer) ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-extrabold text-xs text-slate-800 dark:text-white">
                              {currentOfficer?.name ??
                                currentOfficer?.fullName ??
                                (isUnitOfficerAction
                                  ? currentUnitOfficer?.name
                                  : currentFieldOfficer?.name) ??
                                "Assigned Officer"}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Department:{" "}
                              {currentOfficer?.department ??
                                (isUnitOfficerAction
                                  ? currentUnitOfficer?.department
                                  : currentFieldOfficer?.department) ??
                                "General"}{" "}
                              • City:{" "}
                              {currentOfficer?.city ?? issue.city ?? "Unknown"}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-lg">
                            Reassignment Required
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs italic text-slate-400">
                          No officer currently assigned
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                      {selectedAction.startsWith("reassign")
                        ? "Select Replacement Officer"
                        : "Select Officer Candidate"}
                    </label>
                    <span className="text-[11px] font-bold text-slate-400">
                      Required City: {issue.city || "Unknown"} • Required Dept:{" "}
                      {formatCategory(issue.category || issue.department)}
                    </span>
                  </div>

                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={18}
                    />
                    <input
                      type="text"
                      value={officerSearch}
                      onChange={(e) => setOfficerSearch(e.target.value)}
                      placeholder="Search candidate by name, email, department..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-xs shadow-sm"
                    />
                  </div>

                  {officerQueryLoading ? (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3">
                      <Loader2
                        className="animate-spin text-emerald-500"
                        size={32}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Fetching eligible officers...
                      </span>
                    </div>
                  ) : filteredOfficers.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl space-y-1 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        No eligible{" "}
                        {isUnitOfficerAction
                          ? "Unit Officers"
                          : "Field Officers"}{" "}
                        are available for this issue.
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Required Department:{" "}
                        {formatCategory(issue?.category || issue?.department)} •
                        Required City: {issue?.city || "Unknown"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {filteredOfficers.map((off) => {
                        const isSelected = selectedOfficerUserId === off.userId;
                        const officerName =
                          off.name ?? off.fullName ?? "Officer";
                        const max =
                          off.maximumCapacity ?? off.maxIssueCapacity ?? 10;
                        const active =
                          off.currentWorkload ?? off.currentActiveIssues ?? 0;
                        const isAtCap = off.isAtCapacity || active >= max;

                        return (
                          <div
                            key={off.userId || off._id}
                            onClick={() => {
                              if (!isAtCap) {
                                setSelectedOfficerUserId(off.userId);
                              }
                            }}
                            className={`p-3.5 rounded-xl border-2 transition-all ${
                              isAtCap
                                ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                                : isSelected
                                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md cursor-pointer"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-extrabold text-xs text-slate-900 dark:text-white">
                                  {officerName}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  {off.department} • {off.city}
                                </p>
                              </div>
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                                  isAtCap
                                    ? "bg-red-100 text-red-700"
                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                }`}
                              >
                                {isAtCap ? "At Capacity" : "Eligible"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                              <span>
                                Workload: {active} / {max}
                              </span>
                              {off.rating !== undefined && (
                                <span>★ {off.rating}</span>
                              )}
                              {off.efficiencyScore !== undefined && (
                                <span>Eff: {off.efficiencyScore}%</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Assignment Instructions / Comment
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      placeholder="Add coordination guidelines or assignment explanation..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-xs shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* 2. SLA Extension Form */}
              {selectedAction === "extend_sla" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Current SLA Deadline
                    </label>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {formatDateTime(currentSlaDeadline)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      New SLA Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      value={newSlaDeadline}
                      onChange={(e) => setNewSlaDeadline(e.target.value)}
                      min={minimumSlaDateTime}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-sm shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Extension Reason *
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="Explain why the SLA needs to be extended..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 3. Change Classification Form */}
              {selectedAction === "change_classification" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Current Classification
                    </label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 rounded-lg">
                        {categoryItem.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {selectedSubcategories.join(", ") || "No subcategory"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      New Category *
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedSubcategories([]);
                      }}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm shadow-sm"
                    >
                      {ISSUE_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Subcategories
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(SUBCATEGORIES_BY_CATEGORY[selectedCategory] || []).map(
                        (sub) => {
                          const isChecked = selectedSubcategories.includes(sub);
                          return (
                            <button
                              type="button"
                              key={sub}
                              onClick={() => handleToggleSubcategory(sub)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                isChecked
                                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                  : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400"
                              }`}
                            >
                              {sub}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSubcategoryInput}
                        onChange={(e) =>
                          setCustomSubcategoryInput(e.target.value)
                        }
                        placeholder="Add custom subcategory..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSubcategory}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>

                  {/* Officer Compatibility Preview */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-xl space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                      Officer Compatibility Preview
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                      <div>
                        UO:{" "}
                        {currentUnitOfficer
                          ? currentUnitOfficer.name
                          : "None assigned"}
                      </div>
                      <div>
                        FO:{" "}
                        {currentFieldOfficer
                          ? currentFieldOfficer.name
                          : "None assigned"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Reason for Reclassification *
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="Explain why the classification is being changed..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-semibold text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 4. Update Priority Form */}
              {selectedAction === "update_priority" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Current Priority
                    </label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-lg">
                        {issue.priority || issue.severity || "Medium"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      New Priority *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PRIORITY_OPTIONS.map((p) => {
                        const isSelected = selectedPriority === p.value;
                        return (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setSelectedPriority(p.value)}
                            className={`py-3 text-center rounded-xl border-2 font-bold text-xs uppercase transition-all ${
                              isSelected
                                ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-300 shadow-sm"
                                : `${p.bg} hover:border-amber-400`
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Reason for Priority Change *
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="Explain why the issue priority is changing..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-semibold text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 5. Reject Form */}
              {selectedAction === "reject" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Rejection Category *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setRejectionDropdownOpen(!rejectionDropdownOpen)
                        }
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold text-sm shadow-sm flex items-center justify-between text-left"
                      >
                        <span
                          className={
                            rejectionCategory
                              ? "text-slate-800 dark:text-white"
                              : "text-slate-400 dark:text-slate-500"
                          }
                        >
                          {rejectionCategory ||
                            "Select rejection reason category..."}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${rejectionDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {rejectionDropdownOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                          {rejectionReasons.map((reason) => (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => {
                                setRejectionCategory(reason);
                                setRejectionDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                                rejectionCategory === reason
                                  ? "bg-red-50 dark:bg-red-950/20 text-red-600"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Detailed Reason * (Minimum 30 characters)
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="Please write a detailed explanation why this issue report is rejected..."
                      className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all font-semibold text-sm shadow-sm ${
                        commentText.length < 30
                          ? "border-red-200 focus:ring-red-500"
                          : "border-emerald-300 focus:ring-emerald-500"
                      }`}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider ${commentText.length < 30 ? "text-red-500 animate-pulse" : "text-emerald-600"}`}
                      >
                        Characters count: {commentText.length} / 30 minimum
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Rework Form */}
              {selectedAction === "rework" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Rework Category / Cause *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setReworkDropdownOpen(!reworkDropdownOpen)
                        }
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-sm shadow-sm flex items-center justify-between text-left"
                      >
                        <span
                          className={
                            reworkReason
                              ? "text-slate-800 dark:text-white"
                              : "text-slate-400 dark:text-slate-500"
                          }
                        >
                          {reworkReason || "Select a rework reason..."}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${reworkDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {reworkDropdownOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                          {reworkReasons.map((reason) => (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => {
                                setReworkReason(reason);
                                setReworkDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                                reworkReason === reason
                                  ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Rework Instructions *
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="Detail specific corrections, failures or guidelines the Field Officer must perform..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-semibold text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 7. View Evidence */}
              {selectedAction === "view_evidence" && (
                <div className="space-y-5 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">
                      Ground Officer Resolution Notes
                    </span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed italic">
                      {issue.notes ||
                        "No resolution description comments provided by the officer."}
                    </p>
                  </div>

                  {issue.afterPhotos && issue.afterPhotos.length > 0 ? (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">
                        Resolution Evidence Photos
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        {issue.afterPhotos.map((photo, index) => (
                          <div
                            key={index}
                            className="rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 group relative"
                          >
                            <img
                              src={photo}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                      No evidence photos uploaded.
                    </div>
                  )}

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-300 text-xs font-semibold leading-relaxed">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    <span>
                      Based on this evidence, you should choose to either close
                      the issue permanently or return it for rework.
                    </span>
                  </div>
                </div>
              )}

              {/* 8. Close, Revoke or Reopen Forms */}
              {(selectedAction === "close" ||
                selectedAction === "revoke" ||
                selectedAction === "reopen") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Reason / Comments *
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder={`Provide full context and log notes for executing this ${selectedAction} operation...`}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* 9. Escalate Form */}
              {selectedAction === "escalate" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Escalation Category *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setEscalationCategoryDropdownOpen(
                            !escalationCategoryDropdownOpen,
                          )
                        }
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold text-sm shadow-sm flex items-center justify-between text-left"
                      >
                        <span
                          className={
                            escalationCategory
                              ? "text-slate-800 dark:text-white"
                              : "text-slate-400 dark:text-slate-500"
                          }
                        >
                          {escalationCategory
                            ? escalationCategories.find(
                                (c) => c.value === escalationCategory,
                              )?.label
                            : "Select escalation category..."}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${escalationCategoryDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {escalationCategoryDropdownOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                          {escalationCategories.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => {
                                setEscalationCategory(c.value);
                                setEscalationCategoryDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                                escalationCategory === c.value
                                  ? "bg-red-50 dark:bg-red-950/20 text-red-600"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Escalation Priority *
                    </label>
                    <div className="flex gap-2">
                      {["medium", "high", "critical"].map((p) => {
                        const label = p.charAt(0).toUpperCase() + p.slice(1);
                        const isSelected = escalationPriority === p;

                        let selectStyle =
                          "border-slate-200 hover:border-slate-300 dark:border-slate-700";
                        if (isSelected) {
                          if (p === "critical")
                            selectStyle =
                              "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                          else if (p === "high")
                            selectStyle =
                              "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400";
                          else
                            selectStyle =
                              "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400";
                        }

                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setEscalationPriority(p)}
                            className={`flex-1 py-3 text-center rounded-xl border-2 font-bold text-xs capitalize transition-all ${selectStyle}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Reason / Justification * (Minimum 50 characters)
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="Explain details of the operational breakdown or risk requiring escalation..."
                      className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all font-semibold text-sm shadow-sm ${
                        commentText.length < 50
                          ? "border-red-200 focus:ring-red-500"
                          : "border-emerald-300 focus:ring-emerald-500"
                      }`}
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider ${commentText.length < 50 ? "text-red-500 animate-pulse" : "text-emerald-600"}`}
                      >
                        Characters count: {commentText.length} / 50 minimum
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl text-sm transition-all"
                >
                  Back to Action Menu
                </button>

                {selectedAction !== "view_evidence" && (
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Continue to Confirmation
                  </button>
                )}
              </div>
            </form>
          )}

          {/* STEP 4: Confirmation Screen */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-xl mx-auto w-full">
              {/* Incompatible Officers Prompt Card */}
              {incompatibleOfficerPrompt ? (
                <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700 rounded-2xl space-y-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={24}
                      className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-amber-950 dark:text-amber-100">
                        Officer Compatibility Warning
                      </h4>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                        Changing this issue classification to{" "}
                        <strong>
                          {formatCategory(
                            incompatibleOfficerPrompt.newClassification
                              ?.category,
                          )}
                        </strong>{" "}
                        will make the following current assignment(s)
                        incompatible:
                      </p>
                    </div>
                  </div>

                  {incompatibleOfficerPrompt.officers &&
                    incompatibleOfficerPrompt.officers.length > 0 && (
                      <div className="space-y-2">
                        {incompatibleOfficerPrompt.officers.map((off, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                                {off.roleLabel ||
                                  (off.role === "unit_officer"
                                    ? "Unit Officer"
                                    : "Field Officer")}
                              </span>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                                Will be removed
                              </span>
                            </div>
                            <p className="font-extrabold text-xs text-slate-800 dark:text-white">
                              {off.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Current Dept: {off.department || "General"} •
                              City: {off.city || "Unknown"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold italic">
                              New Required Dept:{" "}
                              {formatCategory(
                                incompatibleOfficerPrompt.newClassification
                                  ?.category,
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIncompatibleOfficerPrompt(null);
                        setPendingClassificationPayload(null);
                      }}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmClassificationWithClear}
                      disabled={loading}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
                    >
                      {loading && (
                        <Loader2 className="animate-spin" size={14} />
                      )}
                      Change Classification & Clear Incompatible Officers
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center py-4">
                    <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/40 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      Confirm Administrative Intervention
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Verify the recorded administrative details before
                      executing database changes.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Operation
                      </span>
                      <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        {ACTION_META[selectedAction]?.label}
                      </span>
                    </div>

                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Target Issue
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[240px]">
                          {issue.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {issue.issueCode}
                        </p>
                      </div>
                    </div>

                    {isOfficerAction && (
                      <>
                        {selectedAction.startsWith("reassign") && (
                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Current{" "}
                              {isUnitOfficerAction
                                ? "Unit Officer"
                                : "Field Officer"}
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {(isUnitOfficerAction
                                ? currentUnitOfficer?.name
                                : currentFieldOfficer?.name) || "Unassigned"}
                            </span>
                          </div>
                        )}

                        {selectedOfficerProfile && (
                          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              {selectedAction.startsWith("reassign")
                                ? "New"
                                : "Assigned"}{" "}
                              {isUnitOfficerAction
                                ? "Unit Officer"
                                : "Field Officer"}
                            </span>
                            <div className="text-right">
                              <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                                {selectedOfficerProfile.name ??
                                  selectedOfficerProfile.fullName ??
                                  "Officer"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-bold">
                                Department: {selectedOfficerProfile.department}{" "}
                                • City: {selectedOfficerProfile.city}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {selectedAction === "extend_sla" && newSlaDeadline && (
                      <>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Current SLA
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {formatDateTime(currentSlaDeadline)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            New SLA Deadline
                          </span>
                          <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                            {formatDateTime(newSlaDeadline)}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedAction === "change_classification" && (
                      <>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Previous Category
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            {formatCategory(issue.category)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            New Category
                          </span>
                          <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                            {formatCategory(selectedCategory)}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedAction === "update_priority" && (
                      <>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Current Priority
                          </span>
                          <span className="text-xs font-bold uppercase text-slate-500">
                            {issue.priority || issue.severity || "Medium"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            New Priority
                          </span>
                          <span className="text-sm font-black uppercase text-amber-600 dark:text-amber-400">
                            {selectedPriority}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedAction === "reject" && rejectionCategory && (
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Rejection Reason
                        </span>
                        <span className="text-xs font-black text-red-600 bg-red-100/40 px-2 py-0.5 rounded">
                          {rejectionCategory}
                        </span>
                      </div>
                    )}

                    {selectedAction === "rework" && reworkReason && (
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Rework Reason
                        </span>
                        <span className="text-xs font-black text-orange-600 bg-orange-100/40 px-2 py-0.5 rounded">
                          {reworkReason}
                        </span>
                      </div>
                    )}

                    {commentText.trim() && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                          Comments / Explanation
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg leading-relaxed font-semibold italic">
                          {commentText}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={loading}
                      className="flex-1 py-3.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl text-sm transition-all"
                    >
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => executeTransaction(false)}
                      disabled={loading}
                      className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          <span>Executing...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Confirm & Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-white dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-medium text-slate-500 shrink-0">
          <span>Step {step} of 4</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
          >
            Cancel Actions
          </button>
        </div>
      </div>
    </div>
  );
}

function StarIcon({ rating }) {
  return (
    <svg
      className="w-3.5 h-3.5 text-amber-400 fill-current"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
