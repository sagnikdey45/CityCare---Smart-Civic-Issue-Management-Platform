"use client";

import React from "react";
import CityAdminSLAMonitoringDashboard from "./CityAdminSLAMonitoringDashboard";

export default function CityAdminSLAMonitor({ cityAdminUserId, onViewIssue }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800/80 overflow-hidden">
      <div className="p-6">
        <CityAdminSLAMonitoringDashboard
          cityAdminUserId={cityAdminUserId}
          onViewIssue={onViewIssue}
        />
      </div>
    </div>
  );
}
