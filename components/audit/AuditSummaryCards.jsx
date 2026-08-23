"use client";

import React from "react";
import {
  Activity,
  Calendar,
  Users,
  ShieldAlert,
  Globe,
  Smartphone,
  Laptop,
  Briefcase,
  CheckCircle,
} from "lucide-react";

export default function AuditSummaryCards({ summary, isSystemAdmin = false }) {
  if (!summary) return null;

  const cards = [
    {
      title: "Total Audit Activity",
      value: summary.totalLogs || 0,
      subText: "Recorded platform actions",
      icon: Activity,
      gradient: "from-blue-600 to-indigo-600",
      textColor: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: "Today's Activity",
      value: summary.todayActions || 0,
      subText: "Actions recorded today",
      icon: Calendar,
      gradient: "from-emerald-600 to-teal-600",
      textColor: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: "Citizen Actions",
      value: summary.citizenActions || 0,
      subText: "Submissions & feedback",
      icon: Users,
      gradient: "from-cyan-600 to-sky-600",
      textColor: "text-cyan-500 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
    },
    {
      title: "Officer Activity",
      value: (summary.unitOfficerActions || 0) + (summary.fieldOfficerActions || 0),
      subText: `${summary.unitOfficerActions || 0} UO | ${summary.fieldOfficerActions || 0} FO`,
      icon: Briefcase,
      gradient: "from-amber-600 to-orange-600",
      textColor: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      title: "Administrative Actions",
      value: (summary.cityAdminActions || 0) + (summary.systemAdminActions || 0),
      subText: `${summary.cityAdminActions || 0} City Admin | ${summary.systemAdminActions || 0} Admin`,
      icon: ShieldAlert,
      gradient: "from-purple-600 to-indigo-600",
      textColor: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
    },
    isSystemAdmin
      ? {
          title: "Active Cities",
          value: summary.citiesWithActivity || 0,
          subText: "Cities with audit logs",
          icon: Globe,
          gradient: "from-pink-600 to-rose-600",
          textColor: "text-rose-500 dark:text-rose-400",
          bgColor: "bg-rose-50 dark:bg-rose-950/40",
        }
      : {
          title: "Web vs Mobile Source",
          value: summary.webActions || 0,
          subText: `${summary.webActions || 0} Web | ${summary.mobileActions || 0} Mobile`,
          icon: Laptop,
          gradient: "from-slate-700 to-slate-900",
          textColor: "text-slate-500 dark:text-slate-400",
          bgColor: "bg-slate-100 dark:bg-slate-800/50",
        },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`w-4 h-4 ${card.textColor}`} />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {card.value.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
              {card.subText}
            </div>
          </div>
        );
      })}
    </div>
  );
}
