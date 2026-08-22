import {
  Users,
  Shield,
  Zap,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";

export function ProvisioningStats({ overview }) {
  const stats = [
    {
      label: "Total Accounts",
      value: overview?.totalProvisioned || 0,
      subtext: "Pre-provisioned across system",
      icon: Users,
      gradient: "from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-800/60",
      iconBg: "bg-blue-500 text-white",
    },
    {
      label: "Unit Officers",
      value: overview?.unitOfficersCount || 0,
      subtext: "Department ward leads",
      icon: Shield,
      gradient: "from-cyan-500/10 to-teal-500/10 border-cyan-200 dark:border-cyan-800/60",
      iconBg: "bg-cyan-500 text-white",
    },
    {
      label: "Field Officers",
      value: overview?.fieldOfficersCount || 0,
      subtext: "Ground resolution teams",
      icon: Zap,
      gradient: "from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800/60",
      iconBg: "bg-emerald-500 text-white",
    },
    {
      label: "City Admins",
      value: overview?.cityAdminsCount || 0,
      subtext: "Municipal administrators",
      icon: Building2,
      gradient: "from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800/60",
      iconBg: "bg-purple-500 text-white",
    },
    {
      label: "Pending First Login",
      value: overview?.pendingFirstLogin || 0,
      subtext: "Temporary credentials active",
      icon: Clock,
      gradient: "from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-800/60",
      iconBg: "bg-amber-500 text-white",
    },
    {
      label: "Active Accounts",
      value: overview?.activeAccounts || 0,
      subtext: "Approved & active officers",
      icon: CheckCircle2,
      gradient: "from-emerald-500/10 to-green-500/10 border-emerald-200 dark:border-emerald-800/60",
      iconBg: "bg-emerald-600 text-white",
    },
    {
      label: "Disabled Accounts",
      value: overview?.disabledAccounts || 0,
      subtext: "Access restricted",
      icon: XCircle,
      gradient: "from-rose-500/10 to-red-500/10 border-rose-200 dark:border-rose-800/60",
      iconBg: "bg-rose-500 text-white",
    },
    {
      label: "Bulk Imports",
      value: overview?.totalImportsCount || 0,
      subtext: "CSV onboarding operations",
      icon: FileSpreadsheet,
      gradient: "from-sky-500/10 to-blue-500/10 border-sky-200 dark:border-sky-800/60",
      iconBg: "bg-sky-500 text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 ${stat.gradient}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-2xl shadow-sm ${stat.iconBg}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-2 truncate">
              {stat.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
