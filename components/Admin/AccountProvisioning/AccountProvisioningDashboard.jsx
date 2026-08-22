import { useState } from "react";
import {
  Users,
  Shield,
  Building2,
  FileSpreadsheet,
  RefreshCw,
  UserPlus,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProvisioningStats } from "./ProvisioningStats";
import { OfficerProvisioningSection } from "./OfficerProvisioningSection";
import { OfficerProvisioningTable } from "./OfficerProvisioningTable";
import { CityAdminProvisioningSection } from "./CityAdminProvisioningSection";
import { ImportHistorySection } from "./ImportHistorySection";

export default function AccountProvisioningDashboard({ adminUserId }) {
  const [subTab, setSubTab] = useState("overview"); // "overview" | "officers" | "city_admins" | "imports"

  // Backend queries
  const overview = useQuery(api.accountProvisioning.getProvisioningOverview);
  const officersData = useQuery(api.accountProvisioning.getProvisionedOfficers);
  const cityAdminsData = useQuery(
    api.accountProvisioning.getProvisionedCityAdmins
  );
  const referenceData = useQuery(
    api.accountProvisioning.getProvisioningReferenceData
  );
  const importHistory = useQuery(
    api.accountProvisioning.getProvisioningImportHistory
  );

  const isLoading =
    overview === undefined ||
    officersData === undefined ||
    cityAdminsData === undefined ||
    referenceData === undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
              <Sparkles size={13} /> Account Pre-Provisioning Module
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Pre-Provisioned Account Management & Onboarding
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Batch import officers and city admins via CSV or manual pre-provisioning. Enforce mandatory first-login password updates, link Field Officers to Unit Officers, and manage account statuses seamlessly.
            </p>
          </div>

          {/* Quick Sub-tab Switcher Pills */}
          <div className="flex flex-wrap sm:flex-nowrap items-center bg-slate-800/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shrink-0">
            <button
              onClick={() => setSubTab("overview")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                subTab === "overview"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Users size={15} /> Overview
            </button>
            <button
              onClick={() => setSubTab("officers")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                subTab === "officers"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Shield size={15} /> Officers ({overview?.unitOfficersCount + overview?.fieldOfficersCount || 0})
            </button>
            <button
              onClick={() => setSubTab("city_admins")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                subTab === "city_admins"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Building2 size={15} /> City Admins ({overview?.cityAdminsCount || 0})
            </button>
            <button
              onClick={() => setSubTab("imports")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                subTab === "imports"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <FileSpreadsheet size={15} /> Import History
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <ProvisioningStats overview={overview} />

      {/* Main Tab Content */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <RefreshCw size={32} className="mx-auto text-emerald-500 animate-spin" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Loading provisioned accounts data...
          </p>
        </div>
      ) : (
        <>
          {subTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setSubTab("officers")}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                      <Shield size={24} />
                    </div>
                    <span className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-800">
                      Manage Officers
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-4">
                    Unit & Field Officers Directory
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                    Batch onboard department ward leads and field officers via CSV or single creation with automatic UO ↔ FO relationship mapping.
                  </p>
                </div>

                <div
                  onClick={() => setSubTab("city_admins")}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      <Building2 size={24} />
                    </div>
                    <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                      Manage City Admins
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-4">
                    Municipal City Admins Directory
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                    Pre-provision municipal administrators per city with temporary credential generation and first-login security rules.
                  </p>
                </div>
              </div>

              {/* Combined Recent Officers Table preview */}
              <OfficerProvisioningTable officers={officersData?.allOfficers || []} />
            </div>
          )}

          {subTab === "officers" && (
            <OfficerProvisioningSection
              officersData={officersData}
              referenceData={referenceData}
              adminUserId={adminUserId}
            />
          )}

          {subTab === "city_admins" && (
            <CityAdminProvisioningSection
              cityAdminsData={cityAdminsData}
              referenceData={referenceData}
              adminUserId={adminUserId}
            />
          )}

          {subTab === "imports" && (
            <ImportHistorySection history={importHistory || []} />
          )}
        </>
      )}
    </div>
  );
}
