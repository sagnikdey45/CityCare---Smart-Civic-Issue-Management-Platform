"use client";

import React from "react";
import { X, Shield, Clock, MapPin, Building, Tag, Laptop, Smartphone, FileText, User } from "lucide-react";
import { formatAuditDate, formatRoleLabel, formatDepartmentLabel, sanitizeAuditValue } from "./AuditFormatters";

export default function AuditDetailsModal({ log, onClose }) {
  if (!log) return null;

  const sanitizedOld = sanitizeAuditValue(log.oldValue);
  const sanitizedNew = sanitizeAuditValue(log.newValue);

  const roleBadges = {
    citizen: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300",
    unit_officer: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    field_officer: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    city_admin: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300",
    admin: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
    system: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  };

  const sourceBadges = {
    web: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    mobile: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    system: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {log.actionFormatted || log.action}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit Record ID: {log.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium block mb-1">
                Timestamp
              </span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatAuditDate(log.timestamp)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium block mb-1">
                Actor & Role
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {log.performer?.name || "System"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    roleBadges[log.performer?.role?.toLowerCase()] || roleBadges.system
                  }`}
                >
                  {formatRoleLabel(log.performer?.role)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium block mb-1">
                Source System
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                  sourceBadges[log.source?.toLowerCase()] || sourceBadges.system
                }`}
              >
                {log.source?.toLowerCase() === "mobile" ? (
                  <Smartphone className="w-3 h-3" />
                ) : (
                  <Laptop className="w-3 h-3" />
                )}
                {log.source ? log.source.toUpperCase() : "WEB"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium block mb-1">
                City / Location
              </span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {log.city || "Global Scope"}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium block mb-1">
                Department
              </span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {formatDepartmentLabel(log.department)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-slate-500 font-medium block mb-1">
                Action Category
              </span>
              <span className="inline-block px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium capitalize">
                {log.actionCategory || "General"}
              </span>
            </div>
          </div>

          {/* Linked Issue Details */}
          {(log.issueCode || log.issueTitle) && (
            <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Linked Issue Context
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-700 dark:text-blue-300 font-mono text-xs">
                  {log.issueCode || "N/A"}
                </span>
                {log.issueTitle && (
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    — {log.issueTitle}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description & Reason */}
          {(log.description || log.reason) && (
            <div className="space-y-3">
              {log.description && (
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                    Description
                  </span>
                  <p className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 leading-relaxed">
                    {log.description}
                  </p>
                </div>
              )}

              {log.reason && (
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block mb-1">
                    Action Reason / Notes
                  </span>
                  <p className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50 leading-relaxed italic">
                    "{log.reason}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Value Changes (Old vs New) */}
          {(sanitizedOld !== null || sanitizedNew !== null) && (
            <div className="space-y-2">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Structured State Changes
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Old Value */}
                <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block mb-1">
                    Previous Value (Before)
                  </span>
                  <div className="font-mono text-[11px] text-red-900 dark:text-red-200 overflow-x-auto">
                    {typeof sanitizedOld === "object" ? (
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(sanitizedOld, null, 2)}
                      </pre>
                    ) : (
                      <span>{String(sanitizedOld ?? "None / Unset")}</span>
                    )}
                  </div>
                </div>

                {/* New Value */}
                <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                    New Value (After)
                  </span>
                  <div className="font-mono text-[11px] text-emerald-900 dark:text-emerald-200 overflow-x-auto">
                    {typeof sanitizedNew === "object" ? (
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(sanitizedNew, null, 2)}
                      </pre>
                    ) : (
                      <span>{String(sanitizedNew ?? "None / Unset")}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
