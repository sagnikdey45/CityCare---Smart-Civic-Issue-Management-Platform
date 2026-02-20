"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight } from "lucide-react";

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

import LoginRedirect from "@/components/Onboarding/LoginRedirect";

export default function CitizenLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dbRole, setDbRole] = useState(null);
  const [dbUser, setDbUser] = useState(null);

  /* -----------------------------------
     Load User From Convex (Source Truth)
  ------------------------------------ */
  const loadUserFromDB = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const user = await fetchQuery(api.users.getUserByEmail, {
        email: session.user.email,
      });

      if (!user) {
        router.replace("/sign-in");
        return;
      }

      setDbUser(user);
      setDbRole(user.role);
    } catch (err) {
      console.error("Convex user fetch error:", err);
      router.replace("/sign-in");
    }
  }, [session, router]);

  /* -----------------------------------
     Initial Auth + DB Load
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
     Loading Screen
  ------------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-300 transition-colors">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>

          {/* Text */}
          <p className="text-gray-800 dark:text-white text-lg">
            Loading Citizen Dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* -----------------------------------
     Not Logged In
  ------------------------------------ */
  if (status === "unauthenticated") {
    return <LoginRedirect />;
  }

  /* -----------------------------------
     Invalid DB User
  ------------------------------------ */
  if (!dbUser) {
    return <LoginRedirect />;
  }

  /* -----------------------------------
     Role Restriction
  ------------------------------------ */
  if (dbRole !== "citizen") {
    return (
      <div
        className="min-h-screen flex items-center justify-center 
        bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 
        dark:from-dark-300 dark:via-dark-200 dark:to-dark-400 p-6 transition-colors"
      >
        <div
          className="bg-white border border-red-200 rounded-3xl p-8 max-w-md w-full text-center shadow-lg 
          dark:bg-dark-400/70 dark:border-red-500/30"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center 
              bg-red-100 border border-red-200 
              dark:bg-red-500/20 dark:border-red-500/30"
            >
              <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-gray-900 dark:text-white mb-4 text-xl font-semibold">
            Access Denied
          </h2>

          {/* Message */}
          <p className="text-gray-600 dark:text-dark-600 mb-6 leading-relaxed">
            Hello{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {dbUser.fullName}
            </span>
            , you don’t have permission to access the Citizen Dashboard. Please
            continue to your{" "}
            <span className="text-emerald-600 font-semibold capitalize">{dbRole.replace("_", " ")}</span>{" "}
            dashboard.
          </p>

          {/* Button */}
          <button
            onClick={() => router.push(`/${dbRole.replace("_", "-")}`)}
            className="flex items-center justify-center gap-2 w-full 
            bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl 
            transition-all duration-300 shadow-md hover:shadow-emerald-500/25"
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
