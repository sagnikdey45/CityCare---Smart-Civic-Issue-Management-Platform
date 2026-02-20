"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

const RedirectPage = ({
  redirectTo = "/",
  delay = 2500,
  children,
}) => {
  const [counter, setCounter] = useState(Math.ceil(delay / 1000));
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      const startTime = Date.now();
      const endTime = startTime + delay;

      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = Math.max(endTime - now, 0);

        setProgress(Math.min((elapsed / delay) * 100, 100));
        setCounter(Math.ceil(remaining / 1000));

        if (now >= endTime) {
          clearInterval(interval);
          router.push(redirectTo);
        }
      }, 100); // updates every 100ms

      return () => clearInterval(interval);
    }
  }, [status, router, redirectTo, delay]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (status === "authenticated") {
    const greeting = session?.user?.name
      ? `Welcome back, ${session.user.name}!`
      : "Welcome back!";

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-md w-full p-8 mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* Spinner */}
            <div className="mb-6 flex justify-center items-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
            </div>

            {/* Greeting */}
            <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
              {greeting}
            </h1>

            {/* Redirecting message */}
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Redirecting you to your dashboard
              {counter > 0 ? ` in ${counter}...` : "..."}
            </p>

            {/* Custom Progress Bar */}
            <div className="w-64 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-8">
              <div
                className="h-3 bg-blue-600 dark:bg-blue-400 transition-[width] duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Fallback link */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If you&apos;re not redirected automatically,{" "}
              <span
                onClick={() => router.push(redirectTo)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer"
              >
                click here
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RedirectPage;
