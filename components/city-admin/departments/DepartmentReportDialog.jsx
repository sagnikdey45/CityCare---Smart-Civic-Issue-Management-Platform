import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Palette,
  Printer,
  Check,
  Download,
  Loader2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { generateDepartmentReportPdf } from "./departmentReportPdf";

export default function DepartmentReportDialog({
  reportData,
  defaultDepartment = null,
  onClose,
}) {
  const [appearance, setAppearance] = useState("color"); // "color" | "grayscale"
  const [selectedDeptKey, setSelectedDeptKey] = useState(defaultDepartment || "all");
  const [dateRange, setDateRange] = useState("All Time");
  const [isGenerating, setIsGenerating] = useState(false);

  const [sections, setSections] = useState({
    summary: true,
    departmentPerf: true,
    statusBreakdown: true,
    slaAnalysis: true,
    unitOfficers: true,
    fieldOfficers: true,
    issueRecords: true,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isGenerating) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isGenerating]);

  if (!reportData) return null;

  const departments = reportData.departments || [];
  const selectedDeptObj =
    selectedDeptKey === "all"
      ? null
      : departments.find((d) => d.department === selectedDeptKey);

  const scopeTitle = selectedDeptObj ? selectedDeptObj.label : "All Departments (City-Wide)";

  const handleToggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);

      // Filter dataset for single department if selected
      const filteredReportData = {
        ...reportData,
        departments: selectedDeptObj ? [selectedDeptObj] : departments,
      };

      await generateDepartmentReportPdf({
        reportData: filteredReportData,
        scopeTitle,
        departmentKey: selectedDeptKey === "all" ? null : selectedDeptKey,
        appearance,
        sections,
        dateRange,
      });

      onClose();
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Export Department PDF Report
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Generate formatted PDF report for {reportData.scope?.city || "city"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* 1. REPORT SCOPE SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Report Scope *
            </label>
            <select
              value={selectedDeptKey}
              onChange={(e) => setSelectedDeptKey(e.target.value)}
              disabled={isGenerating}
              className="w-full px-4 py-3 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Departments (City-Wide Summary)</option>
              {departments.map((d) => (
                <option key={d.department} value={d.department}>
                  {d.label} ({d.metrics.totalIssues} issues, {d.unitOfficers.length + d.fieldOfficers.length} officers)
                </option>
              ))}
            </select>
          </div>

          {/* 2. APPEARANCE OPTION CARDS */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Report Appearance Theme *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Color Card */}
              <button
                type="button"
                onClick={() => setAppearance("color")}
                className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                  appearance === "color"
                    ? "border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-black text-xs">
                    <Palette size={16} className="text-sky-600 dark:text-sky-400" />
                    <span>Color Report</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    appearance === "color" ? "border-sky-500 bg-sky-500 text-white" : "border-slate-300"
                  }`}>
                    {appearance === "color" && <Check size={12} />}
                  </div>
                </div>
                <p className="text-[11px] font-medium leading-relaxed opacity-90">
                  Uses CityCare sky/blue headers, status tags, and accent tables. Ideal for digital distribution and presentations.
                </p>
              </button>

              {/* Grayscale Card */}
              <button
                type="button"
                onClick={() => setAppearance("grayscale")}
                className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                  appearance === "grayscale"
                    ? "border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-black text-xs">
                    <Printer size={16} className="text-slate-700 dark:text-slate-300" />
                    <span>Grayscale Report</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    appearance === "grayscale" ? "border-slate-700 bg-slate-700 text-white" : "border-slate-300"
                  }`}>
                    {appearance === "grayscale" && <Check size={12} />}
                  </div>
                </div>
                <p className="text-[11px] font-medium leading-relaxed opacity-90">
                  Black, white, and gray high-contrast theme optimized for official filing, printing, and paper archiving.
                </p>
              </button>
            </div>
          </div>

          {/* 3. DATE RANGE SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Reporting Period *
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {["All Time", "Today", "Last 7 Days", "Last 30 Days", "Last 90 Days"].map((rng) => (
                <button
                  key={rng}
                  type="button"
                  onClick={() => setDateRange(rng)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dateRange === rng
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {rng}
                </button>
              ))}
            </div>
          </div>

          {/* 4. INCLUDED SECTIONS */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Included PDF Report Sections
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: "summary", label: "Executive Summary & KPIs" },
                { key: "departmentPerf", label: "Department Performance Summary" },
                { key: "statusBreakdown", label: "Status & Priority Breakdown" },
                { key: "slaAnalysis", label: "SLA & Escalation Analysis" },
                { key: "unitOfficers", label: "Unit Officer Operational Metrics" },
                { key: "fieldOfficers", label: "Field Officer Workload Metrics" },
                { key: "issueRecords", label: "Complete Issue Records Log" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                >
                  <input
                    type="checkbox"
                    checked={sections[item.key] !== false}
                    onChange={() => handleToggleSection(item.key)}
                    disabled={isGenerating}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* PREVIEW SUMMARY BADGE */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl flex items-center justify-between text-xs font-bold text-indigo-950 dark:text-indigo-200">
            <div className="space-y-0.5">
              <span className="block font-black text-[10px] uppercase text-indigo-600 dark:text-indigo-400">
                Report Output Summary
              </span>
              <span>
                {scopeTitle} • Theme: {appearance.toUpperCase()} • Period: {dateRange}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-black text-[10px]">
              Landscape A4
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
