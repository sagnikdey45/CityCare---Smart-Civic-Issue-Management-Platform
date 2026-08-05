"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  AlertTriangle,
  Clock,
  Search,
  Calendar,
  MapPin,
  Activity,
  Zap,
  Eye,
  Download,
} from "lucide-react";
import { CityAdminEscalationResolutionModal } from "./CityAdminEscalationResolutionModal";

const CATEGORY_STYLES = {
  road: { label: "Road", color: "text-orange-500", bg: "bg-orange-500/10" },
  electricity: {
    label: "Electricity",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  water: { label: "Water", color: "text-sky-500", bg: "bg-sky-500/10" },
  sanitation: {
    label: "Sanitation",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  drainage: { label: "Drainage", color: "text-teal-500", bg: "bg-teal-500/10" },
  solid_waste: {
    label: "Solid Waste",
    color: "text-lime-500",
    bg: "bg-lime-500/10",
  },
  public_health: {
    label: "Public Health",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  other: { label: "Other", color: "text-slate-500", bg: "bg-slate-500/10" },
};

const PRIORITY_STYLES = {
  critical:
    "bg-red-100 text-red-750 dark:bg-red-950/30 dark:text-red-400 border-red-205",
  high: "bg-orange-100 text-orange-755 dark:bg-orange-950/30 dark:text-orange-400 border-orange-205",
  medium:
    "bg-blue-100 text-blue-755 dark:bg-blue-950/30 dark:text-blue-400 border-blue-205",
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-205",
};

export default function CityAdminSLAMonitoringDashboard({
  cityAdminUserId,
  onViewIssue,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [escalationFilter, setEscalationFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  const [sortBy, setSortBy] = useState("deadline");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  // Row selection & Bulk actions
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [bulkActionType, setBulkActionType] = useState("send_reminder");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkPriority, setBulkPriority] = useState("low");
  const [bulkDepartment, setBulkDepartment] = useState("");
  const [bulkStatusText, setBulkStatusText] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Active resolution dialog issue
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Search debounce timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Reactive scoped query for city admin only
  const queryResult = useQuery(api.slaMonitoring.getScopedSLAMonitoringData, {
    cityAdminUserId,
    search: debouncedSearch,
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    slaStatus: slaFilter !== "all" ? slaFilter : undefined,
    escalationStatus: escalationFilter !== "all" ? escalationFilter : undefined,
    assignmentStatus: assignmentFilter !== "all" ? assignmentFilter : undefined,
    dateRange: dateRangeFilter !== "all" ? dateRangeFilter : undefined,
    sortBy,
    page,
    pageSize,
  });

  // Safe mutations
  const bulkUpdateMut = useMutation(api.cityAdmin.bulkUpdateIssues);
  const bulkAckMut = useMutation(api.slaMonitoring.bulkAcknowledgeEscalations);

  const scope = queryResult?.scope || { mode: "city", city: "", state: "" };
  const summary = queryResult?.summary || {
    totalIssues: 0,
    monitoredIssues: 0,
    breached: 0,
    atRisk: 0,
    dueSoon: 0,
    onTrack: 0,
    noDeadline: 0,
    escalated: 0,
    pendingAdminReview: 0,
    resolvedEscalations: 0,
    averageResolutionHours: 0,
    complianceRate: 100,
  };
  const issues = queryResult?.issues || [];
  const analytics = queryResult?.escalationAnalytics || {
    byCategory: [],
    byDepartment: [],
    mostDelayed: [],
    unresolvedCritical: [],
  };
  const pagination = queryResult?.pagination || {
    page: 1,
    pageSize: 15,
    totalItems: 0,
    totalPages: 1,
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(issues.map((i) => i.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id],
    );
  };

  const handleBulkAction = async () => {
    if (selectedRowIds.length === 0) return;
    if (!bulkReason.trim()) {
      alert("A justification reason is required for bulk action.");
      return;
    }

    setBulkLoading(true);
    setBulkStatusText("Processing bulk updates...");
    try {
      if (bulkActionType === "acknowledge") {
        setBulkStatusText("Acknowledging escalations...");
        const res = await bulkAckMut({
          cityAdminUserId: cityAdminUserId,
          issueIds: selectedRowIds,
          note: bulkReason,
        });
        alert(
          `Bulk acknowledgment completed. Success: ${res.successfulIssueIds.length}, Skipped: ${res.skippedIssues.length}`,
        );
      } else {
        setBulkStatusText("Applying bulk updates...");
        const res = await bulkUpdateMut({
          cityAdminUserId: cityAdminUserId,
          issueIds: selectedRowIds,
          actionType: bulkActionType,
          priority:
            bulkActionType === "change_priority" ? bulkPriority : undefined,
          department:
            bulkActionType === "assign_department" ? bulkDepartment : undefined,
          reason: bulkReason,
        });
        alert(
          `Bulk updates completed. Success: ${res.successfulIssueIds.length}, Skipped: ${res.skippedIssues.length}`,
        );
      }
      setSelectedRowIds([]);
      setBulkReason("");
    } catch (e) {
      console.error(e);
      alert("Bulk action failed: " + e.message);
    } finally {
      setBulkLoading(false);
      setBulkStatusText("");
    }
  };

  const handleExportCSV = () => {
    if (issues.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent +=
      "Issue Code,Title,Category,Status,Priority,City,Unit Officer,Field Officer,SLA Deadline,SLA Status,Escalated,Escalation Category,Escalation Priority,Admin Review Status\n";

    issues.forEach((i) => {
      const row = [
        i.ticket_id,
        `"${i.title.replace(/"/g, '""')}"`,
        i.category,
        i.status,
        i.severity,
        i.city,
        i.assigned_officer?.name || "None",
        i.field_officer?.name || "None",
        i.sla_deadline ? new Date(i.sla_deadline).toISOString() : "None",
        i.sla_status,
        i.is_escalated ? "Yes" : "No",
        i.escalation_category || "None",
        i.escalation_priority || "None",
        i.escalation_admin_review_status,
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SLA_Monitor_Export_${scope.city || "city"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUrgencyRowClass = (item) => {
    const isCritical = item.severity === "critical";
    const isBreached = item.sla_status === "breached";
    const isAtRisk = item.sla_status === "at_risk";
    const isDueSoon = item.sla_status === "due_soon";
    const isEscalated = item.is_escalated;

    if (isCritical && isBreached) return "border-l-[5px] border-l-red-650";
    if (isBreached) return "border-l-[4px] border-l-rose-500";
    if (isAtRisk) return "border-l-[4px] border-l-amber-500";
    if (isDueSoon) return "border-l-[4px] border-l-yellow-400";
    if (isEscalated) return "border-l-[4px] border-l-purple-500";
    if (item.sla_status === "on_track")
      return "border-l-[4px] border-l-emerald-500";
    return "border-l-[4px] border-l-slate-300";
  };

  // Safe SLA distribution calculation
  const totalMonitored =
    summary.breached + summary.dueSoon + summary.atRisk + summary.onTrack;
  const safePercentage = (count) =>
    totalMonitored > 0
      ? Number(((count / totalMonitored) * 100).toFixed(1))
      : 0;

  const onTrackPercent = safePercentage(summary.onTrack);
  const dueSoonPercent = safePercentage(summary.dueSoon);
  const atRiskPercent = safePercentage(summary.atRisk);
  const breachedPercent = safePercentage(summary.breached);

  if (queryResult === undefined) {
    // Skeletons
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl"
            />
          ))}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advanced Page Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-slate-900/60 dark:to-slate-800/40 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden border border-cyan-500/25">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight uppercase flex items-center gap-2">
              <Clock size={22} className="animate-spin-slow" />
              SLA Operations & Escalation Control
            </h2>
            <p className="text-xs text-slate-100 dark:text-slate-350 leading-relaxed font-semibold">
              Monitor deadlines, identify risk, and coordinate administrative
              intervention across {scope.city || "your city"}.
            </p>
            <p className="text-[10px] bg-white/20 dark:bg-slate-850 px-2 py-0.5 rounded font-black tracking-wider uppercase text-teal-200 mt-1 inline-block">
              Administrative Scope: {scope.city}, {scope.state}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "SLA Compliance",
            value: `${summary.complianceRate}%`,
            subText: "Resolved on-time target",
            color: "text-emerald-500",
          },
          {
            label: "Breached SLA",
            value: summary.breached,
            subText: "Immediate intervention required",
            color: "text-red-500",
          },
          {
            label: "At Risk",
            value: summary.atRisk,
            subText: "Deadline under 24 hours",
            color: "text-amber-500",
          },
          {
            label: "Escalated Issues",
            value: summary.escalated,
            subText: "Under active review",
            color: "text-purple-500",
          },
        ].map((k, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-150 dark:border-slate-700/60 shadow-sm space-y-1"
          >
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
              {k.label}
            </span>
            <span
              className={`text-2xl font-black block tracking-tight ${k.color}`}
            >
              {k.value}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              {k.subText}
            </span>
          </div>
        ))}
      </div>

      {/* SLA Health Distribution Strip */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-150 dark:border-slate-700/60 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-555 tracking-wider">
          <span>SLA Health Distribution Bar</span>
          <span>{totalMonitored} Monitored Targets</span>
        </div>
        <div className="flex h-3.5 rounded-full overflow-hidden w-full bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80">
          <div
            style={{ width: `${onTrackPercent}%` }}
            className="bg-emerald-500 transition-all"
            title={`On Track: ${onTrackPercent}%`}
          />
          <div
            style={{ width: `${dueSoonPercent}%` }}
            className="bg-yellow-400 transition-all"
            title={`Due Soon: ${dueSoonPercent}%`}
          />
          <div
            style={{ width: `${atRiskPercent}%` }}
            className="bg-amber-500 transition-all"
            title={`At Risk: ${atRiskPercent}%`}
          />
          <div
            style={{ width: `${breachedPercent}%` }}
            className="bg-red-500 transition-all"
            title={`Breached: ${breachedPercent}%`}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> On Track (
            {onTrackPercent}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-yellow-400 rounded" /> Due Soon (
            {dueSoonPercent}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded" /> At Risk (
            {atRiskPercent}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded" /> Breached (
            {breachedPercent}%)
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-150 dark:border-slate-700/60 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search code, title, address..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          <select
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All SLA Health States</option>
            <option value="on_track">On Track</option>
            <option value="due_soon">Due Soon</option>
            <option value="at_risk">At Risk</option>
            <option value="breached">Breached</option>
            <option value="no_deadline">No Deadline</option>
          </select>

          <select
            value={escalationFilter}
            onChange={(e) => setEscalationFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Escalations</option>
            <option value="escalated">Active Escalations</option>
            <option value="pending">Pending Review</option>
            <option value="resolved">Resolved Escalations</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 capitalize"
          >
            <option value="all">All Categories</option>
            {Object.keys(CATEGORY_STYLES).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_STYLES[cat].label}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedRowIds.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">
                {selectedRowIds.length} Issues Selected
              </span>
              <select
                value={bulkActionType}
                onChange={(e) => setBulkActionType(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer focus:outline-none"
              >
                <option value="send_reminder">Send Workload Reminder</option>
                <option value="acknowledge">Acknowledge Escalations</option>
                <option value="change_priority">Update Issue Priority</option>
                <option value="assign_department">
                  Reassign Department Queue
                </option>
              </select>

              {bulkActionType === "change_priority" && (
                <select
                  value={bulkPriority}
                  onChange={(e) => setBulkPriority(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-850 dark:text-slate-150 cursor-pointer focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Priority</option>
                </select>
              )}

              {bulkActionType === "assign_department" && (
                <select
                  value={bulkDepartment}
                  onChange={(e) => setBulkDepartment(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-850 dark:text-slate-150 cursor-pointer focus:outline-none"
                >
                  <option value="">Choose Department...</option>
                  <option value="road">Roads & Traffic</option>
                  <option value="electricity">
                    Electricity & Streetlights
                  </option>
                  <option value="water">Water Supply & Sewage</option>
                  <option value="sanitation">
                    Sanitation & Waste Management
                  </option>
                </select>
              )}
            </div>

            <div className="flex w-full md:w-auto gap-2">
              <input
                type="text"
                placeholder="Bulk reason required..."
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                className="flex-1 md:w-44 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-850 dark:text-slate-150"
              />
              <button
                onClick={handleBulkAction}
                disabled={bulkLoading}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center gap-1"
              >
                {bulkLoading ? "Applying..." : "Apply Bulk"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Issues Queue Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-150 dark:border-slate-700/60 shadow-sm overflow-hidden text-xs font-semibold text-slate-800 dark:text-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-150 dark:border-slate-800/80 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      issues.length > 0 &&
                      selectedRowIds.length === issues.length
                    }
                    className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th className="py-4 px-4">Issue Details</th>
                <th className="py-4 px-4 text-center">SLA Health</th>
                <th className="py-4 px-4">Deadline Target</th>
                <th className="py-4 px-4">Escalation Category</th>
                <th className="py-4 px-4 text-center">Priority</th>
                <th className="py-4 px-4">Assigned Officers</th>
                <th className="py-4 px-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800/40">
              {issues.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-slate-400 font-bold"
                  >
                    No SLA-monitored issues match the filters.
                  </td>
                </tr>
              ) : (
                issues.map((i) => {
                  const categoryStyle =
                    CATEGORY_STYLES[i.category.toLowerCase()] ||
                    CATEGORY_STYLES.other;

                  return (
                    <tr
                      key={i.id}
                      className={`hover:bg-slate-50/40 dark:hover:bg-slate-900/30 transition-colors group ${getUrgencyRowClass(i)}`}
                    >
                      <td className="py-4 px-5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRowIds.includes(i.id)}
                          onChange={() => handleSelectRow(i.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500"
                        />
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-extrabold">
                              {i.ticket_id}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${categoryStyle.bg} ${categoryStyle.color}`}
                            >
                              {i.category}
                            </span>
                          </div>
                          <p className="text-slate-905 dark:text-white font-extrabold line-clamp-1 max-w-[200px]">
                            {i.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                            {i.location}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {i.sla_status === "breached" ? (
                          <span className="inline-flex px-2 py-0.5 rounded bg-red-50 text-red-655 font-black uppercase text-[9px] tracking-wide">
                            Breached{" "}
                            {i.overdue_hours ? `${i.overdue_hours}h ago` : ""}
                          </span>
                        ) : i.sla_status === "due_soon" ? (
                          <span className="inline-flex px-2 py-0.5 rounded bg-yellow-50 text-yellow-655 font-black uppercase text-[9px] tracking-wide">
                            Due{" "}
                            {i.hours_remaining
                              ? `in ${i.hours_remaining}h`
                              : "soon"}
                          </span>
                        ) : i.sla_status === "at_risk" ? (
                          <span className="inline-flex px-2 py-0.5 rounded bg-amber-50 text-amber-655 font-black uppercase text-[9px] tracking-wide">
                            At Risk
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-black uppercase text-[9px] tracking-wide">
                            On Track
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-extrabold">
                            {i.sla_deadline
                              ? new Date(i.sla_deadline).toLocaleDateString()
                              : "—"}
                          </p>
                          <p className="text-[9px] text-slate-400 font-medium">
                            {i.sla_deadline
                              ? new Date(i.sla_deadline).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : "No target deadline"}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {i.is_escalated ? (
                          <div className="space-y-0.5">
                            <span className="text-purple-600 dark:text-purple-400 font-extrabold capitalize">
                              {i.escalation_category?.replace(/_/g, " ")}
                            </span>
                            <span className="block text-[9px] text-slate-400 font-medium truncate max-w-[150px]">
                              "{i.escalation_reason}"
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">
                            No active escalation
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${PRIORITY_STYLES[i.severity] || PRIORITY_STYLES.medium}`}
                        >
                          {i.severity}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {i.assigned_officer ? (
                            <p className="font-extrabold leading-none text-slate-800 dark:text-slate-200">
                              UO: {i.assigned_officer.name}
                            </p>
                          ) : (
                            <p className="text-[10px] text-red-500 font-bold leading-none">
                              UO: Unassigned
                            </p>
                          )}
                          {i.field_officer ? (
                            <p className="font-extrabold leading-none text-slate-800 dark:text-slate-200">
                              FO: {i.field_officer.name}
                            </p>
                          ) : (
                            <p className="text-[10px] text-red-500 font-bold leading-none">
                              FO: Unassigned
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right pr-6">
                        <button
                          onClick={() => setSelectedIssue(i)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Eye size={13} />
                          Action
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination wrapper */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-550 dark:text-slate-400">
          <span>
            Page {page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 rounded-lg font-bold"
            >
              Prev
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 rounded-lg font-bold"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Escalation Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Delayed Issues Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-150 dark:border-slate-700/60 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="text-red-500" size={15} />
            Most Delayed SLA Breaches
          </h3>
          <div className="space-y-3">
            {analytics.mostDelayed.length === 0 ? (
              <p className="text-slate-400 font-bold py-4 text-center">
                No delayed SLA issues reported.
              </p>
            ) : (
              analytics.mostDelayed.map((i) => (
                <div
                  key={i.id}
                  onClick={() => setSelectedIssue(i)}
                  className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex justify-between items-center cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition-all hover:scale-[1.01]"
                >
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-900 dark:text-white">
                      {i.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {i.ticket_id} &bull; {i.category}
                    </p>
                  </div>
                  <span className="text-xs text-red-500 font-black">
                    +{i.overdue_hours}h delay
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Escalation Category counts */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-150 dark:border-slate-700/60 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider flex items-center gap-1.5">
            <Activity className="text-cyan-500" size={15} />
            Escalation Breakdown by category
          </h3>
          <div className="space-y-3">
            {analytics.byCategory.length === 0 ? (
              <p className="text-slate-400 font-bold py-4 text-center">
                No active escalations category logs.
              </p>
            ) : (
              analytics.byCategory.map((c) => (
                <div key={c.category} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-705 dark:text-slate-350 capitalize">
                      {c.category.replace(/_/g, " ")}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {c.count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${(c.count / summary.escalated) * 100}%`,
                      }}
                      className="bg-cyan-500 h-full rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin Escalation Control Modal */}
      {selectedIssue && (
        <CityAdminEscalationResolutionModal
          issue={selectedIssue}
          cityAdminUserId={cityAdminUserId}
          onClose={() => setSelectedIssue(null)}
          onResolved={() => {
            // Refreshes reactively
          }}
        />
      )}
    </div>
  );
}
