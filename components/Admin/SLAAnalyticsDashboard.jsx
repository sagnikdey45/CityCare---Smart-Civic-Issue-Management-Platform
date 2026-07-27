import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  Activity,
  Award,
  Target,
  RefreshCw,
  MapPin,
  FileText,
  AlertCircle,
  TrendingDown,
  Layers,
  Shield,
  Eye,
  Trash2,
  FolderOpen,
} from "lucide-react";

export default function SLAAnalyticsDashboard({
  userId,
  issues = [],
  onViewIssue,
}) {
  const [selectedRange, setSelectedRange] = useState(30);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Call the Convex query reactively when filters change
  const analytics = useQuery(
    api.issueAnalytics.getSystemAdminCitywideTrendAnalytics,
    userId
      ? {
          userId,
          city: selectedCity === "all" ? undefined : selectedCity,
          department:
            selectedDepartment === "all" ? undefined : selectedDepartment,
          days: selectedRange === "all" ? 0 : selectedRange,
        }
      : "skip",
  );

  const loading = !analytics;

  const handleResetFilters = () => {
    setSelectedRange(30);
    setSelectedCity("all");
    setSelectedDepartment("all");
  };

  const handleReviewIssue = (issueId) => {
    const fullIssue = issues.find((i) => (i._id || i.id) === issueId);
    if (fullIssue) {
      onViewIssue(fullIssue);
    } else {
      alert("Issue details could not be resolved from local data.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Analysing citywide civic patterns...
        </p>
      </div>
    );
  }

  // Handle case where query returns successfully but user is unauthorized or error occurred
  if (!analytics || !analytics.summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <AlertCircle size={48} className="text-red-500" />
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          Unable to load citywide trend intelligence
        </h3>
        <p className="text-sm text-slate-500 max-w-md">
          Please verify your connection or refresh the session. Administrative
          authorization is required.
        </p>
      </div>
    );
  }

  const {
    scope = {},
    filters = {},
    summary = {},
    trendDirection = {},
    statusDistribution = [],
    priorityDistribution = [],
    cityBreakdown = [],
    departmentBreakdown = [],
    systemDuplicateTrend = {},
    hotspotTrends = [],
    systemSlaAnalytics = {},
    escalationAnalytics = {},
    recurringPatterns = [],
    recommendations = [],
  } = analytics;

  // Empty state check
  const hasNoData = summary.totalIssues === 0;

  // Safe Math Utilities for UI
  const safeNumber = (val, fallback = 0) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
  };

  const safePercentage = (val, tot) => {
    const v = safeNumber(val);
    const t = safeNumber(tot);
    if (t <= 0) return 0;
    const res = (v / t) * 100;
    return Number.isFinite(res)
      ? Math.max(0, Math.min(100, Math.round(res)))
      : 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl p-8 shadow-xl text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase backdrop-blur-md mb-3 border border-white/10">
              <Shield size={12} /> System Administrator Scope
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Citywide Trend Intelligence
            </h1>
            <p className="text-white/80 font-medium text-sm mt-1">
              System-wide civic operations, SLA risks, and emerging patterns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/25 active:scale-95 text-white text-xs font-black py-2.5 px-4 rounded-xl border border-white/15 backdrop-blur-md transition-all"
            >
              <RefreshCw size={14} /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-md flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Time range selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Time Range
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[
                { label: "7D", val: 7 },
                { label: "30D", val: 30 },
                { label: "90D", val: 90 },
                { label: "All", val: "all" },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={() => setSelectedRange(r.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedRange === r.val
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* City selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="all">All Cities</option>
              {(filters.availableCities || []).map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Department selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="all">All Departments</option>
              {(filters.availableDepartments || []).map((d) => (
                <option key={d} value={d} className="capitalize">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right text-[10px] font-bold text-slate-400 dark:text-slate-500">
          Last Analysed:{" "}
          {new Date(scope.generatedAt || Date.now()).toLocaleTimeString()}
        </div>
      </div>

      {hasNoData ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md">
          <FolderOpen size={64} className="text-slate-400 mb-4" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            No Citywide Trend Data for This Scope
          </h3>
          <p className="text-sm text-slate-500 max-w-md mt-1">
            No civic issues were found for the selected city, department and
            time range. Try changing the filters or selecting All Time.
          </p>
        </div>
      ) : (
        <>
          {/* Main Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Card 1: Issues Analysed */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-450 rounded-xl flex items-center justify-center">
                <FileText size={18} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Issues Analysed
              </p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                {summary.totalIssues}
              </h4>
              <p className="text-[10px] text-slate-450 truncate">
                In selected query parameters
              </p>
            </div>

            {/* Card 2: Reporting Change */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  trendDirection.direction === "up"
                    ? "bg-red-100 dark:bg-red-900/20 text-red-600"
                    : "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600"
                }`}
              >
                {trendDirection.direction === "up" ? (
                  <TrendingUp size={18} />
                ) : (
                  <TrendingDown size={18} />
                )}
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Reporting Change
              </p>
              <h4
                className={`text-xl font-black ${
                  trendDirection.direction === "up"
                    ? "text-red-500"
                    : "text-emerald-500"
                }`}
              >
                {trendDirection.changePercent > 0 ? "+" : ""}
                {trendDirection.changePercent}%
              </h4>
              <p className="text-[10px] text-slate-450 truncate">
                {trendDirection.direction === "up"
                  ? "Complaint volume increased"
                  : "Complaint volume decreased"}
              </p>
            </div>

            {/* Card 3: SLA Risk */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl flex items-center justify-center">
                <Clock size={18} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                SLA Overdue
              </p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                {systemSlaAnalytics.overdueCount}
              </h4>
              <p className="text-[10px] text-slate-450 truncate">
                {systemSlaAnalytics.dueSoonCount} due within 48h
              </p>
            </div>

            {/* Card 4: Active Hotspots */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 text-orange-605 rounded-xl flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Active Hotspots
              </p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                {summary.hotspotAreaCount}
              </h4>
              <p className="text-[10px] text-slate-450 truncate">
                {hotspotTrends.filter((h) => h.severity === "critical").length}{" "}
                critical hotspots
              </p>
            </div>

            {/* Card 5: Duplicate Patterns */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl flex items-center justify-center">
                <Layers size={18} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Duplicate Rate
              </p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                {systemDuplicateTrend.duplicateRate}%
              </h4>
              <p className="text-[10px] text-slate-450 truncate">
                {systemDuplicateTrend.totalGroups} distinct duplicate groups
              </p>
            </div>

            {/* Card 6: Escalated Issues */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-xl flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Escalations
              </p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                {summary.unresolvedEscalations}
              </h4>
              <p className="text-[10px] text-slate-450 truncate">
                Requires admin review
              </p>
            </div>
          </div>

          {/* System Risk Overview Banner */}
          <div
            className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md ${
              summary.systemRiskLevel === "critical"
                ? "bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/50"
                : summary.systemRiskLevel === "high"
                  ? "bg-orange-50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900/50"
                  : summary.systemRiskLevel === "medium"
                    ? "bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50"
                    : "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    summary.systemRiskLevel === "critical"
                      ? "bg-red-500"
                      : summary.systemRiskLevel === "high"
                        ? "bg-orange-500"
                        : summary.systemRiskLevel === "medium"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                  }`}
                ></span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize">
                  System Risk Level: {summary.systemRiskLevel} (
                  {summary.systemRiskScore}%)
                </h3>
              </div>
              <p className="text-sm text-slate-605 dark:text-slate-400 font-medium">
                Overall system operational vulnerability based on SLA delays,
                escalations, duplicates, and hotspots.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-700 dark:text-slate-350">
              <div className="bg-white/50 dark:bg-slate-800/40 px-3 py-2 rounded-xl">
                Most At-Risk City:{" "}
                <span className="font-extrabold capitalize text-slate-900 dark:text-white">
                  {summary.mostAtRiskCity}
                </span>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/40 px-3 py-2 rounded-xl">
                Most At-Risk Dept:{" "}
                <span className="font-extrabold capitalize text-slate-900 dark:text-white">
                  {summary.mostAtRiskDepartment}
                </span>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/40 px-3 py-2 rounded-xl">
                Overdue Rate:{" "}
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {systemSlaAnalytics.overdueRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Section: City & Department Risk Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* City Breakdown Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={20} className="text-blue-500" />
                  Citywide Performance Breakdown
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  Sorted by Risk Level
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-black tracking-wider uppercase">
                      <th className="pb-3 text-left">City</th>
                      <th className="pb-3 text-center">Issues</th>
                      <th className="pb-3 text-center">Active</th>
                      <th className="pb-3 text-center">Overdue</th>
                      <th className="pb-3 text-center">Escalated</th>
                      <th className="pb-3 text-center">SLA Compliance</th>
                      <th className="pb-3 text-center">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    {cityBreakdown.map((row) => (
                      <tr
                        key={row.city}
                        onClick={() => setSelectedCity(row.city)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-all ${
                          selectedCity === row.city
                            ? "bg-blue-50/50 dark:bg-blue-950/20"
                            : ""
                        }`}
                      >
                        <td className="py-4 capitalize font-extrabold text-slate-900 dark:text-white">
                          {row.city}
                        </td>
                        <td className="py-4 text-center">{row.totalIssues}</td>
                        <td className="py-4 text-center">{row.activeIssues}</td>
                        <td className="py-4 text-center text-red-500">
                          {row.overdueIssues}
                        </td>
                        <td className="py-4 text-center text-amber-500">
                          {row.escalatedIssues}
                        </td>
                        <td className="py-4 text-center">
                          {safePercentage(row.slaComplianceRate, 100)}%
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              row.riskLevel === "critical"
                                ? "bg-red-105 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                                : row.riskLevel === "high"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
                                  : row.riskLevel === "medium"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            }`}
                          >
                            {row.riskScore}% {row.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {cityBreakdown.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-8 text-center text-slate-450"
                        >
                          No city trend data is available for the selected
                          filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Department Breakdown Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers size={20} className="text-blue-500" />
                  Department Risk Breakdown
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  Sorted by Risk Level
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-black tracking-wider uppercase">
                      <th className="pb-3 text-left">Department</th>
                      <th className="pb-3 text-center">Issues</th>
                      <th className="pb-3 text-center">Active</th>
                      <th className="pb-3 text-center">Overdue</th>
                      <th className="pb-3 text-center">Escalated</th>
                      <th className="pb-3 text-center">SLA Compliance</th>
                      <th className="pb-3 text-center">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    {departmentBreakdown.map((row) => (
                      <tr
                        key={row.department}
                        onClick={() => setSelectedDepartment(row.department)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-all ${
                          selectedDepartment === row.department
                            ? "bg-blue-50/50 dark:bg-blue-950/20"
                            : ""
                        }`}
                      >
                        <td className="py-4 capitalize font-extrabold text-slate-900 dark:text-white">
                          {row.department}
                        </td>
                        <td className="py-4 text-center">{row.totalIssues}</td>
                        <td className="py-4 text-center">{row.activeIssues}</td>
                        <td className="py-4 text-center text-red-500">
                          {row.overdueIssues}
                        </td>
                        <td className="py-4 text-center text-amber-500">
                          {row.escalatedIssues}
                        </td>
                        <td className="py-4 text-center">
                          {safePercentage(row.slaComplianceRate, 100)}%
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              row.riskLevel === "critical"
                                ? "bg-red-105 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                                : row.riskLevel === "high"
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
                                  : row.riskLevel === "medium"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                            }`}
                          >
                            {row.riskScore}% {row.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {departmentBreakdown.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-8 text-center text-slate-450"
                        >
                          No department trend data is available for the selected
                          filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SLA Intelligence Details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={20} className="text-blue-500" />
              SLA Analytics & Violations
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                  SLA Applicable
                </p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  {systemSlaAnalytics.applicableIssueCount}
                </h4>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                  Compliance Rate
                </p>
                <h4 className="text-2xl font-black text-emerald-500">
                  {safePercentage(systemSlaAnalytics.complianceRate, 100)}%
                </h4>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                  Active Overdue
                </p>
                <h4 className="text-2xl font-black text-red-500">
                  {systemSlaAnalytics.overdueCount}
                </h4>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                  Average Delay
                </p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  {systemSlaAnalytics.avgDelayHours}h
                </h4>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                  Max Delay
                </p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  {systemSlaAnalytics.maximumDelayHours}h
                </h4>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                  SLA Not Set
                </p>
                <h4 className="text-2xl font-black text-slate-500">
                  {systemSlaAnalytics.notSetCount}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SLA Breaches List */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Oldest Overdue Complaints
                </h4>
                <div className="space-y-3">
                  {(systemSlaAnalytics.oldestOverdueIssues || []).map(
                    (issue) => (
                      <div
                        key={issue.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black tracking-wide bg-red-100 dark:bg-red-950/20 text-red-605 px-2 py-0.5 rounded">
                              {issue.code}
                            </span>
                            <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {issue.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 capitalize">
                            {issue.category} • {issue.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-red-500 whitespace-nowrap">
                            {issue.delayHours}h overdue
                          </span>
                          <button
                            onClick={() => handleReviewIssue(issue.id)}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-all"
                            title="Review Issue"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                  {(!systemSlaAnalytics.oldestOverdueIssues ||
                    systemSlaAnalytics.oldestOverdueIssues.length === 0) && (
                    <div className="text-center py-6 text-xs font-bold text-slate-450">
                      No overdue issues in this scope
                    </div>
                  )}
                </div>
              </div>

              {/* SLA Breaches Category distribution */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Breaches by Department
                </h4>
                <div className="space-y-3">
                  {(systemSlaAnalytics.breachByDepartment || []).map((d) => {
                    const maxVal = Math.max(
                      1,
                      ...(systemSlaAnalytics.breachByDepartment || []).map(
                        (x) => x.count,
                      ),
                    );
                    const percent = Math.max(
                      0,
                      Math.min(100, (d.count / maxVal) * 100),
                    );

                    return (
                      <div key={d.department} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="capitalize text-slate-900 dark:text-white">
                            {d.department}
                          </span>
                          <span className="text-red-500 font-extrabold">
                            {d.count} breaches
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-red-500 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  {(!systemSlaAnalytics.breachByDepartment ||
                    systemSlaAnalytics.breachByDepartment.length === 0) && (
                    <div className="text-center py-6 text-xs font-bold text-slate-450">
                      No SLA violations recorded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Citywide Duplicate Patterns & Hotspots */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Duplicate Patterns */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers size={20} className="text-blue-500" />
                  Citywide Duplicate Patterns
                </h3>
                <p className="text-xs text-slate-505 mt-1 font-medium">
                  Active duplicate groupings evaluated citywide. Out of{" "}
                  <span className="font-extrabold text-blue-500">
                    {systemDuplicateTrend.activeDuplicateCandidateCount}
                  </span>{" "}
                  active issues checked,{" "}
                  <span className="font-extrabold text-blue-500">
                    {systemDuplicateTrend.duplicateGroupIssueCount}
                  </span>{" "}
                  are part of duplicate groups.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl text-center">
                  <p className="text-[9px] font-black text-slate-455 uppercase tracking-wider">
                    Total Groups
                  </p>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {systemDuplicateTrend.totalGroups}
                  </h4>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl text-center">
                  <p className="text-[9px] font-black text-slate-455 uppercase tracking-wider">
                    Redundant Issues
                  </p>
                  <h4 className="text-lg font-black text-red-500 mt-0.5">
                    {systemDuplicateTrend.redundantDuplicateIssues}
                  </h4>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl text-center">
                  <p className="text-[9px] font-black text-slate-455 uppercase tracking-wider">
                    Strongest Match
                  </p>
                  <h4 className="text-lg font-black text-purple-500 mt-0.5">
                    {systemDuplicateTrend.strongestGroupScore}%
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Recent Duplicate Groups
                </h4>
                {(systemDuplicateTrend.recentDuplicateGroups || []).map(
                  (group) => (
                    <div
                      key={group.groupId}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black tracking-wide bg-purple-100 dark:bg-purple-950/20 text-purple-650 px-2 py-0.5 rounded uppercase">
                            {group.category}
                          </span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {group.issueCount} complaints in group
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {group.redundantIssueCount} redundant reports
                          submitted
                        </p>
                      </div>
                      <span className="text-xs font-black text-purple-500">
                        {group.bestScore}% Match
                      </span>
                    </div>
                  ),
                )}
                {(!systemDuplicateTrend.recentDuplicateGroups ||
                  systemDuplicateTrend.recentDuplicateGroups.length === 0) && (
                  <div className="text-center py-6 text-xs font-bold text-slate-450">
                    No active duplicate groups found
                  </div>
                )}
              </div>
            </div>

            {/* Hotspots Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin size={20} className="text-blue-500" />
                Geographical Hotspots
              </h3>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {(hotspotTrends || []).map((hotspot) => (
                  <div
                    key={hotspot.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-800 flex items-center justify-between gap-4 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer transition-all"
                    onClick={() =>
                      hotspot.city && setSelectedCity(hotspot.city)
                    }
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black tracking-wide px-2 py-0.5 rounded uppercase ${
                            hotspot.severity === "critical"
                              ? "bg-red-105 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                              : hotspot.severity === "high"
                                ? "bg-orange-105 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                          }`}
                        >
                          {hotspot.severity}
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {hotspot.approximateAddress}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-455 capitalize truncate">
                        {hotspot.city} • Main Category:{" "}
                        {hotspot.categories[0] || "Other"}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {hotspot.issueCount} total
                      </div>
                      <div className="text-[10px] text-slate-455 font-bold">
                        {hotspot.unresolvedCount} unresolved
                      </div>
                    </div>
                  </div>
                ))}
                {(hotspotTrends || []).length === 0 && (
                  <div className="text-center py-10">
                    <Award
                      size={48}
                      className="mx-auto text-emerald-500 mb-2"
                    />
                    <p className="text-xs font-bold text-slate-450">
                      No active geo hotspots found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Escalations intelligence */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle size={20} className="text-blue-500" />
                Escalations Requiring Intervention
              </h3>
              <span className="text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded">
                {escalationAnalytics.unresolvedEscalations} unresolved
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-black text-slate-455 uppercase tracking-wider">
                  Total Escalated
                </p>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  {escalationAnalytics.totalEscalatedIssues}
                </h4>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-black text-slate-455 uppercase tracking-wider">
                  Escalation Rate
                </p>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  {escalationAnalytics.escalationRate}%
                </h4>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-black text-slate-455 uppercase tracking-wider">
                  Unresolved
                </p>
                <h4 className="text-xl font-black text-red-500">
                  {escalationAnalytics.unresolvedEscalations}
                </h4>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] font-black text-slate-455 uppercase tracking-wider">
                  Avg Escalations
                </p>
                <h4 className="text-xl font-black text-slate-900 dark:text-white">
                  {escalationAnalytics.averageEscalationCount}
                </h4>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Oldest Unresolved Escalated Issues
              </h4>
              {(escalationAnalytics.oldestUnresolvedEscalations || []).map(
                (issue) => (
                  <div
                    key={issue.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black tracking-wide bg-amber-100 dark:bg-amber-950/20 text-amber-600 px-2 py-0.5 rounded">
                          {issue.code}
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {issue.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {issue.category} • {issue.city} • Escalated:{" "}
                        {new Date(issue.escalatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReviewIssue(issue.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 text-xs font-black rounded-lg transition-all"
                    >
                      <Eye size={14} /> Review Issue
                    </button>
                  </div>
                ),
              )}
              {(!escalationAnalytics.oldestUnresolvedEscalations ||
                escalationAnalytics.oldestUnresolvedEscalations.length ===
                  0) && (
                <div className="text-center py-6 text-xs font-bold text-slate-450">
                  No pending escalations requiring attention
                </div>
              )}
            </div>
          </div>

          {/* Section: Recurring Civic Patterns */}
          {recurringPatterns.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={20} className="text-blue-500" />
                Recurring Civic Infrastructure Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recurringPatterns.slice(0, 4).map((p) => (
                  <div
                    key={p.patternId}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-150 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black tracking-wide bg-blue-100 dark:bg-blue-950/20 text-blue-600 px-2 py-0.5 rounded uppercase">
                        {p.category} • {p.subcategory}
                      </span>
                      <span
                        className={`text-[9px] font-black tracking-wide px-2 py-0.5 rounded uppercase ${
                          p.recurrenceStrength === "strong"
                            ? "bg-red-105 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                        }`}
                      >
                        {p.recurrenceStrength} strength
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {p.locationLabel}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {p.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Administrative Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={20} className="text-blue-500" />
              Administrative Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between gap-4 ${
                    rec.severity === "critical"
                      ? "bg-red-50/50 dark:bg-red-950/5 border-red-200 dark:border-red-900/40"
                      : rec.severity === "high"
                        ? "bg-orange-50/50 dark:bg-orange-950/5 border-orange-200 dark:border-orange-900/40"
                        : rec.severity === "medium"
                          ? "bg-amber-50/50 dark:bg-amber-950/5 border-amber-200 dark:border-amber-900/40"
                          : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {rec.title}
                      </h4>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          rec.severity === "critical"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/20"
                            : rec.severity === "high"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-950/20"
                              : rec.severity === "medium"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/20"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800"
                        }`}
                      >
                        {rec.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {rec.message}
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Suggested Actions:
                    </h5>
                    <ul className="text-xs font-bold text-slate-750 dark:text-slate-300 list-disc list-inside space-y-1">
                      {rec.suggestedActions.map((action, aIdx) => (
                        <li key={aIdx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
