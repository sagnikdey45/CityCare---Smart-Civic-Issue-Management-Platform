import React, { useState, useEffect } from "react";
import {
  X,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";

export default function ManualPointAdjustmentModal({
  citizen,
  onClose,
  onSubmitAdjustment,
}) {
  const [mode, setMode] = useState("add"); // "add" | "reduce"
  const [amountStr, setAmountStr] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isSubmitting]);

  if (!citizen) return null;

  const currentPoints = Number(citizen.points ?? 0);
  const amount = Math.abs(parseInt(amountStr, 10) || 0);

  const signedAdjustment = mode === "add" ? amount : -amount;
  const newPoints = currentPoints + signedAdjustment;

  const isReasonValid = reason.trim().length >= 5;
  const isAmountValid = amount > 0 && amount <= 5000;
  const isBalanceValid = newPoints >= 0;

  const canSubmit = isAmountValid && isReasonValid && isBalanceValid && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg("");
    try {
      setIsSubmitting(true);
      await onSubmitAdjustment({
        citizenId: citizen.citizenId,
        adjustment: signedAdjustment,
        reason: reason.trim(),
      });
      onClose();
    } catch (err) {
      console.error("Failed to adjust citizen points:", err);
      setErrorMsg(err.message || "Failed to adjust points. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Adjust Citizen Points
              </h3>
              <p className="text-xs font-bold text-slate-500">
                {citizen.displayName} • Current: {currentPoints.toLocaleString("en-IN")} pts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
          
          {/* Mode Selector (Add / Reduce) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("add")}
              disabled={isSubmitting}
              className={`p-3.5 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === "add"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <PlusCircle size={16} />
              <span>Add Points</span>
            </button>

            <button
              type="button"
              onClick={() => setMode("reduce")}
              disabled={isSubmitting}
              className={`p-3.5 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === "reduce"
                  ? "border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <MinusCircle size={16} />
              <span>Reduce Points</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Points Amount *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="5000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter points (e.g. 50)..."
                className="w-full px-4 py-3 text-sm font-bold border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                pts
              </span>
            </div>
            {mode === "reduce" && amount > currentPoints && (
              <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                <AlertTriangle size={12} />
                <span>Maximum removable points: {currentPoints.toLocaleString("en-IN")}</span>
              </p>
            )}
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Reason for Adjustment (Mandatory) *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              placeholder="Explain why this citizen's points are being manually adjusted (at least 5 characters)..."
              className="w-full px-4 py-3 text-xs font-medium border border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
              <span>Audited in citizen ledger</span>
              <span>{reason.trim().length} / 5 min chars</span>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Adjustment Preview
            </span>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">Current Balance:</span>
              <span className="text-slate-900 dark:text-white">{currentPoints.toLocaleString("en-IN")} pts</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">Adjustment:</span>
              <span className={mode === "add" ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-rose-600 dark:text-rose-400 font-black"}>
                {signedAdjustment >= 0 ? `+${signedAdjustment}` : signedAdjustment} pts
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm font-black">
              <span className="text-slate-900 dark:text-white">New Balance:</span>
              <span className={newPoints >= 0 ? "text-slate-900 dark:text-white" : "text-rose-600"}>
                {newPoints.toLocaleString("en-IN")} pts
              </span>
            </div>
          </div>

          {/* Warning / Info Banner */}
          {mode === "reduce" ? (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-2 text-xs font-bold text-rose-800 dark:text-rose-200">
              <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <span>
                Point Reduction: This action will reduce the citizen's current reward balance. The adjustment will be permanently recorded in the audit ledger.
              </span>
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-2 text-xs font-bold text-blue-800 dark:text-blue-200">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <span>
                Manual Reward: This addition will be recorded separately from automatically earned civic activity points.
              </span>
            </div>
          )}

          {/* Large Adjustment Warning Safeguard */}
          {amount > 500 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span>Large Point Adjustment ({amount} pts). Please double-check reason before confirming.</span>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs font-bold text-rose-600 p-3 bg-rose-50 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-6 py-2.5 text-xs font-black text-white rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                mode === "add"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Applying...</span>
                </>
              ) : (
                <span>
                  {mode === "add" ? `Add ${amount || 0} Points` : `Reduce ${amount || 0} Points`}
                </span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
