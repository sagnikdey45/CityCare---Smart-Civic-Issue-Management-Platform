"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Lock,
  ChevronDown,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  Sun,
  Moon,
  Building2,
  Fingerprint,
  MapPin,
  Users,
  Activity,
  HardHat,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import "@/styles/staff.css";

import citycareLogo from "@/public/logo.png";
import citycareBg from "@/public/citycare-bg.jpeg";
import citycareBgDark from "@/public/citycare-bg-dark.jpeg";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useTheme } from "next-themes";
import { signIn, useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import RedirectPage from "./Redirect";

const ROLES = [
  { value: "city_admin", label: "City Admin", icon: MapPin },
  { value: "admin", label: "System Admin", icon: Shield },
];

const STATS = [
  { icon: MapPin, value: "12,400+", label: "Issues Resolved" },
  { icon: Users, value: "850+", label: "Active Officers" },
  { icon: Activity, value: "99.9%", label: "System Uptime" },
];

const StaffSignIn = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const dropdownRef = useRef(null);

  const showAlert = searchParams.get("expired") === "true";

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: searchParams.get("role") || "admin",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,

        email: session.user.email || prev.email,
        role: session.user.role || prev.role,
      }));
    }
  }, [session]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const roleData = await fetchQuery(api.users.getUserByEmail, {
        email: formData.email,
      });

      if (!roleData) {
        toast.error("Account not found");
        setError("Account not found");
        return;
      }

      // Compare role
      if (roleData.role !== formData.role) {
        toast.error("Selected role does not match your account");
        setError("Selected role does not match your account");
        return;
      }
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        setError("Invalid email or password");
        return;
      }

      toast.success("Login successful!");

      localStorage.setItem("lastRole", formData.role);

      // Just redirect → layout will validate role
      router.push(`/${formData.role.replace("_", "-")}/`);
    } catch (err) {
      console.error("Error during sign-in:", err);
      toast.error("Something went wrong. Please try again.");
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.value === formData.role);

  return (
    <RedirectPage redirectTo={`/${formData.role.replace("_", "-")}/`}>
      <div className="flex min-h-screen">
        {/* LEFT — City Image Column */}
        <div className="relative hidden lg:flex lg:w-[55%] xl:w-[58%]">
          {/* Background Image */}
          <Image
            src={citycareBg}
            alt="Smart city at night"
            fill
            priority
            className="flex object-cover dark:hidden"
          />
          <Image
            src={citycareBgDark}
            alt="Smart city at night"
            fill
            priority
            className="hidden dark:flex object-cover"
          />
          {/* Light mode: dark cinematic overlay with green tint — keeps city visible but readable */}
          <div
            className="absolute inset-0 block dark:hidden"
            style={{
              background:
                "linear-gradient(to right, hsl(160 30% 8% / 0.72), hsl(160 30% 8% / 0.45), hsl(160 30% 8% / 0.75))",
            }}
          />
          <div
            className="absolute inset-0 block dark:hidden"
            style={{
              background:
                "linear-gradient(to top, hsl(160 30% 8% / 0.8), transparent, hsl(160 30% 8% / 0.3))",
            }}
          />
          <div
            className="absolute inset-0 block dark:hidden"
            style={{ background: "hsl(152 76% 34% / 0.1)" }}
          />

          {/* Dark mode: deep, immersive overlays */}
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              background:
                "linear-gradient(to right, hsl(0 0% 0% / 0.75), hsl(0 0% 0% / 0.4), hsl(0 0% 0% / 0.8))",
            }}
          />
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              background:
                "linear-gradient(to top, hsl(0 0% 0% / 0.85), transparent, hsl(0 0% 0% / 0.35))",
            }}
          />
          <div
            className="absolute inset-0 hidden dark:block"
            style={{ background: "hsl(152 76% 34% / 0.15)" }}
          />

          {/* Content */}
          <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-14">
            {/* Top */}
            <div className="animate-fade-in-up">
              <Link className="flex items-center gap-3" href={"/"}>
                <Image
                  src={citycareLogo}
                  alt="CityCare Logo"
                  width={60}
                  height={60}
                />
                <span
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "hsl(0 0% 100%)" }}
                >
                  CityCare
                </span>
              </Link>
              {/* <div className="flex items-center gap-3"></div> */}
            </div>

            {/* Center text */}
            <div className="max-w-lg space-y-6 animate-fade-in-up delay-200">
              <div className="flex items-center gap-2">
                <div
                  className="h-px w-8"
                  style={{ background: "hsl(152 76% 50%)" }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-[0.25em]"
                  style={{ color: "hsl(152 76% 50%)" }}
                >
                  Civic Infrastructure Platform
                </span>
              </div>
              <h2
                className="text-4xl font-bold leading-[1.15] xl:text-5xl"
                style={{ color: "hsl(0 0% 100%)" }}
              >
                Smarter cities.
                <br />
                <span style={{ color: "hsl(152 76% 50%)" }}>Stronger</span>{" "}
                communities.
              </h2>
              <p
                className="text-lg leading-relaxed"
                style={{ color: "hsl(0 0% 100% / 0.6)" }}
              >
                Manage civic grievances, coordinate field teams, and deliver
                public services with precision and accountability.
              </p>
            </div>

            {/* Stats bar */}
            <div className="animate-fade-in-up delay-400">
              <div
                className="flex gap-8 rounded-xl border px-6 py-4 backdrop-blur-md"
                style={{
                  background: "hsl(0 0% 100% / 0.08)",
                  borderColor: "hsl(0 0% 100% / 0.12)",
                }}
              >
                {STATS.map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ background: "hsl(152 76% 34% / 0.25)" }}
                    >
                      <stat.icon
                        className="h-4 w-4"
                        style={{ color: "hsl(152 76% 50%)" }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "hsl(0 0% 100%)" }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "hsl(0 0% 100% / 0.5)" }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Sign-In Form Column */}
        <div
          className="relative flex flex-1 flex-col items-center justify-center overflow-visible px-6 py-12 lg:px-12 xl:px-20"
          style={{ zIndex: 10 }}
        >
          {/* Subtle bg glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div
              className="animate-float-glow absolute -top-24 right-0 h-80 w-80 rounded-full blur-3xl"
              style={{
                background: isDark
                  ? "hsl(152 70% 42% / 0.08)"
                  : "hsl(152 76% 34% / 0.06)",
              }}
            />
            <div
              className="animate-float-glow absolute -bottom-24 left-0 h-64 w-64 rounded-full blur-3xl"
              style={{
                background: isDark
                  ? "hsl(170 75% 42% / 0.06)"
                  : "hsl(170 80% 40% / 0.04)",
                animationDelay: "2.5s",
              }}
            />
          </div>

          <div className="w-full max-w-[420px] space-y-7">
            {/* Mobile logo + theme toggle */}
            <div className="flex items-center justify-between animate-fade-in-up">
              <Link className="flex items-center gap-3 lg:hidden" href={"/"}>
                <Image
                  src={citycareLogo}
                  alt="CityCare Logo"
                  width={20}
                  height={20}
                />
                <span className="text-lg font-bold text-foreground">
                  CityCare
                </span>
              </Link>
              {mounted && (
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="rounded-lg border border-border p-2 text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {/* Badge */}
            <div className="flex justify-center animate-fade-in-up delay-100">
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Staff Portal
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2 text-center animate-fade-in-up delay-200">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Secure Access
              </h1>
              <p className="text-sm text-muted-foreground">
                Authorized personnel only. Access restricted dashboards.
              </p>
            </div>

            {/* Alert */}
            {showAlert && (
              <Alert className="mb-6 border-yellow-400 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100">
                <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-300" />
                <div>
                  <AlertTitle>Session Expired</AlertTitle>
                  <AlertDescription>
                    Your session has expired. Please sign in again to continue.
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Dropdown */}
              <div>
                <label className="shad-input-label block mb-2 text-slate-800 dark:text-white">
                  Role
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    onBlur={() =>
                      setTimeout(() => {
                        setShowRoleDropdown(false);
                      }, 150)
                    }
                    className="w-full bg-white dark:bg-dark-400 
               border border-emerald-300 dark:border-emerald-700
               rounded-lg px-4 py-3 text-left 
               text-slate-900 dark:text-white 
               flex items-center justify-between 
               hover:border-emerald-500 dark:hover:border-emerald-400
               focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400
               transition-all duration-200"
                  >
                    {/* Selected Role with Icon */}
                    <span className="flex items-center gap-2.5">
                      {selectedRole?.icon && (
                        <selectedRole.icon className="w-4 h-4 text-emerald-500" />
                      )}
                      <span>{selectedRole?.label}</span>
                    </span>

                    <ChevronDown
                      className={`w-5 h-5 text-emerald-500 transition-transform ${
                        showRoleDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showRoleDropdown && (
                    <div
                      className="absolute top-full left-0 right-0 mt-2 
                 bg-white dark:bg-dark-400 
                 border border-emerald-200 dark:border-emerald-700 
                 rounded-xl shadow-xl z-50 overflow-hidden
                 animate-fade-in"
                    >
                      {/* Header */}
                      <div className="p-3 border-b border-emerald-100 dark:border-emerald-800">
                        <span className="text-xs font-semibold tracking-wide text-emerald-600 dark:text-emerald-400">
                          Select Role
                        </span>
                      </div>

                      {/* Options */}
                      <div className="max-h-60 overflow-y-auto">
                        {ROLES.map((role) => {
                          const Icon = role.icon;
                          const isSelected = formData.role === role.value;

                          return (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  role: role.value,
                                }));
                                setError("");
                                setShowRoleDropdown(false);
                              }}
                              className={`w-full p-4 flex items-center justify-between text-left transition-all
                ${
                  isSelected
                    ? "bg-emerald-50 dark:bg-emerald-900/30"
                    : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                }`}
                            >
                              {/* Left */}
                              <span className="flex items-center gap-2.5">
                                <Icon
                                  className={`w-4 h-4 ${
                                    isSelected
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-emerald-500"
                                  }`}
                                />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  {role.label}
                                </span>
                              </span>

                              {/* Right */}
                              {isSelected && (
                                <Check className="w-5 h-5 text-emerald-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="shad-input-label block mb-2 text-slate-800 dark:text-white">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-dark-600" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="shad-input pl-10 w-full text-slate-900 dark:text-white bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="shad-input-label block mb-2 text-slate-800 dark:text-white">
                  Password
                </label>

                <div className="relative">
                  {/* Lock Icon */}
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400 dark:text-dark-600" />

                  {/* Input */}
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="shad-input pl-10 pr-10 w-full text-slate-900 dark:text-white bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-lg"
                    required
                  />

                  {/* Show / Hide Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-3 text-slate-400 dark:text-dark-600 hover:text-emerald-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-gradient mt-2 w-full py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Authenticating…
                  </span>
                ) : (
                  "Access Dashboard"
                )}
              </button>

              {error && (
                <p className="animate-fade-in text-center text-sm text-destructive">
                  {error}
                </p>
              )}
            </form>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground/50">
              Restricted System • CityCare Administration
            </p>
          </div>
        </div>
      </div>
    </RedirectPage>
  );
};

export default StaffSignIn;
