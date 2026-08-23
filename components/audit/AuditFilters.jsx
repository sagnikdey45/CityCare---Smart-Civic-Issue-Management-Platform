"use client";

import React from "react";
import { Search, Filter, RotateCcw, Calendar, MapPin, Briefcase, Tag, Smartphone } from "lucide-react";
import { formatDepartmentLabel } from "./AuditFormatters";

export default function AuditFilters({
  filters,
  onChange,
  onReset,
  filterOptions = {},
  isSystemAdmin = false,
}) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.role && filters.role !== "all") ||
    (filters.city && filters.city !== "all") ||
    (filters.category && filters.category !== "all") ||
    (filters.department && filters.department !== "all") ||
    (filters.source && filters.source !== "all") ||
    (filters.dateRange && filters.dateRange !== "all");

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* Search */}
        <div className="xl:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user, issue, code..."
            value={filters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* City (System Admin only) */}
        {isSystemAdmin && (
          <div>
            <select
              value={filters.city || "all"}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cities</option>
              {(filterOptions.cities || []).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Role */}
        <div>
          <select
            value={filters.role || "all"}
            onChange={(e) => handleChange("role", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="citizen">Citizen</option>
            <option value="unit_officer">Unit Officer</option>
            <option value="field_officer">Field Officer</option>
            <option value="city_admin">City Admin</option>
            <option value="admin">System Admin</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <select
            value={filters.category || "all"}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="issue">Issue</option>
            <option value="verification">Verification</option>
            <option value="assignment">Assignment</option>
            <option value="resolution">Resolution</option>
            <option value="rework">Rework</option>
            <option value="rejection">Rejection</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="reopen">Reopen</option>
            <option value="sla">SLA</option>
            <option value="escalation">Escalation</option>
            <option value="classification">Classification</option>
            <option value="priority">Priority</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Department */}
        <div>
          <select
            value={filters.department || "all"}
            onChange={(e) => handleChange("department", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {(filterOptions.departments || []).map((dept) => (
              <option key={dept} value={dept}>
                {formatDepartmentLabel(dept)}
              </option>
            ))}
          </select>
        </div>

        {/* Source */}
        <div>
          <select
            value={filters.source || "all"}
            onChange={(e) => handleChange("source", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="web">Web Dashboard</option>
            <option value="mobile">Mobile App</option>
            <option value="system">System Engine</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <select
            value={filters.dateRange || "all"}
            onChange={(e) => handleChange("dateRange", e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Active filters applied
          </span>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
