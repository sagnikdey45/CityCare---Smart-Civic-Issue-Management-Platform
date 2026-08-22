import { CheckCircle2, Clock, XCircle, ShieldAlert } from "lucide-react";

export function ProvisioningStatusBadge({ status, mustChangePassword, approved }) {
  if (approved === false) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
        <XCircle size={13} className="text-rose-500" />
        Disabled
      </span>
    );
  }

  if (mustChangePassword) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
        <Clock size={13} className="text-amber-500 animate-pulse" />
        Pending First Login
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
      <CheckCircle2 size={13} className="text-emerald-500" />
      Active
    </span>
  );
}
