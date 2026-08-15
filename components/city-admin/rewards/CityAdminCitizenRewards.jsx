import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Award,
  Trophy,
  Search,
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  Building2,
  Loader2,
  CheckCircle2,
  X,
  Sparkles,
  User,
  Filter,
} from "lucide-react";
import CityRewardStats from "./CityRewardStats";
import CitizenLeaderboardTable from "./CitizenLeaderboardTable";
import CitizenRewardDetailsModal from "./CitizenRewardDetailsModal";
import ManualPointAdjustmentModal from "./ManualPointAdjustmentModal";

function Top3Podium({ top3 = [], onViewDetail }) {
  if (top3.length === 0) return null;

  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
            <Trophy size={22} className="text-amber-100" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Top Civic Champions</h3>
            <p className="text-xs font-medium text-amber-100/90">
              Leading civic contributors in points & verified resolution impact
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* 2nd Place */}
        {second ? (
          <div
            onClick={() => onViewDetail(second)}
            className="p-5 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-900 font-black flex items-center justify-center text-base shadow-md">
              🥈
            </div>
            <div>
              <span className="text-xs font-black uppercase text-amber-200 block">Rank #2</span>
              <h4 className="text-base font-black text-white group-hover:underline truncate max-w-[160px]">
                {second.displayName}
              </h4>
              <p className="text-xs font-bold text-amber-100/80">Lvl {second.level} • {second.levelTitle}</p>
            </div>
            <div className="pt-2 border-t border-white/10 w-full flex justify-between text-xs font-black">
              <span>{second.points.toLocaleString("en-IN")} pts</span>
              <span>{second.badgeCount} Badges</span>
            </div>
          </div>
        ) : <div />}

        {/* 1st Place (Center / Highlighted) */}
        {first && (
          <div
            onClick={() => onViewDetail(first)}
            className="p-6 rounded-3xl bg-white/25 hover:bg-white/30 border-2 border-amber-200 backdrop-blur-md transition-all cursor-pointer flex flex-col items-center text-center space-y-2 shadow-2xl -translate-y-1 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-300 text-amber-950 font-black flex items-center justify-center text-2xl shadow-xl border-2 border-white">
              🥇
            </div>
            <div>
              <span className="text-xs font-black uppercase text-amber-200 tracking-wider block">#1 Champion</span>
              <h4 className="text-lg font-black text-white group-hover:underline truncate max-w-[180px]">
                {first.displayName}
              </h4>
              <p className="text-xs font-bold text-amber-100">Lvl {first.level} • {first.levelTitle}</p>
            </div>
            <div className="pt-3 border-t border-white/20 w-full flex justify-between text-xs font-black">
              <span className="text-base text-amber-200">{first.points.toLocaleString("en-IN")} pts</span>
              <span>{first.badgeCount} Badges</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third ? (
          <div
            onClick={() => onViewDetail(third)}
            className="p-5 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all cursor-pointer flex flex-col items-center text-center space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-700 text-amber-100 font-black flex items-center justify-center text-base shadow-md">
              🥉
            </div>
            <div>
              <span className="text-xs font-black uppercase text-amber-200 block">Rank #3</span>
              <h4 className="text-base font-black text-white group-hover:underline truncate max-w-[160px]">
                {third.displayName}
              </h4>
              <p className="text-xs font-bold text-amber-100/80">Lvl {third.level} • {third.levelTitle}</p>
            </div>
            <div className="pt-2 border-t border-white/10 w-full flex justify-between text-xs font-black">
              <span>{third.points.toLocaleString("en-IN")} pts</span>
              <span>{third.badgeCount} Badges</span>
            </div>
          </div>
        ) : <div />}
      </div>
    </div>
  );
}

export default function CityAdminCitizenRewards({ cityAdminUserId, city }) {
  const [activeTab, setActiveTab] = useState("leaderboard"); // "leaderboard" | "catalog"
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all"); // "all" | "1-5" | "6-10" | "11+"
  const [badgeFilter, setBadgeFilter] = useState("all"); // "all" | "has_badges" | "no_badges"
  const [sortBy, setSortBy] = useState("points"); // "points" | "reports" | "resolved" | "badges" | "streak"

  const [selectedCitizenDetail, setSelectedCitizenDetail] = useState(null);
  const [selectedCitizenAdjust, setSelectedCitizenAdjust] = useState(null);
  const [toast, setToast] = useState(null);

  const rewardsData = useQuery(
    api.cityAdminRewards.getCityCitizenRewardsOverview,
    cityAdminUserId ? { cityAdminUserId } : "skip"
  );

  const allBadges = useQuery(api.badges.getAllBadges, activeTab === "catalog" ? {} : "skip");

  const adjustCitizenPointsMut = useMutation(api.cityAdminRewards.adjustCitizenPoints);
  const awardManualBadgeMut = useMutation(api.cityAdminRewards.awardCityCitizenManualBadge);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const handleAdjustPointsSubmit = useCallback(
    async (payload) => {
      try {
        const res = await adjustCitizenPointsMut({
          cityAdminUserId,
          citizenId: payload.citizenId,
          adjustment: payload.adjustment,
          reason: payload.reason,
        });

        showToast(
          `Successfully ${payload.adjustment > 0 ? "added" : "deducted"} ${Math.abs(payload.adjustment)} points for citizen (${res.newPoints} pts total).`,
          "success"
        );
      } catch (err) {
        console.error("Adjustment failed:", err);
        showToast(err.message || "Failed to adjust points", "error");
        throw err;
      }
    },
    [adjustCitizenPointsMut, cityAdminUserId, showToast]
  );

  const leaderboard = rewardsData?.leaderboard || [];
  const stats = rewardsData?.stats;

  const filteredLeaderboard = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = leaderboard.filter((citizen) => {
      // Search
      const matchSearch =
        !q ||
        [citizen.displayName, citizen.levelTitle, citizen.region, String(citizen.rank)]
          .some((val) => String(val || "").toLowerCase().includes(q));

      // Level filter
      let matchLevel = true;
      if (levelFilter === "1-5") matchLevel = citizen.level >= 1 && citizen.level <= 5;
      if (levelFilter === "6-10") matchLevel = citizen.level >= 6 && citizen.level <= 10;
      if (levelFilter === "11+") matchLevel = citizen.level >= 11;

      // Badge filter
      let matchBadge = true;
      if (badgeFilter === "has_badges") matchBadge = citizen.badgeCount > 0;
      if (badgeFilter === "no_badges") matchBadge = citizen.badgeCount === 0;

      return matchSearch && matchLevel && matchBadge;
    });

    // Custom sorting if specified
    if (sortBy === "reports") {
      list = [...list].sort((a, b) => b.reportsSubmitted - a.reportsSubmitted);
    } else if (sortBy === "resolved") {
      list = [...list].sort((a, b) => b.reportsResolved - a.reportsResolved);
    } else if (sortBy === "badges") {
      list = [...list].sort((a, b) => b.badgeCount - a.badgeCount);
    } else if (sortBy === "streak") {
      list = [...list].sort((a, b) => b.currentStreak - a.currentStreak);
    }
    // Default is already points desc from backend

    return list;
  }, [leaderboard, search, levelFilter, badgeFilter, sortBy]);

  // Loading state
  if (rewardsData === undefined) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <Loader2 className="animate-spin text-amber-500 mx-auto" size={40} />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          Loading citizen rewards and leaderboard for {city || "city"}...
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
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="mt-5 relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-black uppercase tracking-wider text-amber-100 backdrop-blur-sm">
                <Building2 size={13} /> City Admin Scope: {city || "City-Wide"}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/30 text-xs font-black uppercase tracking-wider text-emerald-200">
                Audited Rewards Ledger
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <Award size={32} className="text-amber-100 shrink-0" />
              Citizen Rewards & Leaderboard
            </h1>
            <p className="text-xs sm:text-sm font-medium text-amber-100/90 max-w-2xl leading-relaxed">
              Monitor civic participation, reward points activity, level progressions, and audited point adjustments for all citizens in {city}.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "leaderboard"
                  ? "bg-white text-slate-900 shadow-md"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              Leaderboard ({leaderboard.length})
            </button>

            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === "catalog"
                  ? "bg-white text-slate-900 shadow-md"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              Badge Catalog
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Stats Bar */}
      <CityRewardStats stats={stats} />

      {/* TAB 1: LEADERBOARD VIEW */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          {/* Top 3 Podium */}
          <Top3Podium
            top3={leaderboard.slice(0, 3)}
            onViewDetail={(citizen) => setSelectedCitizenDetail(citizen)}
          />

          {/* Filter & Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Level Filter */}
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3.5 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All Levels</option>
                  <option value="1-5">Levels 1 - 5</option>
                  <option value="6-10">Levels 6 - 10</option>
                  <option value="11+">Level 11+</option>
                </select>

                {/* Badge Filter */}
                <select
                  value={badgeFilter}
                  onChange={(e) => setBadgeFilter(e.target.value)}
                  className="px-3.5 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All Badges</option>
                  <option value="has_badges">Has Badges</option>
                  <option value="no_badges">No Badges</option>
                </select>

                {/* Sort selector */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3.5 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="points">Sort: Points (High → Low)</option>
                  <option value="reports">Sort: Most Reports Submitted</option>
                  <option value="resolved">Sort: Most Reports Resolved</option>
                  <option value="badges">Sort: Most Badges Earned</option>
                  <option value="streak">Sort: Longest Active Streak</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-72">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search citizen name, rank..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
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

          {/* Main Leaderboard Table */}
          <CitizenLeaderboardTable
            citizens={filteredLeaderboard}
            onViewDetail={(citizen) => setSelectedCitizenDetail(citizen)}
            onAdjustPoints={(citizen) => setSelectedCitizenAdjust(citizen)}
          />
        </div>
      )}

      {/* TAB 2: BADGE CATALOG VIEW */}
      {activeTab === "catalog" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Gamification Badge Catalog
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                System & custom achievement badges configured for {city} citizens.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-black border border-purple-200">
              {(allBadges || []).length} Active Badges
            </span>
          </div>

          {allBadges === undefined ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin text-purple-600 mx-auto" size={28} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBadges.map((badge) => (
                <div
                  key={badge._id}
                  className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black shadow-md">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        +{badge.rewardPoints} pts
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        badge.isSystemBadge
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {badge.isSystemBadge ? "System" : "Custom"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {badge.name}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {badge.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Criteria: {badge.criteriaType}</span>
                    <span>Req: {badge.requiredCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Citizen Reward Details Modal */}
      {selectedCitizenDetail && (
        <CitizenRewardDetailsModal
          cityAdminUserId={cityAdminUserId}
          citizen={selectedCitizenDetail}
          onClose={() => setSelectedCitizenDetail(null)}
          onAdjustPoints={(citizen) => setSelectedCitizenAdjust(citizen)}
        />
      )}

      {/* Manual Point Adjustment Modal */}
      {selectedCitizenAdjust && (
        <ManualPointAdjustmentModal
          citizen={selectedCitizenAdjust}
          onClose={() => setSelectedCitizenAdjust(null)}
          onSubmitAdjustment={handleAdjustPointsSubmit}
        />
      )}

    </div>
  );
}
