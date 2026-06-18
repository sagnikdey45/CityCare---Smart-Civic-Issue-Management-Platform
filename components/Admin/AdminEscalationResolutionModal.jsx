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
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  FileText,
  Tag,
  MapPin,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AdminEscalationResolutionModal({ issue, onClose, onResolved }) {
  const adminUserId = "2"; // fallback local admin userId matching AdminDashboard context
  const [loading, setLoading] = useState(false);

  const currentActions = issue.escalation_resolution_actions?.filter(
    (a) => a.performed_at >= (issue.escalated_at || 0)
  ) || [];
  const resolutionActions = currentActions.filter(
    (a) => a.type !== "escalate" && a.type !== "review_escalation"
  );
  const hasResolutionAction = resolutionActions.length > 0;

  const [actionType, setActionType] = useState(hasResolutionAction ? "approve" : "extend_sla");
  const [newSlaDeadline, setNewSlaDeadline] = useState("");
  const [wardOfficers, setWardOfficers] = useState([]);
  const [fieldOfficers, setFieldOfficers] = useState([]);
  const [selectedWardOfficer, setSelectedWardOfficer] = useState("");
  const [selectedFieldOfficer, setSelectedFieldOfficer] = useState("");
  const [newCategory, setNewCategory] = useState(issue.category);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const assignable = useQuery(api.admin.getAssignableOfficers);

  const extendSla = useMutation(api.escalation.extendIssueSla);
  const reassignOfficer = useMutation(api.escalation.reassignIssueOfficer);
  const changeCategory = useMutation(api.escalation.changeIssueCategory);
  const approveEscalation = useMutation(api.escalation.approveEscalation);
  const rejectEscalation = useMutation(api.escalation.rejectEscalation);
  const reviewEscalation = useMutation(api.escalation.reviewEscalation);

  useEffect(() => {
    if (issue && issue.is_escalated && (issue.escalation_admin_review_status === "pending" || !issue.escalation_admin_review_status)) {
      reviewEscalation({ issueId: issue.id, reviewedBy: adminUserId }).catch(console.error);
    }
  }, [issue, reviewEscalation]);

  useEffect(() => {
    if (assignable) {
      const uos = (assignable.unitOfficers || []).map((o) => ({
        id: o.userId,
        full_name: o.fullName,
        ward_zone: o.district || o.department || "",
      }));
      const fos = (assignable.fieldOfficers || []).map((o) => ({
        id: o.userId,
        full_name: o.fullName,
        ward_zone: o.district || o.department || "",
      }));
      setWardOfficers(uos);
      setFieldOfficers(fos);

      const currentUoId = issue.assigned_officer?.id || issue.assignedUnitOfficer || issue.ward_officer_id;
      const currentFoId = issue.field_officer?.id || issue.assignedFieldOfficer || issue.field_officer_id;
      if (currentUoId) setSelectedWardOfficer(currentUoId);
      if (currentFoId) setSelectedFieldOfficer(currentFoId);
    }
  }, [assignable, issue]);

  useEffect(() => {
    if (issue.sla_deadline) {
      const deadline = new Date(issue.sla_deadline);
      const formatted = deadline.toISOString().slice(0, 16);
      setNewSlaDeadline(formatted);
    }
  }, [issue]);

  const handleResolveEscalation = async () => {
    if (!resolutionNotes.trim()) {
      alert("Please provide resolution notes");
      return;
    }

    setLoading(true);
    try {
      if (actionType === "extend_sla") {
        if (!newSlaDeadline) {
          alert("Please select a new SLA deadline");
          setLoading(false);
          return;
        }
        await extendSla({
          issueId: issue.id,
          newDeadline: new Date(newSlaDeadline).getTime(),
          notes: resolutionNotes,
          adminId: adminUserId,
        });
      } else if (actionType === "reassign_ward") {
        if (!selectedWardOfficer) {
          alert("Please select a ward officer");
          setLoading(false);
          return;
        }
        await reassignOfficer({
          issueId: issue.id,
          newUnitOfficerId: selectedWardOfficer,
          notes: resolutionNotes,
          adminId: adminUserId,
        });
      } else if (actionType === "reassign_field") {
        if (!selectedFieldOfficer) {
          alert("Please select a field officer");
          setLoading(false);
          return;
        }
        await reassignOfficer({
          issueId: issue.id,
          newFieldOfficerId: selectedFieldOfficer,
          notes: resolutionNotes,
          adminId: adminUserId,
        });
      } else if (actionType === "change_category") {
        if (newCategory === issue.category) {
          alert("Please select a different category");
          setLoading(false);
          return;
        }
        await changeCategory({
          issueId: issue.id,
          newCategory: newCategory,
          notes: resolutionNotes,
          adminId: adminUserId,
        });
      } else if (actionType === "reject") {
        if (!rejectionReason.trim()) {
          alert("Please provide a rejection reason");
          setLoading(false);
          return;
        }
        await rejectEscalation({
          issueId: issue.id,
          reason: rejectionReason || resolutionNotes,
          adminId: adminUserId,
        });
      } else if (actionType === "approve") {
        await approveEscalation({
          issueId: issue.id,
          notes: resolutionNotes,
          adminId: adminUserId,
        });
      }

      onResolved();
      onClose();
    } catch (error) {
      console.error("Error resolving escalation:", error);
      alert("Failed to resolve escalation: " + error.message);
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
          gradient: "from-blue-500 to-cyan-500",
          bgGradient: "from-blue-50 to-cyan-50",
          borderColor: "border-blue-500",
          title: "Extend SLA Deadline",
          description: "Grant additional time to resolve this issue",
        };
      case "reassign_ward":
        return {
          icon: Shield,
          color: "purple",
          gradient: "from-purple-500 to-pink-500",
          bgGradient: "from-purple-50 to-pink-50",
          borderColor: "border-purple-500",
          title: "Reassign Ward Officer",
          description: "Transfer oversight to a different ward officer",
        };
      case "reassign_field":
        return {
          icon: Users,
          color: "indigo",
          gradient: "from-indigo-500 to-purple-500",
          bgGradient: "from-indigo-50 to-purple-50",
          borderColor: "border-indigo-500",
          title: "Reassign Field Officer",
          description: "Assign a different field officer to handle this",
        };
      case "change_category":
        return {
          icon: Tag,
          color: "amber",
          gradient: "from-amber-500 to-orange-500",
          bgGradient: "from-amber-50 to-orange-50",
          borderColor: "border-amber-500",
          title: "Change Category",
          description: "Reclassify issue to correct department",
        };
      case "approve":
        return {
          icon: CheckCircle,
          color: "green",
          gradient: "from-green-500 to-emerald-500",
          bgGradient: "from-green-50 to-emerald-50",
          borderColor: "border-green-500",
          title: "Approve Resolution",
          description: "Accept current approach and close escalation",
        };
      case "reject":
        return {
          icon: XCircle,
          color: "red",
          gradient: "from-red-500 to-rose-500",
          bgGradient: "from-red-50 to-rose-50",
          borderColor: "border-red-500",
          title: "Reject Issue",
          description: "Mark issue as invalid and close permanently",
        };
    }
  };

  const config = getActionConfig();
  const ActionIcon = config.icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border-2 border-slate-200 animate-in zoom-in-95 duration-300">
        <div
          className={`relative bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 text-white p-8 overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative flex items-start justify-between">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/30">
                <AlertTriangle size={32} className="text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black tracking-tight">
                    Admin Escalation Control
                  </h2>
                  <Sparkles
                    size={24}
                    className="text-yellow-300 animate-pulse"
                  />
                </div>
                <p className="text-red-100 text-base font-medium flex items-center gap-2">
                  <code className="bg-white/20 px-3 py-1 rounded-lg font-mono text-sm backdrop-blur-sm">
                    {issue.ticket_id}
                  </code>
                  <span className="opacity-60">•</span>
                  <span>{issue.title}</span>
                </p>
                <p className="text-red-200 text-sm mt-1 flex items-center gap-2">
                  <Zap size={14} />
                  Requires immediate administrative intervention
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all border border-white/30 hover:scale-110 active:scale-95"
            >
              <X size={22} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8 max-h-[calc(95vh-200px)] overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl p-6 shadow-inner">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <FileText className="text-white" size={24} />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Issue Context
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      issue.severity === "critical"
                        ? "bg-red-600 text-white"
                        : issue.severity === "high"
                          ? "bg-orange-600 text-white"
                          : issue.severity === "medium"
                            ? "bg-amber-600 text-white"
                            : "bg-slate-600 text-white"
                    }`}
                  >
                    {issue.severity?.toUpperCase()}
                  </span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-xs font-semibold mb-1">
                      Category
                    </p>
                    <p className="text-slate-900 font-bold capitalize">
                      {issue.category}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-xs font-semibold mb-1">
                      Status
                    </p>
                    <p className="text-slate-900 font-bold capitalize">
                      {issue.status}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-xs font-semibold mb-1">
                      SLA Status
                    </p>
                    <p
                      className={`font-bold capitalize ${
                        issue.sla_status === "breached"
                          ? "text-red-600"
                          : issue.sla_status === "at_risk"
                            ? "text-amber-600"
                            : "text-green-600"
                      }`}
                    >
                      {issue.sla_status}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-xs font-semibold mb-1">
                      Escalations
                    </p>
                    <p className="text-slate-900 font-bold">
                      {issue.escalation_count || 0} times
                    </p>
                  </div>
                </div>
                {issue.sla_deadline && (
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-xs font-semibold mb-1">
                      Current SLA Deadline
                    </p>
                    <p className="text-slate-900 font-bold flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(issue.sla_deadline).toLocaleString()}
                    </p>
                  </div>
                )}
                {issue.location && (
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                    <p className="text-slate-500 text-xs font-semibold mb-1">
                      Location
                    </p>
                    <p className="text-slate-900 font-bold flex items-center gap-2">
                      <MapPin size={16} />
                      {issue.location}
                    </p>
                  </div>
                )}
                <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                  <p className="text-slate-500 text-xs font-semibold mb-1">
                    Description
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    {issue.description}
                  </p>
                </div>
                {(issue.escalation_reason || issue.escalation_comments) && (
                  <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-purple-700 font-extrabold text-xs uppercase tracking-wider">
                      <AlertTriangle size={14} />
                      Escalation Details
                    </div>
                    {issue.escalation_reason && (
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5">Reason for Escalation</p>
                        <p className="text-slate-800 font-semibold text-sm leading-relaxed">"{issue.escalation_reason}"</p>
                      </div>
                    )}
                    {issue.escalation_comments && (
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-0.5">Additional Comments</p>
                        <p className="text-slate-800 font-semibold text-sm leading-relaxed">"{issue.escalation_comments}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Choose Resolution Action
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "extend_sla",
                "reassign_ward",
                "reassign_field",
                "change_category",
                "approve",
                "reject",
              ].filter(type => !hasResolutionAction || type === "approve").map((type) => {
                const typeConfig = {
                  extend_sla: {
                    icon: Clock,
                    gradient: "from-blue-500 to-cyan-500",
                    label: "Extend SLA",
                  },
                  reassign_ward: {
                    icon: Shield,
                    gradient: "from-purple-500 to-pink-500",
                    label: "Ward Officer",
                  },
                  reassign_field: {
                    icon: Users,
                    gradient: "from-indigo-500 to-purple-500",
                    label: "Field Officer",
                  },
                  change_category: {
                    icon: Tag,
                    gradient: "from-amber-500 to-orange-500",
                    label: "Recategorize",
                  },
                  approve: {
                    icon: CheckCircle,
                    gradient: "from-green-500 to-emerald-500",
                    label: "Approve",
                  },
                  reject: {
                    icon: XCircle,
                    gradient: "from-red-500 to-rose-500",
                    label: "Reject",
                  },
                }[type];

                const TypeIcon = typeConfig.icon;
                const isSelected = actionType === type;

                return (
                  <button
                    key={type}
                    onClick={() => setActionType(type)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `border-transparent bg-gradient-to-br ${typeConfig.gradient} shadow-2xl scale-105`
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:scale-102"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 mx-auto transition-all ${
                        isSelected
                          ? "bg-white/30 backdrop-blur-sm shadow-lg"
                          : `bg-gradient-to-br ${typeConfig.gradient}`
                      }`}
                    >
                      <TypeIcon
                        size={28}
                        className={
                          isSelected
                            ? "text-white"
                            : "text-white group-hover:scale-110 transition-transform"
                        }
                      />
                    </div>
                    <p
                      className={`text-sm font-bold text-center transition-colors ${
                        isSelected ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {typeConfig.label}
                    </p>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`bg-gradient-to-br ${config.bgGradient} border-2 ${config.borderColor} rounded-2xl p-6 shadow-xl`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <ActionIcon size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">
                  {config.title}
                </h4>
                <p className="text-slate-600 text-sm font-medium">
                  {config.description}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {actionType === "extend_sla" && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    New SLA Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={newSlaDeadline}
                    onChange={(e) => setNewSlaDeadline(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-semibold text-slate-900"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Calendar size={12} />
                    Current:{" "}
                    {issue.sla_deadline
                      ? new Date(issue.sla_deadline).toLocaleString()
                      : "Not set"}
                  </p>
                </div>
              )}

              {actionType === "reassign_ward" && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Shield size={16} />
                    Select Ward Officer
                  </label>
                  <select
                    value={selectedWardOfficer}
                    onChange={(e) => setSelectedWardOfficer(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all font-semibold text-slate-900"
                  >
                    <option value="">-- Select Ward Officer --</option>
                    {wardOfficers.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.full_name}{" "}
                        {officer.ward_zone ? `(${officer.ward_zone})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === "reassign_field" && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Users size={16} />
                    Select Field Officer
                  </label>
                  <select
                    value={selectedFieldOfficer}
                    onChange={(e) => setSelectedFieldOfficer(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all font-semibold text-slate-900"
                  >
                    <option value="">-- Select Field Officer --</option>
                    {fieldOfficers.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.full_name}{" "}
                        {officer.ward_zone ? `(${officer.ward_zone})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === "change_category" && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Tag size={16} />
                    New Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-500 transition-all font-semibold text-slate-900 capitalize"
                  >
                    <option value="road">Road</option>
                    <option value="lighting">Lighting</option>
                    <option value="waste">Waste</option>
                    <option value="water">Water</option>
                    <option value="other">Other</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">
                    Current category:{" "}
                    <span className="font-bold capitalize">
                      {issue.category}
                    </span>
                  </p>
                </div>
              )}

              {actionType === "reject" && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <XCircle size={16} />
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all font-medium text-slate-900"
                    placeholder="Provide a clear reason for rejecting this issue..."
                  />
                </div>
              )}

              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Resolution Notes *
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-medium text-slate-900"
                  placeholder="Provide detailed notes about your resolution decision for audit trail..."
                />
                <p className="text-xs text-slate-500 mt-2">
                  This will be recorded in the audit log for accountability
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleResolveEscalation}
              disabled={loading}
              className={`flex-1 px-6 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : `bg-gradient-to-r ${config.gradient} hover:scale-105 active:scale-95`
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <ActionIcon size={20} />
                  {actionType === "reject"
                    ? "Reject Issue"
                    : "Resolve Escalation"}
                  <Sparkles size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
