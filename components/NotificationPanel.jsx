import { useEffect, useState } from "react";
import {
  X,
  Bell,
  CheckCheck,
  Check,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Clock,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";

const notificationMeta = {
  status: {
    Icon: AlertCircle,
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/30",
    dot: "bg-blue-500",
    pill: "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/25",
    accent: "from-blue-500/20 to-cyan-500/10",
    unreadBorder: "border-blue-200/70 dark:border-blue-500/30",
    label: "Status",
  },
  upvote: {
    Icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/30",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/25",
    accent: "from-emerald-500/20 to-teal-500/10",
    unreadBorder: "border-emerald-200/70 dark:border-emerald-500/30",
    label: "Upvote",
  },
  comment: {
    Icon: MessageSquare,
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/30",
    dot: "bg-amber-500",
    pill: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/25",
    accent: "from-amber-500/20 to-orange-500/10",
    unreadBorder: "border-amber-200/70 dark:border-amber-500/30",
    label: "Comment",
  },
  assignment: {
    Icon: Bell,
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/30",
    dot: "bg-violet-500",
    pill: "bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/25",
    accent: "from-violet-500/20 to-purple-500/10",
    unreadBorder: "border-violet-200/70 dark:border-violet-500/30",
    label: "Assigned",
  },
};

function getNotificationType(message) {
  if (message.includes("status changed")) return "status";
  if (message.includes("upvote")) return "upvote";
  if (message.includes("comment")) return "comment";
  if (message.includes("assigned")) return "assignment";
  return "status";
}

export function NotificationsPanel({ isOpen, onClose, notifications }) {
  const { data: session } = useSession();

  const user = session?.user;
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAll = useMutation(api.notifications.markAllAsRead);
  const deleteNotif = useMutation(api.notifications.deleteNotification);
  const deleteAll = useMutation(api.notifications.deleteAllNotifications);

  async function handleMarkAsRead(id) {
    await markAsRead({ id: id });
  }

  async function handleMarkAllAsRead() {
    await markAll({ userId: user.id });
  }

  async function handleDelete(notificationId) {
    await deleteNotif({ id: notificationId });
  }

  async function handleDeleteAll() {
    if (!user?.id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete all notifications?",
    );

    if (!confirmDelete) return;

    await deleteAll({ userId: user.id });
  }

  function getTimeAgo(date) {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  }

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Modal Shell ─────────────────────────────────────────── */}
      <div className="relative w-full sm:max-w-lg md:max-w-xl flex flex-col max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/5 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600">
          {/* Ambient glow orbs */}
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-6 right-8 w-36 h-36 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-2 right-24 w-20 h-20 bg-indigo-300/20 rounded-full blur-xl pointer-events-none" />

          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='512' height='512' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative px-5 pt-6 pb-5">
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-lg">
                    <Bell size={20} className="text-white" />
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-indigo-600 animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight tracking-tight">
                    Notifications
                  </h2>
                  <p className="text-blue-200/80 text-xs font-medium mt-0.5 flex items-center gap-1">
                    <Sparkles size={10} />
                    {unreadCount > 0
                      ? `${unreadCount} new update${unreadCount !== 1 ? "s" : ""}`
                      : "You're all caught up"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90 active:scale-90"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 border border-white/15 text-center">
                <p className="text-white text-lg font-black leading-none">
                  {notifications.length}
                </p>
                <p className="text-blue-200/70 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                  Total
                </p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 border border-white/15 text-center">
                <p className="text-white text-lg font-black leading-none">
                  {unreadCount}
                </p>
                <p className="text-blue-200/70 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                  Unread
                </p>
              </div>
              <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 border border-white/15 text-center">
                <p className="text-white text-lg font-black leading-none">
                  {notifications.length - unreadCount}
                </p>
                <p className="text-blue-200/70 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                  Read
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Control bar ─────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          {/* Pill toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-0.5">
            {["all", "unread"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                  filter === f
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-white/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {f === "all" ? (
                  "All"
                ) : (
                  <span className="flex items-center gap-1.5">
                    Unread
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full leading-none">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-100 dark:border-blue-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <CheckCheck size={12} />
                <span className="hidden xs:inline">Mark all read</span>
                <span className="xs:hidden">All read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/20 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Trash2 size={12} />
                <span className="hidden xs:inline">Delete all</span>
                <span className="xs:hidden">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Notification list ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {loading ? (
            /* Premium skeleton */
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-4 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <div className="flex-1 space-y-2.5 py-0.5">
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full w-4/5" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700/60 rounded-full w-3/5" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-3xl blur-xl" />
                <div className="relative w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                  <Bell
                    size={24}
                    className="text-slate-300 dark:text-slate-600"
                  />
                </div>
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                {filter === "unread"
                  ? "All caught up! 🎉"
                  : "No notifications yet"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed max-w-[200px]">
                {filter === "unread"
                  ? "You've read everything. Nice work!"
                  : "Activity on your issues will show up here."}
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {filteredNotifications.map((notification, idx) => {
                const type = getNotificationType(notification.message);
                const meta = notificationMeta[type];
                const { Icon } = meta;

                return (
                  <div
                    key={notification._id}
                    className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                      notification.read
                        ? "bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/60 hover:shadow-slate-200/50 dark:hover:shadow-black/20"
                        : `bg-white dark:bg-slate-800 ${meta.unreadBorder} hover:shadow-md`
                    }`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Unread gradient accent strip */}
                    {!notification.read && (
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b ${meta.gradient}`}
                      />
                    )}

                    {/* Unread bg glow */}
                    {!notification.read && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${meta.accent} opacity-40 pointer-events-none`}
                      />
                    )}

                    <div className="relative flex gap-3 px-4 pt-4 pb-3">
                      {/* Icon pill */}
                      <div
                        className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-md ${meta.glow}`}
                      >
                        <Icon
                          className="text-white"
                          size={16}
                          strokeWidth={2.5}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Type label + dot + time */}
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              notification.read
                                ? "text-slate-400 dark:text-slate-500"
                                : `text-${type === "upvote" ? "emerald" : type === "comment" ? "amber" : type === "assignment" ? "violet" : "blue"}-600 dark:text-${type === "upvote" ? "emerald" : type === "comment" ? "amber" : type === "assignment" ? "violet" : "blue"}-400`
                            }`}
                          >
                            {meta.label}
                          </span>
                          {!notification.read && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse`}
                            />
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
                            <Clock size={9} />
                            {getTimeAgo(notification.createdAt)}
                          </span>
                        </div>

                        {/* Message */}
                        <p
                          className={`text-sm leading-relaxed ${
                            notification.read
                              ? "text-slate-500 dark:text-slate-400"
                              : "text-slate-800 dark:text-white font-medium"
                          }`}
                        >
                          {notification.message}
                        </p>

                        {/* Action buttons:
                            - Desktop: hidden until group hover
                            - Mobile/tablet (md and below): always visible */}
                        <div className="flex items-center gap-2 mt-2.5 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity md:duration-200">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg ${meta.pill} border border-current/10 transition-all duration-150 hover:scale-105 active:scale-95`}
                            >
                              <Check size={11} strokeWidth={3} />
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100/50 dark:border-red-500/20 transition-all duration-150 hover:scale-105 active:scale-95"
                          >
                            <Trash2 size={11} strokeWidth={2.5} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Bottom spacer */}
              <div className="h-2" />
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="shrink-0 px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
          >
            Close
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
