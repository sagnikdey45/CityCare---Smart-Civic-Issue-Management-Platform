"use client";

import { useState } from "react";
import {
  Trophy,
  Star,
  Flame,
  Award,
  Medal,
  FileText,
  CheckCircle,
  XCircle,
  Copy,
  MessageCircle,
  ThumbsUp,
  Video,
  ShieldCheck,
  Zap,
  Crown,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Users,
  BarChart3,
  Lock,
  ChevronDown,
  ChevronUp,
  MapPin,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import {
  calculateCitizenLevel,
  CITIZEN_LEVELS,
} from "@/lib/gamificationConstants";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTxType(type) {
  const map = {
    issue_submitted: "Issue Submitted",
    video_evidence_added: "Video Evidence",
    issue_verified: "Issue Verified",
    issue_assigned: "Issue Assigned",
    issue_resolved: "Issue Resolved",
    issue_closed: "Issue Closed",
    issue_rejected: "Issue Rejected",
    duplicate_report: "Duplicate Report",
    issue_withdrawn: "Issue Withdrawn",
    comment_added: "Comment Added",
    comment_liked: "Comment Liked",
    report_upvoted: "Report Upvoted",
    streak_bonus: "Streak Bonus",
    badge_bonus: "Badge Earned",
    manual_adjustment: "Manual Adjustment",
  };
  return (
    map[type] ||
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

function badgeIcon(iconStr) {
  const map = {
    flag: <Trophy size={20} />,
    video: <Video size={20} />,
    "check-circle": <CheckCircle size={20} />,
    "shield-check": <ShieldCheck size={20} />,
    wrench: <Wrench size={20} />,
    flame: <Flame size={20} />,
    award: <Award size={20} />,
    "message-circle": <MessageCircle size={20} />,
    "map-pin": <MapPin size={20} />,
    star: <Star size={20} />,
    medal: <Medal size={20} />,
  };
  return map[iconStr] || <Star size={20} />;
}

function categoryColor(cat) {
  const map = {
    reporting:
      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
    resolution:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700",
    community:
      "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700",
    streak:
      "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700",
    quality:
      "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700",
    special:
      "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700",
  };
  return (
    map[cat] ||
    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
  );
}

function txTypeIcon(type) {
  const map = {
    issue_resolved: <CheckCircle size={16} />,
    issue_verified: <ShieldCheck size={16} />,
    issue_submitted: <FileText size={16} />,
    badge_bonus: <Award size={16} />,
    streak_bonus: <Flame size={16} />,
    comment_added: <MessageCircle size={16} />,
    comment_liked: <ThumbsUp size={16} />,
    report_upvoted: <ThumbsUp size={16} />,
    video_evidence_added: <Video size={16} />,
    duplicate_report: <Copy size={16} />,
    issue_rejected: <XCircle size={16} />,
    issue_withdrawn: <XCircle size={16} />,
  };
  return map[type] || <Zap size={16} />;
}

function getLevelGradient(level) {
  if (level >= 90) return "from-fuchsia-500 via-purple-500 to-indigo-600";
  if (level >= 75) return "from-rose-500 via-pink-500 to-fuchsia-500";
  if (level >= 60) return "from-orange-500 via-red-500 to-rose-500";
  if (level >= 45) return "from-yellow-400 via-amber-500 to-orange-500";
  if (level >= 30) return "from-emerald-500 via-teal-500 to-cyan-500";
  if (level >= 20) return "from-blue-500 via-cyan-500 to-teal-500";
  if (level >= 10) return "from-violet-500 via-purple-500 to-indigo-500";
  if (level >= 5) return "from-amber-400 to-orange-500";
  if (level >= 3) return "from-teal-400 to-cyan-500";
  if (level >= 2) return "from-green-400 to-emerald-500";
  return "from-slate-400 to-gray-500";
}

// Rank visual config
function rankConfig(rank, isCurrentUser) {
  if (isCurrentUser)
    return {
      rowBg:
        "bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-900/25 dark:via-cyan-900/20 dark:to-teal-900/20",
      ring: "ring-2 ring-blue-400 dark:ring-blue-500",
      badge: "bg-gradient-to-br from-blue-500 to-cyan-500 text-white",
      pointsColor: "text-blue-600 dark:text-blue-400",
      nameColor: "text-blue-900 dark:text-blue-100 font-black",
    };
  if (rank === 1)
    return {
      rowBg:
        "bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900/25 dark:via-amber-900/20 dark:to-orange-900/20",
      ring: "ring-2 ring-yellow-400",
      badge: "bg-gradient-to-br from-yellow-400 to-amber-500 text-white",
      pointsColor: "text-amber-700 dark:text-amber-400",
      nameColor: "text-slate-900 dark:text-white font-black",
    };
  if (rank === 2)
    return {
      rowBg:
        "bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/70 dark:to-gray-800/60",
      ring: "ring-2 ring-slate-300 dark:ring-slate-500",
      badge: "bg-gradient-to-br from-slate-400 to-gray-500 text-white",
      pointsColor: "text-slate-600 dark:text-slate-300",
      nameColor: "text-slate-900 dark:text-white font-bold",
    };
  if (rank === 3)
    return {
      rowBg:
        "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/15",
      ring: "ring-2 ring-amber-500",
      badge: "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
      pointsColor: "text-amber-700 dark:text-amber-400",
      nameColor: "text-slate-900 dark:text-white font-bold",
    };
  return {
    rowBg: "bg-white dark:bg-slate-800/50",
    ring: "",
    badge: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
    pointsColor: "text-emerald-600 dark:text-emerald-400",
    nameColor: "text-slate-800 dark:text-slate-200 font-semibold",
  };
}

function rankMedal(rank) {
  if (rank === 1) return <Crown size={16} className="text-white" />;
  if (rank === 2) return <Medal size={16} className="text-white" />;
  if (rank === 3) return <Award size={16} className="text-white" />;
  return <span className="font-black text-sm leading-none">{rank}</span>;
}

const POINT_RULES = [
  { label: "Issue Submitted", points: 5, positive: true },
  { label: "Video Evidence Added", points: 5, positive: true },
  { label: "Issue Verified", points: 20, positive: true },
  { label: "Issue Assigned", points: 5, positive: true },
  { label: "Issue Resolved", points: 40, positive: true },
  { label: "Issue Closed", points: 20, positive: true },
  { label: "Comment Added", points: 2, positive: true },
  { label: "Comment Liked", points: 1, positive: true },
  { label: "Report Upvoted", points: 2, positive: true },
  { label: "Streak Bonus", points: 10, positive: true },
  { label: "Badge Bonus", points: "Custom", positive: true },
  { label: "Duplicate Report", points: -5, positive: false },
  { label: "Issue Rejected", points: -15, positive: false },
  { label: "Issue Withdrawn", points: -5, positive: false },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, subtitle, gradient }) {
  return (
    <div className="group relative overflow-hidden bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-5 border border-slate-100 dark:border-slate-700/80 cursor-default">
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-300`}
      ></div>
      <div
        className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${gradient} mb-3.5 shadow-sm`}
      >
        <span className="text-white">{icon}</span>
      </div>
      <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
        {value}
      </div>
      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">
        {label}
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
        {subtitle}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, icon }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      {icon && (
        <div className="mt-0.5 flex-shrink-0 text-slate-400 dark:text-slate-500">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function CitizenGamificationSection({ profile = null }) {
  const [txExpanded, setTxExpanded] = useState(false);
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(false);

  const { data: session, status } = useSession();

  const gamificationProfile = useQuery(
    api.gamification.getCitizenGamificationProfileByUserId,
    session?.user?.id
      ? {
          userId: session.user.id,
          leaderboardLimit: 20,
        }
      : "skip",
  );

  // Premium loading skeletons
  if (status === "loading" || gamificationProfile === undefined) {
    return (
      <div className="space-y-10 animate-pulse">
        {/* Hero Card Skeleton */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-7">
            <div className="flex items-center gap-5 w-full">
              <div className="w-24 h-24 rounded-3xl bg-slate-200 dark:bg-slate-850 flex-shrink-0"></div>
              <div className="space-y-3 w-full max-w-xs">
                <div className="h-4 bg-slate-250 dark:bg-slate-800 rounded w-1/3"></div>
                <div className="h-8 bg-slate-250 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-250 dark:bg-slate-800 rounded-full w-20"></div>
                  <div className="h-6 bg-slate-250 dark:bg-slate-800 rounded-full w-20"></div>
                  <div className="h-6 bg-slate-250 dark:bg-slate-800 rounded-full w-20"></div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-36 h-28 rounded-3xl bg-slate-200 dark:bg-slate-850 flex-shrink-0"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded-full w-full"></div>
          </div>
        </div>

        {/* Highlights Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-850 flex-shrink-0"></div>
              <div className="space-y-2 w-full">
                <div className="h-3 bg-slate-250 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-6 bg-slate-250 dark:bg-slate-800 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Breakdown Skeleton */}
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="w-5 h-5 bg-slate-250 dark:bg-slate-800 rounded-full"></div>
            <div className="h-5 bg-slate-250 dark:bg-slate-800 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-250 dark:bg-slate-800"></div>
                <div className="h-6 bg-slate-250 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-3 bg-slate-250 dark:bg-slate-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Profile not available/created yet
  if (gamificationProfile === null) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Gamification profile not available yet
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Submit your first civic issue to start earning points and badges.
        </p>
      </div>
    );
  }

  const citizen = gamificationProfile.citizen;
  const badges = gamificationProfile.badges ?? [];
  const transactions = gamificationProfile.recentTransactions ?? [];
  const leaderboard = gamificationProfile.leaderboard ?? [];

  const visibleTransactions = txExpanded
    ? transactions
    : transactions.slice(0, 6);

  const visibleLeaderboard = leaderboardExpanded
    ? leaderboard
    : leaderboard.slice(0, 6);

  // Safe defaults
  const citizenPoints = citizen?.points ?? 0;
  const badgeCount = citizen?.badgeCount ?? badges.length ?? 0;
  const currentStreak = citizen?.currentStreak ?? 0;
  const longestStreak = citizen?.longestStreak ?? 0;
  const cityRank = gamificationProfile.cityRank ?? null;
  const totalCitizens = gamificationProfile.totalCitizens ?? 0;
  const city = citizen?.city ?? "Your City";

  const levelInfo = calculateCitizenLevel(citizenPoints);
  const nextLevelTitle =
    CITIZEN_LEVELS.find((l) => l.level === levelInfo.level + 1)?.title ?? null;
  const gradientClass = getLevelGradient(levelInfo.level);

  const topPercentile =
    cityRank && totalCitizens
      ? Math.max(1, Math.round((1 - cityRank / totalCitizens) * 100))
      : null;

  // Find points of target ranked citizen immediately above
  const nextRankCitizen =
    cityRank > 1
      ? leaderboard.find((item) => item.rank === cityRank - 1)
      : null;
  const ptsBehind = nextRankCitizen
    ? nextRankCitizen.points - citizenPoints
    : null;

  return (
    <div className="space-y-10">
      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${gradientClass} rounded-3xl shadow-2xl`}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,255,255,0.18),transparent_60%)]"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-sm"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/10 rounded-full -ml-28 translate-y-1/2"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-7">
            {/* Left: identity */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white font-black text-3xl shadow-2xl">
                  {(citizen?.fullName || session?.user?.name || "C")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span className="absolute -bottom-2 -right-2 w-9 h-9 bg-white/25 backdrop-blur-md border-2 border-white/50 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl">
                  {levelInfo.level}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={13} className="text-white/70" />
                  <span className="text-white/75 text-xs font-black uppercase tracking-[0.15em]">
                    {levelInfo.title}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-white leading-none mb-3 drop-shadow-sm">
                  {citizen?.fullName || session?.user?.name || "Citizen"}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5 text-white text-xs font-bold shadow-sm">
                    <Trophy size={12} /> {citizenPoints.toLocaleString()} pts
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5 text-white text-xs font-bold shadow-sm">
                    <Award size={12} /> {badgeCount} badges
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5 text-white text-xs font-bold shadow-sm">
                    <Flame size={12} /> {currentStreak}d streak
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5 text-white text-xs font-bold shadow-sm">
                    <MapPin size={12} /> {city}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: city rank spotlight */}
            <div className="flex-shrink-0">
              <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-5 text-center shadow-xl min-w-[140px]">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <BarChart3 size={13} className="text-white/70" />
                  <span className="text-white/70 text-xs font-bold uppercase tracking-wide">
                    City Rank
                  </span>
                </div>
                <div className="text-5xl font-black text-white leading-none my-2 drop-shadow-lg">
                  {cityRank ? `#${cityRank}` : "—"}
                </div>
                <div className="text-white/75 text-xs font-semibold">
                  of {totalCitizens.toLocaleString()} citizens
                </div>
                {topPercentile && (
                  <div className="mt-2 bg-white/15 rounded-full px-3 py-1 text-white text-xs font-bold">
                    Top {topPercentile}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Level progress bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-white text-sm font-bold mb-3">
              <span className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full bg-white/80`}></div>
                Level {levelInfo.level} — {levelInfo.title}
              </span>
              {nextLevelTitle ? (
                <span className="flex items-center gap-1.5 text-white/80">
                  <ChevronRight size={14} />
                  {levelInfo.pointsToNextLevel.toLocaleString()} pts to{" "}
                  {nextLevelTitle}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-white/80">
                  <Crown size={14} />
                  Max Level Reached
                </span>
              )}
            </div>
            <div className="h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-white/70 to-white/90 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${levelInfo.progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-pulse rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between text-white/55 text-xs mt-2 font-semibold">
              <span>{citizenPoints.toLocaleString()} pts earned</span>
              <span>{levelInfo.progressPercentage}% complete</span>
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              {
                label: "Submitted",
                value: citizen?.reportsSubmitted ?? 0,
                icon: <FileText size={14} />,
              },
              {
                label: "Resolved",
                value: citizen?.reportsResolved ?? 0,
                icon: <CheckCircle size={14} />,
              },
              {
                label: "Comments",
                value: citizen?.commentsAdded ?? 0,
                icon: <MessageCircle size={14} />,
              },
              {
                label: "Upvotes",
                value: citizen?.upvotesReceived ?? 0,
                icon: <ThumbsUp size={14} />,
              },
            ].map((k) => (
              <div
                key={k.label}
                className="bg-black/15 backdrop-blur-sm border border-white/15 rounded-2xl p-3.5 text-center"
              >
                <div className="flex justify-center mb-1 text-white/60">
                  {k.icon}
                </div>
                <div className="text-xl font-black text-white leading-none">
                  {k.value}
                </div>
                <div className="text-white/65 text-xs font-semibold mt-1">
                  {k.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Streak + points highlights ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/15 rounded-3xl border border-orange-200/70 dark:border-orange-800/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-400/10 rounded-full"></div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Flame className="text-white" size={26} />
            </div>
            <div>
              <div className="text-xs font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest mb-0.5">
                Current Streak
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                {currentStreak}
                <span className="text-base font-semibold text-slate-400 dark:text-slate-500 ml-1">
                  days
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Personal best: {longestStreak} days
              </div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/15 rounded-3xl border border-emerald-200/70 dark:border-emerald-800/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-400/10 rounded-full"></div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Trophy className="text-white" size={26} />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">
                Total Points
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                {citizenPoints.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Level {levelInfo.level} · {levelInfo.title}
              </div>
            </div>
          </div>
        </div>
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/15 rounded-3xl border border-blue-200/70 dark:border-blue-800/50 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-400/10 rounded-full"></div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <TrendingUp className="text-white" size={26} />
            </div>
            <div>
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">
                City Rank
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                {cityRank ? `#${cityRank}` : "—"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {topPercentile
                  ? `Top ${topPercentile}% in ${city}`
                  : `Not ranked in ${city}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity breakdown ────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Activity Breakdown"
          subtitle="Your civic contribution statistics at a glance"
          icon={<BarChart3 size={20} />}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<FileText size={18} />}
            label="Submitted"
            value={citizen?.reportsSubmitted ?? 0}
            subtitle="Issues reported"
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<ShieldCheck size={18} />}
            label="Verified"
            value={citizen?.reportsVerified ?? 0}
            subtitle="Reports confirmed"
            gradient="from-cyan-500 to-teal-500"
          />
          <StatCard
            icon={<CheckCircle size={18} />}
            label="Resolved"
            value={citizen?.reportsResolved ?? 0}
            subtitle="Issues closed"
            gradient="from-emerald-500 to-green-500"
          />
          <StatCard
            icon={<XCircle size={18} />}
            label="Rejected"
            value={citizen?.reportsRejected ?? 0}
            subtitle="Not accepted"
            gradient="from-red-500 to-rose-500"
          />
          <StatCard
            icon={<Copy size={18} />}
            label="Duplicates"
            value={citizen?.duplicateReports ?? 0}
            subtitle="Duplicate flags"
            gradient="from-amber-500 to-orange-500"
          />
          <StatCard
            icon={<MessageCircle size={18} />}
            label="Comments"
            value={citizen?.commentsAdded ?? 0}
            subtitle="Discussion posts"
            gradient="from-teal-500 to-cyan-600"
          />
          <StatCard
            icon={<ThumbsUp size={18} />}
            label="Upvotes"
            value={citizen?.upvotesReceived ?? 0}
            subtitle="On your reports"
            gradient="from-pink-500 to-rose-500"
          />
          <StatCard
            icon={<Video size={18} />}
            label="Video Evidence"
            value={citizen?.videoEvidenceAdded ?? 0}
            subtitle="Videos attached"
            gradient="from-slate-500 to-slate-600"
          />
        </div>
      </div>

      {/* ── Earned badges ─────────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Earned Badges"
          subtitle={`${badges.length} badge${badges.length !== 1 ? "s" : ""} unlocked — keep contributing to earn more`}
          icon={<Award size={20} />}
        />

        {badges.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-14 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Lock size={30} className="text-slate-400 dark:text-slate-500" />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white text-lg mb-2">
              No Badges Yet
            </h4>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
              Submit and verify civic reports to unlock achievements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((b) => {
              const badgeKey = b._id || b.id || b.badgeCode;
              return (
                <div
                  key={badgeKey}
                  className="group relative overflow-hidden bg-white dark:bg-slate-800/80 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700/80 hover:-translate-y-1 p-5"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400/8 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                        {badgeIcon(b.badge?.icon)}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                        <CheckCircle size={10} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 mb-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-black text-slate-900 dark:text-white text-sm leading-tight truncate">
                            {b.badge?.name}
                          </h4>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${categoryColor(b.badge?.category)}`}
                          >
                            {b.badge?.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              b.badge?.isSystemBadge
                                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
                                : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
                            }`}
                          >
                            {b.badge?.isSystemBadge ? "System" : "Custom"}
                          </span>
                          {b.badge?.isActive === false && (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
                              Retired
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {b.badge?.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                          <Clock size={10} />
                          {timeAgo(b.earnedAt)}
                        </span>
                        {b.badge?.rewardPoints !== undefined && (
                          <span className="flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-2.5 py-1">
                            <Zap size={10} />+{b.badge.rewardPoints} pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Point history ─────────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Point History"
          subtitle="Recent activity and point changes"
          icon={<Clock size={20} />}
        />
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/80 overflow-hidden">
          {visibleTransactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No transactions recorded yet.
            </div>
          ) : (
            visibleTransactions.map((tx, i) => {
              const txKey = tx._id || tx.id;
              const isPos = tx.points > 0;
              const isNeg = tx.points < 0;
              return (
                <div
                  key={txKey}
                  className={`group flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors ${i < visibleTransactions.length - 1 ? "border-b border-slate-100/80 dark:border-slate-700/60" : ""}`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      isPos
                        ? "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-600 dark:text-emerald-400"
                        : isNeg
                          ? "bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-600 dark:text-red-400"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    {txTypeIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatTxType(tx.type)}
                      </div>
                      {tx.metadata?.source && (
                        <span className="inline-block text-[9px] font-semibold bg-slate-100 dark:bg-slate-750 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {tx.metadata.source}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {tx.reason}
                    </div>
                    {tx.metadata?.previousPoints !== undefined &&
                      tx.metadata?.newPoints !== undefined && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {tx.metadata.previousPoints.toLocaleString()} →{" "}
                          {tx.metadata.newPoints.toLocaleString()} pts
                        </div>
                      )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={`font-black text-sm ${
                        isPos
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isNeg
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {isPos && "+"}
                      {tx.points}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {timeAgo(tx.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Show more / less */}
          {transactions.length > 6 && (
            <button
              onClick={() => setTxExpanded((v) => !v)}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors border-t border-slate-100 dark:border-slate-700/60"
            >
              {txExpanded ? (
                <>
                  <ChevronUp size={16} />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show {transactions.length - 6} More Transactions
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── City leaderboard ──────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="City Leaderboard"
          subtitle={`All ${leaderboard.length} registered contributors in ${city}`}
          icon={<Users size={20} />}
        />

        {/* Your rank callout */}
        {cityRank && (
          <div className="mb-4 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/15 border border-blue-200/70 dark:border-blue-700/50 rounded-2xl px-5 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
              <BarChart3 size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-black text-blue-900 dark:text-blue-100">
                Your current ranking:{" "}
              </span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                #{cityRank} of {totalCitizens}
              </span>
              {topPercentile && (
                <span className="text-sm text-blue-700/70 dark:text-blue-300/70 font-semibold">
                  {" "}
                  — Top {topPercentile}% in {city}
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 rounded-full px-3 py-1">
              {ptsBehind !== null && ptsBehind >= 0
                ? `${ptsBehind.toLocaleString()} pts behind #${cityRank - 1}`
                : cityRank === 1
                  ? "Top of the board!"
                  : "Keep reporting to rank up!"}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {visibleLeaderboard.map((entry) => {
            const rc = rankConfig(entry.rank, entry.isCurrentUser);
            const entryKey = entry.citizenId || entry._id || entry.rank;
            return (
              <div
                key={entryKey}
                className={`relative overflow-hidden ${rc.rowBg} ${rc.ring} rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-300 p-4`}
              >
                {entry.isCurrentUser && (
                  <div className="absolute top-0 right-0 text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-bl-2xl rounded-tr-2xl px-3 py-1.5 border-l border-b border-blue-200 dark:border-blue-700">
                    YOU
                  </div>
                )}
                <div className="flex items-center gap-3.5">
                  {/* Rank badge */}
                  <div
                    className={`w-10 h-10 rounded-2xl ${rc.badge} flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    {rankMedal(entry.rank)}
                  </div>
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${getLevelGradient(entry.level)} flex items-center justify-center text-white font-black text-base shadow-md flex-shrink-0`}
                  >
                    {(entry.fullName || "C").charAt(0).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm ${rc.nameColor}`}>
                        {entry.fullName}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {entry.levelTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      <MapPin size={10} />
                      <span>
                        {entry.region}, {entry.city || city}
                      </span>
                    </div>
                  </div>
                  {/* Stats (desktop) */}
                  <div className="hidden sm:flex items-center gap-5 text-right flex-shrink-0">
                    <div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                        Resolved
                      </div>
                      <div className="font-black text-slate-800 dark:text-slate-200 text-sm">
                        {entry.reportsResolved}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                        Badges
                      </div>
                      <div className="font-black text-slate-800 dark:text-slate-200 text-sm">
                        {entry.badgeCount}
                      </div>
                    </div>
                    <div className="min-w-[64px]">
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                        Points
                      </div>
                      <div className={`font-black text-base ${rc.pointsColor}`}>
                        {entry.points.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {/* Mobile: just points */}
                  <div className="sm:hidden text-right flex-shrink-0 pr-1">
                    <div className={`font-black text-sm ${rc.pointsColor}`}>
                      {entry.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">pts</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more / less */}
        {leaderboard.length > 6 && (
          <button
            onClick={() => setLeaderboardExpanded((v) => !v)}
            className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 px-5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {leaderboardExpanded ? (
              <>
                <ChevronUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show All {leaderboard.length} Citizens
              </>
            )}
          </button>
        )}
      </div>

      {/* ── How to earn points ────────────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="How to Earn Points"
          subtitle="Complete civic actions to build your score"
          icon={<Zap size={20} />}
        />
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/80 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {POINT_RULES.map((rule) => (
              <div
                key={rule.label}
                className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 ${
                  rule.positive
                    ? "bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-300 dark:hover:border-emerald-700"
                    : "bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${rule.positive ? "bg-emerald-500" : "bg-red-500"}`}
                  ></div>
                  <span
                    className={`text-sm font-semibold ${
                      rule.positive
                        ? "text-emerald-900 dark:text-emerald-200"
                        : "text-red-900 dark:text-red-200"
                    }`}
                  >
                    {rule.label}
                  </span>
                </div>
                <span
                  className={`font-black text-sm ${
                    rule.positive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {typeof rule.points === "number"
                    ? `${rule.positive ? "+" : ""}${rule.points}`
                    : rule.points}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/60">
            <Sparkles
              size={15}
              className="text-amber-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Points are awarded automatically when civic actions are performed.
              Streaks give bonus multipliers. Badge bonus points depend on the
              badge. Default and custom badges can have different reward values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
