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
  Maximize,
  Minimize,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { getMockUsers } from "@/lib/mockData";

const statusStyles = {
  pending: {
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
    border: "border-amber-200 dark:border-amber-700",
    text: "text-amber-800 dark:text-amber-300",
    badge:
      "bg-amber-100 border-amber-300 dark:bg-amber-900/40 dark:border-amber-600",
    icon: Clock,
  },
  in_progress: {
    bg: "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    border: "border-blue-200 dark:border-blue-700",
    text: "text-blue-800 dark:text-blue-300",
    badge:
      "bg-blue-100 border-blue-300 dark:bg-blue-900/40 dark:border-blue-600",
    icon: Zap,
  },
  under_review: {
    bg: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
    border: "border-purple-200 dark:border-purple-700",
    text: "text-purple-800 dark:text-purple-300",
    badge:
      "bg-purple-100 border-purple-300 dark:bg-purple-900/40 dark:border-purple-600",
    icon: Shield,
  },
  uo_verification: {
    bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
    border: "border-orange-200 dark:border-orange-700",
    text: "text-orange-800 dark:text-orange-300",
    badge:
      "bg-orange-100 border-orange-300 dark:bg-orange-900/40 dark:border-orange-600",
    icon: CheckCircle2,
  },
  resolved: {
    bg: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
    border: "border-emerald-200 dark:border-emerald-700",
    text: "text-emerald-800 dark:text-emerald-300",
    badge:
      "bg-emerald-100 border-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-600",
    icon: CheckCircle2,
  },
  rejected: {
    bg: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
    border: "border-red-200 dark:border-red-700",
    text: "text-red-800 dark:text-red-300",
    badge: "bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-600",
    icon: XCircle,
  },
};

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  under_review: "Under Review",
  uo_verification: "UO Verification",
  resolved: "Resolved",
  rejected: "Rejected",
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
  const [selectedRejectionReason, setSelectedRejectionReason] = useState("");
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [revokeReason, setRevokeReason] = useState("");

  const [wardOfficerSearch, setWardOfficerSearch] = useState("");
  const [fieldOfficerSearch, setFieldOfficerSearch] = useState("");
  const [wardOfficerExpanded, setWardOfficerExpanded] = useState(true);
  const [fieldOfficerExpanded, setFieldOfficerExpanded] = useState(true);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [rejectionDropdownOpen, setRejectionDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wardOfficers = getMockUsers().filter((u) => u.role === "ward_officer");
  const fieldOfficers = getMockUsers().filter(
    (u) => u.role === "field_officer",
  );

  const filteredWardOfficers = wardOfficers.filter(
    (officer) =>
      officer.full_name
        .toLowerCase()
        .includes(wardOfficerSearch.toLowerCase()) ||
      officer.email.toLowerCase().includes(wardOfficerSearch.toLowerCase()),
  );

  const filteredFieldOfficers = fieldOfficers.filter(
    (officer) =>
      officer.full_name
        .toLowerCase()
        .includes(fieldOfficerSearch.toLowerCase()) ||
      officer.email.toLowerCase().includes(fieldOfficerSearch.toLowerCase()),
  );

  useEffect(() => {
    if (issue) {
      setNewStatus(issue.status);
      setAssignTo(issue.assigned_to || "");
      setWardOfficerId(issue.ward_officer_id || "");
      setFieldOfficerId(issue.field_officer_id || "");
      setComment("");
      setRejectReason("");
      setSelectedRejectionReason("");
      setWardOfficerSearch("");
      setFieldOfficerSearch("");
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
        updates.ward_officer_id = wardOfficerId;
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
    <div className={`fixed inset-0 bg-slate-900/40 dark:bg-[#030712]/60 backdrop-blur-lg flex items-center justify-center z-50 animate-in fade-in duration-300 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-2xl shadow-2xl flex flex-col border border-white/50 dark:border-slate-700/30 transition-all duration-300 ease-in-out ${isFullscreen ? 'w-screen h-screen max-w-none rounded-none' : 'max-w-5xl w-full max-h-[92vh] rounded-[2.5rem] overflow-hidden'}`}>
        <div
          className={`sticky top-0 ${currentStatusStyle.bg} border-b ${currentStatusStyle.border} backdrop-blur-2xl z-20`}
        >
          <div className="p-8 flex justify-between items-start gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                  <Shield
                    className="text-slate-700 dark:text-slate-300"
                    size={24}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {issue.title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <code className="px-4 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl text-xs font-black tracking-widest text-slate-700 dark:text-slate-300 border border-white/50 dark:border-slate-700/50 shadow-inner">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200/50 dark:border-slate-700/50"
                aria-label={isFullscreen ? "Collapse modal" : "Expand modal"}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 shadow-sm hover:shadow-md border border-slate-200/50 dark:border-slate-700/50"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

         <div className="flex-1 overflow-y-auto hide-scrollbar z-10">
          <div className="p-8 space-y-6">
            <div
              className={`relative rounded-[2rem] border-2 ${
                fromAssignmentView
                  ? "bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 border-blue-200/30 dark:border-blue-700/30 shadow-blue-100/50 dark:shadow-[inset_0_2px_20px_rgba(0,0,0,0.2)]"
                  : "bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-800/20 dark:to-slate-900/10 border-slate-200/30 dark:border-slate-700/30 shadow-slate-100/50 dark:shadow-[inset_0_2px_20px_rgba(0,0,0,0.2)]"
              } backdrop-blur-xl shadow-md z-20`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/20 dark:from-white/5 to-transparent rounded-full blur-3xl mix-blend-overlay"></div>
              </div>
              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl ${fromAssignmentView ? "bg-blue-500" : "bg-slate-700 dark:bg-slate-600"} flex items-center justify-center shadow-md`}
                  >
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    {fromAssignmentView
                      ? "Assignment Management"
                      : "Admin Actions"}
                  </h3>
                </div>

                {fromAssignmentView ? (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setAction("reassign")}
                      className={`group relative overflow-hidden px-5 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                        action === "reassign"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-transparent text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)] scale-[1.02]"
                          : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-300 border-white/80 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-cyan-500 hover:shadow-lg"
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
                      className={`group relative overflow-hidden px-5 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                        action === "revoke"
                          ? "bg-gradient-to-r from-red-600 to-rose-600 border-transparent text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] scale-[1.02]"
                          : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-300 border-white/80 dark:border-slate-700/50 hover:border-red-400 dark:hover:border-rose-500 hover:shadow-lg"
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
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => setAction("status")}
                      className={`group relative overflow-hidden px-4 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                        action === "status"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-transparent text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] scale-[1.02]"
                          : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-300 border-white/80 dark:border-slate-700/50 hover:border-emerald-400 dark:hover:border-teal-500 hover:shadow-lg"
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
                      className={`group relative overflow-hidden px-4 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                        action === "assign"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-transparent text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)] scale-[1.02]"
                          : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-300 border-white/80 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-cyan-500 hover:shadow-lg"
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
                      className={`group relative overflow-hidden px-4 py-4 rounded-xl font-bold transition-all duration-300 border-2 ${
                        action === "reject"
                          ? "bg-gradient-to-r from-red-600 to-rose-600 border-transparent text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] scale-[1.02]"
                          : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-300 border-white/80 dark:border-slate-700/50 hover:border-red-400 dark:hover:border-rose-500 hover:shadow-lg"
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
                    <div className="space-y-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-inner">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                            <Zap
                              size={16}
                              className="text-emerald-600 dark:text-emerald-400"
                            />
                          </div>
                          New Status
                        </label>
                        <div className="relative z-[60]">
                          <button
                            type="button"
                            onClick={() =>
                              setStatusDropdownOpen(!statusDropdownOpen)
                            }
                            className="w-full px-5 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-400 dark:hover:border-teal-500 transition-all font-medium text-slate-800 dark:text-slate-200 shadow-sm flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              {React.createElement(
                                statusStyles[newStatus]?.icon || Clock,
                                {
                                  size: 18,
                                  className: statusStyles[newStatus]?.text,
                                },
                              )}
                              <span className="font-bold">
                                {statusLabels[newStatus]}
                              </span>
                            </div>
                            <ChevronDown
                              size={20}
                              className={`text-slate-400 transition-transform duration-300 ${statusDropdownOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                          {statusDropdownOpen && (
                            <div className="absolute z-[70] w-full mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] max-h-64 overflow-y-auto">
                              {Object.entries(statusLabels).map(
                                ([value, label]) => {
                                  const style = statusStyles[value];
                                  const IconComponent = style.icon;
                                  return (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => {
                                        setNewStatus(value);
                                        setStatusDropdownOpen(false);
                                      }}
                                      className={`w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-4 ${
                                        newStatus === value
                                          ? "bg-emerald-50/80 dark:bg-emerald-900/30"
                                          : ""
                                      } first:rounded-t-2xl last:rounded-b-2xl border-b border-slate-100 dark:border-slate-700/50 last:border-b-0`}
                                    >
                                      <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${style.badge}`}
                                      >
                                        <IconComponent
                                          size={18}
                                          className={style.text}
                                        />
                                      </div>
                                      <span className="font-bold text-slate-800 dark:text-slate-200">
                                        {label}
                                      </span>
                                      {newStatus === value && (
                                        <CheckCircle2
                                          size={20}
                                          className="ml-auto text-emerald-600 dark:text-emerald-400"
                                        />
                                      )}
                                    </button>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <MessageSquare
                              size={16}
                              className="text-slate-600 dark:text-slate-400"
                            />
                          </div>
                          Comment (Optional)
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full px-5 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:ring-emerald-400 transition-all duration-300 resize-none shadow-sm hover:shadow-md text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                          rows={3}
                          placeholder="Add a comment about this update..."
                        />
                      </div>
                    </div>
                  )}

                  {action === "assign" && (
                    <div className="space-y-5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-inner">
                      <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-slate-800/60 dark:to-slate-900/40 backdrop-blur-md border border-blue-200/50 dark:border-slate-600/50 rounded-2xl p-5 mb-6 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                            <Sparkles size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                              Dual Assignment System
                            </p>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              Assign ward officer, field officer, or both to
                              collaborate on this issue
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-cyan-50/80 to-blue-50/80 dark:from-cyan-900/20 dark:to-blue-900/20 backdrop-blur-md rounded-3xl p-6 border border-cyan-200/50 dark:border-cyan-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_4px_10px_rgba(6,182,212,0.3)]">
                              <Shield size={18} className="text-white" />
                            </div>
                            <h4 className="text-base font-black text-cyan-900 dark:text-cyan-300 uppercase tracking-widest">
                              Ward Officer
                            </h4>
                            <button
                              type="button"
                              onClick={() =>
                                setWardOfficerExpanded(!wardOfficerExpanded)
                              }
                              className="ml-4 p-1.5 focus:outline-none hover:bg-cyan-200/50 dark:hover:bg-cyan-800/50 rounded-lg transition-colors"
                            >
                              {wardOfficerExpanded ? (
                                <ChevronUp
                                  size={20}
                                  className="text-cyan-700 dark:text-cyan-400"
                                />
                              ) : (
                                <ChevronDown
                                  size={20}
                                  className="text-cyan-700 dark:text-cyan-400"
                                />
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-400 mb-5 leading-relaxed">
                          Oversees administrative duties and coordinates field
                          operations within designated ward areas.
                        </p>

                        {wardOfficerExpanded && (
                          <>
                            <div className="mb-3 relative">
                              <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                              />
                              <input
                                type="text"
                                value={wardOfficerSearch}
                                onChange={(e) =>
                                  setWardOfficerSearch(e.target.value)
                                }
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              />
                            </div>
                            {wardOfficerId && (
                              <button
                                type="button"
                                onClick={() => setWardOfficerId("")}
                                className="text-xs text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-300 font-medium underline mb-2"
                              >
                                Clear Selection
                              </button>
                            )}
                            <div className="grid gap-2 max-h-64 overflow-y-auto">
                              {filteredWardOfficers.length > 0 ? (
                                filteredWardOfficers.map((officer) => (
                                  <button
                                    key={officer.id}
                                    type="button"
                                    onClick={() => setWardOfficerId(officer.id)}
                                    className={`group relative overflow-hidden p-4 rounded-xl transition-all duration-300 text-left ${
                                      wardOfficerId === officer.id
                                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-[1.02]"
                                        : "bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border-2 border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 shadow-sm hover:shadow-md"
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
                                        <User
                                          size={18}
                                          className="text-white"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className={`font-bold text-sm ${wardOfficerId === officer.id ? "text-white" : "text-slate-800 dark:text-slate-200"}`}
                                        >
                                          {officer.full_name}
                                        </p>
                                        <p
                                          className={`text-xs ${wardOfficerId === officer.id ? "text-cyan-100" : "text-slate-600 dark:text-slate-400"} truncate`}
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
                                <div className="text-center py-4 text-cyan-700 dark:text-cyan-400 text-sm">
                                  {wardOfficerSearch
                                    ? "No officers match your search"
                                    : "No ward officers available"}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 backdrop-blur-md rounded-3xl p-6 border border-emerald-200/50 dark:border-emerald-700/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-[0_4px_10px_rgba(16,185,129,0.3)]">
                              <Zap size={18} className="text-white" />
                            </div>
                            <h4 className="text-base font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest">
                              Field Officer
                            </h4>
                            <button
                              type="button"
                              onClick={() =>
                                setFieldOfficerExpanded(!fieldOfficerExpanded)
                              }
                              className="ml-4 p-1.5 focus:outline-none hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 rounded-lg transition-colors"
                            >
                              {fieldOfficerExpanded ? (
                                <ChevronUp
                                  size={20}
                                  className="text-emerald-700 dark:text-emerald-400"
                                />
                              ) : (
                                <ChevronDown
                                  size={20}
                                  className="text-emerald-700 dark:text-emerald-400"
                                />
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 mb-5 leading-relaxed">
                          Works on-ground to resolve issues directly, conducting
                          inspections and implementing solutions.
                        </p>

                        {fieldOfficerExpanded && (
                          <>
                            <div className="mb-4 relative z-0">
                              <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                              />
                              <input
                                type="text"
                                value={fieldOfficerSearch}
                                onChange={(e) =>
                                  setFieldOfficerSearch(e.target.value)
                                }
                                placeholder="Search by name or email..."
                                className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 transition-all text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                              />
                            </div>
                            {fieldOfficerId && (
                              <button
                                type="button"
                                onClick={() => setFieldOfficerId("")}
                                className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-bold tracking-wide uppercase flex ml-auto mb-3"
                              >
                                Clear Selection
                              </button>
                            )}
                            <div className="grid gap-3 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
                              {filteredFieldOfficers.length > 0 ? (
                                filteredFieldOfficers.map((officer) => (
                                  <button
                                    key={officer.id}
                                    type="button"
                                    onClick={() =>
                                      setFieldOfficerId(officer.id)
                                    }
                                    className={`group relative overflow-hidden p-5 rounded-2xl transition-all duration-300 text-left border ${
                                      fieldOfficerId === officer.id
                                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-transparent text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] scale-[1.02]"
                                        : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-white/50 dark:border-slate-700/50 hover:border-emerald-400 dark:hover:border-teal-500 shadow-sm"
                                    }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
                                          fieldOfficerId === officer.id
                                            ? "bg-white/20"
                                            : "bg-gradient-to-br from-emerald-500 to-teal-600"
                                        }`}
                                      >
                                        <User
                                          size={20}
                                          className="text-white"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p
                                          className={`font-black text-base tracking-tight mb-0.5 ${fieldOfficerId === officer.id ? "text-white" : "text-slate-900 dark:text-slate-100"}`}
                                        >
                                          {officer.full_name}
                                        </p>
                                        <p
                                          className={`text-xs font-semibold ${fieldOfficerId === officer.id ? "text-emerald-100" : "text-slate-600 dark:text-slate-400"} truncate`}
                                        >
                                          {officer.email}
                                        </p>
                                      </div>
                                      {fieldOfficerId === officer.id && (
                                        <CheckCircle2
                                          size={24}
                                          className="text-white flex-shrink-0"
                                        />
                                      )}
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="text-center py-6 text-emerald-700 dark:text-emerald-400 font-bold text-sm bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-emerald-100 dark:border-emerald-800/30">
                                  {fieldOfficerSearch
                                    ? "No officers match your search"
                                    : "No field officers available"}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {(wardOfficerId || fieldOfficerId) && (
                        <div className="bg-gradient-to-r from-blue-50/90 to-cyan-50/90 dark:from-blue-900/40 dark:to-cyan-900/30 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                              <AlertTriangle size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-base font-black text-blue-900 dark:text-blue-100 mb-2">
                                Assignment Confirmation
                              </p>
                              {wardOfficerId && fieldOfficerId ? (
                                <div className="space-y-3">
                                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 leading-relaxed">
                                    <strong className="font-extrabold text-blue-900 dark:text-white block mb-0.5">
                                      Ward Officer:
                                    </strong>{" "}
                                    {
                                      wardOfficers.find(
                                        (o) => o.id === wardOfficerId,
                                      )?.full_name
                                    }{" "}
                                    will coordinate administrative tasks.
                                  </p>
                                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 leading-relaxed">
                                    <strong className="font-extrabold text-blue-900 dark:text-white block mb-0.5">
                                      Field Officer:
                                    </strong>{" "}
                                    {
                                      fieldOfficers.find(
                                        (o) => o.id === fieldOfficerId,
                                      )?.full_name
                                    }{" "}
                                    will handle on-ground resolution.
                                  </p>
                                  <div className="mt-4 inline-block px-3 py-1 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
                                    <p className="text-xs text-cyan-800 dark:text-cyan-300 font-bold uppercase tracking-wide">
                                      Status will change to "In Progress"
                                    </p>
                                  </div>
                                </div>
                              ) : wardOfficerId ? (
                                <div className="space-y-3">
                                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 leading-relaxed">
                                    <strong className="font-extrabold text-blue-900 dark:text-white">
                                      {
                                        wardOfficers.find(
                                          (o) => o.id === wardOfficerId,
                                        )?.full_name
                                      }
                                    </strong>{" "}
                                    (Ward Officer) will be assigned to
                                    coordinate this issue.
                                  </p>
                                  <div className="mt-4 inline-block px-3 py-1 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
                                    <p className="text-xs text-cyan-800 dark:text-cyan-300 font-bold uppercase tracking-wide">
                                      Status will change to "In Progress"
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 leading-relaxed">
                                    <strong className="font-extrabold text-blue-900 dark:text-white">
                                      {
                                        fieldOfficers.find(
                                          (o) => o.id === fieldOfficerId,
                                        )?.full_name
                                      }
                                    </strong>{" "}
                                    (Field Officer) will be assigned to resolve
                                    this issue on-ground.
                                  </p>
                                  <div className="mt-4 inline-block px-3 py-1 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
                                    <p className="text-xs text-cyan-800 dark:text-cyan-300 font-bold uppercase tracking-wide">
                                      Status will change to "In Progress"
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {action === "reject" && (
                    <div className="space-y-6 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-xl p-6 rounded-3xl border border-red-200/50 dark:border-red-900/30 shadow-[inset_0_2px_20px_rgba(239,68,68,0.05)] text-left">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-lg">
                            <XCircle
                              size={16}
                              className="text-red-600 dark:text-red-400"
                            />
                          </div>
                          Select Rejection Category{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setRejectionDropdownOpen(!rejectionDropdownOpen)
                            }
                            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-slate-800 dark:text-slate-200 shadow-sm hover:shadow-md flex items-center justify-between group text-left"
                          >
                            <span
                              className={
                                selectedRejectionReason
                                  ? ""
                                  : "text-slate-400 dark:text-slate-500"
                              }
                            >
                              {selectedRejectionReason ||
                                "Select a rejection reason..."}
                            </span>
                            <ChevronDown
                              size={20}
                              className={`transition-transform duration-200 flex-shrink-0 ${rejectionDropdownOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                          {rejectionDropdownOpen && (
                            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                              {rejectionReasons.map((reason) => (
                                <button
                                  key={reason}
                                  type="button"
                                  onClick={() => {
                                    setSelectedRejectionReason(reason);
                                    setRejectionDropdownOpen(false);
                                    if (reason !== "Other (please specify)") {
                                      setRejectReason(reason);
                                    } else {
                                      setRejectReason("");
                                    }
                                  }}
                                  className={`w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3 ${
                                    selectedRejectionReason === reason
                                      ? "bg-red-50 dark:bg-red-900/20"
                                      : ""
                                  } first:rounded-t-xl last:rounded-b-xl border-b border-slate-100 dark:border-slate-700 last:border-b-0`}
                                >
                                  <XCircle
                                    size={16}
                                    className="text-red-600 dark:text-red-400 flex-shrink-0"
                                  />
                                  <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                                    {reason}
                                  </span>
                                  {selectedRejectionReason === reason && (
                                    <CheckCircle2
                                      size={18}
                                      className="ml-auto text-red-600 dark:text-red-400"
                                    />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          <MessageSquare
                            size={16}
                            className="text-red-600 dark:text-red-400"
                          />
                          Detailed Explanation{" "}
                          <span className="text-red-500 ml-1">*</span>
                          <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-auto">
                            {rejectReason.length}/30 characters minimum
                          </span>
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className={`w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none shadow-sm hover:shadow-md text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                            rejectReason.length < 30
                              ? "border-slate-200 dark:border-slate-700 focus:ring-red-500 focus:border-red-500"
                              : "border-emerald-300 dark:border-emerald-600 focus:ring-emerald-500 focus:border-emerald-500"
                          }`}
                          rows={4}
                          placeholder={
                            selectedRejectionReason === "Other (please specify)"
                              ? "Provide a detailed explanation for rejecting this issue..."
                              : "Add additional context or details about this rejection..."
                          }
                          required
                        />
                        {rejectReason.length > 0 &&
                          rejectReason.length < 30 && (
                            <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertTriangle size={12} />
                              Please provide at least 30 characters (
                              {30 - rejectReason.length} more needed)
                            </p>
                          )}
                        {rejectReason.length >= 30 && (
                          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Rejection reason meets minimum requirements
                          </p>
                        )}
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
                          <p className="text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
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
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <MessageSquare
                              size={16}
                              className="text-slate-600 dark:text-slate-400"
                            />
                          </div>
                          Reason for Reassignment{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                          value={reassignReason}
                          onChange={(e) => setReassignReason(e.target.value)}
                          className="w-full px-5 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-cyan-500 transition-all resize-none shadow-sm hover:shadow-md text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                          rows={4}
                          placeholder="e.g., Workload balancing, Area expertise, Officer availability..."
                          required
                        />
                      </div>

                      {assignTo && assignTo !== issue.assigned_to && (
                        <div className="bg-gradient-to-r from-blue-50/90 to-cyan-50/90 dark:from-blue-900/40 dark:to-cyan-900/30 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                              <AlertTriangle size={20} className="text-white" />
                            </div>
                            <div>
                              <p className="text-base font-black text-blue-900 dark:text-blue-100 mb-1">
                                Reassignment Confirmation
                              </p>
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 leading-relaxed">
                                Both{" "}
                                <strong className="font-extrabold text-blue-950 dark:text-white">
                                  {
                                    wardOfficers
                                      .concat(fieldOfficers)
                                      .find((o) => o.id === issue.assigned_to)
                                      ?.full_name
                                  }
                                </strong>{" "}
                                and{" "}
                                <strong className="font-extrabold text-blue-950 dark:text-white">
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
                    <div className="space-y-6 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-xl p-6 rounded-3xl border border-red-200/50 dark:border-red-900/30 shadow-[inset_0_2px_20px_rgba(239,68,68,0.05)] text-left">
                      <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/40 dark:to-orange-900/30 border border-amber-200/50 dark:border-amber-700/50 rounded-2xl p-5 shadow-sm backdrop-blur-md">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200 flex items-start gap-3">
                          <AlertTriangle
                            size={20}
                            className="flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"
                          />
                          <span>
                            <strong className="font-black text-amber-950 dark:text-amber-100">
                              Warning:
                            </strong>{" "}
                            This will unassign the issue from{" "}
                            <strong className="font-bold">
                              {wardOfficers
                                .concat(fieldOfficers)
                                .find((o) => o.id === issue.assigned_to)
                                ?.full_name || "the current officer"}
                            </strong>
                            . The issue will return to unassigned status.
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                          <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-lg">
                            <XCircle
                              size={16}
                              className="text-red-600 dark:text-red-400"
                            />
                          </div>
                          Reason for Revoking Assignment{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                          value={revokeReason}
                          onChange={(e) => setRevokeReason(e.target.value)}
                          className="w-full px-5 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/50 dark:border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none shadow-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                          rows={4}
                          placeholder="Provide a clear reason for revoking this assignment..."
                          required
                        />
                        <div className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/30 border border-red-100/50 dark:border-red-800/50 rounded-xl backdrop-blur-sm">
                          <p className="text-sm font-medium text-red-800 dark:text-red-300 flex items-start gap-3">
                            <AlertTriangle
                              size={16}
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
                    <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/40 dark:to-teal-900/30 backdrop-blur-md border border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl p-5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                          <CheckCircle2 className="text-white" size={24} />
                        </div>
                        <div>
                          <p className="text-base font-black text-emerald-900 dark:text-emerald-100 mb-0.5">
                            Action Successful
                          </p>
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            {success}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleUpdate}
                    disabled={
                      (action === 'status' && !comment.trim()) ||
                      (action === 'reject' && rejectReason.length < 30) ||
                      (action === 'assign' && !wardOfficerId && !fieldOfficerId) ||
                      (action === 'reassign' && (!assignTo || assignTo === issue.assigned_to)) ||
                      (action === 'revoke' && !revokeReason.trim())
                    }
                    className={`w-full group relative overflow-hidden px-8 py-5 rounded-[1.5rem] font-black text-lg transition-all duration-500 shadow-xl transform ${
                      (action === 'status' && !comment.trim()) ||
                      (action === 'reject' && rejectReason.length < 30) ||
                      (action === 'assign' && !wardOfficerId && !fieldOfficerId) ||
                      (action === 'reassign' && (!assignTo || assignTo === issue.assigned_to)) ||
                      (action === 'revoke' && !revokeReason.trim())
                        ? 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed border-2 border-slate-300/50 dark:border-slate-700/50 backdrop-blur-md'
                        : action === 'reject' || action === 'revoke'
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-[0_15px_40px_-5px_rgba(239,68,68,0.4)] text-white hover:scale-[1.02] active:scale-[0.98]'
                        : action === 'reassign' || action === 'assign'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_15px_40px_-5px_rgba(59,130,246,0.4)] text-white hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_15px_40px_-5px_rgba(16,185,129,0.4)] text-white hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      {action === 'status' && <><Save size={24} className="group-hover:-translate-y-1 transition-transform" /><span className="drop-shadow-sm">Update Status Details</span></>}
                      {action === 'assign' && <><UserPlus size={24} className="group-hover:scale-110 transition-transform" /><span className="drop-shadow-sm">Assign Officers</span></>}
                      {action === 'reject' && <><XCircle size={24} className="group-hover:rotate-90 transition-transform duration-500" /><span className="drop-shadow-sm">Confirm Rejection</span></>}
                      {action === 'reassign' && <><UserPlus size={24} className="group-hover:scale-110 transition-transform" /><span className="drop-shadow-sm">Confirm Reassignment</span></>}
                      {action === 'revoke' && <><XCircle size={24} className="group-hover:rotate-90 transition-transform duration-500" /><span className="drop-shadow-sm">Revoke Assignment</span></>}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {issue.photo_url && (
              <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-700/50 relative group/img">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <img
                  src={issue.photo_url}
                  alt={issue.title}
                  className="w-full max-h-[500px] object-cover"
                />
              </div>
            )}

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-3xl border border-white/50 dark:border-slate-700/50 p-8 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <MessageSquare
                    size={20}
                    className="text-slate-700 dark:text-slate-300"
                  />
                </div>
                Description
              </h3>
              <p className="text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">
                {issue.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-700/50 p-5 shadow-md hover:shadow-lg transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                      Reported
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {new Date(issue.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/50 dark:border-slate-700/50 p-5 shadow-md hover:shadow-lg transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                      Last Updated
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {new Date(issue.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {issue.address && (
              <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-900/40 dark:to-cyan-900/20 backdrop-blur-md rounded-3xl border border-blue-200/50 dark:border-blue-700/50 p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <MapPinned size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1.5">
                      Location
                    </p>
                    <p className="text-base font-bold text-blue-950 dark:text-blue-100">
                      {issue.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {issue.reporter && (
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-3xl border border-white/50 dark:border-slate-700/50 p-6 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-600 dark:to-slate-700 rounded-2xl flex items-center justify-center shadow-md">
                    <User size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                      Reported By
                    </p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {issue.reporter.full_name}
                    </p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {issue.reporter.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {issue.assigned_to && issue.assignee && (
              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/40 dark:to-teal-900/20 backdrop-blur-md rounded-3xl border border-emerald-200/50 dark:border-emerald-700/50 p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                    <UserPlus size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
                      Assigned Officer
                    </p>
                    <p className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                      {issue.assignee.full_name}
                    </p>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 capitalize">
                      {issue.assignee.role.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {issue.rejection_reason && (
              <div className="bg-gradient-to-br from-red-50/80 to-rose-50/80 dark:from-red-900/40 dark:to-rose-900/20 backdrop-blur-md rounded-3xl border border-red-200/50 dark:border-red-700/50 p-6 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                    <XCircle size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-black text-red-800 dark:text-red-400 mb-2 uppercase tracking-widest">
                      Rejection Reason
                    </h3>
                    <p className="text-base text-red-900 dark:text-red-100 font-medium leading-relaxed">
                      {issue.rejection_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/70 dark:bg-[#0f172a]/70 border-t border-slate-200/50 dark:border-slate-800/50 p-6 backdrop-blur-3xl z-40 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.4)] relative">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
          <button
            onClick={onClose}
            className="w-full px-6 py-5 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-black tracking-widest rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 uppercase text-sm border-2 border-slate-200/50 dark:border-slate-700/50 group relative overflow-hidden active:translate-y-0"
          >
            <div className="absolute inset-0 bg-slate-100/30 dark:bg-slate-700/30 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-0"></div>
            <X size={20} className="group-hover:rotate-90 transition-transform duration-500 text-slate-400 dark:text-slate-500 group-hover:text-red-500 relative z-10" />
            <span className="relative z-10">Close Action Window</span>
          </button>
        </div>
      </div>
    </div>
  );
}
