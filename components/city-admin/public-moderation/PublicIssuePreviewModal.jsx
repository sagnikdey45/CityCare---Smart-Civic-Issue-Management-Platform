import React, { useEffect } from "react";
import {
  X,
  Globe,
  MapPin,
  CircleCheck as CheckCircle2,
  CircleX as XCircle,
  Tag,
  ShieldCheck,
  ArrowLeft,
  Info,
  Clock,
  FileText,
  Quote,
  Image as ImageIcon,
} from "lucide-react";

const CATEGORY_LABEL_MAP = {
  road: "Road & Infrastructure",
  electricity: "Electricity & Lighting",
  water: "Water Supply",
  sanitation: "Sanitation & Waste",
  drainage: "Drainage & Sewer",
  solid_waste: "Solid Waste Management",
  public_health: "Public Health",
  other: "Other",
};

const CATEGORY_STYLES = {
  road: {
    color: "#D97706",
    bg: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
  electricity: {
    color: "#CA8A04",
    bg: "bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  },
  water: {
    color: "#2563EB",
    bg: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  sanitation: {
    color: "#16A34A",
    bg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  drainage: {
    color: "#0284C7",
    bg: "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  },
  solid_waste: {
    color: "#059669",
    bg: "bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  },
  public_health: {
    color: "#DB2777",
    bg: "bg-pink-100 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  },
  other: {
    color: "#64748B",
    bg: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PublicIssuePreviewModal({ issue, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!issue) return null;

  const isRejected = issue.status === "Rejected";
  const StatusIcon = isRejected ? XCircle : CheckCircle2;
  const statusColorClass = isRejected
    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
    : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";

  const categoryKey = String(issue.category || "").toLowerCase();
  const categoryLabel =
    CATEGORY_LABEL_MAP[categoryKey] || issue.category || "General";
  const categoryStyle = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.other;

  const hasBeforeImg =
    Array.isArray(issue.before_images) && issue.before_images.length > 0;
  const hasAfterImg =
    Array.isArray(issue.after_images) && issue.after_images.length > 0;

  // Anonymized location for public preview
  const publicLocation = issue.ward
    ? `${issue.ward}, ${issue.location?.split(",").slice(-1)[0]?.trim() || "CityCare Region"}`
    : issue.location || "CityCare Public Portal";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] bg-slate-50 dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Sticky Portal Top Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <ArrowLeft size={16} />
              <span>Exit Preview</span>
            </button>
            <div className="h-4 w-[1px] bg-white/20" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider">
              <Globe size={13} className="text-teal-200" />
              <span>CityCare Public Portal • Live Preview</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Portal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Header Meta Chips & Title */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${statusColorClass}`}
              >
                <StatusIcon size={13} />
                <span>{issue.status}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${categoryStyle.bg}`}
              >
                <Tag size={13} />
                <span>{categoryLabel}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm">
                <span>Issue #{issue.original_issue_id || issue.id}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {issue.title}
            </h1>

            <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                <MapPin size={16} />
              </div>
              <span>{publicLocation}</span>
            </div>
          </div>

          {/* Citizen Description / Report */}
          {issue.description && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <FileText size={15} />
                <span>Citizen Report</span>
              </div>

              <div className="relative p-6 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <Quote
                  size={60}
                  className="absolute -right-2 -bottom-2 text-slate-100 dark:text-slate-800/40 pointer-events-none"
                />
                <p className="relative z-10 text-sm sm:text-base font-medium italic text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{issue.description}"
                </p>
              </div>
            </div>
          )}

          {/* Issue Timeline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <Clock size={15} />
              <span>Public Issue Timeline</span>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Reported */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  </div>
                  <div className="w-[2px] h-10 bg-slate-200 dark:bg-slate-800 mt-2" />
                </div>
                <div className="pt-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Reported by Citizen
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatDate(issue.created_at)}
                  </p>
                </div>
              </div>

              {/* Reviewed */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="w-[2px] h-10 bg-slate-200 dark:bg-slate-800 mt-2" />
                </div>
                <div className="pt-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Reviewed & Verified
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Reviewed by {issue.moderated_by || "Unit Officer"} •{" "}
                    {formatDate(issue.reviewed_at || issue.moderated_at)}
                  </p>
                </div>
              </div>

              {/* Resolved or Rejected */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    isRejected
                      ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                      : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <StatusIcon size={16} />
                </div>
                <div className="pt-1">
                  <h4
                    className={`text-sm font-black ${isRejected ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
                  >
                    {isRejected ? "Rejected" : "Resolved"} by{" "}
                    {issue.resolved_by || "Field Officer Team"}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatDate(issue.resolved_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Gallery (Before & After Images) */}
          {(hasBeforeImg || hasAfterImg) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <ImageIcon size={15} />
                <span>Verification Evidence</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hasBeforeImg && (
                  <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group aspect-[16/10]">
                    <img
                      src={issue.before_images[0]}
                      alt="Before evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-black tracking-widest text-white uppercase">
                      BEFORE
                    </div>
                  </div>
                )}

                {hasAfterImg && (
                  <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group aspect-[16/10]">
                    <img
                      src={issue.after_images[0]}
                      alt="After evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-emerald-950/70 backdrop-blur-md border border-emerald-400/30 text-[10px] font-black tracking-widest text-emerald-300 uppercase">
                      AFTER
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Public Summary / Public Completion Note */}
          <div className="space-y-3">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                  <Info size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Official Public Explanation
                </h3>
              </div>

              {isRejected && issue.rejection_reason && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                    Rejection Reason
                  </span>
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200 leading-relaxed">
                    {issue.rejection_reason}
                  </p>
                </div>
              )}

              <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                {issue.summary ||
                  (isRejected
                    ? "This issue was reviewed and rejected based on official verification."
                    : "Issue resolution verified and updated on the public transparency portal.")}
              </p>
            </div>
          </div>

          {/* Privacy Guarantee Footer Note */}
          <div className="flex items-center gap-3.5 p-4 bg-blue-50/70 dark:bg-slate-900/60 border border-blue-200/80 dark:border-slate-800 rounded-2xl">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
              Personal information has been removed from this public record to
              protect citizen privacy.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">
            Moderated by {issue.moderated_by || "Unit Officer"}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
