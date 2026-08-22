import { CheckCircle2, AlertTriangle, XCircle, FileSpreadsheet, X } from "lucide-react";

export function BulkImportResultDialog({ isOpen, result, onClose }) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 rounded-2xl">
              <FileSpreadsheet size={22} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black">Bulk Provisioning Results</h2>
              <p className="text-xs font-semibold text-slate-400">
                Summary of accounts processed from CSV upload
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Rows</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{result.totalRows}</h4>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-center">
              <p className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Created</p>
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{result.createdRows}</h4>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-center">
              <p className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400">Skipped</p>
              <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{result.skippedRows}</h4>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 dark:border-rose-800/60 text-center">
              <p className="text-[10px] font-extrabold uppercase text-rose-600 dark:text-rose-400">Failed</p>
              <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{result.failedRows}</h4>
            </div>
          </div>

          {/* Row Details Table */}
          {result.rowResults && result.rowResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Detailed Row Breakdown
              </h4>
              <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Temp Password / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                    {result.rowResults.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-slate-400">{r.rowNumber}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{r.fullName}</td>
                        <td className="p-3">{r.email}</td>
                        <td className="p-3">
                          {r.status === "created" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[10px]">
                              <CheckCircle2 size={10} /> Created
                            </span>
                          ) : r.status === "skipped" ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full text-[10px]">
                              <AlertTriangle size={10} /> Skipped
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full text-[10px]">
                              <XCircle size={10} /> Failed
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          {r.tempPassword ? (
                            <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-emerald-600 dark:text-emerald-400">
                              {r.tempPassword}
                            </code>
                          ) : (
                            <span className="text-rose-500 font-normal">{r.reason}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
}
