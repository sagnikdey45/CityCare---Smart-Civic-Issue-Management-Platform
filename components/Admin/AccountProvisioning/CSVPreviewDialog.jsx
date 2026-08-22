import { useState } from "react";
import {
  X,
  FileCheck2,
  AlertTriangle,
  XCircle,
  Edit3,
  Trash2,
  UserPlus,
  Loader2,
  Filter,
} from "lucide-react";
import { EditOfficerDialog } from "./EditOfficerDialog";
import { EditCityAdminDialog } from "./EditCityAdminDialog";

export function CSVPreviewDialog({
  isOpen,
  type, // "officers" or "city_admins"
  fileName,
  validationResult,
  onClose,
  onUpdateRow,
  onRemoveRow,
  onClearAll,
  onConfirmProvision,
  isProvisioning,
}) {
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "valid" | "warning" | "invalid"
  const [editingRow, setEditingRow] = useState(null);

  if (!isOpen || !validationResult) return null;

  const allRows = [
    ...(validationResult.validRows || []),
    ...(validationResult.invalidRows || []),
  ].sort((a, b) => a.rowNumber - b.rowNumber);

  const filteredRows = allRows.filter((r) => {
    if (activeFilter === "valid") return r.validationStatus === "valid";
    if (activeFilter === "warning") return r.validationStatus === "warning";
    if (activeFilter === "invalid") return r.validationStatus === "invalid";
    return true;
  });

  const { stats } = validationResult;
  const canProvision = stats.valid > 0 && !isProvisioning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 rounded-2xl">
              <FileCheck2 size={22} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                Review & Validate {type === "officers" ? "Officers" : "City Admins"} CSV
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                File: <span className="text-slate-200 font-bold">{fileName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter bar & Summary Cards */}
        <div className="p-6 pb-3 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveFilter("all")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              <p className="text-[10px] font-extrabold uppercase opacity-80">Total Rows</p>
              <h4 className="text-xl font-black mt-0.5">{stats.total}</h4>
            </button>

            <button
              onClick={() => setActiveFilter("valid")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === "valid"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              <p className="text-[10px] font-extrabold uppercase opacity-80">Ready to Import</p>
              <h4 className="text-xl font-black mt-0.5">{stats.valid}</h4>
            </button>

            <button
              onClick={() => setActiveFilter("warning")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === "warning"
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300"
              }`}
            >
              <p className="text-[10px] font-extrabold uppercase opacity-80">Warnings</p>
              <h4 className="text-xl font-black mt-0.5">{stats.warnings}</h4>
            </button>

            <button
              onClick={() => setActiveFilter("invalid")}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeFilter === "invalid"
                  ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                  : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300"
              }`}
            >
              <p className="text-[10px] font-extrabold uppercase opacity-80">Errors</p>
              <h4 className="text-xl font-black mt-0.5">{stats.invalid}</h4>
            </button>
          </div>
        </div>

        {/* Staging Rows Table */}
        <div className="flex-1 overflow-y-auto p-6 pt-3">
          {filteredRows.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Filter size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold">No rows matching filter "{activeFilter}"</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    {type === "officers" && <th className="p-3">Role</th>}
                    {type === "officers" && <th className="p-3">Department</th>}
                    <th className="p-3">City</th>
                    <th className="p-3">Status / Validation Notes</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  {filteredRows.map((row) => (
                    <tr
                      key={row.clientRowId}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        row.validationStatus === "invalid"
                          ? "bg-rose-50/40 dark:bg-rose-950/20"
                          : row.validationStatus === "warning"
                          ? "bg-amber-50/40 dark:bg-amber-950/20"
                          : ""
                      }`}
                    >
                      <td className="p-3 font-mono text-slate-400 font-bold">{row.rowNumber}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{row.fullName}</td>
                      <td className="p-3 font-mono">{row.email}</td>
                      {type === "officers" && (
                        <td className="p-3 capitalize font-bold">
                          {row.role?.replace("_", " ")}
                        </td>
                      )}
                      {type === "officers" && (
                        <td className="p-3 capitalize">{row.department}</td>
                      )}
                      <td className="p-3">{row.city}</td>
                      <td className="p-3">
                        {row.validationStatus === "valid" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full text-[10px]">
                            <FileCheck2 size={11} /> Valid
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {row.errors.map((err, i) => (
                              <p key={i} className="text-rose-600 dark:text-rose-400 text-[11px] font-bold flex items-center gap-1">
                                <XCircle size={11} className="shrink-0" /> {err}
                              </p>
                            ))}
                            {row.warnings.map((warn, i) => (
                              <p key={i} className="text-amber-600 dark:text-amber-400 text-[11px] font-bold flex items-center gap-1">
                                <AlertTriangle size={11} className="shrink-0" /> {warn}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => setEditingRow(row)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                          title="Edit Row"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => onRemoveRow(row.clientRowId)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                          title="Remove Row"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClearAll}
            className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-extrabold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            Clear Staging
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-extrabold text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Back
            </button>
            <button
              onClick={onConfirmProvision}
              disabled={!canProvision}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isProvisioning ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Provisioning Accounts...
                </>
              ) : (
                <>
                  <UserPlus size={15} /> Provision {stats.valid} Accounts
                </>
              )}
            </button>
          </div>
        </div>

        {/* Edit Modals */}
        {editingRow && type === "officers" && (
          <EditOfficerDialog
            isOpen={true}
            rowData={editingRow}
            onClose={() => setEditingRow(null)}
            onSave={(updated) => {
              onUpdateRow(updated);
              setEditingRow(null);
            }}
          />
        )}

        {editingRow && type === "city_admins" && (
          <EditCityAdminDialog
            isOpen={true}
            rowData={editingRow}
            onClose={() => setEditingRow(null)}
            onSave={(updated) => {
              onUpdateRow(updated);
              setEditingRow(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
