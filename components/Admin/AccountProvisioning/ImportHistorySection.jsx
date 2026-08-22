import { FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, Calendar, User } from "lucide-react";

export function ImportHistorySection({ history = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
          <FileSpreadsheet size={22} />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            CSV Bulk Provisioning Import History
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Log of all historical CSV bulk account onboarding operations
          </p>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">File Name / Type</th>
              <th className="p-3.5">Uploaded By</th>
              <th className="p-3.5">Date & Time</th>
              <th className="p-3.5">Row Summary</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                  No CSV import history recorded yet
                </td>
              </tr>
            ) : (
              history.map((h) => (
                <tr key={h._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-white">{h.fileName}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {h.importType === "officers" ? "Officers" : "City Admins"}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {h.uploadedByName}
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {new Date(h.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Total: {h.totalRows}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Created: {h.createdRows}
                      </span>
                      {h.skippedRows > 0 && (
                        <span className="text-amber-600 font-bold">
                          Skipped: {h.skippedRows}
                        </span>
                      )}
                      {h.failedRows > 0 && (
                        <span className="text-rose-600 font-bold">
                          Failed: {h.failedRows}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    {h.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        <CheckCircle2 size={11} /> Completed
                      </span>
                    ) : h.status === "partially_completed" ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        <AlertTriangle size={11} /> Partial
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        <XCircle size={11} /> Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
