import { useState, useEffect, useRef } from "react";
import {
  Search,
  PlusCircle,
  Bell,
  User,
  LogOut,
  AlertCircle,
  Calendar,
  TrendingUp,
  CheckCircle,
  Grid,
  List,
  MapPin,
  Zap,
  Droplets,
  Trash2,
  Recycle,
  Package,
  HeartPulse,
  MoreHorizontal,
  ChevronDown,
  Check,
  Clock,
  XCircle,
} from "lucide-react";
import { IssueCard, IssueCardSkeleton } from "@/components/IssueCard";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ModeToggle } from "../ModeToggle";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TutorialOverlay } from "./TutorialOverlay";
import { TUTORIAL_STEPS } from "./TutorialSteps";
import IssueDetailModal from "../IssueDetailModal";

export const categories = [
  {
    value: "road",
    label: "Road & Infra",
    icon: MapPin,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "electricity",
    label: "Electricity & Lighting",
    icon: Zap,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "water",
    label: "Water Supply",
    icon: Droplets,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  {
    value: "sanitation",
    label: "Sanitation & Waste",
    icon: Trash2,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "drainage",
    label: "Drainage & Sewer",
    icon: Recycle,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    value: "solid_waste",
    label: "Solid Waste Management",
    icon: Package,
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    value: "public_health",
    label: "Public Health",
    icon: HeartPulse,
    color: "text-red-600 dark:text-red-400",
  },
  {
    value: "other",
    label: "Other",
    icon: MoreHorizontal,
    color: "text-gray-600 dark:text-gray-400",
  },
];

export const statusOptions = [
  {
    value: "all",
    label: "All Statuses",
    icon: Grid,
    color: "text-gray-600 dark:text-gray-400",
  },
  {
    value: "pending",
    label: "Pending Review",
    icon: AlertCircle,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "resolved",
    label: "Resolved",
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
  },
];

export function CitizenDashboard({ onNotificationsClick, unreadCount }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);

  // Custom dropdown tracking hooks
  const [activeDropdown, setActiveDropdown] = useState(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // For testing purpose: unconditionally run every time the dashboard loads
    const timer = setTimeout(() => setIsTutorialActive(true), 800);

    // Smooth Resize Performance Hook: Suspends heavy CSS evaluation mid-drag
    let resizeTimer;
    const handleResize = () => {
      document.body.classList.add("pointer-events-none");
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        document.body.classList.remove("pointer-events-none");
      }, 150); // 150ms debounce clears up GPU stutter instantly
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  const issues = useQuery(
    api.issues.getCitizenDashboardIssues,
    session?.user?.id ? { userId: session.user.id } : "skip",
  );

  console.log("Fetched issues for dashboard:", issues);

  const formattedIssues = issues
    ? issues.map((issue) => ({
        ...issue,
        id: issue._id,
        created_at: new Date(issue.createdAt).toISOString(),
      }))
    : [];

  useEffect(() => {
    if (!selectedIssue || !formattedIssues.length) return;

    const updated = formattedIssues.find((i) => i.id === selectedIssue.id);

    if (updated && JSON.stringify(updated) !== JSON.stringify(selectedIssue)) {
      setSelectedIssue(updated);
    }
  }, [formattedIssues]);

  const filteredIssues = formattedIssues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.issueCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || issue.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" || issue.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: formattedIssues.length,
    pending: formattedIssues.filter((i) => i.status === "pending").length,
    in_progress: formattedIssues.filter((i) => i.status === "in_progress")
      .length,
    resolved: formattedIssues.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#050505] transition-colors duration-700 selection:bg-emerald-500/30 relative">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/20 dark:bg-emerald-900/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-opacity duration-700" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-400/20 dark:bg-teal-900/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-opacity duration-700" />
      </div>

      {/* Prominent Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/90 border-b border-gray-300/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-500">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo + Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <div className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-black p-1.5 shadow-sm border border-gray-200 dark:border-gray-800 group-hover:shadow-md transition-shadow">
              <Image
                src="/logo.png"
                alt="CityCare Logo"
                width={32}
                height={32}
                className="relative z-10 group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent tracking-tight">
              CityCare
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              data-tutorial="report-issue"
              onClick={() => router.push("/citizen/report")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <PlusCircle size={20} strokeWidth={2.5} />
              <span className="hidden sm:inline tracking-wide">
                Report Issue
              </span>
            </button>

            <button
              data-tutorial="notifications"
              onClick={(e) => {
                e.preventDefault();
                console.log("Bell clicked");
                onNotificationsClick?.();
              }}
              className="relative p-2.5 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 group"
              aria-label="Notifications"
            >
              <Bell
                className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                size={22}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[14px] font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <div className="hidden sm:block">
              <ModeToggle />
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                data-tutorial="profile"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 pl-2 pr-4 lg:pr-5 py-1.5 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-white/10 transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-lg shadow-inner">
                  <User size={18} strokeWidth={2.5} className="text-white" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 hidden md:block tracking-wide">
                  {session?.user?.name?.split(" ")[0] || "Profile"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-[#111]/95 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-gray-200/80 dark:border-white/10 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="px-5 py-4 bg-gray-50/50 dark:bg-white/5 border-b border-gray-200/80 dark:border-white/5">
                    <p className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                      {session?.user?.name || "User Name"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsTutorialActive(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-3 rounded-xl text-left text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors mb-1"
                    >
                      <TrendingUp size={16} className="mr-3" />
                      Restart Tutorial
                    </button>
                    <button
                      onClick={() =>
                        signOut({ redirect: true, callbackUrl: "/sign-in" })
                      }
                      className="w-full flex items-center px-4 py-3 rounded-xl text-left text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Greeting Hero */}
        <div className="relative overflow-hidden rounded-[2.5rem] p-[1.5px] bg-gradient-to-br from-emerald-400/60 to-teal-600/60 dark:from-emerald-500/40 dark:to-teal-500/20 mb-12 shadow-2xl group transition-transform duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-700 dark:from-emerald-900 dark:to-teal-950 opacity-90 transition-opacity duration-1000" />

          <div className="relative bg-white/10 dark:bg-black/20 rounded-[calc(2.5rem-1.5px)] p-8 sm:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 h-full">
            {/* Dynamic Background Orbs */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 dark:bg-emerald-400/20 blur-[80px] rounded-full mix-blend-overlay animate-[spin_10s_linear_infinite]" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-300/30 dark:bg-teal-400/20 blur-[60px] rounded-full mix-blend-overlay animate-[spin_8s_linear_infinite_reverse]" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/20 dark:bg-black/30 border border-white/30 dark:border-white/10 shadow-sm mb-6 text-emerald-50 dark:text-emerald-200 text-[11px] sm:text-xs font-bold tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Citizen Portal
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-white mb-5 tracking-tight drop-shadow-md leading-[1.1]">
                Hello, {session?.user?.name?.split(" ")[0] || "there"}! 👋
              </h1>
              <p className="text-emerald-50/90 dark:text-emerald-100/80 text-lg sm:text-xl leading-relaxed font-medium max-w-xl">
                Track your reported civic issues, monitor city progress, and
                stay informed about resolutions—all designed to keep our city
                thriving.
              </p>
            </div>

            {/* Decorative Icon Graphic */}
            <div className="hidden lg:flex relative z-10 right-8">
              <div className="relative w-48 h-48 bg-white/10 dark:bg-black/20 rounded-full border border-white/20 dark:border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-700">
                <div className="absolute inset-2 border border-white/30 dark:border-white/10 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
                <div className="bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-500/20 dark:to-teal-500/20 p-6 rounded-full shadow-inner border border-white/50 dark:border-white/5">
                  <TrendingUp
                    size={48}
                    className="text-emerald-600 dark:text-emerald-300 drop-shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stronger Grounded Stats Cards */}
        <div
          data-tutorial="stats-cards"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-12"
        >
          {[
            {
              label: "Issues Logged",
              value: stats.total,
              color: "emerald",
              gradient:
                "from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10",
              border:
                "border-gray-200/80 dark:border-emerald-500/20 hover:border-emerald-300/80",
              text: "text-emerald-700 dark:text-emerald-400",
              iconBg: "bg-emerald-100/80 dark:bg-emerald-500/20",
              icon: (
                <TrendingUp
                  className="text-emerald-600 dark:text-emerald-400"
                  size={24}
                  strokeWidth={2.5}
                />
              ),
            },
            {
              label: "Pending Review",
              value: stats.pending,
              color: "amber",
              gradient:
                "from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10",
              border:
                "border-gray-200/80 dark:border-amber-500/20 hover:border-amber-300/80",
              text: "text-amber-700 dark:text-amber-400",
              iconBg: "bg-amber-100/80 dark:bg-amber-500/20",
              icon: (
                <Calendar
                  className="text-amber-600 dark:text-amber-400"
                  size={24}
                  strokeWidth={2.5}
                />
              ),
            },
            {
              label: "In Progress",
              value: stats.in_progress,
              color: "blue",
              gradient:
                "from-blue-500/10 to-indigo-500/5 dark:from-blue-500/20 dark:to-indigo-500/10",
              border:
                "border-gray-200/80 dark:border-blue-500/20 hover:border-blue-300/80",
              text: "text-blue-700 dark:text-blue-400",
              iconBg: "bg-blue-100/80 dark:bg-blue-500/20",
              icon: (
                <AlertCircle
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                  strokeWidth={2.5}
                />
              ),
            },
            {
              label: "Resolved",
              value: stats.resolved,
              color: "green",
              gradient:
                "from-green-500/10 to-emerald-500/5 dark:from-green-500/20 dark:to-emerald-500/10",
              border:
                "border-gray-200/80 dark:border-green-500/20 hover:border-green-300/80",
              text: "text-green-700 dark:text-green-400",
              iconBg: "bg-green-100/80 dark:bg-green-500/20",
              icon: (
                <CheckCircle
                  className="text-green-600 dark:text-green-400"
                  size={24}
                  strokeWidth={2.5}
                />
              ),
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`relative bg-white/95 dark:bg-gray-900/40 bg-gradient-to-br ${stat.gradient} p-6 rounded-[2rem] shadow-md border ${stat.border} hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 dark:bg-white/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-bold tracking-wide uppercase mb-2">
                    {stat.label}
                  </p>
                  <p
                    className={`text-4xl sm:text-5xl font-black ${stat.text} drop-shadow-sm`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`${stat.iconBg} p-4 rounded-2xl shadow-inner border border-white/80 dark:border-white/10 group-hover:scale-110 transition-transform duration-300`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Solidified Search & Filters Bar */}
        <div
          data-tutorial="search-filters"
          ref={filterRef}
          className="relative z-20 bg-gray-50/80 dark:bg-[#0c0c0e] rounded-[24px] p-2.5 sm:p-3 mb-10 border border-gray-200/80 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col xl:flex-row gap-3 transition-shadow duration-300 hover:shadow-lg"
        >
          {/* SEARCH INPUT */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400/5 to-teal-500/0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative flex items-center bg-white dark:bg-[#151518] border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden group-focus-within:border-emerald-500/50 group-focus-within:ring-4 ring-emerald-500/10 transition-all duration-300">
              <Search
                className="absolute left-4 text-gray-400 dark:text-gray-500 group-focus-within:text-emerald-500 transition-colors duration-300"
                size={20}
                strokeWidth={2.5}
              />
              <input
                type="text"
                placeholder="Search issues by title or ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none font-medium text-[15px]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">
            {/* STATUS DROPDOWN */}
            <div className="relative flex-1 sm:min-w-[190px]">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "status" ? null : "status",
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-[#151518] border border-gray-200 dark:border-white/5 rounded-2xl text-[15px] font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-300 dark:hover:border-white/10 hover:shadow-md transition-all duration-200 group focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  {/* Dynamically render current status icon */}
                  {(() => {
                    const opt =
                      statusOptions.find((o) => o.value === statusFilter) ||
                      statusOptions[0];
                    const Icon = opt.icon;
                    return (
                      <Icon
                        size={18}
                        strokeWidth={2.5}
                        className={`${opt.color} group-hover:scale-110 transition-transform duration-300`}
                      />
                    );
                  })()}
                  <span className="truncate">
                    {statusOptions.find((o) => o.value === statusFilter)
                      ?.label || "All Statuses"}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${activeDropdown === "status" ? "rotate-180" : ""}`}
                />
              </button>

              {/* Popover */}
              <div
                className={`absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 transition-all duration-200 transform origin-top ${activeDropdown === "status" ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
              >
                <div className="p-2 space-y-1">
                  {statusOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-lg ${isActive ? "bg-white dark:bg-black/50 shadow-sm" : "bg-transparent"}`}
                          >
                            <Icon
                              size={16}
                              strokeWidth={2.5}
                              className={opt.color}
                            />
                          </div>
                          <span>{opt.label}</span>
                        </div>
                        {isActive && (
                          <Check
                            size={16}
                            strokeWidth={3}
                            className={opt.color}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CATEGORY DROPDOWN */}
            <div className="relative flex-1 sm:min-w-[220px]">
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "category" ? null : "category",
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-[#151518] border border-gray-200 dark:border-white/5 rounded-2xl text-[15px] font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:border-gray-300 dark:hover:border-white/10 hover:shadow-md transition-all duration-200 group focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  {(() => {
                    const opt =
                      categoryFilter === "all"
                        ? { icon: Grid, color: "text-gray-500" }
                        : categories.find((o) => o.value === categoryFilter);
                    const Icon = opt.icon || Grid;
                    return (
                      <Icon
                        size={18}
                        strokeWidth={2.5}
                        className={`${opt.color} group-hover:scale-110 transition-transform duration-300`}
                      />
                    );
                  })()}
                  <span className="truncate max-w-[130px] text-left">
                    {categoryFilter === "all"
                      ? "All Categories"
                      : categories.find((o) => o.value === categoryFilter)
                          ?.label}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${activeDropdown === "category" ? "rotate-180" : ""}`}
                />
              </button>

              {/* Popover */}
              <div
                className={`absolute top-full right-0 w-[240px] mt-2 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-y-auto max-h-[300px] z-50 transition-all duration-200 transform origin-top ${activeDropdown === "category" ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
              >
                <div className="p-2 space-y-1">
                  {/* All Categories Option */}
                  <button
                    onClick={() => {
                      setCategoryFilter("all");
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${categoryFilter === "all" ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${categoryFilter === "all" ? "bg-white dark:bg-black/50 shadow-sm" : "bg-transparent"}`}
                      >
                        <Grid
                          size={16}
                          strokeWidth={2.5}
                          className="text-gray-500"
                        />
                      </div>
                      <span>All Categories</span>
                    </div>
                    {categoryFilter === "all" && (
                      <Check
                        size={16}
                        strokeWidth={3}
                        className="text-gray-700 dark:text-white"
                      />
                    )}
                  </button>

                  <div className="h-px bg-gray-200 dark:bg-white/5 my-1 mx-2" />

                  {categories.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = categoryFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setCategoryFilter(opt.value);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-lg ${isActive ? "bg-white dark:bg-black/50 shadow-sm" : "bg-transparent"}`}
                          >
                            <Icon
                              size={16}
                              strokeWidth={2.5}
                              className={opt.color}
                            />
                          </div>
                          <span className="text-left">{opt.label}</span>
                        </div>
                        {isActive && (
                          <Check
                            size={16}
                            strokeWidth={3}
                            className={opt.color}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* View Mode Segmented Control */}
            <div
              data-tutorial="view-toggle"
              className="flex items-center w-full sm:w-auto bg-gray-100 dark:bg-[#18181b] p-1.5 rounded-2xl border border-gray-200/50 dark:border-white/5 shadow-inner"
            >
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 sm:flex-none flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-[#27272a] text-gray-900 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5 dark:ring-white/10"
                    : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5"
                }`}
                aria-label="Grid view"
              >
                <Grid
                  size={18}
                  strokeWidth={viewMode === "grid" ? 3 : 2}
                  className={
                    viewMode === "grid"
                      ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                      : "opacity-80"
                  }
                />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 sm:flex-none flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-white dark:bg-[#27272a] text-gray-900 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/5 dark:ring-white/10"
                    : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5"
                }`}
                aria-label="List view"
              >
                <List
                  size={18}
                  strokeWidth={viewMode === "list" ? 3 : 2}
                  className={
                    viewMode === "list"
                      ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                      : "opacity-80"
                  }
                />
              </button>
            </div>
          </div>
        </div>

        {/* Issues Section */}
        {issues === undefined ? (
          <div
            className={`relative z-10 ${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"
                : "space-y-6 max-w-full mx-auto"
            }`}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={viewMode === "list" ? "h-[220px]" : "h-[450px]"}
              >
                <IssueCardSkeleton />
              </div>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="relative z-10 text-center py-24 bg-white/95 dark:bg-[#0a0a0a]/80 rounded-[2.5rem] border border-gray-200/80 dark:border-white/10 shadow-xl overflow-hidden flex flex-col items-center">
            {/* Background Blur - Added pointer-events-none to prevent interception */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent blur-3xl pointer-events-none"></div>

            <div className="relative p-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-inner mb-6">
              <AlertCircle
                className="text-gray-500 dark:text-gray-400"
                size={56}
                strokeWidth={1.5}
              />
            </div>

            <h3 className="relative z-10 text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
              {issues.length === 0
                ? "Your Dashboard is Empty"
                : "No matching issues"}
            </h3>

            <p className="relative z-10 text-gray-600 dark:text-gray-400 font-medium max-w-sm mb-8 text-[15px]">
              {issues.length === 0
                ? "You haven't reported any civic issues yet. Be the change you want to see in your city."
                : "Try adjusting your filters or search terms to find what you're looking for."}
            </p>

            {issues.length === 0 && (
              <button
                onClick={() => router.push("/citizen/report")}
                className="relative z-10 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300"
              >
                Log Your First Issue
              </button>
            )}
          </div>
        ) : (
          <div
            className={`relative z-10 ${
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"
                : "space-y-6 max-w-full mx-auto"
            }`}
          >
            {filteredIssues.map((issue) => (
              <div key={issue.id}>
                <IssueCard
                  issue={issue}
                  onClick={() => setSelectedIssue(issue)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <TutorialOverlay
        steps={TUTORIAL_STEPS}
        isActive={isTutorialActive}
        onComplete={() => setIsTutorialActive(false)}
      />

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}
