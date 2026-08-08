"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart3,
  Copy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Calendar,
  Layers,
  MapPin,
  Building2,
  Users,
  Shield,
  Star,
  Activity,
  ArrowRight,
  Eye,
  X,
  Info,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function CityIssueAnalytics({
  cityAdminUserId,
  dateRange = "all",
  onSetDateRange,
  onSelectIssue,
}) {
  const [localRange, setLocalRange] = useState(dateRange || "all");
  const activeRange = localRange || "all";

  const handleRangeChange = (newRange) => {
    setLocalRange(newRange);
    if (onSetDateRange) {
      onSetDateRange(newRange);
    }
  };

  const analyticsData = useQuery(
    api.cityAdmin.getCityIssueAnalytics,
    cityAdminUserId ? { cityAdminUserId, range: activeRange } : "skip",
  );

  const [selectedGroup, setSelectedGroup] = useState(null);

  // Duplicate group filter states
  const [dupSearch, setDupSearch] = useState("");
  const [dupCategory, setDupCategory] = useState("all");
  const [dupStatus, setDupStatus] = useState("all");
  const [dupPriority, setDupPriority] = useState("all");
  const [dupGroupState, setDupGroupState] = useState("all");
  const [dupMinSize, setDupMinSize] = useState(2);

  useEffect(() => {
    setLocalRange(dateRange || "all");
  }, [dateRange]);

  const isLoading = analyticsData === undefined;
  const isError = analyticsData === null;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (isError || !analyticsData) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          City Analytics Unavailable
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          City analytics could not be loaded. Please ensure you are logged in as
          an authorized City Admin.
        </p>
      </div>
    );
  }

  const {
    scope,
    range: rangeInfo,
    overview,
    duplicateAnalytics,
    trends,
    statusAnalytics,
    categoryAnalytics,
    departmentAnalytics,
    priorityAnalytics,
    comparison,
  } = analyticsData;

  const normalizeKey = (val) =>
    String(val || "")
      .trim()
      .toLowerCase();

  const rawGroups = duplicateAnalytics?.groups || [];

  // Filter duplicate groups
  const filteredGroups = rawGroups.filter((g) => {
    if (g.memberCount < dupMinSize) return false;

    if (dupSearch.trim()) {
      const q = dupSearch.toLowerCase().trim();
      const matchAnchorCode = (g.anchorIssueCode || "")
        .toLowerCase()
        .includes(q);
      const matchAnchorTitle = (g.anchorIssueTitle || "")
        .toLowerCase()
        .includes(q);
      const matchAddress = (g.address || "").toLowerCase().includes(q);
      const matchMember = g.members.some(
        (m) =>
          (m.code || "").toLowerCase().includes(q) ||
          (m.title || "").toLowerCase().includes(q) ||
          (m.address || "").toLowerCase().includes(q),
      );
      if (
        !matchAnchorCode &&
        !matchAnchorTitle &&
        !matchAddress &&
        !matchMember
      ) {
        return false;
      }
    }

    if (dupCategory !== "all") {
      const selectedCategory = normalizeKey(dupCategory);
      const hasCategoryMatch =
        normalizeKey(g.category) === selectedCategory ||
        (g.categories || []).some((c) => normalizeKey(c) === selectedCategory);
      if (!hasCategoryMatch) return false;
    }

    if (dupStatus !== "all") {
      const selectedStatus = normalizeKey(dupStatus);
      const hasMatchingStatus = g.members.some(
        (m) => normalizeKey(m.status) === selectedStatus,
      );
      if (!hasMatchingStatus) return false;
    }

    if (dupPriority !== "all") {
      const selectedPriority = normalizeKey(dupPriority);
      const hasMatchingPriority = g.members.some(
        (m) => normalizeKey(m.priority) === selectedPriority,
      );
      if (!hasMatchingPriority) return false;
    }

    if (dupGroupState === "active" && g.activeMemberCount === 0) return false;
    if (dupGroupState === "resolved" && g.activeMemberCount > 0) return false;
    if (dupGroupState === "breach" && g.breachedMemberCount === 0) return false;
    if (dupGroupState === "escalation" && g.escalatedMemberCount === 0)
      return false;

    return true;
  });

  // Calculate deterministic operational observations
  const operationalInsights = [];
  if (categoryAnalytics && categoryAnalytics.length > 0) {
    const topCat = categoryAnalytics[0];
    operationalInsights.push({
      icon: Layers,
      color: "text-cyan-500 bg-cyan-500/10",
      title: `${topCat.category.toUpperCase()} Leads Issue Volume`,
      desc: `${topCat.category.toUpperCase()} represents the largest category with ${topCat.totalIssues} reported issues (${topCat.duplicateLinkedIssues} connected to duplicate groups).`,
    });
  }

  if (duplicateAnalytics?.duplicateRate > 15) {
    operationalInsights.push({
      icon: Copy,
      color: "text-amber-500 bg-amber-500/10",
      title: "High Duplicate Concentration",
      desc: `${duplicateAnalytics.duplicateRate}% of issues in this range belong to connected duplicate groups. Cross-departmental verification is recommended.`,
    });
  }

  if (overview?.currentSlaBreaches > 0) {
    operationalInsights.push({
      icon: Clock,
      color: "text-rose-500 bg-rose-500/10",
      title: "Active SLA Risk Alerts",
      desc: `There are currently ${overview.currentSlaBreaches} active SLA breaches requiring department oversight.`,
    });
  }

  if (overview?.averageCitizenRating > 0) {
    operationalInsights.push({
      icon: Star,
      color: "text-emerald-500 bg-emerald-500/10",
      title: `Citizen Satisfaction: ${overview.averageCitizenRating}/5.0`,
      desc: `Based on ${overview.ratedIssueCount} rated resolved issues in this administrative scope.`,
    });
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-black text-[10px] uppercase px-3 py-1 rounded-xl tracking-wider">
                Read-Only Analytics
              </span>
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Scope: {scope.city}, {scope.state}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              City Issue Analytics & Intelligence
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              City-wide duplicate group detection, volume trend analysis,
              category patterns, and SLA performance indicators across all
              departments.
            </p>
          </div>

          {/* Range Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-800/80 border border-slate-700/60 p-2 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-1 text-xs text-slate-400 px-3 py-1 font-semibold">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Range:
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { id: "today", label: "Today" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "all", label: "All Time" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRangeChange(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeRange === r.id
                      ? "bg-cyan-500 text-slate-950 shadow-md font-black"
                      : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              This page provides analytical insights only and does not modify
              database records.
            </span>
          </div>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Total City Issues
            </span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {overview.totalCityIssues}
          </p>
          <span className="text-[10px] text-slate-400 block">
            {overview.issuesCreatedInRange} created in range
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Active Issues
            </span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {overview.currentActiveIssues}
          </p>
          <span className="text-[10px] text-slate-400 block">
            {overview.unassignedIssues} unassigned officers
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Duplicate Groups
            </span>
            <Copy className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {duplicateAnalytics.groupCount}
          </p>
          <span className="text-[10px] text-slate-400 block">
            {duplicateAnalytics.duplicateLinkedIssueCount} linked issues
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Duplicate Rate
            </span>
            <BarChart3 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {duplicateAnalytics.duplicateRate}%
          </p>
          <span className="text-[10px] text-slate-400 block">
            {duplicateAnalytics.redundantIssueCount} redundant reports
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              SLA Breaches
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {overview.currentSlaBreaches}
          </p>
          <span className="text-[10px] text-slate-400 block">
            {overview.currentEscalations} escalations active
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Resolution Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {overview.resolutionRate}%
          </p>
          <span className="text-[10px] text-slate-400 block">
            {overview.averageResolutionHours}h avg duration
          </span>
        </div>
      </div>

      {/* 3. Operational Insights */}
      {operationalInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {operationalInsights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div
                key={idx}
                className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-3 shadow-2xs"
              >
                <div className={`p-2.5 rounded-xl ${insight.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                    {insight.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    {insight.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Connected Component Duplicate Groups Section */}
      <div className="space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-cyan-500" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                City Duplicate Groups Explorer
              </h3>
              <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                {filteredGroups.length} Groups
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Graph-connected clusters of related reports based on backend
              duplicate relationships. Read-only context for city admins.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-semibold">
              Avg Size:{" "}
              <strong className="text-slate-900 dark:text-white font-black">
                {duplicateAnalytics.averageGroupSize}
              </strong>
            </span>
            <span>•</span>
            <span className="font-semibold">
              Largest:{" "}
              <strong className="text-slate-900 dark:text-white font-black">
                {duplicateAnalytics.largestGroupSize}
              </strong>
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 p-3 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, title, address..."
              value={dupSearch}
              onChange={(e) => setDupSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 font-medium"
            />
          </div>

          <select
            value={dupCategory}
            onChange={(e) => setDupCategory(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 font-medium capitalize"
          >
            <option value="all">All Categories</option>
            {categoryAnalytics.map((c) => (
              <option key={c.category} value={c.category}>
                {c.category} ({c.totalIssues})
              </option>
            ))}
          </select>

          <select
            value={dupStatus}
            onChange={(e) => setDupStatus(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 font-medium capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="verified">Verified</option>
            <option value="escalated">Escalated</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={dupPriority}
            onChange={(e) => setDupPriority(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 font-medium capitalize"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={dupGroupState}
            onChange={(e) => setDupGroupState(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 font-medium"
          >
            <option value="all">All Group States</option>
            <option value="active">Active Members Exists</option>
            <option value="resolved">Fully Resolved</option>
            <option value="breach">Contains SLA Breach</option>
            <option value="escalation">Contains Escalation</option>
          </select>

          <select
            value={dupMinSize}
            onChange={(e) => setDupMinSize(Number(e.target.value))}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 font-medium"
          >
            <option value={2}>Min 2 Members</option>
            <option value={3}>Min 3 Members</option>
            <option value={5}>Min 5 Members</option>
          </select>

          <button
            onClick={() => {
              setDupSearch("");
              setDupCategory("all");
              setDupStatus("all");
              setDupPriority("all");
              setDupGroupState("all");
              setDupMinSize(2);
            }}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 col-span-1 sm:col-span-2 md:col-span-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>

        {/* Group Cards Grid */}
        {rawGroups.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-850/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <Copy className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              No issue pairs reached the duplicate threshold of 60 for the
              selected city scope.
            </p>
            <p className="text-[11px] text-slate-400">
              Dynamic similarity detection evaluates location distance, category
              compatibility, subcategory aliases, and text similarity.
            </p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-850/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <Filter className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Duplicate groups exist ({rawGroups.length} total), but none
                match the selected filters.
              </p>
              <p className="text-[11px] text-slate-400">
                Try clearing search terms or resetting category, status, and min
                size filters.
              </p>
            </div>
            <button
              onClick={() => {
                setDupSearch("");
                setDupCategory("all");
                setDupStatus("all");
                setDupPriority("all");
                setDupGroupState("all");
                setDupMinSize(2);
              }}
              className="px-4 py-1.5 bg-cyan-500 text-slate-950 text-xs font-black rounded-xl hover:bg-cyan-400 transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGroups.map((group) => (
              <div
                key={group.groupId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 hover:border-cyan-500/50 transition-all shadow-2xs"
              >
                {/* Group Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 rounded-lg">
                        {group.anchorIssueCode}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                        {group.category}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs leading-snug">
                      Earliest Report: {group.anchorIssueTitle}
                    </h4>
                  </div>

                  <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-black px-2.5 py-1 rounded-xl shrink-0">
                    {group.memberCount} Reports ({group.redundantIssueCount}{" "}
                    Redundant)
                  </span>
                </div>

                {/* Group Details Summary */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{group.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Timespan: {group.timeSpanHours}h</span>
                  </div>
                </div>

                {/* Dynamic Match Metrics & Reasons */}
                <div className="space-y-2 p-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 rounded-xl text-[11px]">
                  <div className="flex items-center justify-between gap-2 flex-wrap font-bold">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-slate-900 dark:text-white font-extrabold">
                        Match Score: {group.bestDuplicateScore ?? 100}/100
                      </span>
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                        {group.duplicateLevel || "Possible Duplicate"}
                      </span>
                    </div>

                    {group.minimumDistanceMeters !== null &&
                    group.minimumDistanceMeters !== undefined ? (
                      <span className="text-slate-500">
                        Min Distance:{" "}
                        <strong className="text-slate-900 dark:text-white font-extrabold">
                          {group.minimumDistanceMeters}m
                        </strong>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">
                        Text/Category match
                      </span>
                    )}
                  </div>

                  {group.reasons && group.reasons.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {group.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status & Risk Badges */}
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
                  {group.activeMemberCount > 0 ? (
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                      {group.activeMemberCount} Active Members
                    </span>
                  ) : (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                      All Members Resolved
                    </span>
                  )}

                  {group.breachedMemberCount > 0 && (
                    <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-lg">
                      {group.breachedMemberCount} SLA Breached
                    </span>
                  )}

                  {group.escalatedMemberCount > 0 && (
                    <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-lg">
                      {group.escalatedMemberCount} Escalated
                    </span>
                  )}
                </div>

                {/* Members Preview */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400">
                    <span>CONNECTED REPORTS ({group.members.length})</span>
                    <span>REPORTED DATE</span>
                  </div>
                  {group.members.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-850/60 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-slate-500 shrink-0">
                          {m.code}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {m.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-semibold">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <p className="text-[10px] text-slate-400 font-bold text-center">
                      + {group.members.length - 3} more connected member reports
                    </p>
                  )}
                </div>

                {/* Group Action Button */}
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 dark:hover:bg-cyan-500 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Group Details ({group.memberCount} Members)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Trend Analyzer Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              City Issue Trend Analyzer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bucket-based timeline analysis across {rangeInfo.bucketType}s (
              {trends.labels.length} time buckets)
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 px-3 py-1 rounded-xl capitalize">
            Bucket: {rangeInfo.bucketType}
          </span>
        </div>

        {/* Multi-series chart table visualization */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                <th className="py-3 px-3">Period ({rangeInfo.bucketType})</th>
                <th className="py-3 px-3">Reported Volume</th>
                <th className="py-3 px-3">Resolved Volume</th>
                <th className="py-3 px-3">Duplicate Linked</th>
                <th className="py-3 px-3">Escalations</th>
                <th className="py-3 px-3">SLA Breaches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
              {trends.labels.map((label, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-extrabold text-slate-900 dark:text-white">
                    {label}
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-lg text-xs font-black">
                      {trends.issueVolume[idx]}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg text-xs font-black">
                      {trends.resolvedVolume[idx]}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-lg text-xs font-black">
                      {trends.duplicateLinkedVolume[idx]}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg text-xs font-black">
                      {trends.escalationVolume[idx]}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-lg text-xs font-black">
                      {trends.slaBreachVolume[idx]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Category & Department Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-500" />
            Category Performance
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {categoryAnalytics.map((cat) => (
              <div
                key={cat.category}
                className="py-3 flex items-center justify-between text-xs font-semibold"
              >
                <div className="space-y-0.5">
                  <span className="font-extrabold uppercase text-slate-900 dark:text-white block">
                    {cat.category}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {cat.activeIssues} active • {cat.duplicateLinkedIssues}{" "}
                    duplicates ({cat.duplicateRate}%)
                  </span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="font-black text-cyan-600 dark:text-cyan-400 text-sm block">
                    {cat.totalIssues} issues
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Avg Res: {cat.averageResolutionHours}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-500" />
            Department Workload & Unassigned Officers
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {departmentAnalytics.map((dept) => (
              <div
                key={dept.department}
                className="py-3 flex items-center justify-between text-xs font-semibold"
              >
                <div className="space-y-0.5">
                  <span className="font-extrabold uppercase text-slate-900 dark:text-white block">
                    {dept.department}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Unassigned: UO ({dept.unassignedUnitOfficerCount}), FO (
                    {dept.unassignedFieldOfficerCount})
                  </span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="font-black text-slate-900 dark:text-white text-sm block">
                    {dept.totalIssues} Total
                  </span>
                  <span className="text-[10px] text-amber-500 font-bold block">
                    {dept.activeIssues} Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Read-Only Group Details Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-xl">
                  Read-Only Duplicate Group
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Duplicate Cluster: {selectedGroup.anchorIssueTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedGroup.memberCount} connected reports • Earliest
                  report: {selectedGroup.anchorIssueCode} (
                  {new Date(selectedGroup.firstReportedAt).toLocaleString()})
                </p>
              </div>

              <button
                onClick={() => setSelectedGroup(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Read-Only Banner */}
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                This modal is read-only. Database modification actions (merge,
                link, delete) are prohibited.
              </span>
            </div>

            {/* Group Members List */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                CONNECTED MEMBER REPORTS ({selectedGroup.members.length})
              </h4>

              <div className="space-y-3">
                {selectedGroup.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800">
                          {member.code}
                        </span>
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          {member.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(member.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {member.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold uppercase text-slate-500">
                          {member.category}
                        </span>
                        <span>•</span>
                        <span className="capitalize font-bold text-amber-500">
                          {member.status}
                        </span>
                      </div>

                      {onSelectIssue && (
                        <button
                          onClick={() => {
                            setSelectedGroup(null);
                            onSelectIssue(member);
                          }}
                          className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          Open Issue Details{" "}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedGroup(null)}
                className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close Group Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
