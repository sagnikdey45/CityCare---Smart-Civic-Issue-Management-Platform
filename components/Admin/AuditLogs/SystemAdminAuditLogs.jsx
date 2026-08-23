"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Shield, Download, Loader2, Globe, Activity } from "lucide-react";
import AuditSummaryCards from "../../audit/AuditSummaryCards";
import AuditFilters from "../../audit/AuditFilters";
import AuditTable from "../../audit/AuditTable";
import AuditDetailsModal from "../../audit/AuditDetailsModal";
import { exportAuditLogsToCSV } from "../../audit/AuditFormatters";

export default function SystemAdminAuditLogs({ adminUserId }) {
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    city: "all",
    category: "all",
    department: "all",
    source: "all",
    dateRange: "all",
    page: 1,
    pageSize: 25,
  });

  const [selectedLog, setSelectedLog] = useState(null);

  // Query global universal audit logs
  const auditData = useQuery(
    api.auditLogs.getSystemAdminAuditLogs,
    adminUserId
      ? {
          adminUserId,
          search: filters.search,
          role: filters.role,
          city: filters.city,
          category: filters.category,
          department: filters.department,
          source: filters.source,
          dateRange: filters.dateRange,
          page: filters.page,
          pageSize: filters.pageSize,
        }
      : "skip"
  );

  const isLoading = auditData === undefined;
  const logs = auditData?.logs || [];
  const summary = auditData?.summary || {};
  const filterOptions = auditData?.filterOptions || {};
  const pagination = auditData?.pagination || {};

  const handleResetFilters = () => {
    setFilters({
      search: "",
      role: "all",
      city: "all",
      category: "all",
      department: "all",
      source: "all",
      dateRange: "all",
      page: 1,
      pageSize: 25,
    });
  };

  const handleExportCSV = () => {
    if (!logs.length) return;
    const filename = `CityCare_Platform_Global_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    exportAuditLogsToCSV(logs, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 text-white shadow-md shadow-rose-500/20">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Platform Audit Trail & Global Governance
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive platform accountability history across all cities, officers, and citizens
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!logs.length || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Loading platform audit records...
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <AuditSummaryCards summary={summary} isSystemAdmin={true} />

          {/* Filters */}
          <AuditFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            filterOptions={filterOptions}
            isSystemAdmin={true}
          />

          {/* Audit Table */}
          <AuditTable
            logs={logs}
            pagination={pagination}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onSelectLog={setSelectedLog}
            isSystemAdmin={true}
          />
        </>
      )}

      {/* Details Modal */}
      {selectedLog && (
        <AuditDetailsModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
