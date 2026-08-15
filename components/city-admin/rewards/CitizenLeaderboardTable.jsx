import React, { useState, useMemo } from "react";
import {
  Trophy,
  Medal,
  Award,
  Flame,
  CheckCircle2,
  FileText,
  Sliders,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";

function getRankBadge(rank) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-2xl bg-amber-400 text-amber-950 font-black flex items-center justify-center shadow-lg shadow-amber-500/20 text-xs border border-amber-300">
        🥇 1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-2xl bg-slate-300 text-slate-900 font-black flex items-center justify-center shadow-md text-xs border border-slate-200">
        🥈 2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-2xl bg-amber-700 text-amber-100 font-black flex items-center justify-center shadow-md text-xs border border-amber-600">
        🥉 3
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center text-xs border border-slate-200 dark:border-slate-700">
      #{rank}
    </div>
  );
}

function formatDate(timestamp) {
  if (!timestamp) return "No activity yet";
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name) {
  const parts = String(name || "Citizen")
    .trim()
    .split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

export default function CitizenLeaderboardTable({
  citizens = [],
  onViewDetail,
  onAdjustPoints,
}) {
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1;
    return Math.ceil(citizens.length / Number(pageSize)) || 1;
  }, [citizens.length, pageSize]);

  const paginatedCitizens = useMemo(() => {
    if (pageSize === "all") return citizens;
    const start = (currentPage - 1) * Number(pageSize);
    return citizens.slice(start, start + Number(pageSize));
  }, [citizens, currentPage, pageSize]);

  const handlePageSizeChange = (val) => {
    setPageSize(val === "all" ? "all" : Number(val));
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-4 px-6">Rank</th>
              <th className="py-4 px-6">Citizen</th>
              <th className="py-4 px-6 text-right">Points</th>
              <th className="py-4 px-6 text-center">
                Reports (Submitted / Resolved)
              </th>
              <th className="py-4 px-6 text-center">Badges & Streaks</th>
              <th className="py-4 px-6">Last Active</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
            {paginatedCitizens.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No citizens found in this leaderboard view.
                </td>
              </tr>
            ) : (
              paginatedCitizens.map((citizen) => (
                <tr
                  key={citizen.citizenId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onViewDetail(citizen)}
                >
                  {/* Rank */}
                  <td className="py-4 px-6">{getRankBadge(citizen.rank)}</td>

                  {/* Citizen Identity */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black flex items-center justify-center shrink-0 shadow-md text-xs">
                        {getInitials(citizen.displayName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 dark:text-white text-sm">
                            {citizen.displayName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Trophy size={10} />
                            <span>
                              Lvl {citizen.level} • {citizen.levelTitle}
                            </span>
                          </span>
                          {citizen.region && (
                            <span className="text-[11px] font-bold text-slate-400">
                              {citizen.region}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Points */}
                  <td className="py-4 px-6 text-right">
                    <span className="font-black text-base text-slate-900 dark:text-white block">
                      {citizen.points.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        pts
                      </span>
                    </span>
                  </td>

                  {/* Reports */}
                  <td className="py-4 px-6 text-center">
                    <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                        <FileText size={12} className="text-slate-400" />
                        <span>{citizen.reportsSubmitted}</span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">
                        /
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={12} />
                        <span>{citizen.reportsResolved}</span>
                      </span>
                    </div>
                  </td>

                  {/* Badges & Streaks */}
                  <td className="py-4 px-6 text-center">
                    <div className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-black">
                        <ShieldCheck size={12} />
                        <span>{citizen.badgeCount} Badges</span>
                      </span>

                      {citizen.currentStreak > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-[11px] font-black">
                          <Flame size={12} />
                          <span>{citizen.currentStreak}d Streak</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Last Active */}
                  <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                    {formatDate(citizen.lastActivityAt)}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-4 px-6 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(citizen);
                        }}
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="View Complete Activity & Breakdown"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdjustPoints(citizen);
                        }}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Manually Add or Reduce Points"
                      >
                        <SlidersHorizontal size={13} />
                        <span>Adjust</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-3">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All Citizens ({citizens.length})</option>
          </select>
          <span>
            Showing {paginatedCitizens.length} of {citizens.length} citizens
          </span>
        </div>

        {pageSize !== "all" && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
