import React from "react";
import { ShieldCheck, Gauge, Clock, AlertTriangle, FilePlus2, AlertCircle } from "lucide-react";

export default function IssueReportLimitCard({
  limit = 5,
  remaining = 5,
  used = 0,
  reset = null,
  variant = "full",
  onReportClick = null,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="animate-pulse w-full rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-5 flex flex-col gap-3">
        <div className="h-5 bg-slate-350 dark:bg-slate-700 w-1/4 rounded"></div>
        <div className="h-4 bg-slate-350 dark:bg-slate-700 w-3/4 rounded"></div>
        <div className="h-2 bg-slate-350 dark:bg-slate-700 w-full rounded-full mt-2"></div>
      </div>
    );
  }

  const usedPercentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isLimitReached = remaining === 0;

  const formattedResetTime = reset
    ? new Date(reset).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "tomorrow";

  if (variant === "compact") {
    return (
      <div
        className={`w-full rounded-[2rem] border backdrop-blur-md p-6 transition-all duration-300 ${
          isLimitReached
            ? "border-rose-500/30 bg-rose-50/10 dark:bg-rose-950/10 shadow-[0_8px_32px_rgba(239,68,68,0.05)]"
            : "border-teal-500/20 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 shadow-[0_8px_32px_rgba(20,184,166,0.05)]"
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-xl ${
                  isLimitReached
                    ? "bg-rose-500/10 text-rose-500"
                    : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                }`}
              >
                {isLimitReached ? <AlertTriangle size={18} /> : <Gauge size={18} />}
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Daily Reporting Limit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track how many civic issues you can still report today.
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-350">
                <span>
                  {remaining} / {limit} reports left
                </span>
                <span>Used: {used}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isLimitReached
                      ? "bg-gradient-to-r from-rose-500 to-red-600"
                      : "bg-gradient-to-r from-emerald-400 to-teal-500"
                  }`}
                  style={{ width: `${usedPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-450">
              <Clock size={11} />
              <span>Resets: {formattedResetTime}</span>
            </div>
          </div>

          <div className="w-full md:w-auto self-stretch md:self-auto flex items-center justify-center">
            {onReportClick && (
              <button
                disabled={isLimitReached}
                onClick={onReportClick}
                className={`w-full md:w-auto px-6 py-3 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 ${
                  isLimitReached
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-[0_4px_14px_rgba(20,184,166,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isLimitReached ? "Limit Reached" : "Report an Issue"}
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
      className={`w-full rounded-2xl border backdrop-blur-md p-5 transition-all duration-300 ${
        isLimitReached
          ? "border-rose-500/25 bg-rose-500/5 dark:bg-rose-950/10 shadow-[0_8px_20px_rgba(239,68,68,0.03)]"
          : "border-teal-500/15 bg-white/40 dark:bg-slate-900/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl ${
              isLimitReached
                ? "bg-rose-500/10 text-rose-500"
                : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
            }`}
          >
            {isLimitReached ? <AlertCircle size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Reporting Limit Quota
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLimitReached
                ? `Daily report limit reached. You can report again after ${formattedResetTime}.`
                : `You can submit ${remaining} more issue reports today.`}
            </p>
          </div>
        </div>

        <div className="text-right sm:text-right">
          <span
            className={`text-lg font-black tracking-tight ${
              isLimitReached ? "text-rose-500" : "text-teal-600 dark:text-teal-400"
            }`}
          >
            {remaining}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            {" "}
            / {limit} left
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLimitReached
                ? "bg-gradient-to-r from-rose-500 to-red-600"
                : "bg-gradient-to-r from-emerald-400 to-teal-500"
            }`}
            style={{ width: `${usedPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-450 font-semibold uppercase tracking-wider">
          <span>Used: {used}</span>
          <span className="flex items-center gap-1">
            <Clock size={10} /> Reset: {formattedResetTime}
          </span>
        </div>
      </div>
    </div>
  );
}
