"use client";
import { CitizenGamificationSection } from "@/components/Citizen/GamificationSection";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ModeToggle } from "@/components/ModeToggle";
import { useSession, signOut } from "next-auth/react";
import { PlusCircle, Bell, User, LogOut, TrendingUp } from "lucide-react";

const GamificationPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
            onClick={() => router.push("/citizen")}
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
              onClick={() => router.push("/citizen/report")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <PlusCircle size={20} strokeWidth={2.5} />
              <span className="hidden sm:inline tracking-wide">
                Report Issue
              </span>
            </button>

            <button
              className="relative p-2.5 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 group"
              aria-label="Notifications"
            >
              <Bell
                className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                size={22}
              />
            </button>

            <div className="hidden sm:block">
              <ModeToggle />
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
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
                      onClick={() => router.push("/citizen")}
                      className="w-full flex items-center px-4 py-3 rounded-xl text-left text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors mb-1"
                    >
                      <TrendingUp size={16} className="mr-3" />
                      Dashboard
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

      <div className="max-w-[90rem] mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <CitizenGamificationSection />
      </div>
    </div>
  );
};

export default GamificationPage;
