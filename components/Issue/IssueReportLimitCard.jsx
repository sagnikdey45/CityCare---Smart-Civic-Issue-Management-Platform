import React from "react";
import { ShieldCheck, Gauge, Clock, AlertTriangle, FilePlus2, AlertCircle, RefreshCw } from "lucide-react";

export default function IssueReportLimitCard({
  limit = 3,
  remaining = 3,
  used = 0,
  reset = null,
  cooldown = null,
  variant = "full",
  onReportClick = null,
  onRefresh = null,
  isLoading = false,
}) {
  const isInitialLoading = isLoading && !reset;
  if (isInitialLoading) {
    return (
      <div className="animate-pulse w-full rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-slate-300 dark:bg-slate-700 w-1/3 rounded-lg"></div>
          <div className="h-5 bg-slate-300 dark:bg-slate-700 w-12 rounded-full"></div>
        </div>
        <div className="h-4 bg-slate-350 dark:bg-slate-700 w-3/4 rounded-md"></div>
        <div className="h-3 bg-slate-350 dark:bg-slate-700 w-full rounded-full mt-2"></div>
      </div>
    );
  }

  const usedPercentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isWindowLimitReached = remaining === 0;
  const isCooldownActive = cooldown && cooldown.remaining === 0;
  const isLimitReached = isWindowLimitReached || isCooldownActive;

  const formattedResetTime = reset
    ? new Date(reset).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "tomorrow";

  const cooldownResetTime = cooldown?.reset
    ? new Date(cooldown.reset).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "soon";

  if (variant === "compact") {
    return (
      <div
        className={`w-full rounded-[2.5rem] border backdrop-blur-lg p-7 transition-all duration-500 relative overflow-hidden group ${
          isLimitReached
            ? "border-rose-500/20 bg-gradient-to-br from-rose-500/[0.04] to-red-500/[0.01] dark:from-rose-500/[0.08] dark:to-red-500/[0.02] shadow-[0_12px_40px_rgba(239,68,68,0.06)]"
            : "border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] to-teal-500/[0.01] dark:from-emerald-500/[0.08] dark:to-teal-500/[0.02] shadow-[0_12px_40px_rgba(16,185,129,0.06)]"
        }`}
      >
        {/* Ambient glow backgrounds */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] pointer-events-none transition-opacity duration-500 ${
          isLimitReached ? "bg-rose-500/10" : "bg-emerald-500/10"
        }`} />

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-start justify-between sm:items-center gap-3">
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-3 rounded-2xl shadow-inner border transition-colors duration-300 ${
                    isLimitReached
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-450"
                  }`}
                >
                  {isLimitReached ? <AlertTriangle size={20} /> : <Gauge size={20} />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">
                      Reporting Window Quota
                    </h3>
                    <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full border ${
                      isLimitReached
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    }`}>
                      {isLimitReached ? "Restricted" : "Active Quota"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    You can submit up to 3 reports every 8 hours.
                  </p>
                </div>
              </div>

              {onRefresh && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onRefresh();
                  }}
                  className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-850/80 bg-white/70 dark:bg-slate-900/70 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/35 hover:scale-[1.05] active:scale-[0.95] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-300 flex-shrink-0"
                  title="Refresh limits"
                >
                  <RefreshCw size={14} className={isLoading ? "animate-spin" : "hover:rotate-45 transition-transform duration-350"} />
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-350">
                <span className="tracking-tight">
                  {remaining} / {limit} reports left in current window
                </span>
                <span className="text-slate-500">Used: {used}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-900/60 rounded-full overflow-hidden p-[1px] border border-slate-200/20 dark:border-slate-800/40">
                <div
                  className={`h-full rounded-full transition-all duration-500 relative ${
                    isWindowLimitReached
                      ? "bg-gradient-to-r from-rose-500 to-red-600"
                      : isCooldownActive
                        ? "bg-gradient-to-r from-amber-400 to-orange-500"
                        : "bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"
                  }`}
                  style={{ width: `${usedPercentage}%` }}
                >
                  {usedPercentage > 0 && usedPercentage < 100 && (
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/30 blur-[1px] animate-pulse rounded-full" />
                  )}
                </div>
              </div>
            </div>

            {/* Quota Reset / Cooldown Detail Footer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-200/40 dark:border-slate-850/40">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-450">
                <Clock size={12} />
                <span>Window refresh: {formattedResetTime}</span>
              </div>
              
              {cooldown && (
                <div className={`flex items-center gap-2 text-[11px] font-bold ${
                  isCooldownActive ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-450"
                }`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isCooldownActive ? "bg-amber-400" : "bg-emerald-400"
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      isCooldownActive ? "bg-amber-500" : "bg-emerald-500"
                    }`}></span>
                  </span>
                  <span>
                    {isCooldownActive
                      ? `Cooldown Active (next report available in 30 minutes)`
                      : "Cooldown Clear"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full xl:w-auto self-stretch xl:self-auto flex items-center justify-center pl-0 xl:pl-4">
            {onReportClick && (
              <button
                disabled={isLimitReached}
                onClick={onReportClick}
                className={`w-full xl:w-auto px-7 py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                  isLimitReached
                    ? "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200/80 dark:border-slate-800"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_6px_20px_rgba(20,184,166,0.35)] hover:scale-[1.03] active:scale-[0.97]"
                }`}
              >
                {isWindowLimitReached
                  ? "Limit Reached"
                  : isCooldownActive
                    ? "Cooldown Active"
                    : "Report an Issue"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default "full" variant for report issue form page
  return (
    <div
      className={`w-full rounded-3xl border backdrop-blur-lg p-6 transition-all duration-500 relative overflow-hidden group ${
        isLimitReached
          ? "border-rose-500/20 bg-gradient-to-br from-rose-500/[0.04] to-red-500/[0.01] dark:from-rose-500/[0.08] dark:to-red-500/[0.02] shadow-[0_12px_40px_rgba(239,68,68,0.04)]"
          : "border-teal-500/15 bg-white/50 dark:bg-slate-950/40 shadow-[0_12px_40px_rgba(0,0,0,0.01)]"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-3 rounded-2xl shadow-inner border transition-colors duration-300 ${
              isLimitReached
                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                : "bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-450"
            }`}
          >
            {isLimitReached ? <AlertCircle size={22} /> : <ShieldCheck size={22} />}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Reporting Window Quota
              </h4>
              {onRefresh && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onRefresh();
                  }}
                  className="p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-850/80 bg-white/60 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/35 hover:scale-[1.05] active:scale-[0.95] hover:shadow-sm transition-all duration-300"
                  title="Refresh limits"
                >
                  <RefreshCw size={12} className={isLoading ? "animate-spin" : "hover:rotate-45 transition-transform duration-350"} />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 leading-relaxed">
              {isWindowLimitReached
                ? `Reporting window limit reached. You can report again after ${formattedResetTime}.`
                : `You can submit ${remaining} more issue reports in this 8-hour window.`}
            </p>
          </div>
        </div>

        <div className="text-right flex items-baseline gap-1 sm:block">
          <span
            className={`text-2xl font-black tracking-tight ${
              isWindowLimitReached ? "text-rose-500" : "text-teal-600 dark:text-teal-400"
            }`}
          >
            {remaining}
          </span>
          <span className="text-xs text-slate-550 dark:text-slate-400 font-bold">
            {" "}
            / {limit} left
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-900/60 rounded-full overflow-hidden p-[1px] border border-slate-200/10 dark:border-slate-800/40">
          <div
            className={`h-full rounded-full transition-all duration-500 relative ${
              isWindowLimitReached
                ? "bg-gradient-to-r from-rose-500 to-red-650"
                : isCooldownActive
                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                  : "bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"
            }`}
            style={{ width: `${usedPercentage}%` }}
          >
            {usedPercentage > 0 && usedPercentage < 100 && (
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/30 blur-[1px] animate-pulse rounded-full" />
            )}
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-550 dark:text-slate-400 font-black uppercase tracking-wider">
          <span>Used in window: {used}</span>
          <span className="flex items-center gap-1.5">
            <Clock size={11} /> Refresh: {formattedResetTime}
          </span>
        </div>
      </div>

      {/* Cooldown Status Alert Box */}
      {cooldown && (
        <div
          className={`mt-5 p-3.5 rounded-2xl border backdrop-blur-sm flex items-center justify-between text-xs font-bold transition-all duration-300 ${
            isCooldownActive
              ? "bg-amber-500/[0.04] border-amber-500/20 text-amber-700 dark:text-amber-400"
              : "bg-emerald-500/[0.04] border-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isCooldownActive ? "bg-amber-400" : "bg-emerald-400"
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isCooldownActive ? "bg-amber-500" : "bg-emerald-500"
              }`}></span>
            </span>
            <span>
              {isCooldownActive
                ? `Cooldown active. Next report available after ${cooldownResetTime}.`
                : "Cooldown clear. You can submit if your window quota is available."}
            </span>
          </div>
          <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded-md ${
            isCooldownActive
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          }`}>
            {isCooldownActive ? "Restricted" : "Ready"}
          </span>
        </div>
      )}
    </div>
  );
}
