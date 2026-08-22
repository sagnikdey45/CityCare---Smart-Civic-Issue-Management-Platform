import { useState } from "react";
import {
  Search,
  Filter,
  Shield,
  Zap,
  KeyRound,
  Ban,
  CheckCircle2,
  Mail,
  User,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ProvisioningStatusBadge } from "./ProvisioningStatusBadge";
import { CANONICAL_DEPARTMENTS } from "../../../lib/accountProvisioning/provisioningConstants";
import { generateTemporaryPassword } from "../../../lib/accountProvisioning/generateTemporaryPassword";

export function OfficerProvisioningTable({ officers = [], onRefresh }) {
  const toggleApprovalMutation = useMutation(
    api.accountProvisioning.toggleAccountApproval
  );
  const resendCredentialsAction = useAction(
    api.accountProvisioningActions.resendProvisioningCredentials
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resendingUserId, setResendingUserId] = useState(null);
  const [resentPasswordModal, setResentPasswordModal] = useState(null);

  const safeOfficers = Array.isArray(officers) ? officers : [];

  // Filter officers
  const filteredOfficers = safeOfficers.filter((officer) => {
    if (!officer) return false;

    const fullName = officer.fullName || "";
    const email = officer.email || "";
    const city = officer.city || "";
    const department = officer.department || "";

    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" || officer.role === roleFilter;

    const matchesDept =
      departmentFilter === "all" ||
      department.toLowerCase() === departmentFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "disabled" && officer.accountApproved === false) ||
      (statusFilter === "pending" && officer.mustChangePassword && officer.accountApproved !== false) ||
      (statusFilter === "active" && !officer.mustChangePassword && officer.accountApproved !== false);

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  const handleToggleStatus = async (officer) => {
    const nextState = !officer.accountApproved;
    try {
      await toggleApprovalMutation({
        userId: officer.userId,
        role: officer.role,
        approved: nextState,
      });
      toast.success(
        `Account for ${officer.fullName} ${nextState ? "activated" : "disabled"}`
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update account status");
    }
  };
  
  // Incomplete Function - TODO
  // const handleResendCredentials = async (officer) => {
  //   setResendingUserId(officer.userId);
  //   const newPassword = generateTemporaryPassword(12);

  //   try {
  //     await resendCredentialsAction({
  //       userId: officer.userId,
  //       newRawPassword: newPassword,
  //     });

  //     setResentPasswordModal({
  //       fullName: officer.fullName,
  //       email: officer.email,
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
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-emerald-500" />
            Provisioned Officers Directory ({filteredOfficers.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Active and pre-provisioned Unit & Field Officers across all departments
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, city..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="unit_officer">Unit Officers</option>
            <option value="field_officer">Field Officers</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {CANONICAL_DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending First Login</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-3.5">Officer Info</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">City / Location</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Reporting UO / Details</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
            {filteredOfficers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                  No provisioned officers found matching criteria
                </td>
              </tr>
            ) : (
              filteredOfficers.map((officer) => (
                <tr key={officer._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-white text-xs">{officer.fullName}</p>
                    <p className="font-mono text-slate-500 text-[11px]">{officer.email}</p>
                    <p className="text-slate-400 text-[10px]">{officer.phone}</p>
                  </td>
                  <td className="p-3.5">
                    {officer.role === "unit_officer" ? (
                      <span className="inline-flex items-center gap-1 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                        <Shield size={11} /> Unit Officer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                        <Zap size={11} /> Field Officer
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{officer.city}</p>
                    <p className="text-slate-400 text-[10px]">{officer.state}</p>
                  </td>
                  <td className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200">
                    {officer.department}
                  </td>
                  <td className="p-3.5 text-[11px]">
                    {officer.role === "field_officer" ? (
                      <div>
                        <p className="text-slate-600 dark:text-slate-300 font-semibold">
                          UO: {officer.reportingUnitOfficerName || "Unassigned"}
                        </p>
                        {officer.specialisations?.length > 0 && (
                          <p className="text-slate-400 text-[10px] truncate max-w-[150px]">
                            {officer.specialisations.join(", ")}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-[10px]">
                        Managed FOs: {officer.assignedFieldOfficers?.length || 0}
                      </p>
                    )}
                  </td>
                  <td className="p-3.5">
                    <ProvisioningStatusBadge
                      mustChangePassword={officer.mustChangePassword}
                      approved={officer.accountApproved}
                    />
                  </td>
                  <td className="p-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => handleToggleStatus(officer)}
                      className={`px-2.5 py-1.5 rounded-xl border font-extrabold text-[11px] transition-colors inline-flex items-center gap-1 ${
                        officer.accountApproved === false
                          ? "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          : "border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      }`}
                    >
                      {officer.accountApproved === false ? (
                        <>
                          <CheckCircle2 size={12} /> Enable
                        </>
                      ) : (
                        <>
                          <Ban size={12} /> Disable
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredOfficers.map((officer) => (
          <div
            key={officer._id}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {officer.fullName}
                </h4>
                <p className="font-mono text-slate-500 text-xs">{officer.email}</p>
              </div>
              <ProvisioningStatusBadge
                mustChangePassword={officer.mustChangePassword}
                approved={officer.accountApproved}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              {officer.role === "unit_officer" ? (
                <span className="bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  Unit Officer
                </span>
              ) : (
                <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  Field Officer
                </span>
              )}
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg uppercase">
                {officer.department}
              </span>
              <span className="text-slate-500">{officer.city}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <button
                onClick={() => handleResendCredentials(officer)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-300"
              >
                Resend Pass
              </button>
              <button
                onClick={() => handleToggleStatus(officer)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-extrabold ${
                  officer.accountApproved === false ? "text-emerald-600 border-emerald-300" : "text-rose-600 border-rose-300"
                }`}
              >
                {officer.accountApproved === false ? "Enable" : "Disable"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resent Password Modal */}
      {resentPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-sm w-full space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <KeyRound size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Credentials Resent</h3>
              <p className="text-xs text-slate-500 mt-1">
                New temporary password generated for <span className="font-bold text-slate-800 dark:text-slate-200">{resentPasswordModal.fullName}</span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl font-mono text-sm font-black text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
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
