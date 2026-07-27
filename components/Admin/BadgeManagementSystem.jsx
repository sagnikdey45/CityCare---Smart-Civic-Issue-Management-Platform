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
} from "lucide-react";

// Dummy data

const INITIAL_BADGES = [
  {
    _id: "badge_001",
    code: "first_reporter",
    name: "First Reporter",
    description: "Submitted the first civic issue report",
    icon: "flag",
    category: "reporting",
    requiredCount: 1,
    isActive: true,
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    _id: "badge_002",
    code: "evidence_builder",
    name: "Evidence Builder",
    description: "Added video evidence to strengthen a civic report",
    icon: "video",
    category: "quality",
    requiredCount: 1,
    isActive: true,
    createdAt: Date.now() - 18 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
  },
  {
    _id: "badge_003",
    code: "verified_voice",
    name: "Verified Voice",
    description: "Had 5 reports verified by officers",
    icon: "check-circle",
    category: "quality",
    requiredCount: 5,
    isActive: true,
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
  },
  {
    _id: "badge_004",
    code: "problem_solver",
    name: "Problem Solver",
    description: "Contributed to 5 resolved civic issues",
    icon: "wrench",
    category: "resolution",
    requiredCount: 5,
    isActive: true,
    createdAt: Date.now() - 12 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    _id: "badge_005",
    code: "seven_day_streak",
    name: "7-Day Civic Streak",
    description: "Stayed active for 7 civic participation events",
    icon: "flame",
    category: "streak",
    requiredCount: 7,
    isActive: true,
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    _id: "badge_006",
    code: "city_hero",
    name: "City Hero",
    description: "Reached 1000 citizen points",
    icon: "award",
    category: "special",
    requiredPoints: 1000,
    isActive: true,
    createdAt: Date.now() - 8 * 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    _id: "badge_007",
    code: "community_voice",
    name: "Community Voice",
    description: "Added 10 discussion comments to civic issues",
    icon: "message-circle",
    category: "community",
    requiredCount: 10,
    isActive: true,
    createdAt: Date.now() - 6 * 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    _id: "badge_008",
    code: "top_resolver",
    name: "Top Resolver",
    description: "Had 20 reported issues resolved by the city",
    icon: "star",
    category: "resolution",
    requiredCount: 20,
    isActive: false,
    createdAt: Date.now() - 4 * 86400000,
    updatedAt: Date.now() - 86400000,
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
      </div>
    </div>
  );
}

// ── Add/Edit Form ─────────────────────────────────────────────────────────────

function BadgeFormDialog({ badge, onSave, onClose }) {
  const isEdit = !!badge;
  const [form, setForm] = useState({
    name: badge?.name || "",
    code: badge?.code || "",
    description: badge?.description || "",
    icon: badge?.icon || "award",
    category: badge?.category || "special",
    requiredPoints: badge?.requiredPoints?.toString() || "",
    requiredCount: badge?.requiredCount?.toString() || "",
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
    onSave({
      name: form.name,
      code: form.code,
      description: form.description,
      icon: form.icon,
      category: form.category,
      requiredPoints: form.requiredPoints
        ? Number(form.requiredPoints)
        : undefined,
      requiredCount: form.requiredCount
        ? Number(form.requiredCount)
        : undefined,
      isActive: form.isActive,
    });
  }

  const style = getCategoryStyle(form.category);

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
              {isEdit ? "Edit Badge" : "Add New Badge"}
            </h3>
            <p className="text-slate-300 text-sm mt-0.5">
              {isEdit
                ? "Update badge details"
                : "Create a new achievement badge"}
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value }))
                  }
                  placeholder="auto-generated from name"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Used as a unique identifier. Use underscores, no spaces.
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
                Icon
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

            {/* Required Count */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
                Required Count
              </label>
              <input
                type="number"
                min="0"
                value={form.requiredCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requiredCount: e.target.value }))
                }
                placeholder="e.g. 5"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
            </div>

            {/* Required Points */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">
                Required Points
              </label>
              <input
                type="number"
                min="0"
                value={form.requiredPoints}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requiredPoints: e.target.value }))
                }
                placeholder="e.g. 1000"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Active toggle */}
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
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
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

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all"
            >
              <Save size={16} />
              {isEdit ? "Save Changes" : "Create Badge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Badge Card ────────────────────────────────────────────────────────────────

function BadgeCard({ badge, onEdit, onToggle }) {
  const style = getCategoryStyle(badge.category);

  return (
    <div
      className={`group relative overflow-hidden bg-white dark:bg-slate-800/80 rounded-3xl border-2 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${badge.isActive ? "border-slate-100 dark:border-slate-700" : "border-dashed border-slate-300 dark:border-slate-600 opacity-75"}`}
    >
      {!badge.isActive && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full px-2.5 py-1">
            Inactive
          </span>
        </div>
      )}

      <div
        className={`absolute top-0 right-0 w-28 h-28 rounded-full -mr-12 -mt-12 bg-gradient-to-br ${style.gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`}
      ></div>

      <div className="p-5">
        {/* Icon + name */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
          >
            {getBadgeIcon(badge.icon, 22)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight mb-1">
              {badge.name}
            </h3>
            <span
              className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${style.pill}`}
            >
              {badge.category}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {badge.description}
        </p>

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Hash size={11} />
            <span className="font-mono">{badge.code}</span>
          </div>
          {badge.requiredCount !== undefined && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle size={11} />
              <span>
                Required count: <strong>{badge.requiredCount}</strong>
              </span>
            </div>
          )}
          {badge.requiredPoints !== undefined && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Zap size={11} />
              <span>
                Required points: <strong>{badge.requiredPoints}</strong>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Clock size={11} />
            <span>
              Updated {formatDate(badge.updatedAt || badge.createdAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            <Edit3 size={13} />
            Edit
          </button>
          <button
            onClick={onToggle}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              badge.isActive
                ? "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300"
                : "bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {badge.isActive ? (
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

// ── Main component ────────────────────────────────────────────────────────────

export function BadgeManagementSection() {
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);

  const filtered = badges.filter((b) => {
    if (
      search &&
      !b.name.toLowerCase().includes(search.toLowerCase()) &&
      !b.code.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
    if (statusFilter === "active" && !b.isActive) return false;
    if (statusFilter === "inactive" && b.isActive) return false;
    return true;
  });

  const totalActive = badges.filter((b) => b.isActive).length;
  const totalInactive = badges.filter((b) => !b.isActive).length;
  const categoriesUsed = [...new Set(badges.map((b) => b.category))].length;

  function handleAdd(data) {
    // TODO: Replace local badge creation with api.badges.createBadge
    const newBadge = {
      ...data,
      _id: `badge_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setBadges((prev) => [newBadge, ...prev]);
    setShowAddForm(false);
  }

  function handleEdit(data) {
    if (!editingBadge) return;
    // TODO: Replace with api.badges.updateBadge
    setBadges((prev) =>
      prev.map((b) =>
        b._id === editingBadge._id
          ? { ...b, ...data, updatedAt: Date.now() }
          : b,
      ),
    );
    setEditingBadge(null);
  }

  function handleToggle(badge) {
    // TODO: Replace with api.badges.toggleBadgeActive
    setBadges((prev) =>
      prev.map((b) =>
        b._id === badge._id
          ? { ...b, isActive: !b.isActive, updatedAt: Date.now() }
          : b,
      ),
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
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
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 flex-shrink-0"
            >
              <Plus size={18} />
              Add New Badge
            </button>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              {
                label: "Total Badges",
                value: badges.length,
                icon: <Award size={16} />,
                color: "bg-white/10",
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
                label: "Categories Used",
                value: categoriesUsed,
                icon: <Tag size={16} />,
                color: "bg-blue-500/20",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.color} backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center`}
              >
                <div className="flex justify-center mb-1 text-white/70">
                  {s.icon}
                </div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-white/65 text-xs font-semibold">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
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
              placeholder="Search by name or code..."
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

      {/* ── Badge grid ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Award size={40} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            No Badges Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto text-sm">
            {badges.length === 0
              ? "Create your first badge to get started with the rewards system."
              : "Try adjusting your search or filters."}
          </p>
          {badges.length === 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-105"
            >
              <Plus size={16} />
              Create First Badge
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((badge) => (
            <BadgeCard
              key={badge._id}
              badge={badge}
              onEdit={() => setEditingBadge(badge)}
              onToggle={() => handleToggle(badge)}
            />
          ))}
        </div>
      )}

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      {showAddForm && (
        <BadgeFormDialog
          onSave={handleAdd}
          onClose={() => setShowAddForm(false)}
        />
      )}
      {editingBadge && (
        <BadgeFormDialog
          badge={editingBadge}
          onSave={handleEdit}
          onClose={() => setEditingBadge(null)}
        />
      )}
    </div>
  );
}
