import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  Download,
  Activity,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import OfficerPerformanceTable from "./OfficerPerformanceTable";
import DepartmentIssuesTable from "./DepartmentIssuesTable";

export default function DepartmentDetailsModal({
  department,
  onClose,
  onDownloadPdf,
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "issues" | "uo" | "fo"

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!department) return null;

  const m = department.metrics;
  const issues = department.issues || [];
  const uos = department.unitOfficers || [];
  const fos = department.fieldOfficers || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-7xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {department.label} Department
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                  {m.totalIssues} Total Issues
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {uos.length} Unit Officers • {fos.length} Field Officers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onDownloadPdf(department.department)}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download size={15} />
              <span>Download Department PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 overflow-x-auto">
          {[
            { id: "overview", label: "Department Overview", icon: Activity },
            { id: "issues", label: `Department Issues (${issues.length})`, icon: FileText },
            { id: "uo", label: `Unit Officers (${uos.length})`, icon: ShieldCheck },
            { id: "fo", label: `Field Officers (${fos.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Primary KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
                  <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 block">
                    Active Issues
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block">
                    {m.activeIssues}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">Currently in resolution pipeline</span>
                </div>

                <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 block">
                    Resolution Rate
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block">
                    {m.resolutionRate}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{m.resolvedIssues + m.closedIssues} resolved / closed</span>
                </div>

                <div className="p-5 rounded-3xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-1">
                  <span className="text-xs font-black uppercase text-sky-600 dark:text-sky-400 block">
                    SLA Compliance
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block">
                    {m.slaComplianceRate}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">{m.slaBreachedIssues} breached SLA</span>
                </div>

                <div className="p-5 rounded-3xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                  <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 block">
                    Avg Resolution Time
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block">
                    {m.avgResolutionHours > 0 ? `${m.avgResolutionHours} hrs` : "N/A"}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {m.avgResolutionDays > 0 ? `~${m.avgResolutionDays} days` : "No resolved issues"}
                  </span>
                </div>
              </div>

              {/* Priority & Status Distribution Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Priority Breakdown */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Priority Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl">
                      <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-300 block">Critical</span>
                      <span className="text-xl font-black text-rose-900 dark:text-rose-100">
                        {department.priorityBreakdown?.critical ?? 0}
                      </span>
                    </div>

                    <div className="p-3.5 bg-orange-100/60 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-2xl">
                      <span className="text-[10px] font-black uppercase text-orange-700 dark:text-orange-300 block">High</span>
                      <span className="text-xl font-black text-orange-900 dark:text-orange-100">
                        {department.priorityBreakdown?.high ?? 0}
                      </span>
                    </div>

                    <div className="p-3.5 bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl">
                      <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300 block">Medium</span>
                      <span className="text-xl font-black text-amber-900 dark:text-amber-100">
                        {department.priorityBreakdown?.medium ?? 0}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-200/60 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl">
                      <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 block">Low</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {department.priorityBreakdown?.low ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Breakdown Grid */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Status Distribution
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { label: "Pending", val: department.statusBreakdown?.pending },
                      { label: "Verified", val: department.statusBreakdown?.verified },
                      { label: "Assigned", val: department.statusBreakdown?.assigned },
                      { label: "In Progress", val: department.statusBreakdown?.in_progress },
                      { label: "Resolved", val: department.statusBreakdown?.resolved },
                      { label: "Closed", val: department.statusBreakdown?.closed },
                      { label: "Rejected", val: department.statusBreakdown?.rejected },
                      { label: "Withdrawn", val: department.statusBreakdown?.withdrawn },
                      { label: "Escalated", val: m.activeEscalations },
                    ].map((s) => (
                      <div key={s.label} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block">{s.label}</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">{s.val ?? 0}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Officer Aggregate Performance Summary */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Officer Workforce & Efficiency Metrics
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 block">UO Avg Efficiency</span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {m.averageUnitOfficerEfficiency}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 block">FO Avg Efficiency</span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {m.averageFieldOfficerEfficiency}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 block">FO On-Time Rate</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {m.averageFieldOfficerOnTimeRate}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 block">Avg FO Workload</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {m.averageFieldOfficerWorkload}%
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ISSUES TABLE */}
          {activeTab === "issues" && (
            <DepartmentIssuesTable issues={issues} />
          )}

          {/* TAB 3: UNIT OFFICERS TABLE */}
          {activeTab === "uo" && (
            <OfficerPerformanceTable officers={uos} type="uo" />
          )}

          {/* TAB 4: FIELD OFFICERS TABLE */}
          {activeTab === "fo" && (
            <OfficerPerformanceTable officers={fos} type="fo" />
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">
            {department.label} • {issues.length} Issues • {uos.length + fos.length} Officers
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
