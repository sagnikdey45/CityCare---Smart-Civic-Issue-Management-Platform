import React, { useState, useMemo } from "react";
import { Search, UserCheck, CheckCircle2, XCircle, Clock, Star, Zap, AlertTriangle, ShieldCheck, Tag } from "lucide-react";

export default function OfficerPerformanceTable({ officers = [], type = "uo" }) {
  const [search, setSearch] = useState("");

  const filteredOfficers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return officers;

    return officers.filter((officer) => {
      const nameMatch = String(officer.fullName || "").toLowerCase().includes(q);
      const specMatch = Array.isArray(officer.specialisations)
        ? officer.specialisations.some((s) => String(s).toLowerCase().includes(q))
        : false;
      return nameMatch || specMatch;
    });
  }, [officers, search]);

  const isUO = type === "uo";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${isUO ? "Unit Officers" : "Field Officers"} by name...`}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing {filteredOfficers.length} of {officers.length} {isUO ? "Unit Officers" : "Field Officers"}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-6">{isUO ? "Unit Officer" : "Field Officer"}</th>
                <th className="py-4 px-6 text-center">{isUO ? "Verified / Rejected" : "Workload / Capacity"}</th>
                <th className="py-4 px-6 text-center">Active Issues</th>
                <th className="py-4 px-6 text-center">Resolved Issues</th>
                <th className="py-4 px-6 text-center">{isUO ? "Avg Res Time" : "On-Time Rate"}</th>
                <th className="py-4 px-6 text-center">Efficiency Score</th>
                <th className="py-4 px-6 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No {isUO ? "Unit Officers" : "Field Officers"} assigned to this department yet.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer) => {
                  const isApproved = officer.accountApproved !== false;

                  return (
                    <tr
                      key={officer.profileId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Status */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white text-sm">
                              {officer.fullName}
                            </span>
                            {isApproved ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase">
                                Pending Approval
                              </span>
                            )}
                          </div>
                          {!isUO && Array.isArray(officer.specialisations) && officer.specialisations.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {officer.specialisations.map((spec, i) => (
                                <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* UO: Verified/Rejected | FO: Workload/Capacity */}
                      <td className="py-4 px-6 text-center">
                        {isUO ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">
                              {officer.totalVerifiedIssues} verified
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className="text-rose-600 dark:text-rose-400 font-bold">
                              {officer.totalRejectedIssues} rejected
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1 max-w-[160px] mx-auto">
                            <div className="flex justify-between items-center text-[11px] font-bold">
                              <span className="text-slate-900 dark:text-white">
                                {officer.currentActiveIssues} / {officer.maxIssueCapacity}
                              </span>
                              <span className={officer.workloadPercent >= 100 ? "text-rose-600 font-black" : "text-slate-500"}>
                                {officer.workloadPercent}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  officer.workloadPercent >= 100
                                    ? "bg-rose-500"
                                    : officer.workloadPercent >= 70
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, officer.workloadPercent)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Active Issues */}
                      <td className="py-4 px-6 text-center">
                        <span className="font-black text-slate-900 dark:text-white">
                          {isUO ? officer.activeIssues : officer.currentActiveIssues}
                        </span>
                      </td>

                      {/* Resolved Issues */}
                      <td className="py-4 px-6 text-center">
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          {isUO ? officer.resolvedIssues : officer.totalResolvedIssues}
                        </span>
                      </td>

                      {/* UO: Avg Res Time | FO: On-Time Rate */}
                      <td className="py-4 px-6 text-center font-bold text-slate-700 dark:text-slate-300">
                        {isUO
                          ? officer.avgResolutionTime > 0 ? `${officer.avgResolutionTime} hrs` : "N/A"
                          : `${officer.onTimeCompletionRate}%`}
                      </td>

                      {/* Efficiency Score Progress Bar */}
                      <td className="py-4 px-6 text-center">
                        <div className="space-y-1 max-w-[120px] mx-auto">
                          <span className="font-black text-slate-900 dark:text-white text-xs block">
                            {officer.efficiencyScore}%
                          </span>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, officer.efficiencyScore)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-6 text-right">
                        {officer.rating > 0 ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>{officer.rating} / 5</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
