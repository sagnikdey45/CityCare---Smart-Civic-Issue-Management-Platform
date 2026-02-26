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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";

const IssueForm = () => {
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    searchQuery: "", // Raw search text typed or selected
    address: "", // Full formatted address
    city: "", // City or locality
    state: "", // State / region
    postal: "", // Postal code
    latitude: 20.5937, // Default center (India)
    longitude: 78.9629,
    googleMapUrl: "", // Google Maps URL for location

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
      <Navbar formData={formData} setFormData={setFormData} setCurrentStep={setCurrentStep} />
      <div className="mt-20 max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 shadow-lg mb-4">
            <HeartHandshake className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-800 bg-clip-text text-transparent mb-3">
            Report a New Issue
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us keep the city clean and safe. Your voice matters in building
            a better community for everyone.
          </p>
        </div>

        <ProgressBar currentStep={currentStep} />

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

        <div className="mt-8 flex justify-between gap-4">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Back
            </button>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="ml-auto px-8 py-3 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            {currentStep === 3 ? (
              <>
                <CheckCircle2 size={20} />
                Preview & Submit
              </>
            ) : (
              <>
                Continue
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          🏆 You'll earn{" "}
          <span className="font-semibold text-emerald-600">CityPoints</span> for
          verified reports
        </p>
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
    </>
  );
};

export default IssueForm;
