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
  ChevronUp,
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
} from "lucide-react";
import { getIssues, mockUsers } from "@/lib/mockData";
import { AdminReassignModal } from "./AdminReassignModal";
import { AdminIssueModal } from "./AdminIssueModal";
import { MessagesCenter } from "../MessageCenter";
import { ModeToggle } from "../ModeToggle";

export function AdminDashboard() {
  const user = { id: "2" };
  const profile = { full_name: "Sagnik Dey", role: "Administrator" };
  const [activeTab, setActiveTab] = useState("overview");
  const [issues, setIssues] = useState([]);
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
  const [expandedOfficers, setExpandedOfficers] = useState(new Set());

  const [assignmentOfficerFilter, setAssignmentOfficerFilter] = useState("all");
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState("");
  const [expandedAssignmentOfficers, setExpandedAssignmentOfficers] = useState(
    new Set(),
  );
  const [isAssignedExpanded, setIsAssignedExpanded] = useState(true);
  const [isUnassignedExpanded, setIsUnassignedExpanded] = useState(true);
  const [officerIssueSearchTerms, setOfficerIssueSearchTerms] = useState({});
  const [officerIssueFilters, setOfficerIssueFilters] = useState({});

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, statusFilter, categoryFilter]);

  async function loadIssues() {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const data = getIssues().sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      console.log("Loaded issues:", data);
      setIssues(data);
    } catch (error) {
      console.error("Error loading issues:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterIssues() {
    let filtered = [...issues];

    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((issue) => issue.category === categoryFilter);
    }

    setFilteredIssues(filtered);
  }

  function handleIssueUpdated(issueId, updates) {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId ? { ...issue, ...updates } : issue,
      ),
    );
    setSelectedIssue(null);
  }

  function handleSendMessage(officerId, message, issueIds) {
    if (!user) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      from_user_id: user.id,
      to_user_id: officerId,
      message,
      createdAt: new Date().toISOString(),
      read: false,
      issue_ids: issueIds,
    };

    const stored = localStorage.getItem("messages");
    const messages = stored ? JSON.parse(stored) : [];
    messages.push(newMessage);
    localStorage.setItem("messages", JSON.stringify(messages));

    alert(
      `Message sent successfully!\n\nThe officer will be notified and can reply from their Messages Center.`,
    );
    setMessageOfficer(null);
    setMessageIssues([]);
  }

  function handleReassign(issueId, newOfficerId, reason) {
    const issue = issues.find((i) => i.id === issueId);
    const oldOfficer = officers.find((o) => o.id === issue?.assignedTo);
    const newOfficer = officers.find((o) => o.id === newOfficerId);

    if (oldOfficer && newOfficer && oldOfficer.role !== newOfficer.role) {
      alert(
        `Invalid reassignment!\n\n${oldOfficer.role === "unit_officer" ? "Unit Officers" : "Field Officers"} can only be reassigned to other ${oldOfficer.role === "unit_officer" ? "Unit Officers" : "Field Officers"}.`,
      );
      return;
    }

    setIssues(
      issues.map((i) =>
        i.id === issueId
          ? {
              ...i,
              assignedTo: newOfficerId,
              updated_at: new Date().toISOString(),
            }
          : i,
      ),
    );

    console.log("Reassignment recorded:", {
      issueId,
      from: oldOfficer?.full_name,
      to: newOfficer?.full_name,
      reason,
      timestamp: new Date().toISOString(),
      roleMatch: oldOfficer?.role === newOfficer?.role,
    });

    alert(
      `Issue reassigned successfully!\n\nFrom: ${oldOfficer?.full_name || "Unassigned"} (${oldOfficer?.role === "unit_officer" ? "Unit Officer" : "Field Officer"})\nTo: ${newOfficer?.full_name} (${newOfficer?.role === "unit_officer" ? "Unit Officer" : "Field Officer"})\nReason: ${reason}\n\nBoth officers have been notified.`,
    );
    setReassignIssue(null);
    setSelectedIssue(null);
  }

  function openMessageModal(officer, officerIssues) {
    setMessageOfficer(officer);
    setMessageIssues(officerIssues);
  }

  function handleRevoke(issueId, reason) {
    const issue = issues.find((i) => i.id === issueId);
    const officer = officers.find((o) => o.id === issue?.assignedTo);

    setIssues(
      issues.map((i) =>
        i.id === issueId
          ? {
              ...i,
              assignedTo: null,
              status: "pending",
              updated_at: new Date().toISOString(),
            }
          : i,
      ),
    );

    console.log("Assignment revoked:", {
      issueId,
      from: officer?.full_name,
      reason,
      timestamp: new Date().toISOString(),
    });

    alert(
      `Assignment revoked successfully!\n\nFrom: ${officer?.full_name}\nReason: ${reason}\n\nThe officer has been notified and the issue is now unassigned.`,
    );
    setSelectedIssue(null);
  }

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    in_progress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
    escalated: issues.filter((i) => i.internal_status === "escalated_to_admin")
      .length,
  };

  const officers = mockUsers.filter(
    (u) => u.role === "unit_officer" || u.role === "field_officer",
  );

  const officerWorkload = officers.map((officer) => {
    const assignedIssues = issues.filter((i) => i.assignedTo === officer.id);
    const pending = assignedIssues.filter((i) => i.status === "pending").length;
    const inProgress = assignedIssues.filter(
      (i) => i.status === "in_progress",
    ).length;
    const resolved = assignedIssues.filter(
      (i) => i.status === "resolved",
    ).length;
    const total = assignedIssues.length;
    const avgResolutionTime =
      total > 0 ? Math.floor(Math.random() * 48) + 24 : 0;
    const efficiencyScore =
      total > 0 ? Math.round((resolved / total) * 100) : 0;

    let workloadStatus = "balanced";
    if (total > 15) workloadStatus = "overloaded";
    else if (total < 5) workloadStatus = "underutilized";

    return {
      officer,
      total,
      pending,
      inProgress,
      resolved,
      issues: assignedIssues,
      completionRate: efficiencyScore,
      avgResolutionTime,
      workloadStatus,
      rating: (Math.random() * 2 + 3).toFixed(1),
    };
  });

  const filteredOfficers = officerWorkload.filter((ow) => {
    if (officerFilter !== "all" && ow.officer.role !== officerFilter)
      return false;
    if (workloadFilter !== "all" && ow.workloadStatus !== workloadFilter)
      return false;
    if (
      officerSearchTerm &&
      !ow.officer.full_name
        .toLowerCase()
        .includes(officerSearchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const toggleOfficerExpand = (officerId) => {
    const newExpanded = new Set(expandedOfficers);
    if (newExpanded.has(officerId)) {
      newExpanded.delete(officerId);
    } else {
      newExpanded.add(officerId);
    }
    setExpandedOfficers(newExpanded);
  };

  const toggleAssignmentOfficerExpand = (officerId) => {
    const newExpanded = new Set(expandedAssignmentOfficers);
    if (newExpanded.has(officerId)) {
      newExpanded.delete(officerId);
    } else {
      newExpanded.add(officerId);
    }
    setExpandedAssignmentOfficers(newExpanded);
  };

  const getFilteredOfficerIssues = (officerId, issues) => {
    const searchTerm = officerIssueSearchTerms[officerId] || "";
    const filters = officerIssueFilters[officerId];

    let filtered = [...issues];

    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((issue) => issue.status === filters.status);
    }

    if (filters?.severity && filters.severity !== "all") {
      filtered = filtered.filter(
        (issue) => issue.severity === filters.severity,
      );
    }

    return filtered;
  };

  const assignedIssues = issues.filter((i) => i.assignedTo);
  const overdueIssues = assignedIssues.filter((i) => {
    const daysSince = Math.floor(
      (Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSince > 7 && i.status !== "resolved";
  });

  const filteredAssignmentOfficers = officerWorkload.filter((ow) => {
    if (
      assignmentOfficerFilter !== "all" &&
      ow.officer.role !== assignmentOfficerFilter
    )
      return false;
    if (
      assignmentSearchTerm &&
      !ow.officer.full_name
        .toLowerCase()
        .includes(assignmentSearchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  async function handleSignOut() {
    try {
      // await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#0B1121] relative text-slate-900 dark:text-slate-100 font-sans"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at top left, rgba(16, 185, 129, 0.05), transparent 50%), radial-gradient(ellipse at top right, rgba(14, 165, 233, 0.05), transparent 50%), radial-gradient(ellipse at bottom center, rgba(139, 92, 246, 0.05), transparent 50%)",
      }}
    >
      <nav className="bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-2xl shadow-lg sticky top-0 z-50 border-b border-white/50 dark:border-slate-800/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
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
                  onClick={handleSignOut}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="group relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(148,163,184,0.15)] dark:hover:shadow-[0_20px_40px_rgba(148,163,184,0.1)] transition-all duration-500 p-6 border-y border-white/80 dark:border-white/10 hover:border-slate-300/50 dark:hover:border-slate-500/50 hover:bg-white/80 dark:hover:bg-[#1e293b]/80 transform hover:-translate-y-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-500 to-slate-400 opacity-0 group-hover:opacity-10 blur-xl transition-all duration-700"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-400/20 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 transform group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-inner border border-white/50 dark:border-slate-700/50 group-hover:scale-110 transition-transform duration-500">
                  <BarChart3
                    size={22}
                    className="text-slate-600 dark:text-slate-300 drop-shadow-sm"
                  />
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">
                Total Issues
              </p>
              <p className="text-5xl font-black bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent transform group-hover:scale-105 origin-left transition-transform duration-500">
                {stats.total}
              </p>
              <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-slate-400 to-slate-300 dark:from-slate-500 dark:to-slate-400 rounded-full w-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_20px_40px_rgba(245,158,11,0.1)] transition-all duration-500 p-6 border-y border-white/80 dark:border-white/10 hover:border-amber-300/50 dark:hover:border-amber-500/50 hover:bg-white/80 dark:hover:bg-[#1e293b]/80 transform hover:-translate-y-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover:opacity-10 blur-xl transition-all duration-700"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 transform group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-xl shadow-inner border border-white/50 dark:border-amber-700/30 group-hover:scale-110 transition-transform duration-500">
                  <Clock
                    size={22}
                    className="text-amber-600 dark:text-amber-400 drop-shadow-sm"
                  />
                </div>
              </div>
              <p className="text-amber-700/80 dark:text-amber-400/80 text-sm font-bold uppercase tracking-wider mb-1">
                Pending
              </p>
              <p className="text-5xl font-black bg-gradient-to-br from-amber-700 to-orange-600 dark:from-amber-300 dark:to-orange-200 bg-clip-text text-transparent transform group-hover:scale-105 origin-left transition-transform duration-500">
                {stats.pending}
              </p>
              <div className="mt-4 h-1.5 w-full bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 dark:from-amber-500 dark:to-orange-500 rounded-full w-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] transition-all duration-500 p-6 border-y border-white/80 dark:border-white/10 hover:border-blue-300/50 dark:hover:border-blue-500/50 hover:bg-white/80 dark:hover:bg-[#1e293b]/80 transform hover:-translate-y-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-10 blur-xl transition-all duration-700"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 transform group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-xl shadow-inner border border-white/50 dark:border-blue-700/30 group-hover:scale-110 transition-transform duration-500">
                  <Activity
                    size={22}
                    className="text-blue-600 dark:text-blue-400 drop-shadow-sm"
                  />
                </div>
              </div>
              <p className="text-blue-700/80 dark:text-blue-400/80 text-sm font-bold uppercase tracking-wider mb-1">
                In Progress
              </p>
              <p className="text-5xl font-black bg-gradient-to-br from-blue-700 to-cyan-600 dark:from-blue-300 dark:to-cyan-200 bg-clip-text text-transparent transform group-hover:scale-105 origin-left transition-transform duration-500">
                {stats.in_progress}
              </p>
              <div className="mt-4 h-1.5 w-full bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 dark:from-blue-500 dark:to-cyan-500 rounded-full w-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] transition-all duration-500 p-6 border-y border-white/80 dark:border-white/10 hover:border-emerald-300/50 dark:hover:border-emerald-500/50 hover:bg-white/80 dark:hover:bg-[#1e293b]/80 transform hover:-translate-y-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-10 blur-xl transition-all duration-700"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 transform group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-xl shadow-inner border border-white/50 dark:border-emerald-700/30 group-hover:scale-110 transition-transform duration-500">
                  <CheckCircle
                    size={22}
                    className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm"
                  />
                </div>
              </div>
              <p className="text-emerald-700/80 dark:text-emerald-400/80 text-sm font-bold uppercase tracking-wider mb-1">
                Resolved
              </p>
              <p className="text-5xl font-black bg-gradient-to-br from-emerald-700 to-teal-600 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent transform group-hover:scale-105 origin-left transition-transform duration-500">
                {stats.resolved}
              </p>
              <div className="mt-4 h-1.5 w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 dark:from-emerald-500 dark:to-teal-500 rounded-full w-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_20px_40px_rgba(168,85,247,0.1)] transition-all duration-500 p-6 border-y border-white/80 dark:border-white/10 hover:border-purple-300/50 dark:hover:border-purple-500/50 hover:bg-white/80 dark:hover:bg-[#1e293b]/80 transform hover:-translate-y-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-violet-400 opacity-0 group-hover:opacity-10 blur-xl transition-all duration-700"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 transform group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/40 dark:to-violet-900/40 rounded-xl shadow-inner border border-white/50 dark:border-purple-700/30 group-hover:scale-110 transition-transform duration-500">
                  <Users
                    size={22}
                    className="text-purple-600 dark:text-purple-400 drop-shadow-sm"
                  />
                </div>
              </div>
              <p className="text-purple-700/80 dark:text-purple-400/80 text-sm font-bold uppercase tracking-wider mb-1">
                Officers
              </p>
              <p className="text-5xl font-black bg-gradient-to-br from-purple-700 to-violet-600 dark:from-purple-300 dark:to-violet-200 bg-clip-text text-transparent transform group-hover:scale-105 origin-left transition-transform duration-500">
                {officers.length}
              </p>
              <div className="mt-4 h-1.5 w-full bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-violet-400 dark:from-purple-500 dark:to-violet-500 rounded-full w-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>

          {stats.escalated > 0 && (
            <div className="group relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(239,68,68,0.15)] dark:hover:shadow-[0_20px_40px_rgba(239,68,68,0.1)] transition-all duration-500 p-6 border-y border-white/80 dark:border-white/10 hover:border-red-300/50 dark:hover:border-red-500/50 hover:bg-white/80 dark:hover:bg-[#1e293b]/80 transform hover:-translate-y-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-rose-400 opacity-0 group-hover:opacity-10 blur-xl transition-all duration-700"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/20 to-transparent rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 transform group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/40 dark:to-rose-900/40 rounded-xl shadow-inner border border-white/50 dark:border-red-700/30 group-hover:scale-110 transition-transform duration-500">
                    <AlertTriangle
                      size={22}
                      className="text-red-600 dark:text-red-400 drop-shadow-sm animate-pulse"
                    />
                  </div>
                </div>
                <p className="text-red-700/80 dark:text-red-400/80 text-sm font-bold uppercase tracking-wider mb-1">
                  Escalated
                </p>
                <p className="text-5xl font-black bg-gradient-to-br from-red-700 to-rose-600 dark:from-red-300 dark:to-rose-200 bg-clip-text text-transparent transform group-hover:scale-105 origin-left transition-transform duration-500">
                  {stats.escalated}
                </p>
                <div className="mt-4 h-1.5 w-full bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-rose-400 dark:from-red-500 dark:to-rose-500 rounded-full w-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative mb-12 z-40 flex justify-center group/nav">
          <div className="relative bg-white/30 dark:bg-[#0f172a]/50 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-y border-white/80 dark:border-white/20 p-2 overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent dark:from-white/5 pointer-events-none rounded-[2.5rem]"></div>
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar relative z-10 px-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-8 py-3.5 font-bold text-sm whitespace-nowrap transition-all duration-500 flex items-center gap-3 rounded-full relative group/btn ${
                  activeTab === "overview"
                    ? "text-white bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_25px_rgba(52,211,153,0.6)] border border-emerald-400/50 scale-105"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10 border border-transparent"
                }`}
              >
                {activeTab === "overview" && <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>}
                <BarChart3 size={20} className={`relative z-10 ${activeTab === 'overview' ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' : ''}`} />
                <span className="relative z-10 tracking-wide">Overview</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {activeTab === "overview" && (
            <div className="group/main relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/40 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border-y border-white/80 dark:border-white/10 hover:border-indigo-300/50 dark:hover:border-indigo-500/50 transition-all duration-700">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent opacity-0 group-hover/main:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
              
              <div className="relative z-10 px-10 py-8 border-b border-white/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative group/icon">
                    <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-2xl blur-lg opacity-40 group-hover/icon:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                    <div className="relative p-3.5 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/80 dark:to-cyan-900/80 rounded-2xl shadow-inner border border-white/50 dark:border-indigo-500/30 group-hover/icon:scale-110 transition-transform duration-500">
                      <BarChart3 className="text-indigo-600 dark:text-indigo-400 drop-shadow-sm" size={26} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-900 to-cyan-700 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent tracking-tight">
                      System Overview
                    </h2>
                    <p className="text-sm font-bold text-indigo-700/60 dark:text-indigo-300/60 uppercase tracking-widest mt-1">
                      Live Dashboard Analytics
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative z-10 p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="group/card relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] transition-all duration-500 p-6 border-y border-white/80 dark:border-white/10 hover:border-blue-300/50 dark:hover:border-blue-500/50 transform hover:-translate-y-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover/card:opacity-10 blur-xl transition-all duration-700"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl group-hover/card:blur-2xl transition-all duration-500 transform group-hover/card:scale-150 pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-xl shadow-inner border border-white/50 dark:border-blue-700/30 group-hover/card:scale-110 transition-transform duration-500">
                          <Users
                            size={24}
                            className="text-blue-600 dark:text-blue-400 drop-shadow-sm"
                          />
                        </div>
                      </div>
                      <p className="text-blue-700/80 dark:text-blue-400/80 text-sm font-bold uppercase tracking-wider mb-1">
                        Officers
                      </p>
                      <p className="text-5xl font-black bg-gradient-to-br from-blue-700 to-cyan-600 dark:from-blue-300 dark:to-cyan-200 bg-clip-text text-transparent transform group-hover/card:scale-105 origin-left transition-transform duration-500">
                        {officers.length}
                      </p>
                    </div>
                  </div>

                  <div className="group/card relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] transition-all duration-500 p-6 border-y border-white/80 dark:border-white/10 hover:border-emerald-300/50 dark:hover:border-emerald-500/50 transform hover:-translate-y-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover/card:opacity-10 blur-xl transition-all duration-700"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-3xl group-hover/card:blur-2xl transition-all duration-500 transform group-hover/card:scale-150 pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-xl shadow-inner border border-white/50 dark:border-emerald-700/30 group-hover/card:scale-110 transition-transform duration-500">
                          <Activity
                            size={24}
                            className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm"
                          />
                        </div>
                      </div>
                      <p className="text-emerald-700/80 dark:text-emerald-400/80 text-sm font-bold uppercase tracking-wider mb-1">
                        Performance
                      </p>
                      <p className="text-5xl font-black bg-gradient-to-br from-emerald-700 to-teal-600 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent transform group-hover/card:scale-105 origin-left transition-transform duration-500">
                        94%
                      </p>
                    </div>
                  </div>

                  <div className="group/card relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_20px_40px_rgba(245,158,11,0.1)] transition-all duration-500 p-6 border-y border-white/80 dark:border-white/10 hover:border-amber-300/50 dark:hover:border-amber-500/50 transform hover:-translate-y-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-400 opacity-0 group-hover/card:opacity-10 blur-xl transition-all duration-700"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl group-hover/card:blur-2xl transition-all duration-500 transform group-hover/card:scale-150 pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-xl shadow-inner border border-white/50 dark:border-amber-700/30 group-hover/card:scale-110 transition-transform duration-500">
                          <Clock
                            size={24}
                            className="text-amber-600 dark:text-amber-400 drop-shadow-sm"
                          />
                        </div>
                      </div>
                      <p className="text-amber-700/80 dark:text-amber-400/80 text-sm font-bold uppercase tracking-wider mb-1">
                        Avg Time
                      </p>
                      <p className="text-5xl font-black bg-gradient-to-br from-amber-700 to-orange-600 dark:from-amber-300 dark:to-orange-200 bg-clip-text text-transparent transform group-hover/card:scale-105 origin-left transition-transform duration-500">
                        36h
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="group/qs relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl p-6 border-y border-white/80 dark:border-white/10 hover:border-blue-300/50 dark:hover:border-blue-500/50 shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] transition-all duration-500 transform hover:-translate-y-2">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-indigo-400 opacity-0 group-hover/qs:opacity-10 blur-2xl transition-all duration-700"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-3xl group-hover/qs:blur-2xl transition-all duration-500 transform group-hover/qs:scale-150 pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/50 dark:border-slate-700/50">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/60 dark:to-indigo-900/60 rounded-xl shadow-inner border border-white/50 dark:border-blue-700/30 group-hover/qs:scale-110 transition-transform duration-500">
                          <Target size={20} className="text-blue-600 dark:text-blue-400 drop-shadow-sm" />
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 dark:from-white dark:to-blue-200 bg-clip-text text-transparent tracking-tight">
                          Quick Stats
                        </h3>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="group/item flex items-center justify-between p-3 rounded-2xl hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent hover:border-white/50 dark:hover:border-slate-700/50 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-cyan-600 dark:group-hover/item:text-cyan-400 transition-colors uppercase tracking-wider text-xs">
                              Unit Officers
                            </span>
                          </div>
                          <span className="font-black text-2xl text-slate-900 dark:text-white drop-shadow-sm group-hover/item:scale-110 transition-transform origin-right">
                            {officers.filter((o) => o.role === "unit_officer").length}
                          </span>
                        </div>
                        <div className="group/item flex items-center justify-between p-3 rounded-2xl hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent hover:border-white/50 dark:hover:border-slate-700/50 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors uppercase tracking-wider text-xs">
                              Field Officers
                            </span>
                          </div>
                          <span className="font-black text-2xl text-slate-900 dark:text-white drop-shadow-sm group-hover/item:scale-110 transition-transform origin-right">
                            {officers.filter((o) => o.role === "field_officer").length}
                          </span>
                        </div>
                        <div className="group/item flex items-center justify-between p-3 rounded-2xl hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent hover:border-white/50 dark:hover:border-slate-700/50 transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors uppercase tracking-wider text-xs">
                              Avg Workload / Officer
                            </span>
                          </div>
                          <span className="font-black text-2xl text-slate-900 dark:text-white drop-shadow-sm group-hover/item:scale-110 transition-transform origin-right">
                            {Math.round(issues.length / officers.length)}
                          </span>
                        </div>
                        <div className="group/item flex items-center justify-between p-3 rounded-2xl hover:bg-red-50/50 dark:hover:bg-red-900/30 border border-transparent hover:border-red-200/50 dark:hover:border-red-800/50 transition-all duration-300 mt-1">
                          <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] animate-ping relative">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            </div>
                            <span className="font-bold text-red-600 dark:text-red-400 uppercase tracking-wider text-xs">
                              Unassigned Issues
                            </span>
                          </div>
                          <span className="font-black text-3xl text-red-600 dark:text-red-400 drop-shadow-sm group-hover/item:scale-110 transition-transform origin-right">
                            {issues.filter((i) => !i.assignedTo).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group/sh relative overflow-hidden bg-white/40 dark:bg-[#0f172a]/60 backdrop-blur-3xl rounded-3xl p-6 border-y border-white/80 dark:border-white/10 hover:border-emerald-300/50 dark:hover:border-emerald-500/50 shadow-lg dark:shadow-2xl hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] transition-all duration-500 transform hover:-translate-y-2">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-0 group-hover/sh:opacity-10 blur-2xl transition-all duration-700"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/20 to-transparent rounded-full blur-3xl group-hover/sh:blur-2xl transition-all duration-500 transform group-hover/sh:scale-150 pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/50 dark:border-slate-700/50">
                        <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/60 dark:to-teal-900/60 rounded-xl shadow-inner border border-white/50 dark:border-emerald-700/30 group-hover/sh:scale-110 transition-transform duration-500">
                          <TrendingUp size={20} className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm" />
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-900 to-teal-700 dark:from-white dark:to-emerald-200 bg-clip-text text-transparent tracking-tight">
                          System Health
                        </h3>
                      </div>
                      <div className="space-y-8">
                        <div className="group/bar relative">
                          <div className="flex items-end justify-between mb-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700 dark:text-slate-300 group-hover/bar:text-emerald-600 dark:group-hover/bar:text-emerald-400 transition-colors uppercase tracking-wider text-xs mb-1">
                                Officer Utilization
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">Capacity analysis</span>
                            </div>
                            <span className="font-black text-3xl text-slate-900 dark:text-white group-hover/bar:scale-110 transition-transform origin-right">
                              {Math.round(
                                (officers.filter(
                                  (o) =>
                                    officerWorkload.find(
                                      (ow) =>
                                        ow.officer.id === o.id && ow.total > 0,
                                    )?.total || 0,
                                ) /
                                  officers.length) *
                                  100,
                              )}%
                            </span>
                          </div>
                          <div className="w-full bg-black/5 dark:bg-black/20 rounded-full h-3 overflow-hidden border border-white/50 dark:border-white/5 relative shadow-inner">
                            <div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.8)] transition-all duration-1000 ease-out group-hover/bar:opacity-100 opacity-80"
                              style={{
                                width: `${Math.round((officers.filter((o) => officerWorkload.find((ow) => ow.officer.id === o.id && ow.total > 0)?.total || 0) / officers.length) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="group/bar relative">
                          <div className="flex items-end justify-between mb-3">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700 dark:text-slate-300 group-hover/bar:text-emerald-600 dark:group-hover/bar:text-emerald-400 transition-colors uppercase tracking-wider text-xs mb-1">
                                Issue Resolution Rate
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-500 font-medium">Platform efficiency</span>
                            </div>
                            <span className="font-black text-3xl text-slate-900 dark:text-white group-hover/bar:scale-110 transition-transform origin-right">
                              {Math.round((stats.resolved / stats.total) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-black/5 dark:bg-black/20 rounded-full h-3 overflow-hidden border border-white/50 dark:border-white/5 relative shadow-inner">
                            <div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)] transition-all duration-1000 ease-out group-hover/bar:opacity-100 opacity-80"
                              style={{
                                width: `${Math.round((stats.resolved / stats.total) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedIssue && (
        <AdminIssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdated={handleIssueUpdated}
        />
      )}

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
