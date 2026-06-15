import { useEffect, useState } from "react";
import {
  Search,
  Shield,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Target,
  ArrowUpRight,
  ChevronDown,
  User,
  MapPin,
  Calendar,
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  LogOut,
  Bell,
  RefreshCw,
  Mail,
  Zap,
  AlertCircle,
  UserCheck,
  Eye,
  X,
  Filter,
  Star,
  Layers,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminIssueModal } from "./AdminIssueModal";
import { AdminMessageModal } from "./AdminMessageModal";
import { AdminReassignModal } from "./AdminReassignModal";
import { MessagesCenter } from "../MessageCenter";
import { ModeToggle } from "../ModeToggle";
// import SLAMonitoringDashboard from './SLAMonitoringDashboard';
// import SLAAnalyticsDashboard from './SLAAnalyticsDashboard';
// import ComprehensiveAuditLog from './ComprehensiveAuditLog';

// ── internal helper components ────────────────────────────────────────────────

function RoleBadge({ role }) {
  return role === "unit_officer" ? (
    <span className="inline-flex items-center gap-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-2.5 py-1 rounded-lg text-xs font-bold">
      <Shield size={12} /> Ward Officer
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold">
      <Zap size={12} /> Field Officer
    </span>
  );
}

function WorkloadBadge({ status }) {
  if (status === "overloaded")
    return (
      <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-full text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
        Overloaded
      </span>
    );
  if (status === "underutilized")
    return (
      <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
        Underutilized
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
      Balanced
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    verified:
      "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
    assigned:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    in_progress:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    pending_uo_verification:
      "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
    rework_required:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    resolved:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    closed:
      "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    reopened:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    escalated:
      "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    withdrawn:
      "bg-gray-150 dark:bg-gray-900/30 text-gray-705 dark:text-gray-300",
  };
  const label = {
    pending: "Pending",
    verified: "Verified",
    assigned: "Assigned",
    in_progress: "In Progress",
    pending_uo_verification: "Pending Verification",
    rework_required: "Rework Required",
    resolved: "Resolved",
    closed: "Closed",
    rejected: "Rejected",
    reopened: "Reopened",
    escalated: "Escalated",
    withdrawn: "Withdrawn",
  };
  return (
    <span
      className={`inline-block text-xs font-bold px-2 py-0.5 rounded capitalize ${map[status] || "bg-slate-100 text-slate-700"}`}
    >
      {label[status] || status}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    medium:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    low: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  };
  return (
    <span
      className={`inline-block text-xs font-bold px-2 py-0.5 rounded capitalize ${map[severity] || "bg-slate-100 text-slate-700"}`}
    >
      {severity}
    </span>
  );
}

function MetricTile({ label, value, sub, color }) {
  return (
    <div className={`rounded-2xl p-4 border ${color}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
        {label}
      </p>
      <p className="text-2xl font-black">{value}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Officer card

function OfficerCard({ ow, onOpen, onMessage }) {
  const borderColor =
    ow.workloadStatus === "overloaded"
      ? "border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600"
      : ow.workloadStatus === "underutilized"
        ? "border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600"
        : "border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600";
  const glowColor =
    ow.workloadStatus === "overloaded"
      ? "from-red-500/10"
      : ow.workloadStatus === "underutilized"
        ? "from-amber-500/10"
        : "from-emerald-500/10";
  const avatarGrad =
    ow.officer.role === "unit_officer"
      ? "from-cyan-500 to-blue-600"
      : "from-emerald-500 to-teal-600";
  const dotColor =
    ow.workloadStatus === "overloaded"
      ? "bg-red-500"
      : ow.workloadStatus === "underutilized"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div
      className={`group relative overflow-hidden bg-white dark:bg-slate-800/80 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-400 border-2 ${borderColor} cursor-pointer hover:-translate-y-1`}
      onClick={onOpen}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${glowColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      ></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-700/30 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative flex-shrink-0">
            {ow.officer.profilePictureUrl ? (
              <img
                src={ow.officer.profilePictureUrl}
                alt={ow.officer.fullName}
                className="w-14 h-14 rounded-2xl object-cover shadow-xl group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white font-black text-lg shadow-xl group-hover:scale-105 transition-transform duration-300`}
              >
                {ow.officer.fullName
                  ? ow.officer.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                  : ""}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow ${dotColor} ${ow.workloadStatus === "overloaded" ? "animate-pulse" : ""}`}
            ></span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight truncate mb-1.5">
              {ow.officer.fullName}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <RoleBadge role={ow.officer.role} />
              {(ow.officer.city || ow.officer.district) && (
                <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg text-xs font-semibold">
                  <MapPin size={10} />
                  {ow.officer.city || ow.officer.district}
                </span>
              )}
            </div>
          </div>
          <WorkloadBadge status={ow.workloadStatus} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            {
              label: "Total",
              value: ow.total,
              color: "text-slate-900 dark:text-white",
            },
            {
              label: "Pending",
              value: ow.pending,
              color: "text-amber-600 dark:text-amber-400",
            },
            {
              label: "Active",
              value: ow.inProgress,
              color: "text-blue-600 dark:text-blue-400",
            },
            {
              label: "Resolved",
              value: ow.resolved,
              color: "text-emerald-600 dark:text-emerald-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center bg-slate-50 dark:bg-slate-700/50 rounded-xl py-2 px-1"
            >
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Completion bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600 dark:text-slate-400">
              Completion
            </span>
            <span className="text-slate-900 dark:text-white">
              {ow.completionRate}%
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${ow.completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              {ow.rating}
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <Clock size={11} />
              {ow.avgResolutionTime}h avg
            </span>
          </div>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onMessage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all hover:shadow-md hover:shadow-blue-500/30"
            >
              <Mail size={12} />
              Message
            </button>
            <button
              onClick={onOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold transition-all hover:shadow-md hover:shadow-emerald-500/30"
            >
              <Eye size={12} />
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Issue card inside dialog

function OfficerIssueCard({ issue, onView, onReassign }) {
  const issueTime =
    issue.createdAt ||
    (issue.created_at ? new Date(issue.created_at).getTime() : Date.now());
  const daysSince = Math.floor(
    (Date.now() - issueTime) / (1000 * 60 * 60 * 24),
  );

  // Overdue if slaDeadline exists and has passed, or if daysSince > 7 as a fallback
  const isOverdue = issue.slaDeadline
    ? issue.slaDeadline < Date.now() &&
      !["resolved", "closed", "rejected", "withdrawn"].includes(issue.status)
    : false;

  return (
    <div
      className={`group relative rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
        isOverdue
          ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
          : ["resolved", "closed"].includes(issue.status)
            ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
            : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700"
      }`}
      onClick={onView}
    >
      {isOverdue && (
        <div className="absolute top-3 right-3">
          <span className="flex items-center gap-1 text-xs font-black text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full animate-pulse">
            <AlertTriangle size={10} />
            OVERDUE
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <code className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
          {issue.issueCode || issue.ticket_id}
        </code>
        <StatusBadge status={issue.status} />
        {issue.status === "escalated" && issue.escalation && (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/20 px-2 py-0.5 border border-rose-200 dark:border-rose-900/50 rounded capitalize shadow-sm">
            <span>🚨 Escalated:</span>
            <span className="opacity-80">
              {issue.escalation.category ? issue.escalation.category.replace(/_/g, " ") : ""}
            </span>
            <span className={`text-[9px] uppercase px-1.5 py-0.2 bg-rose-500 text-white rounded font-extrabold ${issue.escalation.priority === "critical" ? "animate-pulse" : ""}`}>
              {issue.escalation.priority}
            </span>
          </span>
        )}

        {(issue.priority || issue.severity) && (
          <SeverityBadge severity={issue.priority || issue.severity} />
        )}
        {issue.category && (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
            {issue.category}
          </span>
        )}
      </div>

      <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">
        {issue.title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
        {issue.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {daysSince === 0 ? "Today" : `${daysSince}d ago`}
          </span>
          {(issue.address || issue.location) && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {(issue.address || issue.location).slice(0, 20)}
            </span>
          )}
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onReassign}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
          >
            <UserCheck size={11} />
            Reassign
          </button>
          <button
            onClick={onView}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
          >
            <Eye size={11} />
            View
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Officer Details Dialog

function OfficerDetailsDialog({
  ow,
  onClose,
  onViewIssue,
  onReassignIssue,
  onMessage,
}) {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [severityF, setSeverityF] = useState("all");
  const [categoryF, setCategoryF] = useState("all");

  const avatarGrad =
    ow.officer.role === "unit_officer"
      ? "from-cyan-500 to-blue-600"
      : "from-emerald-500 to-teal-600";

  const categories = [
    ...new Set(
      ow.issues.map((i) => ("category" in i ? i.category : "")).filter(Boolean),
    ),
  ];

  const filtered = ow.issues.filter((issue) => {
    if (
      search &&
      !(issue.issueCode || issue.ticket_id)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      !issue.title.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (statusF !== "all" && issue.status !== statusF) return false;
    if (
      severityF !== "all" &&
      (issue.priority || issue.severity || "") !== severityF
    )
      return false;
    if (
      categoryF !== "all" &&
      ("category" in issue ? issue.category : "") !== categoryF
    )
      return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Dialog header with gradient */}
        <div
          className={`relative overflow-hidden bg-gradient-to-br ${avatarGrad} p-6 flex-shrink-0`}
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent_60%)]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {ow.officer.profilePictureUrl ? (
                  <img
                    src={ow.officer.profilePictureUrl}
                    alt={ow.officer.fullName}
                    className="w-20 h-20 rounded-3xl object-cover shadow-2xl border-2 border-white/40"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-black text-2xl shadow-2xl">
                    {ow.officer.fullName
                      ? ow.officer.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                      : ""}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-1">
                  {ow.officer.fullName}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold border border-white/30">
                    {ow.officer.role === "unit_officer" ? (
                      <>
                        <Shield size={13} />
                        Ward Officer
                      </>
                    ) : (
                      <>
                        <Zap size={13} />
                        Field Officer
                      </>
                    )}
                  </span>
                  {(ow.officer.city || ow.officer.district) && (
                    <span className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold border border-white/30">
                      <MapPin size={13} />
                      {ow.officer.city || ow.officer.district}
                    </span>
                  )}
                  <WorkloadBadge status={ow.workloadStatus} />
                </div>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <span className="flex items-center gap-1">
                    <Star
                      size={14}
                      className="text-yellow-300 fill-yellow-300"
                    />
                    {ow.rating} rating
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {ow.avgResolutionTime}h avg resolution
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onMessage}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl font-bold text-sm transition-all"
              >
                <Mail size={16} />
                Message
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="relative mt-5 grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: "Total", value: ow.total },
              { label: "Pending", value: ow.pending },
              { label: "Active", value: ow.inProgress },
              { label: "Resolved", value: ow.resolved },
              { label: "Completion", value: `${ow.completionRate}%` },
              { label: "Rating", value: `${ow.rating}/5` },
            ].map((k) => (
              <div
                key={k.label}
                className="bg-white/15 border border-white/20 rounded-2xl px-3 py-2 text-center"
              >
                <div className="text-xl font-black text-white">{k.value}</div>
                <div className="text-xs text-white/70 font-semibold">
                  {k.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Officer Profile Details */}
            <div className="space-y-4 lg:col-span-1">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-black text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
                  <User size={18} className="text-emerald-500" />
                  Officer Profile
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-bold text-xs uppercase tracking-wider mb-0.5">
                      Department
                    </span>
                    <span className="text-slate-950 dark:text-white font-extrabold capitalize">
                      {ow.officer.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-bold text-xs uppercase tracking-wider mb-0.5">
                      Email Address
                    </span>
                    <span className="text-slate-950 dark:text-white font-extrabold break-all">
                      {ow.officer.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-bold text-xs uppercase tracking-wider mb-0.5">
                      Phone Number
                    </span>
                    <span className="text-slate-950 dark:text-white font-extrabold">
                      {ow.officer.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-bold text-xs uppercase tracking-wider mb-0.5">
                      District / City
                    </span>
                    <span className="text-slate-950 dark:text-white font-extrabold">
                      {ow.officer.city || "N/A"} ({ow.officer.district || "N/A"}
                      ), {ow.officer.state || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-bold text-xs uppercase tracking-wider mb-0.5">
                      Efficiency Score
                    </span>
                    <span className="text-slate-950 dark:text-white font-extrabold">
                      {ow.officer.efficiencyScore ?? ow.officer.completionRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-bold text-xs uppercase tracking-wider mb-0.5">
                      Account Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${ow.officer.accountApproved ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"}`}
                    >
                      {ow.officer.accountApproved
                        ? "Approved"
                        : "Pending Approval"}
                    </span>
                  </div>
                  {ow.officer.role === "field_officer" &&
                    ow.officer.specialisations &&
                    ow.officer.specialisations.length > 0 && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-bold text-xs uppercase tracking-wider mb-1.5">
                          Specialisations
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ow.officer.specialisations.map((spec) => (
                            <span
                              key={spec}
                              className="inline-flex bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-extrabold capitalize text-slate-800 dark:text-slate-200"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Right Column: Issue List & Filters */}
            <div className="lg:col-span-2 space-y-4">
              {/* Issue filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={16}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search issues..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                {[
                  {
                    value: statusF,
                    onChange: setStatusF,
                    options: [
                      ["all", "All Status"],
                      ["pending", "Pending"],
                      ["in_progress", "In Progress"],
                      ["resolved", "Resolved"],
                      ["under_review", "Under Review"],
                    ],
                  },
                  {
                    value: severityF,
                    onChange: setSeverityF,
                    options: [
                      ["all", "All Severity"],
                      ["high", "High"],
                      ["medium", "Medium"],
                      ["low", "Low"],
                    ],
                  },
                  ...(categories.length > 0
                    ? [
                        {
                          value: categoryF,
                          onChange: setCategoryF,
                          options: [
                            ["all", "All Categories"],
                            ...categories.map((c) => [
                              c,
                              c.charAt(0).toUpperCase() + c.slice(1),
                            ]),
                          ],
                        },
                      ]
                    : []),
                ].map((sel, i) => (
                  <div key={i} className="relative">
                    <select
                      value={sel.value}
                      onChange={(e) => sel.onChange(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      {sel.options.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-semibold">
                  <Filter size={14} />
                  {filtered.length} of {ow.total}
                </div>
              </div>

              {/* Issue grid */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mb-4">
                    <CheckCircle size={40} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                    {ow.total === 0 ? "No Active Issues" : "No Issues Match"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                    {ow.total === 0
                      ? "This officer is currently available for new assignments."
                      : "Try adjusting your search or filters."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((issue, index) => (
                    <OfficerIssueCard
                      key={index}
                      issue={issue}
                      onView={() => onViewIssue(issue)}
                      onReassign={() => onReassignIssue(issue)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Dashboard

export function AdminDashboard() {
  const user = { id: "2" };
  const profile = { full_name: "Sagnik Dey", role: "Administrator" };
  const [activeTab, setActiveTab] = useState("officers");
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [messageOfficer, setMessageOfficer] = useState(null);
  const [messageIssues, setMessageIssues] = useState([]);
  const [reassignIssue, setReassignIssue] = useState(null);

  const [officerFilter, setOfficerFilter] = useState("all");
  const [workloadFilter, setWorkloadFilter] = useState("all");
  const [officerSearchTerm, setOfficerSearchTerm] = useState("");
  const [officerSort, setOfficerSort] = useState("highest_workload");

  const [selectedOfficerWorkload, setSelectedOfficerWorkload] = useState(null);
  const [isOfficerDialogOpen, setIsOfficerDialogOpen] = useState(false);

  const commandCenterData = useQuery(api.admin.getOfficerCommandCenterData);

  const [issues, setIssues] = useState([]);

  useEffect(() => {
    if (commandCenterData?.issues) {
      setIssues(commandCenterData.issues);
    }
  }, [commandCenterData?.issues]);

  function loadIssues() {
    // Convex is fully reactive and updates in real-time.
    // For manual refresh, we trigger a page reload to pull the latest state.
    window.location.reload();
  }

  function handleIssueUpdated(issueId, updates) {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId || i._id === issueId ? { ...i, ...updates } : i,
      ),
    );
    setSelectedIssue(null);
  }

  function handleSendMessage(officerId, message, issueIds) {
    if (!user) return;
    const stored = localStorage.getItem("messages");
    const messages = stored ? JSON.parse(stored) : [];
    messages.push({
      id: `msg-${Date.now()}`,
      from_user_id: user.id,
      to_user_id: officerId,
      message,
      created_at: new Date().toISOString(),
      read: false,
      issue_ids: issueIds,
    });
    localStorage.setItem("messages", JSON.stringify(messages));
    alert(
      `Message sent successfully!\n\nThe officer will be notified and can reply from their Messages Center.`,
    );
    setMessageOfficer(null);
    setMessageIssues([]);
  }

  function handleReassign(issueId, newOfficerId, reason) {
    const issue = issues.find((i) => i.id === issueId || i._id === issueId);
    const oldOfficer = officers.find(
      (o) =>
        o.id ===
        (issue?.assignedUnitOfficer ||
          issue?.assignedFieldOfficer ||
          issue?.assignedTo),
    );
    const newOfficer = officers.find((o) => o.id === newOfficerId);
    if (oldOfficer && newOfficer && oldOfficer.role !== newOfficer.role) {
      alert(
        `Invalid reassignment!\n\n${oldOfficer.role === "unit_officer" ? "Ward Officers" : "Field Officers"} can only be reassigned to other ${oldOfficer.role === "unit_officer" ? "Ward Officers" : "Field Officers"}.`,
      );
      return;
    }
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId || i._id === issueId
          ? {
              ...i,
              assignedUnitOfficer:
                newOfficer?.role === "unit_officer"
                  ? newOfficerId
                  : i.assignedUnitOfficer,
              assignedFieldOfficer:
                newOfficer?.role === "field_officer"
                  ? newOfficerId
                  : i.assignedFieldOfficer,
              assignedTo: newOfficerId,
              updatedAt: Date.now(),
            }
          : i,
      ),
    );
    console.log("Reassignment recorded:", {
      issueId,
      from: oldOfficer?.fullName,
      to: newOfficer?.fullName,
      reason,
      timestamp: new Date().toISOString(),
    });
    alert(
      `Issue reassigned successfully!\n\nFrom: ${oldOfficer?.fullName || "Unassigned"}\nTo: ${newOfficer?.fullName}\nReason: ${reason}\n\nBoth officers have been notified.`,
    );
    setReassignIssue(null);
    setSelectedIssue(null);
  }

  function openMessageModal(officer, officerIssues) {
    setMessageOfficer(officer);
    setMessageIssues(officerIssues);
  }

  function handleRevoke(issueId, reason) {
    const issue = issues.find((i) => i.id === issueId || i._id === issueId);
    const officer = officers.find(
      (o) =>
        o.id ===
        (issue?.assignedUnitOfficer ||
          issue?.assignedFieldOfficer ||
          issue?.assignedTo),
    );
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId || i._id === issueId
          ? {
              ...i,
              assignedUnitOfficer: null,
              assignedFieldOfficer: null,
              assignedTo: null,
              status: "pending",
              updatedAt: Date.now(),
            }
          : i,
      ),
    );
    console.log("Assignment revoked:", {
      issueId,
      from: officer?.fullName,
      reason,
      timestamp: new Date().toISOString(),
    });
    alert(
      `Assignment revoked successfully!\n\nFrom: ${officer?.fullName || "Unassigned"}\nReason: ${reason}\n\nThe officer has been notified and the issue is now unassigned.`,
    );
    setSelectedIssue(null);
  }

  if (commandCenterData === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#050505] p-6 text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-3xl border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-650 dark:text-slate-350 text-lg font-extrabold tracking-tight">
          Loading officer command center...
        </p>
      </div>
    );
  }

  const officers = commandCenterData?.officers ?? [];

  const officerWorkload = officers.map((officer) => {
    const assignedIssues = issues.filter((issue) => {
      if (officer.role === "field_officer") {
        return issue.assignedFieldOfficer === officer.userId;
      } else {
        return issue.assignedUnitOfficer === officer.userId;
      }
    });

    const total = assignedIssues.length;

    let pending = 0;
    let inProgress = 0;
    let resolved = 0;
    let rejected = 0;
    let overdue = 0;

    assignedIssues.forEach((issue) => {
      const status = (issue.status || "").toLowerCase().trim();
      const daysSince = Math.floor(
        (Date.now() -
          (issue.createdAt ||
            new Date(issue.created_at || Date.now()).getTime())) /
          (1000 * 60 * 60 * 24),
      );

      const isOverdue = issue.slaDeadline
        ? issue.slaDeadline < Date.now() &&
          !["resolved", "closed", "rejected", "withdrawn"].includes(status)
        : daysSince > 7 &&
          !["resolved", "closed", "rejected", "withdrawn"].includes(status);

      if (isOverdue) {
        overdue++;
      }

      if (officer.role === "field_officer") {
        if (status === "pending") {
          pending++;
        } else if (
          [
            "assigned",
            "in_progress",
            "rework_required",
            "pending_uo_verification",
          ].includes(status)
        ) {
          inProgress++;
        } else if (["resolved", "closed"].includes(status)) {
          resolved++;
        } else if (status === "rejected") {
          rejected++;
        }
      } else {
        // Unit officer
        if (["pending", "verified"].includes(status)) {
          pending++;
        } else if (
          [
            "assigned",
            "in_progress",
            "pending_uo_verification",
            "rework_required",
          ].includes(status)
        ) {
          inProgress++;
        } else if (["resolved", "closed"].includes(status)) {
          resolved++;
        } else if (status === "rejected") {
          rejected++;
        }
      }
    });

    const completionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Workload Status
    let workloadStatus = "balanced";
    if (officer.role === "field_officer") {
      const activeCount = officer.currentActiveIssues;
      const capacity = officer.maxIssueCapacity || 15;
      const workloadPct = capacity > 0 ? (activeCount / capacity) * 100 : 0;
      if (activeCount >= capacity || workloadPct >= 85) {
        workloadStatus = "overloaded";
      } else if (activeCount <= 1 || workloadPct <= 25) {
        workloadStatus = "underutilized";
      }
    } else {
      // Unit Officer workload rules
      const activeCount = assignedIssues.filter(
        (i) =>
          !["resolved", "closed", "rejected", "withdrawn"].includes(
            (i.status || "").toLowerCase().trim(),
          ),
      ).length;
      if (activeCount >= 15) {
        workloadStatus = "overloaded";
      } else if (activeCount <= 4) {
        workloadStatus = "underutilized";
      }
    }

    return {
      officer,
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      overdue,
      issues: assignedIssues,
      completionRate,
      avgResolutionTime: officer.avgResolutionTime ?? 0,
      workloadStatus,
      rating: officer.rating ?? 0,
    };
  });

  const assignedIssues = issues.filter(
    (i) => i.assignedUnitOfficer || i.assignedFieldOfficer || i.assignedTo,
  );
  const overdueIssues = issues.filter((issue) => {
    const status = (issue.status || "").toLowerCase().trim();
    const daysSince = Math.floor(
      (Date.now() -
        (issue.createdAt ||
          new Date(issue.created_at || Date.now()).getTime())) /
        (1000 * 60 * 60 * 24),
    );
    return issue.slaDeadline
      ? issue.slaDeadline < Date.now() &&
          !["resolved", "closed", "rejected", "withdrawn"].includes(status)
      : daysSince > 7 &&
          !["resolved", "closed", "rejected", "withdrawn"].includes(status);
  });

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    in_progress: issues.filter((i) =>
      [
        "assigned",
        "in_progress",
        "rework_required",
        "pending_uo_verification",
      ].includes(i.status),
    ).length,
    resolved: issues.filter((i) => ["resolved", "closed"].includes(i.status))
      .length,
    escalated: issues.filter(
      (i) => i.escalatedToAdmin === true || i.status === "escalated",
    ).length,
  };

  const filteredOfficers = officerWorkload
    .filter((ow) => {
      if (officerFilter !== "all" && ow.officer.role !== officerFilter)
        return false;
      if (workloadFilter !== "all" && ow.workloadStatus !== workloadFilter)
        return false;
      if (
        officerSearchTerm &&
        !ow.officer.fullName
          .toLowerCase()
          .includes(officerSearchTerm.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (officerSort) {
        case "highest_workload":
          return b.total - a.total;
        case "lowest_workload":
          return a.total - b.total;
        case "highest_completion":
          return b.completionRate - a.completionRate;
        case "most_active":
          return b.inProgress - a.inProgress;
        case "name_az":
          return a.officer.fullName.localeCompare(b.officer.fullName);
        default:
          return 0;
      }
    });

  console.log("filteredOfficers", filteredOfficers);

  const avgCompletion =
    officerWorkload.length > 0
      ? Math.round(
          officerWorkload.reduce((sum, ow) => sum + ow.completionRate, 0) /
            officerWorkload.length,
        )
      : 0;
  const balancedCount = officerWorkload.filter(
    (ow) => ow.workloadStatus === "balanced",
  ).length;

  // Keep selectedOfficerWorkload in sync with updated issues
  const liveSelectedOfficerWorkload = selectedOfficerWorkload
    ? (officerWorkload.find(
        (ow) => ow.officer.id === selectedOfficerWorkload.officer.id,
      ) ?? null)
    : null;

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  const tabBtn = (tab, icon, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-8 py-3.5 font-bold text-sm whitespace-nowrap transition-all duration-500 flex items-center gap-3 rounded-full relative group/btn ${
        activeTab === tab
          ? "text-white bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_25px_rgba(52,211,153,0.6)] border border-emerald-400/50 scale-105"
          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 border border-transparent"
      }`}
    >
      {activeTab === tab && (
        <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10 tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navbar */}
      <nav className="bg-white/95 dark:bg-slate-900/95 shadow-lg sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg">
                  <Shield className="text-white" size={20} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent tracking-tight">
                  CityCare Admin
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  System Control Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadIssues}
                className="group flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <RefreshCw
                  size={16}
                  className="group-hover:rotate-180 transition-transform duration-500"
                />
                <span className="hidden sm:inline font-semibold text-sm">
                  Refresh
                </span>
              </button>
              <div className="relative">
                <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  <Bell size={18} />
                </button>
                {stats.escalated > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.escalated}
                  </span>
                )}
              </div>
              <ModeToggle />
              <div className="flex items-center gap-3 pl-3 border-l border-slate-300 dark:border-slate-700">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {profile?.full_name || "Admin"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                    {profile?.role || "Administrator"}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {(profile?.full_name || "A").charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            {
              label: "Total Issues",
              value: stats.total,
              icon: <BarChart3 size={20} />,
              bg: "bg-slate-100 dark:bg-slate-700",
              text: "text-slate-600 dark:text-slate-300",
              bar: "from-slate-400 to-slate-200 dark:from-slate-600 dark:to-slate-700",
              card: "border-slate-200 dark:border-slate-700",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: <Clock size={20} />,
              bg: "bg-amber-100 dark:bg-amber-800/40",
              text: "text-amber-600 dark:text-amber-400",
              bar: "from-amber-400 to-amber-200 dark:from-amber-600 dark:to-amber-800",
              card: "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
            },
            {
              label: "In Progress",
              value: stats.in_progress,
              icon: <Activity size={20} />,
              bg: "bg-blue-100 dark:bg-blue-800/40",
              text: "text-blue-600 dark:text-blue-400",
              bar: "from-blue-400 to-blue-200 dark:from-blue-600 dark:to-blue-800",
              card: "border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: <CheckCircle size={20} />,
              bg: "bg-emerald-100 dark:bg-emerald-800/40",
              text: "text-emerald-600 dark:text-emerald-400",
              bar: "from-emerald-400 to-emerald-200 dark:from-emerald-600 dark:to-emerald-800",
              card: "border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
            },
            {
              label: "Officers",
              value: officers.length,
              icon: <Users size={20} />,
              bg: "bg-cyan-100 dark:bg-cyan-800/40",
              text: "text-cyan-600 dark:text-cyan-400",
              bar: "from-cyan-400 to-cyan-200 dark:from-cyan-600 dark:to-cyan-800",
              card: "border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20",
            },
            {
              label: "Escalated",
              value: stats.escalated,
              icon: (
                <AlertTriangle
                  size={20}
                  className={stats.escalated > 0 ? "animate-pulse" : ""}
                />
              ),
              bg: "bg-red-100 dark:bg-red-800/40",
              text: "text-red-600 dark:text-red-400",
              bar: "from-red-400 to-red-200 dark:from-red-600 dark:to-red-800",
              card: "border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border ${s.card} transform hover:-translate-y-1`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl"></div>
              <div className="relative">
                <div className={`inline-flex p-2 ${s.bg} rounded-lg mb-3`}>
                  <span className={s.text}>{s.icon}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold mb-1">
                  {s.label}
                </p>
                <p className="text-4xl font-black text-slate-900 dark:text-white">
                  {s.value}
                </p>
                <div
                  className={`mt-4 h-1.5 bg-gradient-to-r ${s.bar} rounded-full`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="relative mb-10 z-40 flex justify-center">
          <div className="relative bg-white/30 dark:bg-[#0f172a]/50 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-y border-white/80 dark:border-white/20 p-2 overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent dark:from-white/5 pointer-events-none rounded-[2.5rem]"></div>
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar relative z-10 px-1">
              {tabBtn("officers", <Users size={20} />, "Officers")}
              {tabBtn("messages", <MessageSquare size={20} />, "Messages")}
              {tabBtn("sla", <Clock size={20} />, "SLA")}
              {tabBtn("analytics", <BarChart3 size={20} />, "Analytics")}
              {tabBtn("audit", <Shield size={20} />, "Audit")}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* ── Officers Command Center tab ───────────────────────────── */}
          {activeTab === "officers" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Hero banner */}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl shadow-2xl">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent_60%)]"></div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full -ml-20 translate-y-1/2"></div>
                <div className="relative p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <h2 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
                        <div className="p-3 bg-white/20 rounded-2xl">
                          <Layers size={32} />
                        </div>
                        Officer Command Center
                      </h2>
                      <p className="text-emerald-50 text-base font-medium max-w-lg">
                        Monitor officer capacity, assignment health, and issue
                        performance from one unified control surface.
                      </p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        {
                          label: "Ward Officers",
                          value: officers.filter(
                            (o) => o.role === "unit_officer",
                          ).length,
                        },
                        {
                          label: "Field Officers",
                          value: officers.filter(
                            (o) => o.role === "field_officer",
                          ).length,
                        },
                        {
                          label: "Overdue Issues",
                          value: overdueIssues.length,
                        },
                        { label: "Avg Completion", value: `${avgCompletion}%` },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="bg-white/20 rounded-2xl px-5 py-3 border border-white/30 hover:bg-white/30 transition-all duration-300 min-w-[90px] text-center"
                        >
                          <div className="text-2xl font-black text-white">
                            {s.value}
                          </div>
                          <div className="text-white/80 text-xs font-bold mt-0.5 whitespace-nowrap">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary metric tiles */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  {
                    label: "Total Officers",
                    value: officers.length,
                    sub: "Active",
                    color:
                      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
                  },
                  {
                    label: "Balanced",
                    value: balancedCount,
                    sub: "Healthy workload",
                    color:
                      "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200",
                  },
                  {
                    label: "Overloaded",
                    value: officerWorkload.filter(
                      (o) => o.workloadStatus === "overloaded",
                    ).length,
                    sub: "Need attention",
                    color:
                      "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
                  },
                  {
                    label: "Assigned Issues",
                    value: assignedIssues.length,
                    sub: "Total active",
                    color:
                      "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200",
                  },
                  {
                    label: "Overdue Issues",
                    value: overdueIssues.length,
                    sub: "> 7 days",
                    color:
                      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
                  },
                  {
                    label: "Avg Completion",
                    value: `${avgCompletion}%`,
                    sub: "Across all officers",
                    color:
                      "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200",
                  },
                ].map((t) => (
                  <MetricTile
                    key={t.label}
                    label={t.label}
                    value={t.value}
                    sub={t.sub}
                    color={t.color}
                  />
                ))}
              </div>

              {/* Controls bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="relative flex-1 min-w-[260px]">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={18}
                    />
                    <input
                      type="text"
                      value={officerSearchTerm}
                      onChange={(e) => setOfficerSearchTerm(e.target.value)}
                      placeholder="Search officers by name..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-sm"
                    />
                  </div>

                  {[
                    {
                      value: officerFilter,
                      onChange: (v) => setOfficerFilter(v),
                      options: [
                        ["all", "All Roles"],
                        ["unit_officer", "Ward Officers"],
                        ["field_officer", "Field Officers"],
                      ],
                      color:
                        "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20",
                    },
                    {
                      value: workloadFilter,
                      onChange: (v) => setWorkloadFilter(v),
                      options: [
                        ["all", "All Workloads"],
                        ["overloaded", "Overloaded"],
                        ["balanced", "Balanced"],
                        ["underutilized", "Underutilized"],
                      ],
                      color:
                        "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20",
                    },
                    {
                      value: officerSort,
                      onChange: (v) => setOfficerSort(v),
                      options: [
                        ["highest_workload", "Highest Workload"],
                        ["lowest_workload", "Lowest Workload"],
                        ["highest_completion", "Highest Completion"],
                        ["most_active", "Most Active"],
                        ["name_az", "Name A–Z"],
                      ],
                      color:
                        "border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20",
                    },
                  ].map((sel, i) => (
                    <div key={i} className="relative">
                      <select
                        value={sel.value ?? "all"}
                        onChange={(e) => sel.onChange(e.target.value)}
                        className={`appearance-none pl-4 pr-9 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white font-bold cursor-pointer text-sm ${sel.color}`}
                      >
                        {sel.options.map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                      />
                    </div>
                  ))}

                  <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold ml-auto">
                    {filteredOfficers.length} officer
                    {filteredOfficers.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Officer card grid */}
              {filteredOfficers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                    <Users
                      size={48}
                      className="text-slate-300 dark:text-slate-600"
                    />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-bold">
                    No officers match your filters
                  </p>
                  <p className="text-slate-400 dark:text-slate-600 text-sm mt-1">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredOfficers.map((ow) => (
                    <OfficerCard
                      key={ow.officer.id}
                      ow={ow}
                      onOpen={() => {
                        setSelectedOfficerWorkload(ow);
                        setIsOfficerDialogOpen(true);
                      }}
                      onMessage={() => openMessageModal(ow.officer, ow.issues)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages tab */}
          {activeTab === "messages" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare size={24} />
                  Messages Center
                </h2>
              </div>
              <div className="p-6">
                <MessagesCenter user={user} profile={{ role: "admin" }} />
              </div>
            </div>
          )}

          {/* SLA tab */}
          {/* {activeTab === 'sla' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock size={24} />SLA Monitoring
                </h2>
              </div>
              <div className="p-6">
                <SLAMonitoringDashboard onViewIssue={issue => setSelectedIssue(issue)} />
              </div>
            </div>
          )} */}

          {/* Analytics tab */}
          {/* {activeTab === 'analytics' && (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 size={24} />SLA Analytics</h2>
                </div>
                <div className="p-6"><SLAAnalyticsDashboard /></div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-8">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><TrendingUp size={24} />Performance Analytics</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Avg Resolution Time', value: '36h', icon: <BarChart3 size={22} />, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
                      { label: 'Success Rate', value: '94%', icon: <TrendingUp size={22} />, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
                      { label: 'Active Officers', value: officers.length, icon: <Users size={22} />, bg: 'bg-cyan-100 dark:bg-cyan-900/30', color: 'text-cyan-600 dark:text-cyan-400' },
                      { label: 'Avg Workload', value: Math.round(issues.length / officers.length), icon: <Activity size={22} />, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' },
                    ].map(m => (
                      <div key={m.label} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
                        <div className={`inline-flex p-3 ${m.bg} rounded-xl mb-3`}><span className={m.color}>{m.icon}</span></div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{m.label}</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl text-center">
                    <TrendingUp size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Advanced Analytics Coming Soon</h3>
                    <p className="text-slate-600 dark:text-slate-400">Detailed charts, trends, and insights will be available here</p>
                  </div>
                </div>
              </div>
            </>
          )} */}

          {/* Audit tab */}
          {/* {activeTab === 'audit' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield size={24} />Audit Logs</h2>
              </div>
              <div className="p-6"><ComprehensiveAuditLog /></div>
            </div>
          )} */}
        </div>
      </div>

      {/* Officer Details Dialog */}
      {isOfficerDialogOpen && liveSelectedOfficerWorkload && (
        <OfficerDetailsDialog
          ow={liveSelectedOfficerWorkload}
          onClose={() => {
            setIsOfficerDialogOpen(false);
            setSelectedOfficerWorkload(null);
          }}
          onViewIssue={(issue) => {
            setSelectedIssue(issue);
          }}
          onReassignIssue={(issue) => {
            setReassignIssue(issue);
          }}
          onMessage={() =>
            openMessageModal(
              liveSelectedOfficerWorkload.officer,
              liveSelectedOfficerWorkload.issues,
            )
          }
        />
      )}

      {/* AdminIssueModal */}
      {selectedIssue && (
        <AdminIssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdated={handleIssueUpdated}
        />
      )}

      {/* AdminMessageModal */}
      {messageOfficer && (
        <AdminMessageModal
          officer={messageOfficer}
          issues={messageIssues}
          onClose={() => {
            setMessageOfficer(null);
            setMessageIssues([]);
          }}
          onSend={handleSendMessage}
        />
      )}

      {/* AdminReassignModal */}
      {reassignIssue && (
        <AdminReassignModal
          issue={reassignIssue}
          officers={officers}
          onClose={() => setReassignIssue(null)}
          onReassign={handleReassign}
        />
      )}
    </div>
  );
}
