import { getMockUsers } from "@/lib/mockData";
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
} from "lucide-react";
import { useEffect, useState } from "react";

const statusStyles = {
  pending: {
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
    border: "border-amber-200",
    text: "text-amber-800",
    badge: "bg-amber-100 border-amber-300",
    icon: Clock,
  },
  in_progress: {
    bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
    border: "border-blue-200",
    text: "text-blue-800",
    badge: "bg-blue-100 border-blue-300",
    icon: Zap,
  },
  resolved: {
    bg: "bg-gradient-to-br from-emerald-50 to-green-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    badge: "bg-emerald-100 border-emerald-300",
    icon: CheckCircle2,
  },
  rejected: {
    bg: "bg-gradient-to-br from-red-50 to-rose-50",
    border: "border-red-200",
    text: "text-red-800",
    badge: "bg-red-100 border-red-300",
    icon: XCircle,
  },
};

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const categoryData = {
  road: {
    label: "Road & Infrastructure",
    icon: "🛣️",
    color: "from-slate-500 to-slate-600",
  },
  lighting: {
    label: "Street Lighting",
    icon: "💡",
    color: "from-yellow-500 to-amber-500",
  },
  waste: {
    label: "Waste Management",
    icon: "🗑️",
    color: "from-green-500 to-emerald-600",
  },
  water: {
    label: "Water Supply",
    icon: "💧",
    color: "from-blue-500 to-cyan-500",
  },
  other: { label: "Other", icon: "📋", color: "from-gray-500 to-gray-600" },
};

export function AdminIssueModal({
  issue,
  onClose,
  onUpdated,
  fromAssignmentView,
  onReassign,
  onRevoke,
}) {
  const [action, setAction] = useState("status");
  const [newStatus, setNewStatus] = useState("pending");
  const [assignTo, setAssignTo] = useState("");
  const [wardOfficerId, setWardOfficerId] = useState("");
  const [fieldOfficerId, setFieldOfficerId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [revokeReason, setRevokeReason] = useState("");

  const wardOfficers = getMockUsers().filter((u) => u.role === "unit_officer");
  const fieldOfficers = getMockUsers().filter(
    (u) => u.role === "field_officer",
  );

  useEffect(() => {
    if (issue) {
      setNewStatus(issue.status);
      setAssignTo(issue.assigned_to || "");
      setWardOfficerId(issue.unit_officer_id || "");
      setFieldOfficerId(issue.field_officer_id || "");
    }
  }, [issue]);

  function handleUpdate() {
    if (!issue) return;

    setSuccess("");

    if (action === "reassign") {
      if (!assignTo || assignTo === issue.assigned_to) {
        alert("Please select a different officer to reassign to");
        return;
      }
      if (!reassignReason.trim()) {
        alert("Please provide a reason for reassignment");
        return;
      }
      if (onReassign) {
        onReassign(issue.id, assignTo, reassignReason);
      }
      return;
    } else if (action === "revoke") {
      if (!revokeReason.trim()) {
        alert("Please provide a reason for revoking assignment");
        return;
      }
      if (onRevoke) {
        onRevoke(issue.id, revokeReason);
      }
      return;
    } else if (action === "reject") {
      if (!rejectReason.trim()) {
        alert("Please provide a reason for rejection");
        return;
      }
      onUpdated(issue.id, {
        status: "rejected",
        rejection_reason: rejectReason,
        updated_at: new Date().toISOString(),
      });
      setSuccess("Issue rejected successfully!");
    } else if (action === "assign") {
      if (!wardOfficerId && !fieldOfficerId) {
        alert(
          "Please select at least one officer to assign (Ward Officer or Field Officer)",
        );
        return;
      }
      const updates = {
        status: "in_progress",
        updated_at: new Date().toISOString(),
      };
      if (wardOfficerId) {
        updates.unit_officer_id = wardOfficerId;
        updates.assigned_to = wardOfficerId;
      }
      if (fieldOfficerId) {
        updates.field_officer_id = fieldOfficerId;
        if (!wardOfficerId) {
          updates.assigned_to = fieldOfficerId;
        }
      }
      onUpdated(issue.id, updates);
      setSuccess("Issue assigned successfully!");
    } else {
      onUpdated(issue.id, {
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
      setSuccess("Status updated successfully!");
    }

    setTimeout(() => {
      onClose();
    }, 1000);
  }

  if (!issue) return null;

  const currentStatusStyle = statusStyles[issue.status] || statusStyles.pending;
  const StatusIcon = currentStatusStyle.icon;
  const categoryInfo = categoryData[issue.category] || categoryData.other;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-800/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div
          className={`sticky top-0 ${currentStatusStyle.bg} border-b ${currentStatusStyle.border} backdrop-blur-md bg-opacity-90`}
        >
          <div className="p-6 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm">
                  <Shield className="text-slate-700" size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {issue.title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <code className="px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-lg text-xs font-semibold text-slate-700 border border-slate-200/50 shadow-sm">
                  {issue.ticket_id}
                </code>
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${currentStatusStyle.badge} ${currentStatusStyle.text} flex items-center gap-1.5 shadow-sm`}
                >
                  <StatusIcon size={14} />
                  {statusLabels[issue.status]}
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r ${categoryInfo.color} flex items-center gap-1.5 shadow-sm`}
                >
                  <span>{categoryInfo.icon}</span>
                  {categoryInfo.label}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200/50"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div
              className={`relative overflow-hidden rounded-2xl border-2 ${
                fromAssignmentView
                  ? "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-blue-200 shadow-blue-100"
                  : "bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 border-slate-200 shadow-slate-100"
              } shadow-lg`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl"></div>
              <div className="relative p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className={`w-8 h-8 rounded-lg ${fromAssignmentView ? "bg-blue-500" : "bg-slate-700"} flex items-center justify-center shadow-md`}
                  >
                    <Sparkles className="text-white" size={18} />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {fromAssignmentView
                      ? "Assignment Management"
                      : "Admin Actions"}
                  </h3>
                </div>

                {fromAssignmentView ? (
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <button
                      onClick={() => setAction("reassign")}
                      className={`group relative overflow-hidden px-5 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                        action === "reassign"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <UserPlus
                          size={20}
                          className={
                            action === "reassign" ? "animate-pulse" : ""
                          }
                        />
                        <span>Reassign Officer</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setAction("revoke")}
                      className={`group relative overflow-hidden px-5 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                        action === "revoke"
                          ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30 scale-[1.02]"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-red-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <XCircle
                          size={20}
                          className={action === "revoke" ? "animate-pulse" : ""}
                        />
                        <span>Revoke Assignment</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <button
                      onClick={() => setAction("status")}
                      className={`group relative overflow-hidden px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                        action === "status"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-emerald-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Save
                          size={18}
                          className={action === "status" ? "animate-pulse" : ""}
                        />
                        <span className="text-sm">Update Status</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setAction("assign")}
                      className={`group relative overflow-hidden px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                        action === "assign"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <UserPlus
                          size={18}
                          className={action === "assign" ? "animate-pulse" : ""}
                        />
                        <span className="text-sm">Assign Officer</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setAction("reject")}
                      className={`group relative overflow-hidden px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                        action === "reject"
                          ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30 scale-[1.02]"
                          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-red-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <XCircle
                          size={18}
                          className={action === "reject" ? "animate-pulse" : ""}
                        />
                        <span className="text-sm">Reject Issue</span>
                      </div>
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  {action === "status" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <Zap size={16} className="text-emerald-600" />
                          New Status
                        </label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-slate-800 shadow-sm hover:shadow-md"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <MessageSquare size={16} className="text-slate-600" />
                          Comment (Optional)
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none shadow-sm hover:shadow-md"
                          rows={3}
                          placeholder="Add a comment about this update..."
                        />
                      </div>
                    </div>
                  )}

                  {action === "assign" && (
                    <div className="space-y-5">
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                            <Sparkles size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              Dual Assignment System
                            </p>
                            <p className="text-xs text-slate-600">
                              Assign ward officer, field officer, or both to
                              collaborate on this issue
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                              <Shield size={16} className="text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-cyan-900 uppercase tracking-wide">
                              Ward Officer
                            </h4>
                          </div>
                          {wardOfficerId && (
                            <button
                              type="button"
                              onClick={() => setWardOfficerId("")}
                              className="text-xs text-cyan-700 hover:text-cyan-900 font-medium underline"
                            >
                              Clear Selection
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-cyan-800 mb-3 leading-relaxed">
                          Oversees administrative duties and coordinates field
                          operations within designated ward areas.
                        </p>
                        <div className="grid gap-2">
                          {wardOfficers.length > 0 ? (
                            wardOfficers.map((officer) => (
                              <button
                                key={officer.id}
                                type="button"
                                onClick={() => setWardOfficerId(officer.id)}
                                className={`group relative overflow-hidden p-4 rounded-xl transition-all duration-300 text-left ${
                                  wardOfficerId === officer.id
                                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-[1.02]"
                                    : "bg-white hover:bg-cyan-50 border-2 border-slate-200 hover:border-cyan-300 shadow-sm hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                                      wardOfficerId === officer.id
                                        ? "bg-white/20"
                                        : "bg-gradient-to-br from-cyan-500 to-blue-600"
                                    }`}
                                  >
                                    <User size={18} className="text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`font-bold text-sm ${wardOfficerId === officer.id ? "text-white" : "text-slate-800"}`}
                                    >
                                      {officer.full_name}
                                    </p>
                                    <p
                                      className={`text-xs ${wardOfficerId === officer.id ? "text-cyan-100" : "text-slate-600"} truncate`}
                                    >
                                      {officer.email}
                                    </p>
                                  </div>
                                  {wardOfficerId === officer.id && (
                                    <CheckCircle2
                                      size={20}
                                      className="text-white flex-shrink-0"
                                    />
                                  )}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="text-center py-4 text-cyan-700 text-sm">
                              No ward officers available
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                              <Zap size={16} className="text-white" />
                            </div>
                            <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                              Field Officer
                            </h4>
                          </div>
                          {fieldOfficerId && (
                            <button
                              type="button"
                              onClick={() => setFieldOfficerId("")}
                              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium underline"
                            >
                              Clear Selection
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-emerald-800 mb-3 leading-relaxed">
                          Works on-ground to resolve issues directly, conducting
                          inspections and implementing solutions.
                        </p>
                        <div className="grid gap-2">
                          {fieldOfficers.length > 0 ? (
                            fieldOfficers.map((officer) => (
                              <button
                                key={officer.id}
                                type="button"
                                onClick={() => setFieldOfficerId(officer.id)}
                                className={`group relative overflow-hidden p-4 rounded-xl transition-all duration-300 text-left ${
                                  fieldOfficerId === officer.id
                                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]"
                                    : "bg-white hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                                      fieldOfficerId === officer.id
                                        ? "bg-white/20"
                                        : "bg-gradient-to-br from-emerald-500 to-teal-600"
                                    }`}
                                  >
                                    <User size={18} className="text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`font-bold text-sm ${fieldOfficerId === officer.id ? "text-white" : "text-slate-800"}`}
                                    >
                                      {officer.full_name}
                                    </p>
                                    <p
                                      className={`text-xs ${fieldOfficerId === officer.id ? "text-emerald-100" : "text-slate-600"} truncate`}
                                    >
                                      {officer.email}
                                    </p>
                                  </div>
                                  {fieldOfficerId === officer.id && (
                                    <CheckCircle2
                                      size={20}
                                      className="text-white flex-shrink-0"
                                    />
                                  )}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="text-center py-4 text-emerald-700 text-sm">
                              No field officers available
                            </div>
                          )}
                        </div>
                      </div>

                      {(wardOfficerId || fieldOfficerId) && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                              <AlertTriangle size={18} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-blue-900 mb-2">
                                Assignment Confirmation
                              </p>
                              {wardOfficerId && fieldOfficerId ? (
                                <div className="space-y-2">
                                  <p className="text-xs text-blue-800 leading-relaxed">
                                    <strong>Ward Officer:</strong>{" "}
                                    {
                                      wardOfficers.find(
                                        (o) => o.id === wardOfficerId,
                                      )?.full_name
                                    }{" "}
                                    will coordinate administrative tasks.
                                  </p>
                                  <p className="text-xs text-blue-800 leading-relaxed">
                                    <strong>Field Officer:</strong>{" "}
                                    {
                                      fieldOfficers.find(
                                        (o) => o.id === fieldOfficerId,
                                      )?.full_name
                                    }{" "}
                                    will handle on-ground resolution.
                                  </p>
                                  <p className="text-xs text-blue-700 mt-2 font-medium">
                                    Both officers will collaborate on this
                                    issue. Status will change to "In Progress".
                                  </p>
                                </div>
                              ) : wardOfficerId ? (
                                <p className="text-xs text-blue-800 leading-relaxed">
                                  <strong>
                                    {
                                      wardOfficers.find(
                                        (o) => o.id === wardOfficerId,
                                      )?.full_name
                                    }
                                  </strong>{" "}
                                  (Ward Officer) will be assigned to coordinate
                                  this issue. Status will change to "In
                                  Progress".
                                </p>
                              ) : (
                                <p className="text-xs text-blue-800 leading-relaxed">
                                  <strong>
                                    {
                                      fieldOfficers.find(
                                        (o) => o.id === fieldOfficerId,
                                      )?.full_name
                                    }
                                  </strong>{" "}
                                  (Field Officer) will be assigned to resolve
                                  this issue on-ground. Status will change to
                                  "In Progress".
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {action === "reject" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <XCircle size={16} className="text-red-600" />
                          Rejection Reason{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none shadow-sm hover:shadow-md"
                          rows={4}
                          placeholder="Provide a clear reason why this issue is being rejected..."
                          required
                        />
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-xs text-red-800 flex items-start gap-2">
                            <AlertTriangle
                              size={14}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <span>
                              The reporter will be notified with this reason.
                              Rejected issues will only be visible to the
                              reporter.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {action === "reassign" && (
                    <div className="space-y-5">
                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                            <User size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                              Currently Assigned To
                            </p>
                            <p className="text-sm font-bold text-amber-900">
                              {wardOfficers
                                .concat(fieldOfficers)
                                .find((o) => o.id === issue.assigned_to)
                                ?.full_name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                            <Shield size={16} className="text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-cyan-900 uppercase tracking-wide">
                            Ward Officers
                          </h4>
                        </div>
                        <p className="text-xs text-cyan-800 mb-3 leading-relaxed">
                          Select a ward officer to reassign this issue for
                          administrative oversight and coordination.
                        </p>
                        <div className="grid gap-2">
                          {wardOfficers.filter(
                            (o) => o.id !== issue.assigned_to,
                          ).length > 0 ? (
                            wardOfficers
                              .filter((o) => o.id !== issue.assigned_to)
                              .map((officer) => (
                                <button
                                  key={officer.id}
                                  type="button"
                                  onClick={() => setAssignTo(officer.id)}
                                  className={`group relative overflow-hidden p-4 rounded-xl transition-all duration-300 text-left ${
                                    assignTo === officer.id
                                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-[1.02]"
                                      : "bg-white hover:bg-cyan-50 border-2 border-slate-200 hover:border-cyan-300 shadow-sm hover:shadow-md"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                                        assignTo === officer.id
                                          ? "bg-white/20"
                                          : "bg-gradient-to-br from-cyan-500 to-blue-600"
                                      }`}
                                    >
                                      <User size={18} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`font-bold text-sm ${assignTo === officer.id ? "text-white" : "text-slate-800"}`}
                                      >
                                        {officer.full_name}
                                      </p>
                                      <p
                                        className={`text-xs ${assignTo === officer.id ? "text-cyan-100" : "text-slate-600"} truncate`}
                                      >
                                        {officer.email}
                                      </p>
                                    </div>
                                    {assignTo === officer.id && (
                                      <CheckCircle2
                                        size={20}
                                        className="text-white flex-shrink-0"
                                      />
                                    )}
                                  </div>
                                </button>
                              ))
                          ) : (
                            <div className="text-center py-4 text-cyan-700 text-sm">
                              No other ward officers available
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                            <Zap size={16} className="text-white" />
                          </div>
                          <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                            Field Officers
                          </h4>
                        </div>
                        <p className="text-xs text-emerald-800 mb-3 leading-relaxed">
                          Select a field officer to reassign this issue for
                          on-ground resolution and inspection.
                        </p>
                        <div className="grid gap-2">
                          {fieldOfficers.filter(
                            (o) => o.id !== issue.assigned_to,
                          ).length > 0 ? (
                            fieldOfficers
                              .filter((o) => o.id !== issue.assigned_to)
                              .map((officer) => (
                                <button
                                  key={officer.id}
                                  type="button"
                                  onClick={() => setAssignTo(officer.id)}
                                  className={`group relative overflow-hidden p-4 rounded-xl transition-all duration-300 text-left ${
                                    assignTo === officer.id
                                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]"
                                      : "bg-white hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                                        assignTo === officer.id
                                          ? "bg-white/20"
                                          : "bg-gradient-to-br from-emerald-500 to-teal-600"
                                      }`}
                                    >
                                      <User size={18} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`font-bold text-sm ${assignTo === officer.id ? "text-white" : "text-slate-800"}`}
                                      >
                                        {officer.full_name}
                                      </p>
                                      <p
                                        className={`text-xs ${assignTo === officer.id ? "text-emerald-100" : "text-slate-600"} truncate`}
                                      >
                                        {officer.email}
                                      </p>
                                    </div>
                                    {assignTo === officer.id && (
                                      <CheckCircle2
                                        size={20}
                                        className="text-white flex-shrink-0"
                                      />
                                    )}
                                  </div>
                                </button>
                              ))
                          ) : (
                            <div className="text-center py-4 text-emerald-700 text-sm">
                              No other field officers available
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <MessageSquare size={16} className="text-slate-600" />
                          Reason for Reassignment{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                          value={reassignReason}
                          onChange={(e) => setReassignReason(e.target.value)}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none shadow-sm hover:shadow-md"
                          rows={4}
                          placeholder="e.g., Workload balancing, Area expertise, Officer availability..."
                          required
                        />
                      </div>

                      {assignTo && assignTo !== issue.assigned_to && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                              <AlertTriangle size={18} className="text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-900 mb-1">
                                Reassignment Confirmation
                              </p>
                              <p className="text-xs text-blue-800 leading-relaxed">
                                Both{" "}
                                <strong>
                                  {
                                    wardOfficers
                                      .concat(fieldOfficers)
                                      .find((o) => o.id === issue.assigned_to)
                                      ?.full_name
                                  }
                                </strong>{" "}
                                and{" "}
                                <strong>
                                  {
                                    [...wardOfficers, ...fieldOfficers].find(
                                      (o) => o.id === assignTo,
                                    )?.full_name
                                  }
                                </strong>{" "}
                                will be notified. This action will be recorded
                                in the issue history.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {action === "revoke" && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-amber-900 flex items-start gap-2">
                          <AlertTriangle
                            size={18}
                            className="flex-shrink-0 mt-0.5"
                          />
                          <span>
                            <strong>Warning:</strong> This will unassign the
                            issue from{" "}
                            {wardOfficers
                              .concat(fieldOfficers)
                              .find((o) => o.id === issue.assigned_to)
                              ?.full_name || "the current officer"}
                            . The issue will return to unassigned status.
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <XCircle size={16} className="text-red-600" />
                          Reason for Revoking Assignment{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                          value={revokeReason}
                          onChange={(e) => setRevokeReason(e.target.value)}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none shadow-sm hover:shadow-md"
                          rows={4}
                          placeholder="Provide a clear reason for revoking this assignment..."
                          required
                        />
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-xs text-red-800 flex items-start gap-2">
                            <AlertTriangle
                              size={14}
                              className="mt-0.5 flex-shrink-0"
                            />
                            <span>
                              The officer will be notified and this action will
                              be recorded in the issue history.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle2 className="text-white" size={20} />
                        </div>
                        <p className="text-emerald-800 font-semibold">
                          {success}
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleUpdate}
                    className={`w-full group relative overflow-hidden px-6 py-4 rounded-xl text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] ${
                      action === "reject" || action === "revoke"
                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/30"
                        : action === "reassign"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-blue-500/30"
                          : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {action === "status" && (
                        <>
                          <Save size={22} />
                          Update Status
                        </>
                      )}
                      {action === "assign" && (
                        <>
                          <UserPlus size={22} />
                          Assign Officer
                        </>
                      )}
                      {action === "reject" && (
                        <>
                          <XCircle size={22} />
                          Reject Issue
                        </>
                      )}
                      {action === "reassign" && (
                        <>
                          <UserPlus size={22} />
                          Confirm Reassignment
                        </>
                      )}
                      {action === "revoke" && (
                        <>
                          <XCircle size={22} />
                          Revoke Assignment
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {issue.photo_url && (
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200">
                <img
                  src={issue.photo_url}
                  alt={issue.title}
                  className="w-full max-h-[500px] object-cover"
                />
              </div>
            )}

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-slate-600" />
                Description
              </h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {issue.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Reported
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(issue.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                    <Clock size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Last Updated
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(issue.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {issue.address && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 p-5 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <MapPinned size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-blue-900">
                      {issue.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {issue.reporter && (
              <div className="bg-white rounded-xl border-2 border-slate-200 p-5 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-md">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Reported By
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {issue.reporter.full_name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {issue.reporter.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {issue.assigned_to && issue.assignee && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-5 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                    <UserPlus size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">
                      Assigned Officer
                    </p>
                    <p className="text-sm font-bold text-emerald-900">
                      {issue.assignee.full_name}
                    </p>
                    <p className="text-xs text-emerald-700 capitalize">
                      {issue.assignee.role.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {issue.rejection_reason && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl border-2 border-red-200 p-5 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <XCircle size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-800 mb-2 uppercase tracking-wide">
                      Rejection Reason
                    </h3>
                    <p className="text-sm text-red-700 leading-relaxed">
                      {issue.rejection_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-slate-100 to-white border-t-2 border-slate-200 p-5 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="w-full px-6 py-3.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <X size={20} />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
