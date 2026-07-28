import React, { useState, useMemo } from "react";
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
import { GoogleMap, useLoadScript, HeatmapLayer } from "@react-google-maps/api";
import CityAdminScopeHeader from "./CityAdminScopeHeader";

const CITY_CENTERS = {
  varanasi: { lat: 25.3176, lng: 82.9739 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  prayagraj: { lat: 25.4358, lng: 81.8463 },
};

export default function CityAdminOverview({
  overviewData,
  onSelectIssue,
  dateRange,
  onSetDateRange,
}) {
  const [heatmapFilter, setHeatmapFilter] = useState("category");
  const [showWardBoundaries, setShowWardBoundaries] = useState(true);

  if (!overviewData) return null;

  const {
    scope = {},
    summary = {},
    recentIssues = [],
    urgentIssues = [],
    recentEscalations = [],
    slaSnapshot = {},
    heatmapPoints = [],
    categoryDistribution = [],
    officerSnapshot = {},
    recentAdministrativeActivity = [],
  } = overviewData;

  const city = scope.city || "";
  const state = scope.state || "";
  const cityKey = city.toLowerCase().trim();
  const mapCenter =
    CITY_CENTERS[cityKey] ||
    (heatmapPoints[0]
      ? { lat: heatmapPoints[0].latitude, lng: heatmapPoints[0].longitude }
      : { lat: 25.3176, lng: 82.9739 });

  const libraries = ["visualization"];
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    version: "3.64",
    libraries,
  });

  const kpis = [
    {
      label: "Total Issues",
      value: summary.totalIssues,
      trend: "+12%",
      icon: FileText,
      color: "blue",
    },
    {
      label: "Active Issues",
      value: summary.activeIssues,
      trend: "+8%",
      icon: Activity,
      color: "purple",
    },
    {
      label: "Resolved",
      value: summary.resolvedIssues,
      trend: "+15%",
      icon: CheckCircle2,
      color: "emerald",
    },
    {
      label: "Closed",
      value: summary.closedIssues,
      trend: "+5%",
      icon: Target,
      color: "gray",
    },
    {
      label: "SLA Breached",
      value: summary.overdueIssues,
      trend: "-3%",
      icon: AlertTriangle,
      color: "red",
    },
    {
      label: "High Priority",
      value: summary.escalatedIssues,
      trend: "+2",
      icon: Zap,
      color: "orange",
    },
  ];

  const googleHeatmapPoints = useMemo(() => {
    if (!isLoaded || typeof window === "undefined" || !window.google) return [];
    return heatmapPoints.map((pt) => ({
      location: new window.google.maps.LatLng(pt.latitude, pt.longitude),
      weight: pt.priority === "critical" ? 3 : pt.priority === "high" ? 2 : 1,
    }));
  }, [heatmapPoints, isLoaded]);

  const mapContainerStyle = {
    width: "100%",
    height: "100%",
  };

  const handleReviewIssue = (issue) => {
    // Transform simple list issue into expected full detail object format
    onSelectIssue({
      ...issue,
      id: issue.id || issue._id,
      ticket_id: issue.code || issue.ticket_id,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Scope Header */}
      <CityAdminScopeHeader city={city} state={state} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
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
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    kpi.trend.startsWith("+")
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {kpi.trend.startsWith("+") ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {kpi.trend}
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {kpi.value}
              </p>
              <p className="text-sm text-slate-650 dark:text-slate-400 font-semibold">
                {kpi.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap & Categories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="group bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Heatmap Preview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                Issue hotspots in {city}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <select
              value={heatmapFilter}
              onChange={(e) => setHeatmapFilter(e.target.value)}
              className="px-4 py-2 text-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-sm"
            >
              <option value="category">By Category</option>
              <option value="priority">By Priority</option>
              <option value="status">By Status</option>
              <option value="sla">By SLA Risk</option>
            </select>

            <button
              onClick={() => setShowWardBoundaries(!showWardBoundaries)}
              className={`px-4 py-2 text-sm rounded-xl font-semibold transition-all shadow-sm ${
                showWardBoundaries
                  ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                  : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300"
              }`}
            >
              Ward Boundaries {showWardBoundaries ? "ON" : "OFF"}
            </button>
          </div>

          <div className="relative h-80 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl mb-6 overflow-hidden border border-slate-200 dark:border-slate-700">
            {!isLoaded ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800/50">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 font-medium text-xs">
                  Initializing Map Preview...
                </p>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={12}
                options={{
                  styles: [
                    {
                      featureType: "all",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#ffffff" }, { weight: "0.20" }],
                    },
                  ],
                  disableDefaultUI: true,
                }}
              >
                {googleHeatmapPoints.length > 0 && (
                  <HeatmapLayer data={googleHeatmapPoints} />
                )}
              </GoogleMap>
            )}
            <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                Intensity Scale
              </p>
              <div className="flex gap-1">
                {[
                  "#e0f2fe",
                  "#bae6fd",
                  "#7dd3fc",
                  "#38bdf8",
                  "#0284c7",
                  "#0369a1",
                ].map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-4 rounded-sm shadow-sm"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Performance Breakdown */}
        <div className="group bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl blur opacity-40"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Top Categories
              </h2>
              <p className="text-xs text-slate-505 dark:text-slate-400 font-semibold mt-0.5">
                Distribution of reports
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {categoryDistribution.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                className="group/item p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/10 dark:hover:to-blue-900/10 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 dark:text-white capitalize text-sm">
                    {item.category}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {item.count} issues
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                    style={{
                      width: `${(item.count / (summary.totalIssues || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
            {categoryDistribution.length === 0 && (
              <div className="text-center py-10 text-xs font-bold text-slate-400">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>

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
                    <span className="text-[10px] font-black tracking-wide bg-red-100 dark:bg-red-950/20 text-red-600 px-2 py-0.5 rounded">
                      {issue.code}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {issue.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-red-500 font-bold mt-1">
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
            <div className="text-center py-10 text-xs font-bold text-slate-450">
              No recent administrative actions recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
