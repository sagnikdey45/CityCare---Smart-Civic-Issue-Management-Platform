import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  AlertTriangle,
  Clock,
  Loader2,
  Shield,
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

const ESCALATION_CATEGORIES = [
  "all",
  "sla_breach",
  "resource_shortage",
  "technical_complexity",
  "public_safety_risk",
  "legal_or_regulatory",
  "citizen_escalation",
  "repeat_failure",
  "cross_department_dependency",
  "budget_approval_required",
  "emergency_response",
  "officer_non_responsiveness",
  "technical_dependency",
  "third_party_dependency",
  "environmental_risk",
  "administrative_approval_pending",
  "other",
];

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

function getEscalationCategoryLabel(category) {
  const labels = {
    sla_breach: "SLA Breach",
    resource_shortage: "Resource Shortage",
    technical_complexity: "Technical Complexity",
    public_safety_risk: "Public Safety Risk",
    legal_or_regulatory: "Legal / Regulatory",
    citizen_escalation: "Citizen Escalation",
    repeat_failure: "Repeat Failure",
    cross_department_dependency: "Cross-Department Dependency",
    budget_approval_required: "Budget Approval Required",
    emergency_response: "Emergency Response",
    officer_non_responsiveness: "Officer Non-Responsiveness",
    technical_dependency: "Technical Dependency",
    third_party_dependency: "Third-Party Dependency",
    environmental_risk: "Environmental Risk",
    administrative_approval_pending: "Administrative Approval Pending",
    other: "Other",
  };

  if (!category) {
    return "Unknown";
  }

  return (
    labels[category] ??
    String(category)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function formatDepartmentLabel(value) {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getIssueDelayHours(issue) {
  if (!issue.sla_deadline) return 0;
  const sla = calculateSLAStatus(issue.sla_deadline);
  return sla.status === "breached" ? sla.hoursRemaining : 0;
}

function hasEscalationHistory(issue) {
  return (
    issue?.escalation?.hasHistory === true ||
    Boolean(issue?.escalation_resolution_actions?.length) ||
    Boolean(issue?.escalated_at)
  );
}

function hasActiveEscalation(issue) {
  return (
    issue?.escalation?.isActive === true ||
    (issue?.is_escalated === true && issue?.escalation_resolved !== true)
  );
}

function isResolvedEscalation(issue) {
  return (
    issue?.escalation?.resolved === true || issue?.escalation_resolved === true
  );
}

function getEscalationReviewStatus(issue) {
  return String(
    issue?.escalation?.adminReviewStatus ??
      issue?.escalation?.status ??
      issue?.escalation_admin_review_status ??
      "",
  )
    .trim()
    .toLowerCase();
}

function isEscalationPendingReview(issue) {
  return (
    hasActiveEscalation(issue) && getEscalationReviewStatus(issue) === "pending"
  );
}

function isEscalationReviewed(issue) {
  return (
    hasActiveEscalation(issue) &&
    getEscalationReviewStatus(issue) === "reviewed"
  );
}

function getAdminReviewStatus(issue) {
  if (!hasEscalationHistory(issue)) {
    return "N/A";
  }

  const status = getEscalationReviewStatus(issue);

  switch (status) {
    case "pending":
      return "Pending Review";
    case "reviewed":
      return "Reviewed";
    case "resolved":
      return "Resolved";
    case "rejected":
      return "Rejected";
    case "dismissed":
      return "Dismissed";
    default:
      return "N/A";
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
  const currentActions =
    issue.escalation_resolution_actions?.filter(
      (a) =>
        (a.performed_at ?? a.performedAt ?? 0) >= (issue.escalated_at || 0),
    ) || [];

  const reviewAction = currentActions.find(
    (a) =>
      a.type === "review_escalation" || a.actionType === "review_escalation",
  );

  const resolutionActions = currentActions.filter(
    (a) =>
      a.type !== "escalate" &&
      a.type !== "review_escalation" &&
      a.actionType !== "escalate" &&
      a.actionType !== "review_escalation",
  );
  const hasResolutionAction = resolutionActions.length > 0;
  const resolutionActionTime =
    resolutionActions[0]?.performed_at ??
    resolutionActions[0]?.performedAt ??
    null;

  const reviewTime =
    reviewAction?.performed_at ?? reviewAction?.performedAt ?? null;

  const reviewStatus = getEscalationReviewStatus(issue);

  const steps = [
    {
      label: "Escalated",
      done: !!issue.escalated_at,
      time: issue.escalated_at,
    },
    {
      label: "Admin Reviewed",
      done:
        Boolean(reviewAction) ||
        reviewStatus === "reviewed" ||
        reviewStatus === "resolved",
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

function IssueCard({
  issue,
  onAction,
  onViewIssue,
  onOpenEscalation,
  onStartHandling,
  reviewingIssueId,
}) {
  const [expanded, setExpanded] = useState(false);
  const sla = calculateSLAStatus(issue.sla_deadline);
  const isEscalated = !!issue.is_escalated;
  const hasBeenEscalated = !!issue.escalated_at;

  const currentActions =
    issue.escalation_resolution_actions?.filter(
      (a) => a.performed_at >= (issue.escalated_at || 0),
    ) || [];
  const resolutionActions = currentActions.filter(
    (a) => a.type !== "escalate" && a.type !== "review_escalation",
  );
  const hasResolutionAction = resolutionActions.length > 0;
  const isBreached = sla.status === "breached";
  const isAtRisk = sla.status === "at_risk";

  const escalationResolved = !!issue.escalation_resolved;
  const resolvedEscalationBreachedAgain = escalationResolved && isBreached;
  const resolvedEscalationAtRiskAgain = escalationResolved && isAtRisk;
  const needsFreshSlaActionAfterResolvedEscalation =
    escalationResolved && (isBreached || isAtRisk);
  const canTakeSlaAction =
    isBreached || isAtRisk || needsFreshSlaActionAfterResolvedEscalation;

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
            {issue.escalation_reason && (
              <div className="mt-2.5 pt-2 border-t border-purple-200/50 dark:border-purple-800/40 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-bold block mb-0.5">
                  Reason:
                </span>
                <span className="text-slate-800 dark:text-slate-200">
                  {issue.escalation_reason}
                </span>
              </div>
            )}
            {issue.escalation_comments && (
              <div
                className={`mt-2 text-[11px] ${!issue.escalation_reason ? "border-t border-purple-200/50 dark:border-purple-800/40 pt-2" : ""}`}
              >
                <span className="text-slate-500 dark:text-slate-400 font-bold block mb-0.5">
                  Comments:
                </span>
                <span className="text-slate-800 dark:text-slate-200">
                  {issue.escalation_comments}
                </span>
              </div>
            )}
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
            <ActionBtn
              onClick={() => onViewIssue(issue)}
              variant="default"
              icon={<Eye size={12} />}
            >
              View
            </ActionBtn>
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
                onClick={() => onAction(issue, "reassign_unit_officer")}
                variant="cyan"
                icon={<Shield size={12} />}
              >
                Reassign UO
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "reassign_field_officer")}
                variant="emerald"
                icon={<Zap size={12} />}
              >
                Reassign FO
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
                onClick={() => onAction(issue, "reassign_unit_officer")}
                variant="cyan"
                icon={<Shield size={12} />}
              >
                Reassign UO
              </ActionBtn>
              <ActionBtn
                onClick={() => onAction(issue, "reassign_field_officer")}
                variant="emerald"
                icon={<Zap size={12} />}
              >
                Reassign FO
              </ActionBtn>
            </>
          )}
          {hasBeenEscalated && !escalationResolved && (
            <>
              {isEscalationPendingReview(issue) ? (
                <button
                  type="button"
                  disabled={
                    reviewingIssueId ===
                    (issue._id || issue.id || issue.issueId)
                  }
                  onClick={() => onStartHandling(issue)}
                  className="px-3.5 py-2 rounded-2xl font-black text-xs bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewingIssueId ===
                  (issue._id || issue.id || issue.issueId) ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Starting Handling...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={13} />
                      <span>Start Handling Escalation</span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <ActionBtn
                    onClick={() => onOpenEscalation(issue)}
                    variant="purple"
                    icon={<Eye size={12} />}
                  >
                    Manage Escalation
                  </ActionBtn>

                  <ActionBtn
                    onClick={() => onAction(issue, "approve")}
                    variant="emerald"
                    icon={<CheckCircle size={12} />}
                  >
                    Resolve
                  </ActionBtn>

                  {canTakeSlaAction && (
                    <>
                      <ActionBtn
                        onClick={() => onAction(issue, "reassign_unit_officer")}
                        variant="cyan"
                        icon={<Shield size={12} />}
                      >
                        Reassign UO
                      </ActionBtn>
                      <ActionBtn
                        onClick={() =>
                          onAction(issue, "reassign_field_officer")
                        }
                        variant="emerald"
                        icon={<Zap size={12} />}
                      >
                        Reassign FO
                      </ActionBtn>
                    </>
                  )}

                  {canTakeSlaAction && (
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
            </>
          )}
          {hasBeenEscalated &&
            escalationResolved &&
            !needsFreshSlaActionAfterResolvedEscalation && (
              <>
                <ActionBtn
                  onClick={() => onAction(issue, "view_resolution")}
                  variant="teal"
                  icon={<Flag size={12} />}
                >
                  View Resolution
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
          {hasBeenEscalated &&
            escalationResolved &&
            needsFreshSlaActionAfterResolvedEscalation && (
              <>
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
                  onClick={() => onOpenEscalation(issue)}
                  variant="purple"
                  icon={<Eye size={12} />}
                >
                  Review Again
                </ActionBtn>

                <ActionBtn
                  onClick={() => onAction(issue, "escalate")}
                  variant="purple"
                  icon={<ArrowUpCircle size={12} />}
                >
                  Re-escalate
                </ActionBtn>

                <ActionBtn
                  onClick={() => onAction(issue, "view_resolution")}
                  variant="teal"
                  icon={<Flag size={12} />}
                >
                  Previous Resolution
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

function KpiCard({
  icon,
  label,
  value,
  sublabel,
  gradient,
  border,
  onClick,
  active,
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 ${active ? "border-purple-500 ring-2 ring-purple-500/20" : border} ${onClick ? "cursor-pointer hover:-translate-y-1" : ""} p-5`}
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

export default function SLAMonitoringDashboard({ onViewIssue, adminUserId }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [slaFilter, setSlaFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [escalationStatusFilter, setEscalationStatusFilter] = useState("all");
  const [escalationPriorityFilter, setEscalationPriorityFilter] =
    useState("all");
  const [escalationCategoryFilter, setEscalationCategoryFilter] =
    useState("all");
  const [resolutionModalState, setResolutionModalState] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const queryIssues = useQuery(api.escalation.getSlaMonitoringIssues);

  const departmentOptions = useMemo(() => {
    const values = new Set();
    const source = Array.isArray(issues) ? issues : [];

    for (const issue of source) {
      const department = issue?.department ?? issue?.category ?? null;
      if (typeof department === "string" && department.trim()) {
        values.add(department.trim());
      }
    }

    return ["all", ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [issues]);

  useEffect(() => {
    if (queryIssues !== undefined) {
      setIssues(queryIssues);
      setLoading(false);
    }
  }, [queryIssues]);

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
    const escalated = issues.filter((i) => hasActiveEscalation(i)).length;
    const criticalEsc = issues.filter(
      (i) =>
        hasActiveEscalation(i) &&
        (i.escalation?.priority === "critical" ||
          i.escalation_priority === "critical"),
    ).length;
    const pendingReview = issues.filter(
      (i) =>
        hasActiveEscalation(i) &&
        (getEscalationReviewStatus(i) === "pending" ||
          !getEscalationReviewStatus(i)),
    ).length;
    const resolvedEsc = issues.filter(
      (i) => hasEscalationHistory(i) && isResolvedEscalation(i),
    ).length;
    const repeated = issues.filter(
      (i) => (i.escalation?.escalationCount ?? i.escalation_count ?? 0) > 1,
    ).length;
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

  const filteredIssues = useMemo(() => {
    let filtered = Array.isArray(issues) ? [...issues] : [];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          (i.title || "").toLowerCase().includes(q) ||
          (i.ticket_id || i.code || "").toLowerCase().includes(q) ||
          (i.category || "").toLowerCase().includes(q) ||
          (i.location || i.address || "").toLowerCase().includes(q),
      );
    }

    if (slaFilter !== "all") {
      filtered = filtered.filter(
        (i) => calculateSLAStatus(i.sla_deadline).status === slaFilter,
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((i) => {
        const dept = String(i.department ?? i.category ?? "")
          .trim()
          .toLowerCase();
        return dept === String(categoryFilter).trim().toLowerCase();
      });
    }

    if (
      escalationStatusFilter === "active" ||
      escalationStatusFilter === "escalated"
    ) {
      filtered = filtered.filter((issue) => hasActiveEscalation(issue));
    } else if (
      escalationStatusFilter === "normal" ||
      escalationStatusFilter === "not_escalated"
    ) {
      filtered = filtered.filter((issue) => !hasActiveEscalation(issue));
    } else if (
      escalationStatusFilter === "pending" ||
      escalationStatusFilter === "pending_review"
    ) {
      filtered = filtered.filter(
        (issue) =>
          hasActiveEscalation(issue) &&
          (getEscalationReviewStatus(issue) === "pending" ||
            !getEscalationReviewStatus(issue)),
      );
    } else if (escalationStatusFilter === "reviewed") {
      filtered = filtered.filter(
        (issue) =>
          hasActiveEscalation(issue) &&
          getEscalationReviewStatus(issue) === "reviewed",
      );
    } else if (
      escalationStatusFilter === "resolved" ||
      escalationStatusFilter === "escalation_resolved"
    ) {
      filtered = filtered.filter(
        (issue) => hasEscalationHistory(issue) && isResolvedEscalation(issue),
      );
    }

    if (escalationPriorityFilter !== "all") {
      filtered = filtered.filter(
        (i) =>
          i.escalation?.priority === escalationPriorityFilter ||
          i.escalation_priority === escalationPriorityFilter,
      );
    }

    if (escalationCategoryFilter !== "all") {
      filtered = filtered.filter(
        (i) =>
          i.escalation?.category === escalationCategoryFilter ||
          i.escalation_category === escalationCategoryFilter,
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
          const prioA = a.escalation?.priority || a.escalation_priority;
          const prioB = b.escalation?.priority || b.escalation_priority;
          return (p[prioA] ?? 3) - (p[prioB] ?? 3);
        }
        case "escalation_count":
          return (
            (b.escalation?.escalationCount ?? b.escalation_count ?? 0) -
            (a.escalation?.escalationCount ?? a.escalation_count ?? 0)
          );
        case "newest":
          return (
            new Date(b.created_at || b.createdAt).getTime() -
            new Date(a.created_at || a.createdAt).getTime()
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
    escalationStatusFilter,
    escalationPriorityFilter,
    escalationCategoryFilter,
    sortBy,
  ]);

  const reviewEscalationMut = useMutation(api.escalation.reviewEscalation);
  const [reviewingIssueId, setReviewingIssueId] = useState(null);

  const handleStartHandlingEscalation = async (issue) => {
    const issueId = issue?._id ?? issue?.id ?? issue?.issueId;
    if (!issueId || !adminUserId) {
      return;
    }

    try {
      setReviewingIssueId(issueId);
      await reviewEscalationMut({
        issueId,
        adminUserId,
      });
    } catch (error) {
      console.error("Failed to review escalation:", error);
    } finally {
      setReviewingIssueId(null);
    }
  };

  // Action modal opener for all actions
  const openIssueAction = (issue, initialAction = null) => {
    setResolutionModalState({
      issue,
      initialAction,
    });
  };

  return (
    <div className="space-y-7">
      {/* ── Critical Alert Banner ──────────────────────────────────────────── */}
      {(stats.breached > 0 || stats.escalated > 0) && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 dark:from-red-700 dark:via-rose-700 dark:to-orange-700 rounded-3xl shadow-2xl border-2 border-red-300/50 dark:border-red-500/40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.12),transparent_60%)]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-sm" />
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5 justify-between">
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
                      <button
                        type="button"
                        onClick={() => {
                          setSlaFilter("breached");
                          setEscalationStatusFilter("all");
                        }}
                        className={`flex items-center gap-1.5 backdrop-blur-sm rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
                          slaFilter === "breached"
                            ? "bg-white text-red-700 shadow-md font-black"
                            : "bg-white/15 hover:bg-white/25 text-white"
                        }`}
                      >
                        <XCircle
                          size={13}
                          className={
                            slaFilter === "breached"
                              ? "text-red-600"
                              : "text-red-200"
                          }
                        />
                        <span className="text-xs font-black">
                          {stats.breached} SLA Breaches
                        </span>
                      </button>
                    )}
                    {stats.escalated > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setEscalationStatusFilter("active");
                          setSlaFilter("all");
                        }}
                        className={`flex items-center gap-1.5 backdrop-blur-sm rounded-xl px-3 py-1.5 transition-all cursor-pointer ${
                          escalationStatusFilter === "active"
                            ? "bg-white text-purple-800 shadow-md font-black"
                            : "bg-white/15 hover:bg-white/25 text-white"
                        }`}
                      >
                        <ArrowUpCircle
                          size={13}
                          className={
                            escalationStatusFilter === "active"
                              ? "text-purple-700"
                              : "text-purple-200"
                          }
                        />
                        <span className="text-xs font-black">
                          {stats.escalated} Escalations
                        </span>
                      </button>
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

              {/* Action Buttons for quick filtering */}
              <div className="flex items-center gap-3 flex-wrap shrink-0">
                {stats.breached > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlaFilter("breached");
                      setEscalationStatusFilter("all");
                    }}
                    className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                      slaFilter === "breached"
                        ? "bg-white text-red-700 shadow-2xl scale-105 ring-2 ring-white/60"
                        : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 hover:border-white/40"
                    }`}
                  >
                    <XCircle size={16} />
                    <span>View Breached ({stats.breached})</span>
                  </button>
                )}
                {stats.escalated > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setEscalationStatusFilter("active");
                      setSlaFilter("all");
                    }}
                    className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                      escalationStatusFilter === "active"
                        ? "bg-white text-rose-700 shadow-2xl scale-105 ring-2 ring-white/60"
                        : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 hover:border-white/40"
                    }`}
                  >
                    <ArrowUpCircle size={16} />
                    <span>View Escalated ({stats.escalated})</span>
                  </button>
                )}
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
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Activity size={14} className="text-emerald-500" />
                <span>Live Convex Data</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            icon={<Clock size={20} />}
            label="Total Active"
            value={stats.total}
            sublabel="All open issues"
            gradient="from-blue-500 to-cyan-600"
            border="border-blue-200 dark:border-blue-800/60"
            onClick={() => {
              setSearchTerm("");
              setSlaFilter("all");
              setCategoryFilter("all");
              setEscalationStatusFilter("all");
              setEscalationPriorityFilter("all");
              setEscalationCategoryFilter("all");
            }}
            active={
              slaFilter === "all" &&
              escalationStatusFilter === "all" &&
              categoryFilter === "all" &&
              escalationPriorityFilter === "all"
            }
          />
          <KpiCard
            icon={<CheckCircle size={20} />}
            label="SLA On Track"
            value={stats.onTrack}
            sublabel="Within deadline"
            gradient="from-emerald-500 to-teal-600"
            border="border-emerald-200 dark:border-emerald-800/60"
            onClick={() => {
              setSlaFilter("on_track");
              setEscalationStatusFilter("all");
            }}
            active={slaFilter === "on_track"}
          />
          <KpiCard
            icon={<AlertCircle size={20} />}
            label="SLA At Risk"
            value={stats.atRisk}
            sublabel="Approaching deadline"
            gradient="from-amber-500 to-orange-500"
            border="border-amber-200 dark:border-amber-800/60"
            onClick={() => {
              setSlaFilter("at_risk");
              setEscalationStatusFilter("all");
            }}
            active={slaFilter === "at_risk"}
          />
          <KpiCard
            icon={<XCircle size={20} />}
            label="SLA Breached"
            value={stats.breached}
            sublabel="Deadline exceeded"
            gradient="from-red-500 to-rose-600"
            border="border-red-200 dark:border-red-800/60"
            onClick={() => {
              setSlaFilter("breached");
              setEscalationStatusFilter("all");
            }}
            active={slaFilter === "breached"}
          />
          <KpiCard
            icon={<ArrowUpCircle size={20} />}
            label="Escalated Issues"
            value={stats.escalated}
            sublabel="Admin action needed"
            gradient="from-purple-500 to-indigo-600"
            border="border-purple-200 dark:border-purple-800/60"
            onClick={() => {
              setEscalationStatusFilter("active");
              setSlaFilter("all");
            }}
            active={escalationStatusFilter === "active"}
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
            onClick={() => {
              setEscalationPriorityFilter("critical");
              setEscalationStatusFilter("active");
            }}
            active={
              escalationPriorityFilter === "critical" &&
              escalationStatusFilter === "active"
            }
          />
          <KpiCard
            icon={<Eye size={20} />}
            label="Pending Admin Review"
            value={stats.pendingReview}
            sublabel="Awaiting review"
            gradient="from-violet-500 to-purple-600"
            border="border-violet-200 dark:border-violet-800/60"
            onClick={() => setEscalationStatusFilter("pending")}
            active={escalationStatusFilter === "pending"}
          />
          <KpiCard
            icon={<Flag size={20} />}
            label="Resolved Escalations"
            value={stats.resolvedEsc}
            sublabel="Successfully closed"
            gradient="from-teal-500 to-cyan-600"
            border="border-teal-200 dark:border-teal-800/60"
            onClick={() => setEscalationStatusFilter("resolved")}
            active={escalationStatusFilter === "resolved"}
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
            escalationStatusFilter !== "all" ||
            escalationPriorityFilter !== "all" ||
            escalationCategoryFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSlaFilter("all");
                setCategoryFilter("all");
                setEscalationStatusFilter("all");
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
              value={escalationStatusFilter}
              onChange={(e) => setEscalationStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option value="all">All Escalation States</option>
              <option value="normal">Not Escalated</option>
              <option value="active">Active Escalations</option>
              <option value="pending">Pending Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved Escalations</option>
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
              {ESCALATION_CATEGORIES.map((c) => (
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
              {departmentOptions.map((d) => (
                <option key={d} value={d}>
                  {d === "all" ? "All Departments" : formatDepartmentLabel(d)}
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
            ) : escalationStatusFilter === "active" ||
              escalationStatusFilter === "escalated" ? (
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
                onAction={(i, act) => openIssueAction(i, act)}
                onViewIssue={onViewIssue}
                onOpenEscalation={(i) => openIssueAction(i, null)}
                onStartHandling={handleStartHandlingEscalation}
                reviewingIssueId={reviewingIssueId}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {resolutionModalState && (
        <AdminEscalationResolutionModal
          issue={resolutionModalState.issue}
          initialAction={resolutionModalState.initialAction}
          adminUserId={adminUserId}
          onClose={() => setResolutionModalState(null)}
          onResolved={() => {
            // Live Convex queries automatically update reactive state.
          }}
        />
      )}
    </div>
  );
}
