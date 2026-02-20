"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  MapPin,
  ChevronDown,
  Check,
  Home,
  Phone,
  X,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { signUp } from "@/lib/auth";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import RedirectPage from "./Redirect";
import { ModeToggle } from "../ModeToggle";
import LocationPicker from "./LocationPicker";
import { hash } from "bcryptjs";

const SignUp = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [specialisationSearch, setSpecialisationSearch] = useState("");
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "citizen",

    city: "",
    state: "",
    region: "", // will act as district for field officer

    department: "",
    specialisations: [],

    postal: "",
    wardNo: "",
    fullAddress: "",
    latitude: "",
    longitude: "",
  });

  const departmentSpecialisations = {
    sanitation: [
      "Waste Collection",
      "Drain Cleaning",
      "Public Toilet Maintenance",
      "Garbage Segregation",
      "Sewage Handling",
    ],

    road: [
      "Pothole Repair",
      "Asphalt Laying",
      "Footpath Repair",
      "Speed Breaker Construction",
      "Road Marking",
    ],

    water: [
      "Pipeline Repair",
      "Leakage Detection",
      "Valve Maintenance",
      "Tanker Management",
      "Water Quality Testing",
    ],

    electricity: [
      "Street Light Repair",
      "Cable Maintenance",
      "Transformer Inspection",
      "Meter Repair",
    ],

    drainage: [
      "Manhole Cleaning",
      "Flood Prevention",
      "Storm Water Management",
      "Sewer Line Repair",
    ],

    solid_waste: [
      "Dumping Site Management",
      "Waste Transportation",
      "Recycling Operations",
    ],

    public_health: [
      "Mosquito Control",
      "Disinfection",
      "Disease Prevention",
      "Sanitation Inspection",
    ],
  };

  const [error, setError] = useState("");

  const currentSpecs = departmentSpecialisations[formData.department] || [];

  const filteredSpecs = currentSpecs.filter((spec) =>
    spec.toLowerCase().includes(specialisationSearch.toLowerCase()),
  );

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,

        fullName: session.user.name || prev.fullName,
        email: session.user.email || prev.email,
        role: session.user.role || prev.role,
      }));
    }
  }, [session]);

  // Add specialisation
  const handleSpecSelect = (spec) => {
    if (!formData.specialisations.includes(spec)) {
      setFormData((prev) => ({
        ...prev,
        specialisations: [...prev.specialisations, spec],
      }));
    }

    setSpecialisationSearch("");
    setShowSpecDropdown(false);
  };

  // Remove specialisation
  const removeSpec = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specialisations: prev.specialisations.filter((s) => s !== spec),
    }));
  };

  // Enter key support
  const handleSpecKeyPress = (e) => {
    if (e.key === "Enter" && specialisationSearch.trim()) {
      e.preventDefault();
      handleSpecSelect(specialisationSearch.trim());
    }
  };

  // Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Sign Up handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Base payload (common for all)
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,

        city: formData.city,
        state: formData.state,

        postal: formData.postal,
        fullAddress: formData.fullAddress,

        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      // Role-based Mapping

      // For Officers, district is used instead of region
      if (formData.role !== "citizen") {
        payload.district = formData.region;
        payload.phone = formData.phone;
        payload.department = formData.department;
      } else {
        payload.region = formData.region;
      }

      // Field Officer → specialisations
      if (formData.role === "field_officer") {
        payload.specialisations = formData.specialisations;
      }

      // Password Hashing
      const hashedPassword = await hash(formData.password, 10);
      payload.password = hashedPassword;

      console.log("Signup Payload:", payload);

      // API Call

      const res = await signUp(payload);

      console.log("Signup Response:", res);

      // Error Handling
      if (!res?.success) {
        toast.error(res?.error || "Sign up failed. Please try again.");
        setError(res?.error || "Signup failed");
        return;
      }

      // Auto Login
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        role: formData.role,
      });

      if (result?.error) {
        toast.error("Login failed. Please try again.");
        setError("Login failed. Please try again.");
        return;
      }

      // Redirect
      router.push(`/${formData.role.replace("_", "-")}/`);
    } catch (err) {
      console.error("Signup Error:", err);
      toast.error("Something went wrong. Please try again.");
      setError("Unexpected error occurred");
    }
  };

  return (
    <RedirectPage redirectTo={`/${formData.role.replace("_", "-")}/`}>
      <div className="min-h-screen flex bg-white dark:bg-dark-300 transition-colors">
        {/* Left Section */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-12">
              <Link href={"/"}>
                <div className="flex items-center gap-2">
                  <Image src={"/logo.png"} alt="Logo" width={32} height={32} />
                  <span className="text-24-bold text-slate-900 dark:text-white">
                    CityCare
                  </span>
                </div>
              </Link>
              <ModeToggle />
            </div>

            {/* Welcome */}
            <div className="mb-10">
              <h1 className="text-36-bold text-slate-900 dark:text-white mb-2">
                Welcome to CityCare 🏙️
              </h1>
              <p className="text-16-regular text-slate-600 dark:text-dark-700">
                Empowering citizens for a cleaner, smarter city.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="shad-input-label mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Sagnik Dey"
                    className="shad-input pl-10 w-full text-slate-900 dark:text-white bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-2xl"
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="shad-input-label mb-2">Role</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    onBlur={() =>
                      setTimeout(() => {
                        setShowRoleDropdown(false);
                      }, 150)
                    }
                    className="w-full bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-lg px-4 py-3 text-left flex items-center justify-between"
                  >
                    <span className="capitalize">
                      {formData.role.replace("_", " ")}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transition-transform ${
                        showRoleDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-lg shadow-lg z-10">
                      <div className="p-3 border-b border-slate-200 dark:border-dark-500">
                        <span className="text-14-medium text-slate-600 dark:text-dark-700">
                          Select Role
                        </span>
                      </div>
                      {["citizen", "unit_officer", "field_officer"].map(
                        (role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, role }));
                              setShowRoleDropdown(false);
                              console.log("Selected role:", role);
                            }}
                            className="w-full p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-dark-500 transition-colors text-left"
                          >
                            <span className="capitalize">
                              {role.replace("_", " ")}
                            </span>
                            {formData.role === role && (
                              <Check className="w-5 h-5 text-emerald-500" />
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="shad-input-label mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="shad-input pl-10 w-full text-slate-900 dark:text-white bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-2xl"
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

              {(formData.role === "field_officer" ||
                formData.role === "unit_officer") && (
                <div className="space-y-6">
                  {/* Phone */}
                  <div>
                    <label className="shad-input-label mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        className="shad-input pl-10 w-full text-slate-900 dark:text-white bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-2xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="shad-input-label mb-2">Department</label>

                    <div className="relative">
                      {/* Button */}
                      <button
                        type="button"
                        onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                        onBlur={() =>
                          setTimeout(() => {
                            setShowDeptDropdown(false);
                          }, 150)
                        }
                        className="w-full bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-lg px-4 py-3 text-left flex items-center justify-between"
                      >
                        <span className="capitalize">
                          {formData.department
                            ? formData.department.replace("_", " ")
                            : "Select Department"}
                        </span>

                        <ChevronDown
                          className={`w-5 h-5 text-slate-500 transition-transform ${
                            showDeptDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown */}
                      {showDeptDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-lg shadow-lg z-10">
                          <div className="p-3 border-b border-slate-200 dark:border-dark-500">
                            <span className="text-14-medium text-slate-600 dark:text-dark-700">
                              Select Department
                            </span>
                          </div>

                          {[
                            "sanitation",
                            "road",
                            "water",
                            "electricity",
                            "drainage",
                            "solid_waste",
                            "public_health",
                          ].map((dept) => (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  department: dept,
                                }));
                                setShowDeptDropdown(false);
                              }}
                              className="w-full p-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-dark-500 transition-colors text-left"
                            >
                              <span className="capitalize">
                                {dept.replace("_", " ")}
                              </span>

                              {formData.department === dept && (
                                <Check className="w-5 h-5 text-emerald-500" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Specialisations */}
              {formData.role === "field_officer" &&
                formData.department.length > 0 && (
                  <div className="mt-6">
                    <label className="shad-input-label block mb-2">
                      Specialisations
                    </label>

                    <div className="space-y-3">
                      {/* Selected Tags */}
                      {formData.specialisations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.specialisations.map((spec, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1"
                            >
                              <span className="text-12-medium text-emerald-400">
                                {spec}
                              </span>

                              <button
                                type="button"
                                onClick={() => removeSpec(spec)}
                                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={specialisationSearch}
                          onChange={(e) =>
                            setSpecialisationSearch(e.target.value)
                          }
                          onKeyPress={handleSpecKeyPress}
                          placeholder="Type to search or add specialisation..."
                          className="shad-input w-full p-3 rounded-2xl"
                          onFocus={() => setShowSpecDropdown(true)}
                          onBlur={() =>
                            setTimeout(() => setShowSpecDropdown(false), 150)
                          }
                        />

                        {/* Dropdown */}
                        {showSpecDropdown &&
                          (specialisationSearch ||
                            filteredSpecs.length > 0) && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-50 dark:bg-dark-400 border border-dark-500 rounded-lg shadow-lg z-10 overflow-hidden">
                              <div className="max-h-48 overflow-y-auto">
                                {/* Add Custom */}
                                {specialisationSearch &&
                                  !filteredSpecs.includes(
                                    specialisationSearch,
                                  ) && (
                                    <button
                                      type="button"
                                      onMouseDown={() =>
                                        handleSpecSelect(specialisationSearch)
                                      }
                                      className="w-full p-3 flex items-center gap-3 hover:bg-dark-500 transition-colors text-left border-b border-dark-500"
                                    >
                                      <Plus className="w-4 h-4 text-green-500" />

                                      <span className="text-14-regular">
                                        Add "{specialisationSearch}"
                                      </span>
                                    </button>
                                  )}

                                {/* Suggestions */}
                                {filteredSpecs.map((spec) => (
                                  <button
                                    key={spec}
                                    type="button"
                                    onMouseDown={() => handleSpecSelect(spec)}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-slate-200 dark:hover:bg-dark-500 transition-colors text-left"
                                  >
                                    <span className="text-14-regular">
                                      {spec}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Location Detection Section */}
              <div className="mt-6">
                <LocationPicker
                  onDetect={(loc) => {
                    setFormData((prev) => ({
                      ...prev,
                      city: loc.city,
                      state: loc.state,
                      region: loc.region,
                      latitude: loc.latitude.toString(),
                      longitude: loc.longitude.toString(),
                      fullAddress: loc.detectedAddress,
                      postal: loc.postal,
                    }));
                  }}
                />
              </div>

              {/* OR Divider */}
              <div className="relative flex items-center justify-center my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-300 dark:border-dark-500"></span>
                </div>
                <div className="relative px-4 bg-white dark:bg-dark-300">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    OR
                  </span>
                </div>
              </div>

              {/* Display location fields */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="shad-input-label mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="shad-input p-3 w-full text-slate-900 dark:text-white bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-2xl"
                    />
                  </div>
                  <div>
                    <label className="shad-input-label mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="shad-input p-3 w-full text-slate-900 dark:text-white bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-2xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="shad-input-label mb-2">Region</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Region / Area"
                    className="shad-input p-3 w-full text-slate-900 dark:text-white bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-2xl"
                  />
                </div>
                {formData.role === "citizen" && (
                  <div>
                    <div>
                      <label className="shad-input-label mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postal"
                        value={formData.postal}
                        onChange={handleInputChange}
                        placeholder="Postal Code"
                        className="shad-input p-3 w-full text-slate-900 dark:text-white bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-2xl"
                      />
                    </div>
                    <div>
                      <label className="shad-input-label mb-2">
                        Full Address
                      </label>
                      <textarea
                        type="text"
                        name="fullAddress"
                        value={formData.fullAddress}
                        onChange={handleInputChange}
                        placeholder="Full Address"
                        className="p-3 w-full text-slate-900 dark:text-white bg-white dark:bg-dark-400 border border-slate-300 dark:border-dark-500 rounded-2xl"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg text-16-semibold transition-colors mt-8"
              >
                Get Started
              </button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <span className="text-14-regular text-slate-600 dark:text-dark-600">
                Already have an account?{" "}
              </span>
              <button
                onClick={() => router.push("/sign-in")}
                className="text-14-regular text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                Sign in
              </button>
            </div>

            <button
              onClick={() => router.push("/")}
              className="mt-4 text-14-regular text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden md:flex flex-1 relative overflow-hidden">
          <img
            src="/signup.jpeg"
            alt="City view"
            className="side-img dark:hidden"
          />
          <img
            src="/signup-dark.jpg"
            alt="City view"
            className="side-img dark:block hidden"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/40 dark:to-dark-300/20"></div>
        </div>
      </div>
    </RedirectPage>
  );
};

export default SignUp;
