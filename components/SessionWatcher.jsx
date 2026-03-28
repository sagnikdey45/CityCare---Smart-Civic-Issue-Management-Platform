"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionWatcher() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Step 1: Save expiry time locally
  useEffect(() => {
    if (session?.realExpiry) {
      localStorage.setItem("realExpiry", session.realExpiry);
    }
  }, [session?.realExpiry]);

  // Step 2: Check if expired even before session loads
  useEffect(() => {
    const expiry = localStorage.getItem("realExpiry");
    if (expiry) {
      const expiryTime = new Date(expiry).getTime();
      if (Date.now() > expiryTime) {
        localStorage.removeItem("realExpiry");
        localStorage.setItem("sessionExpired", "true");
        const role =
          session?.user?.role || localStorage.getItem("lastRole") || "citizen";

        if (role === "citizen") {
          router.replace(`/sign-in?expired=true&role=${role}`);
        } else {
          router.replace(`/staff/sign-in?expired=true&role=${role}`);
        }
      }
    }
  }, []);

  // Step 3: Setup auto sign-out when session active
  useEffect(() => {
    if (!session?.realExpiry) return;

    const expiryTime = new Date(session.realExpiry).getTime();
    const now = Date.now();
    const remaining = expiryTime - now;

    const logoutAndRedirect = () => {
      console.warn("Session expired — redirecting...");
      localStorage.removeItem("realExpiry");
      localStorage.setItem("sessionExpired", "true");
      signOut({ redirect: true, callbackUrl: "/sign-in?expired=true" });
    };

    if (remaining > 0) {
      const timer = setTimeout(logoutAndRedirect, remaining);
      return () => clearTimeout(timer);
    } else {
      logoutAndRedirect();
    }
  }, [session?.realExpiry]);

  // Step 4: Handle case where user already expired (no session)
  useEffect(() => {
    if (status === "unauthenticated") {
      const expired = localStorage.getItem("sessionExpired");
      if (expired === "true") {
        localStorage.removeItem("sessionExpired");
        const role =
          session?.user?.role || localStorage.getItem("lastRole") || "citizen";

        router.replace(`/sign-in?expired=true&role=${role}`);
      }
    }
  }, [status]);

  return null;
}
