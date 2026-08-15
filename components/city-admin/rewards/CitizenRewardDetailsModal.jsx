import React, { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  X,
  Trophy,
  Award,
  ShieldCheck,
  Flame,
  FileText,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Loader2,
  Calendar,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  User,
  Filter,
} from "lucide-react";

const POINT_TYPE_LABELS = {
  issue_submitted: "Issue Reported",
  video_evidence_added: "Evidence Added",
  issue_verified: "Report Verified",
  issue_assigned: "Issue Assigned",
  issue_resolved: "Issue Resolved",
  issue_closed: "Issue Closed",
  issue_rejected: "Issue Rejected",
  duplicate_report: "Duplicate Report Penalty",
  issue_withdrawn: "Issue Withdrawn",
  comment_added: "Discussion Comment",
  comment_liked: "Comment Liked",
  report_upvoted: "Report Upvoted",
  streak_bonus: "Civic Streak Bonus",
  badge_bonus: "Badge Achievement Reward",
  manual_adjustment: "Manual Admin Adjustment",
};

function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return String(timestamp);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CitizenRewardDetailsModal({
  cityAdminUserId,
  citizen,
  onClose,
  onAdjustPoints,
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "ledger" | "badges"
  const [ledgerFilter, setLedgerFilter] = useState("all"); // "all" | "earned" | "deductions" | "manual"

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const detailData = useQuery(
    api.cityAdminRewards.getCityCitizenRewardDetails,
    cityAdminUserId && citizen?.citizenId
      ? { cityAdminUserId, citizenId: citizen.citizenId }
      : "skip",
  );

  if (!citizen) return null;

  const currentCitizen = detailData?.citizen || citizen;
  const pointBreakdown = detailData?.pointBreakdown || {
    reporting: 0,
    verification: 0,
    resolution: 0,
    community: 0,
    streaks: 0,
    badges: 0,
    manualAdditions: 0,
    manualDeductions: 0,
    manualNet: 0,
  };
  const earnedBadges = detailData?.earnedBadges || [];
  const rawTransactions = detailData?.transactions || [];

  const filteredTransactions = rawTransactions.filter((tx) => {
    if (ledgerFilter === "earned")
      return tx.points > 0 && tx.type !== "manual_adjustment";
    if (ledgerFilter === "deductions") return tx.points < 0;
    if (ledgerFilter === "manual") return tx.type === "manual_adjustment";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black flex items-center justify-center shadow-md text-base">
              {currentCitizen.displayName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {currentCitizen.displayName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black text-[10px] uppercase border border-amber-300 dark:border-amber-800">
                  Rank #{currentCitizen.rank || citizen.rank || "N/A"}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Level {currentCitizen.level} • {currentCitizen.levelTitle} (
                {currentCitizen.city})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-right">
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block">
                Total Balance
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {currentCitizen.points.toLocaleString("en-IN")} pts
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          {[
            { id: "overview", label: "Overview & Breakdown", icon: Activity },
            {
              id: "ledger",
              label: `Transaction Ledger (${rawTransactions.length})`,
              icon: Clock,
            },
            {
              id: "badges",
              label: `Earned Badges (${earnedBadges.length})`,
              icon: ShieldCheck,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {detailData === undefined ? (
            <div className="p-12 text-center space-y-3">
              <Loader2
                className="animate-spin text-amber-500 mx-auto"
                size={32}
              />
              <p className="text-xs font-bold text-slate-500">
                Loading audited citizen rewards history...
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & BREAKDOWN */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Point Source Composition Cards */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      How Civic Activity Contributed to Points
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        {
                          label: "Reporting",
                          value: pointBreakdown.reporting,
                          color:
                            "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200",
                        },
                        {
                          label: "Verification",
                          value: pointBreakdown.verification,
                          color:
                            "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200",
                        },
                        {
                          label: "Resolution",
                          value: pointBreakdown.resolution,
                          color:
                            "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200",
                        },
                        {
                          label: "Community",
                          value: pointBreakdown.community,
                          color:
                            "text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200",
                        },
                        {
                          label: "Streaks",
                          value: pointBreakdown.streaks,
                          color:
                            "text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200",
                        },
                        {
                          label: "Badges",
                          value: pointBreakdown.badges,
                          color:
                            "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200",
                        },
                        {
                          label: "Manual Added",
                          value: pointBreakdown.manualAdditions,
                          color:
                            "text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200",
                        },
                        {
                          label: "Manual Deducted",
                          value: pointBreakdown.manualDeductions,
                          color:
                            "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`p-4 rounded-2xl border ${item.color} shadow-sm space-y-1`}
                        >
                          <span className="text-[11px] font-black uppercase block opacity-80">
                            {item.label}
                          </span>
                          <span className="text-xl font-black block">
                            {item.value >= 0 ? `+${item.value}` : item.value}{" "}
                            pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Scorecard */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Civic Participation Scorecard
                    </h3>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-400 block">
                          Reports Submitted
                        </span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {currentCitizen.reportsSubmitted}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-400 block">
                          Reports Verified
                        </span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                          {currentCitizen.reportsVerified}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-400 block">
                          Reports Resolved
                        </span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {currentCitizen.reportsResolved}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-400 block">
                          Current / Max Streak
                        </span>
                        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                          {currentCitizen.currentStreak}d /{" "}
                          {currentCitizen.longestStreak}d
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TRANSACTION LEDGER */}
              {activeTab === "ledger" && (
                <div className="space-y-4">
                  {/* Ledger Filters */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {[
                        { key: "all", label: "All Transactions" },
                        { key: "earned", label: "Earned" },
                        { key: "deductions", label: "Deductions" },
                        { key: "manual", label: "Manual Adjustments" },
                      ].map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setLedgerFilter(f.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            ledgerFilter === f.key
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <span className="text-xs font-bold text-slate-400">
                      Showing {filteredTransactions.length} records
                    </span>
                  </div>

                  {/* Ledger Table */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {filteredTransactions.length === 0 ? (
                      <div className="p-8 text-center text-xs font-bold text-slate-400">
                        No transactions found matching the selected filter.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {filteredTransactions.map((tx) => {
                          const isPositive = tx.points > 0;
                          const isManual = tx.type === "manual_adjustment";

                          return (
                            <div
                              key={tx.id}
                              className="p-4 flex items-start justify-between gap-4 hover:bg-white dark:hover:bg-slate-800/80 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-black ${
                                    isPositive
                                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200"
                                      : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200"
                                  }`}
                                >
                                  {isPositive ? (
                                    <ArrowUpRight size={18} />
                                  ) : (
                                    <ArrowDownRight size={18} />
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                      {POINT_TYPE_LABELS[tx.type] || tx.type}
                                    </span>
                                    {isManual && (
                                      <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[9px] font-black uppercase">
                                        Admin Manual
                                      </span>
                                    )}
                                    {tx.issueCode && (
                                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold">
                                        #{tx.issueCode}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    {tx.reason}
                                  </p>
                                  <span className="text-[10px] font-semibold text-slate-400 block">
                                    {formatDate(tx.createdAt)}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span
                                  className={`text-base font-black ${
                                    isPositive
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-rose-600 dark:text-rose-400"
                                  }`}
                                >
                                  {isPositive ? `+${tx.points}` : tx.points} pts
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: EARNED BADGES */}
              {activeTab === "badges" && (
                <div className="space-y-4">
                  {earnedBadges.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <ShieldCheck
                        size={36}
                        className="text-slate-400 mx-auto"
                      />
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        No Badges Earned Yet
                      </h4>
                      <p className="text-xs text-slate-500">
                        This citizen has not unlocked any achievement badges
                        yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {earnedBadges.map((b) => (
                        <div
                          key={b.citizenBadgeId}
                          className="p-5 rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-md">
                              <ShieldCheck size={20} />
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase">
                              +{b.rewardPoints} pts
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                              {b.name}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                              {b.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>Earned {formatDate(b.earnedAt)}</span>
                            <span className="font-mono">{b.code}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">
            Citizen ID: {citizen.citizenId}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onAdjustPoints(citizen);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal size={15} />
              <span>Adjust Points</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
