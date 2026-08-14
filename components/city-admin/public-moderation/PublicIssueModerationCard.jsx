import React, { useState } from "react";
import {
  MapPin,
  Eye,
  FileEdit,
  Globe,
  CircleCheck as CheckCircle2,
  Clock,
  FileX,
  Tag,
  EyeOff,
  Sparkles,
  CircleX,
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
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
  },
  electricity: {
    text: "text-yellow-700 dark:text-yellow-300",
    bg: "bg-yellow-100 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-800",
  },
  water: {
    text: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
  },
  sanitation: {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
  },
  drainage: {
    text: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-100 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800",
  },
  solid_waste: {
    text: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-100 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800",
  },
  public_health: {
    text: "text-pink-700 dark:text-pink-300",
    bg: "bg-pink-100 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800",
  },
  other: {
    text: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
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

export default function PublicIssueModerationCard({
  issue,
  onPreview,
  onModerate,
  onUnpublish,
}) {
  const [confirmingUnpublish, setConfirmingUnpublish] = useState(false);

  const isPublished = issue.publish_status === "published";
  const isRejected = issue.status === "Rejected";

  const categoryKey = String(issue.category || "").toLowerCase();
  const categoryLabel =
    CATEGORY_LABEL_MAP[categoryKey] || issue.category || "General";
  const categoryStyle = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.other;

  const hasBeforeImg =
    Array.isArray(issue.before_images) && issue.before_images.length > 0;
  const hasAfterImg =
    Array.isArray(issue.after_images) && issue.after_images.length > 0;

  const handleCardClick = (e) => {
    if (e.defaultPrevented) return;
    onModerate();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden cursor-pointer ${
        isPublished
          ? "border-teal-300 dark:border-teal-800/60 shadow-teal-500/5"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Published Top Accent Bar */}
      {isPublished && (
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />
      )}

      {/* Top Image Thumbnails Header */}
      {(hasBeforeImg || hasAfterImg) && (
        <div className="relative h-44 w-full flex bg-slate-950 overflow-hidden">
          {hasBeforeImg && (
            <div className="relative flex-1 h-full">
              <img
                src={issue.before_images[0]}
                alt="Before"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-black tracking-widest text-white border border-white/20 uppercase">
                BEFORE
              </span>
            </div>
          )}

          {hasBeforeImg && hasAfterImg && (
            <div className="w-[2px] h-full bg-white dark:bg-slate-900 z-10" />
          )}

          {hasAfterImg && (
            <div className="relative flex-1 h-full">
              <img
                src={issue.after_images[0]}
                alt="After"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-950/20 to-transparent" />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-emerald-950/70 backdrop-blur-md text-[10px] font-black tracking-widest text-emerald-300 border border-emerald-400/30 uppercase">
                AFTER
              </span>
            </div>
          )}

          {hasBeforeImg && !hasAfterImg && (
            <div className="flex-1 h-full bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center border-l border-slate-200 dark:border-slate-800 text-slate-400">
              <FileX size={24} />
              <span className="text-[11px] font-bold mt-1 text-slate-400">
                No After Image
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Card Body */}
      <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Status & Category Badges Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center flex-wrap gap-2">
              {/* Resolved/Rejected */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border ${
                  isRejected
                    ? "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800"
                    : "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800"
                }`}
              >
                {isRejected ? (
                  <CircleX size={12} />
                ) : (
                  <CheckCircle2 size={12} />
                )}
                <span>{issue.status}</span>
              </span>

              {/* Category */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border ${categoryStyle.bg} ${categoryStyle.text}`}
              >
                <Tag size={12} />
                <span>{categoryLabel}</span>
              </span>

              {/* Published / Draft */}
              {isPublished ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                  <Globe size={11} />
                  <span>Published</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                  <Clock size={11} />
                  <span>Draft</span>
                </span>
              )}
            </div>

            {/* View Count */}
            {issue.view_count !== undefined && issue.view_count > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                <Eye size={12} />
                <span>{issue.view_count} views</span>
              </div>
            )}
          </div>

          {/* Issue Title */}
          <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {issue.title}
          </h3>

          {/* Original Issue ID & Location */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
              {issue.original_issue_id || issue.id}
            </span>
            <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400 truncate">
              <MapPin size={12} className="shrink-0 text-slate-400" />
              <span className="truncate">
                {issue.ward} • {issue.location}
              </span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {issue.summary || issue.description}
          </p>
        </div>

        {/* Footer Meta & Action CTAs */}
        <div className="space-y-3 pt-2">
          {/* Performer & Date info */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[65%]">
              {isRejected ? "Rejected" : "Resolved"} by{" "}
              {issue.resolved_by || "Field Officer Team"}
            </span>
            <span className="font-bold text-slate-400 shrink-0">
              {formatDate(issue.resolved_date)}
            </span>
          </div>

          {/* Action CTAs Row */}
          <div
            className="flex items-center gap-2 pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview CTA */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>

            {/* Moderate CTA */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onModerate();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileEdit size={14} />
              <span>{isPublished ? "Edit Moderation" : "Moderate"}</span>
            </button>

            {/* Unpublish CTA (if Published) or Publish CTA (if Draft) */}
            {isPublished ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmingUnpublish(true);
                }}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Unpublish this issue"
              >
                <EyeOff size={14} />
                <span>Unpublish</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onModerate();
                }}
                className="py-2.5 px-3 rounded-xl font-black text-xs bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Publish</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unpublish Inline Confirmation Modal */}
      {confirmingUnpublish && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <CircleX size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Unpublish Issue?
                </h4>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  This issue will be removed from the public portal and returned
                  to Draft.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingUnpublish(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingUnpublish(false);
                  onUnpublish();
                }}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
              >
                Move to Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
