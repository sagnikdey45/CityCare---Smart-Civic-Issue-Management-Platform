import { useState, useEffect } from "react";
import {
  Search,
  AlertCircle,
  MapPin,
  Calendar,
  Wrench,
  CheckCircle,
  Grid,
  List,
  Clock,
  Navigation,
  ArrowUp,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { FieldOfficerIssueResolution } from "./FieldOfficerIssueResolution";
import { getIssues } from "@/lib/mockData";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ModeToggle } from "@/components/ModeToggle";
import Image from "next/image";

export function FieldOfficerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = { id: "4" };
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
      const data = getIssues()
        .filter((issue) => issue.assignedTo === user?.id)
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
          issue.address?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((issue) => issue.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((issue) => issue.category === categoryFilter);
    }

    filtered.sort((a, b) => b.priority_score - a.priority_score);
    setFilteredIssues(filtered);
  }

  async function handleStatusUpdate(issueId, newStatus, comment) {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : issue,
      ),
    );
    setSelectedIssue(null);
  }

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    inProgress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
    rework: issues.filter((i) => i.rework_requested).length,
  };

  const reworkIssues = issues.filter((i) => i.rework_requested);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          <p className="mt-4 text-gray-600">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
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
              onClick={() => router.push("/field-officer/message-center")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-700 text-white rounded-lg font-medium hover:shadow-md hover:scale-105 transition-all"
            >
              <MessageSquare size={18} />
              <span className="hidden sm:inline">
                Official Messaging Center
              </span>
            </button>

            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell
                className="text-emerald-700 dark:text-emerald-400"
                size={20}
              />
            </button>

            <ModeToggle />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <div className="bg-gradient-to-br from-blue-600 to-cyan-700 p-2 rounded-full">
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
                    onClick={() => {
                      signOut({ redirect: true, callbackUrl: "/sign-in" });
                      localStorage.removeItem("realExpiry");
                    }}
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Field Officer Dashboard
          </h1>
          <p className="text-gray-600">
            Execute on-ground resolution of civic issues
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Assigned
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Wrench className="text-gray-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl shadow-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">To Start</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Calendar className="text-amber-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-white p-6 rounded-xl shadow-lg border border-cyan-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Working On</p>
                <p className="text-3xl font-bold text-cyan-600 mt-1">
                  {stats.inProgress}
                </p>
              </div>
              <div className="bg-cyan-100 p-3 rounded-lg">
                <MapPin className="text-cyan-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl shadow-lg border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {stats.resolved}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {reworkIssues.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 border-2 border-orange-300 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500 p-3 rounded-lg animate-pulse">
                <AlertTriangle className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Rework Required
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                    {stats.rework}
                  </span>
                </h2>
                <p className="text-gray-700 font-medium">
                  These issues need immediate attention and correction
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {reworkIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-orange-300 hover:border-red-400 p-5 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="text-orange-600" size={20} />
                      <span className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded">
                        {issue.ticket_id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          issue.severity === "high"
                            ? "bg-red-100 text-red-700"
                            : issue.severity === "medium"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-700 transition-colors">
                    {issue.title}
                  </h3>

                  <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3 rounded">
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      Rework Reason:
                    </p>
                    <p className="text-sm text-red-800">
                      {issue.rework_reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-1">{issue.address}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} />
                      <span>
                        Updated:{" "}
                        {new Date(issue.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <button className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all">
                      <span>Fix Now</span>
                      <ArrowUp size={14} className="rotate-45" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search issues by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-medium transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">To Start</option>
              <option value="in_progress">Working On</option>
              <option value="resolved">Completed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 font-medium transition-all"
            >
              <option value="all">All Categories</option>
              <option value="road">Road & Infrastructure</option>
              <option value="lighting">Street Lighting</option>
              <option value="waste">Waste Management</option>
              <option value="water">Water Supply</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {filteredIssues.length}
              </span>{" "}
              issue{filteredIssues.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-cyan-100 text-cyan-700 shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Grid View"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-cyan-100 text-cyan-700 shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-600 text-xl font-semibold">
              No issues assigned to you yet
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Check back later for new assignments
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-cyan-300 transform hover:-translate-y-1 overflow-hidden group"
              >
                {issue.photo_url && (
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={issue.photo_url}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                          issue.severity === "high"
                            ? "bg-red-500 text-white"
                            : issue.severity === "medium"
                              ? "bg-orange-500 text-white"
                              : "bg-green-500 text-white"
                        }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded">
                      {issue.ticket_id}
                    </span>
                    {!issue.photo_url && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          issue.severity === "high"
                            ? "bg-red-100 text-red-700"
                            : issue.severity === "medium"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-cyan-700 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {issue.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-1">{issue.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar
                      size={16}
                      className="text-gray-400 flex-shrink-0"
                    />
                    <span>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        issue.status === "resolved"
                          ? "bg-emerald-100 text-emerald-700"
                          : issue.status === "in_progress"
                            ? "bg-cyan-100 text-cyan-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {issue.status === "resolved"
                        ? "Completed"
                        : issue.status === "in_progress"
                          ? "Working On"
                          : "To Start"}
                    </span>
                    <button className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-semibold text-sm">
                      <span>View</span>
                      <ArrowUp size={16} className="rotate-45" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-cyan-300 p-6 group"
              >
                <div className="flex gap-6">
                  {issue.photo_url && (
                    <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={issue.photo_url}
                        alt={issue.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded">
                          {issue.ticket_id}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            issue.severity === "high"
                              ? "bg-red-100 text-red-700"
                              : issue.severity === "medium"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {issue.severity.toUpperCase()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            issue.status === "resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : issue.status === "in_progress"
                                ? "bg-cyan-100 text-cyan-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {issue.status === "resolved"
                            ? "Completed"
                            : issue.status === "in_progress"
                              ? "Working On"
                              : "To Start"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${issue.latitude},${issue.longitude}`,
                            "_blank",
                          );
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                      >
                        <Navigation size={16} />
                        Navigate
                      </button>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-cyan-700 transition-colors">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {issue.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="line-clamp-1">{issue.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span>
                          {new Date(issue.updated_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedIssue && (
          <FieldOfficerIssueResolution
            issue={selectedIssue}
            onClose={() => setSelectedIssue(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  );
}
