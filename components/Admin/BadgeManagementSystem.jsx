"use client";

import { useState } from "react";
import {
  Trophy,
  Star,
  Flame,
  Award,
  Medal,
  ShieldCheck,
  Video,
  FileText,
  CheckCircle,
  MessageCircle,
  Zap,
  Flag,
  Wrench,
  Crown,
  Gift,
  Plus,
  CreditCard as Edit3,
  Eye,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  ChevronDown,
  X,
  Save,
  Sparkles,
  BarChart3,
  Tag,
  Clock,
  Hash,
  Lock,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";

// ── Criteria Types Constant ──────────────────────────────────────────────────

const CRITERIA_TYPES = [
  {
    value: "reports_submitted",
    label: "Reports Submitted",
    helper: "Citizen submitted this many issues",
  },
  {
    value: "video_evidence_added",
    label: "Video Evidence Added",
    helper: "Citizen added this many videos as evidence",
  },
  {
    value: "reports_verified",
    label: "Reports Verified",
    helper: "Citizen had this many reports verified",
  },
  {
    value: "reports_resolved",
    label: "Reports Resolved",
    helper: "Citizen contributed to this many resolved issues",
  },
  {
    value: "comments_added",
    label: "Comments Added",
    helper: "Citizen added this many public discussion comments",
  },
  {
    value: "upvotes_received",
    label: "Upvotes Received",
    helper: "Citizen received this many upvotes",
  },
  {
    value: "current_streak",
    label: "Current Streak",
    helper: "Citizen maintained this many active days currently",
  },
  {
    value: "longest_streak",
    label: "Longest Streak",
    helper: "Citizen achieved this many days as best streak",
  },
  {
    value: "points_reached",
    label: "Points Reached",
    helper: "Citizen reached this many total points",
  },
  {
    value: "manual",
    label: "Manual Award",
    helper: "Only admins can manually award this badge",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function generateBadgeCode(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_");
}

function formatCriteriaType(type) {
  return (type || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getCriteriaHelper(type) {
  return CRITERIA_TYPES.find((item) => item.value === type)?.helper || "";
}

function getRequiredCountLabel(criteriaType) {
  switch (criteriaType) {
    case "reports_submitted":
      return "Reports Required";
    case "video_evidence_added":
      return "Videos Required";
    case "reports_verified":
      return "Verified Reports Required";
    case "reports_resolved":
      return "Resolved Reports Required";
    case "comments_added":
      return "Comments Required";
    case "upvotes_received":
      return "Upvotes Required";
    case "current_streak":
      return "Current Streak Days Required";
    case "longest_streak":
      return "Longest Streak Days Required";
    case "points_reached":
      return "Points Required";
    case "manual":
      return "Manual Award Requirement";
    default:
      return "Required Count";
  }
}

function formatRequiredValue(badge) {
  if (badge.criteriaType === "points_reached") {
    return `${badge.requiredCount.toLocaleString()} points`;
  }

  if (
    badge.criteriaType === "current_streak" ||
    badge.criteriaType === "longest_streak"
  ) {
    return `${badge.requiredCount} days`;
  }

  if (badge.criteriaType === "manual") {
    return "Manual award only";
  }

  return badge.requiredCount.toLocaleString();
}

function getBadgeIcon(icon, size = 20) {
  const map = {
    flag: <Flag size={size} />,
    video: <Video size={size} />,
    "check-circle": <CheckCircle size={size} />,
    wrench: <Wrench size={size} />,
    flame: <Flame size={size} />,
    award: <Award size={size} />,
    star: <Star size={size} />,
    trophy: <Trophy size={size} />,
    shield: <ShieldCheck size={size} />,
    "message-circle": <MessageCircle size={size} />,
    crown: <Crown size={size} />,
    gift: <Gift size={size} />,
    zap: <Zap size={size} />,
    medal: <Medal size={size} />,
  };
  return map[icon] || <Award size={size} />;
}

function getCategoryStyle(cat) {
  const map = {
    reporting: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      gradient: "from-blue-500 to-cyan-500",
      pill: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    },
    resolution: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
      gradient: "from-emerald-500 to-teal-500",
      pill: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
    },
    community: {
      bg: "bg-teal-50 dark:bg-teal-900/20",
      text: "text-teal-700 dark:text-teal-300",
      border: "border-teal-200 dark:border-teal-800",
      gradient: "from-teal-500 to-cyan-500",
      pill: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700",
    },
    streak: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-200 dark:border-orange-800",
      gradient: "from-orange-500 to-amber-500",
      pill: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700",
    },
    quality: {
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      text: "text-cyan-700 dark:text-cyan-300",
      border: "border-cyan-200 dark:border-cyan-800",
      gradient: "from-cyan-500 to-blue-500",
      pill: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700",
    },
    special: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
      gradient: "from-amber-400 to-orange-500",
      pill: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
    },
  };
  return map[cat] || map.special;
}

const CATEGORIES = [
  "reporting",
  "resolution",
  "community",
  "streak",
  "quality",
  "special",
];
const ICONS = [
  "flag",
  "video",
  "check-circle",
  "wrench",
  "flame",
  "award",
  "star",
  "trophy",
  "shield",
  "message-circle",
  "crown",
  "gift",
  "zap",
  "medal",
];

// ── Badge Preview ─────────────────────────────────────────────────────────────

function BadgePreview({ badge }) {
  const style = getCategoryStyle(badge.category || "special");
  return (
    <div
      className={`inline-flex flex-col items-center gap-2 p-4 rounded-2xl ${style.bg} border ${style.border}`}
    >
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-lg`}
      >
        {getBadgeIcon(badge.icon || "award", 24)}
      </div>
      <div className="text-center">
        <div className={`text-sm font-black ${style.text}`}>
          {badge.name || "Badge Name"}
        </div>
        <div className={`text-xs font-bold opacity-60 ${style.text}`}>
          {badge.category || "category"}
        </div>
        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
          {formatCriteriaType(badge.criteriaType || "reports_submitted")}
        </div>
        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
          +{badge.rewardPoints || 0} pts
        </div>
      </div>
    </div>
  );
}

// ── Add/Edit Form ─────────────────────────────────────────────────────────────

function BadgeFormDialog({ badge, onSave, onClose, isSaving }) {
  const isEdit = !!badge;
  const [form, setForm] = useState({
    name: badge?.name || "",
    code: badge?.code || "",
    description: badge?.description || "",
    icon: badge?.icon || "award",
    category: badge?.category || "special",
    criteriaType: badge?.criteriaType || "reports_submitted",
    requiredCount: badge?.requiredCount?.toString() || "1",
    rewardPoints: badge?.rewardPoints?.toString() || "10",
    isActive: badge?.isActive ?? true,
  });

  function handleNameChange(name) {
    setForm((f) => ({
      ...f,
      name,
      code: isEdit ? f.code : generateBadgeCode(name),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Badge name is required.");
      return;
    }
    if (!isEdit && !form.code.trim()) {
      alert("Badge code is required.");
      return;
    }
    if (!form.description.trim()) {
      alert("Description is required.");
      return;
    }
    if (!form.category) {
      alert("Category is required.");
      return;
    }
    if (!form.criteriaType) {
      alert("Criteria type is required.");
      return;
    }

    const count = Number(form.requiredCount);
    if (isNaN(count) || count < 0) {
      alert("Required count must be a non-negative number.");
      return;
    }

    const points = Number(form.rewardPoints);
    if (isNaN(points) || points < 0) {
      alert("Reward points must be a non-negative number.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon,
      category: form.category,
      criteriaType: form.criteriaType,
      requiredCount: form.criteriaType === "manual" ? 1 : count,
      rewardPoints: points,
      isActive: form.isActive,
    };

    if (!isEdit) {
      payload.code = form.code.trim();
    }

    onSave(payload);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white">
              {isEdit ? "Edit Custom Badge" : "Add Custom Badge"}
            </h3>
            <p className="text-slate-300 text-sm mt-0.5">
              {isEdit
                ? "Update custom badge details"
                : "Create a new custom achievement badge"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto max-h-[70vh]"
        >
          <div className="flex gap-6 items-start">
            {/* Preview */}
            <div className="flex-shrink-0">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                Preview
              </p>
              <BadgePreview
                badge={{
                  name: form.name,
                  icon: form.icon,
                  category: form.category,
                  criteriaType: form.criteriaType,
                  rewardPoints: Number(form.rewardPoints) || 0,
                }}
              />
            </div>

            {/* Name + Code */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
                  Badge Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Clean City Champion"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
                  Badge Code *
                </label>
                <input
                  required
                  value={form.code}
                  disabled={isEdit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value }))
                  }
                  placeholder="auto-generated from name"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {isEdit
                    ? "Badge code cannot be changed after creation."
                    : "Used as a unique identifier. Use underscores, no spaces."}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
              Description *
            </label>
            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              placeholder="Describe when this badge is earned..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
                Category *
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="w-full appearance-none px-4 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
                Icon *
              </label>
              <div className="relative">
                <select
                  value={form.icon}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, icon: e.target.value }))
                  }
                  className="w-full appearance-none px-4 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {ICONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Criteria Type */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
              Criteria Type *
            </label>
            <div className="relative">
              <select
                value={form.criteriaType}
                onChange={(e) =>
                  setForm((f) => {
                    const nextType = e.target.value;
                    return {
                      ...f,
                      criteriaType: nextType,
                      requiredCount:
                        nextType === "manual" ? "1" : f.requiredCount,
                    };
                  })
                }
                className="w-full appearance-none px-4 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              >
                {CRITERIA_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {getCriteriaHelper(form.criteriaType)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Required Count */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
                {getRequiredCountLabel(form.criteriaType)} *
              </label>
              <input
                type="number"
                min="0"
                value={form.requiredCount}
                disabled={form.criteriaType === "manual"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requiredCount: e.target.value }))
                }
                placeholder="e.g. 5"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {form.criteriaType === "manual" && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                  Manual badges are awarded by admins only.
                </p>
              )}
            </div>

            {/* Reward Points */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
                Reward Points *
              </label>
              <input
                type="number"
                min="0"
                value={form.rewardPoints}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rewardPoints: e.target.value }))
                }
                placeholder="e.g. 25"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Active toggle / Edit Note */}
          {!isEdit ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Badge Active
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Inactive badges won't be awarded to citizens
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, isActive: !f.isActive }))
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${form.isActive ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
              >
                {form.isActive ? (
                  <ToggleRight size={18} />
                ) : (
                  <ToggleLeft size={18} />
                )}
                {form.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Badge active status is managed from the badge card using the
                Activate / Deactivate button.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save size={16} />
                  {isEdit ? "Save Changes" : "Create Badge"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Badge Card ────────────────────────────────────────────────────────────────

function BadgeCard({ badge, onEdit, onToggle, isToggling, isBusy }) {
  const style = getCategoryStyle(badge.category);

  return (
    <div
      className={`group relative overflow-hidden bg-white dark:bg-slate-800/80 rounded-3xl border-2 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
        badge.isActive
          ? "border-slate-100 dark:border-slate-700"
          : "border-dashed border-slate-300 dark:border-slate-600 opacity-75"
      }`}
    >
      {/* Status & Type Badges/Pills in top corner */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5 flex-wrap justify-end">
        {badge.isSystemBadge && (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full px-2 py-0.5 border border-blue-100 dark:border-blue-800">
            <Lock size={10} />
            Protected
          </span>
        )}
        {!badge.isActive && (
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5">
            Inactive
          </span>
        )}
      </div>

      <div
        className={`absolute top-0 right-0 w-28 h-28 rounded-full -mr-12 -mt-12 bg-gradient-to-br ${style.gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`}
      ></div>

      <div className="p-5 flex flex-col h-full justify-between">
        <div>
          {/* Icon + name */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
            >
              {getBadgeIcon(badge.icon, 22)}
            </div>
            <div className="flex-1 min-w-0 pr-16">
              <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1 truncate">
                {badge.name}
              </h3>
              <div className="flex flex-wrap gap-1">
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.pill}`}
                >
                  {badge.category}
                </span>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {badge.isSystemBadge ? "System" : "Custom"}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed h-8">
            {badge.description}
          </p>

          {/* Meta / Details */}
          <div className="space-y-1.5 mb-5 border-t border-slate-150 dark:border-slate-700/60 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500">
                Badge Code
              </span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {badge.code}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500">
                Criteria
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {formatCriteriaType(badge.criteriaType)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500">
                Required
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {formatRequiredValue(badge)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500">Reward</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">
                +{badge.rewardPoints} pts
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>Updated</span>
              <span>{formatDate(badge.updatedAt || badge.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (badge.isSystemBadge) {
                alert("System badges are protected and cannot be edited.");
              } else {
                onEdit();
              }
            }}
            disabled={badge.isSystemBadge || isBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              badge.isSystemBadge
                ? "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700/50"
                : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
            }`}
          >
            {badge.isSystemBadge ? <Lock size={13} /> : <Edit3 size={13} />}
            {badge.isSystemBadge ? "Protected" : "Edit"}
          </button>
          <button
            onClick={() => {
              if (badge.isSystemBadge) {
                alert("System/default badges cannot be deactivated.");
              } else {
                onToggle();
              }
            }}
            disabled={isToggling || badge.isSystemBadge || isBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              badge.isSystemBadge
                ? "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700/50"
                : badge.isActive
                  ? "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300"
                  : "bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {badge.isSystemBadge ? (
              <>
                <Lock size={13} />
                Protected
              </>
            ) : isToggling ? (
              <>
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </>
            ) : badge.isActive ? (
              <>
                <ToggleLeft size={13} />
                Deactivate
              </>
            ) : (
              <>
                <ToggleRight size={13} />
                Activate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Loader ─────────────────────────────────────────────────────────

function BadgeSkeletonLoader() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="h-64 bg-slate-100 dark:bg-slate-800/80 rounded-3xl p-8 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 w-48 rounded-xl"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 w-80 rounded-lg"></div>
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 w-36 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl"
            ></div>
          ))}
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-16 bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-4 flex gap-3 items-center">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 flex-1 rounded-xl"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 w-32 rounded-xl"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 w-32 rounded-xl"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 w-32 rounded-xl"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 w-32 rounded-xl"></div>
      </div>

      {/* Badge Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-72 bg-slate-100 dark:bg-slate-800/80 rounded-3xl p-5 space-y-4"
          >
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
              <div className="flex-1 space-y-2 mt-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-full"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-5/6"></div>
            </div>
            <div className="space-y-1">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-2/3"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl flex-1"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function BadgeManagementSection() {
  const { data: session } = useSession();

  // Convex Queries and Mutations
  const badges = useQuery(api.badges.getAllBadges);
  const createCustomBadge = useMutation(api.badges.createCustomBadge);
  const updateCustomBadge = useMutation(api.badges.updateCustomBadge);
  const setCustomBadgeActiveStatus = useMutation(
    api.badges.setCustomBadgeActiveStatus,
  );
  const seedDefaultBadges = useMutation(api.badges.seedDefaultBadges);

  // Local Component State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [badgeTypeFilter, setBadgeTypeFilter] = useState("all");
  const [criteriaFilter, setCriteriaFilter] = useState("all");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);

  const [isSeeding, setIsSeeding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingBadgeId, setTogglingBadgeId] = useState(null);

  // Return skeleton if querying database
  if (badges === undefined) {
    return <BadgeSkeletonLoader />;
  }

  const badgeList = badges ?? [];

  // Filter computation
  const filtered = badgeList.filter((b) => {
    const q = search.toLowerCase().trim();

    if (
      q &&
      !b.name.toLowerCase().includes(q) &&
      !b.code.toLowerCase().includes(q) &&
      !b.description.toLowerCase().includes(q) &&
      !b.criteriaType.toLowerCase().includes(q)
    ) {
      return false;
    }

    if (categoryFilter !== "all" && b.category !== categoryFilter) return false;

    if (statusFilter === "active" && !b.isActive) return false;
    if (statusFilter === "inactive" && b.isActive) return false;

    if (badgeTypeFilter === "system" && !b.isSystemBadge) return false;
    if (badgeTypeFilter === "custom" && b.isSystemBadge) return false;

    if (criteriaFilter !== "all" && b.criteriaType !== criteriaFilter) {
      return false;
    }

    return true;
  });

  // Summary statistics metrics
  const totalBadges = badgeList.length;
  const systemBadges = badgeList.filter((b) => b.isSystemBadge).length;
  const customBadges = badgeList.filter((b) => !b.isSystemBadge).length;
  const totalActive = badgeList.filter((b) => b.isActive).length;
  const totalInactive = badgeList.filter((b) => !b.isActive).length;
  const criteriaTypesUsed = [...new Set(badgeList.map((b) => b.criteriaType))]
    .length;
  const totalRewardPoints = badgeList.reduce(
    (sum, b) => sum + (b.rewardPoints ?? 0),
    0,
  );

  // Mutation Handlers
  async function handleAdd(data) {
    if (!data.name?.trim()) {
      alert("Badge name is required.");
      return;
    }

    if (!data.code?.trim()) {
      alert("Badge code is required.");
      return;
    }

    if (!data.description?.trim()) {
      alert("Badge description is required.");
      return;
    }

    if (Number(data.requiredCount) < 0) {
      alert("Required count cannot be negative.");
      return;
    }

    if (Number(data.rewardPoints) < 0) {
      alert("Reward points cannot be negative.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: data.name.trim(),
        code: data.code.trim(),
        description: data.description.trim(),
        icon: data.icon,
        category: data.category,
        criteriaType: data.criteriaType,
        requiredCount: Number(data.requiredCount),
        rewardPoints: Number(data.rewardPoints),
        isActive: data.isActive,
      };

      if (session?.user?.id) {
        payload.createdByAdminId = session.user.id;
      }

      const result = await createCustomBadge(payload);
      setShowAddForm(false);
      alert(result?.message || "Custom badge created successfully.");
    } catch (error) {
      console.error("Create badge failed:", error);
      alert(error?.message || "Failed to create custom badge.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEdit(data) {
    if (!editingBadge) return;

    if (editingBadge.isSystemBadge) {
      alert("System badges are protected and cannot be edited.");
      return;
    }

    if (!data.name?.trim()) {
      alert("Badge name is required.");
      return;
    }

    if (!data.description?.trim()) {
      alert("Badge description is required.");
      return;
    }

    if (Number(data.requiredCount) < 0) {
      alert("Required count cannot be negative.");
      return;
    }

    if (Number(data.rewardPoints) < 0) {
      alert("Reward points cannot be negative.");
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateCustomBadge({
        badgeId: editingBadge._id,
        name: data.name.trim(),
        description: data.description.trim(),
        icon: data.icon,
        category: data.category,
        criteriaType: data.criteriaType,
        requiredCount: Number(data.requiredCount),
        rewardPoints: Number(data.rewardPoints),
      });

      setEditingBadge(null);
      alert(result?.message || "Custom badge updated successfully.");
    } catch (error) {
      console.error("Update badge failed:", error);
      alert(error?.message || "Failed to update custom badge.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(badge) {
    if (badge.isSystemBadge) {
      alert("System/default badges cannot be deactivated.");
      return;
    }

    try {
      setTogglingBadgeId(badge._id);
      const result = await setCustomBadgeActiveStatus({
        badgeId: badge._id,
        isActive: !badge.isActive,
      });

      alert(result?.message || "Badge status updated successfully.");
    } catch (error) {
      console.error("Toggle badge failed:", error);
      alert(error?.message || "Failed to update badge status.");
    } finally {
      setTogglingBadgeId(null);
    }
  }

  async function handleSeedDefaultBadges() {
    try {
      setIsSeeding(true);
      const result = await seedDefaultBadges({});
      alert(
        result?.message || "Default badges seeded or repaired successfully.",
      );
    } catch (error) {
      console.error("Seed default badges failed:", error);
      alert(error?.message || "Failed to seed default badges.");
    } finally {
      setIsSeeding(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,255,255,0.08),transparent_60%)]"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-36 -mt-36"></div>
        <div className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                  <Award size={30} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Badge Management
                  </h2>
                  <p className="text-slate-300 text-sm mt-0.5">
                    Create, manage, and monitor achievement badges used in the
                    CityCare citizen rewards system.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <button
                onClick={handleSeedDefaultBadges}
                disabled={isSeeding || isSaving || togglingBadgeId !== null}
                className="flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-sm border border-white/10 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                <Sparkles size={18} />
                {isSeeding ? "Seeding..." : "Seed / Repair Defaults"}
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                disabled={isSeeding || isSaving || togglingBadgeId !== null}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                <Plus size={18} />
                Add Custom Badge
              </button>
            </div>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
            {[
              {
                label: "Total Badges",
                value: totalBadges,
                icon: <Award size={16} />,
                color: "bg-white/10",
              },
              {
                label: "System Badges",
                value: systemBadges,
                icon: <Lock size={16} />,
                color: "bg-blue-500/20",
              },
              {
                label: "Custom Badges",
                value: customBadges,
                icon: <Sparkles size={16} />,
                color: "bg-purple-500/20",
              },
              {
                label: "Active",
                value: totalActive,
                icon: <CheckCircle size={16} />,
                color: "bg-emerald-500/20",
              },
              {
                label: "Inactive",
                value: totalInactive,
                icon: <ToggleLeft size={16} />,
                color: "bg-slate-500/30",
              },
              {
                label: "Criteria Types",
                value: criteriaTypesUsed,
                icon: <Tag size={16} />,
                color: "bg-orange-500/20",
              },
              {
                label: "Total Rewards",
                value: `${totalRewardPoints.toLocaleString()} pts`,
                icon: <Zap size={16} />,
                color: "bg-amber-500/20",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.color} backdrop-blur-sm border border-white/10 rounded-2xl p-3 text-center flex flex-col justify-center items-center`}
              >
                <div className="flex justify-center mb-1 text-white/70">
                  {s.icon}
                </div>
                <div className="text-lg font-black text-white">{s.value}</div>
                <div className="text-white/65 text-[10px] font-semibold">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, description, criteria..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {[
            {
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                ["all", "All Categories"],
                ...CATEGORIES.map((c) => [
                  c,
                  c.charAt(0).toUpperCase() + c.slice(1),
                ]),
              ],
            },
            {
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                ["all", "All Status"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ],
            },
            {
              value: badgeTypeFilter,
              onChange: setBadgeTypeFilter,
              options: [
                ["all", "All Types"],
                ["system", "System Badges"],
                ["custom", "Custom Badges"],
              ],
            },
            {
              value: criteriaFilter,
              onChange: setCriteriaFilter,
              options: [
                ["all", "All Criteria"],
                ...CRITERIA_TYPES.map((type) => [type.value, type.label]),
              ],
            },
          ].map((sel, i) => (
            <div key={i} className="relative">
              <select
                value={sel.value}
                onChange={(e) => sel.onChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {sel.options.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          ))}
          <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold ml-auto">
            {filtered.length} badge{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Info Note for Inactive Custom Badges */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-700/60 rounded-2xl">
        <Sparkles size={16} className="text-amber-500 flex-shrink-0" />
        <p className="text-xs text-slate-600 dark:text-slate-300">
          <strong>Note:</strong> Inactive custom badges are not awardable, but
          citizens who already earned them keep them. System badges are
          protected and cannot be edited or deactivated.
        </p>
      </div>

      {/* Badge Grid / Empty State */}
      {badgeList.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-16 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Award size={40} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            No badges found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Seed default badges to create the protected system badges.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleSeedDefaultBadges}
              disabled={isSeeding || isSaving}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-2xl font-bold text-sm shadow transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={16} />
              {isSeeding ? "Seeding..." : "Seed / Repair Default Badges"}
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={isSeeding || isSaving}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Create Custom Badge
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-16 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Filter size={40} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            No badges match your filters
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Try changing search, category, status, badge type, or criteria.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCategoryFilter("all");
              setStatusFilter("all");
              setBadgeTypeFilter("all");
              setCriteriaFilter("all");
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-150 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-2xl font-bold text-sm shadow transition-all hover:scale-105"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((badge) => (
            <BadgeCard
              key={badge._id}
              badge={badge}
              onEdit={() => {
                if (badge.isSystemBadge) {
                  alert("System badges are protected and cannot be edited.");
                  return;
                }
                setEditingBadge(badge);
              }}
              onToggle={() => handleToggle(badge)}
              isToggling={togglingBadgeId === badge._id}
              isBusy={isSaving || isSeeding || togglingBadgeId !== null}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      {showAddForm && (
        <BadgeFormDialog
          onSave={handleAdd}
          onClose={() => setShowAddForm(false)}
          isSaving={isSaving}
        />
      )}
      {editingBadge && (
        <BadgeFormDialog
          badge={editingBadge}
          onSave={handleEdit}
          onClose={() => setEditingBadge(null)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
