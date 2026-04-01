"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default function LoginRedirect({ role = "citizen" }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function redirectUser() {
      // Not logged in → Go login
      if (status === "unauthenticated") {
        if (role === "admin") {
          router.replace("/staff/sign-in");
        } else {
          router.replace("/sign-in");
        }
        return;
      }

      // Still loading
      if (status !== "authenticated") return;

      try {
        const email = session?.user?.email;

        if (!email) {
          if (role === "admin") {
            router.replace("/staff/sign-in");
          } else {
            router.replace("/sign-in");
          }
          return;
        }

        // 🔹 Fetch from Convex (Source of Truth)
        const user = await fetchQuery(api.users.getUserByEmail, {
          email,
        });

        if (!user) {
          if (role === "admin") {
            router.replace("/staff/sign-in");
          } else {
            router.replace("/sign-in");
          }
          return;
        }

        // 🔹 Role-based redirect
        switch (user.role) {
          case "citizen":
            router.replace("/citizen");
            break;

          case "unit_officer":
            router.replace("/unit-officer");
            break;

          case "field_officer":
            router.replace("/field-officer");
            break;

          case "admin":
            router.replace("/admin");
            break;

          default:
            if (role === "admin") {
              router.replace("/staff/sign-in");
            } else {
              router.replace("/sign-in");
            }
        }
      } catch (err) {
        console.error("Login redirect error:", err);
        if (role === "admin") {
          router.replace("/staff/sign-in");
        } else {
          router.replace("/sign-in");
        }
      }
    }

    redirectUser();
  }, [status, session, router]);

  /* Loading UI */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-300">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>

        <p className="text-gray-700 dark:text-white">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
