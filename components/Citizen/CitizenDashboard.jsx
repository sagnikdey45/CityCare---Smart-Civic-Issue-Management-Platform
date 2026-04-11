import { useState, useEffect } from "react";
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
} from "lucide-react";
import { IssueDetailModal } from "@/components/IssueDetailModal";
import { IssueCard, IssueCardSkeleton } from "@/components/IssueCard";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ModeToggle } from "../ModeToggle";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TutorialOverlay } from "./TutorialOverlay";
import { TUTORIAL_STEPS } from "./TutorialSteps";

export function CitizenDashboard({
  onReportIssue,
  onNotificationsClick,
  unreadCount,
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isTutorialActive, setIsTutorialActive] = useState(false);

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
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl border-b border-gray-300/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-500">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo + Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <div className="relative overflow-hidden rounded-xl bg-gray-50 dark:bg-black p-1.5 shadow-sm border border-gray-200 dark:border-gray-800 group-hover:shadow-md transition-shadow">
              <Image src="/logo.png" alt="CityCare Logo" width={32} height={32} className="relative z-10 group-hover:scale-105 transition-transform duration-500" />
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
              <span className="hidden sm:inline tracking-wide">Report Issue</span>
            </button>

            <button
              data-tutorial="notifications"
              onClick={onNotificationsClick}
              className="relative p-2.5 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 group"
              aria-label="Notifications"
            >
              <Bell
                className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                size={22}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
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
                <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-[#111]/95 backdrop-blur-3xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-gray-200/80 dark:border-white/10 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
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
                       onClick={() => signOut({ redirect: true, callbackUrl: "/sign-in" })}
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
          
          <div className="relative bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-[calc(2.5rem-1.5px)] p-8 sm:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 h-full">
            
            {/* Dynamic Background Orbs */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 dark:bg-emerald-400/20 blur-[80px] rounded-full mix-blend-overlay animate-[spin_10s_linear_infinite]" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-300/30 dark:bg-teal-400/20 blur-[60px] rounded-full mix-blend-overlay animate-[spin_8s_linear_infinite_reverse]" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm mb-6 text-emerald-50 dark:text-emerald-200 text-[11px] sm:text-xs font-bold tracking-widest uppercase">
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
                Track your reported civic issues, monitor city progress, and stay informed about resolutions—all designed to keep our city thriving.
              </p>
            </div>

            {/* Decorative Icon Graphic */}
            <div className="hidden lg:flex relative z-10 right-8">
               <div className="relative w-48 h-48 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full border border-white/20 dark:border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-700">
                  <div className="absolute inset-2 border border-white/30 dark:border-white/10 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
                  <div className="bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-500/20 dark:to-teal-500/20 p-6 rounded-full shadow-inner border border-white/50 dark:border-white/5">
                     <TrendingUp size={48} className="text-emerald-600 dark:text-emerald-300 drop-shadow-sm" />
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* Stronger Grounded Stats Cards */}
        <div data-tutorial="stats-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-12">
          {[
            {
              label: "Issues Logged",
              value: stats.total,
              color: "emerald",
              gradient: "from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10",
              border: "border-gray-200/80 dark:border-emerald-500/20 hover:border-emerald-300/80",
              text: "text-emerald-700 dark:text-emerald-400",
              iconBg: "bg-emerald-100/80 dark:bg-emerald-500/20",
              icon: <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} strokeWidth={2.5} />,
            },
            {
              label: "Pending Review",
              value: stats.pending,
              color: "amber",
              gradient: "from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10",
              border: "border-gray-200/80 dark:border-amber-500/20 hover:border-amber-300/80",
              text: "text-amber-700 dark:text-amber-400",
              iconBg: "bg-amber-100/80 dark:bg-amber-500/20",
              icon: <Calendar className="text-amber-600 dark:text-amber-400" size={24} strokeWidth={2.5} />,
            },
            {
              label: "In Progress",
              value: stats.in_progress,
              color: "blue",
              gradient: "from-blue-500/10 to-indigo-500/5 dark:from-blue-500/20 dark:to-indigo-500/10",
              border: "border-gray-200/80 dark:border-blue-500/20 hover:border-blue-300/80",
              text: "text-blue-700 dark:text-blue-400",
              iconBg: "bg-blue-100/80 dark:bg-blue-500/20",
              icon: <AlertCircle className="text-blue-600 dark:text-blue-400" size={24} strokeWidth={2.5} />,
            },
            {
              label: "Resolved",
              value: stats.resolved,
              color: "green",
              gradient: "from-green-500/10 to-emerald-500/5 dark:from-green-500/20 dark:to-emerald-500/10",
              border: "border-gray-200/80 dark:border-green-500/20 hover:border-green-300/80",
              text: "text-green-700 dark:text-green-400",
              iconBg: "bg-green-100/80 dark:bg-green-500/20",
              icon: <CheckCircle className="text-green-600 dark:text-green-400" size={24} strokeWidth={2.5} />,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`relative bg-white/95 dark:bg-gray-900/40 bg-gradient-to-br ${stat.gradient} backdrop-blur-2xl p-6 rounded-[2rem] shadow-md border ${stat.border} hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 dark:bg-white/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-bold tracking-wide uppercase mb-2">
                    {stat.label}
                  </p>
                  <p className={`text-4xl sm:text-5xl font-black ${stat.text} drop-shadow-sm`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.iconBg} p-4 rounded-2xl shadow-inner border border-white/80 dark:border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Solidified Search & Filters Bar */}
        <div data-tutorial="search-filters" className="relative z-10 bg-white/95 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-3xl p-5 mb-10 border border-gray-200/80 dark:border-white/10 shadow-lg dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col xl:flex-row gap-4">
            
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative flex items-center">
                <Search
                  className="absolute left-4 text-gray-500 dark:text-gray-400 group-focus-within:text-emerald-600 transition-colors"
                  size={20}
                  strokeWidth={2.5}
                />
                <input
                  type="text"
                  placeholder="Search your issues by title or ticket ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50/80 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner backdrop-blur-sm transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="px-4 py-3.5 bg-gray-50/80 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-800 dark:text-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner backdrop-blur-sm cursor-pointer appearance-none min-w-[160px]"
               >
                 <option value="all">🚦 All Statuses</option>
                 <option value="pending">⏳ Pending Review</option>
                 <option value="in_progress">⚙️ In Progress</option>
                 <option value="resolved">✅ Resolved</option>
                 <option value="rejected">❌ Rejected</option>
               </select>

               <select
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="px-4 py-3.5 bg-gray-50/80 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-800 dark:text-gray-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-inner backdrop-blur-sm cursor-pointer appearance-none min-w-[200px]"
               >
                 <option value="all">📋 All Categories</option>
                 <option value="road">🛣️ Road & Infra</option>
                 <option value="lighting">💡 Street Lighting</option>
                 <option value="waste">🗑️ Waste Management</option>
                 <option value="water">💧 Water Supply</option>
                 <option value="other">📌 Other</option>
               </select>

               {/* View Mode Toggle */}
               <div data-tutorial="view-toggle" className="flex bg-gray-100 dark:bg-black/60 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-inner">
                 <button
                   onClick={() => setViewMode("grid")}
                   className={`p-2.5 rounded-xl transition-all duration-300 ${
                     viewMode === "grid"
                       ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                       : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                   }`}
                   aria-label="Grid view"
                 >
                   <Grid size={20} strokeWidth={2.5} />
                 </button>
                 <button
                   onClick={() => setViewMode("list")}
                   className={`p-2.5 rounded-xl transition-all duration-300 ${
                     viewMode === "list"
                       ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                       : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                   }`}
                   aria-label="List view"
                 >
                   <List size={20} strokeWidth={2.5} />
                 </button>
               </div>
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
              <div key={i} className={viewMode === "list" ? "h-[220px]" : "h-[450px]"}>
                <IssueCardSkeleton />
              </div>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="relative z-10 text-center py-24 bg-white/95 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl rounded-[2.5rem] border border-gray-200/80 dark:border-white/10 shadow-xl overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent blur-3xl"></div>
            <div className="relative p-6 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-inner mb-6">
              <AlertCircle
                className="text-gray-500 dark:text-gray-400"
                size={56}
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
              {issues.length === 0
                ? "Your Dashboard is Empty"
                : "No matching issues"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium max-w-sm mb-8 text-[15px]">
              {issues.length === 0
                ? "You haven't reported any civic issues yet. Be the change you want to see in your city."
                : "Try adjusting your filters or search terms to find what you're looking for."}
            </p>
            {issues.length === 0 && (
              <button
                onClick={onReportIssue}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300"
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
