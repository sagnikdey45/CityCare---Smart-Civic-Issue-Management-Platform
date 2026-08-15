import React from "react";
import { Users, Award, ShieldCheck, Zap, Activity, TrendingUp } from "lucide-react";

function formatNumber(val) {
  const num = Number(val || 0);
  return num.toLocaleString("en-IN");
}

export default function CityRewardStats({ stats }) {
  if (!stats) return null;

  const items = [
    {
      label: "Total Citizens",
      value: formatNumber(stats.totalCitizens),
      subtext: `Avg ${formatNumber(stats.averagePoints)} pts/citizen`,
      icon: Users,
      colorText: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    },
    {
      label: "Points in Circulation",
      value: formatNumber(stats.totalPointsInCirculation),
      subtext: "Civic & reward pool",
      icon: Award,
      colorText: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    },
    {
      label: "Badges Earned",
      value: formatNumber(stats.totalBadgesEarned),
      subtext: "Achievements unlocked",
      icon: ShieldCheck,
      colorText: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
    },
    {
      label: "Active Citizens",
      value: formatNumber(stats.activeCitizensCount),
      subtext: "Active in last 30 days",
      icon: Zap,
      colorText: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
    },
    {
      label: "Manual Adjustments",
      value: `${stats.manualNetAdjustment >= 0 ? "+" : ""}${formatNumber(stats.manualNetAdjustment)}`,
      subtext: `+${formatNumber(stats.manualAddedPoints)} / -${formatNumber(stats.manualDeductedPoints)}`,
      icon: Activity,
      colorText: stats.manualNetAdjustment >= 0 ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400",
      bgColor: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${item.bgColor}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.label}
              </span>
              <div className={`p-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm ${item.colorText}`}>
                <Icon size={18} />
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white block tracking-tight">
                {item.value}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
                {item.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
