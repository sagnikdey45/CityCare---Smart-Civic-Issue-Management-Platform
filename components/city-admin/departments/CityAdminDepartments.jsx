import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Building2,
  Search,
  Download,
  Loader2,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BarChart3,
  TrendingUp,
  X,
} from "lucide-react";
import DepartmentPerformanceCard from "./DepartmentPerformanceCard";
import DepartmentDetailsModal from "./DepartmentDetailsModal";
import DepartmentReportDialog from "./DepartmentReportDialog";

export default function CityAdminDepartments({ cityAdminUserId, city }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("issues"); // "issues" | "resolution" | "sla" | "time" | "officers"

  const [selectedDeptModal, setSelectedDeptModal] = useState(null);
  const [reportDialogState, setReportDialogState] = useState(null); // null | { departmentKey: "all" | string }

  const departmentData = useQuery(
    api.cityAdmin.getCityDepartmentPerformance,
    cityAdminUserId ? { cityAdminUserId } : "skip"
  );

  const departments = departmentData?.departments || [];
  const summary = departmentData?.summary;

  const filteredDepartments = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = departments.filter((d) => {
      return !q || [d.label, d.department].some((val) => String(val || "").toLowerCase().includes(q));
    });

    if (sortBy === "resolution") {
      list = [...list].sort((a, b) => b.metrics.resolutionRate - a.metrics.resolutionRate);
    } else if (sortBy === "sla") {
      list = [...list].sort((a, b) => a.metrics.slaComplianceRate - b.metrics.slaComplianceRate);
    } else if (sortBy === "time") {
      list = [...list].sort((a, b) => b.metrics.avgResolutionHours - a.metrics.avgResolutionHours);
    } else if (sortBy === "officers") {
      list = [...list].sort(
        (a, b) =>
          b.metrics.unitOfficerCount +
          b.metrics.fieldOfficerCount -
          (a.metrics.unitOfficerCount + a.metrics.fieldOfficerCount)
      );
    } else {
      // Default issues count desc
      list = [...list].sort((a, b) => b.metrics.totalIssues - a.metrics.totalIssues);
    }

    return list;
  }, [departments, search, sortBy]);

  // Loading state
  if (departmentData === undefined) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <Loader2 className="animate-spin text-indigo-600 mx-auto" size={40} />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          Loading department performance & officer metrics for {city || "city"}...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Main Header Card */}
      <div className="mt-5 relative overflow-hidden bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black uppercase tracking-wider text-indigo-100 backdrop-blur-sm">
                <Building2 size={13} /> Scope: {city || departmentData?.scope?.city || "City-Wide"}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/30 text-xs font-black uppercase tracking-wider text-emerald-200">
                Department Performance & Reports
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <Building2 size={32} className="text-indigo-200 shrink-0" />
              Departments & Reports
            </h1>
            <p className="text-xs sm:text-sm font-medium text-indigo-100/90 max-w-2xl leading-relaxed">
              Monitor department performance, Unit Officer and Field Officer metrics, resolution rates, and export client-side PDF reports.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReportDialogState({ departmentKey: "all" })}
            className="px-5 py-3 rounded-2xl font-black text-xs bg-white text-indigo-950 hover:bg-indigo-50 shadow-xl transition-all flex items-center gap-2.5 shrink-0 cursor-pointer"
          >
            <Download size={16} />
            <span>Download City Report</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Departments</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block">{summary.totalDepartments}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Total Issues</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block">{summary.totalIssues}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 block">Active Issues</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">{summary.activeIssues}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 block">Resolved / Closed</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
              {summary.resolvedIssues + summary.closedIssues}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-sky-600 block">SLA Compliance</span>
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400 block">
              {summary.overallSlaComplianceRate}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-black uppercase text-purple-600 block">Total Officers</span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block">
              {summary.totalUnitOfficers + summary.totalFieldOfficers}
            </span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="issues">Sort: Most Issues</option>
              <option value="resolution">Sort: Highest Resolution Rate</option>
              <option value="sla">Sort: Lowest SLA Compliance Rate</option>
              <option value="time">Sort: Slowest Avg Resolution Time</option>
              <option value="officers">Sort: Most Officers Assigned</option>
            </select>

            <span className="text-xs font-bold text-slate-500">
              Showing {filteredDepartments.length} departments
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search department name..."
              className="w-full pl-10 pr-9 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Department Cards Grid */}
      {filteredDepartments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <Building2 size={36} className="text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            No departments found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No department activity or officer assignments match your search filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepartments.map((dept) => (
            <DepartmentPerformanceCard
              key={dept.department}
              department={dept}
              onViewDepartment={(d) => setSelectedDeptModal(d)}
              onDownloadPdf={(deptKey) => setReportDialogState({ departmentKey: deptKey })}
            />
          ))}
        </div>
      )}

      {/* Department Details Modal */}
      {selectedDeptModal && (
        <DepartmentDetailsModal
          department={selectedDeptModal}
          onClose={() => setSelectedDeptModal(null)}
          onDownloadPdf={(deptKey) => {
            setSelectedDeptModal(null);
            setReportDialogState({ departmentKey: deptKey });
          }}
        />
      )}

      {/* PDF Export Dialog */}
      {reportDialogState && (
        <DepartmentReportDialog
          reportData={departmentData}
          defaultDepartment={reportDialogState.departmentKey === "all" ? null : reportDialogState.departmentKey}
          onClose={() => setReportDialogState(null)}
        />
      )}

    </div>
  );
}
