"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight } from "lucide-react";

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

import LoginRedirect from "@/components/Onboarding/LoginRedirect";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dbRole, setDbRole] = useState(null);
  const [dbUser, setDbUser] = useState(null);

  /* -----------------------------------
     Load User From Convex
  ------------------------------------ */
  const loadUserFromDB = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const user = await fetchQuery(api.users.getUserByEmail, {
        email: session.user.email,
      });

      if (!user) {
        router.replace("/staff/sign-in");
        return;
      }

      setDbUser(user);
      setDbRole(user.role);
    } catch (err) {
      console.error("Convex user fetch error:", err);
      router.replace("/staff/sign-in");
    }
  }, [session, router]);

  /* -----------------------------------
     Initial Load
  ------------------------------------ */
  useEffect(() => {
    if (status === "authenticated") {
      loadUserFromDB().finally(() => setLoading(false));
    }

    if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, loadUserFromDB]);

  /* -----------------------------------
     Loading Screen (Enhanced)
  ------------------------------------ */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-emerald-50 via-white to-slate-100
      dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="relative">
            <div className="w-14 h-14 border-4 border-emerald-500/30 rounded-full"></div>
            <div className="absolute inset-0 w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>

          {/* Text */}
          <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* -----------------------------------
     Not Logged In
  ------------------------------------ */
  if (status === "unauthenticated") {
    return <LoginRedirect role="admin" />;
  }

  /* -----------------------------------
     Invalid User
  ------------------------------------ */
  if (!dbUser) {
    return <LoginRedirect role="admin" />;
  }

  /* -----------------------------------
     Role Restriction
  ------------------------------------ */
  if (dbRole !== "admin") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6
      bg-gradient-to-br from-emerald-50 via-white to-slate-100
      dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"
      >
        <div
          className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl
        border border-slate-200 dark:border-slate-700
        rounded-3xl p-8 max-w-md w-full text-center shadow-xl"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center
            bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700"
            >
              <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Access Denied
          </h2>

          {/* Message */}
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Hello{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {dbUser.fullName}
            </span>
            , you don’t have permission to access the Admin Dashboard. Please
            continue to your{" "}
            <span className="text-emerald-600 font-semibold capitalize">
              {dbRole.replace("_", " ")}
            </span>{" "}
            dashboard.
          </p>

          {/* Button */}
          <button
            onClick={() => router.push(`/${dbRole.replace("_", "-")}`)}
            className="flex items-center justify-center gap-2 w-full
            bg-gradient-to-r from-emerald-500 to-emerald-600
            hover:from-emerald-600 hover:to-emerald-700
            text-white px-6 py-3 rounded-xl
            transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  /* -----------------------------------
     Authorized
  ------------------------------------ */
  return <>{children}</>;
}
