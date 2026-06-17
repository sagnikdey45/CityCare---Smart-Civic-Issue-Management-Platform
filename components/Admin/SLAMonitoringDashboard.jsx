import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  AlertTriangle,
  Clock,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  MapPin,
  ArrowUpCircle,
  AlertCircle,
  ShieldAlert,
  Activity,
  BarChart3,
  TrendingUp,
  Zap,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Users,
  Building2,
  Timer,
  Flag,
  Layers,
  CircleDot,
  Info,
  X,
} from "lucide-react";
import { calculateSLAStatus, formatTimeRemaining } from "@/lib/slaConfig";
import { AdminEscalationResolutionModal } from "./AdminEscalationResolutionModal";

// Helper functions

function getEscalationPriorityColor(priority) {
  switch (priority) {
    case "critical":
      return "bg-red-600 text-white";
    case "high":
      return "bg-orange-500 text-white";
    case "medium":
      return "bg-amber-500 text-white";
    default:
      return "bg-slate-500 text-white";
  }
}

function getEscalationCategoryLabel(cat) {
  const map = {
    resource_shortage: "Resource Shortage",
    officer_non_responsiveness: "Officer Non-Responsiveness",
    technical_dependency: "Technical Dependency",
    third_party_dependency: "Third Party Dependency",
    public_safety_risk: "Public Safety Risk",
    environmental_risk: "Environmental Risk",
    citizen_escalation: "Citizen Escalation",
    sla_breach: "SLA Breach",
    administrative_approval_pending: "Administrative Approval Pending",
    other: "Other",
  };
  return (
    map[cat ?? ""] ??
    cat?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ??
    "Unknown"
  );
}

function getIssueDelayHours(issue) {
  if (!issue.sla_deadline) return 0;
  const sla = calculateSLAStatus(issue.sla_deadline);
  return sla.status === "breached" ? sla.hoursRemaining : 0;
}

function getAdminReviewStatus(issue) {
  if (!issue.is_escalated) return "N/A";
  switch (issue.escalation_admin_review_status) {
    case "reviewed":
      return "Reviewed";
    case "resolved":
      return "Resolved";
    case "pending":
      return "Pending Review";
    default:
      return "Pending Review";
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSeverityColor(severity) {
  switch (severity) {
    case "critical":
      return "bg-red-600 text-white";
    case "high":
      return "bg-orange-500 text-white";
    case "medium":
      return "bg-amber-500 text-white";
    case "low":
      return "bg-slate-500 text-white";
    default:
      return "bg-slate-500 text-white";
  }
}

// Action modal

function ActionModal({ issue, action, onClose, onActionConfirmed }) {
  const adminUserId = "2"; // fallback local admin userId matching AdminDashboard context
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [escalationCategory, setEscalationCategory] = useState("resource_shortage");
  const [escalationPriority, setEscalationPriority] = useState("medium");
  const [newSlaDeadline, setNewSlaDeadline] = useState("");
  const [selectedWardOfficer, setSelectedWardOfficer] = useState("");
  const [selectedFieldOfficer, setSelectedFieldOfficer] = useState("");

  const currentActions = issue.escalation_resolution_actions?.filter(
    (a) => a.performed_at >= (issue.escalated_at || 0)
  ) || [];
  const resolutionActions = currentActions.filter(
    (a) => a.type !== "escalate" && a.type !== "review_escalation"
  );
  const hasResolutionAction = resolutionActions.length > 0;

  const [resolutionType, setResolutionType] = useState("approve"); // approve or reject

  const assignable = useQuery(api.admin.getAssignableOfficers);
  const wardOfficers = assignable?.unitOfficers || [];
  const fieldOfficers = assignable?.fieldOfficers || [];

  const escalateMut = useMutation(api.escalation.escalateIssue);
  const reviewMut = useMutation(api.escalation.reviewEscalation);
  const extendSlaMut = useMutation(api.escalation.extendIssueSla);
  const reassignMut = useMutation(api.escalation.reassignIssueOfficer);
  const approveMut = useMutation(api.escalation.approveEscalation);
  const rejectMut = useMutation(api.escalation.rejectEscalation);

  useEffect(() => {
    if (issue.sla_deadline) {
      const deadline = new Date(issue.sla_deadline);
      const formatted = deadline.toISOString().slice(0, 16);
      setNewSlaDeadline(formatted);
    }
    const currentUoId = issue.assigned_officer?.id || issue.assignedUnitOfficer || issue.ward_officer_id;
    const currentFoId = issue.field_officer?.id || issue.assignedFieldOfficer || issue.field_officer_id;
    if (currentUoId) setSelectedWardOfficer(currentUoId);
    if (currentFoId) setSelectedFieldOfficer(currentFoId);
  }, [issue]);

  const titles = {
    escalate: issue.escalated_at ? "Re-escalate Issue" : "Escalate Issue",
    review_escalation: "Review Escalation",
    resolve_escalation: "Resolve Escalation",
    extend_sla: "Extend SLA Deadline",
    reassign: "Reassign Officer",
    view_resolution: "View Resolution",
  };

  const icons = {
    escalate: <ArrowUpCircle className="text-purple-500" size={24} />,
    review_escalation: <Eye className="text-blue-500" size={24} />,
    resolve_escalation: <CheckCircle className="text-emerald-500" size={24} />,
    extend_sla: <Timer className="text-amber-500" size={24} />,
    reassign: <Users className="text-cyan-500" size={24} />,
    view_resolution: <Flag className="text-teal-500" size={24} />,
  };

  const sla = calculateSLAStatus(issue.sla_deadline);

  const handleConfirm = async () => {
    if (action === "view_resolution") {
      onClose();
      return;
    }

    if (action === "escalate" && !notes.trim()) {
      alert("Please enter a reason for escalation");
      return;
    }
    if (action === "resolve_escalation" && !notes.trim()) {
      alert("Please enter notes/reason");
      return;
    }
    if (action === "extend_sla") {
      if (!newSlaDeadline) {
        alert("Please select a new SLA deadline");
        return;
      }
      if (!notes.trim()) {
        alert("Please enter a reason for extension");
        return;
      }
    }
    if (action === "reassign") {
      if (!selectedWardOfficer && !selectedFieldOfficer) {
        alert("Please select at least one officer to reassign");
        return;
      }
      if (!notes.trim()) {
        alert("Please enter reassignment notes");
        return;
      }
    }

    setLoading(true);
    try {
      if (action === "escalate") {
        await escalateMut({
          issueId: issue.id,
          escalationCategory,
          escalationPriority,
          escalationReason: notes,
          adminUserId,
        });
      } else if (action === "review_escalation") {
        await reviewMut({
          issueId: issue.id,
          reviewedBy: adminUserId,
        });
      } else if (action === "resolve_escalation") {
        if (resolutionType === "approve") {
          await approveMut({
            issueId: issue.id,
            notes,
            adminId: adminUserId,
          });
        } else {
          await rejectMut({
            issueId: issue.id,
            reason: notes,
            adminId: adminUserId,
          });
        }
      } else if (action === "extend_sla") {
        await extendSlaMut({
          issueId: issue.id,
          newDeadline: new Date(newSlaDeadline).getTime(),
          notes,
          adminId: adminUserId,
        });
      } else if (action === "reassign") {
        await reassignMut({
          issueId: issue.id,
          newUnitOfficerId: selectedWardOfficer || undefined,
          newFieldOfficerId: selectedFieldOfficer || undefined,
          notes,
          adminId: adminUserId,
        });
      }

      onActionConfirmed();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Action failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
              {icons[action]}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {titles[action]}
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                {issue.ticket_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Issue Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-2">
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {issue.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${getSeverityColor(issue.severity)}`}
              >
                {issue.severity?.toUpperCase()}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                  sla.status === "breached"
                    ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                    : sla.status === "at_risk"
                      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                      : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                SLA: {sla.status.replace("_", " ").toUpperCase()}
              </span>
              {issue.is_escalated && (
                <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  ESCALATED
                </span>
              )}
            </div>
            {issue.is_escalated && (
              <div className="pt-1 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div>
                  Priority:{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {issue.escalation_priority?.toUpperCase() ?? "—"}
                  </span>
                </div>
                <div>
                  Category:{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {getEscalationCategoryLabel(issue.escalation_category)}
                  </span>
                </div>
                <div>
                  Escalated:{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {formatDateTime(issue.escalated_at)}
                  </span>
                </div>
                <div>
                  Review Status:{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {getAdminReviewStatus(issue)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Form Controls */}
          {action === "escalate" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Escalation Category</label>
                <select
                  value={escalationCategory}
                  onChange={(e) => setEscalationCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="resource_shortage">Resource Shortage</option>
                  <option value="officer_non_responsiveness">Officer Non-Responsiveness</option>
                  <option value="technical_dependency">Technical Dependency</option>
                  <option value="third_party_dependency">Third Party Dependency</option>
                  <option value="public_safety_risk">Public Safety Risk</option>
                  <option value="environmental_risk">Environmental Risk</option>
                  <option value="citizen_escalation">Citizen Escalation</option>
                  <option value="sla_breach">SLA Breach</option>
                  <option value="administrative_approval_pending">Administrative Approval Pending</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Escalation Priority</label>
                <select
                  value={escalationPriority}
                  onChange={(e) => setEscalationPriority(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Reason for Escalation *</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide a detailed reason for escalating this issue..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {action === "review_escalation" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                You are marking this escalation as reviewed. This will update the admin review status and notify the assigned officers that the escalation is under active consideration.
              </p>
            </div>
          )}

          {action === "resolve_escalation" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Resolution Action</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={resolutionType === "approve"}
                      onChange={() => setResolutionType("approve")}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    Approve & Resolve
                  </label>
                  {!hasResolutionAction && (
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        checked={resolutionType === "reject"}
                        onChange={() => setResolutionType("reject")}
                        className="text-red-500 focus:ring-red-500"
                      />
                      Reject Issue
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {resolutionType === "approve" ? "Resolution Notes *" : "Rejection Reason *"}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={resolutionType === "approve" ? "Provide details on how the escalation was resolved..." : "Provide the reason why this issue/escalation is being rejected..."}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {action === "extend_sla" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">New SLA Deadline *</label>
                <input
                  type="datetime-local"
                  value={newSlaDeadline}
                  onChange={(e) => setNewSlaDeadline(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Reason for Extension *</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide notes/reason for extending the SLA deadline..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {action === "reassign" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Ward Officer (Unit Verification)</label>
                <select
                  value={selectedWardOfficer}
                  onChange={(e) => setSelectedWardOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- No Change / Select Ward Officer --</option>
                  {wardOfficers.map((o) => (
                    <option key={o.userId} value={o.userId}>
                      {o.fullName} {o.department ? `(${o.department})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Field Officer (Issue Resolution)</label>
                <select
                  value={selectedFieldOfficer}
                  onChange={(e) => setSelectedFieldOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- No Change / Select Field Officer --</option>
                  {fieldOfficers.map((o) => (
                    <option key={o.userId} value={o.userId}>
                      {o.fullName} {o.department ? `(${o.department})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Reassignment Notes *</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide notes/reason for this officer reassignment..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {action === "view_resolution" && (
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/40 rounded-xl p-4 space-y-2">
              <div>
                <span className="text-xs font-bold text-teal-800 dark:text-teal-400">Resolution Date:</span>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {formatDateTime(issue.escalation_resolved_at)}
                </p>
              </div>
              <div>
                <span className="text-xs font-bold text-teal-800 dark:text-teal-400">Resolution Notes:</span>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {issue.escalation_resolution_notes || "No resolution notes provided."}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || (action === "view_resolution")}
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 text-white font-bold hover:from-slate-600 hover:to-slate-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                action === "view_resolution" ? "View Only" : "Confirm Action"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Escalation Analytics

function EscalationAnalyticsSection({ issues }) {
  const escalated = issues.filter((i) => i.is_escalated);

  const byCategory = useMemo(() => {
    const counts = {};
    escalated.forEach((i) => {
      const key = i.escalation_category ?? "other";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [escalated]);

  const byDept = useMemo(() => {
    const counts = {};
    issues.forEach((i) => {
      const key = i.category ?? "Other";
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [issues]);

  const mostDelayed = useMemo(() => {
    return [...issues]
      .filter((i) => getIssueDelayHours(i) > 0)
      .sort((a, b) => getIssueDelayHours(b) - getIssueDelayHours(a))
      .slice(0, 5);
  }, [issues]);

  const maxDept = Math.max(...byDept.map(([, v]) => v), 1);
  const maxCat = Math.max(...byCategory.map(([, v]) => v), 1);

  const deptColors = [
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-violet-500 to-purple-500",
    "from-slate-500 to-gray-500",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Issues by Department */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-md">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-sm">
              Issues by Department
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Active issue distribution
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {byDept.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
              No data available
            </p>
          ) : (
            byDept.map(([dept, count], i) => (
              <div key={dept}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                    {dept}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {count}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${deptColors[i % deptColors.length]} rounded-full transition-all duration-700`}
                    style={{ width: `${(count / maxDept) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Escalation Categories */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-sm">
              Escalation Categories
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Top escalation reasons
            </p>
          </div>
        </div>
        {escalated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle size={36} className="text-emerald-400 mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Escalations
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              All issues are within normal workflow
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {byCategory.map(([cat, count]) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                    {getEscalationCategoryLabel(cat)}
                  </span>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                    {count}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${(count / maxCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Most Delayed Issues */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-md">
            <Timer size={18} className="text-white" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white text-sm">
              Most Delayed Issues
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Top SLA overdue by hours
            </p>
          </div>
        </div>
        {mostDelayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle size={36} className="text-emerald-400 mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Overdue Issues
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              All SLA deadlines are currently met
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {mostDelayed.map((issue, i) => {
              const delay = getIssueDelayHours(issue);
              return (
                <div
                  key={issue.id}
                  className="flex items-center gap-3 bg-red-50/60 dark:bg-red-900/10 rounded-2xl px-3 py-2.5 border border-red-100 dark:border-red-900/30"
                >
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {issue.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {issue.ticket_id}
                    </p>
                  </div>
                  <span className="text-xs font-black text-red-600 dark:text-red-400 whitespace-nowrap">
                    {Math.floor(delay)}h
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Escalation timeline preview

function EscalationTimeline({ issue }) {
  const currentActions = issue.escalation_resolution_actions?.filter(
    (a) => a.performed_at >= (issue.escalated_at || 0)
  ) || [];

  const reviewAction = currentActions.find(
    (a) => a.type === "review_escalation"
  );

  const resolutionActions = currentActions.filter(
    (a) => a.type !== "escalate" && a.type !== "review_escalation"
  );
  const hasResolutionAction = resolutionActions.length > 0;
  const resolutionActionTime = resolutionActions[0]?.performed_at || null;

  const reviewTime =
    reviewAction?.performed_at ||
    (issue.escalation_admin_review_status === "resolved" ||
    issue.escalation_admin_review_status === "reviewed"
      ? (resolutionActionTime || issue.escalation_resolved_at)
      : null) ||
    null;

  const steps = [
    {
      label: "Escalated",
      done: !!issue.escalated_at,
      time: issue.escalated_at,
    },
    {
      label: "Admin Reviewed",
      done:
        issue.escalation_admin_review_status === "reviewed" ||
        issue.escalation_admin_review_status === "resolved",
      time: reviewTime,
    },
    {
      label: "Resolution Action",
      done: hasResolutionAction || issue.escalation_resolved,
      time: resolutionActionTime,
    },
    {
      label: "Escalation Closed",
      done: !!issue.escalation_resolved,
      time: issue.escalation_resolved_at,
    },
  ];

  return (
    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800/50">
      <p className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-widest mb-2">
        Escalation Timeline
      </p>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step.done
                    ? "bg-emerald-500 border-emerald-500"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                }`}
              >
                {step.done ? (
                  <CheckCircle size={10} className="text-white" />
                ) : (
                  <CircleDot size={10} className="text-slate-400" />
                )}
              </div>
              <span className="text-[9px] font-semibold text-center leading-tight text-slate-500 dark:text-slate-400 w-14">
                {step.label}
              </span>
              {step.time && (
                <span className="text-[8px] text-slate-400 dark:text-slate-500 text-center leading-tight">
                  {formatDateTime(step.time)}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mb-4 transition-colors ${
                  steps[i + 1].done
                    ? "bg-emerald-400"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Issue card

function IssueCard({ issue, onAction, onViewIssue, onOpenEscalation }) {
  const [expanded, setExpanded] = useState(false);
  const sla = calculateSLAStatus(issue.sla_deadline);
  const isEscalated = !!issue.is_escalated;
  const hasBeenEscalated = !!issue.escalated_at;

  const currentActions = issue.escalation_resolution_actions?.filter(
    (a) => a.performed_at >= (issue.escalated_at || 0)
  ) || [];
  const resolutionActions = currentActions.filter(
    (a) => a.type !== "escalate" && a.type !== "review_escalation"
  );
  const hasResolutionAction = resolutionActions.length > 0;
  const isBreached = sla.status === "breached";
  const isAtRisk = sla.status === "at_risk";

  const cardBorder =
    isEscalated && isBreached
      ? "border-2 border-red-500 ring-2 ring-purple-500 ring-offset-2"
      : isEscalated
        ? "border-2 border-purple-400 ring-2 ring-purple-400 ring-offset-1"
        : isBreached
          ? "border-2 border-red-400"
          : isAtRisk
            ? "border-2 border-amber-400"
            : "border border-slate-200 dark:border-slate-700";

  const cardBg =
    isEscalated && isBreached
      ? "bg-gradient-to-br from-red-50 via-rose-50 to-purple-50 dark:from-red-900/10 dark:via-rose-900/10 dark:to-purple-900/10"
      : isEscalated
        ? "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10"
        : isBreached
          ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10"
          : isAtRisk
            ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10"
            : "bg-white dark:bg-slate-800/80";

  const slaTextColor = isBreached
    ? "text-red-700 dark:text-red-300"
    : isAtRisk
      ? "text-amber-700 dark:text-amber-300"
      : "text-emerald-700 dark:text-emerald-300";

  return (
    <div
      className={`${cardBg} ${cardBorder} rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden`}
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-xs font-black text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl">
              {issue.ticket_id}
            </code>
            <span
              className={`text-[11px] font-black px-2.5 py-1 rounded-xl ${getSeverityColor(issue.severity)}`}
            >
              {issue.severity?.toUpperCase()}
            </span>
            {isEscalated && (
              <span
                className={`text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 ${getEscalationPriorityColor(issue.escalation_priority)}`}
              >
                <ArrowUpCircle size={10} />
                ESC ×{issue.escalation_count ?? 1}
              </span>
            )}
            {issue.internal_status && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {issue.internal_status
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            )}
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
          >
            {expanded ? (
              <ChevronDown
                size={14}
                className="text-slate-600 dark:text-slate-300"
              />
            ) : (
              <ChevronRight
                size={14}
                className="text-slate-600 dark:text-slate-300"
              />
            )}
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-3 leading-snug">
          {issue.title}
        </h3>

        {/* Issue info grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Filter size={11} className="flex-shrink-0" />
            <span className="font-medium truncate">
              {issue.category}
              {issue.subcategory ? ` · ${issue.subcategory}` : ""}
            </span>
          </div>
          {issue.location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <MapPin size={11} className="flex-shrink-0" />
              <span className="font-medium truncate">{issue.location}</span>
            </div>
          )}
          {issue.assigned_officer && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <User size={11} className="flex-shrink-0" />
              <span className="font-medium truncate">
                Unit: {issue.assigned_officer.full_name}
              </span>
            </div>
          )}
          {issue.field_officer && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Users size={11} className="flex-shrink-0" />
              <span className="font-medium truncate">
                Field: {issue.field_officer.full_name}
              </span>
            </div>
          )}
        </div>

        {/* SLA bar */}
        <div className="bg-white/70 dark:bg-slate-900/40 rounded-2xl p-3 mb-4 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-slate-500" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                SLA Status
              </span>
            </div>
            <span className={`text-sm font-black ${slaTextColor}`}>
              {formatTimeRemaining(sla.hoursRemaining, sla.status)}
            </span>
          </div>
          {issue.sla_deadline && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mb-2">
              <Calendar size={10} />
              <span>Deadline: {formatDateTime(issue.sla_deadline)}</span>
            </div>
          )}
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isBreached
                  ? "bg-gradient-to-r from-red-500 to-rose-500 w-full"
                  : isAtRisk
                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                    : "bg-gradient-to-r from-emerald-400 to-teal-500"
              }`}
              style={
                isBreached
                  ? {}
                  : {
                      width: `${Math.max(5, Math.min(100, sla.percentageRemaining))}%`,
                    }
              }
            />
          </div>
        </div>

        {/* Escalation summary (always visible if escalated) */}
        {hasBeenEscalated && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpCircle
                size={13}
                className="text-purple-600 dark:text-purple-400"
              />
              <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                Escalation Details
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  Category:
                </span>{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {getEscalationCategoryLabel(issue.escalation_category)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  Priority:
                </span>{" "}
                <span
                  className={`font-black ${
                    issue.escalation_priority === "critical"
                      ? "text-red-600 dark:text-red-400"
                      : issue.escalation_priority === "high"
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {issue.escalation_priority?.toUpperCase() ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  Escalated by:
                </span>{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {issue.escalated_by ?? "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  Review:
                </span>{" "}
                <span
                  className={`font-bold ${
                    issue.escalation_admin_review_status === "resolved"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : issue.escalation_admin_review_status === "reviewed"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {getAdminReviewStatus(issue)}
                </span>
              </div>
            </div>
            {issue.escalation_resolved && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle size={10} />
                Escalation resolved at{" "}
                {formatDateTime(issue.escalation_resolved_at)}
              </div>
            )}
          </div>
        )}

        {/* Expanded content */}
        {expanded && (
          <div className="space-y-4">
            {/* Resolution Actions */}
            {(issue.escalation_resolution_actions?.length ?? 0) > 0 && (
              <div className="bg-white/70 dark:bg-slate-900/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Resolution Actions Taken
                </p>
                <div className="space-y-2">
                  {issue.escalation_resolution_actions.map((a, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                        <CheckCircle
                          size={10}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {a.type
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {" "}
                          by {a.performed_by}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {formatDateTime(a.performed_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {hasBeenEscalated && <EscalationTimeline issue={issue} />}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {!hasBeenEscalated && !isBreached && !isAtRisk && (
            <>
              <ActionBtn
                onClick={() => onViewIssue(issue)}
                variant="default"
                icon={<Eye size={12} />}
              >
                View
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "escalate")}
                variant="purple"
                icon={<ArrowUpCircle size={12} />}
              >
                Escalate
              </ActionBtn>
            </>
          )}
          {!hasBeenEscalated && isAtRisk && (
            <>
              <ActionBtn
                onClick={() => onViewIssue(issue)}
                variant="default"
                icon={<Eye size={12} />}
              >
                View
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "extend_sla")}
                variant="amber"
                icon={<Timer size={12} />}
              >
                Extend SLA
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "reassign")}
                variant="cyan"
                icon={<Users size={12} />}
              >
                Reassign
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "escalate")}
                variant="purple"
                icon={<ArrowUpCircle size={12} />}
              >
                Escalate
              </ActionBtn>
            </>
          )}
          {!hasBeenEscalated && isBreached && (
            <>
              <ActionBtn
                onClick={() => onViewIssue(issue)}
                variant="default"
                icon={<Eye size={12} />}
              >
                View
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "extend_sla")}
                variant="amber"
                icon={<Timer size={12} />}
              >
                Extend SLA
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "reassign")}
                variant="cyan"
                icon={<Users size={12} />}
              >
                Reassign
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "escalate")}
                variant="red"
                icon={<ShieldAlert size={12} />}
              >
                Escalate to Admin
              </ActionBtn>
            </>
          )}
          {hasBeenEscalated && !issue.escalation_resolved && (
            <>
              <ActionBtn
                onClick={() => onOpenEscalation(issue)}
                variant="purple"
                icon={<Eye size={12} />}
              >
                Review
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "resolve_escalation")}
                variant="emerald"
                icon={<CheckCircle size={12} />}
              >
                Resolve
              </ActionBtn>
              {!hasResolutionAction && (
                <ActionBtn
                  onClick={() => onAction(issue, "reassign")}
                  variant="cyan"
                  icon={<Users size={12} />}
                >
                  Reassign
                </ActionBtn>
              )}
              {!hasResolutionAction && (
                <ActionBtn
                  onClick={() => onAction(issue, "extend_sla")}
                  variant="amber"
                  icon={<Timer size={12} />}
                >
                  Extend SLA
                </ActionBtn>
              )}
              <ActionBtn
                onClick={() => onViewIssue(issue)}
                variant="default"
                icon={<Eye size={12} />}
              >
                View Issue
              </ActionBtn>
            </>
          )}
          {hasBeenEscalated && issue.escalation_resolved && (
            <>
              <ActionBtn
                onClick={() => onAction(issue, "view_resolution")}
                variant="teal"
                icon={<Flag size={12} />}
              >
                View Resolution
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "escalate")}
                variant="purple"
                icon={<ArrowUpCircle size={12} />}
              >
                Re-escalate
              </ActionBtn>
              <ActionBtn
                onClick={() => onViewIssue(issue)}
                variant="default"
                icon={<Eye size={12} />}
              >
                View Issue
              </ActionBtn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, variant, icon }) {
  const styles = {
    default:
      "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600",
    purple: "bg-purple-600 text-white hover:bg-purple-700 shadow-sm",
    red: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    amber: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
    emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    cyan: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm",
    teal: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-150 ${styles[variant]}`}
    >
      {icon}
      {children}
    </button>
  );
}

// Empty states

function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-5">
        {icon}
      </div>
      <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        {description}
      </p>
    </div>
  );
}

// KPI card

function KpiCard({ icon, label, value, sublabel, gradient, border, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 ${border} ${onClick ? "cursor-pointer hover:-translate-y-1" : ""} p-5`}
    >
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 rounded-full transition-opacity duration-300`}
      />
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-md`}
        >
          <span className="text-white">{icon}</span>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-900 dark:text-white leading-none tabular-nums">
            {value}
          </div>
        </div>
      </div>
      <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {label}
      </div>
      {sublabel && (
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          {sublabel}
        </div>
      )}
    </div>
  );
}

// Main component

export default function SLAMonitoringDashboard({ onViewIssue }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [slaFilter, setSlaFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [escalatedFilter, setEscalatedFilter] = useState("all");
  const [escalationPriorityFilter, setEscalationPriorityFilter] =
    useState("all");
  const [escalationCategoryFilter, setEscalationCategoryFilter] =
    useState("all");
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const queryIssues = useQuery(api.escalation.getSlaMonitoringIssues);

  useEffect(() => {
    if (queryIssues !== undefined) {
      setIssues(queryIssues);
      setLoading(false);
    }
  }, [queryIssues]);

  const fetchIssues = () => {
    // Convex query updates automatically on mutation completion.
  };

  const stats = useMemo(() => {
    const onTrack = issues.filter(
      (i) => calculateSLAStatus(i.sla_deadline).status === "on_track",
    ).length;
    const atRisk = issues.filter(
      (i) => calculateSLAStatus(i.sla_deadline).status === "at_risk",
    ).length;
    const breached = issues.filter(
      (i) => calculateSLAStatus(i.sla_deadline).status === "breached",
    ).length;
    const escalated = issues.filter((i) => i.is_escalated === true).length;
    const criticalEsc = issues.filter(
      (i) => i.is_escalated && i.escalation_priority === "critical",
    ).length;
    const pendingReview = issues.filter(
      (i) =>
        i.is_escalated &&
        (i.escalation_admin_review_status === "pending" ||
          !i.escalation_admin_review_status),
    ).length;
    const resolvedEsc = issues.filter(
      (i) => !!i.escalated_at && i.escalation_resolved === true,
    ).length;
    const repeated = issues.filter((i) => (i.escalation_count ?? 0) > 1).length;
    const delayedIssues = issues.filter((i) => getIssueDelayHours(i) > 0);
    const avgDelay = delayedIssues.length
      ? Math.round(
          delayedIssues.reduce((s, i) => s + getIssueDelayHours(i), 0) /
            delayedIssues.length,
        )
      : 0;
    return {
      total: issues.length,
      onTrack,
      atRisk,
      breached,
      escalated,
      criticalEsc,
      pendingReview,
      resolvedEsc,
      repeated,
      avgDelay,
    };
  }, [issues]);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(issues.map((i) => i.category)))],
    [issues],
  );

  const filteredIssues = useMemo(() => {
    let filtered = [...issues];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.ticket_id.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.location ?? "").toLowerCase().includes(q),
      );
    }

    if (slaFilter !== "all") {
      filtered = filtered.filter(
        (i) => calculateSLAStatus(i.sla_deadline).status === slaFilter,
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((i) => i.category === categoryFilter);
    }

    if (escalatedFilter === "escalated") {
      filtered = filtered.filter((i) => i.is_escalated === true);
    } else if (escalatedFilter === "normal") {
      filtered = filtered.filter((i) => !i.is_escalated);
    } else if (escalatedFilter === "pending_review") {
      filtered = filtered.filter(
        (i) =>
          i.is_escalated &&
          (i.escalation_admin_review_status === "pending" ||
            !i.escalation_admin_review_status),
      );
    } else if (escalatedFilter === "escalation_resolved") {
      filtered = filtered.filter(
        (i) => !!i.escalated_at && i.escalation_resolved === true,
      );
    }

    if (escalationPriorityFilter !== "all") {
      filtered = filtered.filter(
        (i) => i.escalation_priority === escalationPriorityFilter,
      );
    }

    if (escalationCategoryFilter !== "all") {
      filtered = filtered.filter(
        (i) => i.escalation_category === escalationCategoryFilter,
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          if (!a.sla_deadline) return 1;
          if (!b.sla_deadline) return -1;
          return (
            new Date(a.sla_deadline).getTime() -
            new Date(b.sla_deadline).getTime()
          );
        case "severity": {
          const o = { critical: 0, high: 1, medium: 2, low: 3 };
          return (o[a.severity] ?? 4) - (o[b.severity] ?? 4);
        }
        case "delay":
          return getIssueDelayHours(b) - getIssueDelayHours(a);
        case "escalation_priority": {
          const p = { critical: 0, high: 1, medium: 2 };
          return (
            (p[a.escalation_priority] ?? 3) - (p[b.escalation_priority] ?? 3)
          );
        }
        case "escalation_count":
          return (b.escalation_count ?? 0) - (a.escalation_count ?? 0);
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    issues,
    searchTerm,
    slaFilter,
    categoryFilter,
    escalatedFilter,
    escalationPriorityFilter,
    escalationCategoryFilter,
    sortBy,
  ]);

  // Quick-filter handlers for alert banner buttons
  const handleShowBreached = () => {
    setSlaFilter("breached");
    setEscalatedFilter("all");
  };
  const handleShowEscalated = () => {
    setEscalatedFilter("escalated");
    setSlaFilter("all");
  };
  const handleShowCritical = () => {
    setEscalationPriorityFilter("critical");
    setEscalatedFilter("escalated");
  };

  // Placeholder action handlers
  const handleEscalate = (i) =>
    setActionModal({ issue: i, action: "escalate" });
  const handleReviewEscalation = (i) =>
    setActionModal({ issue: i, action: "review_escalation" });
  const handleResolveEscalation = (i) =>
    setActionModal({ issue: i, action: "resolve_escalation" });
  const handleExtendSLA = (i) =>
    setActionModal({ issue: i, action: "extend_sla" });
  const handleReassignOfficer = (i) =>
    setActionModal({ issue: i, action: "reassign" });
  const handleViewResolution = (i) =>
    setActionModal({ issue: i, action: "view_resolution" });

  const handleCardAction = (issue, action) => {
    switch (action) {
      case "escalate":
        handleEscalate(issue);
        break;
      case "review_escalation":
        handleReviewEscalation(issue);
        break;
      case "resolve_escalation":
        handleResolveEscalation(issue);
        break;
      case "extend_sla":
        handleExtendSLA(issue);
        break;
      case "reassign":
        handleReassignOfficer(issue);
        break;
      case "view_resolution":
        handleViewResolution(issue);
        break;
    }
  };

  const escalationCategories = [
    "all",
    "resource_shortage",
    "officer_non_responsiveness",
    "technical_dependency",
    "third_party_dependency",
    "public_safety_risk",
    "environmental_risk",
    "citizen_escalation",
    "sla_breach",
    "administrative_approval_pending",
    "other",
  ];

  return (
    <div className="space-y-7">
      {/* ── Critical Alert Banner ──────────────────────────────────────────── */}
      {(stats.breached > 0 || stats.escalated > 0) && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 dark:from-red-700 dark:via-rose-700 dark:to-orange-700 rounded-3xl shadow-2xl border-2 border-red-300/50 dark:border-red-500/40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.12),transparent_60%)]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-sm" />
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm flex-shrink-0 shadow-xl">
                  <AlertTriangle
                    size={30}
                    className="text-white animate-pulse"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-1">
                    Immediate Administrative Attention Required
                  </h3>
                  <p className="text-red-100 font-medium text-sm">
                    Civic issues are awaiting urgent admin intervention
                  </p>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {stats.breached > 0 && (
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5">
                        <XCircle size={13} className="text-red-200" />
                        <span className="text-white text-xs font-black">
                          {stats.breached} SLA Breaches
                        </span>
                      </div>
                    )}
                    {stats.escalated > 0 && (
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5">
                        <ArrowUpCircle size={13} className="text-purple-200" />
                        <span className="text-white text-xs font-black">
                          {stats.escalated} Escalations
                        </span>
                      </div>
                    )}
                    {stats.criticalEsc > 0 && (
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5">
                        <ShieldAlert size={13} className="text-orange-200" />
                        <span className="text-white text-xs font-black">
                          {stats.criticalEsc} Critical
                        </span>
                      </div>
                    )}
                    {stats.avgDelay > 0 && (
                      <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5">
                        <Timer size={13} className="text-yellow-200" />
                        <span className="text-white text-xs font-black">
                          Avg {stats.avgDelay}h delay
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                {stats.breached > 0 && (
                  <button
                    onClick={handleShowBreached}
                    className="flex items-center gap-2 bg-white text-red-700 font-black text-xs px-4 py-2.5 rounded-2xl hover:bg-red-50 transition-colors shadow-lg"
                  >
                    <XCircle size={13} />
                    Show Breached
                  </button>
                )}
                {stats.escalated > 0 && (
                  <button
                    onClick={handleShowEscalated}
                    className="flex items-center gap-2 bg-purple-700 text-white font-black text-xs px-4 py-2.5 rounded-2xl hover:bg-purple-600 transition-colors shadow-lg border border-purple-500"
                  >
                    <ArrowUpCircle size={13} />
                    Show Escalated
                  </button>
                )}
                {stats.criticalEsc > 0 && (
                  <button
                    onClick={handleShowCritical}
                    className="flex items-center gap-2 bg-orange-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl hover:bg-orange-400 transition-colors shadow-lg"
                  >
                    <ShieldAlert size={13} />
                    Show Critical
                  </button>
                )}
                <button
                  onClick={fetchIssues}
                  className="flex items-center gap-2 bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-2xl hover:bg-white/30 transition-colors"
                >
                  <RefreshCw size={13} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Grid: Escalation Command Center ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Escalation Command Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time SLA and escalation operations overview
              </p>
            </div>
          </div>
          <button
            onClick={fetchIssues}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 hover:shadow-md transition-all"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            icon={<Clock size={20} />}
            label="Total Active"
            value={stats.total}
            sublabel="All open issues"
            gradient="from-blue-500 to-cyan-600"
            border="border-blue-200 dark:border-blue-800/60"
          />
          <KpiCard
            icon={<CheckCircle size={20} />}
            label="SLA On Track"
            value={stats.onTrack}
            sublabel="Within deadline"
            gradient="from-emerald-500 to-teal-600"
            border="border-emerald-200 dark:border-emerald-800/60"
            onClick={() => setSlaFilter("on_track")}
          />
          <KpiCard
            icon={<AlertCircle size={20} />}
            label="SLA At Risk"
            value={stats.atRisk}
            sublabel="Approaching deadline"
            gradient="from-amber-500 to-orange-500"
            border="border-amber-200 dark:border-amber-800/60"
            onClick={() => setSlaFilter("at_risk")}
          />
          <KpiCard
            icon={<XCircle size={20} />}
            label="SLA Breached"
            value={stats.breached}
            sublabel="Deadline exceeded"
            gradient="from-red-500 to-rose-600"
            border="border-red-200 dark:border-red-800/60"
            onClick={handleShowBreached}
          />
          <KpiCard
            icon={<ArrowUpCircle size={20} />}
            label="Escalated Issues"
            value={stats.escalated}
            sublabel="Admin action needed"
            gradient="from-purple-500 to-indigo-600"
            border="border-purple-200 dark:border-purple-800/60"
            onClick={handleShowEscalated}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
          <KpiCard
            icon={<ShieldAlert size={20} />}
            label="Critical Escalations"
            value={stats.criticalEsc}
            sublabel="Priority: Critical"
            gradient="from-red-600 to-orange-600"
            border="border-red-300 dark:border-red-700/60"
            onClick={handleShowCritical}
          />
          <KpiCard
            icon={<Eye size={20} />}
            label="Pending Admin Review"
            value={stats.pendingReview}
            sublabel="Awaiting review"
            gradient="from-violet-500 to-purple-600"
            border="border-violet-200 dark:border-violet-800/60"
            onClick={() => setEscalatedFilter("pending_review")}
          />
          <KpiCard
            icon={<Flag size={20} />}
            label="Resolved Escalations"
            value={stats.resolvedEsc}
            sublabel="Successfully closed"
            gradient="from-teal-500 to-cyan-600"
            border="border-teal-200 dark:border-teal-800/60"
            onClick={() => setEscalatedFilter("escalation_resolved")}
          />
          <KpiCard
            icon={<Timer size={20} />}
            label="Avg Delay Time"
            value={`${stats.avgDelay}h`}
            sublabel="Across breached issues"
            gradient="from-slate-600 to-slate-700"
            border="border-slate-200 dark:border-slate-700"
          />
          <KpiCard
            icon={<TrendingUp size={20} />}
            label="Repeated Escalations"
            value={stats.repeated}
            sublabel="Escalated 2+ times"
            gradient="from-pink-500 to-rose-500"
            border="border-pink-200 dark:border-pink-800/60"
          />
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={15} className="text-slate-400" />
          <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Filters & Search
          </span>
          {(searchTerm ||
            slaFilter !== "all" ||
            categoryFilter !== "all" ||
            escalatedFilter !== "all" ||
            escalationPriorityFilter !== "all" ||
            escalationCategoryFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSlaFilter("all");
                setCategoryFilter("all");
                setEscalatedFilter("all");
                setEscalationPriorityFilter("all");
                setEscalationCategoryFilter("all");
              }}
              className="ml-auto flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <X size={12} />
              Clear All
            </button>
          )}
        </div>

        {/* Search row */}
        <div className="relative mb-4">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, ticket ID, category, or location..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
          />
        </div>

        {/* Filter grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Escalation Status
            </label>
            <select
              value={escalatedFilter}
              onChange={(e) => setEscalatedFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option value="all">All</option>
              <option value="normal">Not Escalated</option>
              <option value="escalated">Escalated</option>
              <option value="pending_review">Pending Review</option>
              <option value="escalation_resolved">Escalation Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Esc. Priority
            </label>
            <select
              value={escalationPriorityFilter}
              onChange={(e) => setEscalationPriorityFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            >
              <option value="all">All</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Esc. Category
            </label>
            <select
              value={escalationCategoryFilter}
              onChange={(e) => setEscalationCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            >
              {escalationCategories.map((c) => (
                <option key={c} value={c}>
                  {c === "all"
                    ? "All Categories"
                    : getEscalationCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              SLA Status
            </label>
            <select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All</option>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="breached">Breached</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Department
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All Departments" : c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="deadline">Deadline</option>
              <option value="severity">Severity</option>
              <option value="delay">Delay Duration</option>
              <option value="escalation_priority">Esc. Priority</option>
              <option value="escalation_count">Esc. Count</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Result count */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-black text-slate-800 dark:text-slate-200">
              {filteredIssues.length}
            </span>{" "}
            of{" "}
            <span className="font-black text-slate-800 dark:text-slate-200">
              {issues.length}
            </span>{" "}
            issues
          </span>
          <button
            onClick={() => setShowAnalytics((v) => !v)}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <BarChart3 size={13} />
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>
        </div>
      </div>

      {/* ── Analytics Section ─────────────────────────────────────────────── */}
      {showAnalytics && <EscalationAnalyticsSection issues={issues} />}

      {/* ── Issue List ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center">
            <Zap size={15} className="text-white" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Issue Queue
          </h3>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-1">
            {filteredIssues.length} issues
          </span>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-16 text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-bold">
              Loading SLA data...
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Fetching active issues from database
            </p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            {issues.length === 0 ? (
              <EmptyState
                icon={<CheckCircle size={36} className="text-emerald-400" />}
                title="All Clear — No Active Issues"
                description="There are no active civic issues to monitor right now. The city is running smoothly."
              />
            ) : slaFilter === "breached" ? (
              <EmptyState
                icon={<CheckCircle size={36} className="text-emerald-400" />}
                title="No SLA Breaches"
                description="All active issues are within their SLA deadlines. Great operational performance."
              />
            ) : escalatedFilter === "escalated" ? (
              <EmptyState
                icon={
                  <ShieldAlert
                    size={36}
                    className="text-slate-400 dark:text-slate-500"
                  />
                }
                title="No Escalations"
                description="No issues have been escalated. All civic reports are progressing through normal workflows."
              />
            ) : (
              <EmptyState
                icon={
                  <Search
                    size={36}
                    className="text-slate-400 dark:text-slate-500"
                  />
                }
                title="No Matching Issues"
                description="No issues match your current filter combination. Try adjusting the filters or clearing them."
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onAction={handleCardAction}
                onViewIssue={onViewIssue}
                onOpenEscalation={(i) => setSelectedEscalation(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {selectedEscalation && (
        <AdminEscalationResolutionModal
          issue={selectedEscalation}
          onClose={() => setSelectedEscalation(null)}
          onResolved={() => {
            setSelectedEscalation(null);
            fetchIssues();
          }}
        />
      )}

      {actionModal && (
        <ActionModal
          issue={actionModal.issue}
          action={actionModal.action}
          onClose={() => setActionModal(null)}
          onActionConfirmed={fetchIssues}
        />
      )}
    </div>
  );
}
