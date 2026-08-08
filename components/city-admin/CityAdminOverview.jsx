import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  FileText,
  Activity,
  CheckCircle2,
  Target,
  AlertTriangle,
  Zap,
  TrendingUp,
  TrendingDown,
  Brain,
  MapPin,
  Clock,
  Calendar,
  Users,
  Shield,
  Eye,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import CityAdminScopeHeader from "./CityAdminScopeHeader";
import CityIssueMap from "@/components/maps/CityIssueMap";

function CityAdminOverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-6">
      {/* Scope Header Skeleton */}
      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl"
          ></div>
        ))}
      </div>
      {/* Map & Categories Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[420px] bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
        <div className="h-[420px] bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
      </div>
    </div>
  );
}

function getTrendSemantic(trendDirection, trendType) {
  if (trendDirection === "neutral") return "neutral";
  if (trendType === "positive_when_up")
    return trendDirection === "up" ? "positive" : "negative";
  if (trendType === "negative_when_up")
    return trendDirection === "up" ? "negative" : "positive";
  return "neutral";
}

function getKpiTrendDisplay(trend) {
  if (!trend || trend.comparisonAvailable === false) {
    return {
      label: "All-time total",
      direction: "neutral",
      semantic: "neutral",
    };
  }

  const semantic = getTrendSemantic(trend.trendDirection, trend.trendType);

  if (trend.changePercent === null) {
    return {
      label: trend.changeValue > 0 ? `+${trend.changeValue} new` : "No change",
      direction: trend.trendDirection,
      semantic,
    };
  }

  const prefix = trend.changePercent > 0 ? "+" : "";
  return {
    label: `${prefix}${trend.changePercent}%`,
    direction: trend.trendDirection,
    semantic,
  };
}

function getTrendBadgeClass(semantic) {
  if (semantic === "positive") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  }
  if (semantic === "negative") {
    return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  }
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
}

export default function CityAdminOverview({
  overviewData,
  onSelectIssue,
  dateRange,
  onSetDateRange,
}) {
  const [mapCategoryFilter, setMapCategoryFilter] = useState("all");

  const {
    scope = {},
    summary = {},
    kpis: liveKpis = {},
    comparison = {},
    recentIssues = [],
    urgentIssues = [],
    recentEscalations = [],
    slaSnapshot = {},
    mapIssues = [],
    categoryDistribution = [],
    officerSnapshot = {},
    recentAdministrativeActivity = [],
  } = overviewData ?? {};

  const city = scope.city || "";
  const state = scope.state || "";

  const handleReviewIssue = useCallback(
    (issue) => {
      onSelectIssue({
        ...issue,
        id: issue.id || issue._id,
        ticket_id: issue.code || issue.ticket_id || issue.issueCode,
      });
    },
    [onSelectIssue],
  );

  const kpis = useMemo(
    () => [
      {
        key: "totalIssues",
        label: "Total Issues",
        value: liveKpis?.totalIssues?.value ?? summary.totalIssues ?? 0,
        trend: liveKpis?.totalIssues,
        icon: FileText,
        color: "blue",
        supportingText:
          dateRange === "all" ? "All city issues" : "Created in selected range",
      },
      {
        key: "activeIssues",
        label: "Active Issues",
        value: liveKpis?.activeIssues?.value ?? summary.activeIssues ?? 0,
        trend: liveKpis?.activeIssues,
        icon: Activity,
        color: "purple",
        supportingText:
          dateRange === "all"
            ? "Currently active city issues"
            : "Created in range and still active",
      },
      {
        key: "resolvedIssues",
        label: "Resolved",
        value: liveKpis?.resolvedIssues?.value ?? summary.resolvedIssues ?? 0,
        trend: liveKpis?.resolvedIssues,
        icon: CheckCircle2,
        color: "emerald",
        supportingText:
          dateRange === "all"
            ? "Currently resolved or closed"
            : "Resolved during selected range",
      },
      {
        key: "closedIssues",
        label: "Closed",
        value: liveKpis?.closedIssues?.value ?? summary.closedIssues ?? 0,
        trend: liveKpis?.closedIssues,
        icon: Target,
        color: "gray",
        supportingText:
          dateRange === "all"
            ? "Currently closed"
            : "Closed during selected range",
      },
      {
        key: "slaBreachedIssues",
        label: "SLA Breached",
        value: liveKpis?.slaBreachedIssues?.value ?? summary.overdueIssues ?? 0,
        trend: liveKpis?.slaBreachedIssues,
        icon: AlertTriangle,
        color: "red",
        supportingText: "Issues requiring SLA attention",
      },
      {
        key: "highPriorityIssues",
        label: "High Priority",
        value:
          liveKpis?.highPriorityIssues?.value ?? summary.escalatedIssues ?? 0,
        trend: liveKpis?.highPriorityIssues,
        icon: Zap,
        color: "orange",
        supportingText: "High and critical issues",
      },
    ],
    [liveKpis, summary, dateRange],
  );

  if (!overviewData) {
    return <CityAdminOverviewSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Scope Header */}
      <CityAdminScopeHeader city={city} state={state} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {kpis.map((kpi, idx) => {
          const trendDisplay = getKpiTrendDisplay(kpi.trend);
          const tooltipTitle =
            comparison?.enabled && comparison?.previousLabel
              ? `Compared with ${comparison.previousLabel}`
              : "All-time metrics do not have a previous-period comparison";

          return (
            <div
              key={idx}
              title={tooltipTitle}
              className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/20 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500 ${
                  kpi.color === "blue"
                    ? "from-cyan-400 to-blue-600"
                    : kpi.color === "purple"
                      ? "from-violet-400 to-blue-600"
                      : kpi.color === "emerald"
                        ? "from-emerald-400 to-teal-600"
                        : kpi.color === "gray"
                          ? "from-slate-400 to-slate-600"
                          : kpi.color === "red"
                            ? "from-red-400 to-rose-600"
                            : "from-orange-400 to-amber-600"
                }`}
              ></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br blur-md opacity-40 ${
                        kpi.color === "blue"
                          ? "from-cyan-400 to-blue-600"
                          : kpi.color === "purple"
                            ? "from-violet-400 to-blue-600"
                            : kpi.color === "emerald"
                              ? "from-emerald-400 to-teal-600"
                              : kpi.color === "gray"
                                ? "from-slate-400 to-slate-600"
                                : kpi.color === "red"
                                  ? "from-red-400 to-rose-600"
                                  : "from-orange-400 to-amber-600"
                      }`}
                    ></div>
                    <div
                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg ${
                        kpi.color === "blue"
                          ? "from-cyan-400 to-blue-600"
                          : kpi.color === "purple"
                            ? "from-violet-400 to-blue-600"
                            : kpi.color === "emerald"
                              ? "from-emerald-400 to-teal-600"
                              : kpi.color === "gray"
                                ? "from-slate-400 to-slate-600"
                                : kpi.color === "red"
                                  ? "from-red-400 to-rose-600"
                                  : "from-orange-400 to-amber-600"
                      }`}
                    >
                      <kpi.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getTrendBadgeClass(trendDisplay.semantic)}`}
                  >
                    {trendDisplay.direction === "up" ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : trendDisplay.direction === "down" ? (
                      <TrendingDown className="w-3.5 h-3.5" />
                    ) : (
                      <Activity className="w-3.5 h-3.5" />
                    )}
                    <span>{trendDisplay.label}</span>
                  </div>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                  {kpi.value}
                </p>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-extrabold mb-1">
                  {kpi.label}
                </p>
                {kpi.trend?.comparisonAvailable &&
                  kpi.trend.previousValue !== null && (
                    <p className="text-[11px] text-slate-400 font-medium mb-1">
                      Previous: {kpi.trend.previousValue}
                    </p>
                  )}
                <p className="text-[10px] text-slate-400 font-medium">
                  {kpi.supportingText}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map & Categories Section */}
      <CityIssueMap
        city={city}
        state={state}
        mapIssues={mapIssues}
        categoryFilter={mapCategoryFilter}
        onCategoryFilterChange={setMapCategoryFilter}
        onViewIssue={handleReviewIssue}
      />

      {/* SLA Snapshot Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6">
          <Clock size={20} className="text-cyan-500" />
          SLA Compliance Overview
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Compliance Rate
            </p>
            <h4 className="text-2xl font-black text-emerald-500 mt-1">
              {summary.slaComplianceRate}%
            </h4>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Overdue Issues
            </p>
            <h4 className="text-2xl font-black text-red-500 mt-1">
              {slaSnapshot.overdueCount || 0}
            </h4>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Due Within 48 Hours
            </p>
            <h4 className="text-2xl font-black text-amber-500 mt-1">
              {slaSnapshot.dueSoonCount || 0}
            </h4>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              On Track
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {slaSnapshot.onTrackCount || 0}
            </h4>
          </div>
        </div>

        {/* Most Overdue / Upcoming deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slaSnapshot.mostOverdueIssue && (
            <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/50 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-black tracking-wide bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-0.5 rounded uppercase">
                  Most Overdue
                </span>
                <h5 className="text-xs font-black text-slate-900 dark:text-white truncate mt-1.5">
                  {slaSnapshot.mostOverdueIssue.title}
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                  Code: {slaSnapshot.mostOverdueIssue.code}
                </p>
              </div>
              <span className="text-xs font-black text-red-500 whitespace-nowrap">
                {slaSnapshot.mostOverdueIssue.overdueHours}h overdue
              </span>
            </div>
          )}
          {slaSnapshot.nearestDeadlineIssue && (
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-black tracking-wide bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2 py-0.5 rounded uppercase">
                  Nearest Deadline
                </span>
                <h5 className="text-xs font-black text-slate-900 dark:text-white truncate mt-1.5">
                  {slaSnapshot.nearestDeadlineIssue.title}
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                  Code: {slaSnapshot.nearestDeadlineIssue.code}
                </p>
              </div>
              <span className="text-xs font-black text-amber-500 whitespace-nowrap">
                {new Date(
                  slaSnapshot.nearestDeadlineIssue.deadline,
                ).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Escalation Snapshot */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6">
          <AlertTriangle size={20} className="text-cyan-500" />
          Escalations Pending Attention
        </h3>

        <div className="space-y-3">
          {recentEscalations.map((issue) => (
            <div
              key={issue.id}
              onClick={() => handleReviewIssue(issue)}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-150 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-cyan-300 dark:hover:border-cyan-600 cursor-pointer transition-all"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-wide bg-red-100 dark:bg-red-950/20 text-red-600 px-2 py-0.5 rounded">
                    {issue.code}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {issue.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold capitalize">
                  {issue.category} •{" "}
                  {issue.escalationCategory.replace(/_/g, " ")} •{" "}
                  {issue.escalationReason}
                </p>
              </div>
              <div className="flex items-center gap-3 self-end md:self-center">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    issue.priority === "critical"
                      ? "bg-red-100 text-red-700 dark:bg-red-950/20"
                      : issue.priority === "high"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-950/20"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/20"
                  }`}
                >
                  {issue.priority}
                </span>
                <ChevronRight size={14} className="text-slate-400" />
              </div>
            </div>
          ))}
          {recentEscalations.length === 0 && (
            <div className="text-center py-6 text-xs font-bold text-slate-400">
              No escalated issues in this city admin scope
            </div>
          )}
        </div>
      </div>

      {/* Staff Snapshot */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6">
          <Users size={20} className="text-cyan-500" />
          Staff Operational Snapshot
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Unit Officers
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {officerSnapshot.totalUnitOfficers}
            </h4>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Field Officers
            </p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {officerSnapshot.totalFieldOfficers}
            </h4>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Overloaded Field Staff
            </p>
            <h4 className="text-2xl font-black text-red-500 mt-1">
              {officerSnapshot.overloadedFieldOfficers}
            </h4>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Officers with Overdue
            </p>
            <h4 className="text-2xl font-black text-amber-500 mt-1">
              {officerSnapshot.officersWithOverdueCount}
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {officerSnapshot.topPerformingOfficer && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black tracking-wide bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded uppercase">
                  Top Performing Officer
                </span>
                <h5 className="text-xs font-black text-slate-900 dark:text-white mt-1.5">
                  {officerSnapshot.topPerformingOfficer.name}
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">
                  {officerSnapshot.topPerformingOfficer.role.replace(/_/g, " ")}
                </p>
              </div>
              <span className="text-xs font-black text-emerald-500">
                {officerSnapshot.topPerformingOfficer.resolvedCount} Resolved
              </span>
            </div>
          )}
          {officerSnapshot.officerRequiringAttention && (
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black tracking-wide bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2 py-0.5 rounded uppercase">
                  Requires Attention
                </span>
                <h5 className="text-xs font-black text-slate-900 dark:text-white mt-1.5">
                  {officerSnapshot.officerRequiringAttention.name}
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                  {officerSnapshot.officerRequiringAttention.reason}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Issues & Needs Urgent Attention lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Issues */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
            Recent Issues
          </h3>
          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => handleReviewIssue(issue)}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-150 dark:border-slate-800 flex items-center justify-between gap-4 hover:border-cyan-300 dark:hover:border-cyan-600 cursor-pointer transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-wide bg-cyan-100 dark:bg-cyan-950/20 text-cyan-650 px-2 py-0.5 rounded">
                      {issue.code}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {issue.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-450 font-bold capitalize mt-1">
                    {issue.category} • Reported{" "}
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950/20 uppercase">
                  {issue.status}
                </span>
              </div>
            ))}
            {recentIssues.length === 0 && (
              <div className="text-center py-10 text-xs font-bold text-slate-400">
                No recent issues recorded in this city
              </div>
            )}
          </div>
        </div>

        {/* Needs Urgent Attention */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
            Needs Urgent Attention
          </h3>
          <div className="space-y-4">
            {urgentIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => handleReviewIssue(issue)}
                className="p-4 rounded-2xl bg-red-50/30 dark:bg-red-950/5 border border-red-150 dark:border-red-900/40 flex items-center justify-between gap-4 hover:border-red-400 cursor-pointer transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-wide bg-red-100 dark:bg-red-950/20 text-red-650 px-2 py-0.5 rounded">
                      {issue.code}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {issue.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-red-505 font-bold mt-1">
                    Attention Reason: {issue.reason}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                    issue.priority === "critical"
                      ? "bg-red-100 text-red-700 dark:bg-red-950/20"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-950/20"
                  }`}
                >
                  {issue.priority}
                </span>
              </div>
            ))}
            {urgentIssues.length === 0 && (
              <div className="text-center py-10 text-xs font-bold text-slate-400">
                All systems functional. No urgent issues detected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Administrative Activity / Updates logs */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
          Recent City Administrative Actions
        </h3>
        <div className="space-y-4">
          {recentAdministrativeActivity.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/20 border border-slate-150 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                  {log.action}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  By {log.performedBy} ({log.performerRole}) • Target:{" "}
                  {log.affectedEntity}
                </p>
              </div>
              <span className="text-[10px] text-slate-450 font-bold self-end md:self-center">
                {log.timestamp}
              </span>
            </div>
          ))}
          {recentAdministrativeActivity.length === 0 && (
            <div className="text-center py-10 text-xs font-bold text-slate-455 font-semibold">
              No recent administrative actions recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
