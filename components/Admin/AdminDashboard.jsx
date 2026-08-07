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
  Trophy,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { signOut, useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { AdminIssueModal } from "./AdminIssueModal";
import { AdminMessageModal } from "./AdminMessageModal";
import { AdminReassignModal } from "./AdminReassignModal";
import { MessagesCenter } from "../MessageCenter";
import { ModeToggle } from "../ModeToggle";
import SLAMonitoringDashboard from "./SLAMonitoringDashboard";
import { BadgeManagementSection } from "./BadgeManagementSystem";
import SLAAnalyticsDashboard from "./SLAAnalyticsDashboard";
// import ComprehensiveAuditLog from './ComprehensiveAuditLog';

function displayPercent(value) {
  if (!Number.isFinite(Number(value))) return 0;
  return Math.max(0, Math.min(100, Math.round(Number(value))));
}

// ── internal helper components ────────────────────────────────────────────────

function RoleBadge({ role }) {
  return role === "unit_officer" ? (
    <span className="inline-flex items-center gap-1 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-lg text-xs font-bold border border-cyan-150 dark:border-cyan-900/50">
      <Shield size={11} /> Ward Officer
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg text-xs font-bold border border-emerald-150 dark:border-emerald-900/50">
      <Zap size={11} /> Field Officer
    </span>
  );
}

function WorkloadBadge({ status }) {
  if (status === "overloaded")
    return (
      <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full text-xs font-bold border border-red-200 dark:border-red-900/50">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
        Overloaded
      </span>
    );
  if (status === "underutilized")
    return (
      <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-900/50">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
        Underutilized
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-900/50">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
      Balanced
    </span>
  );
}

function RiskBadge({ level }) {
  if (level === "High Risk") {
    return (
      <span className="inline-flex items-center gap-1 bg-rose-105 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-900/50">
        <AlertTriangle size={12} className="text-rose-500" />
        High Risk
      </span>
    );
  }
  if (level === "Needs Attention") {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-105 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-900/50">
        <AlertCircle size={12} className="text-amber-505" />
        Needs Attention
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-900/50">
      <CheckCircle size={12} className="text-emerald-500" />
      Good
    </span>
  );
}

function LeaderboardList({ title, list, metricKey, suffix = "" }) {
  const safeList = Array.isArray(list) ? list : [];
  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3.5 shadow-md">
      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
        <span>{title}</span>
        <span className="text-[10px] text-emerald-500 font-bold">
          Top {safeList.length}
        </span>
      </h4>
      <div className="space-y-2">
        {safeList.length === 0 ? (
          <div className="text-xs text-slate-450 dark:text-slate-550 text-center py-6">
            No officers listed
          </div>
        ) : (
          safeList.slice(0, 5).map((ow, idx) => {
            const officer = ow?.officer ?? {};
            const val = ow?.[metricKey] ?? 0;
            return (
              <div
                key={officer.id || officer.userId || idx}
                className="flex items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-800/35 p-2 rounded-xl"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-extrabold text-slate-400 w-4 text-center">
                    {idx + 1}
                  </span>
                  {officer.profilePictureUrl ? (
                    <img
                      src={officer.profilePictureUrl}
                      alt=""
                      className="w-6 h-6 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-[9px]">
                      {(officer.fullName || "Un").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {officer.fullName || "Unknown"}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate capitalize">
                      {officer.department || "No Dept"} •{" "}
                      {officer.city || "No City"}
                    </div>
                  </div>
                </div>
                <div className="font-extrabold text-slate-950 dark:text-slate-100 whitespace-nowrap bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded">
                  {metricKey === "citizenRating"
                    ? `★ ${val}`
                    : `${val}${suffix}`}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PerformanceTable({ data, typeLabel }) {
  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 font-black border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 capitalize">{typeLabel}</th>
              <th className="p-4 text-center">Issues (Tot/Act/Res)</th>
              <th className="p-4 text-center">Overdue</th>
              <th className="p-4 text-center">Officers (U/F)</th>
              <th className="p-4 text-center">Completion</th>
              <th className="p-4 text-center">SLA Compliance</th>
              <th className="p-4 text-center">Avg Resolution</th>
              <th className="p-4 text-center">Citizen Rating</th>
              <th className="p-4 text-center">Avg Efficiency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {!data || data.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="p-8 text-center text-slate-550 font-bold"
                >
                  No performance records found
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.city || row.department}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all font-semibold"
                >
                  <td className="p-4 font-extrabold text-slate-900 dark:text-white capitalize">
                    {row.city || row.department}
                  </td>
                  <td className="p-4 text-center text-slate-700 dark:text-slate-300">
                    {row.totalIssues}{" "}
                    <span className="text-[10px] text-slate-450">
                      / {row.activeIssues} / {row.resolvedIssues}
                    </span>
                  </td>
                  <td
                    className={`p-4 text-center ${row.overdueIssues > 0 ? "text-red-500 font-extrabold animate-pulse" : "text-slate-500"}`}
                  >
                    {row.overdueIssues}
                  </td>
                  <td className="p-4 text-center text-slate-700 dark:text-slate-300">
                    {row.totalOfficers}{" "}
                    <span className="text-[10px] text-slate-450">
                      ({row.unitOfficers}/{row.fieldOfficers})
                    </span>
                  </td>
                  <td className="p-4 text-center text-slate-900 dark:text-white">
                    {displayPercent(row.avgCompletionRate)}%
                  </td>
                  <td className="p-4 text-center text-slate-900 dark:text-white">
                    {displayPercent(row.avgSlaComplianceRate)}%
                  </td>
                  <td className="p-4 text-center text-slate-900 dark:text-white">
                    {row.avgResolutionTime}h
                  </td>
                  <td className="p-4 text-center text-amber-500 font-extrabold">
                    ★ {row.avgCitizenRating}
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-extrabold">
                      {displayPercent(row.avgEfficiencyScore)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
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

function OfficerCard({ ow, onOpen, onMessage, isBusy }) {
  const workloadColor =
    ow.workloadStatus === "overloaded"
      ? "text-red-700 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50"
      : ow.workloadStatus === "underutilized"
        ? "text-amber-705 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50"
        : "text-emerald-705 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50";

  const riskColor =
    ow.riskLevel === "High Risk"
      ? "text-rose-700 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50"
      : ow.riskLevel === "Needs Attention"
        ? "text-amber-705 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50"
        : "text-emerald-705 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50";

  const gradeColor = ow.performanceGrade.startsWith("A")
    ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
    : ow.performanceGrade === "B"
      ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
      : ow.performanceGrade === "C"
        ? "text-amber-605 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        : "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-850";

  const dotColor =
    ow.workloadStatus === "overloaded"
      ? "bg-red-500"
      : ow.workloadStatus === "underutilized"
        ? "bg-amber-500"
        : "bg-emerald-500";

  const avatarGrad =
    ow.officer.role === "unit_officer"
      ? "from-cyan-500 to-blue-600"
      : "from-emerald-500 to-teal-600";

  const borderColor =
    ow.riskLevel === "High Risk"
      ? "border-rose-300 dark:border-rose-700 hover:border-rose-400"
      : ow.riskLevel === "Needs Attention"
        ? "border-amber-300 dark:border-amber-700 hover:border-amber-400"
        : "border-slate-200 dark:border-slate-800 hover:border-emerald-400";

  return (
    <div
      className={`group relative overflow-hidden bg-white dark:bg-slate-900/90 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-400 border-2 ${borderColor} cursor-pointer hover:-translate-y-1`}
      onClick={onOpen}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-700/30 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>

      <div className="relative p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            {ow.officer.profilePictureUrl ? (
              <img
                src={ow.officer.profilePictureUrl}
                alt={ow.officer.fullName}
                className="w-12 h-12 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform duration-300`}
              >
                {ow.officer.fullName
                  ? ow.officer.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : ""}
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 shadow ${dotColor} ${ow.workloadStatus === "overloaded" ? "animate-pulse" : ""}`}
            ></span>
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight truncate mb-1">
              {ow.officer.fullName}
            </h3>
            <div className="flex flex-wrap gap-1 items-center">
              <RoleBadge role={ow.officer.role} />
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-605 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold capitalize">
                {ow.officer.department}
              </span>
            </div>
            <div className="text-[10px] text-slate-505 mt-0.5 truncate font-semibold">
              {ow.officer.city || ow.officer.district || "General Ward"}
            </div>
          </div>
          {/* Grade Badge */}
          <div
            className={`absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-sm border ${gradeColor}`}
          >
            {ow.performanceGrade}
          </div>
        </div>

        {/* Status badges row */}
        <div className="flex flex-wrap gap-1.5">
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${workloadColor}`}
          >
            {ow.workloadStatus}
          </span>
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${riskColor}`}
          >
            {ow.riskLevel}
          </span>
        </div>

        {/* Simple KPI metrics grid */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {[
            {
              label: "Assigned",
              val: ow.total,
              col: "text-slate-800 dark:text-slate-200",
            },
            { label: "Active", val: ow.inProgress, col: "text-blue-500" },
            { label: "Resolved", val: ow.resolved, col: "text-emerald-500" },
            {
              label: "Overdue",
              val: ow.overdue,
              col:
                ow.overdue > 0
                  ? "text-rose-500 font-extrabold animate-pulse"
                  : "text-slate-500",
            },
          ].map((k) => (
            <div
              key={k.label}
              className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-1.5"
            >
              <div className={`text-xs font-black ${k.col}`}>{k.val}</div>
              <div className="text-[9px] text-slate-450 font-semibold">
                {k.label}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
            <span className="text-slate-500">Completion Rate</span>
            <span className="text-slate-805 dark:text-slate-200">
              {ow.completionRate}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              style={{ width: `${ow.completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Performance metrics breakdown */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-505 font-semibold">
          <div className="flex justify-between">
            <span>Efficiency:</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {ow.efficiencyScore}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>SLA Compliance:</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {ow.slaComplianceRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span>Satisfaction:</span>
            <span className="font-extrabold text-amber-500 flex items-center gap-0.5">
              ★ {ow.citizenRating || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Avg Resol. Time:</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {ow.avgResolutionTime}h
            </span>
          </div>
          <div className="flex justify-between col-span-2">
            <span>First-Time Fix Rate:</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {ow.firstTimeFixRate}%
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onMessage}
            disabled={isBusy}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all hover:shadow-md hover:shadow-blue-500/30"
          >
            <Mail size={12} />
            Message
          </button>
          <button
            onClick={onOpen}
            disabled={isBusy}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all hover:shadow-md hover:shadow-emerald-500/30"
          >
            <Eye size={12} />
            Details
          </button>
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
              {issue.escalation.category
                ? issue.escalation.category.replace(/_/g, " ")
                : ""}
            </span>
            <span
              className={`text-[9px] uppercase px-1.5 py-0.2 bg-rose-500 text-white rounded font-extrabold ${issue.escalation.priority === "critical" ? "animate-pulse" : ""}`}
            >
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
  const [slaStatusF, setSlaStatusF] = useState("all");

  const avatarGrad =
    ow.officer.role === "unit_officer"
      ? "from-cyan-500 to-blue-600"
      : "from-emerald-500 to-teal-600";

  const categories = [
    ...new Set(
      ow.issues.map((i) => ("category" in i ? i.category : "")).filter(Boolean),
    ),
  ];

  function getIssueSlaStatus(issue) {
    const status = (issue.status || "").toLowerCase().trim();
    if (["resolved", "closed"].includes(status)) {
      if (
        issue.slaDeadline &&
        (issue.resolvedAt ?? issue.closedAt) > issue.slaDeadline
      ) {
        return "Breached";
      }
      return "On Track";
    }
    if (issue.slaDeadline) {
      if (issue.slaDeadline < Date.now()) {
        return "Overdue";
      }
      if (issue.slaDeadline - Date.now() < 24 * 60 * 60 * 1000) {
        return "Due Soon";
      }
    }
    return "On Track";
  }

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
    if (slaStatusF !== "all" && getIssueSlaStatus(issue) !== slaStatusF)
      return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Dialog header */}
        <div
          className={`relative overflow-hidden bg-gradient-to-br ${avatarGrad} p-6 flex-shrink-0`}
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent_60%)]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                          .toUpperCase()
                      : ""}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
                  {ow.officer.fullName}
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-white/20 text-white border border-white/30">
                    Grade {ow.performanceGrade}
                  </span>
                </h2>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                    {ow.officer.role === "unit_officer" ? (
                      <>
                        <Shield size={13} /> Ward Officer
                      </>
                    ) : (
                      <>
                        <Zap size={13} /> Field Officer
                      </>
                    )}
                  </span>
                  {(ow.officer.city || ow.officer.district) && (
                    <span className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/30">
                      <MapPin size={13} />
                      {ow.officer.city || ow.officer.district}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30 uppercase">
                    Dept: {ow.officer.department || "General"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                    Risk: {ow.riskLevel}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-white/80 text-sm font-semibold">
                  <span className="flex items-center gap-1">
                    <Star
                      size={14}
                      className="text-yellow-300 fill-yellow-300"
                    />
                    {ow.citizenRating || 0} rating
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {ow.avgResolutionTime}h avg resolution
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
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
          <div className="relative mt-5 grid grid-cols-4 sm:grid-cols-8 gap-3">
            {[
              { label: "Total", value: ow.total },
              { label: "Active", value: ow.inProgress },
              { label: "Resolved", value: ow.resolved },
              { label: "Overdue", value: ow.overdue },
              { label: "Completion", value: `${ow.completionRate}%` },
              { label: "Efficiency", value: `${ow.efficiencyScore}%` },
              { label: "SLA", value: `${ow.slaComplianceRate}%` },
              { label: "Rating", value: `${ow.citizenRating}/5` },
            ].map((k) => (
              <div
                key={k.label}
                className="bg-white/15 border border-white/20 rounded-2xl px-2 py-2 text-center"
              >
                <div className="text-lg font-black text-white">{k.value}</div>
                <div className="text-[10px] text-white/70 font-semibold">
                  {k.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Officer Profile & Performance Analytics */}
            <div className="space-y-6 lg:col-span-1">
              {/* Profile Card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-black text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <User size={16} className="text-emerald-500" />
                  Officer Profile
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider mb-0.5">
                      Email Address
                    </span>
                    <span className="text-slate-950 dark:text-white font-extrabold break-all">
                      {ow.officer.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider mb-0.5">
                      Phone Number
                    </span>
                    <span className="text-slate-950 dark:text-white font-extrabold">
                      {ow.officer.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider mb-0.5">
                      District / City
                    </span>
                    <span className="text-slate-950 dark:text-white font-extrabold">
                      {ow.officer.city || "N/A"} ({ow.officer.district || "N/A"}
                      ), {ow.officer.state || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider mb-0.5">
                      Account Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold ${
                        ow.officer.accountApproved
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                      }`}
                    >
                      {ow.officer.accountApproved
                        ? "Approved"
                        : "Pending Approval"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Analytics Card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-black text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Activity size={16} className="text-emerald-500" />
                  Performance Analytics
                </h3>
                <div className="space-y-4 text-xs font-semibold text-slate-650 dark:text-slate-400">
                  <div className="flex justify-between items-center">
                    <span>Efficiency Score</span>
                    <span className="text-slate-950 dark:text-white font-extrabold text-sm">
                      {ow.efficiencyScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>SLA Compliance Rate</span>
                    <span className="text-slate-950 dark:text-white font-extrabold text-sm">
                      {ow.slaComplianceRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>First-Time Fix Rate</span>
                    <span className="text-slate-950 dark:text-white font-extrabold text-sm">
                      {ow.firstTimeFixRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quality Score</span>
                    <span className="text-slate-950 dark:text-white font-extrabold text-sm">
                      {ow.qualityScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Workload Percentage</span>
                    <span className="text-slate-950 dark:text-white font-extrabold text-sm">
                      {ow.workloadPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Citizen Rating</span>
                    <span className="text-slate-950 dark:text-white font-extrabold text-sm">
                      {ow.citizenRating || 0}/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Issue Quality Stats Card */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-black text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <TrendingUp size={16} className="text-emerald-500" />
                  Issue Quality & Breaches
                </h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  {[
                    {
                      label: "Rework Request",
                      value: ow.rework || 0,
                      col: "text-amber-600",
                    },
                    {
                      label: "Reopened Issues",
                      value: ow.reopened || 0,
                      col: "text-rose-500",
                    },
                    {
                      label: "Escalated to Admin",
                      value: ow.escalated || 0,
                      col: "text-rose-500",
                    },
                    {
                      label: "SLA Breaches",
                      value: ow.slaBreaches || 0,
                      col: "text-red-650",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"
                    >
                      <div className={`text-sm font-black ${stat.col}`}>
                        {stat.value}
                      </div>
                      <div className="text-[9.5px] text-slate-400 font-semibold">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Assigned Issues & Filters */}
            <div className="lg:col-span-2 space-y-4">
              {/* Issue filters */}
              <div className="flex flex-wrap gap-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-505"
                    size={15}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search issues by code or title..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                {[
                  {
                    value: statusF,
                    onChange: setStatusF,
                    options: [
                      ["all", "All Statuses"],
                      ["pending", "Pending"],
                      ["assigned", "Assigned"],
                      ["in_progress", "In Progress"],
                      ["pending_uo_verification", "Under Review"],
                      ["rework_required", "Rework Required"],
                      ["resolved", "Resolved"],
                      ["closed", "Closed"],
                    ],
                  },
                  {
                    value: severityF,
                    onChange: setSeverityF,
                    options: [
                      ["all", "All Priorities"],
                      ["high", "High Priority"],
                      ["medium", "Medium Priority"],
                      ["low", "Low Priority"],
                    ],
                  },
                  {
                    value: slaStatusF,
                    onChange: setSlaStatusF,
                    options: [
                      ["all", "All SLA Status"],
                      ["On Track", "On Track"],
                      ["Due Soon", "Due Soon"],
                      ["Overdue", "Overdue"],
                      ["Breached", "Breached"],
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
                      className="appearance-none pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900 dark:text-white font-medium cursor-pointer"
                    >
                      {sel.options.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold ml-auto self-center">
                  <Filter size={12} />
                  <span>
                    {filtered.length} of {ow.total} issues
                  </span>
                </div>
              </div>

              {/* Issue list */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-250 dark:border-slate-700">
                  <div className="w-16 h-16 bg-emerald-105 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-3">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
                    {ow.total === 0
                      ? "No issues assigned"
                      : "No matching issues"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    {ow.total === 0
                      ? "This officer is currently clear of any active workloads."
                      : "Try widening your search or filter values."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                  {filtered.map((issue) => {
                    const slaStatus = getIssueSlaStatus(issue);
                    const slaBadgeColor =
                      slaStatus === "Overdue" || slaStatus === "Breached"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border-rose-200 dark:border-rose-900"
                        : slaStatus === "Due Soon"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 border-amber-200 dark:border-amber-900"
                          : "bg-emerald-100 text-emerald-705 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900";

                    return (
                      <div key={issue._id} className="relative">
                        <OfficerIssueCard
                          issue={issue}
                          onView={() => onViewIssue(issue)}
                          onReassign={() => onReassignIssue(issue)}
                        />
                        <span
                          className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full border shadow-sm ${slaBadgeColor}`}
                        >
                          SLA: {slaStatus}
                        </span>
                      </div>
                    );
                  })}
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
  const [officerSort, setOfficerSort] = useState("efficiency");
  const [officerCityFilter, setOfficerCityFilter] = useState("all");
  const [officerDeptFilter, setOfficerDeptFilter] = useState("all");
  const [officerRiskFilter, setOfficerRiskFilter] = useState("all");
  const [officersSubTab, setOfficersSubTab] = useState("overview");

  const [selectedOfficerWorkload, setSelectedOfficerWorkload] = useState(null);
  const [isOfficerDialogOpen, setIsOfficerDialogOpen] = useState(false);

  const { data: session } = useSession();
  const dbUser = useQuery(api.users.getUserByEmail, {
    email: session?.user?.email || "ankit@example.com",
  });
  const sendMessageToUserMutation = useMutation(
    api.directMessages.sendMessageToUser,
  );

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

  async function handleSendMessage(officerId, message, issueIds) {
    if (!dbUser) {
      alert("Error: Admin profile not loaded. Please try again in a moment.");
      return;
    }
    try {
      await sendMessageToUserMutation({
        fromId: dbUser._id,
        fromName: dbUser.fullName,
        fromRole: dbUser.role,
        toId: officerId,
        message,
        issueIds: issueIds,
      });
      alert(
        `Message sent successfully!\n\nThe officer will be notified and can reply from their Messages Center.`,
      );
      setMessageOfficer(null);
      setMessageIssues([]);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message: " + err.message);
    }
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
  const officerWorkload = commandCenterData?.officerWorkload ?? [];
  const performanceSummary = commandCenterData?.performanceSummary ?? {};
  const cityPerformance = commandCenterData?.cityPerformance ?? [];
  const departmentPerformance = commandCenterData?.departmentPerformance ?? [];
  const officerLeaderboards = commandCenterData?.officerLeaderboards ?? {};
  const riskAnalysis = commandCenterData?.riskAnalysis ?? {};
  const workloadDistribution = commandCenterData?.workloadDistribution ?? {};
  const qualityMetrics = commandCenterData?.qualityMetrics ?? {};
  const filters = commandCenterData?.filters ?? {
    cities: [],
    departments: [],
    roles: ["all", "unit_officer", "field_officer"],
    riskLevels: ["all", "Good", "Needs Attention", "High Risk"],
    workloadStatuses: ["all", "balanced", "overloaded", "underutilized"],
  };

  const availableCities = filters.cities ?? [];
  const availableDepts = filters.departments ?? [];

  const commandStats = commandCenterData?.stats ?? {};
  const stats = {
    total: performanceSummary.totalIssues ?? commandStats.totalIssues ?? 0,

    pending:
      performanceSummary.pendingIssues ?? commandStats.pendingIssues ?? 0,

    in_progress:
      performanceSummary.activeIssues ?? commandStats.activeIssues ?? 0,

    resolved:
      performanceSummary.resolvedIssues ?? commandStats.resolvedIssues ?? 0,

    totalOfficers:
      performanceSummary.totalOfficers ?? commandStats.totalOfficers ?? 0,

    totalUnitOfficers:
      performanceSummary.totalUnitOfficers ??
      commandStats.totalUnitOfficers ??
      0,

    totalFieldOfficers:
      performanceSummary.totalFieldOfficers ??
      commandStats.totalFieldOfficers ??
      0,

    assignedIssues:
      performanceSummary.assignedIssues ?? commandStats.assignedIssues ?? 0,

    overdueIssues:
      performanceSummary.overdueIssues ?? commandStats.overdueIssues ?? 0,

    escalated:
      performanceSummary.escalatedIssues ??
      commandStats.escalated ??
      commandStats.escalatedIssues ??
      0,

    overloadedCount:
      performanceSummary.overloadedCount ??
      commandStats.overloadedCount ??
      riskAnalysis?.overloadedCount ??
      0,

    underutilizedCount:
      performanceSummary.underutilizedCount ??
      commandStats.underutilizedCount ??
      riskAnalysis?.underutilizedCount ??
      0,

    balancedCount:
      commandStats.balancedCount ?? workloadDistribution?.balanced ?? 0,

    avgCompletion:
      performanceSummary.avgCompletionRate ?? commandStats.avgCompletion ?? 0,

    avgEfficiencyScore: performanceSummary.avgEfficiencyScore ?? 0,

    avgSlaComplianceRate: performanceSummary.avgSlaComplianceRate ?? 0,

    avgResolutionTime: performanceSummary.avgResolutionTime ?? 0,
  };

  const filteredOfficers = officerWorkload
    .filter((ow) => {
      // 1. Search term (name or email)
      if (
        officerSearchTerm &&
        !ow.officer.fullName
          .toLowerCase()
          .includes(officerSearchTerm.toLowerCase()) &&
        !ow.officer.email
          .toLowerCase()
          .includes(officerSearchTerm.toLowerCase())
      ) {
        return false;
      }
      // 2. Role filter
      if (officerFilter !== "all" && ow.officer.role !== officerFilter) {
        return false;
      }
      // 3. City filter
      if (
        officerCityFilter !== "all" &&
        ow.officer.city !== officerCityFilter
      ) {
        return false;
      }
      // 4. Department filter
      if (
        officerDeptFilter !== "all" &&
        ow.officer.department !== officerDeptFilter
      ) {
        return false;
      }
      // 5. Risk Level filter
      if (officerRiskFilter !== "all" && ow.riskLevel !== officerRiskFilter) {
        return false;
      }
      // 6. Workload status filter
      if (workloadFilter !== "all" && ow.workloadStatus !== workloadFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (officerSort) {
        case "efficiency":
          return b.efficiencyScore - a.efficiencyScore;
        case "sla":
          return b.slaComplianceRate - a.slaComplianceRate;
        case "rating":
          return b.citizenRating - a.citizenRating;
        case "resolution_time":
          return a.avgResolutionTime - b.avgResolutionTime;
        case "workload":
          return b.workloadPercentage - a.workloadPercentage;
        case "completion":
          return b.completionRate - a.completionRate;
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

  const avgCompletion = performanceSummary.avgCompletionRate ?? 0;
  const balancedCount = workloadDistribution.balanced ?? 0;

  const liveSelectedOfficerWorkload = selectedOfficerWorkload
    ? (officerWorkload.find(
        (ow) =>
          ow.officer.id === selectedOfficerWorkload.officer.id ||
          ow.officer.userId === selectedOfficerWorkload.officer.userId,
      ) ?? null)
    : null;

  const tabBtn = (tab, icon, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-8 py-3.5 font-bold text-sm whitespace-nowrap transition-all duration-500 flex items-center gap-3 rounded-full relative group/btn ${
        activeTab === tab
          ? "text-white bg-gradient-to-r from-emerald-500 to-teal-400 border border-emerald-400/50 scale-105"
          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent"
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
                  onClick={() =>
                    signOut({ redirect: true, callbackUrl: "/staff/sign-in" })
                  }
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
          <div className="relative bg-white/30 dark:bg-[#0f172a]/50 rounded-[2.5rem] border-y border-white/80 dark:border-white/20 p-2 overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent dark:from-white/5 pointer-events-none rounded-[2.5rem]"></div>
            <div className="flex items-center gap-2 hide-scrollbar relative z-10 px-1">
              {tabBtn("officers", <Users size={20} />, "Officers")}
              {tabBtn("messages", <MessageSquare size={20} />, "Messages")}
              {tabBtn("sla", <Clock size={20} />, "SLA")}
              {tabBtn("badges", <Trophy size={20} />, "Badges")}
              {tabBtn(
                "analytics",
                <BarChart3 size={20} />,
                "Trend Intelligence",
              )}
              {tabBtn("audit", <Shield size={20} />, "Audit")}
            </div>
          </div>
        </div>

        <div className="space-y-8">
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
                          value: performanceSummary.totalUnitOfficers ?? 0,
                        },
                        {
                          label: "Field Officers",
                          value: performanceSummary.totalFieldOfficers ?? 0,
                        },
                        {
                          label: "Overdue Issues",
                          value: performanceSummary.overdueIssues ?? 0,
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

              {/* Sub-navigation inside Officers tab */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                {[
                  {
                    id: "overview",
                    label: "Overview",
                    icon: <Layers size={14} />,
                  },
                  {
                    id: "leaderboards",
                    label: "Leaderboards",
                    icon: <Trophy size={14} />,
                  },
                  {
                    id: "risk_monitor",
                    label: "Risk Monitor",
                    icon: <AlertTriangle size={14} />,
                  },
                  {
                    id: "city_dept",
                    label: "City & Dept Analysis",
                    icon: <Activity size={14} />,
                  },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setOfficersSubTab(sub.id)}
                    className={`px-5 py-2.5 text-xs font-black rounded-xl transition-all duration-300 flex items-center gap-2 ${
                      officersSubTab === sub.id
                        ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {sub.icon}
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Sub-tab Content: Overview */}
              {officersSubTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Summary metric tiles */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      {
                        label: "Total Officers",
                        value: performanceSummary.totalOfficers ?? 0,
                        sub: `${performanceSummary.totalUnitOfficers ?? 0} UO / ${performanceSummary.totalFieldOfficers ?? 0} FO`,
                        color:
                          "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
                      },
                      {
                        label: "Avg Efficiency",
                        value: `${displayPercent(performanceSummary.avgEfficiencyScore)}%`,
                        sub: "Average officer efficiency",
                        color:
                          "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200",
                      },
                      {
                        label: "Avg SLA Compliance",
                        value: `${displayPercent(performanceSummary.avgSlaComplianceRate)}%`,
                        sub: `${riskAnalysis.slaBreachCount ?? 0} total breaches`,
                        color:
                          "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200",
                      },
                      {
                        label: "Avg Resolution Time",
                        value: `${performanceSummary.avgResolutionTime ?? 0}h`,
                        sub: "Lifecycle average",
                        color:
                          "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200",
                      },
                      {
                        label: "High Risk Officers",
                        value: riskAnalysis.highRiskCount ?? 0,
                        sub: "Needs urgent review",
                        color:
                          (riskAnalysis.highRiskCount ?? 0) > 0
                            ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 animate-pulse font-black"
                            : "bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200",
                      },
                      {
                        label: "Overloaded Officers",
                        value: riskAnalysis.overloadedCount ?? 0,
                        sub: "Workload >= 85%",
                        color:
                          "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
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
                      {/* Search */}
                      <div className="relative flex-1 min-w-[260px]">
                        <Search
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                          size={18}
                        />
                        <input
                          type="text"
                          value={officerSearchTerm}
                          onChange={(e) => setOfficerSearchTerm(e.target.value)}
                          placeholder="Search officers by name or email..."
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-405 dark:placeholder:text-slate-500 font-bold text-xs"
                        />
                      </div>

                      {/* Dropdown Filters */}
                      {[
                        {
                          value: officerFilter,
                          onChange: setOfficerFilter,
                          options: [
                            ["all", "All Roles"],
                            ["unit_officer", "Ward Officers"],
                            ["field_officer", "Field Officers"],
                          ],
                          color:
                            "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10",
                        },
                        {
                          value: workloadFilter,
                          onChange: setWorkloadFilter,
                          options: [
                            ["all", "All Workloads"],
                            ["balanced", "Balanced"],
                            ["overloaded", "Overloaded"],
                            ["underutilized", "Underutilized"],
                          ],
                          color:
                            "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10",
                        },
                        {
                          value: officerCityFilter,
                          onChange: setOfficerCityFilter,
                          options: [
                            ["all", "All Cities"],
                            ...availableCities.map((c) => [
                              c,
                              c.charAt(0).toUpperCase() + c.slice(1),
                            ]),
                          ],
                          color:
                            "border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-900/10",
                        },
                        {
                          value: officerDeptFilter,
                          onChange: setOfficerDeptFilter,
                          options: [
                            ["all", "All Depts"],
                            ...availableDepts.map((d) => [
                              d,
                              d.charAt(0).toUpperCase() + d.slice(1),
                            ]),
                          ],
                          color:
                            "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10",
                        },
                        {
                          value: officerRiskFilter,
                          onChange: setOfficerRiskFilter,
                          options: [
                            ["all", "All Risks"],
                            ["Good", "Good"],
                            ["Needs Attention", "Needs Attention"],
                            ["High Risk", "High Risk"],
                          ],
                          color:
                            "border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10",
                        },
                        {
                          value: officerSort,
                          onChange: setOfficerSort,
                          options: [
                            ["efficiency", "Efficiency Score"],
                            ["sla", "SLA Compliance"],
                            ["rating", "Citizen Rating"],
                            ["resolution_time", "Resolution Time"],
                            ["workload", "Workload Pct"],
                            ["completion", "Completion Rate"],
                            ["highest_workload", "Total Assigned"],
                            ["name_az", "Name A–Z"],
                          ],
                          color:
                            "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40",
                        },
                      ].map((sel, i) => (
                        <div key={i} className="relative">
                          <select
                            value={sel.value ?? "all"}
                            onChange={(e) => sel.onChange(e.target.value)}
                            className={`appearance-none pl-4 pr-9 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white font-black text-xs cursor-pointer ${sel.color}`}
                          >
                            {sel.options.map(([val, label]) => (
                              <option key={val} value={val}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                          />
                        </div>
                      ))}

                      <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold ml-auto">
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
                          className="text-slate-350 dark:text-slate-600"
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
                          key={ow.officer.id || ow.officer.userId}
                          ow={ow}
                          onOpen={() => {
                            setSelectedOfficerWorkload(ow);
                            setIsOfficerDialogOpen(true);
                          }}
                          onMessage={() =>
                            openMessageModal(ow.officer, ow.issues)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab Content: Leaderboards */}
              {officersSubTab === "leaderboards" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                  <LeaderboardList
                    title="Top Overall Performers"
                    list={officerLeaderboards.topOverall}
                    metricKey="efficiencyScore"
                    suffix="%"
                  />
                  <LeaderboardList
                    title="Top Ward Officers"
                    list={officerLeaderboards.topUnitOfficers}
                    metricKey="efficiencyScore"
                    suffix="%"
                  />
                  <LeaderboardList
                    title="Top Field Officers"
                    list={officerLeaderboards.topFieldOfficers}
                    metricKey="efficiencyScore"
                    suffix="%"
                  />
                  <LeaderboardList
                    title="Best SLA Compliance"
                    list={officerLeaderboards.bestSla}
                    metricKey="slaComplianceRate"
                    suffix="%"
                  />
                  <LeaderboardList
                    title="Highest Rated (Citizen Satisfaction)"
                    list={officerLeaderboards.bestRated}
                    metricKey="citizenRating"
                  />
                  <LeaderboardList
                    title="Fastest Avg Resolution Time"
                    list={officerLeaderboards.fastestResolution}
                    metricKey="avgResolutionTime"
                    suffix="h"
                  />
                </div>
              )}

              {/* Sub-tab Content: Risk Monitor */}
              {officersSubTab === "risk_monitor" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Risk Overview KPI Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {[
                      {
                        label: "High Risk Count",
                        value: riskAnalysis.highRiskCount ?? 0,
                        col: "text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900",
                      },
                      {
                        label: "Needs Attention",
                        value: riskAnalysis.needsAttentionCount ?? 0,
                        col: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
                      },
                      {
                        label: "Overloaded",
                        value: riskAnalysis.overloadedCount ?? 0,
                        col: "text-red-655 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
                      },
                      {
                        label: "SLA Breaches",
                        value: riskAnalysis.slaBreachCount ?? 0,
                        col: "text-rose-705 bg-rose-50/50 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/50",
                      },
                      {
                        label: "Overdue Issues",
                        value: riskAnalysis.overdueCount ?? 0,
                        col: "text-rose-600 bg-rose-50/50 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/50",
                      },
                      {
                        label: "Escalations",
                        value: riskAnalysis.escalationCount ?? 0,
                        col: "text-rose-505 bg-rose-50/50 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/50",
                      },
                      {
                        label: "Rework Required",
                        value: riskAnalysis.reworkCount ?? 0,
                        col: "text-amber-550 bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/50",
                      },
                      {
                        label: "Reopened Issues",
                        value: riskAnalysis.reopenCount ?? 0,
                        col: "text-rose-505 bg-rose-50/50 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/50",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border text-center ${item.col} shadow-sm`}
                      >
                        <div className="text-2xl font-black">{item.value}</div>
                        <div className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: High Risk & Needs Attention Officers */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-lg">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="text-rose-500" size={16} />
                        High Risk Officers List
                      </h3>
                      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        {officerWorkload.filter(
                          (ow) =>
                            ow.riskLevel === "High Risk" ||
                            ow.riskLevel === "Needs Attention",
                        ).length === 0 ? (
                          <div className="text-xs text-slate-450 text-center py-10 font-bold">
                            No officers fall under risk categories currently.
                          </div>
                        ) : (
                          officerWorkload
                            .filter(
                              (ow) =>
                                ow.riskLevel === "High Risk" ||
                                ow.riskLevel === "Needs Attention",
                            )
                            .sort(
                              (a, b) => a.efficiencyScore - b.efficiencyScore,
                            )
                            .map((ow) => {
                              const badgeCol =
                                ow.riskLevel === "High Risk"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300";
                              return (
                                <div
                                  key={ow.officer.id}
                                  onClick={() => {
                                    setSelectedOfficerWorkload(ow);
                                    setIsOfficerDialogOpen(true);
                                  }}
                                  className="flex items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative">
                                      {ow.officer.profilePictureUrl ? (
                                        <img
                                          src={ow.officer.profilePictureUrl}
                                          alt=""
                                          className="w-9 h-9 rounded-xl object-cover"
                                        />
                                      ) : (
                                        <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-xs">
                                          {ow.officer.fullName
                                            .slice(0, 2)
                                            .toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                                        {ow.officer.fullName}
                                      </div>
                                      <div className="text-[10px] text-slate-455 dark:text-slate-400 font-semibold truncate capitalize">
                                        {ow.officer.role.replace(/_/g, " ")} •{" "}
                                        {ow.officer.department}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${badgeCol}`}
                                    >
                                      {ow.riskLevel}
                                    </span>
                                    <div className="text-right whitespace-nowrap">
                                      <div className="text-xs font-black text-slate-900 dark:text-white">
                                        Eff: {ow.efficiencyScore}%
                                      </div>
                                      <div className="text-[9px] text-slate-400 font-bold">
                                        SLA: {ow.slaComplianceRate}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>

                    {/* Right Column: Risk breakdown maps by City and Department */}
                    <div className="space-y-6">
                      {/* Risk by City */}
                      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-lg">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Risk Distribution by City
                        </h3>
                        <div className="space-y-2.5 max-h-[25vh] overflow-y-auto pr-1">
                          {riskAnalysis.riskByCity?.map((row) => (
                            <div
                              key={row.city}
                              className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800"
                            >
                              <span className="font-extrabold text-slate-900 dark:text-white capitalize">
                                {row.city}
                              </span>
                              <div className="flex gap-2">
                                <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 px-2 py-0.5 rounded font-black text-[10px]">
                                  High Risk: {row.highRiskCount}
                                </span>
                                <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 px-2 py-0.5 rounded font-black text-[10px]">
                                  Needs Attention: {row.needsAttentionCount}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risk by Department */}
                      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-lg">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Risk Distribution by Department
                        </h3>
                        <div className="space-y-2.5 max-h-[25vh] overflow-y-auto pr-1">
                          {riskAnalysis.riskByDepartment?.map((row) => (
                            <div
                              key={row.department}
                              className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800"
                            >
                              <span className="font-extrabold text-slate-900 dark:text-white capitalize">
                                {row.department}
                              </span>
                              <div className="flex gap-2">
                                <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 px-2 py-0.5 rounded font-black text-[10px]">
                                  High Risk: {row.highRiskCount}
                                </span>
                                <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 px-2 py-0.5 rounded font-black text-[10px]">
                                  Needs Attention: {row.needsAttentionCount}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab Content: City & Dept Analysis */}
              {officersSubTab === "city_dept" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <MapPin size={18} className="text-emerald-500" />
                      City Performance Analysis
                    </h3>
                    <PerformanceTable data={cityPerformance} typeLabel="city" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 pt-4">
                      <Activity size={18} className="text-emerald-500" />
                      Department Performance Analysis
                    </h3>
                    <PerformanceTable
                      data={departmentPerformance}
                      typeLabel="department"
                    />
                  </div>
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
          {activeTab === "sla" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock size={24} />
                  SLA Monitoring
                </h2>
              </div>
              <div className="p-6">
                <SLAMonitoringDashboard
                  issues={issues}
                  onViewIssue={setSelectedIssue}
                />
              </div>
            </div>
          )}

          {/* Badge Management */}
          {activeTab === "badges" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <BadgeManagementSection />
            </div>
          )}

          {/* Analytics tab */}
          {activeTab === "analytics" && (
            <SLAAnalyticsDashboard
              userId={dbUser?._id}
              issues={issues}
              onViewIssue={setSelectedIssue}
            />
          )}

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
