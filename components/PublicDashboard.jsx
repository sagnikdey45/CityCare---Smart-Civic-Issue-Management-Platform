import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  LogIn,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { getIssues } from "../lib/mockData";
import { IssueCard } from "./IssueCard";
import { IssueDetailModal } from "./IssueDetailModal";

export function PublicDashboard() {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, statusFilter, categoryFilter]);

  async function loadIssues() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const allIssues = getIssues();
    setIssues(
      [...allIssues].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
    setLoading(false);
  }

  function filterIssues() {
    let filtered = [...issues];

    if (searchTerm) {
      filtered = filtered.filter(
        (issue) =>
          issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.ticket.toLowerCase().includes(searchTerm.toLowerCase())
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

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    in_progress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-emerald-800 bg-clip-text text-transparent mb-3">
          Public Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Track civic issues and their resolution status in your city
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-200 hover:border-gray-300 transform hover:-translate-y-1">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Issues</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {stats.total}
          </p>
          <div className="mt-3 h-1 bg-gradient-to-r from-gray-400 to-gray-200 rounded-full"></div>
        </div>
        <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-yellow-300 hover:border-yellow-400 transform hover:-translate-y-1">
          <p className="text-yellow-800 text-sm font-medium mb-2">Pending</p>
          <p className="text-4xl font-bold text-yellow-800">{stats.pending}</p>
          <div className="mt-3 h-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"></div>
        </div>
        <div className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-blue-300 hover:border-blue-400 transform hover:-translate-y-1">
          <p className="text-blue-800 text-sm font-medium mb-2">In Progress</p>
          <p className="text-4xl font-bold text-blue-800">
            {stats.in_progress}
          </p>
          <div className="mt-3 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
        </div>
        <div className="group bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl shadow-lg hover:shadow-2xl transition-all p-6 border border-green-300 hover:border-green-400 transform hover:-translate-y-1">
          <p className="text-green-800 text-sm font-medium mb-2">Resolved</p>
          <p className="text-4xl font-bold text-green-800">{stats.resolved}</p>
          <div className="mt-3 h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search issues by title, description, or ticket ID..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Filter size={18} className="text-blue-600" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 cursor-pointer hover:border-gray-300 transition-all"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 cursor-pointer hover:border-gray-300 transition-all"
            >
              <option value="all">All Categories</option>
              <option value="road">Road & Infrastructure</option>
              <option value="lighting">Street Lighting</option>
              <option value="waste">Waste Management</option>
              <option value="water">Water Supply</option>
              <option value="other">Other</option>
            </select>

            <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition-all ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading issues...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">
            No issues found matching your filters.
          </p>
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

      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  );
}
