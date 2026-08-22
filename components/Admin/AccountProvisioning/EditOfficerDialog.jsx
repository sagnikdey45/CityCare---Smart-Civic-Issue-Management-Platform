import { useState, useEffect } from "react";
import { X, Edit3, Shield, Zap } from "lucide-react";
import {
  CANONICAL_DEPARTMENTS,
  INDIAN_STATES,
  COMMON_CITIES,
} from "../../../lib/accountProvisioning/provisioningConstants";

export function EditOfficerDialog({ isOpen, rowData, onClose, onSave }) {
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
    specialisation: "",
  });

  useEffect(() => {
    if (rowData) {
      setFormData({
        fullName: rowData.fullName || "",
        email: rowData.email || "",
        phone: rowData.phone || "",
        dob: rowData.dob || "",
        state: rowData.state || "Uttar Pradesh",
        city: rowData.city || "Varanasi",
        district: rowData.district || rowData.city || "Varanasi",
        department: rowData.department || "road",
        role: rowData.role || "unit_officer",
        specialisation: rowData.specialisation || "",
      });
    }
  }, [rowData]);

  if (!isOpen || !rowData) return null;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...rowData,
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-xl">
              <Edit3 size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-black">Edit Staged Officer Row #{rowData.rowNumber}</h2>
              <p className="text-xs text-slate-400 font-semibold">
                Correct values before committing bulk import
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">
              Role *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange("role", "unit_officer")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs border ${
                  formData.role === "unit_officer"
                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600"
                }`}
              >
                <Shield size={14} /> Unit Officer
              </button>
              <button
                type="button"
                onClick={() => handleChange("role", "field_officer")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs border ${
                  formData.role === "field_officer"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600"
                }`}
              >
                <Zap size={14} /> Field Officer
              </button>
            </div>
          </div>

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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              >
                {CANONICAL_DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                State
              </label>
              <select
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
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
                City
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              >
                {COMMON_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.role === "field_officer" && (
            <div>
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-1">
                Specialisation
              </label>
              <input
                type="text"
                value={formData.specialisation}
                onChange={(e) => handleChange("specialisation", e.target.value)}
                placeholder="e.g. Asphalt, Road Maintenance"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
