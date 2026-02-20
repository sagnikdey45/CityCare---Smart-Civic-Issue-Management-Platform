"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="
        group relative w-10 h-10 rounded-full 
        border border-emerald-200/60 dark:border-emerald-700/60 
        shadow-md hover:shadow-lg 
        transition-all duration-300 transform 
        hover:scale-110 active:scale-95 overflow-hidden
        focus:outline-none focus:ring-2 focus:ring-emerald-400/40
        backdrop-blur-sm
      "
    >
      {/* Gradient background */}
      <div
        className="
          absolute inset-0 
          bg-gradient-to-br from-green-400 to-emerald-500 
          dark:from-emerald-700 dark:to-green-900 
          transition-all duration-500
        "
      />

      {/* Hover shimmer */}
      <div
        className="
          absolute inset-0 
          bg-gradient-to-r from-transparent via-white/30 to-transparent 
          -translate-x-full group-hover:translate-x-full 
          transition-transform duration-1000
        "
      />

      {/* Icon container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Sun icon */}
        <Sun
          className={`absolute w-4 h-4 text-white transition-all duration-500 ${
            resolvedTheme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-180 scale-50"
          }`}
          strokeWidth={2.5}
        />

        {/* Moon icon */}
        <Moon
          className={`absolute w-4 h-4 text-white transition-all duration-500 ${
            resolvedTheme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-180 scale-50"
          }`}
          strokeWidth={2.5}
        />
      </div>

      {/* Click ripple */}
      <div
        className="
          absolute inset-0 rounded-full 
          bg-white/20 scale-0 group-active:scale-100 
          transition-transform duration-300
        "
      />
    </button>
  );
}
