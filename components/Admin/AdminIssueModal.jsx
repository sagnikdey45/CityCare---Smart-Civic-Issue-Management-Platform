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
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MapPinned,
  Zap,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Check,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const statusStyles = {
  pending: {
    bg: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
    border: "border-amber-200 dark:border-amber-900/50",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800",
    icon: Clock,
  },
  verified: {
    bg: "from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20",
    border: "border-cyan-200 dark:border-cyan-900/50",
    text: "text-cyan-700 dark:text-cyan-300",
    badge: "bg-cyan-100 border-cyan-300 dark:bg-cyan-950/40 dark:border-cyan-800",
    icon: Shield,
  },
  assigned: {
    bg: "from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-indigo-950/20",
    border: "border-indigo-200 dark:border-indigo-900/50",
    text: "text-indigo-700 dark:text-indigo-300",
    badge: "bg-indigo-100 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800",
    icon: UserPlus,
  },
  in_progress: {
    bg: "from-blue-50 to-teal-50 dark:from-blue-950/20 dark:to-teal-950/20",
    border: "border-blue-200 dark:border-blue-900/50",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800",
    icon: Zap,
  },
  pending_uo_verification: {
    bg: "from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20",
    border: "border-teal-200 dark:border-teal-900/50",
    text: "text-teal-700 dark:text-teal-300",
    badge: "bg-teal-100 border-teal-300 dark:bg-teal-950/40 dark:border-teal-800",
    icon: CheckCircle2,
  },
  rework_required: {
    bg: "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-orange-950/20",
    border: "border-orange-200 dark:border-orange-900/50",
    text: "text-orange-700 dark:text-orange-300",
    badge: "bg-orange-100 border-orange-300 dark:bg-orange-950/40 dark:border-orange-800",
    icon: AlertTriangle,
  },
  resolved: {
    bg: "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20",
    border: "border-emerald-200 dark:border-emerald-900/50",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  closed: {
    bg: "from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20",
    border: "border-slate-200 dark:border-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    badge: "bg-slate-100 border-slate-300 dark:bg-slate-900/40 dark:border-slate-800",
    icon: CheckCircle2,
  },
  rejected: {
    bg: "from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20",
    border: "border-red-200 dark:border-red-900/50",
    text: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 border-red-300 dark:bg-red-950/40 dark:border-red-800",
    icon: XCircle,
  },
  escalated: {
    bg: "from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-rose-950/20",
    border: "border-rose-200 dark:border-rose-900/50",
    text: "text-rose-700 dark:text-rose-300",
    badge: "bg-rose-100 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800",
    icon: AlertTriangle,
  },
  withdrawn: {
    bg: "from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-gray-900/20",
    border: "border-gray-200 dark:border-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    badge: "bg-gray-100 border-gray-300 dark:bg-gray-900/40 dark:border-gray-800",
    icon: XCircle,
  }
};

const statusLabels = {
  pending: "Pending",
  verified: "Verified",
  assigned: "Assigned",
  in_progress: "In Progress",
  pending_uo_verification: "Pending UO Verification",
  rework_required: "Rework Required",
  resolved: "Resolved",
  closed: "Closed",
  rejected: "Rejected",
  escalated: "Escalated",
  withdrawn: "Withdrawn",
};

const rejectionReasons = [
  "Duplicate issue already reported",
  "Insufficient information provided",
  "Issue outside jurisdiction",
  "Not a civic responsibility",
  "Unable to verify location",
  "Issue already resolved",
  "Spam or inappropriate content",
  "Other (please specify)",
];

const reworkReasons = [
  "Incomplete resolution on-ground",
  "Incorrect location or address verified",
  "Evidence pictures are blurry or insufficient",
  "Reported problem has returned or persists",
  "Incorrect materials or methods used",
  "Other validation failure",
];

const categoryData = {
  road: { label: "Road & Infrastructure", icon: "🛣️", color: "from-slate-500 to-slate-600" },
  lighting: { label: "Street Lighting", icon: "💡", color: "from-yellow-500 to-amber-500" },
  waste: { label: "Waste Management", icon: "🗑️", color: "from-green-500 to-emerald-600" },
  water: { label: "Water Supply", icon: "💧", color: "from-blue-500 to-cyan-500" },
  other: { label: "Other", icon: "📋", color: "from-gray-500 to-gray-600" },
};

const ACTION_META = {
  assign_uo: {
    label: "Assign Unit Officer",
    description: "Assign a Unit Officer to inspect and verify this issue.",
    icon: UserPlus,
    color: "from-blue-500 to-indigo-600",
    textColor: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/10 hover:bg-blue-100 dark:hover:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-900/50"
  },
  assign_fo: {
    label: "Assign Field Officer",
    description: "Assign a Field Officer to execute on-ground repairs.",
    icon: UserPlus,
    color: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/10 hover:bg-emerald-100 dark:hover:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900/50"
  },
  reassign_uo: {
    label: "Reassign Unit Officer",
    description: "Change the Unit Officer currently assigned to verify this issue.",
    icon: UserPlus,
    color: "from-blue-600 to-cyan-600",
    textColor: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-50 dark:bg-cyan-950/10 hover:bg-cyan-100 dark:hover:bg-cyan-950/20",
    border: "border-cyan-200 dark:border-cyan-900/50"
  },
  reassign_fo: {
    label: "Reassign Field Officer",
    description: "Change the Field Officer assigned to this issue's resolution.",
    icon: UserPlus,
    color: "from-teal-500 to-cyan-600",
    textColor: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-50 dark:bg-teal-950/10 hover:bg-teal-100 dark:hover:bg-teal-950/20",
    border: "border-teal-200 dark:border-teal-900/50"
  },
  reject: {
    label: "Reject Issue",
    description: "Decline this issue report. Reporter will be notified.",
    icon: XCircle,
    color: "from-red-500 to-rose-600",
    textColor: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-950/10 hover:bg-red-100 dark:hover:bg-red-950/20",
    border: "border-red-200 dark:border-red-900/50"
  },
  revoke: {
    label: "Revoke Assignment",
    description: "Unassign current officer and return issue to unassigned queue.",
    icon: XCircle,
    color: "from-amber-600 to-red-600",
    textColor: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/10 hover:bg-amber-100 dark:hover:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-900/50"
  },
  sla: {
    label: "Extend SLA Action",
    description: "Change resolution timeline SLA deadline for this issue.",
    icon: Calendar,
    color: "from-indigo-500 to-purple-600",
    textColor: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-950/10 hover:bg-indigo-100 dark:hover:bg-indigo-950/20",
    border: "border-indigo-200 dark:border-indigo-900/50"
  },
  rework: {
    label: "Request Rework",
    description: "Flag work as incomplete and return to Field Officer.",
    icon: AlertTriangle,
    color: "from-orange-500 to-amber-600",
    textColor: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-orange-950/10 hover:bg-orange-100 dark:hover:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-900/50"
  },
  close: {
    label: "Close Issue",
    description: "Mark issue as permanently resolved and closed.",
    icon: CheckCircle2,
    color: "from-emerald-600 to-green-600",
    textColor: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/10 hover:bg-emerald-100 dark:hover:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900/50"
  },
  reopen: {
    label: "Reopen Issue",
    description: "Reopen resolved issue to pending verification status.",
    icon: Clock,
    color: "from-purple-500 to-violet-600",
    textColor: "text-purple-700 dark:text-purple-300",
    bg: "bg-purple-50 dark:bg-purple-950/10 hover:bg-purple-100 dark:hover:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-900/50"
  },
  escalate: {
    label: "Escalate Issue",
    description: "Escalate to admin control queue, flagged for critical attention.",
    icon: AlertTriangle,
    color: "from-rose-600 to-red-700",
    textColor: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/10 hover:bg-rose-100 dark:hover:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-900/50"
  },
  view_evidence: {
    label: "View Evidence",
    description: "Examine resolution details, notes and photos uploaded by Field Officer.",
    icon: MapPinned,
    color: "from-teal-600 to-emerald-600",
    textColor: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-50 dark:bg-teal-950/10 hover:bg-teal-100 dark:hover:bg-teal-950/20",
    border: "border-teal-200 dark:border-teal-900/50"
  }
};

function getValidActions(status) {
  const normStatus = (status || "").toLowerCase().trim();
  switch (normStatus) {
    case "pending":
    case "reopened":
      return []; // Wait for verification of the issue
    case "verified":
      return ["assign_fo", "reassign_uo", "reject"];
    case "assigned":
    case "in_progress":
      return ["reassign_fo", "revoke", "sla", "escalate"];
    case "pending_uo_verification":
      return ["view_evidence", "rework", "close"];
    case "rework_required":
      return ["reassign_fo", "sla", "escalate"];
    case "resolved":
      return ["close", "reopen"];
    default:
      return []; // closed, rejected, withdrawn are read-only
  }
}

const escalationCategories = [
  { label: "SLA Breach", value: "sla_breach" },
  { label: "Resource Shortage", value: "resource_shortage" },
  { label: "Technical Complexity", value: "technical_complexity" },
  { label: "Public Safety Risk", value: "public_safety_risk" },
  { label: "Legal / Regulatory", value: "legal_or_regulatory" },
  { label: "Citizen Escalation", value: "citizen_escalation" },
  { label: "Repeat Failure", value: "repeat_failure" },
  { label: "Cross Department Dependency", value: "cross_department_dependency" },
  { label: "Budget Approval Required", value: "budget_approval_required" },
  { label: "Emergency Response", value: "emergency_response" },
  { label: "Other", value: "other" },
];

const ESCALATION_CATEGORY_LABELS = {
  sla_breach: "SLA Breach",
  resource_shortage: "Resource Shortage",
  technical_complexity: "Technical Complexity",
  public_safety_risk: "Public Safety Risk",
  legal_or_regulatory: "Legal / Regulatory",
  citizen_escalation: "Citizen Escalation",
  repeat_failure: "Repeat Failure",
  cross_department_dependency: "Cross Department Dependency",
  budget_approval_required: "Budget Approval Required",
  emergency_response: "Emergency Response",
  other: "Other",
};

export function AdminIssueModal({ issue, onClose, onUpdated }) {
  const adminUserId = "2"; // fallback local admin userId matching AdminDashboard context
  const [step, setStep] = useState(1); // 1 = Summary, 2 = Actions, 3 = Form, 4 = Confirmation
  const [selectedAction, setSelectedAction] = useState(null);

  // Form states
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [officerSearch, setOfficerSearch] = useState("");
  const [rejectionCategory, setRejectionCategory] = useState("");
  const [rejectionDropdownOpen, setRejectionDropdownOpen] = useState(false);
  const [reworkReason, setReworkReason] = useState("");
  const [reworkDropdownOpen, setReworkDropdownOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [newSlaDate, setNewSlaDate] = useState("");

  // Escalation Form states
  const [escalationCategory, setEscalationCategory] = useState("");
  const [escalationCategoryDropdownOpen, setEscalationCategoryDropdownOpen] = useState(false);
  const [escalationPriority, setEscalationPriority] = useState("medium");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // System States
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Data fetching
  const assignableData = useQuery(api.admin.getAssignableOfficers);
  const officerQueryLoading = assignableData === undefined;
  const resolvedAdminId = useQuery(api.admin.resolveAdminId, { adminUserIdStr: adminUserId });

  // Mutations
  const assignIssueMut = useMutation(api.admin.adminAssignIssue);
  const reassignIssueMut = useMutation(api.admin.adminReassignIssue);
  const rejectIssueMut = useMutation(api.admin.adminRejectIssue);
  const revokeAssignmentMut = useMutation(api.admin.adminRevokeAssignment);
  const extendSlaMut = useMutation(api.admin.adminExtendSLA);
  const sendReworkMut = useMutation(api.admin.adminSendForRework);
  const closeIssueMut = useMutation(api.admin.adminCloseIssue);
  const escalateIssueMut = useMutation(api.admin.adminEscalateIssue);
  const reopenIssueMut = useMutation(api.admin.adminReopenIssue);

  // Reset states on issue change
  useEffect(() => {
    if (issue) {
      setStep(1);
      setSelectedAction(null);
      setSelectedOfficerId("");
      setOfficerSearch("");
      setRejectionCategory("");
      setReworkReason("");
      setCommentText("");
      setNewSlaDate("");
      setEscalationCategory("");
      setEscalationPriority("medium");
      setAdditionalNotes("");
      setSuccessMsg("");
      setErrorMsg("");
    }
  }, [issue]);

  if (!issue) return null;

  const validActions = getValidActions(issue.status);
  const isReadOnly = validActions.length === 0;

  const currentStatusStyle = statusStyles[issue.status] || statusStyles.pending;
  const StatusIcon = currentStatusStyle.icon;
  const categoryInfo = categoryData[issue.category] || categoryData.other;

  // Resolve assignable list based on selected action
  const isUOAction = selectedAction === "assign_uo" || selectedAction === "reassign_uo";
  const rawOfficers = isUOAction
    ? assignableData?.unitOfficers ?? []
    : assignableData?.fieldOfficers ?? [];

  const filteredOfficers = rawOfficers.filter(
    (off) =>
      off.fullName.toLowerCase().includes(officerSearch.toLowerCase()) ||
      off.email.toLowerCase().includes(officerSearch.toLowerCase()) ||
      (off.department && off.department.toLowerCase().includes(officerSearch.toLowerCase()))
  );

  const selectedOfficerProfile = rawOfficers.find((o) => o.userId === selectedOfficerId);

  // Get active SLA deadline format
  const slaText = issue.slaDeadline
    ? new Date(issue.slaDeadline).toLocaleDateString()
    : "No deadline configured";
  const isSlaBreached = issue.slaDeadline && issue.slaDeadline < Date.now() && !["resolved", "closed", "rejected", "withdrawn"].includes(issue.status);

  // Future SLA minimum input date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const handleActionClick = (actionKey) => {
    if (actionKey === "view_evidence") {
      setSelectedAction("view_evidence");
      setStep(3);
    } else {
      setSelectedAction(actionKey);
      setStep(3);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if ((selectedAction === "assign_uo" || selectedAction === "reassign_uo" || selectedAction === "assign_fo" || selectedAction === "reassign_fo") && !selectedOfficerId) {
      alert("Please select an officer.");
      return;
    }
    if (selectedAction === "reject" && (!rejectionCategory || commentText.length < 30)) {
      alert("Please select a rejection category and enter at least 30 characters of explanation.");
      return;
    }
    if (selectedAction === "sla" && !newSlaDate) {
      alert("Please select a new SLA deadline date.");
      return;
    }
    if (selectedAction === "rework" && (!reworkReason || !commentText.trim())) {
      alert("Please select a rework reason and write feedback comments.");
      return;
    }
    if (selectedAction === "revoke" && !commentText.trim()) {
      alert("Please provide a reason for revoking assignment.");
      return;
    }
    if (selectedAction === "reopen" && !commentText.trim()) {
      alert("Please provide a reason for reopening this issue.");
      return;
    }
    if (selectedAction === "escalate" && (!escalationCategory || commentText.length < 50)) {
      alert("Please select an escalation category and enter at least 50 characters of reason justification.");
      return;
    }
    setStep(4);
  };

  const executeWorkflowMutation = async () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const payloadId = issue._id;

      switch (selectedAction) {
        case "assign_uo":
          await assignIssueMut({
            issueId: payloadId,
            officerUserId: selectedOfficerId,
            role: "unit_officer",
            adminUserId,
            comment: commentText,
          });
          setSuccessMsg("Unit Officer assigned successfully!");
          break;

        case "reassign_uo":
          await reassignIssueMut({
            issueId: payloadId,
            newOfficerUserId: selectedOfficerId,
            role: "unit_officer",
            adminUserId,
            reason: commentText || "Reassigned by Administrator",
          });
          setSuccessMsg("Unit Officer reassigned successfully!");
          break;

        case "assign_fo":
          await assignIssueMut({
            issueId: payloadId,
            officerUserId: selectedOfficerId,
            role: "field_officer",
            adminUserId,
            comment: commentText,
          });
          setSuccessMsg("Field Officer assigned successfully!");
          break;

        case "reassign_fo":
          await reassignIssueMut({
            issueId: payloadId,
            newOfficerUserId: selectedOfficerId,
            role: "field_officer",
            adminUserId,
            reason: commentText || "Reassigned by Administrator",
          });
          setSuccessMsg("Field Officer reassigned successfully!");
          break;

        case "reject":
          await rejectIssueMut({
            issueId: payloadId,
            adminUserId,
            reason: rejectionCategory,
            comment: commentText,
          });
          setSuccessMsg("Issue rejected successfully.");
          break;

        case "revoke":
          await revokeAssignmentMut({
            issueId: payloadId,
            adminUserId,
            reason: commentText,
          });
          setSuccessMsg("Officer assignment revoked successfully.");
          break;

        case "sla":
          await extendSlaMut({
            issueId: payloadId,
            adminUserId,
            newDeadline: new Date(newSlaDate).getTime(),
            reason: commentText || "SLA Deadline extension by admin intervention",
          });
          setSuccessMsg("SLA Deadline updated successfully.");
          break;

        case "rework":
          await sendReworkMut({
            issueId: payloadId,
            adminUserId,
            reworkReason: reworkReason,
            reworkComment: commentText,
          });
          setSuccessMsg("Rework instructions sent to officer successfully.");
          break;

        case "close":
          await closeIssueMut({
            issueId: payloadId,
            adminUserId,
            comment: commentText,
          });
          setSuccessMsg("Issue closed successfully.");
          break;

        case "escalate":
          await escalateIssueMut({
            issueId: payloadId,
            escalatedBy: resolvedAdminId,
            category: escalationCategory,
            priority: escalationPriority,
            reason: commentText,
            comments: additionalNotes || undefined,
          });
          setSuccessMsg("Issue escalated to Admin queue.");
          break;

        case "reopen":
          await reopenIssueMut({
            issueId: payloadId,
            adminUserId,
            reopenReason: commentText,
          });
          setSuccessMsg("Issue reopened successfully.");
          break;

        default:
          throw new Error("Invalid administrative action");
      }

      if (onUpdated) {
        onUpdated(issue._id, {});
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Failed to submit transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-800/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 transition-all">
        
        {/* Sticky Header */}
        <div className={`sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 z-10`}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg border ${currentStatusStyle.badge} ${currentStatusStyle.text} flex items-center gap-1.5 shadow-sm`}>
                  <StatusIcon size={13} />
                  {statusLabels[issue.status] || issue.status}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 rounded-lg">
                  {issue.issueCode}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                {issue.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper Progress Indicator */}
          {!isReadOnly && (
            <div className="flex items-center gap-2 max-w-xl mx-auto w-full pt-2">
              {[
                { s: 1, label: "Summary" },
                { s: 2, label: "Actions" },
                { s: 3, label: "Form" },
                { s: 4, label: "Confirm" }
              ].map((stepItem, index) => (
                <React.Fragment key={stepItem.s}>
                  <button
                    disabled={stepItem.s > step && !selectedAction}
                    onClick={() => {
                      if (stepItem.s === 2) setStep(2);
                      else if (stepItem.s === 1) setStep(1);
                      else if (stepItem.s === 3 && selectedAction) setStep(3);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      step === stepItem.s
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : step > stepItem.s
                        ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center border border-current text-[10px] font-black">
                      {stepItem.s}
                    </span>
                    <span className="hidden sm:inline">{stepItem.label}</span>
                  </button>
                  {index < 3 && (
                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-700 flex-1 max-w-[40px]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Wizard Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6">
          
          {/* STEP 1: Current State Summary */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Critical alerts */}
              {isSlaBreached && (
                <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900 rounded-xl p-4 flex gap-3 text-red-800 dark:text-red-300">
                  <AlertCircle size={22} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">SLA Target Missed</h4>
                    <p className="text-xs mt-1">This issue has exceeded its allowed resolution SLA timeframe. Immediate intervention (reassigning or extending deadline) is recommended.</p>
                  </div>
                </div>
              )}

              {/* Detailed Escalation Badge if escalated */}
              {issue.status === "escalated" && issue.escalation && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900 rounded-xl p-4 flex gap-3 text-rose-800 dark:text-rose-300">
                  <AlertTriangle size={22} className="flex-shrink-0 mt-0.5 text-red-500 animate-bounce" />
                  <div>
                    <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                      <span>🚨 Escalated</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        issue.escalation.priority === "critical"
                          ? "bg-red-500 text-white animate-pulse"
                          : issue.escalation.priority === "high"
                          ? "bg-orange-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}>
                        {issue.escalation.priority}
                      </span>
                    </h4>
                    <p className="text-xs mt-1.5 font-semibold">
                      <span className="font-black">Category:</span> {ESCALATION_CATEGORY_LABELS[issue.escalation.category] || issue.escalation.category}
                    </p>
                    <p className="text-xs mt-1 font-semibold leading-relaxed">
                      <span className="font-black">Reason:</span> {issue.escalation.reason}
                    </p>
                    {issue.escalation.comments && (
                      <p className="text-xs mt-1 font-semibold leading-relaxed opacity-90">
                        <span className="font-black">Comments:</span> {issue.escalation.comments}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Status workflow tag info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Status</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white capitalize">{statusLabels[issue.status] || issue.status}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Category</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>{categoryInfo.icon}</span>
                    {categoryInfo.label}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Priority</span>
                  <span className={`text-sm font-black uppercase ${issue.priority === 'high' ? 'text-red-500' : issue.priority === 'medium' ? 'text-amber-500' : 'text-slate-500'}`}>
                    {issue.priority}
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">SLA Target</span>
                  <span className={`text-sm font-black ${isSlaBreached ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{slaText}</span>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                      <Shield size={16} />
                    </div>
                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Assigned Unit Officer</span>
                  </div>
                  {issue.assignedUnitOfficer ? (
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-white">{issue.assignedUnitOfficerName || "Assigned Officer"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {issue.assignedUnitOfficer}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-600 italic">No Unit Officer assigned</p>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                      <Zap size={16} />
                    </div>
                    <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Assigned Field Officer</span>
                  </div>
                  {issue.assignedFieldOfficer ? (
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-white">{issue.assignedFieldOfficerName || "Assigned Officer"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {issue.assignedFieldOfficer}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-600 italic">No Field Officer assigned</p>
                  )}
                </div>
              </div>

              {/* Main Issue Content */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Issue Description</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{issue.description}</p>
                </div>
                {issue.address && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Address</h4>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      {issue.address}
                    </p>
                  </div>
                )}
                {issue.escalatedToAdmin && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-full text-xs font-bold text-red-700 dark:text-red-400">
                    <AlertTriangle size={12} />
                    Escalated to Administrator Queue
                  </div>
                )}
              </div>

              {/* Read-only historical data */}
              {issue.rejection_reason && (
                <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900 rounded-xl p-5 shadow-sm space-y-1.5">
                  <h4 className="text-sm font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <XCircle size={16} /> Rejection Reason
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed font-medium">{issue.rejection_reason}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 justify-end">
                {isReadOnly ? (
                  <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold px-5 py-3 rounded-xl text-center w-full text-sm">
                    {["pending", "reopened"].includes(issue.status.toLowerCase()) ? (
                      "Waiting for verification of the issue. No administrative actions available."
                    ) : (
                      `This issue is in status '${issue.status.toUpperCase()}' and is now closed to administrative changes.`
                    )}
                  </div>
                ) : (
                  <button
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-500" size={18} />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recommended Interventions for {statusLabels[issue.status]} Status</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {validActions.map((actionKey, index) => {
                  const meta = ACTION_META[actionKey];
                  if (!meta) return null;
                  const Icon = meta.icon;
                  const isThirdOfThree = validActions.length === 3 && index === 2;
                  return (
                    <button
                      key={actionKey}
                      onClick={() => handleActionClick(actionKey)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 flex items-start gap-4 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 group ${meta.bg} ${meta.border} ${isThirdOfThree ? "md:col-span-2" : ""}`}
                    >
                      <div className={`p-3.5 bg-gradient-to-br ${meta.color} rounded-xl shadow-md text-white flex-shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <h4 className={`font-extrabold text-sm mb-1 uppercase tracking-wider ${meta.textColor}`}>{meta.label}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{meta.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200 justify-between">
                <button
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
            <form onSubmit={handleFormSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Form Action Title Card */}
              {(() => {
                const meta = ACTION_META[selectedAction];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <div className={`p-4 rounded-xl border ${meta.bg} ${meta.border} flex items-center gap-3 shadow-inner`}>
                    <div className={`p-2 bg-gradient-to-br ${meta.color} rounded-lg text-white`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className={`font-extrabold text-sm ${meta.textColor}`}>{meta.label}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Please fill in the necessary fields to record this action.</p>
                    </div>
                  </div>
                );
              })()}

              {/* DYNAMIC FORMS */}
              
              {/* Assign or Reassign Officer Selectors */}
              {(selectedAction === "assign_uo" || selectedAction === "reassign_uo" || selectedAction === "assign_fo" || selectedAction === "reassign_fo") && (
                <div className="space-y-4">
                  
                  {/* SEARCH FILTER */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      value={officerSearch}
                      onChange={(e) => setOfficerSearch(e.target.value)}
                      placeholder="Search officers by name, email or department..."
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold text-sm shadow-sm"
                    />
                  </div>

                  {/* LOADING STATE */}
                  {officerQueryLoading ? (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-emerald-500" size={32} />
                      <span className="text-xs font-bold uppercase tracking-wider">Fetching live officers...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
                      {filteredOfficers.length > 0 ? (
                        filteredOfficers.map((off) => {
                          const isSelected = selectedOfficerId === off.userId;
                          
                          // Determine workload status
                          const max = off.maxIssueCapacity ?? 15;
                          const active = off.currentActiveIssues ?? off.activeIssueCount ?? 0;
                          const workloadPct = max > 0 ? Math.round((active / max) * 100) : 0;
                          
                          let statusColor = "bg-emerald-500";
                          let workloadLabel = "Balanced";
                          if (isUOAction) {
                            if (active >= 15) {
                              statusColor = "bg-red-500";
                              workloadLabel = "Overloaded";
                            } else if (active <= 4) {
                              statusColor = "bg-blue-500";
                              workloadLabel = "Underutilized";
                            }
                          } else {
                            if (active >= max || workloadPct >= 85) {
                              statusColor = "bg-red-500";
                              workloadLabel = "Overloaded";
                            } else if (active <= 1 || workloadPct <= 25) {
                              statusColor = "bg-blue-500";
                              workloadLabel = "Underutilized";
                            }
                          }

                          return (
                            <button
                              key={off._id}
                              type="button"
                              onClick={() => setSelectedOfficerId(off.userId)}
                              className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-4 hover:shadow-md ${
                                isSelected
                                  ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20 shadow-emerald-50 dark:shadow-none"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                              }`}
                            >
                              <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner border border-slate-300 dark:border-slate-600 relative">
                                {off.profilePictureUrl ? (
                                  <img src={off.profilePictureUrl} alt={off.fullName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-extrabold text-sm text-slate-600 dark:text-slate-300 uppercase">
                                    {(off.fullName || "O").charAt(0)}
                                  </span>
                                )}
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${statusColor}`} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h5 className="font-black text-sm text-slate-800 dark:text-white leading-tight truncate">{off.fullName}</h5>
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{off.department}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{off.email}</p>
                                
                                <div className="flex items-center gap-4 mt-2 flex-wrap">
                                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <Zap size={11} className="text-slate-400" />
                                    Active: {active} / {max} ({workloadLabel})
                                  </span>
                                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <StarIcon rating={off.rating} />
                                    Rating: {off.rating}/5
                                  </span>
                                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <Zap size={11} className="text-emerald-500" />
                                    Efficiency: {off.efficiencyScore}%
                                  </span>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 self-center shadow-md animate-in zoom-in-50 duration-200">
                                  <Check size={14} className="stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                          No matching officers found.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Assignment Instructions / Comment</label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      placeholder="Add coordination guidelines or assignment explanation..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold text-sm shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Reject Issue Form */}
              {selectedAction === "reject" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Rejection Category *</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setRejectionDropdownOpen(!rejectionDropdownOpen)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-bold text-sm shadow-sm hover:shadow flex items-center justify-between text-left"
                      >
                        <span className={rejectionCategory ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500"}>
                          {rejectionCategory || "Select rejection reason category..."}
                        </span>
                        <ChevronDown size={18} className={`transition-transform ${rejectionDropdownOpen ? "rotate-180" : ""}`} />
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
                                rejectionCategory === reason ? "bg-red-50 dark:bg-red-950/20 text-red-600" : "text-slate-700 dark:text-slate-300"
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
                          ? "border-red-200 focus:ring-red-500 focus:border-red-500"
                          : "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500"
                      }`}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${commentText.length < 30 ? "text-red-500 animate-pulse" : "text-emerald-600"}`}>
                        Characters count: {commentText.length} / 30 minimum
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SLA Extension Form */}
              {selectedAction === "sla" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">New SLA Deadline Date *</label>
                    <input
                      type="date"
                      min={tomorrowStr}
                      value={newSlaDate}
                      onChange={(e) => setNewSlaDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold text-sm shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Extension Justification / Reason *</label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="Describe the operational constraints or reasons requiring timeline extension..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Rework Form */}
              {selectedAction === "rework" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Rework Category / Cause *</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setReworkDropdownOpen(!reworkDropdownOpen)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-bold text-sm shadow-sm hover:shadow flex items-center justify-between text-left"
                      >
                        <span className={reworkReason ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500"}>
                          {reworkReason || "Select a rework reason..."}
                        </span>
                        <ChevronDown size={18} className={`transition-transform ${reworkDropdownOpen ? "rotate-180" : ""}`} />
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
                                reworkReason === reason ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600" : "text-slate-700 dark:text-slate-300"
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
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Rework Instructions *</label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="Detail specific corrections, failures or guidelines the Field Officer must perform..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* View Resolution Evidence Form */}
              {selectedAction === "view_evidence" && (
                <div className="space-y-5 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-1">Ground Officer Resolution Notes</span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed italic">
                      {issue.notes || "No resolution description comments provided by the officer."}
                    </p>
                  </div>

                  {issue.afterPhotos && issue.afterPhotos.length > 0 ? (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Resolution Evidence Photos</span>
                      <div className="grid grid-cols-2 gap-3">
                        {issue.afterPhotos.map((photo, index) => (
                          <div key={index} className="rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 group relative">
                            <img src={photo} alt={`Evidence ${index + 1}`} className="w-full h-36 object-cover group-hover:scale-105 transition-transform" />
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
                    <span>Based on this evidence, you should choose to either close the issue permanently or return it for rework.</span>
                  </div>
                </div>
              )}

              {/* Close, Revoke or Reopen Comment forms */}
              {(selectedAction === "close" || selectedAction === "revoke" || selectedAction === "reopen") && (
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
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Escalate Issue Form */}
              {selectedAction === "escalate" && (
                <div className="space-y-4">
                  {/* Escalation Category Dropdown */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Escalation Category *</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setEscalationCategoryDropdownOpen(!escalationCategoryDropdownOpen)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-bold text-sm shadow-sm hover:shadow flex items-center justify-between text-left"
                      >
                        <span className={escalationCategory ? "text-slate-800 dark:text-white" : "text-slate-400 dark:text-slate-500"}>
                          {escalationCategory
                            ? escalationCategories.find((c) => c.value === escalationCategory)?.label
                            : "Select escalation category..."}
                        </span>
                        <ChevronDown size={18} className={`transition-transform ${escalationCategoryDropdownOpen ? "rotate-180" : ""}`} />
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
                                escalationCategory === c.value ? "bg-red-50 dark:bg-red-950/20 text-red-600" : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Escalation Priority Selection */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Escalation Priority *</label>
                    <div className="flex gap-2">
                      {["medium", "high", "critical"].map((p) => {
                        const label = p.charAt(0).toUpperCase() + p.slice(1);
                        const isSelected = escalationPriority === p;
                        
                        let selectStyle = "border-slate-200 hover:border-slate-300 dark:border-slate-700";
                        if (isSelected) {
                          if (p === "critical") selectStyle = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400";
                          else if (p === "high") selectStyle = "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400";
                          else selectStyle = "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400";
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

                  {/* Reason Textarea (Minimum 50 chars) */}
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
                          ? "border-red-200 focus:ring-red-500 focus:border-red-500"
                          : "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500"
                      }`}
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${commentText.length < 50 ? "text-red-500 animate-pulse" : "text-emerald-600"}`}>
                        Characters count: {commentText.length} / 50 minimum
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Additional Notes (Optional)</label>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      rows={2}
                      placeholder="Any internal coordinates or side-notes for the admin team..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold text-sm shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 justify-between">
                <button
                  type="button"
                  onClick={() => setStep(selectedAction === "view_evidence" ? 1 : 2)}
                  className="px-5 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl text-sm transition-all"
                >
                  Back
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
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/40 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">Confirm Intervention</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Verify the recorded administrative details before executing database changes.</p>
              </div>

              {/* Confirmation details summary */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Operation</span>
                  <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    {ACTION_META[selectedAction]?.label}
                  </span>
                </div>

                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Target Issue</span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[240px]">{issue.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{issue.issueCode}</p>
                  </div>
                </div>

                {selectedOfficerProfile && (
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Assigned Officer</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white">{selectedOfficerProfile.fullName}</span>
                  </div>
                )}

                {selectedAction === "reject" && rejectionCategory && (
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Rejection Reason</span>
                    <span className="text-xs font-black text-red-600 bg-red-100/40 px-2 py-0.5 rounded">{rejectionCategory}</span>
                  </div>
                )}

                {selectedAction === "rework" && reworkReason && (
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Rework Reason</span>
                    <span className="text-xs font-black text-orange-600 bg-orange-100/40 px-2 py-0.5 rounded">{reworkReason}</span>
                  </div>
                )}

                {selectedAction === "sla" && newSlaDate && (
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">New Deadline</span>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{new Date(newSlaDate).toLocaleDateString()}</span>
                  </div>
                )}

                {selectedAction !== "escalate" && commentText.trim() && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Comments / Explanation</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg leading-relaxed font-semibold italic">
                      {commentText}
                    </p>
                  </div>
                )}

                {selectedAction === "escalate" && (
                  <>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Escalation Category</span>
                      <span className="text-xs font-black text-red-600 bg-red-100/40 px-2 py-0.5 rounded capitalize border border-red-200/50">
                        {escalationCategories.find(c => c.value === escalationCategory)?.label}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Priority</span>
                      <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        escalationPriority === "critical"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                          : escalationPriority === "high"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}>
                        {escalationPriority}
                      </span>
                    </div>

                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Reason</span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg leading-relaxed font-semibold italic">
                        {commentText}
                      </p>
                    </div>

                    {additionalNotes.trim() && (
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Additional Notes</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg leading-relaxed font-semibold italic">
                          {additionalNotes}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Notify</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200">Reporter</span>
                        {issue.assignedUnitOfficer && (
                          <span className="text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200">Assigned Unit Officer</span>
                        )}
                        {issue.assignedFieldOfficer && (
                          <span className="text-[10px] font-extrabold bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded border border-teal-200">Assigned Field Officer</span>
                        )}
                        <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200">Admin Team</span>
                        {escalationPriority === "critical" && (
                          <span className="text-[10px] font-extrabold bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 animate-pulse">City Admin</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* SUCCESS / ERROR NOTIFICATIONS */}
              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 animate-pulse" />
                  {successMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 justify-between">
                <button
                  type="button"
                  disabled={loading || successMsg}
                  onClick={() => setStep(3)}
                  className="px-5 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back to Form
                </button>
                <button
                  type="button"
                  disabled={loading || successMsg}
                  onClick={executeWorkflowMutation}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Confirm & Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex justify-end z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 rounded-xl text-xs transition-all shadow-sm active:translate-y-0.5"
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
    <svg className="w-3.5 h-3.5 text-amber-400 fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
