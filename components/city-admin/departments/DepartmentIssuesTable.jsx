import React, { useState, useMemo } from "react";
import { Search, Filter, AlertTriangle, CircleCheck as CheckCircle2, Clock, XCircle, Tag, ChevronRight } from "lucide-react";

function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return String(timestamp);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DepartmentIssuesTable({ issues = [] }) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredIssues = useMemo(() => {
    const q = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchSearch =
        !q ||
        [issue.title, issue.issueCode, issue.assignedUnitOfficer, issue.assignedFieldOfficer]
          .some((val) => String(val || "").toLowerCase().includes(q));

      const normPrio = String(issue.priority || "").toLowerCase();
      const matchPriority = priorityFilter === "all" || normPrio === priorityFilter;

      const normStatus = String(issue.status || "").toLowerCase();
      let matchStatus = true;
      if (statusFilter === "resolved") matchStatus = normStatus === "resolved" || normStatus === "closed";
      if (statusFilter === "active") matchStatus = !["resolved", "closed", "rejected", "withdrawn"].includes(normStatus);
      if (statusFilter === "breached") matchStatus = issue.slaBreached === true;
      if (statusFilter === "rejected") matchStatus = normStatus === "rejected";

      return matchSearch && matchPriority && matchStatus;
    });
  }, [issues, search, priorityFilter, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Issues</option>
            <option value="resolved">Resolved / Closed</option>
            <option value="breached">SLA Breached</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issue title, code, officer..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6">Issue Code</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">SLA Status</th>
                <th className="py-4 px-6">Assigned UO</th>
                <th className="py-4 px-6">Assigned FO</th>
                <th className="py-4 px-6 text-right">Reported Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No issue records found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => {
                  const isBreached = issue.slaBreached === true;

                  return (
                    <tr
                      key={issue.issueId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Code */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          {issue.issueCode}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="py-4 px-6 max-w-xs">
                        <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {issue.title}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            issue.priority === "critical"
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300"
                              : issue.priority === "high"
                              ? "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-300"
                              : issue.priority === "medium"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {issue.priority || "medium"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                          {String(issue.status || "pending").replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* SLA */}
                      <td className="py-4 px-6">
                        {isBreached ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase border border-rose-300">
                            <AlertTriangle size={11} /> Breached
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase border border-emerald-300">
                            <CheckCircle2 size={11} /> Compliant
                          </span>
                        )}
                      </td>

                      {/* UO */}
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                        {issue.assignedUnitOfficer}
                      </td>

                      {/* FO */}
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                        {issue.assignedFieldOfficer}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-right text-slate-500">
                        {formatDate(issue.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
