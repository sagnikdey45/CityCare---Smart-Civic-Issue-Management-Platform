"use client";

import React, { useState } from "react";
import {
  Clock,
  Eye,
  FileText,
  Laptop,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Shield,
  Tag,
  MapPin,
  Building,
} from "lucide-react";
import { formatAuditDate, formatRoleLabel, formatDepartmentLabel, sanitizeAuditValue } from "./AuditFormatters";

export default function AuditTable({
  logs = [],
  pagination = {},
  onPageChange,
  onSelectLog,
  isSystemAdmin = false,
}) {
  const roleBadges = {
    citizen: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    unit_officer: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    field_officer: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    city_admin: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    admin: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    system: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  const renderCompactDiff = (oldVal, newVal) => {
    const sOld = sanitizeAuditValue(oldVal);
    const sNew = sanitizeAuditValue(newVal);

    if (sOld === null && sNew === null) return <span className="text-slate-400">—</span>;

    if (typeof sOld !== "object" && typeof sNew !== "object") {
      return (
        <span className="truncate max-w-[180px] inline-block font-mono text-[11px]">
          {sOld !== null && <span className="text-red-500 line-through mr-1">{String(sOld)}</span>}
          {sNew !== null && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{String(sNew)}</span>}
        </span>
      );
    }

    return <span className="text-slate-500 dark:text-slate-400 italic">Structured change</span>;
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800 my-4">
        <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No Audit Activity Recorded
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No accountability records match the current view or selected filter parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              {isSystemAdmin && <th className="py-3 px-4">City</th>}
              <th className="py-3 px-4">Issue / Entity</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Change Summary</th>
              <th className="py-3 px-4 text-center">Source</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Timestamp */}
                <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{formatAuditDate(log.timestamp)}</span>
                  </div>
                </td>

                {/* Actor & Role */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {log.performer?.name || "System"}
                    </div>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold border mt-0.5 ${
                        roleBadges[log.performer?.role?.toLowerCase()] || roleBadges.system
                      }`}
                    >
                      {formatRoleLabel(log.performer?.role)}
                    </span>
                  </div>
                </td>

                {/* Action */}
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {log.actionFormatted || log.action}
                  </div>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {log.actionCategory || "General"}
                  </span>
                </td>

                {/* City (System Admin only) */}
                {isSystemAdmin && (
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                    {log.city || "Global"}
                  </td>
                )}

                {/* Issue / Entity */}
                <td className="py-3 px-4">
                  {log.issueCode ? (
                    <div>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                        {log.issueCode}
                      </span>
                      {log.issueTitle && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                          {log.issueTitle}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 font-mono text-[11px]">
                      {log.affectedEntityType || "system"}
                    </span>
                  )}
                </td>

                {/* Department */}
                <td className="py-3 px-4 whitespace-nowrap font-medium">
                  {formatDepartmentLabel(log.department)}
                </td>

                {/* Change Summary */}
                <td className="py-3 px-4">
                  {renderCompactDiff(log.oldValue, log.newValue)}
                </td>

                {/* Source */}
                <td className="py-3 px-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      log.source?.toLowerCase() === "mobile"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : log.source?.toLowerCase() === "system"
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    {log.source ? log.source.toUpperCase() : "WEB"}
                  </span>
                </td>

                {/* Details Button */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => onSelectLog(log)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of{" "}
            {pagination.totalItems} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
