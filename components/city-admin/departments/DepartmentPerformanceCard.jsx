import React from "react";
import {
  Building2,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Eye,
  TrendingUp,
  Award,
} from "lucide-react";

export default function DepartmentPerformanceCard({
  department,
  onViewDepartment,
  onDownloadPdf,
}) {
  const m = department.metrics;

  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      
      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {department.label}
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {m.unitOfficerCount} Unit Officers • {m.fieldOfficerCount} Field Officers
              </span>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs">
            {m.totalIssues} Issues
          </span>
        </div>

        {/* Resolution Rate Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500">Resolution Rate:</span>
            <span className="text-slate-900 dark:text-white font-black">{m.resolutionRate}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, m.resolutionRate)}%` }}
            />
          </div>
        </div>

        {/* 2x2 Quick Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Active / Resolved</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {m.activeIssues} <span className="text-slate-400 font-medium">active</span> / {m.resolvedIssues + m.closedIssues} <span className="text-emerald-600 font-medium">done</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 block">SLA Compliance</span>
            <span className={`text-sm font-black ${m.slaComplianceRate >= 90 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {m.slaComplianceRate}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Avg Resolution Time</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {m.avgResolutionHours > 0 ? `${m.avgResolutionHours} hrs` : "N/A"}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Workforce Avg Eff</span>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
              {m.averageFieldOfficerEfficiency}%
            </span>
          </div>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="flex items-center gap-2 pt-5 border-t border-slate-100 dark:border-slate-800 mt-4">
        <button
          type="button"
          onClick={() => onViewDepartment(department)}
          className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Eye size={14} />
          <span>View Department</span>
        </button>

        <button
          type="button"
          onClick={() => onDownloadPdf(department.department)}
          className="py-2.5 px-3.5 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          title="Download PDF Report for this Department"
        >
          <Download size={14} />
          <span>Report</span>
        </button>
      </div>

    </div>
  );
}
