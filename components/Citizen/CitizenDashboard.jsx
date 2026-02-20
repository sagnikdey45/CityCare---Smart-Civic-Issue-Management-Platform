import { useState, useEffect } from "react";
import {
  Search,
  PlusCircle,
  Bell,
  User,
  LogOut,
  AlertCircle,
  Calendar,
  TrendingUp,
  CheckCircle,
  Grid,
  List,
} from "lucide-react";
import { getIssues } from "@/lib/mockData";
import { IssueDetailModal } from "@/components/IssueDetailModal";
import { IssueCard } from "@/components/IssueCard";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ModeToggle } from "../ModeToggle";
import { signOut, useSession } from "next-auth/react";

export function CitizenDashboard({
  onReportIssue,
  onNotificationsClick,
  unreadCount,
}) {
  const { data: session, status } = useSession();
  const user = { id: "1" };
  const profile = { full_name: "Josh Hazlewood" };
  const router = useRouter();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(
    () => {
      if (user) {
        loadIssues();
      }
    },
    [
      // user
    ],
  );

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, statusFilter, categoryFilter]);

  async function loadIssues() {
    if (!user) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const data = getIssues()
        .filter((issue) => issue.reportedBy === user.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
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
          issue.ticket.toLowerCase().includes(searchTerm.toLowerCase()),
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

  async function handleSignOut() {
    try {
      //   await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    in_progress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
        <div className="max-w-8xl mx-auto flex justify-between items-center">
          {/* Logo + Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image src="/logo.png" alt="CityCare Logo" width={36} height={36} />
            <span className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
              CityCare
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/citizen/report")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium hover:shadow-md hover:scale-105 transition-all"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Report Issue</span>
            </button>

            <button
              onClick={onNotificationsClick}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell
                className="text-emerald-700 dark:text-emerald-400"
                size={20}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <ModeToggle />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-2 rounded-full">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">
                  {session?.user?.name || "Profile"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {session?.user?.name || "User Name"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {session?.user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      signOut({ redirect: true, callbackUrl: "/sign-in" })
                    }
                    className="w-full flex items-center px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 rounded-2xl shadow-xl p-8 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Hello, {session?.user?.name?.split(" ")[0] || "there"}! 👋
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-green-50 mb-4">
              Welcome back to your CityCare Dashboard
            </h2>
            <p className="text-green-50/90 text-lg leading-relaxed max-w-3xl">
              Track your reported civic issues, monitor progress, and stay
              informed about resolutions — all in one place designed to keep
              your city thriving.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              label: "Total Issues",
              value: stats.total,
              color: "emerald",
              icon: (
                <TrendingUp
                  className="text-emerald-600 dark:text-emerald-400"
                  size={28}
                />
              ),
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "yellow",
              icon: (
                <Calendar
                  className="text-yellow-600 dark:text-yellow-400"
                  size={28}
                />
              ),
            },
            {
              label: "In Progress",
              value: stats.in_progress,
              color: "teal",
              icon: (
                <AlertCircle
                  className="text-teal-600 dark:text-teal-400"
                  size={28}
                />
              ),
            },
            {
              label: "Resolved",
              value: stats.resolved,
              color: "green",
              icon: (
                <CheckCircle
                  className="text-green-600 dark:text-green-400"
                  size={28}
                />
              ),
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br from-${stat.color}-50 to-white dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-md border border-${stat.color}-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-2 transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-base font-medium">
                    {stat.label}
                  </p>
                  <p
                    className={`text-4xl font-extrabold text-${stat.color}-700 dark:text-${stat.color}-400 mt-1`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters + View Mode */}
        <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Search your issues by title, description, or ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="road">Road & Infrastructure</option>
              <option value="lighting">Street Lighting</option>
              <option value="waste">Waste Management</option>
              <option value="water">Water Supply</option>
              <option value="other">Other</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition-all ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Issues Section */}
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all">
            <AlertCircle
              className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
              size={48}
            />
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-2">
              {issues.length === 0
                ? "No issues reported yet"
                : "No issues found matching your criteria"}
            </p>
            {issues.length === 0 && (
              <button
                onClick={onReportIssue}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
              >
                Report Your First Issue
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => setSelectedIssue(issue)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}
