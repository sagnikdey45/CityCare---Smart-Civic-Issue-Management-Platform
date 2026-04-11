"use client";

import { useState, useEffect, useMemo, memo } from "react";
import {
  X,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  Camera,
  MessageCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  SearchIcon,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { IssueDiscussion } from "./IssueDiscussion";
import { IssueMessaging } from "./Citizen/IssueMessaging";
import { useQueries, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const statusSteps = [
  {
    status: "pending",
    label: "Reported",
    icon: AlertCircle,
    description: "Issue submitted and awaiting review",
  },
  {
    status: "in_progress",
    label: "In Progress",
    icon: Clock,
    description: "Work has started on resolving this issue",
  },
  {
    status: "resolved",
    label: "Resolved",
    icon: CheckCircle,
    description: "Issue has been successfully resolved",
  },
];

const IssueDetailModalComponent = ({ issue, onClose }) => {
  console.log("Rendering IssueDetailModal with issue:", issue);
  const [activeTab, setActiveTab] = useState("progress");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const issueUpdates = useQuery(
    api.issueUpdates.getByIssueId,
    issue ? { issueId: issue._id } : "skip",
  );

  const photoIds = useMemo(() => issue?.photos || [], [issue?.photos]);

  const photoQueries = useMemo(() => {
    return photoIds.map((id) => ({
      query: api.issuesMedia.getFileMeta,
      args: { storageId: id },
    }));
  }, [photoIds]);

  const photosData = useQueries(photoQueries);

  const videoData = useQuery(
    api.issuesMedia.getFileMeta,
    issue?.videos ? { storageId: issue.videos } : "skip",
  );

  const safePhotos = useMemo(() => {
    if (!photosData) return [];

    return Object.values(photosData).filter(
      (file) => file && typeof file.url === "string" && file.url.length > 0,
    );
  }, [photosData]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % safePhotos.length);

  const prev = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + safePhotos.length) % safePhotos.length,
    );

  useEffect(() => {
    if (!isPreviewOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsPreviewOpen(false);
        setPreviewFile(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPreviewOpen]);

  if (!issue) return null;

  const allPhotos = issue.photo_url
    ? [issue.photo_url, ...(issue.additional_photos || [])]
    : issue.additional_photos || [];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + allPhotos.length) % allPhotos.length,
    );
  };

  const currentStepIndex =
    issue.status === "resolved"
      ? 2
      : issue.status === "in_progress"
        ? 1
        : issue.status === "rejected"
          ? -1
          : 0;

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDaysSince(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / 86400000);
  }

  const daysSinceReported = getDaysSince(issue.createdAt);

  const statusColors = {
    pending: {
      gradient:
        "from-amber-500 to-yellow-600 dark:from-amber-600 dark:to-yellow-700",
      light:
        "from-amber-50 to-yellow-50/50 dark:from-amber-900/20 dark:to-yellow-900/10",
      border: "border-amber-300 dark:border-amber-700/50",
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      badgeBg: "bg-amber-50 dark:bg-amber-900/40",
      iconBg: "bg-amber-500 dark:bg-amber-600",
      circleBorder: "border-amber-500 dark:border-amber-600",
      lineGradient:
        "from-amber-500 to-yellow-600 dark:from-amber-600 dark:to-yellow-700",
    },
    in_progress: {
      gradient:
        "from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800",
      light:
        "from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10",
      border: "border-blue-300 dark:border-blue-700/50",
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      badgeBg: "bg-blue-50 dark:bg-blue-900/40",
      iconBg: "bg-blue-500 dark:bg-blue-600",
      circleBorder: "border-blue-500 dark:border-blue-600",
      lineGradient:
        "from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700",
    },
    resolved: {
      gradient:
        "from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700",
      light:
        "from-emerald-50 to-green-50/50 dark:from-emerald-900/20 dark:to-green-900/10",
      border: "border-emerald-300 dark:border-emerald-700/50",
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      badgeBg: "bg-emerald-50 dark:bg-emerald-900/40",
      iconBg: "bg-emerald-500 dark:bg-emerald-600",
      circleBorder: "border-emerald-500 dark:border-emerald-600",
      lineGradient:
        "from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700",
    },
    rejected: {
      gradient: "from-red-500 to-red-700 dark:from-red-600 dark:to-red-800",
      light:
        "from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10",
      border: "border-red-300 dark:border-red-700/50",
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      badgeBg: "bg-red-50 dark:bg-red-900/40",
      iconBg: "bg-red-500 dark:bg-red-600",
      circleBorder: "border-red-500 dark:border-red-600",
      lineGradient: "from-red-500 to-red-700 dark:from-red-600 dark:to-red-800",
    },
  };

  const currentColors = statusColors[issue.status] || statusColors.pending;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        className={`bg-white dark:bg-gray-900 border dark:border-white/10 rounded-2xl ${isFullscreen ? "w-full h-full max-w-none max-h-none rounded-none" : "max-w-4xl w-full max-h-[90vh]"} flex flex-col shadow-2xl animate-slideUp overflow-hidden transition-all duration-300 contain-content transform-gpu will-change-transform`}
      >
        <div
          className={`relative shrink-0 bg-gradient-to-r ${currentColors.gradient} p-6 text-white`}
        >
          {/* Subtle overlay for dark mode header to give depth */}
          <div className="absolute inset-0 bg-black/10 dark:bg-black/30 pointer-events-none mix-blend-overlay"></div>

          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="pr-24 relative z-10">
            <span className="inline-block px-4 py-1.5 bg-white/20 dark:bg-black/20 rounded-full text-sm font-semibold tracking-wide mb-3 border border-white/20 shadow-sm">
              {issue.issueCode}
            </span>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              {issue.title}
            </h2>
            <p className="text-white/80 dark:text-white/70 text-sm font-medium">
              Tracking your issue progress
            </p>
          </div>
        </div>

        <div className="relative shrink-0 border-b border-gray-200/50 dark:border-white/5 bg-gray-50/50 dark:bg-[#0a0a0a]/50 px-4 sm:px-8 py-4 sm:py-5 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.02)] dark:shadow-none transition-all duration-300 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 bg-gray-200/50 dark:bg-white/5 p-1.5 rounded-2xl w-max border border-gray-300/30 dark:border-white/5 shadow-inner">
            <button
              onClick={() => setActiveTab("progress")}
              className={`flex items-center gap-2.5 px-6 py-2.5 font-extrabold transition-all duration-300 rounded-xl text-sm tracking-wide ${
                activeTab === "progress"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-[0_4px_15px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] ring-1 ring-black/5 dark:ring-white/10 scale-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-white/5 scale-[0.98] hover:scale-100"
              }`}
            >
              <TrendingUp
                size={18}
                className={`transition-colors ${activeTab === "progress" ? "text-blue-600 dark:text-blue-400 drop-shadow-sm" : "opacity-70 group-hover:opacity-100"}`}
              />
              <span>Timeline</span>
            </button>

            {!issue.is_anonymous && (
              <button
                onClick={() => setActiveTab("discussion")}
                className={`flex items-center gap-2.5 px-6 py-2.5 font-extrabold transition-all duration-300 rounded-xl text-sm tracking-wide ${
                  activeTab === "discussion"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-[0_4px_15px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] ring-1 ring-black/5 dark:ring-white/10 scale-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-white/5 scale-[0.98] hover:scale-100"
                }`}
              >
                <MessageSquare
                  size={18}
                  className={`transition-colors ${activeTab === "discussion" ? "text-blue-600 dark:text-blue-400 drop-shadow-sm" : "opacity-70 group-hover:opacity-100"}`}
                />
                <span>Community</span>
              </button>
            )}

            {(issue.assignee || issue.unit_officer) && (
              <button
                onClick={() => setActiveTab("messages")}
                className={`flex items-center gap-2.5 px-6 py-2.5 font-extrabold transition-all duration-300 rounded-xl text-sm tracking-wide ${
                  activeTab === "messages"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-[0_4px_15px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] ring-1 ring-black/5 dark:ring-white/10 scale-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-white/5 scale-[0.98] hover:scale-100"
                }`}
              >
                <MessageCircle
                  size={18}
                  className={`transition-colors ${activeTab === "messages" ? "text-blue-600 dark:text-blue-400 drop-shadow-sm" : "opacity-70 group-hover:opacity-100"}`}
                />
                <span>Internal</span>
              </button>
            )}
          </div>
        </div>

        <div
          className={`flex-1 min-h-0 overflow-y-auto ${activeTab === "messages" ? "p-0" : "p-6 lg:p-8"}`}
        >
          {activeTab === "progress" && (
            <div
              className={`mx-auto transition-all duration-500 ${isFullscreen ? "max-w-5xl xl:max-w-[90vw] px-4 sm:px-8" : "max-w-3xl"}`}
            >
              {issue.status === "rejected" ? (
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/10 dark:to-red-900/5 rounded-2xl border border-red-200 dark:border-red-800/30 p-6 mb-8 shadow-sm">
                  <div className="flex items-start gap-5">
                    <div className="bg-red-500 dark:bg-red-500/20 shadow-inner p-3 rounded-2xl dark:text-red-400">
                      <XCircle
                        className="text-white dark:text-red-400"
                        size={28}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-950 dark:text-red-400 mb-2">
                        Issue Rejected
                      </h3>
                      <p className="text-red-800 dark:text-red-300 leading-relaxed">
                        This issue was reviewed and could not be processed.
                        Please check the details or contact support for more
                        information.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-12">
                  <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 mb-10 flex items-center gap-3">
                    <TrendingUp
                      className="text-blue-500 dark:text-blue-400"
                      size={28}
                    />{" "}
                    Progress Tracker
                  </h3>

                  {issueUpdates === undefined ? (
                    <div className="relative ml-2 sm:ml-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="group relative flex gap-6 sm:gap-8 pb-14 last:pb-0 w-full animate-pulse"
                        >
                          {i !== 2 && (
                            <div className="absolute left-[26px] top-[60px] w-[3px] h-[calc(100%-24px)] rounded-full bg-gray-200/60 dark:bg-gray-800/60" />
                          )}
                          <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80 border border-white/20 dark:border-white/10" />
                          <div className="flex-1 pt-0.5">
                            <div className="bg-gray-100/50 dark:bg-gray-900/50 rounded-[2rem] p-6 sm:p-8 h-44 border border-gray-200/50 dark:border-white/5">
                              <div className="flex justify-between mb-5">
                                <div className="h-7 w-28 bg-gray-200/80 dark:bg-gray-800/80 rounded-xl" />
                                <div className="h-7 w-32 bg-gray-200/80 dark:bg-gray-800/80 rounded-xl" />
                              </div>
                              <div className="h-4 w-full bg-gray-200/60 dark:bg-gray-800/60 rounded-md mb-3" />
                              <div className="h-4 w-[90%] bg-gray-200/60 dark:bg-gray-800/60 rounded-md mb-3" />
                              <div className="h-4 w-2/3 bg-gray-200/60 dark:bg-gray-800/60 rounded-md" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : issueUpdates.length > 0 ? (
                    <div className="relative ml-2 sm:ml-4">
                      {issueUpdates.map((update, index) => {
                        const isLastUpdate = index === issueUpdates.length - 1;
                        const stepColors = statusColors[update.status];
                        const StatusIcon =
                          update.status === "resolved"
                            ? CheckCircle
                            : update.status === "in_progress"
                              ? Clock
                              : update.status === "rejected"
                                ? XCircle
                                : AlertCircle;

                        return (
                          <div
                            key={update.id}
                            className="group relative flex gap-6 sm:gap-8 pb-14 last:pb-0"
                          >
                            {!isLastUpdate && (
                              <div
                                className={`absolute left-[26px] top-[60px] w-[3px] h-[calc(100%-24px)] rounded-full bg-gradient-to-b ${stepColors.lineGradient} opacity-40 dark:opacity-20`}
                              />
                            )}

                            <div
                              className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20 dark:border-white/10 bg-gradient-to-br ${stepColors.gradient} ${stepColors.iconBg} ${isLastUpdate ? "ring-[8px] ring-current/20 dark:ring-current/30 animate-[pulse_3s_ease-in-out_infinite]" : "group-hover:scale-110 transition-transform duration-500"}`}
                            >
                              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <StatusIcon
                                size={28}
                                className="text-white drop-shadow-md relative z-10"
                              />
                            </div>

                            <div className="flex-1 pt-0.5 transform transition-all duration-500 group-hover:-translate-y-1 contain-content transform-gpu will-change-transform">
                              <div className="bg-white/70 dark:bg-gray-900/50 border border-gray-200/60 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] group-hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.03)] transition-all">
                                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                                  <span
                                    className={`text-xs font-black tracking-widest ${stepColors.text} ${stepColors.badgeBg} px-3 py-1.5 rounded-xl uppercase shadow-sm`}
                                  >
                                    {update.status === "in_progress"
                                      ? "In Progress"
                                      : update.status === "resolved"
                                        ? "Resolved"
                                        : update.status === "rejected"
                                          ? "Rejected"
                                          : "Reported"}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/80 px-3 py-1.5 rounded-xl">
                                    <Clock size={16} />
                                    {new Date(update.createdAt).toLocaleString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                </div>
                                <p className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap">
                                  {update.comment}
                                </p>

                                {update.attachments?.length > 0 && (
                                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-5">
                                    {update.attachments.map((file, i) => {
                                      const { url, contentType } = file;

                                      const isImage =
                                        contentType?.startsWith("image");
                                      const isVideo =
                                        contentType?.startsWith("video");
                                      const isPDF =
                                        contentType?.includes("pdf");

                                      return (
                                        <div
                                          key={i}
                                          className="relative group/attachment rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-md hover:shadow-2xl transition-all duration-500 aspect-video sm:aspect-auto sm:h-44"
                                        >
                                          {isImage && (
                                            <img
                                              src={url}
                                              loading="lazy"
                                              className="w-full h-full object-cover group-hover/attachment:scale-110 transition duration-700"
                                            />
                                          )}

                                          {isVideo && (
                                            <div className="relative w-full h-full bg-black">
                                              <video
                                                src={url}
                                                className="w-full h-full object-cover opacity-80"
                                                muted
                                              />
                                              <div className="absolute inset-0 flex items-center justify-center text-white text-3xl group-hover/attachment:scale-125 transition-transform">
                                                ▶
                                              </div>
                                            </div>
                                          )}

                                          {isPDF && (
                                            <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10">
                                              <span className="text-5xl drop-shadow-md">
                                                📄
                                              </span>
                                              <span className="text-xs mt-3 font-bold text-red-600 dark:text-red-400 tracking-wide uppercase">
                                                PDF Document
                                              </span>
                                            </div>
                                          )}

                                          <div className="absolute inset-0 bg-black/0 group-hover/attachment:bg-black/50 transition duration-300 flex items-center justify-center">
                                            <button
                                              onClick={() => {
                                                setPreviewFile(file);
                                                setIsPreviewOpen(true);
                                              }}
                                              className="flex items-center gap-2 opacity-0 group-hover/attachment:opacity-100 scale-90 group-hover/attachment:scale-100 transition-all duration-300 bg-white/90 dark:bg-black/70 text-black dark:text-white px-5 py-2.5 rounded-xl shadow-2xl font-semibold"
                                            >
                                              <SearchIcon size={18} /> View
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {update.updater && (
                                  <div className="flex items-center gap-4 mt-6 pt-5 border-t border-gray-200/60 dark:border-gray-800/60">
                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[13px] font-black shadow-lg ${
                                        update.updater.role === "admin"
                                          ? "bg-gradient-to-br from-orange-500 to-orange-700"
                                          : update.updater.role ===
                                              "unit_officer"
                                            ? "bg-gradient-to-br from-teal-500 to-teal-700"
                                            : update.updater.role ===
                                                "field_officer"
                                              ? "bg-gradient-to-br from-cyan-500 to-cyan-700"
                                              : "bg-gradient-to-br from-gray-500 to-gray-700"
                                      }`}
                                    >
                                      {update.updater.fullName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .slice(0, 2)
                                        .join("")}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                      <span className="text-gray-900 dark:text-white font-bold text-[15px]">
                                        {update.updater.fullName}
                                      </span>
                                      <span className="text-gray-500 dark:text-gray-400 text-xs tracking-widest font-bold uppercase mt-0.5">
                                        {update.role.replace("_", " ")}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="relative ml-2 sm:ml-4">
                      {statusSteps.map((step, index) => {
                        const isCompleted =
                          index < currentStepIndex ||
                          (index === currentStepIndex &&
                            issue.status === "resolved");
                        const isCurrent =
                          index === currentStepIndex &&
                          issue.status !== "resolved";
                        const Icon = step.icon;

                        const stepColors = statusColors[step.status];

                        return (
                          <div
                            key={step.status}
                            className="group relative flex gap-6 sm:gap-8 pb-12 last:pb-0"
                          >
                            {index < statusSteps.length - 1 && (
                              <div
                                className={`absolute left-[26px] top-[60px] w-[3px] h-[calc(100%-24px)] rounded-full ${
                                  isCompleted
                                    ? `bg-gradient-to-b ${stepColors.lineGradient} opacity-40 dark:opacity-20`
                                    : "bg-gray-200/50 dark:bg-gray-800 border-x border-dashed border-gray-400/30 dark:border-gray-600/30"
                                }`}
                              />
                            )}

                            <div
                              className={`relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/20 dark:border-white/10 ${
                                isCompleted
                                  ? `bg-gradient-to-br ${stepColors.gradient} ${stepColors.iconBg} group-hover:scale-110 transition-transform duration-500`
                                  : isCurrent
                                    ? `bg-white dark:bg-gray-900 border-2 ${stepColors.circleBorder} shadow-[0_0_20px_rgba(currentColor,0.3)] animate-[pulse_3s_ease-in-out_infinite]`
                                    : "bg-gray-50 dark:bg-gray-800/30 border border-gray-300/50 dark:border-gray-700/50"
                              }`}
                            >
                              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <Icon
                                size={28}
                                className={
                                  isCompleted
                                    ? "text-white drop-shadow-md relative z-10"
                                    : isCurrent
                                      ? stepColors.text
                                      : "text-gray-400 dark:text-gray-600"
                                }
                              />
                            </div>

                            <div className="flex-1 pt-1.5 transform transition-all duration-500 group-hover:-translate-y-1">
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <h4
                                    className={`text-lg sm:text-xl font-bold tracking-tight ${
                                      isCompleted || isCurrent
                                        ? "text-gray-900 dark:text-white"
                                        : "text-gray-400 dark:text-gray-600"
                                    }`}
                                  >
                                    {step.label}
                                  </h4>
                                  {isCompleted && (
                                    <span
                                      className={`text-[11px] font-black tracking-widest ${stepColors.text} ${stepColors.badgeBg} px-2.5 py-1 rounded-lg uppercase shadow-sm`}
                                    >
                                      Completed
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span
                                      className={`text-[11px] font-black tracking-widest ${stepColors.text} ${stepColors.badgeBg} px-2.5 py-1 rounded-lg uppercase shadow-sm animate-pulse`}
                                    >
                                      In Progress
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-[15px] sm:text-base font-medium ${
                                    isCompleted || isCurrent
                                      ? "text-gray-600 dark:text-gray-400"
                                      : "text-gray-400 dark:text-gray-600"
                                  }`}
                                >
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 mx-auto transition-all duration-500 ${isFullscreen ? "max-w-5xl xl:max-w-[90vw] px-4 sm:px-8" : "max-w-3xl"}`}
              >
                <div className="relative group bg-white/70 dark:bg-gray-900/40 rounded-3xl border border-white/60 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.03)] transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  {/* Decorative mesh gradient */}
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 dark:bg-blue-400/10 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-150"></div>

                  <div className="relative z-10 flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-500/20 dark:to-blue-400/5 p-3.5 rounded-2xl border border-blue-200/50 dark:border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <Calendar
                        className="text-blue-600 dark:text-blue-400 drop-shadow-sm"
                        size={24}
                      />
                    </div>
                    <h4 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                      Timeline
                    </h4>
                  </div>

                  <div className="space-y-4 text-[15px] relative z-10">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100/50 dark:border-gray-800/50">
                      <span className="text-gray-500 dark:text-gray-400 font-bold tracking-wide">
                        Reported
                      </span>
                      <span className="font-bold text-gray-900 dark:text-gray-200 bg-white/80 dark:bg-white/5 px-3 py-1.5 rounded-xl shadow-sm border border-gray-200/50 dark:border-white/5">
                        {formatDate(issue.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100/50 dark:border-gray-800/50">
                      <span className="text-gray-500 dark:text-gray-400 font-bold tracking-wide">
                        Days Open
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-xl shadow-sm border border-blue-100 dark:border-blue-500/20">
                        {daysSinceReported}{" "}
                        {daysSinceReported === 1 ? "day" : "days"}
                      </span>
                    </div>
                    {issue.updated_at &&
                      issue.updated_at !== issue.createdAt && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-500 dark:text-gray-400 font-bold tracking-wide">
                            Last Update
                          </span>
                          <span className="font-bold text-gray-900 dark:text-gray-200 bg-white/80 dark:bg-white/5 px-3 py-1.5 rounded-xl shadow-sm border border-gray-200/50 dark:border-white/5">
                            {formatDate(issue.updated_at)}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                <div className="relative group bg-white/70 dark:bg-gray-900/40 rounded-3xl border border-white/60 dark:border-white/10 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.03)] transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  {/* Decorative mesh gradient */}
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-400/10 blur-3xl rounded-full transition-transform duration-700 group-hover:scale-150"></div>

                  <div className="relative z-10 flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-400/5 p-3.5 rounded-2xl border border-emerald-200/50 dark:border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp
                        className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm"
                        size={24}
                      />
                    </div>
                    <h4 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                      Impact
                    </h4>
                  </div>

                  <div className="space-y-4 text-[15px] relative z-10">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100/50 dark:border-gray-800/50">
                      <span className="text-gray-500 dark:text-gray-400 font-bold tracking-wide">
                        Upvotes
                      </span>
                      <span className="font-bold text-gray-900 dark:text-gray-200 bg-white/80 dark:bg-white/5 px-3 py-1.5 rounded-xl shadow-sm border border-gray-200/50 dark:border-white/5">
                        {issue.upvotes || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100/50 dark:border-gray-800/50">
                      <span className="text-gray-500 dark:text-gray-400 font-bold tracking-wide">
                        Priority Score
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                        12
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500 dark:text-gray-400 font-bold tracking-wide">
                        Severity
                      </span>
                      <span
                        className={`font-extrabold uppercase tracking-widest text-[11px] px-3.5 py-1.5 rounded-xl shadow-sm ${
                          issue.priority === "high"
                            ? "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-500/20 dark:to-red-600/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30"
                            : issue.priority === "medium"
                              ? "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-500/20 dark:to-amber-600/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                              : "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-500/20 dark:to-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                        }`}
                      >
                        {issue.priority || "Normal"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`relative bg-white/70 dark:bg-gray-900/40 rounded-3xl border border-white/60 dark:border-white/10 p-8 sm:p-10 mb-8 mx-auto transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-2xl ${isFullscreen ? "max-w-5xl xl:max-w-7xl mx-4 sm:mx-8" : "max-w-3xl"}`}
              >
                {/* Decorative background glow */}
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/30 dark:via-blue-400/30 to-transparent"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/10 dark:bg-blue-400/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-6 tracking-tight flex items-center gap-3 group">
                    {/* ICON CONTAINER */}
                    <span
                      className="relative w-10 h-10 rounded-2xl flex items-center justify-center
    bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50 
    dark:from-blue-500/20 dark:via-blue-400/10 dark:to-indigo-500/10
    border border-blue-200/50 dark:border-blue-400/20 
    shadow-inner group-hover:scale-105 transition-all duration-300"
                    >
                      {/* SOFT GLOW */}
                      <span className="absolute inset-0 rounded-2xl bg-blue-400/10 blur-xl opacity-0 group-hover:opacity-100 transition"></span>

                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 relative z-10" />
                    </span>
                    Issue Description
                  </h4>

                  <div className="relative mb-8 group">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-600 rounded-full opacity-80"></div>
                    <div className="pl-6 sm:pl-8">
                      <p className="text-gray-700 dark:text-gray-300 text-[15.5px] leading-[1.8] whitespace-pre-wrap font-medium">
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  {issue.address && (
                    <div className="flex items-start sm:items-center gap-3.5 text-sm bg-gradient-to-r from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 p-4 rounded-2xl border border-gray-200/60 dark:border-white/5 shadow-sm group hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors w-full sm:w-auto">
                      <div className="mt-0.5 sm:mt-0 p-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-100 dark:border-blue-500/20 shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <MapPin
                          size={18}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 tracking-wide leading-relaxed">
                        {issue.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {issue.assignee && (
                <div
                  className={`bg-gradient-to-br ${currentColors.light} rounded-2xl border ${currentColors.border} p-6 mb-8 mx-auto shadow-sm transition-all duration-500 ${isFullscreen ? "max-w-5xl xl:max-w-7xl mx-4 sm:mx-8" : "max-w-3xl"}`}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`bg-gradient-to-br ${currentColors.gradient} p-4 rounded-2xl shadow-inner`}
                    >
                      <User className="text-white drop-shadow-sm" size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1 opacity-80">
                        Assigned Officer
                      </h4>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {issue.assignee.fullName}
                      </p>
                      <p
                        className={`text-sm font-medium ${currentColors.text} capitalize mt-0.5`}
                      >
                        {issue.assignee.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {issue.photos?.length > 0 && safePhotos.length === 0 && (
                <div className="relative mb-8 h-[550px] w-full rounded-3xl bg-gray-100/50 dark:bg-white/5 animate-pulse border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-xl overflow-hidden contain-content">
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-gray-200/50 dark:from-white/10 to-transparent"></div>
                  <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 animate-[pulse_3s_ease-in-out_infinite]" />
                </div>
              )}

              {safePhotos.length > 0 && (
                <div className="relative mb-8 contain-content transform-gpu will-change-transform">
                  {/* OUTER GLOW FRAME */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400/30 via-teal-400/20 to-blue-500/30 blur-2xl opacity-40" />

                  <div className="relative bg-white/70 dark:bg-black/40 rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl p-5">
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                          <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Issue Media
                        </h4>
                      </div>

                      <div className="text-xs font-medium px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 shadow">
                        {currentIndex + 1} / {safePhotos.length}
                      </div>
                    </div>

                    {/* IMAGE CONTAINER */}
                    <div className="relative group rounded-2xl overflow-hidden">
                      {/* IMAGE */}
                      <img
                        src={safePhotos[currentIndex]?.url}
                        loading="lazy"
                        className="w-full h-[420px] object-cover transition duration-700 ease-out group-hover:scale-110"
                      />

                      {/* CINEMATIC OVERLAY */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* SOFT EDGE LIGHT */}
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20 dark:ring-white/10 pointer-events-none" />

                      {/* LEFT CONTROL */}
                      {safePhotos.length > 1 && (
                        <button
                          onClick={prev}
                          className="absolute left-4 top-1/2 -translate-y-1/2
            group/btn
            bg-white/70 dark:bg-black/60
            border border-white/30 dark:border-white/10
            hover:bg-white dark:hover:bg-black/80
            p-3 rounded-full shadow-xl
            transition-all duration-300
            opacity-0 group-hover:opacity-100
            hover:scale-110 active:scale-95"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white transition-transform group-hover/btn:-translate-x-1" />
                        </button>
                      )}

                      {/* RIGHT CONTROL */}
                      {safePhotos.length > 1 && (
                        <button
                          onClick={next}
                          className="absolute right-4 top-1/2 -translate-y-1/2
            group/btn
            bg-white/70 dark:bg-black/60
            border border-white/30 dark:border-white/10
            hover:bg-white dark:hover:bg-black/80
            p-3 rounded-full shadow-xl
            transition-all duration-300
            opacity-0 group-hover:opacity-100
            hover:scale-110 active:scale-95"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-800 dark:text-white transition-transform group-hover/btn:translate-x-1" />
                        </button>
                      )}

                      {/* FLOATING ACTION BAR */}
                      <div
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 
          bg-white/70 dark:bg-black/60 
          border border-white/30 dark:border-white/10
          px-4 py-2 rounded-full shadow-lg
          opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        {/* INDEX */}
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {currentIndex + 1} / {safePhotos.length}
                        </span>

                        {/* DIVIDER */}
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

                        {/* ZOOM */}
                        <button
                          onClick={() => {
                            setPreviewFile(safePhotos[currentIndex]);
                            setIsPreviewOpen(true);
                          }}
                          className="hover:scale-110 active:scale-95 transition"
                        >
                          <Maximize2 className="w-5 h-5 text-gray-800 dark:text-white" />
                        </button>
                      </div>

                      {/* RADIAL FOCUS */}
                      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.35))]" />
                    </div>

                    {/* DOTS */}
                    {safePhotos.length > 1 && (
                      <div className="flex justify-center gap-2 mt-5">
                        {safePhotos.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`transition-all duration-300 ${
                              i === currentIndex
                                ? "w-8 h-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500 shadow-md"
                                : "w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 hover:scale-125"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {videoData && (
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/40 dark:to-black/40 rounded-2xl border border-slate-200 dark:border-white/10 p-5 mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Video Evidence
                  </h4>

                  <div className="relative group rounded-xl overflow-hidden bg-black">
                    <video
                      src={videoData.url}
                      controls
                      className="w-full h-[300px] object-cover"
                    />

                    {/* OPTIONAL OVERLAY */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "discussion" && !issue.is_anonymous && (
            <div>
              <IssueDiscussion issueId={issue.id} />
            </div>
          )}

          {activeTab === "messages" &&
            (issue.assignee || issue.unit_officer) && (
              <div className="h-full">
                <IssueMessaging issue={issue} />
              </div>
            )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80">
          <button
            onClick={onClose}
            className={`w-full px-6 py-3.5 bg-gradient-to-r ${currentColors.gradient} text-white rounded-xl font-bold tracking-wide hover:opacity-90 transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-current`}
          >
            Close Dialog
          </button>
        </div>
      </div>

      {isPreviewOpen && previewFile && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-6 animate-fadeIn"
          onClick={() => {
            setIsPreviewOpen(false);
            setPreviewFile(null);
          }}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                setIsPreviewOpen(false);
                setPreviewFile(null);
              }}
              className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
            >
              <X size={20} />
            </button>

            {/* IMAGE */}
            {previewFile.contentType?.startsWith("image") && (
              <img
                src={previewFile.url}
                loading="lazy"
                className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            )}

            {/* VIDEO */}
            {previewFile.contentType?.startsWith("video") && (
              <video
                src={previewFile.url}
                controls
                autoPlay
                className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            )}

            {/* PDF */}
            {previewFile.contentType?.includes("pdf") && (
              <iframe
                src={previewFile.url}
                className="w-full h-[85vh] bg-white rounded-xl shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Deep equality constraint targeting the unique issue ID to strictly block devtools and
// layout cascade re-renders originating from the parent's inline arrow function pointer updates.
export const IssueDetailModal = memo(
  IssueDetailModalComponent,
  (prevProps, nextProps) => prevProps.issue?._id === nextProps.issue?._id,
);
