import React, { useState, useEffect } from "react";
import {
  X,
  Globe,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CircleCheck as CheckCircle2,
  Tag,
  MapPin,
  UserX,
  Eye,
  EyeOff,
  Quote,
  Check,
  Edit3,
  CircleX,
  ChevronRight,
  Loader2,
  ImageIcon,
} from "lucide-react";
import PublicIssuePreviewModal from "./PublicIssuePreviewModal";

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

const REDACTION_ITEMS = [
  { icon: UserX, label: "Citizen name removed", color: "#EF4444" },
  { icon: Tag, label: "Phone number redacted", color: "#F59E0B" },
  { icon: MapPin, label: "Exact address anonymised", color: "#8B5CF6" },
  { icon: ShieldCheck, label: "Private notes excluded", color: "#0D9488" },
];

export default function PublicIssueModerationModal({
  issue,
  onClose,
  onPublish,
  onUnpublish,
  onSaveDraft,
}) {
  const [titleMode, setTitleMode] = useState("moderated");
  const [customTitle, setCustomTitle] = useState(issue?.title || "");

  const [summaryMode, setSummaryMode] = useState("moderated");
  const [customSummary, setCustomSummary] = useState(issue?.summary || "");

  const [resolvedBy, setResolvedBy] = useState(issue?.resolved_by || "");
  const [isPrivateResolvedBy, setIsPrivateResolvedBy] = useState(
    issue?.foVisible === false,
  );
  const [actionPrompt, setActionPrompt] = useState("none"); // "none" | "unpublish" | "draft"
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryKey = String(issue?.category || "").toLowerCase();
  const categoryLabel =
    CATEGORY_LABEL_MAP[categoryKey] || issue?.category || "General";
  const privateResolvedByText = `Field Officer - ${categoryLabel} Unit`;

  const wordCount = customSummary
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const hasMinWords = summaryMode === "original" || wordCount >= 20;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && actionPrompt === "none" && !showLivePreview) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, actionPrompt, showLivePreview]);

  if (!issue) return null;

  const finalTitle = titleMode === "original" ? issue.title : customTitle;
  const finalSummary =
    summaryMode === "original" ? issue.description : customSummary;

  const buildUpdated = () => ({
    id: issue.id,
    title: finalTitle.trim(),
    publicCompletionNote: finalSummary?.trim() || "",
    foVisible: !isPrivateResolvedBy,
    moderatedAt: Date.now(),
  });

  const handlePublish = async () => {
    if (!hasMinWords || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onPublish(buildUpdated());
      onClose();
    } catch (err) {
      console.error("Failed to publish issue:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onSaveDraft(buildUpdated());
      onClose();
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onUnpublish(issue.id);
      onClose();
    } catch (err) {
      console.error("Failed to unpublish issue:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPublished = issue.publish_status === "published";
  const isRejected = issue.status === "Rejected";

  const previewIssueObject = {
    ...issue,
    title: finalTitle,
    summary: finalSummary,
    resolved_by: isPrivateResolvedBy
      ? privateResolvedByText
      : resolvedBy || issue.resolved_by,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 shadow-sm">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-black text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                  {issue.original_issue_id || issue.id}
                </code>
                {isPublished ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <Globe size={11} /> Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    <FileText size={11} /> Draft
                  </span>
                )}
                {isRejected ? (
                  <span className="inline-flex items-center gap-1 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-rose-200 dark:border-rose-800">
                    <CircleX size={11} /> Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 size={11} /> Resolved
                  </span>
                )}
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                Moderate Public Issue • {categoryLabel}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLivePreview(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} />
              <span>Live Preview</span>
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Automatic Redaction Notice Banner */}
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={16}
                className="text-blue-600 dark:text-blue-400 shrink-0"
              />
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-200">
                Redaction Applied Automatically
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {REDACTION_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.color}22` }}
                      >
                        <Icon size={12} style={{ color: item.color }} />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>
                    <CheckCircle2
                      size={13}
                      className="text-teal-600 shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1. PUBLIC TITLE SECTION */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 size={15} className="text-teal-600 dark:text-teal-400" />
              Public Issue Title
            </h3>

            {/* Option A: Original Title */}
            <button
              type="button"
              onClick={() => setTitleMode("original")}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                titleMode === "original"
                  ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Quote size={13} />
                  <span>Keep Original Title</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    titleMode === "original"
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {titleMode === "original" && <Check size={12} />}
                </div>
              </div>
              <p className="text-sm font-medium italic text-slate-700 dark:text-slate-300">
                "{issue.title}"
              </p>
            </button>

            {/* Option B: Moderated Title */}
            <button
              type="button"
              onClick={() => setTitleMode("moderated")}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                titleMode === "moderated"
                  ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  <Edit3 size={13} />
                  <span>Use Moderated Title</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    titleMode === "moderated"
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {titleMode === "moderated" && <Check size={12} />}
                </div>
              </div>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                disabled={titleMode !== "moderated"}
                placeholder="Enter a refined public title..."
                className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </button>
          </div>

          {/* 2. PUBLIC DESCRIPTION / SUMMARY SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FileText
                  size={15}
                  className="text-teal-600 dark:text-teal-400"
                />
                {isRejected
                  ? "Public Explanation"
                  : "Public Resolution Description"}
              </h3>
            </div>

            {/* Option A: Keep Original */}
            <button
              type="button"
              onClick={() => setSummaryMode("original")}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                summaryMode === "original"
                  ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Quote size={13} />
                  <span>Keep Original Description</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    summaryMode === "original"
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {summaryMode === "original" && <Check size={12} />}
                </div>
              </div>
              <p className="text-xs font-medium italic text-slate-700 dark:text-slate-300 leading-relaxed">
                "{issue.description}"
              </p>
            </button>

            {/* Option B: Use Moderated Description */}
            <button
              type="button"
              onClick={() => setSummaryMode("moderated")}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                summaryMode === "moderated"
                  ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  <Edit3 size={13} />
                  <span>Use Moderated Description</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                      hasMinWords
                        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300"
                        : "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-300"
                    }`}
                  >
                    {wordCount} / 20 words min {hasMinWords ? "✓" : ""}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      summaryMode === "moderated"
                        ? "border-teal-500 bg-teal-500 text-white"
                        : "border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {summaryMode === "moderated" && <Check size={12} />}
                  </div>
                </div>
              </div>

              <textarea
                rows={4}
                value={customSummary}
                onChange={(e) => setCustomSummary(e.target.value)}
                disabled={summaryMode !== "moderated"}
                placeholder="Write a clear, citizen-friendly public resolution summary (minimum 20 words)..."
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 disabled:opacity-50 leading-relaxed"
              />
              {!hasMinWords && summaryMode === "moderated" && (
                <p className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>
                    Moderated description must contain at least 20 words before
                    publishing.
                  </span>
                </p>
              )}
            </button>
          </div>

          {/* 3. OFFICER IDENTITY PRIVACY (foVisible) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <UserX size={15} className="text-teal-600 dark:text-teal-400" />
              Resolved By (Public Attribution)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPrivateResolvedBy(true)}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 font-black text-xs transition-all cursor-pointer ${
                  isPrivateResolvedBy
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <EyeOff size={16} />
                <span>Keep Officer Identity Private (Anonymized)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivateResolvedBy(false)}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 font-black text-xs transition-all cursor-pointer ${
                  !isPrivateResolvedBy
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <Eye size={16} />
                <span>Show Officer Name Publicly</span>
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <span className="text-slate-400 block text-[10px] uppercase font-black mb-0.5">
                Public Attribution Preview:
              </span>
              <span className="text-slate-900 dark:text-white">
                {isPrivateResolvedBy
                  ? privateResolvedByText
                  : issue.resolved_by || "Field Officer Team"}
              </span>
            </div>
          </div>

          {/* 4. IMAGES PREVIEW */}
          {(issue.before_images?.length > 0 ||
            issue.after_images?.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon
                  size={15}
                  className="text-teal-600 dark:text-teal-400"
                />
                Evidence Images Attached
              </h3>

              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {issue.before_images?.map((url, i) => (
                  <div
                    key={`before-${i}`}
                    className="relative w-28 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0"
                  >
                    <img
                      src={url}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-black/70 text-[9px] font-black text-white">
                      BEFORE
                    </span>
                  </div>
                ))}
                {issue.after_images?.map((url, i) => (
                  <div
                    key={`after-${i}`}
                    className="relative w-28 h-20 rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-800 shrink-0"
                  >
                    <img
                      src={url}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-emerald-950/80 text-[9px] font-black text-emerald-300">
                      AFTER
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WARNING BANNER */}
          <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-200 text-xs font-bold">
            <AlertTriangle
              size={16}
              className="text-rose-500 shrink-0 mt-0.5"
            />
            <p className="leading-relaxed">
              Once published, this issue will be publicly visible to citizens on
              the CityCare transparency portal.
            </p>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md gap-4">
          <button
            type="button"
            onClick={() => setActionPrompt("draft")}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <FileText size={15} />
            <span>Save Draft</span>
          </button>

          <div className="flex items-center gap-3">
            {isPublished && (
              <button
                type="button"
                onClick={() => setActionPrompt("unpublish")}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-black text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CircleX size={15} />
                <span>Unpublish</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePublish}
              disabled={!hasMinWords || isSubmitting}
              className="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Globe size={15} />
                  <span>
                    {isPublished ? "Save & Republish" : "Publish Now"}
                  </span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Confirmation Dialog Overlay */}
        {actionPrompt !== "none" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    actionPrompt === "unpublish"
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600"
                      : "bg-blue-100 dark:bg-blue-950/60 text-blue-600"
                  }`}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {actionPrompt === "unpublish"
                      ? "Unpublish Issue?"
                      : "Save as Draft?"}
                  </h4>
                  <p className="text-xs font-bold text-slate-500">
                    {actionPrompt === "unpublish"
                      ? "Move this issue back to Draft and remove it from the public transparency dashboard?"
                      : "Save your current moderation changes as a Draft?"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActionPrompt("none")}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActionPrompt("none");
                    if (actionPrompt === "unpublish") {
                      handleUnpublish();
                    } else {
                      handleSaveDraft();
                    }
                  }}
                  className={`px-5 py-2 text-xs font-black text-white rounded-xl ${
                    actionPrompt === "unpublish"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {actionPrompt === "unpublish" ? "Unpublish" : "Save Draft"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Preview Overlay */}
        {showLivePreview && (
          <PublicIssuePreviewModal
            issue={previewIssueObject}
            onClose={() => setShowLivePreview(false)}
          />
        )}
      </div>
    </div>
  );
}
