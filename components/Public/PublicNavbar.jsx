"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, LogIn, Shield, LogOut, LayoutDashboard } from "lucide-react";
import { ModeToggle } from "../ModeToggle";

export function PublicNavbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener for dynamic navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto logout when session expires
  useEffect(() => {
    if (!session?.realExpiry) return;

    const expiryTime = new Date(session.realExpiry).getTime();
    const now = Date.now();
    const remaining = expiryTime - now;

    if (remaining > 0) {
      const timer = setTimeout(() => {
        console.warn("Session expired — logging out.");
        signOut({ redirect: true, callbackUrl: "/sign-in" });
      }, remaining);

      return () => clearTimeout(timer);
    } else {
      signOut({ redirect: true, callbackUrl: "/sign-in" });
    }
  }, [session?.realExpiry]);

  // Defensive: avoid null object access
  const safeSession = session && typeof session === "object" ? session : null;
  const user = safeSession?.user;
  const userName = user?.name?.split(" ")[0] || "User";
  const userRole = user?.role || "citizen";

  const navbarClasses = `sticky top-0 z-50 transition-all duration-500 ${
    scrolled
      ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(20,184,166,0.15)] dark:shadow-none border-b border-teal-100/50 dark:border-teal-900/30"
      : "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-gray-100/50 dark:border-slate-800/50"
  }`;

  // Loading state
  if (status === "loading") {
    return (
      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-800 animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  // 🚫 Logged out or expired
  if (status === "unauthenticated" || !user) {
    return (
      <nav className={navbarClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 p-1 shadow-sm border border-gray-100 dark:border-slate-700 group-hover:shadow-md transition-all">
                  <Image
                    src="/logo.png"
                    alt="CityCare Logo"
                    width={36}
                    height={36}
                    className="transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="ml-3 text-2xl font-extrabold tracking-tight bg-gradient-to-br from-teal-500 via-cyan-600 to-emerald-600 dark:from-teal-300 dark:via-cyan-300 dark:to-emerald-300 bg-clip-text text-transparent">
                  CityCare
                </span>
              </div>
            </Link>

            {/* Desktop Buttons */}
            <div className="hidden md:flex gap-4 items-center">
              <ModeToggle />
              <button
                className="group flex items-center px-5 py-2.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200/60 dark:border-slate-700/60 rounded-xl hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-200 dark:hover:border-orange-800 transform hover:-translate-y-0.5 transition-all font-bold text-sm tracking-wide"
                onClick={() => router.push("/admin")}
              >
                <Shield size={16} className="mr-2 text-orange-500 group-hover:text-orange-600 transition-colors" />
                Admin Access
              </button>

              <button
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/30 transform hover:-translate-y-0.5 transition-all text-sm tracking-wide"
                onClick={() => router.push("/sign-in")}
              >
                <LogIn size={16} className="inline-block mr-2" />
                Sign In / Join
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-3">
              <ModeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl absolute left-0 right-0 px-4 shadow-2xl rounded-b-3xl">
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/admin")}
                  className="w-full flex justify-center items-center px-6 py-3.5 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-white rounded-xl font-bold border border-gray-200 dark:border-slate-700"
                >
                  <Shield size={18} className="mr-2 text-orange-500" />
                  Admin Access
                </button>

                <button
                  onClick={() => {
                    router.push("/sign-in");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex justify-center items-center px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold shadow-md"
                >
                  <LogIn size={18} className="mr-2" />
                  Sign In / Join
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // ✅ Authenticated
  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 p-1 shadow-sm border border-gray-100 dark:border-slate-700 group-hover:shadow-md transition-all">
                <Image
                  src="/logo.png"
                  alt="CityCare Logo"
                  width={36}
                  height={36}
                  className="transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="ml-3 text-2xl font-extrabold tracking-tight bg-gradient-to-br from-teal-500 via-cyan-600 to-emerald-600 dark:from-teal-300 dark:via-cyan-300 dark:to-emerald-300 bg-clip-text text-transparent">
                CityCare
              </span>
            </div>
          </Link>

          {/* Desktop Authenticated Actions */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-6 pr-6 border-r border-gray-200 dark:border-slate-700">
              <ModeToggle />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40 border border-teal-200 dark:border-teal-800 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-400 font-extrabold shadow-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white leading-none">
                    {userName}
                  </span>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mt-1">
                    {userRole.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/30 transform hover:-translate-y-0.5 transition-all text-sm"
                onClick={() => router.push(`/${userRole.replace("_", "-")}/`)}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border border-gray-200/60 dark:border-slate-700/60 hover:border-red-200 dark:hover:border-red-800/50 rounded-xl font-bold transition-all text-sm"
                onClick={() =>
                  signOut({ redirect: true, callbackUrl: "/sign-in" })
                }
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <ModeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Authenticated Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl absolute left-0 right-0 px-4 shadow-2xl rounded-b-3xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40 border border-teal-200 dark:border-teal-800 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-400 font-extrabold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                    {userName}
                  </span>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
                    {userRole.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    router.push(`/${userRole.replace("_", "-")}/`);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold shadow-md"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>

                <button
                  onClick={() =>
                    signOut({ redirect: true, callbackUrl: "/sign-in" })
                  }
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-xl font-bold border border-gray-200 dark:border-slate-700"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
