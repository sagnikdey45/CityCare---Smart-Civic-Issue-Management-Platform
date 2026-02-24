"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, LogIn, Shield } from "lucide-react";

export function PublicNavbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        localStorage.removeItem("realExpiry");
      }, remaining);

      return () => clearTimeout(timer);
    } else {
      signOut({ redirect: true, callbackUrl: "/sign-in" });
      localStorage.removeItem("realExpiry");
    }
  }, [session?.realExpiry]);

  // Defensive: avoid null object access
  const safeSession = session && typeof session === "object" ? session : null;
  const user = safeSession?.user;
  const userName = user?.name?.split(" ")[0] || "User";
  const userRole = user?.role || "citizen";

  // Loading
  if (status === "loading") {
    return (
      <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-100 p-4">
        <div className="max-w-8xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="CityCare Logo" width={36} height={36} />
            <span className="text-lg font-semibold text-slate-700">
              CityCare
            </span>
          </div>
          <p className="text-sm text-gray-500">Loading session...</p>
        </div>
      </nav>
    );
  }

  // 🚫 Logged out or expired
  if (status === "unauthenticated" || !user) {
    return (
      <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center group">
                <Image
                  src="/logo.png"
                  alt="CityCare Logo"
                  width={40}
                  height={40}
                />
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-800 bg-clip-text text-transparent">
                  CityCare
                </span>
              </div>
            </Link>

            {/* Desktop Buttons */}
            <div className="hidden md:flex gap-4 items-center space-x-2">
              <button
                className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                onClick={() => router.push("/admin")}
              >
                <Shield size={20} className="mr-2" />
                Admin Dashboard
              </button>

              <button
                className="ml-4 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all"
                onClick={() => router.push("/sign-in")}
              >
                <LogIn size={18} className="inline-block mr-2" />
                Sign In
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/admin")}
                  className="w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                >
                  <Shield size={20} className="mr-2" />
                  Admin Dashboard
                </button>

                <button
                  onClick={() => {
                    router.push("/sign-in");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex justify-center text-left px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Sign In
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
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center group">
              <Image
                src="/logo.png"
                alt="CityCare Logo"
                width={40}
                height={40}
              />
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-800 bg-clip-text text-transparent">
                CityCare
              </span>
            </div>
          </Link>

          {/* Desktop Authenticated Actions */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-gray-700 font-medium capitalize">
              Hi, {userName} ({userRole.replace("_", " ")})
            </span>

            <button
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all"
              onClick={() => router.push(`/${userRole.replace("_", "-")}/`)}
            >
              Dashboard
            </button>

            <button
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
              onClick={() => {
                signOut({ redirect: true, callbackUrl: "/sign-in" });
                localStorage.removeItem("realExpiry");
              }}
            >
              Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Authenticated Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2 text-center">
              <p className="text-gray-700 font-medium">
                Hi, {userName} ({userRole})
              </p>

              <button
                onClick={() =>
                  router.push(`/${userRole.replace("_", "-")}/dashboard`)
                }
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Dashboard
              </button>

              <button
                onClick={() => {
                  signOut({ redirect: true, callbackUrl: "/sign-in" });
                  localStorage.removeItem("realExpiry");
                }}
                className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
