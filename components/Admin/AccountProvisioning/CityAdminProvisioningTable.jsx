import { useState } from "react";
import { Search, Building2, KeyRound, Ban, CheckCircle2 } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ProvisioningStatusBadge } from "./ProvisioningStatusBadge";
import { COMMON_CITIES } from "../../../lib/accountProvisioning/provisioningConstants";
import { generateTemporaryPassword } from "../../../lib/accountProvisioning/generateTemporaryPassword";

export function CityAdminProvisioningTable({ cityAdmins = [], onRefresh }) {
  const resendCredentialsAction = useAction(
    api.accountProvisioningActions.resendProvisioningCredentials,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [resendingUserId, setResendingUserId] = useState(null);
  const [resentPasswordModal, setResentPasswordModal] = useState(null);

  const filteredAdmins = cityAdmins.filter((ca) => {
    const matchesSearch =
      ca.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ca.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ca.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity =
      cityFilter === "all" ||
      ca.city.toLowerCase() === cityFilter.toLowerCase();

    return matchesSearch && matchesCity;
  });

  // Incomplete Function - TODO
  // const handleResendCredentials = async (ca) => {
  //   setResendingUserId(ca.userId);
  //   const newPassword = generateTemporaryPassword(12);

  //   try {
  //     await resendCredentialsAction({
  //       userId: ca.userId,
  //       newRawPassword: newPassword,
  //     });

  //     setResentPasswordModal({
  //       fullName: ca.fullName,
  //       email: ca.email,
  //       newPassword,
  //     });
  //     toast.success("New temporary credentials generated!");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to resend credentials");
  //   } finally {
  //     setResendingUserId(null);
  //   }
  // };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 size={18} className="text-purple-500" />
            Provisioned City Admins Directory ({filteredAdmins.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Municipal Administrators managing city-wide officer teams
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, city..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Cities</option>
            {COMMON_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">Admin Info</th>
              <th className="p-3.5">City / State</th>
              <th className="p-3.5">Managed Officers</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
            {filteredAdmins.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-slate-400 font-bold"
                >
                  No provisioned City Admins found matching criteria
                </td>
              </tr>
            ) : (
              filteredAdmins.map((ca) => (
                <tr
                  key={ca._id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-white text-xs">
                      {ca.fullName}
                    </p>
                    <p className="font-mono text-slate-500 text-[11px]">
                      {ca.email}
                    </p>
                    <p className="text-slate-400 text-[10px]">{ca.phone}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-purple-600 dark:text-purple-400">
                      {ca.city}
                    </p>
                    <p className="text-slate-400 text-[10px]">{ca.state}</p>
                  </td>
                  <td className="p-3.5 text-[11px]">
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">
                      UOs: {ca.managedUnitOfficers?.length || 0} | FOs:{" "}
                      {ca.managedFieldOfficers?.length || 0}
                    </p>
                  </td>
                  <td className="p-3.5">
                    <ProvisioningStatusBadge
                      mustChangePassword={ca.mustChangePassword}
                      approved={true}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resent Password Modal */}
      {resentPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
              <KeyRound size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Credentials Resent
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                New temporary password generated for{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {resentPasswordModal.fullName}
                </span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl font-mono text-sm font-black text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-700">
              {resentPasswordModal.newPassword}
            </div>

            <button
              onClick={() => setResentPasswordModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
