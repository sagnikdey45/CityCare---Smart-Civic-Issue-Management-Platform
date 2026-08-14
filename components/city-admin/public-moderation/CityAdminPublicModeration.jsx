import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Globe,
  Search,
  SlidersHorizontal,
  Eye,
  FileText,
  TrendingUp,
  CircleCheck as CheckCircle2,
  Clock,
  Loader2,
  X,
  Building2,
  Filter,
} from "lucide-react";
import { mapToMobilePublicIssues } from "../../../lib/issueMapper";
import PublicIssueModerationCard from "./PublicIssueModerationCard";
import PublicIssueModerationModal from "./PublicIssueModerationModal";
import PublicIssuePreviewModal from "./PublicIssuePreviewModal";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "road", label: "Road & Infrastructure" },
  { value: "electricity", label: "Electricity & Lighting" },
  { value: "water", label: "Water Supply" },
  { value: "sanitation", label: "Sanitation & Waste" },
  { value: "drainage", label: "Drainage & Sewer" },
  { value: "solid_waste", label: "Solid Waste Management" },
  { value: "public_health", label: "Public Health" },
  { value: "other", label: "Other" },
];

function StatsBar({ issues = [] }) {
  const published = issues.filter(
    (i) => i.publish_status === "published",
  ).length;
  const drafts = issues.filter((i) => i.publish_status === "draft").length;
  const totalViews = issues.reduce(
    (sum, i) => sum + Number(i.view_count || 0),
    0,
  );

  const stats = [
    {
      label: "Published",
      value: published,
      icon: Globe,
      colorText: "text-teal-600 dark:text-teal-400",
      bgColor:
        "bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800",
    },
    {
      label: "Drafts",
      value: drafts,
      icon: FileText,
      colorText: "text-amber-600 dark:text-amber-400",
      bgColor:
        "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    },
    {
      label: "Total Views",
      value: totalViews,
      icon: TrendingUp,
      colorText: "text-blue-600 dark:text-blue-400",
      bgColor:
        "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between transition-all hover:shadow-md ${s.bgColor}`}
          >
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                {s.label}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
                {s.value}
              </span>
            </div>
            <div
              className={`p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm ${s.colorText}`}
            >
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CityAdminPublicModeration({ cityAdminUserId, city }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "published" | "draft"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [moderatingIssue, setModeratingIssue] = useState(null);
  const [previewingIssue, setPreviewingIssue] = useState(null);
  const [toast, setToast] = useState(null);

  const rawIssues = useQuery(
    api.publicIssues.getCityPublicIssues,
    city ? { city } : "skip",
  );

  const publishPublicIssue = useMutation(api.publicIssues.publishPublicIssue);
  const unpublishPublicIssue = useMutation(
    api.publicIssues.unpublishPublicIssue,
  );
  const saveDraftPublicIssue = useMutation(
    api.publicIssues.saveDraftPublicIssue,
  );

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const issues = useMemo(
    () => mapToMobilePublicIssues(rawIssues ?? []),
    [rawIssues],
  );

  const handlePublish = useCallback(
    async (updated) => {
      try {
        await publishPublicIssue({
          id: updated.id,
          title: updated.title.trim(),
          publicCompletionNote: updated.publicCompletionNote?.trim() || "",
          foVisible: updated.foVisible,
          moderatedAt: Date.now(),
        });
        showToast(
          "Issue successfully published to public dashboard",
          "success",
        );
      } catch (error) {
        console.error("Failed to publish issue:", error);
        showToast("Failed to publish issue", "error");
      }
    },
    [publishPublicIssue, showToast],
  );

  const handleSaveDraft = useCallback(
    async (updated) => {
      try {
        await saveDraftPublicIssue({
          id: updated.id,
          title: updated.title.trim(),
          publicCompletionNote: updated.publicCompletionNote?.trim() || "",
          foVisible: updated.foVisible ?? true,
        });
        showToast("Draft saved successfully", "success");
      } catch (error) {
        console.error("Failed to save draft:", error);
        showToast("Failed to save draft", "error");
      }
    },
    [saveDraftPublicIssue, showToast],
  );

  const handleUnpublish = useCallback(
    async (id) => {
      try {
        await unpublishPublicIssue({ id });
        showToast("Issue moved back to drafts", "success");
      } catch (error) {
        console.error("Failed to unpublish issue:", error);
        showToast("Failed to unpublish issue", "error");
      }
    },
    [unpublishPublicIssue, showToast],
  );

  const filteredIssues = useMemo(() => {
    const q = search.trim().toLowerCase();
    return issues.filter((issue) => {
      const matchFilter =
        activeFilter === "all" ||
        (activeFilter === "published" &&
          issue.publish_status === "published") ||
        (activeFilter === "draft" && issue.publish_status === "draft");

      const matchCategory =
        categoryFilter === "all" ||
        String(issue.category || "").toLowerCase() ===
          categoryFilter.toLowerCase();

      const matchSearch =
        !q ||
        [
          issue.title,
          issue.original_issue_id,
          issue.ward,
          issue.category,
          issue.location,
        ].some((val) =>
          String(val || "")
            .toLowerCase()
            .includes(q),
        );

      return matchFilter && matchCategory && matchSearch;
    });
  }, [issues, search, activeFilter, categoryFilter]);

  // Loading state
  if (rawIssues === undefined) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <Loader2
          className="animate-spin text-teal-600 dark:text-teal-400 mx-auto"
          size={40}
        />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          Loading public moderation queue for {city || "city"}...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom duration-200 ${
            toast.type === "error"
              ? "bg-rose-600 text-white border-rose-500"
              : "bg-teal-600 text-white border-teal-500"
          }`}
        >
          <CheckCircle2 size={18} />
          <span className="text-xs font-bold">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-80"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="mt-5 relative overflow-hidden bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black uppercase tracking-wider text-teal-100 backdrop-blur-sm">
                <Building2 size={13} /> City Admin View: {city || "City-Wide"}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/30 text-xs font-black uppercase tracking-wider text-emerald-200">
                Live Moderation Queue
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <Globe size={28} className="text-teal-200 shrink-0" />
              Public Issue Moderation
            </h1>
            <p className="text-xs sm:text-sm font-medium text-teal-100/90 max-w-2xl leading-relaxed">
              Review and curate resolved or rejected civic issues across all
              departments in {city} before publishing them to the citizen-facing
              public portal.
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-xs font-bold">
              <CheckCircle2 size={14} className="text-emerald-300" />
              <span>
                {issues.filter((i) => i.publish_status === "published").length}{" "}
                Live
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-xs font-bold">
              <Clock size={14} className="text-amber-300" />
              <span>
                {issues.filter((i) => i.publish_status === "draft").length}{" "}
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Bar */}
      <StatsBar issues={issues} />

      {/* Filter, Category & Search Controls Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Filter Tabs (All / Published / Drafts) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: "all", label: "All", count: issues.length },
              {
                key: "published",
                label: "Published",
                count: issues.filter((i) => i.publish_status === "published")
                  .length,
              },
              {
                key: "draft",
                label: "Drafts",
                count: issues.filter((i) => i.publish_status === "draft")
                  .length,
              },
            ].map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    isActive
                      ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category Dropdown & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Category Dropdown */}
            <div className="relative shrink-0">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 cursor-pointer appearance-none"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Filter
                size={14}
                className="absolute left-3 top-3 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-3 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, ID, ward, category..."
                className="w-full pl-10 pr-9 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
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
      </div>

      {/* Results Section Summary Bar */}
      <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
        <span>
          Showing {filteredIssues.length} of {issues.length} public issues
        </span>
        <span className="flex items-center gap-1">
          <Eye size={13} />
          <span>
            {issues.reduce((s, i) => s + Number(i.view_count || 0), 0)} total
            public views
          </span>
        </span>
      </div>

      {/* Issue Card Grid */}
      {filteredIssues.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Globe size={32} />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {issues.length === 0
              ? "No public issues available for moderation"
              : "No matching public issues found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {issues.length === 0
              ? `Resolved and rejected civic issues for ${city || "this city"} will automatically synchronize here for review.`
              : "Try adjusting your search keywords, category filter, or moderation tab filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredIssues.map((issue) => (
            <PublicIssueModerationCard
              key={issue.id}
              issue={issue}
              onPreview={() => setPreviewingIssue(issue)}
              onModerate={() => setModeratingIssue(issue)}
              onUnpublish={() => handleUnpublish(issue.id)}
            />
          ))}
        </div>
      )}

      {/* Moderation Modal */}
      {moderatingIssue && (
        <PublicIssueModerationModal
          issue={moderatingIssue}
          onClose={() => setModeratingIssue(null)}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {/* Preview Modal */}
      {previewingIssue && (
        <PublicIssuePreviewModal
          issue={previewingIssue}
          onClose={() => setPreviewingIssue(null)}
        />
      )}
    </div>
  );
}
