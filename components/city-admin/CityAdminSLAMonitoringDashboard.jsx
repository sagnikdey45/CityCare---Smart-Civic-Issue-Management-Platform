"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Shield,
  Activity,
  ArrowUpRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CityAdminEscalationResolutionModal } from "./CityAdminEscalationResolutionModal";
import { ISSUE_CATEGORIES } from "@/lib/issueClassificationConfig";

export function CityAdminSLAMonitoringDashboard({ cityAdminUserId }) {
  const [isMounted, setIsMounted] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [slaStatusFilter, setSlaStatusFilter] = useState("all");
  const [escalationStatusFilter, setEscalationStatusFilter] = useState("all");
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals & Drawers
  const [activeControlIssueId, setActiveControlIssueId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Fetch Scoped SLA Monitoring Data
  const data = useQuery(api.slaMonitoring.getScopedSLAMonitoringData, {
    cityAdminUserId,
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    slaStatus: slaStatusFilter !== "all" ? slaStatusFilter : undefined,
    escalationStatus:
      escalationStatusFilter !== "all" ? escalationStatusFilter : undefined,
    assignmentStatus:
      assignmentStatusFilter !== "all" ? assignmentStatusFilter : undefined,
    dateRange: dateRangeFilter !== "all" ? dateRangeFilter : undefined,
    sortBy,
    page: currentPage,
    pageSize,
  });

  const isDataLoading = data === undefined;
  const cityInfo = data?.cityInfo ??
    data?.scope ?? { city: "Scope", state: "" };
  const rawMetrics = data?.metrics ?? data?.summary ?? {};

  const metrics = {
    totalIssues: rawMetrics.totalIssues ?? 0,
    activeIssues: rawMetrics.activeIssues ?? rawMetrics.monitoredIssues ?? 0,
    monitoredIssues:
      rawMetrics.monitoredIssues ?? rawMetrics.monitoredCount ?? 0,
    complianceRate: rawMetrics.complianceRate ?? 0,

    breachedCount: rawMetrics.breachedCount ?? rawMetrics.breached ?? 0,
    atRiskCount: rawMetrics.atRiskCount ?? rawMetrics.atRisk ?? 0,
    dueSoonCount: rawMetrics.dueSoonCount ?? rawMetrics.dueSoon ?? 0,
    onTrackCount: rawMetrics.onTrackCount ?? rawMetrics.onTrack ?? 0,
    noDeadlineCount: rawMetrics.noDeadlineCount ?? rawMetrics.noDeadline ?? 0,

    escalatedCount: rawMetrics.escalatedCount ?? rawMetrics.escalated ?? 0,
    pendingReviewCount:
      rawMetrics.pendingReviewCount ?? rawMetrics.pendingAdminReview ?? 0,
    reviewedEscalationCount:
      rawMetrics.reviewedEscalationCount ?? rawMetrics.reviewedEscalations ?? 0,
    resolvedEscalationCount:
      rawMetrics.resolvedEscalationCount ?? rawMetrics.resolvedEscalations ?? 0,

    slaStatusDistribution: rawMetrics.slaStatusDistribution ?? {
      breached: rawMetrics.breachedCount ?? rawMetrics.breached ?? 0,
      at_risk: rawMetrics.atRiskCount ?? rawMetrics.atRisk ?? 0,
      due_soon: rawMetrics.dueSoonCount ?? rawMetrics.dueSoon ?? 0,
      on_track: rawMetrics.onTrackCount ?? rawMetrics.onTrack ?? 0,
      no_deadline: rawMetrics.noDeadlineCount ?? rawMetrics.noDeadline ?? 0,
    },
  };

  const issues = data?.issues ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // Derive latest reactive issue object for drawer
  const activeControlIssue =
    issues.find((i) => i.id === activeControlIssueId) || null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Active filter chips
  const activeChips = [];
  if (searchTerm)
    activeChips.push({ key: "search", label: `Search: "${searchTerm}"` });
  if (statusFilter !== "all")
    activeChips.push({ key: "status", label: `Status: ${statusFilter}` });
  if (categoryFilter !== "all")
    activeChips.push({ key: "category", label: `Category: ${categoryFilter}` });
  if (priorityFilter !== "all")
    activeChips.push({ key: "priority", label: `Priority: ${priorityFilter}` });
  if (slaStatusFilter !== "all")
    activeChips.push({ key: "slaStatus", label: `SLA: ${slaStatusFilter}` });
  if (escalationStatusFilter !== "all")
    activeChips.push({
      key: "escalationStatus",
      label: `Escalation: ${escalationStatusFilter}`,
    });
  if (assignmentStatusFilter !== "all")
    activeChips.push({
      key: "assignmentStatus",
      label: `Assignment: ${assignmentStatusFilter}`,
    });
  if (dateRangeFilter !== "all")
    activeChips.push({ key: "dateRange", label: `Date: ${dateRangeFilter}` });

  const removeChip = (key) => {
    if (key === "search") setSearchTerm("");
    if (key === "status") setStatusFilter("all");
    if (key === "category") setCategoryFilter("all");
    if (key === "priority") setPriorityFilter("all");
    if (key === "slaStatus") setSlaStatusFilter("all");
    if (key === "escalationStatus") setEscalationStatusFilter("all");
    if (key === "assignmentStatus") setAssignmentStatusFilter("all");
    if (key === "dateRange") setDateRangeFilter("all");
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setSlaStatusFilter("all");
    setEscalationStatusFilter("all");
    setAssignmentStatusFilter("all");
    setDateRangeFilter("all");
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen text-slate-900 dark:text-slate-100 font-sans text-xs">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[250] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slideUp font-bold text-xs">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full font-mono text-[10px] font-black uppercase tracking-wider border border-cyan-500/30">
                {cityInfo.city}, {cityInfo.state} (City Scope)
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-purple-500/30">
                SLA Operational Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              City SLA & Escalation Governance Hub
            </h1>
            <p className="text-slate-300 text-xs mt-1 font-medium max-w-2xl leading-relaxed">
              Real-time SLA monitoring, officer workload balancing, and
              escalation resolution control strictly enforced for municipal
              issues in {cityInfo.city}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => showToast("SLA data refreshed.")}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 border border-white/20 text-white cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Compliance Rate */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-3xl text-white shadow-md flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-cyan-100 tracking-wider">
            SLA Compliance
          </span>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-black">
              {isDataLoading
                ? "—"
                : metrics.monitoredIssues > 0
                  ? `${metrics.complianceRate}%`
                  : "N/A"}
            </span>
          </div>
          <span className="text-[10px] font-medium text-cyan-100">
            {isDataLoading
              ? "Loading..."
              : `${metrics.monitoredIssues} Active Monitored`}
          </span>
        </div>

        {/* Breached SLA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              SLA Breached
            </span>
            <AlertTriangle size={16} />
          </div>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 my-1">
            {isDataLoading ? "—" : metrics.breachedCount}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            Overdue Target
          </span>
        </div>

        {/* At Risk SLA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              At Risk (24–48h)
            </span>
            <Clock size={16} />
          </div>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 my-1">
            {isDataLoading ? "—" : metrics.atRiskCount}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            Expiring Soon
          </span>
        </div>

        {/* Due Soon */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-yellow-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Due Soon (≤24h)
            </span>
            <Clock size={16} />
          </div>
          <span className="text-2xl font-black text-yellow-600 dark:text-yellow-400 my-1">
            {isDataLoading ? "—" : metrics.dueSoonCount}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            Immediate Action
          </span>
        </div>

        {/* Active Escalations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Escalated
            </span>
            <ArrowUpRight size={16} />
          </div>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 my-1">
            {isDataLoading ? "—" : metrics.escalatedCount}
          </span>
          <span className="text-[10px] text-purple-500 font-bold">
            {isDataLoading
              ? "Loading..."
              : `${metrics.pendingReviewCount} Pending Review`}
          </span>
        </div>

        {/* On Track */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              On Track
            </span>
            <CheckCircle size={16} />
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 my-1">
            {isDataLoading ? "—" : metrics.onTrackCount}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            Healthy Resolution
          </span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by ticket code, title, citizen, or officer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-extrabold text-[10px] uppercase">
              Filter Options
            </span>
          </div>
        </div>

        {/* Dropdowns Filter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold cursor-pointer"
          >
            <option value="all">All Operational Statuses</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_uo_verification">
              Pending Verification
            </option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold cursor-pointer capitalize"
          >
            <option value="all">All Categories</option>
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* SLA Health */}
          <select
            value={slaStatusFilter}
            onChange={(e) => setSlaStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold cursor-pointer"
          >
            <option value="all">All SLA States</option>
            <option value="breached">Breached</option>
            <option value="at_risk">At Risk (&lt;48h)</option>
            <option value="due_soon">Due Soon (&lt;24h)</option>
            <option value="on_track">On Track</option>
            <option value="no_deadline">No Deadline</option>
          </select>

          {/* Escalation Status */}
          <select
            value={escalationStatusFilter}
            onChange={(e) => setEscalationStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold cursor-pointer"
          >
            <option value="all">All Escalation States</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="action_required">Corrective Action Required</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Assignment Status */}
          <select
            value={assignmentStatusFilter}
            onChange={(e) => setAssignmentStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold cursor-pointer"
          >
            <option value="all">All Assignment States</option>
            <option value="fully_assigned">Fully Assigned (UO & FO)</option>
            <option value="partially_assigned">Partially Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold cursor-pointer"
          >
            <option value="deadline">SLA Deadline (Earliest)</option>
            <option value="overdue">Most Overdue</option>
            <option value="priority_high">Priority (Highest First)</option>
            <option value="priority_low">Priority (Lowest First)</option>
            <option value="escalated_recent">
              Escalated Date (Recent First)
            </option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-400">
              Active Filters:
            </span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold flex items-center gap-1.5 border border-cyan-500/20"
              >
                <span>{chip.label}</span>
                <button
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  className="hover:text-red-500 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[10px] font-black text-red-500 uppercase hover:underline ml-2 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main SLA Issues Table / Card View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {data === undefined ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw
              className="animate-spin mx-auto text-cyan-500"
              size={28}
            />
            <p className="font-bold text-xs">
              Loading City SLA monitoring records...
            </p>
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText
              className="mx-auto text-slate-300 dark:text-slate-700"
              size={36}
            />
            <h3 className="font-black text-slate-700 dark:text-slate-300 text-sm">
              No Issues Matching Filters
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              There are no municipal issues matching the selected SLA status,
              category, or search criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-4 px-4 min-w-[320px]">Issue Details</th>
                    <th className="py-4 px-4">Classification</th>
                    <th className="py-4 px-4">SLA Health</th>
                    <th className="py-4 px-4">Escalation Status</th>
                    <th className="py-4 px-4">Priority & Status</th>
                    <th className="py-4 px-4">Assigned Officers</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {issues.map((issue) => {
                    const isBreached = issue.sla?.status === "breached";
                    const isAtRisk = issue.sla?.status === "at_risk";
                    const isDueSoon = issue.sla?.status === "due_soon";
                    const isEscalated = issue.escalation?.isEscalated;
                    const isEscalationResolved = issue.escalation?.resolved;
                    const hasActiveEscalation =
                      isEscalated && !isEscalationResolved;
                    const isCritical = issue.priority === "critical";

                    const borderAccent =
                      isCritical && isBreached
                        ? "border-l-4 border-l-red-600"
                        : isBreached
                          ? "border-l-4 border-l-rose-500"
                          : isAtRisk
                            ? "border-l-4 border-l-amber-500"
                            : isDueSoon
                              ? "border-l-4 border-l-yellow-500"
                              : hasActiveEscalation
                                ? "border-l-4 border-l-purple-500"
                                : "border-l-4 border-l-slate-200 dark:border-l-slate-800";

                    return (
                      <tr
                        key={issue.id}
                        className={`align-top hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors ${borderAccent}`}
                      >
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1.5 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 text-xs bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 rounded-lg">
                                {issue.code || issue.ticket_id}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                Reported:{" "}
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug">
                              {issue.title}
                            </h4>

                            <p className="text-slate-600 dark:text-slate-400 text-xs font-normal leading-relaxed whitespace-pre-wrap">
                              {issue.description}
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top space-y-1">
                          <span className="font-extrabold uppercase text-slate-800 dark:text-slate-200 block">
                            {issue.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold block capitalize">
                            Dept: {issue.department || issue.category}
                          </span>
                        </td>

                        <td className="py-4 px-4 align-top space-y-1">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-block ${
                              isBreached
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                : isAtRisk
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : isDueSoon
                                    ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20"
                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {issue.sla?.status || "no_deadline"}
                          </span>

                          <span className="text-[11px] font-bold block text-slate-700 dark:text-slate-300">
                            {issue.sla?.deadline
                              ? new Date(issue.sla.deadline).toLocaleString()
                              : "Unset"}
                          </span>
                        </td>

                        {/* Escalation Column */}
                        <td className="py-4 px-4 align-top space-y-1">
                          {isEscalationResolved ? (
                            <div className="space-y-1">
                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 inline-block">
                                Resolved Escalation
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block capitalize">
                                Category:{" "}
                                {issue.escalation?.category || issue.category}
                              </span>
                            </div>
                          ) : isEscalated ? (
                            <div className="space-y-1">
                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 inline-block">
                                Active Escalation
                              </span>
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block capitalize">
                                Status:{" "}
                                {issue.escalation?.status || "Pending Review"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Normal
                            </span>
                          )}

                          {issue.escalation?.resolutionActions &&
                            issue.escalation.resolutionActions.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 pt-1 block">
                                <Activity className="h-3 w-3 text-cyan-500" />
                                {issue.escalation.resolutionActions.length}{" "}
                                events
                              </span>
                            )}
                        </td>

                        <td className="py-4 px-4 align-top space-y-1">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-block ${
                              issue.priority === "critical"
                                ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                : issue.priority === "high"
                                  ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {issue.priority || "medium"}
                          </span>
                          <span className="text-[11px] font-bold block text-slate-600 dark:text-slate-400 capitalize">
                            {issue.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 align-top space-y-1">
                          <div className="text-[11px]">
                            <span className="text-slate-400 text-[10px] block uppercase font-bold">
                              Unit Officer
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {issue.assignedUnitOfficer?.name || "Unassigned"}
                            </span>
                          </div>
                          <div className="text-[11px] pt-1">
                            <span className="text-slate-400 text-[10px] block uppercase font-bold">
                              Field Officer
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {issue.assignedFieldOfficer?.name || "Unassigned"}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top text-right">
                          <button
                            type="button"
                            onClick={() => setActiveControlIssueId(issue.id)}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Shield size={14} />
                            <span>
                              {hasActiveEscalation
                                ? "Resolve Escalation"
                                : "Open SLA Controls"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="lg:hidden p-4 space-y-4">
              {issues.map((issue) => {
                const isEscalated = issue.escalation?.isEscalated;
                const isEscalationResolved = issue.escalation?.resolved;
                const hasActiveEscalation =
                  isEscalated && !isEscalationResolved;

                return (
                  <div
                    key={issue.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 text-xs bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        {issue.code || issue.ticket_id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          issue.sla?.status === "breached"
                            ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        }`}
                      >
                        SLA: {issue.sla?.status || "no_deadline"}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {issue.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-normal leading-relaxed">
                      {issue.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => setActiveControlIssueId(issue.id)}
                      className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1.5 shadow cursor-pointer"
                    >
                      <Shield size={14} />
                      <span>
                        {hasActiveEscalation
                          ? "Resolve Escalation"
                          : "Open SLA Controls"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="bg-slate-50 dark:bg-slate-950/80 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Page {pagination.page} of {pagination.totalPages} (
                  {pagination.totalItems} Total Issues)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Control Panel Drawer / Modal (re-renders reactively when activeControlIssue updates) */}
      {activeControlIssue && (
        <CityAdminEscalationResolutionModal
          issue={activeControlIssue}
          cityAdminUserId={cityAdminUserId}
          onClose={() => setActiveControlIssueId(null)}
          onResolved={() => {
            showToast("Administrative action processed.");
          }}
        />
      )}
    </div>
  );
}

export default CityAdminSLAMonitoringDashboard;
