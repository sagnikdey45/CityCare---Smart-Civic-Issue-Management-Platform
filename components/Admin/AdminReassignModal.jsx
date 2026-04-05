import {
  X,
  UserCheck,
  AlertCircle,
  History,
  Search,
  ChevronDown,
  Shield,
  Zap,
  Award,
  Target,
  Clock,
} from "lucide-react";
import { useState } from "react";

export function AdminReassignModal({ issue, officers, onClose, onReassign }) {
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [reason, setReason] = useState("");
  const [reassigning, setReassigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  if (!issue) return null;

  const currentOfficer = officers.find((o) => o.id === issue.assignedTo);

  const availableOfficers = officers.filter((o) => {
    if (o.id === issue.assignedTo) return false;
    if (currentOfficer && o.role !== currentOfficer.role) return false;
    if (roleFilter !== "all" && o.role !== roleFilter) return false;
    if (
      searchTerm &&
      !o.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  function handleReassign() {
    if (!selectedOfficer || !reason.trim()) return;

    setReassigning(true);
    setTimeout(() => {
      onReassign(issue.id, selectedOfficer, reason);
      setReassigning(false);
      onClose();
    }, 500);
  }

  const selectedOfficerProfile = officers.find((o) => o.id === selectedOfficer);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 dark:from-blue-700 dark:via-cyan-700 dark:to-blue-700 text-white p-6 backdrop-blur-md bg-opacity-95 z-10 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <UserCheck size={32} />
                </div>
                Reassign Issue
              </h2>
              <p className="text-blue-100 dark:text-blue-200 text-sm mt-2 ml-14">
                Transfer this issue to a different officer
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(92vh-200px)]">
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-800/40 rounded-xl">
                  <AlertCircle
                    size={24}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Issue Details
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <code className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                    {issue.ticket_id}
                  </code>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                      issue.severity === "high"
                        ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                        : issue.severity === "medium"
                          ? "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {issue.severity.toUpperCase()} PRIORITY
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                      issue.status === "pending"
                        ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
                        : issue.status === "in_progress"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                    }`}
                  >
                    {issue.status === "pending"
                      ? "PENDING"
                      : issue.status === "in_progress"
                        ? "IN PROGRESS"
                        : "RESOLVED"}
                  </span>
                </div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                  {issue.title}
                </h4>
                {issue.address && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="text-base">📍</span> {issue.address}
                  </p>
                )}
              </div>
            </div>

            {currentOfficer && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <History size={16} />
                  Currently Assigned To
                </label>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-5 shadow-md">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl ${
                        currentOfficer.role === "unit_officer"
                          ? "bg-gradient-to-br from-cyan-500 to-blue-600"
                          : "bg-gradient-to-br from-emerald-500 to-teal-600"
                      }`}
                    >
                      {currentOfficer.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-slate-900 dark:text-white">
                        {currentOfficer.full_name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                        {currentOfficer.role === "unit_officer" ? (
                          <>
                            <Shield size={14} /> Unit Officer
                          </>
                        ) : (
                          <>
                            <Zap size={14} /> Field Officer
                          </>
                        )}
                        {currentOfficer.ward_zone && (
                          <span>• {currentOfficer.ward_zone}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <UserCheck size={16} />
                <span className="text-red-600 dark:text-red-400">*</span>{" "}
                Reassign To
                {currentOfficer && (
                  <span className="ml-auto text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    {currentOfficer.role === "unit_officer"
                      ? "🏛️ Ward Officers Only"
                      : "🔧 Field Officers Only"}
                  </span>
                )}
              </label>

              {currentOfficer && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>
                      <strong>Role-Based Reassignment:</strong>{" "}
                      {currentOfficer.role === "unit_officer"
                        ? "Ward Officers"
                        : "Field Officers"}{" "}
                      can only be reassigned to other{" "}
                      {currentOfficer.role === "unit_officer"
                        ? "Ward Officers"
                        : "Field Officers"}{" "}
                      to maintain proper role hierarchy.
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      size={18}
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search officers by name..."
                      className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
                  {availableOfficers.length > 0 ? (
                    availableOfficers.map((officer) => (
                      <label
                        key={officer.id}
                        className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedOfficer === officer.id
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 scale-[1.02]"
                            : "bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md"
                        }`}
                      >
                        <input
                          type="radio"
                          name="officer"
                          value={officer.id}
                          checked={selectedOfficer === officer.id}
                          onChange={(e) => setSelectedOfficer(e.target.value)}
                          className="mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg ${
                            selectedOfficer === officer.id
                              ? "bg-white/20 text-white"
                              : officer.role === "unit_officer"
                                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white"
                                : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                          }`}
                        >
                          {officer.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="ml-4 flex-1">
                          <p
                            className={`font-bold text-base ${
                              selectedOfficer === officer.id
                                ? "text-white"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {officer.full_name}
                          </p>
                          <p
                            className={`text-sm flex items-center gap-2 ${
                              selectedOfficer === officer.id
                                ? "text-blue-100 dark:text-cyan-100"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {officer.role === "unit_officer" ? (
                              <>
                                <Shield size={14} /> Unit Officer
                              </>
                            ) : (
                              <>
                                <Zap size={14} /> Field Officer
                              </>
                            )}
                            {officer.ward_zone && (
                              <span>• {officer.ward_zone}</span>
                            )}
                          </p>
                        </div>
                        {selectedOfficer === officer.id && (
                          <div className="ml-3 p-2 bg-white/20 rounded-lg">
                            <UserCheck size={20} className="text-white" />
                          </div>
                        )}
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <UserCheck
                        size={48}
                        className="mx-auto text-slate-300 dark:text-slate-700 mb-3"
                      />
                      <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
                        {searchTerm
                          ? "No officers match your search"
                          : `No other ${currentOfficer?.role === "unit_officer" ? "Ward Officers" : "Field Officers"} available`}
                      </p>
                      {!searchTerm && currentOfficer && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Only{" "}
                          {currentOfficer.role === "unit_officer"
                            ? "Ward Officers"
                            : "Field Officers"}{" "}
                          can be assigned to this issue
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedOfficerProfile && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-5 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-800/40 rounded-lg">
                    <Target
                      size={20}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Selected Officer Profile
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      4.8
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                      <Award size={12} /> Rating
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      32h
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                      <Clock size={12} /> Avg Time
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                      87%
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                      <Target size={12} /> Success
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <History size={16} />
                <span className="text-red-600 dark:text-red-400">*</span> Reason
                for Reassignment
                <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-normal">
                  {reason.length}/30 characters minimum
                </span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a detailed reason... e.g., Workload balancing, Skill match, Area expertise, etc."
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all h-32 resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                  reason.length < 30
                    ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
                    : "bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:ring-emerald-400"
                }`}
              />
              {reason.length > 0 && reason.length < 30 && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Please provide at least 30 characters ({30 -
                    reason.length}{" "}
                  more needed)
                </p>
              )}
              {reason.length >= 30 && (
                <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <UserCheck size={12} />
                  Reason meets minimum requirements
                </p>
              )}
              <div className="flex items-start gap-3 mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <History
                  size={18}
                  className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm text-amber-900 dark:text-amber-300 font-semibold mb-1">
                    Audit Trail
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-400">
                    This reassignment will be permanently recorded in the issue
                    history. Both the current and new officer will receive
                    immediate notifications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gradient-to-t from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border-t-2 border-slate-200 dark:border-slate-800 p-6 backdrop-blur-md bg-opacity-95">
          <div className="flex gap-4">
            <button
              onClick={handleReassign}
              disabled={!selectedOfficer || reason.length < 30 || reassigning}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
                !selectedOfficer || reason.length < 30 || reassigning
                  ? "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 hover:shadow-2xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/20 transform hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <UserCheck size={24} />
              {reassigning ? "Reassigning..." : "Confirm Reassignment"}
            </button>
            <button
              onClick={onClose}
              disabled={reassigning}
              className="px-6 py-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
