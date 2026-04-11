"use client";

import {
  MapPin,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader,
  TrendingUp,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "amber",
    icon: Clock,
    progress: 25,
    bgGradient:
      "from-amber-50/95 to-orange-100/80 dark:from-amber-500/20 dark:to-orange-900/30",
    glowGradient: "from-amber-400 to-orange-500",
    borderColor: "border-amber-200/80 dark:border-amber-500/30",
    textColor: "text-amber-700 dark:text-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-white/70 dark:bg-amber-500/20",
  },
  in_progress: {
    label: "In Progress",
    color: "blue",
    icon: Loader,
    progress: 65,
    bgGradient:
      "from-blue-50/95 to-indigo-100/80 dark:from-blue-500/20 dark:to-indigo-900/30",
    glowGradient: "from-blue-400 to-indigo-500",
    borderColor: "border-blue-200/80 dark:border-blue-500/30",
    textColor: "text-blue-700 dark:text-blue-400",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-white/70 dark:bg-blue-500/20",
  },
  resolved: {
    label: "Resolved",
    color: "emerald",
    icon: CheckCircle,
    progress: 100,
    bgGradient:
      "from-emerald-50/95 to-teal-100/80 dark:from-emerald-500/20 dark:to-teal-900/30",
    glowGradient: "from-emerald-400 to-teal-500",
    borderColor: "border-emerald-200/80 dark:border-emerald-500/30",
    textColor: "text-emerald-700 dark:text-emerald-400",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-white/70 dark:bg-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    color: "red",
    icon: XCircle,
    progress: 100,
    bgGradient:
      "from-red-50/95 to-rose-100/80 dark:from-red-500/20 dark:to-rose-900/30",
    glowGradient: "from-red-400 to-rose-500",
    borderColor: "border-red-200/80 dark:border-red-500/30",
    textColor: "text-red-700 dark:text-red-400",
    iconColor: "text-red-600 dark:text-red-400",
    badgeBg: "bg-white/70 dark:bg-red-500/20",
  },
};

const categoryLabels = {
  road: "Road & Infrastructure",
  electricity: "Electricity & Lighting",
  water: "Water Supply",
  sanitation: "Sanitation & Waste",
  drainage: "Drainage & Sewer",
  solid_waste: "Solid Waste Management",
  public_health: "Public Health",
  other: "Other",
};

export function IssueCardSkeleton() {
  return (
    <div className="w-full h-full rounded-[2rem] p-[1.5px] bg-gradient-to-b from-gray-200/50 to-gray-100/10 dark:from-white/10 dark:to-white/5 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
      <div className="relative h-full bg-white/40 dark:bg-[#0a0a0a]/40 rounded-[calc(2rem-1.5px)] p-6 sm:p-7 flex flex-col justify-between overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent z-20"></div>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="w-20 h-6 rounded-xl bg-gray-200/80 dark:bg-gray-800/80"></div>
          <div className="w-24 h-6 rounded-xl bg-gray-200/80 dark:bg-gray-800/80"></div>
        </div>

        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex-1 space-y-3 pt-1">
            <div className="w-3/4 h-7 rounded-lg bg-gray-200/80 dark:bg-gray-800/80"></div>
            <div className="w-full h-4 rounded-lg bg-gray-200/50 dark:bg-gray-800/50"></div>
            <div className="w-5/6 h-4 rounded-lg bg-gray-200/50 dark:bg-gray-800/50"></div>
          </div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-200/80 dark:bg-gray-800/80 flex-shrink-0 border-2 border-white/50 dark:border-white/5"></div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-gray-200/80 dark:bg-gray-800/80"></div>
            <div className="w-48 h-4 rounded-lg bg-gray-200/60 dark:bg-gray-800/60"></div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-gray-200/80 dark:bg-gray-800/80"></div>
            <div className="w-40 h-4 rounded-lg bg-gray-200/60 dark:bg-gray-800/60"></div>
          </div>
        </div>

        <div className="mt-auto bg-gray-100/50 dark:bg-gray-800/30 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-white/5">
          <div className="flex justify-between mb-3">
            <div className="w-32 h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="w-8 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-full"></div>
        </div>

        <div className="mt-5 flex items-center justify-between pt-5 border-t border-gray-300/40 dark:border-white/10">
          <div className="w-32 h-6 rounded-xl bg-gray-200/80 dark:bg-gray-800/80"></div>
          <div className="w-8 h-8 rounded-full bg-gray-200/80 dark:bg-gray-800/80"></div>
        </div>
      </div>
    </div>
  );
}

const IssueCardComponent = ({ issue, onClick }) => {
  const config = statusConfig[issue.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  // The photoUrl is directly supplied by the optimized Convex query, eliminating N+1 requests
  const photoUrl = issue.photoUrl;

  function getTimeAgo(date) {
    const now = new Date();
    const issueDate = new Date(date);
    const diffMs = now.getTime() - issueDate.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return issueDate.toLocaleDateString();
  }

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer w-full h-full rounded-[2rem] transition-all duration-500 hover:-translate-y-2 contain-content transform-gpu will-change-transform"
    >
      {/* Animated Deep Under-Glow powered by status colors */}
      <div
        className={`absolute -inset-1.5 bg-gradient-to-br ${config.glowGradient} rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-40 dark:group-hover:opacity-30 transition-all duration-700 pointer-events-none`}
      />

      {/* Card Edge Border / Outer Capsule */}
      <div className="relative h-full rounded-[2rem] p-[1.5px] bg-gradient-to-b from-white/90 to-white/10 dark:from-white/20 dark:to-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_30px_60px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-500 overflow-hidden">
        {/* Dynamic Colored Glass Core */}
        <div
          className={`relative h-full bg-gradient-to-br ${config.bgGradient} rounded-[calc(2rem-1.5px)] p-6 sm:p-7 flex flex-col justify-between overflow-hidden`}
        >
          {/* Internal Radial Glow */}
          <div
            className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${config.glowGradient} blur-3xl opacity-30 dark:opacity-40 rounded-full mix-blend-multiply dark:mix-blend-screen transform translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-1000 ease-out pointer-events-none`}
          />

          <div className="flex flex-wrap items-center gap-2 mb-5 relative z-10">
            <div className="px-3 py-1 bg-white/60 dark:bg-black/40 rounded-xl border border-white/40 dark:border-white/10 shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-pulse"></span>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-gray-700 dark:text-gray-300">
                #{issue.issueCode}
              </span>
            </div>

            <div
              className={`px-3 py-1 rounded-xl border ${config.borderColor} ${config.badgeBg} shadow-sm flex items-center gap-2`}
            >
              <StatusIcon
                size={14}
                strokeWidth={2.5}
                className={`${config.iconColor} ${
                  issue.status === "in_progress" ? "animate-spin-slow" : ""
                }`}
              />
              <span
                className={`text-[10px] sm:text-xs uppercase tracking-widest font-black ${config.textColor}`}
              >
                {config.label}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-start gap-4 mb-6 relative z-10">
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-800 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500 mb-3 tracking-tight leading-tight line-clamp-2 group-hover:scale-[1.02] origin-left transition-transform duration-300">
                {issue.title}
              </h3>
              <p className="text-[14px] sm:text-[15px] font-medium text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed opacity-90 drop-shadow-sm">
                {issue.description}
              </p>
            </div>

            <div className="relative flex-shrink-0 group/img">
              {photoUrl ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white/80 dark:border-white/10 bg-white/50 dark:bg-black/40">
                  <img
                    src={photoUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-300"></div>
                </div>
              ) : (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.1)] border-2 border-white/80 dark:border-white/10 bg-white/50 dark:bg-black/40 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 drop-shadow-sm group-hover/img:scale-110 transition-transform duration-700" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-8 relative z-10">
            <div className="flex items-center gap-3.5 group/item">
              <div className="w-8 h-8 rounded-xl bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/5 flex items-center justify-center shadow-sm group-hover/item:bg-white/80 dark:group-hover/item:bg-white/10 transition-colors duration-300">
                <MapPin
                  size={14}
                  className="text-gray-600 dark:text-gray-400 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors"
                />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 drop-shadow-sm">
                {issue.address || "Location not specified"}
              </span>
            </div>

            {issue.assignee && (
              <div className="flex items-center gap-3.5 group/item">
                <div className="w-8 h-8 rounded-xl bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/5 flex items-center justify-center shadow-sm group-hover/item:bg-white/80 dark:group-hover/item:bg-white/10 transition-colors duration-300">
                  <User
                    size={14}
                    className="text-gray-600 dark:text-gray-400 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 drop-shadow-sm">
                  Assigned to{" "}
                  <span className="text-gray-900 dark:text-white font-extrabold ml-1">
                    {issue.assignee.full_name}
                  </span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-3.5 group/item">
              <div className="w-8 h-8 rounded-xl bg-white/50 dark:bg-black/30 border border-white/40 dark:border-white/5 flex items-center justify-center shadow-sm group-hover/item:bg-white/80 dark:group-hover/item:bg-white/10 transition-colors duration-300">
                <Clock
                  size={14}
                  className="text-gray-600 dark:text-gray-400 group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400 transition-colors"
                />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 drop-shadow-sm">
                Reported {getTimeAgo(issue.created_at)}
              </span>
            </div>
          </div>

          <div className="mt-auto relative z-10 bg-white/40 dark:bg-black/30 p-4 sm:p-5 rounded-2xl border border-white/40 dark:border-white/5 shadow-inner">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-gray-600 dark:text-gray-300 mb-3 drop-shadow-sm">
              <span>Resolution Progress</span>
              <span className={`${config.textColor} drop-shadow-md`}>
                {config.progress}%
              </span>
            </div>

            <div className="relative h-2.5 sm:h-3 bg-white/60 dark:bg-black/60 rounded-full overflow-hidden border border-white/50 dark:border-white/5 shadow-inner">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${config.glowGradient} transition-all duration-1000 ease-out shadow-lg`}
                style={{ width: `${config.progress}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-5 border-t border-gray-300/40 dark:border-white/10 relative z-10">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider px-3.5 py-1.5 bg-white/70 dark:bg-black/40 rounded-xl border border-white/50 dark:border-white/5 text-gray-700 dark:text-gray-300 font-extrabold shadow-sm transition-colors group-hover:bg-white dark:group-hover:bg-black/60">
              {categoryLabels[issue.category] || "Other"}
            </span>

            <div className="flex items-center gap-3">
              {issue.upvotes > 0 && (
                <span className="text-[11px] sm:text-xs text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1.5 bg-white/80 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl border border-white/80 dark:border-blue-500/30 shadow-sm transition-transform hover:scale-105 cursor-help">
                  <TrendingUp size={14} strokeWidth={2.5} />
                  <span>
                    {issue.upvotes}{" "}
                    <span className="hidden sm:inline">upvotes</span>
                  </span>
                </span>
              )}

              <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/60 flex items-center justify-center border border-white/80 dark:border-white/10 shadow-md text-gray-500 dark:text-gray-400 group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors duration-300">
                <ChevronRight size={16} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
export const IssueCard = React.memo(
  IssueCardComponent,
  (prevProps, nextProps) => {
    // Deep equality constraint targeting the only properties that dictate visual distinctness.
    // This physically blocks layout cascading re-renders driven by inline function pointers from CitizenDashboard.
    return (
      prevProps.issue._id === nextProps.issue._id &&
      prevProps.issue.status === nextProps.issue.status &&
      prevProps.issue.upvotes === nextProps.issue.upvotes &&
      prevProps.issue.photoUrl === nextProps.issue.photoUrl
    );
  },
);
