"use client";

import React from "react";
import {
  CheckCircle2,
  Award,
  X,
  Sparkles,
  ShieldCheck,
  Users,
  Wrench,
  Star,
  Info,
} from "lucide-react";

const SuccessModal = ({
  onClose,
  pointsEarned = 5,
  hasVideoEvidence = false,
  issueCode = "",
  issueTitle = "",
  onViewDashboard,
  onReportAnother,
}) => {
  const steps = [
    {
      title: "Review",
      text: "Unit Officer checks report",
      icon: ShieldCheck,
    },
    {
      title: "Assign",
      text: "Department + officer",
      icon: Users,
    },
    {
      title: "Resolve",
      text: "Field work begins",
      icon: Wrench,
    },
    {
      title: "Feedback",
      text: "Rate after closure",
      icon: Star,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-emerald-100 dark:border-emerald-900/40 animate-scaleIn max-h-[90vh] overflow-y-auto"
      >
        <div className="relative bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700 px-6 py-6 text-center overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-16 w-44 h-44 bg-white/10 rounded-full blur-2xl" />

          <button
            onClick={onClose}
            aria-label="Close success modal"
            className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/95 dark:bg-zinc-900 shadow-lg mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold mb-2">
              <Sparkles size={12} />
              Submitted Successfully
            </div>

            <h2
              id="success-modal-title"
              className="text-2xl font-black text-white"
            >
              Report Submitted
            </h2>

            <p className="text-emerald-50 text-sm mt-1">
              Sent for Unit Officer review
            </p>

            {(issueCode || issueTitle) && (
              <div className="mt-3 bg-white/15 border border-white/20 rounded-2xl px-3 py-2 text-left">
                {issueCode && (
                  <p className="text-[11px] text-emerald-50 font-semibold">
                    Tracking ID:{" "}
                    <span className="font-black text-white">{issueCode}</span>
                  </p>
                )}
                {issueTitle && (
                  <p className="text-xs text-white/90 font-semibold truncate mt-0.5">
                    {issueTitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-2xl p-4 border border-amber-200 dark:border-amber-700/60 bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-955 dark:to-emerald-955">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Award size={21} />
              </div>

              <div className="flex-1">
                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                  +{pointsEarned} CityPoints Earned
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-405 mt-0.5 font-semibold">
                  {hasVideoEvidence
                    ? "Includes +5 bonus for video evidence."
                    : "Initial reward for submitting a civic report."}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="rounded-xl bg-white/80 dark:bg-zinc-900/70 border border-emerald-100 dark:border-emerald-900 px-3 py-2">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Issue Submitted
                    </p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      +5
                    </p>
                  </div>

                  {hasVideoEvidence ? (
                    <div className="rounded-xl bg-white/80 dark:bg-zinc-900/70 border border-cyan-100 dark:border-cyan-900 px-3 py-2">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Video Evidence
                      </p>
                      <p className="text-sm font-black text-cyan-600 dark:text-cyan-400">
                        +5
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white/60 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 px-3 py-2">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Future Rewards
                      </p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                        Conditional
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-405 mt-2 leading-relaxed font-bold">
                  More points may be awarded after verification, resolution,
                  closure, streaks, or badges.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              What happens next?
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400">
                        {index + 1}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug font-semibold">
                      {step.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100/60 dark:border-blue-900/60 px-3 py-2.5">
            <Info
              size={16}
              className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed font-semibold">
              Similar reports may be reviewed as possible duplicates, but you
              can track updates from your dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={onViewDashboard || onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 text-white font-extrabold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-xs"
            >
              View Dashboard
            </button>

            <button
              onClick={onReportAnother || onClose}
              className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border border-slate-205 dark:border-zinc-800 font-extrabold hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all cursor-pointer text-xs"
            >
              Report Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
