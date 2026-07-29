"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CityAdminOverview from "../city-admin/CityAdminOverview";
import CityAdminAllIssues from "../city-admin/CityAdminAllIssues";
import {
  LayoutDashboard,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  BarChart3,
  FileText,
  Brain,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  UserCheck,
  Shield,
  Download,
  Eye,
  UserX,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  Zap,
  MapPinned,
  Layers,
  Target,
  Activity,
  Award,
  Timer,
  ArrowRight,
  ChevronRight,
  X,
  Play,
  Image as ImageIcon,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Loader2,
  Globe,
} from "lucide-react";
import {
  initializeCityAdminMockData,
  getCityAdminIssues,
  setCityAdminIssues,
  getCityAdminOfficers,
  setCityAdminOfficers,
  getCityAdminAuditLogs,
  addCityAdminAuditLog,
} from "@/lib/cityAdminMockData";
import { ModeToggle } from "../ModeToggle";
// import PublicDashboardModeration from './PublicDashboardModeration';
// import { CityCitizenGamificationSection } from './admin/CityCitizenGamificationSection';

export default function CityAdminDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const dbUser = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : "skip",
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);

  const rangeDays =
    dateRange === "today"
      ? 1
      : dateRange === "7d"
        ? 7
        : dateRange === "30d"
          ? 30
          : dateRange === "all"
            ? 0
            : 0;

  const overviewData = useQuery(
    api.cityAdmin.getCityAdminOverview,
    dbUser?._id && dbUser.role === "city_admin"
      ? { cityAdminUserId: dbUser._id, days: rangeDays }
      : "skip",
  );

  const isUserLoading =
    sessionStatus === "loading" || (session && dbUser === undefined);
  const isUnauthorized =
    sessionStatus === "unauthenticated" ||
    (dbUser && dbUser.role !== "city_admin");
  const isProfileMissing =
    dbUser && dbUser.role === "city_admin" && overviewData === null;
  const isOverviewLoading =
    dbUser && dbUser.role === "city_admin" && overviewData === undefined;
  const [heatmapFilter, setHeatmapFilter] = useState("category");
  const [showWardBoundaries, setShowWardBoundaries] = useState(true);
  const [officerTab, setOfficerTab] = useState("pending");

  const [issues, setIssues] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    initializeCityAdminMockData();
    loadData();
  }, [dateRange]);

  function loadData() {
    setLoading(true);
    try {
      loadIssues();
      loadOfficers();
      loadAuditLogs();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  function loadIssues() {
    const data = getCityAdminIssues();
    setIssues(data);
  }

  function loadOfficers() {
    const data = getCityAdminOfficers();
    setOfficers(data);
  }

  function loadAuditLogs() {
    const data = getCityAdminAuditLogs();
    setAuditLogs(data);
  }

  function handleApproveOfficer(officerId) {
    const officers = getCityAdminOfficers();
    const updatedOfficers = officers.map((officer) =>
      officer.id === officerId
        ? { ...officer, accountApproved: true }
        : officer,
    );
    setCityAdminOfficers(updatedOfficers);

    addCityAdminAuditLog({
      action: "Officer Approved",
      performed_by: "City Admin",
      performer_role: "admin",
      timestamp: new Date().toLocaleString(),
      affected_entity: officerId,
      notes: "Approved officer application",
    });

    loadOfficers();
    loadAuditLogs();
    alert("Officer approved successfully!");
  }

  function handleRejectOfficer(officerId) {
    const officers = getCityAdminOfficers();
    const updatedOfficers = officers.filter(
      (officer) => officer.id !== officerId,
    );
    setCityAdminOfficers(updatedOfficers);

    addCityAdminAuditLog({
      action: "Officer Rejected",
      performed_by: "City Admin",
      performer_role: "admin",
      timestamp: new Date().toLocaleString(),
      affected_entity: officerId,
      notes: "Rejected officer application",
    });

    loadOfficers();
    loadAuditLogs();
    alert("Officer rejected successfully!");
  }

  function handleEscalateIssue(issueId) {
    const allIssues = getCityAdminIssues();
    const updatedIssues = allIssues.map((issue) =>
      issue.id === issueId
        ? { ...issue, severity: "high", priority_score: 10.0 }
        : issue,
    );
    setCityAdminIssues(updatedIssues);

    addCityAdminAuditLog({
      action: "Issue Escalated",
      performed_by: "City Admin",
      performer_role: "admin",
      timestamp: new Date().toLocaleString(),
      affected_entity: issueId,
      notes: "Escalated issue to high priority",
    });

    loadIssues();
    loadAuditLogs();
    alert("Issue escalated successfully!");
  }

  function handleReassignIssue(issueId, officerId) {
    const allIssues = getCityAdminIssues();
    const updatedIssues = allIssues.map((issue) =>
      issue.id === issueId ? { ...issue, assigned_to: officerId } : issue,
    );
    setCityAdminIssues(updatedIssues);

    addCityAdminAuditLog({
      action: "Issue Reassigned",
      performed_by: "City Admin",
      performer_role: "admin",
      timestamp: new Date().toLocaleString(),
      affected_entity: issueId,
      notes: `Reassigned to officer ${officerId}`,
    });

    loadIssues();
    loadAuditLogs();
    alert("Issue reassigned successfully!");
  }

  function handleVerifyIssue(issueId) {
    const allIssues = getCityAdminIssues();
    const updatedIssues = allIssues.map((issue) =>
      issue.id === issueId ? { ...issue, status: "in_progress" } : issue,
    );
    setCityAdminIssues(updatedIssues);

    addCityAdminAuditLog({
      action: "Issue Verified",
      performed_by: "City Admin",
      performer_role: "admin",
      timestamp: new Date().toLocaleString(),
      affected_entity: issueId,
      notes: "Issue verified and marked as in progress",
    });

    loadIssues();
    loadAuditLogs();
    setSelectedIssue(null);
    alert("Issue verified successfully!");
  }

  function handleCloseIssue(issueId) {
    const allIssues = getCityAdminIssues();
    const updatedIssues = allIssues.map((issue) =>
      issue.id === issueId ? { ...issue, status: "resolved" } : issue,
    );
    setCityAdminIssues(updatedIssues);

    addCityAdminAuditLog({
      action: "Issue Closed",
      performed_by: "City Admin",
      performer_role: "admin",
      timestamp: new Date().toLocaleString(),
      affected_entity: issueId,
      notes: "Issue resolved and closed",
    });

    loadIssues();
    loadAuditLogs();
    setSelectedIssue(null);
    alert("Issue closed successfully!");
  }

  function handleMergeDuplicates(primaryId, duplicateIds) {
    const allIssues = getCityAdminIssues();
    const updatedIssues = allIssues.map((issue) =>
      duplicateIds.includes(issue.id)
        ? {
            ...issue,
            status: "resolved",
            description: `Merged with ${primaryId}`,
          }
        : issue,
    );
    setCityAdminIssues(updatedIssues);

    addCityAdminAuditLog({
      action: "Duplicates Merged",
      performed_by: "City Admin",
      performer_role: "admin",
      timestamp: new Date().toLocaleString(),
      affected_entity: primaryId,
      notes: `Merged ${duplicateIds.length} duplicate issues`,
    });

    loadIssues();
    loadAuditLogs();
    alert("Duplicates merged successfully!");
  }

  const filteredIssues = issues.filter((issue) => {
    if (filterStatus !== "all" && issue.status !== filterStatus) return false;
    if (filterCategory !== "all" && issue.category !== filterCategory)
      return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        issue.ticket_id?.toLowerCase().includes(query) ||
        issue.title?.toLowerCase().includes(query) ||
        issue.address?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getSLAStatus = (createdAt, status) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (status === "resolved") return "on_track";
    if (hoursElapsed > 72) return "breached";
    if (hoursElapsed > 48) return "at_risk";
    return "on_track";
  };

  const getTimeRemaining = (createdAt, status) => {
    const created = new Date(createdAt);
    const deadline = new Date(created.getTime() + 72 * 60 * 60 * 1000);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff < 0) {
      const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
      return `-${hours}h`;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const kpis = [
    {
      label: "Total Issues",
      value: issues.length,
      trend: "+12%",
      icon: FileText,
      color: "blue",
    },
    {
      label: "Active Issues",
      value: issues.filter((i) => ["pending", "in_progress"].includes(i.status))
        .length,
      trend: "+8%",
      icon: Activity,
      color: "purple",
    },
    {
      label: "Resolved",
      value: issues.filter((i) => i.status === "resolved").length,
      trend: "+15%",
      icon: CheckCircle2,
      color: "emerald",
    },
    {
      label: "Closed",
      value: issues.filter((i) => i.status === "resolved").length,
      trend: "+5%",
      icon: Target,
      color: "gray",
    },
    {
      label: "SLA Breached",
      value: issues.filter(
        (i) => getSLAStatus(i.created_at, i.status) === "breached",
      ).length,
      trend: "-3%",
      icon: AlertTriangle,
      color: "red",
    },
    {
      label: "High Priority",
      value: issues.filter((i) => i.severity === "high").length,
      trend: "+2",
      icon: Zap,
      color: "orange",
    },
  ];

  const categoryStats = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([category, count]) => ({ category, count }));

  const pendingOfficers = officers.filter((o) => !o.accountApproved);
  const activeOfficers = officers.filter((o) => o.accountApproved);

  const slaIssues = filteredIssues
    .filter((i) => getSLAStatus(i.created_at, i.status) !== "on_track")
    .slice(0, 10);

  const escalatedIssues = filteredIssues
    .filter((i) => i.severity === "high" && i.status !== "resolved")
    .slice(0, 5);

  const duplicateGroups = findDuplicates(filteredIssues);

  function findDuplicates(issues) {
    const groups = [];
    const processed = new Set();

    issues.forEach((issue, i) => {
      if (processed.has(issue.id)) return;

      const duplicates = [];
      issues.forEach((other, j) => {
        if (i === j || processed.has(other.id)) return;

        const similarity = calculateSimilarity(issue.title, other.title);
        if (similarity > 0.7) {
          duplicates.push({
            id: other.id,
            code: other.ticket_id,
            title: other.title,
            location: other.address,
            confidence: similarity,
          });
          processed.add(other.id);
        }
      });

      if (duplicates.length > 0) {
        groups.push({
          primary: {
            id: issue.id,
            code: issue.ticket_id,
            title: issue.title,
            location: issue.address,
          },
          duplicates,
        });
      }
    });

    return groups.slice(0, 3);
  }

  function calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    return intersection.size / Math.max(words1.size, words2.size);
  }

  const renderSidebar = () => (
    <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col z-50 shadow-2xl border-r border-slate-200 dark:border-white/10">
      <div className="p-8 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl blur-lg opacity-60 dark:opacity-40"></div>
            <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              CityCare
            </h1>
            <p className="text-xs text-cyan-600 dark:text-cyan-300/80 font-medium">
              Admin Dashboard
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
        {[
          {
            id: "overview",
            label: "Overview",
            icon: LayoutDashboard,
            gradient: "from-cyan-500 to-blue-500",
          },
          {
            id: "issues",
            label: "All Issues",
            icon: FileText,
            gradient: "from-blue-500 to-blue-600",
          },
          {
            id: "escalations",
            label: "Escalations",
            icon: AlertTriangle,
            gradient: "from-orange-500 to-red-500",
          },
          {
            id: "sla",
            label: "SLA Monitor",
            icon: Clock,
            gradient: "from-amber-500 to-orange-500",
          },
          {
            id: "duplicates",
            label: "Duplicates",
            icon: Copy,
            gradient: "from-teal-500 to-cyan-500",
          },
          {
            id: "heatmap",
            label: "Heatmap",
            icon: MapPin,
            gradient: "from-emerald-500 to-teal-500",
          },
          {
            id: "public-moderation",
            label: "Public Moderation",
            icon: Globe,
            gradient: "from-teal-500 to-emerald-500",
          },
          {
            id: "citizen-rewards",
            label: "Citizen Rewards",
            icon: Award,
            gradient: "from-amber-400 to-orange-500",
          },
          {
            id: "officers",
            label: "Officers",
            icon: Users,
            gradient: "from-blue-500 to-cyan-500",
          },
          {
            id: "departments",
            label: "Departments",
            icon: BarChart3,
            gradient: "from-violet-500 to-blue-500",
          },
          {
            id: "audit",
            label: "Audit Logs",
            icon: FileText,
            gradient: "from-slate-500 to-slate-600",
          },
          {
            id: "ai",
            label: "AI Insights",
            icon: Brain,
            gradient: "from-fuchsia-500 to-violet-500",
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
              activeTab === item.id
                ? "bg-cyan-50 dark:bg-white/10 shadow-lg shadow-cyan-500/10 dark:shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            {activeTab === item.id && (
              <div
                className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-5 dark:opacity-10`}
              ></div>
            )}
            <div
              className={`relative z-10 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                activeTab === item.id
                  ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                  : "bg-slate-100 dark:bg-white/5 group-hover:bg-slate-200 dark:group-hover:bg-white/10"
              }`}
            >
              <item.icon
                className={`w-4.5 h-4.5 ${activeTab === item.id ? "text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"}`}
              />
            </div>
            <span
              className={`relative z-10 text-sm font-semibold transition-colors duration-300 ${
                activeTab === item.id
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
              }`}
            >
              {item.label}
            </span>
            {activeTab === item.id && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-l-full"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-4 border border-cyan-500/20 dark:border-cyan-500/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Quick Stats
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Pending
              </span>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                {issues.filter((i) => i.status === "pending").length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                In Progress
              </span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {issues.filter((i) => i.status === "in_progress").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTopbar = () => (
    <div className="fixed left-72 right-0 top-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between px-8 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        {overviewData?.scope?.city && (
          <div className="flex items-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 border border-slate-200 dark:border-slate-650 px-4 py-2.5 rounded-xl text-xs font-black text-slate-750 dark:text-slate-200 shadow-sm">
            <Shield size={14} className="text-cyan-500 flex-shrink-0" />
            <span>
              Administrative Scope: {overviewData.scope.city},{" "}
              {overviewData.scope.state}
            </span>
          </div>
        )}

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2.5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-sm hover:shadow-md"
        >
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All</option>
        </select>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search issues, officers, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-4 py-2.5 w-96 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
        </button>

        <ModeToggle />

        <div className="flex items-center gap-3 pl-4 ml-2 border-l border-slate-200 dark:border-slate-700">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl blur opacity-40"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">CA</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              City Admin
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Administrator
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </div>
      </div>
    </div>
  );

  const renderKPIs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/20 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
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
            <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
              {kpi.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderHeatmapSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="group bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl blur opacity-40"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <MapPinned className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Heatmap
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Real-time density
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={heatmapFilter}
            onChange={(e) => setHeatmapFilter(e.target.value)}
            className="px-4 py-2 text-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-sm hover:shadow-md"
          >
            <option>By Category</option>
            <option>By Status</option>
            <option>By Severity</option>
            <option>By SLA Risk</option>
          </select>

          <button
            onClick={() => setShowWardBoundaries(!showWardBoundaries)}
            className={`px-4 py-2 text-sm rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
              showWardBoundaries
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300"
            }`}
          >
            Ward Boundaries {showWardBoundaries ? "ON" : "OFF"}
          </button>
        </div>

        <div className="relative h-80 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl mb-6 overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-20 h-20 text-slate-300 dark:text-slate-600" />
          </div>
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-3">
              Intensity Scale
            </p>
            <div className="flex gap-1.5">
              {[
                "#dcfce7",
                "#86efac",
                "#4ade80",
                "#22c55e",
                "#16a34a",
                "#15803d",
              ].map((color, i) => (
                <div
                  key={i}
                  className="w-7 h-5 rounded-md shadow-sm"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        <button className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl">
          View Ward Analytics
        </button>
      </div>

      <div className="group bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl blur opacity-40"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Top Categories
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Most reported issues
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {topCategories.map((item, idx) => (
            <div
              key={idx}
              className="group/item p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 rounded-2xl border border-slate-200 dark:border-slate-600 hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-md ${
                      idx === 0
                        ? "from-amber-400 to-orange-500"
                        : idx === 1
                          ? "from-cyan-400 to-blue-500"
                          : idx === 2
                            ? "from-emerald-400 to-teal-500"
                            : "from-slate-400 to-slate-500"
                    }`}
                  >
                    <span className="text-white text-sm font-black">
                      {idx + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white capitalize text-base">
                      {item.category}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Category Type
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {item.count}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    issues
                  </p>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 bg-gradient-to-r ${
                    idx === 0
                      ? "from-amber-400 to-orange-500"
                      : idx === 1
                        ? "from-cyan-400 to-blue-500"
                        : idx === 2
                          ? "from-emerald-400 to-teal-500"
                          : "from-slate-400 to-slate-500"
                  }`}
                  style={{ width: `${(item.count / issues.length) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-inner">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1.5">
                AI Insight
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                {topCategories[0]?.category} issues are trending. Consider
                allocating more resources to this department.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSLAMonitoring = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 mb-8 shadow-lg hover:shadow-2xl transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl blur opacity-40"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              SLA Monitor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Track compliance status
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 text-sm bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-sm hover:shadow-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="px-4 py-2 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : slaIssues.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-500">All issues are within SLA!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Issue Code
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Time Remaining
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  SLA Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {slaIssues.map((issue) => {
                const slaStatus = getSLAStatus(issue.created_at, issue.status);
                const timeRemaining = getTimeRemaining(
                  issue.created_at,
                  issue.status,
                );

                return (
                  <tr
                    key={issue.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                        {issue.ticket_id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {issue.title}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {issue.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-medium ${
                          timeRemaining.startsWith("-")
                            ? "text-red-600"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {timeRemaining}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          slaStatus === "on_track"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : slaStatus === "at_risk"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {slaStatus === "on_track"
                          ? "On Track"
                          : slaStatus === "at_risk"
                            ? "At Risk"
                            : "Breached"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEscalateIssue(issue.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-amber-600"
                          title="Escalate"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const officerId = prompt(
                              "Enter Officer ID to reassign:",
                            );
                            if (officerId)
                              handleReassignIssue(issue.id, officerId);
                          }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600"
                          title="Reassign"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderEscalations = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 mb-8 shadow-lg hover:shadow-2xl transition-all duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl blur opacity-40"></div>
          <div className="relative w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Escalated Issues
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
            High priority issues needing immediate attention
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : escalatedIssues.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-500">No escalated issues at the moment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {escalatedIssues.map((issue) => (
            <div
              key={issue.id}
              className="group p-6 bg-gradient-to-br from-orange-50 via-red-50 to-rose-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-rose-900/20 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 rounded-2xl hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono font-black text-orange-700 dark:text-orange-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg shadow-sm">
                      {issue.ticket_id}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-black rounded-lg shadow-md">
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {issue.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {issue.address}
                    </span>
                    <span className="flex items-center gap-1 capitalize">
                      <Activity className="w-3 h-3" />
                      {issue.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const officerId = prompt("Enter Officer ID to reassign:");
                    if (officerId) handleReassignIssue(issue.id, officerId);
                  }}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Reassign Officer
                </button>
                <button
                  onClick={() => handleVerifyIssue(issue.id)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => setSelectedIssue(issue)}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-medium rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDuplicateDetection = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Duplicate Detection Workbench
          </h2>
          <p className="text-sm text-gray-500">
            AI-powered duplicate detection to reduce field visits
          </p>
        </div>
        <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
          {duplicateGroups.length} Group
          {duplicateGroups.length !== 1 ? "s" : ""} Detected
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : duplicateGroups.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-500">No duplicate issues detected!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicateGroups.map((group, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">
                    PRIMARY
                  </span>
                  <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                    {group.primary.code}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {group.primary.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {group.primary.location}
                </p>
              </div>

              <div className="space-y-2 mb-3">
                {group.duplicates.map((dup, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                          {dup.code}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded">
                          {Math.round(dup.confidence * 100)}% Match
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {dup.title}
                      </p>
                      <p className="text-xs text-gray-500">{dup.location}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleMergeDuplicates(
                      group.primary.id,
                      group.duplicates.map((d) => d.id),
                    )
                  }
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Merge Issues
                </button>
                <button className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
                  Link as Duplicate
                </button>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg transition-colors">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOfficerManagement = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Officer Management & Approvals
      </h2>

      <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setOfficerTab("pending")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            officerTab === "pending"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Pending Approvals ({pendingOfficers.length})
        </button>
        <button
          onClick={() => setOfficerTab("active")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            officerTab === "active"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Active Officers ({activeOfficers.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : officerTab === "pending" ? (
        pendingOfficers.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-gray-500">No pending officer approvals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOfficers.map((officer) => (
              <div
                key={officer.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {officer.full_name}
                    </h3>
                    <p className="text-xs text-gray-500">{officer.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      officer.role === "ward_officer"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                    }`}
                  >
                    {officer.role === "ward_officer"
                      ? "Ward Officer"
                      : "Field Worker"}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="capitalize">
                      {officer.role.replace("_", " ")}
                    </span>
                  </div>
                  {officer.ward_zone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>Ward: {officer.ward_zone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Requested:{" "}
                      {new Date(officer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveOfficer(officer.id)}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectOfficer(officer.id)}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeOfficers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No active officers yet!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOfficers.map((officer) => (
            <div
              key={officer.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {officer.full_name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {officer.full_name}
                  </h3>
                  <p className="text-xs text-gray-500 capitalize">
                    {officer.role.replace("_", " ")}
                  </p>
                </div>
              </div>
              {officer.ward_zone && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Ward: {officer.ward_zone}
                </div>
              )}
              <button className="w-full py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-medium rounded-lg transition-colors">
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDepartmentPerformance = () => {
    const departmentData = issues.reduce((acc, issue) => {
      const dept = issue.category;
      if (!acc[dept]) {
        acc[dept] = {
          total: 0,
          resolved: 0,
          pending: 0,
          avgTime: 0,
        };
      }
      acc[dept].total++;
      if (issue.status === "resolved") acc[dept].resolved++;
      if (issue.status === "pending") acc[dept].pending++;
      return acc;
    }, {});

    const departments = Object.entries(departmentData).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      total: data.total,
      avgTime: "3.5 days",
      onTime: Math.round((data.resolved / data.total) * 100),
      reopenRate: 2.5,
      score: Math.round((data.resolved / data.total) * 100),
      color: "blue",
    }));

    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Department Performance Dashboard
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No department data available!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept, idx) => (
              <div
                key={idx}
                className="p-5 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {dept.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-500" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {dept.score}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Issues</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {dept.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Avg Time</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {dept.avgTime}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">On-Time Rate</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${dept.onTime}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {dept.onTime}%
                      </span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
                  View Department Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAuditLogs = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Audit Logs
        </h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-2">
            <Filter className="w-3 h-3" />
            Filter
          </button>
          <button className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg flex items-center gap-2">
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No audit logs available!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Action
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Performed By
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {log.performed_by}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full capitalize">
                      {log.performer_role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {log.timestamp}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {log.notes}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAIInsights = () => {
    const avgConfidence =
      issues
        .filter((i) => i.ai_confidence)
        .reduce((sum, i) => sum + (i.ai_confidence || 0), 0) /
      issues.filter((i) => i.ai_confidence).length;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              AI Insights & Predictions
            </h2>
            <p className="text-sm text-gray-500">
              Machine learning powered analytics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                AI Classification
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {avgConfidence ? `${(avgConfidence * 100).toFixed(1)}%` : "N/A"}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Avg. confidence score
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Total Issues
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {issues.length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Tracked by system
            </p>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                High Priority
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {issues.filter((i) => i.severity === "high").length}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Require attention
            </p>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Recommended Admin Actions
          </h3>
          <div className="space-y-2">
            {[
              "Review and approve pending officer applications",
              "Monitor SLA breached issues for immediate action",
              "Merge duplicate issues to optimize resources",
              `Focus on ${topCategories[0]?.category || "top"} category - highest volume`,
            ].map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-900 dark:text-white">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAllIssues = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          All Issues
        </h2>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="road">Road</option>
            <option value="waste">Waste</option>
            <option value="water">Water</option>
            <option value="lighting">Lighting</option>
            <option value="drainage">Drainage</option>
          </select>
          <button className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg">
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No issues found!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Code
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Severity
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.slice(0, 50).map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                      {issue.ticket_id}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {issue.title}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {issue.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full capitalize">
                      {issue.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        issue.severity === "high"
                          ? "bg-red-100 text-red-700"
                          : issue.severity === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderIssueDetailModal = () => {
    if (!selectedIssue) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedIssue.title}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedIssue.severity === "high"
                      ? "bg-red-100 text-red-700"
                      : selectedIssue.severity === "medium"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {selectedIssue.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-mono">
                {selectedIssue.ticket_id}
              </p>
            </div>
            <button
              onClick={() => setSelectedIssue(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {selectedIssue.category}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full capitalize">
                  {selectedIssue.status.replace("_", " ")}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Reporter</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedIssue.is_anonymous ? "Anonymous" : "Registered User"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(selectedIssue.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Description</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {selectedIssue.description}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Location</p>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {selectedIssue.address}
                  </span>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Open in Maps
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Admin Actions</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleVerifyIssue(selectedIssue.id)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleCloseIssue(selectedIssue.id)}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleEscalateIssue(selectedIssue.id)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg"
                >
                  Escalate
                </button>
                <button
                  onClick={() => {
                    const officerId = prompt("Enter Officer ID:");
                    if (officerId)
                      handleReassignIssue(selectedIssue.id, officerId);
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg"
                >
                  Reassign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {renderSidebar()}
        {renderTopbar()}

        <div className="ml-72 pt-20 p-8">
          {isUserLoading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <RefreshCw className="w-12 h-12 text-cyan-550 animate-spin" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Loading administrative profile...
              </p>
            </div>
          )}

          {isUnauthorized && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <AlertCircle size={48} className="text-red-500" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Unauthorized Access
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                You do not have permission to view the City Operations
                dashboard.
              </p>
            </div>
          )}

          {isProfileMissing && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <AlertCircle size={48} className="text-amber-500" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Profile Not Configured
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                Your City Admin profile has not been initialized. Please contact
                system support.
              </p>
            </div>
          )}

          {isOverviewLoading &&
            !isUserLoading &&
            !isUnauthorized &&
            !isProfileMissing && (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Compiling city operations overview...
                </p>
              </div>
            )}

          {!isUserLoading &&
            !isUnauthorized &&
            !isProfileMissing &&
            !isOverviewLoading && (
              <>
                {activeTab === "overview" && (
                  <CityAdminOverview
                    overviewData={overviewData}
                    onSelectIssue={setSelectedIssue}
                    dateRange={dateRange}
                    onSetDateRange={setDateRange}
                  />
                )}

                {activeTab === "issues" && dbUser?._id && (
                  <CityAdminAllIssues
                    cityAdminUserId={dbUser._id}
                    onSelectIssue={setSelectedIssue}
                  />
                )}
                {activeTab === "escalations" && renderEscalations()}
                {activeTab === "sla" && renderSLAMonitoring()}
                {activeTab === "duplicates" && renderDuplicateDetection()}
                {activeTab === "officers" && renderOfficerManagement()}
                {activeTab === "departments" && renderDepartmentPerformance()}
                {activeTab === "audit" && renderAuditLogs()}
                {activeTab === "ai" && renderAIInsights()}
                {activeTab === "heatmap" && renderHeatmapSection()}
              </>
            )}
        </div>

        {renderIssueDetailModal()}
      </div>
    </div>
  );
}
