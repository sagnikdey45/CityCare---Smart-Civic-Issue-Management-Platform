import { useState } from "react";
import { X, UserPlus, Shield, Zap, KeyRound, Loader2, Check } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  CANONICAL_DEPARTMENTS,
  INDIAN_STATES,
  COMMON_CITIES,
} from "../../../lib/accountProvisioning/provisioningConstants";
import { generateTemporaryPassword } from "../../../lib/accountProvisioning/generateTemporaryPassword";

export function AddOfficerDialog({ isOpen, onClose, referenceData, onSuccess }) {
  const createOfficerAction = useAction(
    api.accountProvisioningActions.createPreProvisionedOfficer
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    state: "Uttar Pradesh",
    city: "Varanasi",
    district: "Varanasi",
    department: "road",
    role: "unit_officer",
    specialisationsStr: "",
    reportingUnitOfficerId: "",
    maxIssueCapacity: 10,
    rawPassword: generateTemporaryPassword(12),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCredential, setCreatedCredential] = useState(null);

  if (!isOpen) return null;

  // Filter UOs matching selected city & department for FO mapping
  const availableUOs = (referenceData?.unitOfficersList || []).filter(
    (uo) =>
      uo.city.toLowerCase().trim() === formData.city.toLowerCase().trim() &&
      uo.department.toLowerCase().trim() === formData.department.toLowerCase().trim()
  );

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleRegeneratePassword = () => {
    setFormData((prev) => ({
      ...prev,
      rawPassword: generateTemporaryPassword(12),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error("Full Name and Email are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const specialisations = formData.specialisationsStr
        ? formData.specialisationsStr
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const res = await createOfficerAction({
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim() || "9876543210",
        dob: formData.dob || undefined,
        state: formData.state,
        city: formData.city,
        district: formData.district || formData.city,
        department: formData.department,
        role: formData.role,
        specialisations: formData.role === "field_officer" ? specialisations : undefined,
        reportingUnitOfficerId:
          formData.role === "field_officer" && formData.reportingUnitOfficerId
            ? formData.reportingUnitOfficerId
            : undefined,
        maxIssueCapacity:
          formData.role === "field_officer"
            ? Number(formData.maxIssueCapacity) || 10
            : undefined,
        rawPassword: formData.rawPassword,
      });

      setCreatedCredential({
        name: formData.fullName,
        email: formData.email,
        role: formData.role,
        tempPassword: formData.rawPassword,
      });

      toast.success("Officer account pre-provisioned successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to provision officer account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl border border-white/30">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Add Officer Account</h2>
              <p className="text-xs font-semibold text-emerald-100/90">
                Pre-provision Unit Officer or Field Officer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {createdCredential ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <Check size={24} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Account Created Successfully!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Share these credentials securely with the officer. Password change will be enforced on first login.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-200/80 dark:border-emerald-800/80 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Full Name:</span>
                  <span className="font-black text-slate-900 dark:text-white">{createdCredential.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Email:</span>
                  <span className="font-black text-slate-900 dark:text-white">{createdCredential.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-500">Role:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase">
                    {createdCredential.role.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-500">Temporary Password:</span>
                  <code className="font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg font-bold text-slate-900 dark:text-emerald-400 text-sm">
                    {createdCredential.tempPassword}
                  </code>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors shadow-md text-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-500 mb-2">
                  Officer Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange("role", "unit_officer")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-extrabold text-xs transition-all border ${
                      formData.role === "unit_officer"
                        ? "bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Shield size={16} /> Unit Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("role", "field_officer")}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-extrabold text-xs transition-all border ${
                      formData.role === "field_officer"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Zap size={16} /> Field Officer
                  </button>
                </div>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="e.g. Amit Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="e.g. amit@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Phone & DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* State & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {COMMON_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CANONICAL_DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Officer specific fields */}
              {formData.role === "field_officer" && (
                <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
                  <div>
                    <label className="block text-xs font-extrabold text-emerald-800 dark:text-emerald-300 mb-1">
                      Reporting Unit Officer (Optional)
                    </label>
                    <select
                      value={formData.reportingUnitOfficerId}
                      onChange={(e) => handleChange("reportingUnitOfficerId", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Auto-assign or Unassigned</option>
                      {availableUOs.map((uo) => (
                        <option key={uo.id} value={uo.id}>
                          {uo.fullName} ({uo.city} - {uo.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold text-emerald-800 dark:text-emerald-300 mb-1">
                        Specialisations (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={formData.specialisationsStr}
                        onChange={(e) => handleChange("specialisationsStr", e.target.value)}
                        placeholder="e.g. Asphalt, Paving, Drainage"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-emerald-800 dark:text-emerald-300 mb-1">
                        Max Issue Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData.maxIssueCapacity}
                        onChange={(e) => handleChange("maxIssueCapacity", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Temporary Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400">
                    Generated Temporary Password
                  </label>
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <KeyRound size={12} /> Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={formData.rawPassword}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 font-mono text-sm font-black text-emerald-600 dark:text-emerald-400"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-extrabold text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Provisioning...
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} /> Provision Officer Account
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
