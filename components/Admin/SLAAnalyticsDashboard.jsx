import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  Activity,
  Award,
  Target,
} from "lucide-react";
import { calculateSLAStatus } from "@/lib/slaConfig";

export default function SLAAnalyticsDashboard() {
  const [issues, setIssues] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setLoading(false);
  };

  const calculateMetrics = () => {
    const activeIssues = issues.filter((i) => i.status !== "resolved");
    const resolvedIssues = issues.filter((i) => i.status === "resolved");

    const breaches = activeIssues.filter(
      (i) => calculateSLAStatus(i.sla_deadline).status === "breached",
    );
    const atRisk = activeIssues.filter(
      (i) => calculateSLAStatus(i.sla_deadline).status === "at_risk",
    );

    const avgDelayTime =
      breaches.reduce((acc, issue) => {
        const status = calculateSLAStatus(issue.sla_deadline);
        return acc + status.hoursRemaining;
      }, 0) / (breaches.length || 1);

    const categoryBreaches = {};
    breaches.forEach((issue) => {
      categoryBreaches[issue.category] =
        (categoryBreaches[issue.category] || 0) + 1;
    });

    const officerDelays = {};
    activeIssues.forEach((issue) => {
      if (issue.assigned_to) {
        const officer = officers.find((o) => o.id === issue.assigned_to);
        if (officer) {
          const key = issue.assigned_to;
          if (!officerDelays[key]) {
            officerDelays[key] = {
              name: officer.full_name,
              delays: 0,
              total: 0,
            };
          }
          officerDelays[key].total++;
          if (calculateSLAStatus(issue.sla_deadline).status === "breached") {
            officerDelays[key].delays++;
          }
        }
      }
    });

    const topDelayedOfficers = Object.values(officerDelays)
      .sort((a, b) => b.delays - a.delays)
      .slice(0, 5);

    const escalatedIssues = issues.filter((i) => i.is_escalated);
    const avgEscalationCount =
      escalatedIssues.reduce((acc, i) => acc + (i.escalation_count || 0), 0) /
      (escalatedIssues.length || 1);

    return {
      totalBreaches: breaches.length,
      avgDelayTime: Math.abs(avgDelayTime),
      mostDelayedCategory:
        Object.entries(categoryBreaches).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "N/A",
      categoryBreaches,
      topDelayedOfficers,
      totalActive: activeIssues.length,
      totalResolved: resolvedIssues.length,
      atRiskCount: atRisk.length,
      escalatedCount: escalatedIssues.length,
      avgEscalationCount: avgEscalationCount.toFixed(1),
      slaComplianceRate: (
        ((activeIssues.length - breaches.length) / (activeIssues.length || 1)) *
        100
      ).toFixed(1),
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <BarChart3 size={28} className="text-blue-600 dark:text-blue-400" />
          SLA Analytics Dashboard
        </h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Comprehensive performance metrics and trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
              <AlertTriangle size={28} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-red-600 dark:text-red-400">
                {metrics.totalBreaches}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                TOTAL BREACHES
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Active SLA Violations
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Clock size={28} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-amber-600 dark:text-amber-400">
                {metrics.avgDelayTime.toFixed(0)}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                AVG HOURS
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Average Delay Time
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={28} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-purple-600 dark:text-purple-400">
                {metrics.escalatedCount}
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                ESCALATED
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Admin Interventions
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border-2 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Target size={28} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {metrics.slaComplianceRate}%
              </div>
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                COMPLIANCE
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            SLA Compliance Rate
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={24} className="text-blue-600 dark:text-blue-400" />
            SLA Breaches by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(metrics.categoryBreaches)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category, count]) => {
                const maxCount = Math.max(
                  ...Object.values(metrics.categoryBreaches),
                );
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {category}
                      </span>
                      <span className="text-sm font-black text-red-600 dark:text-red-400">
                        {count} breaches
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            {Object.keys(metrics.categoryBreaches).length === 0 && (
              <div className="text-center py-8">
                <Award
                  size={48}
                  className="mx-auto text-emerald-500 dark:text-emerald-400 mb-2"
                />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  No SLA breaches by category
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={24} className="text-amber-600 dark:text-amber-400" />
            Officers with Highest Delays
          </h3>
          <div className="space-y-4">
            {metrics.topDelayedOfficers.map((officer, index) => {
              const delayRate = (officer.delays / officer.total) * 100;

              return (
                <div
                  key={officer.name}
                  className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white ${
                        index === 0
                          ? "bg-red-600"
                          : index === 1
                            ? "bg-orange-600"
                            : "bg-amber-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {officer.name}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {officer.delays} delayed / {officer.total} total issues
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-red-600 dark:text-red-400">
                        {delayRate.toFixed(0)}%
                      </div>
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        DELAY RATE
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-500"
                      style={{ width: `${delayRate}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            {metrics.topDelayedOfficers.length === 0 && (
              <div className="text-center py-8">
                <Award
                  size={48}
                  className="mx-auto text-emerald-500 dark:text-emerald-400 mb-2"
                />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  No officer delays recorded
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-blue-600 dark:text-blue-400" />
            <h4 className="font-bold text-slate-900 dark:text-white">
              Active Issues
            </h4>
          </div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {metrics.totalActive}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Currently in progress
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle
              size={20}
              className="text-amber-600 dark:text-amber-400"
            />
            <h4 className="font-bold text-slate-900 dark:text-white">
              At Risk Issues
            </h4>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics.atRiskCount}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Approaching deadline
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp
              size={20}
              className="text-purple-600 dark:text-purple-400"
            />
            <h4 className="font-bold text-slate-900 dark:text-white">
              Avg Escalations
            </h4>
          </div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
            {metrics.avgEscalationCount}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Per escalated issue
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Most Delayed Category
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {metrics.mostDelayedCategory}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Total Resolved
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {metrics.totalResolved} issues completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
