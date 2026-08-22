import { useState, useEffect } from "react";
import { X, Edit3 } from "lucide-react";
import {
  INDIAN_STATES,
  COMMON_CITIES,
} from "../../../lib/accountProvisioning/provisioningConstants";

export function EditCityAdminDialog({ isOpen, rowData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    state: "Uttar Pradesh",
    city: "Varanasi",
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
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-xl">
              <Edit3 size={18} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-black">Edit Staged City Admin Row #{rowData.rowNumber}</h2>
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
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              />
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
              className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
