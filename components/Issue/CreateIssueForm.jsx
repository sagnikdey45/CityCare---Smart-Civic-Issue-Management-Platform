"use client";

import { useState } from "react";
import { CheckCircle2, HeartHandshake } from "lucide-react";
import ProgressBar from "./ProgressBar";
import DetailsCard from "./DetailsCard";
import Location from "./Location";
import AnonymityToggle from "./AnonymityToggle";
import Navbar from "./Navbar";
import SuccessModal from "./Success";
import PreviewModal from "./Preview";
import SpotlightTutorial from "./SpotlightTutorial";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const IssueForm = () => {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // // Always trigger tutorial on load
  // useEffect(() => {
  //   // Only run on client
  //   if (typeof window !== "undefined") {
  //     // Reset states for a fresh start
  //     setCurrentStep(1);
  //     setShowPreview(false);
      
  //     const timer = setTimeout(() => {
  //       setShowTutorial(true);
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, []);

  const createIssue = useMutation(api.issues.createIssue);

  const [formData, setFormData] = useState({
    // --- Issue details ---
    title: "",
    description: "",
    category: "",
    subcategory: [],
    otherCategoryName: "",
    priority: "",
    tags: [],
    photos: [],
    videos: null,

    // --- Location details ---
    searchQuery: "",
    address: "",
    city: "",
    state: "",
    postal: "",
    latitude: 20.5937,
    longitude: 78.9629,
    googleMapUrl: "",

    // Reporter details
    isAnonymous: false,
    additionalEmail: "",

    createdAt: Date.now(),
  });

  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Title is required";
      } else if (formData.title.length < 5) {
        newErrors.title = "Title must be at least 5 characters";
      }

      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      } else if (formData.description.length < 20) {
        newErrors.description =
          "Please provide more details (min 20 characters)";
      }

      if (!formData.category) {
        newErrors.category = "Please select a category";
      }

      if (!formData.subcategory || formData.subcategory.length === 0) {
        newErrors.subcategory = "Please select at least one subcategory";
      }

      if (!formData.priority) {
        newErrors.priority = "Please select a priority level";
      }

      if (formData.photos.length === 0) {
        newErrors.photos = "At least one photo is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      }

      if (!formData.city.trim()) {
        newErrors.city = "City is required";
      }

      if (!formData.state.trim()) {
        newErrors.state = "State is required";
      }

      if (!formData.postal.trim()) {
        newErrors.postal = "Postal Code is required";
      }
    }

    if (step === 3) {
      if (!formData.isAnonymous) {
        if (!formData.additionalEmail.trim()) {
          newErrors.additionalEmail = "Email is required";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowPreview(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      console.log("Submitting issue with data:", formData);
      await createIssue({
        title: formData.title,
        description: formData.description,

        category: formData.category,
        subcategory: formData.subcategory,

        priority: formData.priority,

        tags: formData.tags,

        latitude: String(formData.latitude),
        longitude: String(formData.longitude),

        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal: formData.postal,
        googleMapUrl: formData.googleMapUrl,

        isAnonymous: formData.isAnonymous,

        additionalEmail: formData.additionalEmail || null,

        reportedBy: session?.user?.id || null,

        photos: formData.photos,
        videos: formData.videos || null,
      });

      // Reset after success
      setFormData({
        title: "",
        description: "",
        category: "",
        subcategory: [],
        otherCategoryName: "",
        priority: "",
        tags: [],
        photos: [],
        videos: null,

        searchQuery: "",
        address: "",
        city: "",
        state: "",
        postal: "",
        latitude: 20.5937,
        longitude: 78.9629,
        googleMapUrl: "",

        isAnonymous: false,
        additionalEmail: "",

        createdAt: Date.now(),
      });

      setShowPreview(false);
      setShowSuccess(true);
      setCurrentStep(1);
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Failed to submit issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar
        formData={formData}
        setFormData={setFormData}
        setCurrentStep={setCurrentStep}
        setShowTutorial={setShowTutorial}
      />

      {/* ── Full-page glassmorphism shell ── */}
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-hidden">
        {/* ── Fixed ambient blobs ── */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div
            className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full bg-emerald-400/20 dark:bg-emerald-500/8 blur-[130px] animate-pulse"
            style={{ animationDuration: "8s" }}
          />
          <div
            className="absolute -bottom-48 -right-48 w-[580px] h-[580px] rounded-full bg-cyan-400/20 dark:bg-cyan-500/8 blur-[110px] animate-pulse"
            style={{ animationDuration: "11s", animationDelay: "2s" }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-[340px] h-[340px] rounded-full bg-teal-300/15 dark:bg-teal-400/5 blur-[90px] animate-pulse"
            style={{ animationDuration: "14s", animationDelay: "4s" }}
          />
        </div>

        <div className="relative z-10 pt-28 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Hero header ── */}
          <div className="text-center mb-12">
            {/* Glowing icon */}
            <div className="relative inline-flex mb-6">
              {/* Soft glow halo */}
              <div className="absolute inset-0 scale-[1.6] bg-gradient-to-br from-teal-400/40 to-cyan-500/30 rounded-full blur-2xl" />
              {/* Icon container */}
              <div className="relative w-[76px] h-[76px] rounded-[22px] bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 shadow-2xl shadow-emerald-500/40 flex items-center justify-center ring-4 ring-white/20 dark:ring-white/10">
                <HeartHandshake className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              {/* Live ping dot */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-950" />
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-teal-700 via-emerald-600 to-cyan-700 dark:from-teal-400 dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent mb-4 leading-[1.1] tracking-tight">
              Report a New Issue
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">
              Help us keep the city clean and safe.{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Your voice matters
              </span>{" "}
              in building a better community.
            </p>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-300 dark:to-emerald-700" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-300 dark:to-emerald-700" />
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar currentStep={currentStep} />

          {/* ── Step content ── */}
          <div className="mt-8">
            {currentStep === 1 && (
              <DetailsCard
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {currentStep === 2 && (
              <Location
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {currentStep === 3 && (
              <AnonymityToggle
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            )}
          </div>

          {/* ── Navigation buttons ── */}
          <div className="mt-8 flex justify-between items-center gap-4">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 px-6 py-3 rounded-2xl
                  border-2 border-slate-200 dark:border-slate-700
                  bg-white/70 dark:bg-slate-800/60
                  text-slate-700 dark:text-slate-300 font-semibold text-sm
                  hover:border-emerald-400 dark:hover:border-emerald-500
                  hover:bg-white/90 dark:hover:bg-slate-800/90
                  hover:shadow-lg hover:shadow-emerald-500/10
                  hover:-translate-y-0.5 active:scale-95
                  transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="group relative flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white text-sm overflow-hidden
                shadow-xl shadow-emerald-500/30
                hover:shadow-emerald-500/50 hover:scale-[1.04] hover:-translate-y-0.5
                active:scale-[0.97] transition-all duration-200"
            >
              {/* Base gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-600" />
              {/* Hover shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Shine swipe */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative flex items-center gap-2" data-tutorial="preview-btn">
                {currentStep === 3 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Preview &amp; Submit
                  </>
                ) : (
                  <>
                    Continue
                    <svg
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* ── CityPoints floating pill ── */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 dark:bg-slate-800/50 border border-emerald-200/60 dark:border-emerald-700/30 shadow-sm">
              <span className="text-base">🏆</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Earn{" "}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  CityPoints
                </span>{" "}
                for every verified report
              </p>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <PreviewModal
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowPreview(false)}
          setCurrentStep={setCurrentStep}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}

      <SpotlightTutorial
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        showTutorial={showTutorial}
        setShowTutorial={setShowTutorial}
      />
    </>
  );
};

export default IssueForm;
