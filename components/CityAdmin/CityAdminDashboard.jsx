"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CityAdminOverview from "../city-admin/CityAdminOverview";
import CityAdminAllIssues from "../city-admin/CityAdminAllIssues";
import CityAdminSLAMonitor from "../city-admin/CityAdminSLAMonitor";
import CityIssueAnalytics from "../city-admin/CityIssueAnalytics";
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
  Building2,
  Phone,
  Mail,
  User,
  CheckSquare,
  Info,
  Star,
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

// Safe helper functions for City Admin issue detail modal
function formatLabel(value, fallback = "N/A") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value, fallback = "N/A") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDate(value, fallback = "N/A") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getOfficerDisplayName(officer, fallback = "Unassigned") {
  if (!officer) return fallback;
  if (typeof officer === "string") return officer;
  return officer.name ?? officer.fullName ?? officer.email ?? fallback;
}

function getReporterDetails(issue) {
  const isAnonymous =
    issue?.isAnonymous === true || issue?.is_anonymous === true;
  if (isAnonymous) {
    return {
      name: "Anonymous Citizen",
      email: null,
      phone: null,
      anonymous: true,
    };
  }

  const reporter =
    issue?.reporterDetails ??
    issue?.reporter ??
    issue?.citizen ??
    issue?.citizenDetails ??
    null;
  return {
    name:
      reporter?.fullName ??
      reporter?.name ??
      issue?.reporterName ??
      issue?.citizenName ??
      "Registered Citizen",
    email:
      reporter?.email ?? issue?.reporterEmail ?? issue?.citizenEmail ?? null,
    phone:
      reporter?.phone ?? issue?.reporterPhone ?? issue?.citizenPhone ?? null,
    anonymous: false,
  };
}

function getPriorityBadgeClass(priority) {
  switch (String(priority).toLowerCase()) {
    case "critical":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "low":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    default:
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30";
  }
}

function getStatusBadgeClass(status) {
  switch (String(status).toLowerCase()) {
    case "resolved":
    case "closed":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "rejected":
    case "withdrawn":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30";
    case "escalated":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30";
    case "in_progress":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
    case "pending_uo_verification":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30";
    case "rework_required":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
    case "reopened":
      return "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/30";
    case "verified":
    case "assigned":
      return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30";
    default:
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30";
  }
}

function getIssueSlaState(issue) {
  const terminalStatuses = new Set([
    "resolved",
    "closed",
    "rejected",
    "withdrawn",
  ]);
  const currentStatus = String(issue?.status ?? "").toLowerCase();

  if (terminalStatuses.has(currentStatus)) {
    return { key: "completed", label: "Completed", hoursRemaining: null };
  }

  if (issue?.slaBreached === true || issue?.sla?.status === "breached") {
    return { key: "breached", label: "SLA Breached", hoursRemaining: null };
  }

  const deadline =
    issue?.slaDeadline ?? issue?.sla?.deadline ?? issue?.sla_deadline ?? null;
  if (!deadline) {
    return {
      key: "no_deadline",
      label: "No SLA Deadline",
      hoursRemaining: null,
    };
  }

  const deadlineTime = new Date(deadline).getTime();
  if (!Number.isFinite(deadlineTime)) {
    return {
      key: "no_deadline",
      label: "Invalid SLA Deadline",
      hoursRemaining: null,
    };
  }

  const difference = deadlineTime - Date.now();
  const hoursRemaining = Math.round(difference / (1000 * 60 * 60));

  if (difference < 0) {
    return { key: "breached", label: "SLA Breached", hoursRemaining };
  }
  if (difference <= 24 * 60 * 60 * 1000) {
    return { key: "due_soon", label: "Due Soon", hoursRemaining };
  }
  if (difference <= 48 * 60 * 60 * 1000) {
    return { key: "at_risk", label: "At Risk", hoursRemaining };
  }

  return { key: "on_track", label: "On Track", hoursRemaining };
}

export default function CityAdminDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const dbUser = useQuery(
    api.users.getUserByEmail,
    session?.user?.email ? { email: session.user.email } : "skip",
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  const selectedIssueDetails = useQuery(
    api.cityAdmin.getCityIssueDetails,
    dbUser?._id && selectedIssueId
      ? { cityAdminUserId: dbUser._id, issueId: selectedIssueId }
      : "skip",
  );

  const handleSelectIssue = (issue) => {
    if (!issue) return;
    const issueId = issue._id ?? issue.id ?? null;
    setSelectedIssue(issue);
    if (issueId && typeof issueId === "string" && issueId.length > 5) {
      setSelectedIssueId(issueId);
    } else {
      setSelectedIssueId(null);
    }
  };

  useEffect(() => {
    if (!selectedIssue && !selectedIssueId) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedIssue(null);
        setSelectedIssueId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedIssue, selectedIssueId]);

  const rangeDays =
    dateRange === "today"
      ? 1
      : dateRange === "7d"
        ? 7
        : dateRange === "30d"
          ? 30
          : dateRange === "90d"
            ? 90
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
        ? { ...issue, priority: "high", priority_score: 10.0 }
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
    .filter((i) => i.priority === "high" && i.status !== "resolved")
    .slice(0, 5);

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
            id: "sla",
            label: "SLA & Escalations",
            icon: Clock,
            gradient: "from-amber-500 to-orange-500",
          },
          {
            id: "city-analytics",
            label: "City Issue Analytics",
            icon: BarChart3,
            gradient: "from-teal-500 to-cyan-500",
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

        <button
          onClick={() =>
            signOut({ redirect: true, callbackUrl: "/staff/sign-in" })
          }
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 dark:bg-red-500/5 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30 rounded-xl text-sm font-bold transition-all duration-300"
        >
          <LogOut size={16} />
          Sign Out
        </button>
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
          <option value="90d">Last 90 Days</option>
          <option value="all">All Time</option>
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

  const renderSLAMonitoring = () => (
    <CityAdminSLAMonitor
      cityAdminUserId={dbUser._id}
      onViewIssue={setSelectedIssue}
    />
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
              {issues.filter((i) => i.priority === "high").length}
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
                  priority
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
                  onClick={() => handleSelectIssue(issue)}
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
                        issue.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : issue.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {issue.priority}
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
    if (!selectedIssue && !selectedIssueId) return null;

    const isLoadingDetails =
      selectedIssueId && selectedIssueDetails === undefined && !selectedIssue;
    const isErrorDetails =
      selectedIssueId && selectedIssueDetails === null && !selectedIssue;

    const activeIssue = selectedIssueDetails || selectedIssue;

    if (isLoadingDetails) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <RefreshCw className="w-10 h-10 text-cyan-500 animate-spin mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Loading Issue Details...
            </h3>
            <p className="text-xs text-slate-500">
              Fetching administrative records from Convex database.
            </p>
          </div>
        </div>
      );
    }

    if (isErrorDetails || !activeIssue) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Issue Unavailable
            </h3>
            <p className="text-xs text-slate-500">
              Issue details are unavailable or outside your administrative city
              scope.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedIssue(null);
                setSelectedIssueId(null);
              }}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    const issueCode =
      activeIssue?.issueCode ??
      activeIssue?.code ??
      activeIssue?.ticket_id ??
      "Issue Code Unavailable";
    const title = activeIssue?.title ?? "Untitled Issue";
    const description =
      activeIssue?.description ?? "No description was provided for this issue.";
    const category = activeIssue?.category ?? "other";
    const department =
      activeIssue?.department ?? activeIssue?.category ?? "unassigned";
    const priority = String(
      activeIssue?.priority ?? activeIssue?.severity ?? "medium",
    ).toLowerCase();
    const status = String(activeIssue?.status ?? "unknown").toLowerCase();
    const address =
      activeIssue?.address ?? activeIssue?.location ?? "Location unavailable";
    const createdAt =
      activeIssue?.createdAt ??
      activeIssue?.created_at ??
      activeIssue?._creationTime ??
      null;
    const updatedAt = activeIssue?.updatedAt ?? activeIssue?.updated_at ?? null;

    const subcategories = Array.isArray(activeIssue?.subcategory)
      ? activeIssue.subcategory
      : activeIssue?.subcategory
        ? [activeIssue.subcategory]
        : Array.isArray(activeIssue?.subCategories)
          ? activeIssue.subCategories
          : [];
    const tags = Array.isArray(activeIssue?.tags) ? activeIssue.tags : [];

    const latitude = Number(
      activeIssue?.latitude ?? activeIssue?.coordinates?.latitude,
    );
    const longitude = Number(
      activeIssue?.longitude ?? activeIssue?.coordinates?.longitude,
    );
    const hasValidCoordinates =
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

    const reporter = getReporterDetails(activeIssue);

    const unitOfficer =
      activeIssue?.unitOfficerDetails ??
      activeIssue?.assignedUnitOfficerDetails ??
      activeIssue?.assignedUnitOfficer ??
      null;
    const fieldOfficer =
      activeIssue?.fieldOfficerDetails ??
      activeIssue?.assignedFieldOfficerDetails ??
      activeIssue?.assignedFieldOfficer ??
      null;

    const slaState = getIssueSlaState(activeIssue);

    const escalation = activeIssue?.escalation ?? null;
    const isEscalated =
      activeIssue?.escalatedToAdmin === true ||
      activeIssue?.is_escalated === true ||
      status === "escalated" ||
      Boolean(escalation);

    const possibleDuplicateIds = Array.isArray(
      activeIssue?.possibleDuplicateIds,
    )
      ? activeIssue.possibleDuplicateIds
      : [];
    const isDuplicateLinked =
      possibleDuplicateIds.length > 0 ||
      activeIssue?.duplicateGroupId ||
      activeIssue?.duplicateScore ||
      activeIssue?.duplicateConfidence ||
      activeIssue?.bestDuplicateScore;

    const rejection = activeIssue?.rejection ?? null;
    const hasRejection = Boolean(rejection || activeIssue?.rejectionReason);

    const resolvedAt = activeIssue?.resolvedAt ?? activeIssue?.closedAt ?? null;
    const hasResolution = Boolean(
      resolvedAt ||
        activeIssue?.citizenRating ||
        activeIssue?.resolutionSummary,
    );

    const evidenceUrls = [
      ...(Array.isArray(activeIssue?.images) ? activeIssue.images : []),
      ...(Array.isArray(activeIssue?.attachments)
        ? activeIssue.attachments
        : []),
      ...(Array.isArray(activeIssue?.beforePhotos)
        ? activeIssue.beforePhotos
        : []),
      ...(Array.isArray(activeIssue?.afterPhotos)
        ? activeIssue.afterPhotos
        : []),
      ...(Array.isArray(activeIssue?.resolutionImages)
        ? activeIssue.resolutionImages
        : []),
    ].filter(Boolean);

    const timelineEvents = [];
    if (createdAt)
      timelineEvents.push({ label: "Reported", timestamp: createdAt });
    if (activeIssue?.verifiedAt)
      timelineEvents.push({
        label: "Verified",
        timestamp: activeIssue.verifiedAt,
      });
    if (activeIssue?.assignedAt)
      timelineEvents.push({
        label: "Assigned",
        timestamp: activeIssue.assignedAt,
      });
    if (activeIssue?.workStartedAt)
      timelineEvents.push({
        label: "Work Started",
        timestamp: activeIssue.workStartedAt,
      });
    if (escalation?.escalatedAt || activeIssue?.escalatedAt)
      timelineEvents.push({
        label: "Escalated",
        timestamp: escalation?.escalatedAt || activeIssue?.escalatedAt,
      });
    if (resolvedAt)
      timelineEvents.push({ label: "Resolved", timestamp: resolvedAt });
    if (activeIssue?.closedAt)
      timelineEvents.push({ label: "Closed", timestamp: activeIssue.closedAt });
    if (activeIssue?.reopenedAt)
      timelineEvents.push({
        label: "Reopened",
        timestamp: activeIssue.reopenedAt,
      });
    if (updatedAt && updatedAt !== createdAt)
      timelineEvents.push({ label: "Last Updated", timestamp: updatedAt });

    timelineEvents.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-admin-issue-modal-title"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setSelectedIssue(null);
            setSelectedIssueId(null);
          }
        }}
      >
        <div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          {/* Header */}
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 rounded-lg">
                    CITY ISSUE DETAILS
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {issueCode}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${getPriorityBadgeClass(priority)}`}
                  >
                    {formatLabel(priority, "Medium")}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black ${getStatusBadgeClass(status)}`}
                  >
                    {formatLabel(status, "Unknown")}
                  </span>
                </div>

                <h2
                  id="city-admin-issue-modal-title"
                  className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate tracking-tight"
                >
                  {title}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close issue details"
                onClick={() => {
                  setSelectedIssue(null);
                  setSelectedIssueId(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* Left Column (2/3) */}
              <div className="space-y-6 xl:col-span-2">
                {/* Description & Classification */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-black uppercase tracking-wider text-[10px]">
                      Description & Classification
                    </span>
                    <span>Reported {formatDate(createdAt)}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {description}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400">
                      Category:
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 capitalize">
                      {formatLabel(category)}
                    </span>

                    <span className="text-[10px] font-bold text-slate-400 ml-2">
                      Department:
                    </span>
                    <span className="bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 text-xs font-bold px-2.5 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800 capitalize">
                      {formatLabel(department)}
                    </span>
                  </div>

                  {subcategories.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">
                        Subcategories:
                      </span>
                      {subcategories.map((sub, i) => (
                        <span
                          key={i}
                          className="bg-slate-50 dark:bg-slate-850/60 text-slate-600 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-800"
                        >
                          {formatLabel(sub)}
                        </span>
                      ))}
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">
                        Tags:
                      </span>
                      {tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location Information */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Location Details
                      </h3>
                    </div>

                    {hasValidCoordinates && (
                      <button
                        type="button"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps?q=${latitude},${longitude}`,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                        className="text-cyan-600 dark:text-cyan-400 hover:underline text-xs font-bold inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in Maps
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {address}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] text-slate-400">
                        City
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatLabel(
                          activeIssue?.city || activeIssue?.scope?.city,
                          "N/A",
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">
                        State
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatLabel(
                          activeIssue?.state || activeIssue?.scope?.state,
                          "N/A",
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">
                        Latitude
                      </span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {Number.isFinite(latitude)
                          ? latitude.toFixed(5)
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">
                        Longitude
                      </span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {Number.isFinite(longitude)
                          ? longitude.toFixed(5)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Officer Assignment */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Officer Assignment
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Unit Officer */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">
                        Unit Officer
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {getOfficerDisplayName(unitOfficer)}
                      </p>
                      {typeof unitOfficer === "object" &&
                        unitOfficer?.email && (
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {unitOfficer.email}
                          </p>
                        )}
                      {typeof unitOfficer === "object" &&
                        unitOfficer?.phone && (
                          <p className="text-[11px] text-slate-500 font-medium">
                            {unitOfficer.phone}
                          </p>
                        )}
                    </div>

                    {/* Field Officer */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-850/60 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                        Field Officer
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {getOfficerDisplayName(fieldOfficer)}
                      </p>
                      {typeof fieldOfficer === "object" &&
                        fieldOfficer?.email && (
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {fieldOfficer.email}
                          </p>
                        )}
                      {typeof fieldOfficer === "object" &&
                        fieldOfficer?.phone && (
                          <p className="text-[11px] text-slate-500 font-medium">
                            {fieldOfficer.phone}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Escalation Details */}
                {isEscalated && (
                  <div className="p-5 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        Escalation Record
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          Review Status
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white capitalize">
                          {formatLabel(
                            escalation?.adminReviewStatus ||
                              activeIssue?.escalation_admin_review_status ||
                              "pending_review",
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          Escalation Category
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white capitalize">
                          {formatLabel(
                            escalation?.category ||
                              activeIssue?.escalation_category ||
                              "SLA Breach",
                          )}
                        </span>
                      </div>
                    </div>

                    {(escalation?.reason ||
                      activeIssue?.escalation_reason ||
                      escalation?.comments) && (
                      <div className="pt-2 border-t border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                          Escalation Reason / Notes
                        </span>
                        <p className="font-medium">
                          {escalation?.reason ||
                            activeIssue?.escalation_reason ||
                            escalation?.comments}
                        </p>
                      </div>
                    )}

                    {(escalation?.resolutionNote ||
                      activeIssue?.escalation_resolution_notes) && (
                      <div className="pt-2 border-t border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                          Resolution Notes
                        </span>
                        <p className="font-medium">
                          {escalation?.resolutionNote ||
                            activeIssue?.escalation_resolution_notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Duplicate Context */}
                {isDuplicateLinked && (
                  <div className="p-5 bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/30 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Copy className="w-4 h-4 text-purple-500" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-purple-800 dark:text-purple-300">
                          Duplicate Context
                        </h3>
                      </div>
                      <span className="text-[10px] font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-lg">
                        {activeIssue?.duplicateLevel || "Possible Duplicate"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {activeIssue?.bestDuplicateScore && (
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Match Score
                          </span>
                          <span className="font-black text-purple-600 dark:text-purple-400">
                            {activeIssue.bestDuplicateScore}/100
                          </span>
                        </div>
                      )}
                      {activeIssue?.duplicateGroupId && (
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Group ID
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white truncate block">
                            {activeIssue.duplicateGroupId}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          Linked Count
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {possibleDuplicateIds.length} Linked Issues
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection / Verification */}
                {hasRejection && (
                  <div className="p-5 bg-red-500/5 dark:bg-red-950/20 border border-red-500/30 rounded-2xl space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-red-300">
                        Rejection Details
                      </h3>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {rejection?.reason ||
                        activeIssue?.rejectionReason ||
                        rejection?.notes ||
                        "No rejection details specified."}
                    </p>
                  </div>
                )}

                {/* Evidence & Attachments */}
                {evidenceUrls.length > 0 && (
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Evidence & Attachments ({evidenceUrls.length})
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {evidenceUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center"
                        >
                          <img
                            src={url}
                            alt={`Attachment ${i + 1}`}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <Eye className="w-3.5 h-3.5" /> View
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolution & Feedback */}
                {hasResolution && (
                  <div className="p-5 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          Resolution Summary
                        </h3>
                      </div>
                      {resolvedAt && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Resolved {formatDate(resolvedAt)}
                        </span>
                      )}
                    </div>

                    {activeIssue?.resolutionSummary && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {activeIssue.resolutionSummary}
                      </p>
                    )}

                    {citizenRating !== null && (
                      <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/20 text-xs">
                        <span className="text-[10px] font-bold text-slate-400">
                          Citizen Rating:
                        </span>
                        <div className="flex items-center gap-1 font-black text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{citizenRating}/5</span>
                        </div>
                      </div>
                    )}

                    {citizenFeedback && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        "{citizenFeedback}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Right Summary Column (1/3) */}
              <div className="space-y-5">
                {/* Sticky Summary Card */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Issue Overview
                  </h3>

                  <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Code</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {issueCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Priority</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black rounded-md border uppercase ${getPriorityBadgeClass(priority)}`}
                      >
                        {formatLabel(priority, "Medium")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black rounded-md border ${getStatusBadgeClass(status)}`}
                      >
                        {formatLabel(status, "Unknown")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Category</span>
                      <span className="font-bold text-slate-900 dark:text-white capitalize">
                        {formatLabel(category)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Created</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatDate(createdAt)}
                      </span>
                    </div>

                    {updatedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Last Updated</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatDate(updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SLA Status Card */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        SLA Monitor
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border ${
                        slaState.key === "breached"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                          : slaState.key === "due_soon"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : slaState.key === "completed"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {slaState.label}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] text-slate-400 block">
                      SLA Deadline
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {formatDateTime(
                        activeIssue?.slaDeadline ?? activeIssue?.sla?.deadline,
                      )}
                    </p>

                    {slaState.hoursRemaining !== null && (
                      <p
                        className={`text-xs font-extrabold ${slaState.hoursRemaining < 0 ? "text-red-500" : "text-amber-500"}`}
                      >
                        {slaState.hoursRemaining < 0
                          ? `Overdue by ${Math.abs(slaState.hoursRemaining)} hours`
                          : `${slaState.hoursRemaining} hours remaining`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reporter Card */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Citizen Reporter
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {reporter.name}
                    </p>
                    {reporter.email && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{reporter.email}</span>
                      </div>
                    )}
                    {reporter.phone && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{reporter.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Log */}
                {timelineEvents.length > 0 && (
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Issue Timeline
                    </h3>

                    <div className="space-y-3 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                      {timelineEvents.map((evt, i) => (
                        <div key={i} className="relative space-y-0.5 text-xs">
                          <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-cyan-500" />
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {evt.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {formatDateTime(evt.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <span className="text-xs text-slate-500 font-semibold text-center sm:text-left">
              Read-only administrative view
            </span>

            <div className="flex items-center gap-2 justify-end">
              {hasValidCoordinates && (
                <button
                  type="button"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps?q=${latitude},${longitude}`,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  View on Map
                </button>
              )}

              {activeTab !== "sla" && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIssue(null);
                    setSelectedIssueId(null);
                    setActiveTab("sla");
                  }}
                  className="px-4 py-2 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Open SLA Controls
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedIssue(null);
                  setSelectedIssueId(null);
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
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
                    onSelectIssue={handleSelectIssue}
                    dateRange={dateRange}
                    onSetDateRange={setDateRange}
                  />
                )}

                {activeTab === "issues" && dbUser?._id && (
                  <CityAdminAllIssues
                    cityAdminUserId={dbUser._id}
                    onSelectIssue={handleSelectIssue}
                  />
                )}
                {activeTab === "sla" && renderSLAMonitoring()}
                {activeTab === "city-analytics" && dbUser?._id && (
                  <CityIssueAnalytics
                    cityAdminUserId={dbUser._id}
                    dateRange={dateRange}
                    onSetDateRange={setDateRange}
                    onSelectIssue={handleSelectIssue}
                  />
                )}
                {activeTab === "officers" && renderOfficerManagement()}
                {activeTab === "departments" && renderDepartmentPerformance()}
                {activeTab === "audit" && renderAuditLogs()}
                {activeTab === "ai" && renderAIInsights()}
              </>
            )}
        </div>

        {renderIssueDetailModal()}
      </div>
    </div>
  );
}
