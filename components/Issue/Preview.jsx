import {
  X,
  MapPin,
  Tag,
  AlertTriangle,
  Shield,
  Mail,
  Loader2,
  Lightbulb,
  Droplets,
  Trash2,
  ClipboardList,
  Map,
} from "lucide-react";
import MediaPreview from "./MediaPreview";
import { useMutation, useQuery } from "convex/react";
import { duplicateTracker } from "@/lib/duplicateTracker";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const PreviewModal = ({
  formData,
  setFormData,
  onClose,
  setCurrentStep,
  onSubmit,
  isSubmitting,
}) => {
  const { data: session, status } = useSession();
  const [duplicates, setDuplicates] = useState([]);
  // values: "cancel" | "submit"
  const [dialogType, setDialogType] = useState(null);

  const hasStrongDuplicate = duplicates.some((dup) => dup.strongDuplicate);

  // Only run query when:
  // 1. Session finished loading
  // 2. User authenticated
  // 3. City exists
  const activeIssues = useQuery(
    api.duplicateIssues.getActiveIssuesForDuplicateCheck,
    status === "authenticated" && formData.city
      ? {
          city: formData.city,
        }
      : "skip",
  );

  // Filter only issues posted by same citizen
  const filteredIssues = useMemo(() => {
    if (!activeIssues || !session?.user?.id) return [];

    return activeIssues.filter((issue) => issue.reportedBy === session.user.id);
  }, [activeIssues, session?.user?.id]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!filteredIssues.length) return;
    if (!formData.title || !formData.description) return;

    const results = duplicateTracker(formData, filteredIssues);

    // Attach full issue details
    const enrichedResults = results.map((dup) => {
      const fullIssue = filteredIssues.find(
        (issue) => issue._id === dup.issueId,
      );

      return {
        ...dup,
        fullIssue,
      };
    });

    setDuplicates(enrichedResults);
  }, [formData, filteredIssues]);

  const deleteMedia = useMutation(api.issuesMedia.deleteMedia);

  const handleCancelSubmission = async () => {
    try {
      // Delete all photos
      if (formData.photos?.length > 0) {
        await Promise.all(
          formData.photos.map((storageId) => deleteMedia({ storageId })),
        );
      }

      // Delete video if exists
      if (formData.videos) {
        await deleteMedia({ storageId: formData.videos });
      }

      // Reset duplicate state
      setDuplicates([]);

      // Resets Issue Data
      setFormData({
        title: "",
        description: "",
        category: "",
        subcategory: [],
        otherCategoryName: "",
        priority: "",
        tags: [],
        photos: [],
        videos: null,

        searchQuery: "",
        address: "",
        city: "",
        state: "",
        postal: "",
        latitude: 20.5937,
        longitude: 78.9629,
        googleMapUrl: "",

        isAnonymous: false,
        additionalEmail: "",

        createdAt: Date.now(),
      });

      // Reset to Step 1
      setCurrentStep(1);

      // Close modal
      onClose();
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  const getCategoryLabel = (value) => {
    switch (value) {
      case "road":
        return (
          <span className="inline-flex items-center gap-1">
            <Map className="text-emerald-600 dark:text-emerald-400" size={18} />
            Road & Infrastructure
          </span>
        );
      case "lighting":
        return (
          <span className="inline-flex items-center gap-1">
            <Lightbulb
              className="text-yellow-500 dark:text-yellow-400"
              size={18}
            />
            Street Lighting
          </span>
        );
      case "water":
        return (
          <span className="inline-flex items-center gap-1">
            <Droplets className="text-cyan-600 dark:text-cyan-400" size={18} />
            Water & Drainage
          </span>
        );
      case "waste":
        return (
          <span className="inline-flex items-center gap-1">
            <Trash2 className="text-green-600 dark:text-green-400" size={18} />
            Waste Management
          </span>
        );
      case "other":
        return (
          <span className="inline-flex items-center gap-1">
            <ClipboardList
              className="text-gray-600 dark:text-gray-400"
              size={18}
            />
            Other
          </span>
        );
      default:
        return (
          <span className="text-gray-500 italic">
            Unknown Category: {String(value || "N/A")}
          </span>
        );
    }
  };

  const getSeverityColor = (value) => {
    const colors = {
      low: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
      medium:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
    };
    return colors[value] || "";
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-50">
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl shadow-black/40 max-w-5xl w-full max-h-[92vh] flex flex-col" style={{animation: 'slideUp 0.25s ease-out'}}>

        {/* ── Gradient top accent ── */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 z-10" />

        {/* ── Subtle inner glow ── */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 via-transparent to-cyan-50/10 dark:from-emerald-950/15 dark:via-transparent dark:to-transparent pointer-events-none z-0" />

        {/* ── Header ── */}
        <div className="relative z-10 flex-shrink-0 overflow-hidden">
          <div className="relative bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 px-6 py-5 flex items-center justify-between">
            {/* Ambient orb */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white leading-tight">Review Your Report</h2>
                <p className="text-xs text-white/70 font-medium">Check all details before submitting</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="relative w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all disabled:opacity-50 hover:scale-110"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ── Title & Description ── */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/60 p-5">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-emerald-500" />
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2 pl-1">
              {formData.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pl-1">
              {formData.description}
            </p>
          </div>

          {/* ── Section divider ── */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Classification</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          </div>

          {/* ── Category & Severity ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/60 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-wide">
                <Tag size={13} />
                Category
              </div>
              <p className="text-slate-800 dark:text-slate-100 font-bold text-sm">
                {getCategoryLabel(formData.category)}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/60 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-wide">
                <AlertTriangle size={13} />
                Severity
              </div>
              <span className={`inline-block px-3 py-1 rounded-full border-2 font-bold text-xs ${getSeverityColor(formData.priority)}`}>
                {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
              </span>
            </div>
          </div>

          {/* ── Sub-categories ── */}
          {formData.subcategory?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/60 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 font-bold uppercase tracking-wide">
                <Tag size={13} />
                Sub-Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.subcategory.map((sub, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Tags ── */}
          {formData.tags?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/60 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 font-bold uppercase tracking-wide">
                <Tag size={13} />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-700/60 text-cyan-700 dark:text-cyan-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Section divider ── */}
          {(formData.photos?.length > 0 || formData.videos?.length > 0) && (
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Evidence</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            </div>
          )}

          {/* ── Media Evidence ── */}
          {(formData.photos?.length > 0 || formData.videos?.length > 0) && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/60 p-4 space-y-4">
              {formData.photos?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Photos ({formData.photos.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.photos.map((id) => (
                      <div key={id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                        <MediaPreview storageId={id} isVideo={false} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {formData.videos && (
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Video</p>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                    <MediaPreview storageId={formData.videos} isVideo />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Section divider ── */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Location</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          </div>

          {/* ── Location card ── */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 dark:border-emerald-700/40 bg-emerald-50/60 dark:bg-slate-800/60">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-emerald-500" />
            <div className="flex items-start gap-3 pl-5 pr-4 py-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">{formData.address}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Duplicate Detection */}
          {duplicates.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl border border-yellow-200/80 dark:border-yellow-700/60 bg-white/90 dark:bg-gray-900/70 shadow-2xl">
              {/* Ambient gradient + subtle pattern */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-yellow-300/25 blur-3xl" />
                <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
                <div
                  className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                    backgroundSize: "18px 18px",
                  }}
                />
              </div>

              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-2xl border border-yellow-200/70 dark:border-yellow-700/60 bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-900/25 dark:to-amber-900/10 p-3 shadow-sm">
                      <AlertTriangle
                        className="text-yellow-700 dark:text-yellow-300"
                        size={22}
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                        Similar Active Issues Found
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        We detected issues that look very similar to your
                        report. Review them to avoid redundancy.
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-200 dark:border-yellow-700/60 bg-yellow-50/70 dark:bg-yellow-900/20 px-3 py-1 text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                          Threshold:{" "}
                          <span className="font-extrabold">{70}</span>/100
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/40 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200">
                          Matches:{" "}
                          <span className="font-extrabold">
                            {duplicates.length}
                          </span>
                        </span>

                        {hasStrongDuplicate && (
                          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 dark:border-red-700/60 bg-red-50/70 dark:bg-red-900/20 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
                            <AlertTriangle size={14} />
                            Strong duplicate detected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional quick hint chip */}
                  <div className="hidden sm:flex items-center">
                    <span className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/40 px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
                      Tip: click “Edit Report” to adjust details.
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative h-px w-full bg-gradient-to-r from-transparent via-yellow-200/70 dark:via-yellow-700/50 to-transparent" />

              {/* List */}
              <div className="relative px-6 py-5">
                <div className="space-y-4">
                  {duplicates.map((dup) => {
                    const isStrong = dup.strongDuplicate || dup.score >= 85;

                    return (
                      <div
                        key={dup.issueId}
                        className={[
                          "group relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-900",
                          "shadow-sm hover:shadow-xl transition-all duration-300",
                          isStrong
                            ? "border-red-200/80 dark:border-red-700/60"
                            : "border-yellow-200/80 dark:border-yellow-700/60",
                        ].join(" ")}
                      >
                        {/* Left accent */}
                        <div
                          className={[
                            "absolute left-0 top-0 h-full w-1.5",
                            isStrong
                              ? "bg-gradient-to-b from-red-500/80 via-rose-500/70 to-amber-400/40"
                              : "bg-gradient-to-b from-yellow-400/90 via-amber-400/70 to-transparent",
                          ].join(" ")}
                        />

                        {/* Subtle hover wash */}
                        <div
                          className={[
                            "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                            isStrong
                              ? "bg-gradient-to-r from-red-50/60 via-transparent to-transparent dark:from-red-900/15"
                              : "bg-gradient-to-r from-yellow-50/60 via-transparent to-transparent dark:from-yellow-900/10",
                          ].join(" ")}
                        />

                        <div className="relative p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            {/* Main content */}
                            <div className="min-w-0 space-y-2">
                              <div className="flex items-start gap-3">
                                <div
                                  className={[
                                    "mt-0.5 rounded-xl border p-2 shadow-sm",
                                    isStrong
                                      ? "border-red-200/70 dark:border-red-700/60 bg-red-50/70 dark:bg-red-900/15"
                                      : "border-yellow-200/70 dark:border-yellow-700/60 bg-yellow-50/70 dark:bg-yellow-900/15",
                                  ].join(" ")}
                                >
                                  <AlertTriangle
                                    size={16}
                                    className={
                                      isStrong
                                        ? "text-red-600 dark:text-red-300"
                                        : "text-yellow-700 dark:text-yellow-300"
                                    }
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-gray-100 truncate">
                                    {dup.fullIssue?.title || "Untitled Issue"}
                                  </p>

                                  <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {dup.fullIssue?.description}
                                  </p>

                                  <p className="mt-2 text-[11px] text-gray-400">
                                    Issue ID:{" "}
                                    <span className="font-mono">
                                      {dup.issueId}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              {/* Meta chips */}
                              <div className="flex flex-wrap items-center gap-2 pt-2">
                                {/* Category Badge */}
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-900/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm">
                                  {getCategoryLabel(dup.fullIssue?.category)}
                                </div>

                                {/* Subcategories */}
                                {dup.fullIssue?.subcategory
                                  ?.slice(0, 3)
                                  ?.map((sub) => (
                                    <span
                                      key={sub}
                                      className="
        inline-flex items-center 
        rounded-full 
        border border-gray-200 dark:border-gray-700 
        bg-white dark:bg-gray-800 
        px-3 py-1.5 
        text-[11px] font-medium 
        text-gray-700 dark:text-gray-300
        hover:bg-gray-100 dark:hover:bg-gray-700
        transition-colors
      "
                                    >
                                      #{sub}
                                    </span>
                                  ))}

                                {/* + More Indicator */}
                                {dup.fullIssue?.subcategory?.length > 3 && (
                                  <span
                                    className="
        inline-flex items-center 
        rounded-full 
        border border-gray-200 dark:border-gray-700 
        bg-gray-50 dark:bg-gray-800/60
        px-3 py-1.5 
        text-[11px] font-medium 
        text-gray-600 dark:text-gray-400
      "
                                  >
                                    +{dup.fullIssue.subcategory.length - 3} more
                                  </span>
                                )}

                                {/* Priority Badge */}
                                <span
                                  className={`
      inline-flex items-center gap-1
      rounded-full px-3 py-1.5 text-[11px] font-semibold border
      ${
        dup.fullIssue?.priority === "high"
          ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
          : dup.fullIssue?.priority === "medium"
            ? "bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300"
            : "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
      }
    `}
                                >
                                  <AlertTriangle size={12} />
                                  {dup.fullIssue?.priority?.toUpperCase() ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>

                            {/* Score */}
                            <div className="sm:w-52 shrink-0 sm:ml-2">
                              <div
                                className={[
                                  "rounded-2xl border p-4 shadow-sm",
                                  isStrong
                                    ? "border-red-200/80 dark:border-red-700/60 bg-gradient-to-b from-red-50 to-white dark:from-red-900/15 dark:to-gray-900"
                                    : "border-yellow-200/80 dark:border-yellow-700/60 bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/15 dark:to-gray-900",
                                ].join(" ")}
                              >
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                    Match Score
                                  </p>
                                  <span
                                    className={[
                                      "rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                                      isStrong
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
                                    ].join(" ")}
                                  >
                                    {isStrong ? "High" : "Medium"}
                                  </span>
                                </div>

                                <p className="mt-2 text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                                  {dup.score}
                                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                    /100
                                  </span>
                                </p>

                                {/* Progress bar */}
                                <div className="mt-3 h-2.5 w-full rounded-full bg-gray-200/70 dark:bg-gray-800 overflow-hidden">
                                  <div
                                    className={[
                                      "h-full rounded-full transition-all duration-500",
                                      isStrong
                                        ? "bg-gradient-to-r from-red-500 via-rose-500 to-amber-400"
                                        : "bg-gradient-to-r from-yellow-400 via-amber-400 to-emerald-400",
                                    ].join(" ")}
                                    style={{
                                      width: `${Math.min(100, dup.score)}%`,
                                    }}
                                  />
                                </div>

                                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                                  Threshold: {70}/100
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Reasons */}
                          {dup.reasons?.length > 0 && (
                            <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-4">
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
                                Why this was flagged
                              </p>

                              <ul className="space-y-1.5">
                                {dup.reasons.map((reason, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                                  >
                                    <span
                                      className={[
                                        "mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0",
                                        isStrong
                                          ? "bg-red-500"
                                          : "bg-amber-500",
                                      ].join(" ")}
                                    />
                                    <span className="leading-relaxed">
                                      {reason}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Strong Duplicate callout */}
                          {dup.strongDuplicate && (
                            <div className="mt-4 rounded-2xl border border-red-200 dark:border-red-700/60 bg-gradient-to-r from-red-50 via-white to-white dark:from-red-900/20 dark:via-gray-900 dark:to-gray-900 p-4">
                              <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-red-100 dark:bg-red-900/30 p-2">
                                  <AlertTriangle
                                    className="text-red-600 dark:text-red-300"
                                    size={16}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-extrabold text-red-700 dark:text-red-200">
                                    Strong Duplicate Detected
                                  </p>
                                  <p className="text-xs text-red-600/90 dark:text-red-300">
                                    This report is highly similar to an existing
                                    active issue. Consider cancelling or editing
                                    before submitting.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer hint */}
              <div className="relative border-t border-yellow-200/70 dark:border-yellow-700/40 bg-yellow-50/40 dark:bg-yellow-900/10 px-6 py-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  If this looks like the same issue, you can{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    cancel
                  </span>{" "}
                  or{" "}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    edit
                  </span>{" "}
                  the report. If it’s genuinely different, you may still submit
                  it.
                </p>
              </div>
            </div>
          )}

          {/* ── Section divider ── */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Privacy & Contact</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          </div>

          {/* ── Contact / Anonymous ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200/70 dark:border-emerald-700/40 bg-emerald-50/60 dark:bg-slate-800/60 p-4">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-emerald-500" />
              <div className="flex items-center gap-2 mb-2 pl-1">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Anonymity</span>
              </div>
              <p className={`text-sm font-semibold pl-1 ${
                formData.isAnonymous
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-slate-700 dark:text-slate-200"
              }`}>
                {formData.isAnonymous ? "Anonymous report" : "Identity visible to authorities"}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-cyan-200/70 dark:border-cyan-700/40 bg-cyan-50/60 dark:bg-slate-800/60 p-4">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 to-teal-500" />
              <div className="flex items-center gap-2 mb-2 pl-1">
                <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Contact</span>
              </div>
              {formData.additionalEmail ? (
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-all pl-1">{formData.additionalEmail}</p>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic pl-1">No contact details provided</p>
              )}
            </div>
          </div>
        </div>

        {hasStrongDuplicate && (
          <p className="text-center text-sm text-red-600 dark:text-red-400 font-semibold mt-2">
            A highly similar active issue exists. Please confirm your action.
          </p>
        )}

        {/* ── Footer ── */}
        <div className="relative z-10 flex-shrink-0 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/80 px-5 py-4">
          {hasStrongDuplicate && (
            <p className="text-center text-xs text-red-600 dark:text-red-400 font-semibold mb-3">
              A highly similar active issue exists. Please confirm your action.
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-5 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold text-sm hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Report
            </button>

            {hasStrongDuplicate ? (
              <>
                <button
                  onClick={() => setDialogType("cancel")}
                  disabled={isSubmitting}
                  className="flex-1 px-5 py-3 rounded-2xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-bold text-sm bg-white/90 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-900/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel Submission
                </button>
                <button
                  onClick={() => setDialogType("submit")}
                  disabled={isSubmitting}
                  className="relative flex-1 overflow-hidden px-5 py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Submit Anyway</span>
                </button>
              </>
            ) : (
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="relative flex-1 overflow-hidden px-5 py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                {isSubmitting ? (
                  <><Loader2 className="relative animate-spin" size={18} /><span className="relative">Submitting...</span></>
                ) : (
                  <span className="relative">Submit Issue</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!dialogType} onOpenChange={() => setDialogType(null)}>
        <AlertDialogContent
          className="
      p-0 overflow-hidden rounded-2xl
      border border-emerald-200 dark:border-emerald-800
      bg-white dark:bg-gray-900
      shadow-2xl
    "
        >
          {/* Gradient Header */}
          <div
            className="
        bg-gradient-to-r 
        from-teal-600 
        via-emerald-600 
        to-cyan-700 
        p-6
      "
          >
            <div className="flex items-center gap-3">
              {dialogType === "cancel" ? (
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <AlertTriangle className="text-white" size={22} />
                </div>
              ) : (
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Shield className="text-white" size={22} />
                </div>
              )}

              <h2 className="text-xl font-bold text-white">
                {dialogType === "cancel"
                  ? "Cancel This Report?"
                  : "Submit Duplicate Issue?"}
              </h2>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {dialogType === "cancel"
                ? "This will permanently delete all uploaded media and completely clear your report data. This action cannot be undone."
                : "A highly similar active issue already exists in the system. Submitting this report may create redundancy. Are you sure you want to proceed?"}
            </p>

            {dialogType === "submit" && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 text-xs text-yellow-700 dark:text-yellow-300">
                Submitting a duplicate issue may delay resolution and affect
                system efficiency.
              </div>
            )}

            {dialogType === "cancel" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl p-4 text-xs text-red-600 dark:text-red-300">
                All uploaded photos and videos will be permanently deleted from
                storage.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-4 p-6 pt-0">
            <AlertDialogCancel
              className="
          flex-1
          px-5 py-3
          rounded-xl
          border-2
          border-gray-300 dark:border-gray-700
          bg-white dark:bg-gray-800
          text-gray-700 dark:text-gray-300
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-all
        "
            >
              Go Back
            </AlertDialogCancel>

            {dialogType === "cancel" ? (
              <AlertDialogAction
                onClick={handleCancelSubmission}
                className="
            flex-1
            px-5 py-3
            rounded-xl
            font-semibold
            bg-gradient-to-r 
            from-red-500 
            to-red-600
            text-white
            shadow-lg
            hover:shadow-xl
            hover:scale-[1.02]
            transition-all
          "
              >
                Yes, Cancel Report
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={onSubmit}
                className="
            flex-1
            px-5 py-3
            rounded-xl
            font-semibold
            bg-gradient-to-r 
            from-teal-600 
            via-emerald-600 
            to-cyan-700
            text-white
            shadow-lg
            hover:shadow-xl
            hover:scale-[1.02]
            transition-all
          "
              >
                Yes, Submit Anyway
              </AlertDialogAction>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PreviewModal;
