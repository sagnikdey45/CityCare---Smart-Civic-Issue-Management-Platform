import {
  AlertCircle,
  Camera,
  NotebookText,
  X,
  Map,
  Lightbulb,
  Trash2,
  Clipboard,
  ChevronDown,
  Check,
  Droplets,
  Video,
  Trash,
  Recycle,
  MapPin,
  Zap,
  Package,
  HeartPulse,
  MoreHorizontal,
  Plus,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import MediaPreview from "./MediaPreview";
import ImageCarousel from "./ImageCarousel";
import { toast } from "sonner";

const categories = [
  {
    value: "road",
    label: "Road & Infrastructure",
    icon: MapPin,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "electricity",
    label: "Electricity & Lighting",
    icon: Zap,
    color: "text-yellow-600 dark:text-yellow-400",
  },
  {
    value: "water",
    label: "Water Supply",
    icon: Droplets,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  {
    value: "sanitation",
    label: "Sanitation & Waste",
    icon: Trash2,
    color: "text-green-600 dark:text-green-400",
  },
  {
    value: "drainage",
    label: "Drainage & Sewer",
    icon: Recycle,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    value: "solid_waste",
    label: "Solid Waste Management",
    icon: Package,
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    value: "public_health",
    label: "Public Health",
    icon: HeartPulse,
    color: "text-red-600 dark:text-red-400",
  },
  {
    value: "other",
    label: "Other",
    icon: MoreHorizontal,
    color: "text-gray-600 dark:text-gray-400",
  },
];

const subcategory = {
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

const severityLevels = [
  {
    value: "low",
    label: "Low",
    color:
      "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-600 ring-blue-300 dark:ring-blue-700",
  },
  {
    value: "medium",
    label: "Medium",
    color:
      "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-400 dark:border-yellow-600 ring-yellow-300 dark:ring-yellow-700",
  },
  {
    value: "high",
    label: "High",
    color:
      "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-400 dark:border-red-600 ring-red-300 dark:ring-red-700",
  },
];

const DetailsCard = ({ formData, setFormData, errors, setErrors }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [subcategorySearch, setSpecialisationSearch] = useState("");
  const [showSpecDropdown, setShowSpecDropdown] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const generateUploadUrl = useMutation(api.issuesMedia.generateUploadUrl);

  const deleteMedia = useMutation(api.issuesMedia.deleteMedia);

  const isVideoDisabled = !!video || uploading;

  /* --------------------------------------------------
   Sync Local Media State With formData
-------------------------------------------------- */
  useEffect(() => {
    // Sync Photos
    if (Array.isArray(formData.photos)) {
      setImages(formData.photos);
    } else {
      setImages([]);
    }

    // Sync Video
    if (formData.videos) {
      setVideo(formData.videos);
    } else {
      setVideo(null);
    }
  }, [formData.photos, formData.videos]);

  // ── Upload limits ──────────────────────────────────────────────────────────
  const MAX_IMAGE_SIZE_MB = 50;
  const MAX_VIDEO_SIZE_MB = 100;
  const MAX_IMAGE_BYTES   = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const MAX_VIDEO_BYTES   = MAX_VIDEO_SIZE_MB * 1024 * 1024;

  // ── Low-level uploader ────────────────────────────────────────────────────
  const uploadFile = async (file) => {
    // Debug log (safe to keep in production — no PII)
    console.debug(
      `[upload] ${file.name} | type: ${file.type} | size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
    );

    // Obtain a short-lived signed upload URL from Convex
    let url;
    try {
      url = await generateUploadUrl();
    } catch (err) {
      throw new Error("Could not obtain upload URL. Please try again.");
    }

    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
    } catch (networkErr) {
      // Covers: fetch failed, CORS pre-flight blocked, offline
      console.error("[upload] Network error:", networkErr);
      throw new Error(
        "Upload failed due to a network error. Check your connection and try again.",
      );
    }

    if (!res.ok) {
      // Surface specific HTTP failure reasons
      if (res.status === 413) {
        throw new Error(
          `File too large for the server (HTTP 413). Please compress or trim the file and try again.`,
        );
      }
      if (res.status === 403 || res.status === 401) {
        throw new Error(
          "Upload URL has expired. Please refresh the page and try again.",
        );
      }
      throw new Error(`Upload failed (HTTP ${res.status}). Please try again.`);
    }

    let json;
    try {
      json = await res.json();
    } catch {
      throw new Error("Upload succeeded but response was malformed.");
    }

    if (!json?.storageId) {
      throw new Error("Upload succeeded but no storage ID was returned.");
    }

    return json.storageId;
  };

  // ── Image upload handler ──────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );

    if (!files.length) return;

    // Pre-validate sizes — reject oversized files before touching the API
    const valid   = [];
    const tooBig  = [];
    for (const f of files) {
      if (f.size > MAX_IMAGE_BYTES) {
        tooBig.push(f.name);
      } else {
        valid.push(f);
      }
    }

    if (tooBig.length) {
      toast.warning(
        `${tooBig.length} file(s) skipped — images must be under ${MAX_IMAGE_SIZE_MB} MB: ${tooBig.join(", ")}`,
        { duration: 6000 },
      );
    }

    if (!valid.length) {
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    setUploading(true);
    const loadImage = toast.loading(`Uploading ${valid.length} image(s)…`);

    try {
      const uploaded = [];

      for (const file of valid) {
        const id = await uploadFile(file);
        uploaded.push(id);
      }

      setImages((prev) => [...prev, ...uploaded]);
      setFormData((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), ...uploaded],
      }));

      toast.dismiss(loadImage);
      toast.success(
        `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded successfully!`,
      );
    } catch (err) {
      console.error("[handleImageUpload]", err);
      toast.dismiss(loadImage);
      toast.error(err.message || "Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  // ── Video upload handler ──────────────────────────────────────────────────
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Type check
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    // ⚠️ Frontend size gate — prevents 413 / CORS errors from ever firing
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error(
        `File too large (${(file.size / 1024 / 1024).toFixed(0)} MB). Please upload a shorter or compressed video under ${MAX_VIDEO_SIZE_MB} MB.`,
        { duration: 8000 },
      );
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    setUploadingVideo(true);
    const loadVideo = toast.loading(
      `Uploading video (${(file.size / 1024 / 1024).toFixed(1)} MB)…`,
    );

    try {
      const id = await uploadFile(file);

      setVideo(id);
      setFormData((prev) => ({ ...prev, videos: id }));

      toast.dismiss(loadVideo);
      toast.success("Video uploaded successfully!");
    } catch (err) {
      console.error("[handleVideoUpload]", err);
      toast.dismiss(loadVideo);
      toast.error(err.message || "Failed to upload video. Please try again.");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };


  const removeMedia = async (id, type) => {
    await deleteMedia({ storageId: id });

    if (type === "image") {
      setImages((p) => p.filter((x) => x !== id));

      setFormData((p) => ({
        ...p,
        photos: p.photos.filter((x) => x !== id),
      }));
    }

    if (type === "video") {
      setVideo(null);

      setFormData((p) => ({
        ...p,
        videos: undefined,
      }));
    }
  };

  const currentSpecs = subcategory[formData.category] || [];

  const filteredSpecs = currentSpecs.filter((spec) =>
    spec.toLowerCase().includes(subcategorySearch.toLowerCase()),
  );

  const availableSpecs = filteredSpecs.filter(
    (spec) => !formData.subcategory?.includes(spec),
  );

  // Add specialisation
  const handleSpecSelect = (spec) => {
    if (!formData.subcategory.includes(spec)) {
      setFormData((prev) => ({
        ...prev,
        subcategory: [...prev.subcategory, spec],
      }));
      setErrors((prev) => ({ ...prev, subcategory: "" }));
    }

    setSpecialisationSearch("");
    setShowSpecDropdown(false);
  };

  // Remove specialisation
  const removeSpec = (spec) => {
    setFormData((prev) => ({
      ...prev,
      subcategory: prev.subcategory.filter((s) => s !== spec),
    }));
  };

  // Enter key support
  const handleSpecKeyPress = (e) => {
    if (e.key === "Enter" && subcategorySearch.trim()) {
      e.preventDefault();
      handleSpecSelect(subcategorySearch.trim());
    }
  };

  // Add Tag
  const handleAddTag = () => {
    const value = tagInput.trim().toLowerCase();

    if (!value) return;

    if (!formData.tags?.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), value],
      }));
    }

    setTagInput("");
  };

  // Remove Tag
  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Enter Support
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleInput = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset the error for that field (if any)
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl shadow-slate-200/60 dark:shadow-black/40">
      {/* Gradient top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-cyan-50/20 dark:from-emerald-950/20 dark:via-transparent dark:to-teal-950/10 pointer-events-none" />

      <div className="relative p-6 sm:p-8">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <NotebookText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
              Issue Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Fill in all required fields to continue
            </p>
          </div>
        </div>

      <div className="space-y-6">
        {/* ── Title ── */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide"
          >
            Issue Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInput("title", e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 font-medium ${
              errors.title
                ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200/40 dark:focus:ring-red-800/30 bg-red-50/30 dark:bg-red-950/10"
                : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 dark:focus:ring-emerald-800/30 bg-white/90 dark:bg-slate-800/80"
            } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
            placeholder="e.g., Broken streetlight on Main Street"
          />
          {errors.title && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
              <AlertCircle size={13} />
              {errors.title}
            </p>
          )}
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Be specific and concise (min 5 characters)</p>
        </div>

        {/* ── Description ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="description"
              className="block text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs font-semibold tabular-nums ${
              formData.description.length < 20
                ? "text-amber-500 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}>
              {formData.description.length}/500
            </span>
          </div>
          <textarea
            id="description"
            rows={5}
            value={formData.description}
            onChange={(e) => handleInput("description", e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 resize-none transition-all outline-none focus:ring-4 font-medium leading-relaxed ${
              errors.description
                ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200/40 dark:focus:ring-red-800/30 bg-red-50/30 dark:bg-red-950/10"
                : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 dark:focus:ring-emerald-800/30 bg-white/90 dark:bg-slate-800/80"
            } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
            placeholder="Describe the issue in detail. What happened? When did you notice it?"
          />
          {errors.description && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
              <AlertCircle size={13} />
              {errors.description}
            </p>
          )}
        </div>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Classification</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        {/* ── Category & Severity ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Category */}
          <div className="relative">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
              Category <span className="text-red-500">*</span>
            </label>

            <button
              type="button"
              onClick={() => setShowDropdown((prev) => !prev)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 font-medium ${
                errors.category
                  ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200/40 dark:focus:ring-red-800/30 bg-red-50/30 dark:bg-red-950/10"
                  : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 dark:focus:ring-emerald-800/30 bg-white/90 dark:bg-slate-800/80"
              } text-slate-900 dark:text-slate-100`}
            >
              <span className="flex items-center gap-2">
                {formData.category ? (
                  <>
                    {(() => {
                      const selected = categories.find(
                        (cat) => cat.value === formData.category,
                      );
                      const Icon = selected?.icon;
                      return Icon ? (
                        <>
                          <Icon className={`w-5 h-5 ${selected.color}`} />
                          <span className="font-semibold">{selected.label}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">Select a category</span>
                      );
                    })()}
                  </>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">Select a category</span>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Glass dropdown */}
            {showDropdown && (
              <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        handleInput("category", cat.value);
                        setShowDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 ${isSelected ? "bg-emerald-100 dark:bg-emerald-800/40" : ""}`}>
                          <Icon className={`w-4 h-4 ${cat.color}`} />
                        </span>
                        <span className="font-medium">{cat.label}</span>
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {errors.category && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle size={13} />
                {errors.category}
              </p>
            )}
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
              Severity Level <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {severityLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleInput("priority", level.value)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-200 ${
                    formData.priority === level.value
                      ? `${level.color} ring-4 ring-opacity-60 scale-[1.04] shadow-md`
                      : "bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
            {errors.priority && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                <AlertCircle size={13} />
                {errors.priority}
              </p>
            )}
          </div>

          {formData.category === "other" && (
            <div className="sm:col-span-2">
              <label
                htmlFor="otherCategoryName"
                className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide"
              >
                Other Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="otherCategoryName"
                value={formData.otherCategoryName}
                onChange={(e) => handleInput("otherCategoryName", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 font-medium ${
                  errors.otherCategoryName
                    ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200/40 dark:focus:ring-red-800/30 bg-red-50/30"
                    : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 dark:focus:ring-emerald-800/30 bg-white/90 dark:bg-slate-800/80"
                } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
                placeholder="Describe the other category..."
              />
              {errors.otherCategoryName && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                  <AlertCircle size={13} />
                  {errors.otherCategoryName}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Tags & Categories</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        {/* ── Sub-Categories ── */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
            Sub-Categories <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {/* Selected chips */}
            {formData.subcategory?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.subcategory?.map((spec, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700/60 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      {spec}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSpec(spec)}
                      className="w-4 h-4 rounded-full bg-emerald-200 dark:bg-emerald-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-500 transition-all"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="relative">
              <input
                type="text"
                value={subcategorySearch}
                onChange={(e) => setSpecialisationSearch(e.target.value)}
                onKeyPress={handleSpecKeyPress}
                placeholder="Search or add a sub-category…"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 font-medium ${
                  errors.subcategory
                    ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200/40 dark:focus:ring-red-800/30 bg-red-50/30"
                    : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 dark:focus:ring-emerald-800/30 bg-white/90 dark:bg-slate-800/80"
                } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
                onFocus={() => setShowSpecDropdown(true)}
                onBlur={() => setTimeout(() => setShowSpecDropdown(false), 150)}
              />

              {/* Glass dropdown */}
              {showSpecDropdown && (subcategorySearch || filteredSpecs.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/20 z-20 overflow-hidden">
                  <div className="max-h-48 overflow-y-auto">
                    {subcategorySearch &&
                      !filteredSpecs.includes(subcategorySearch) &&
                      !formData.subcategory.includes(subcategorySearch) && (
                        <button
                          type="button"
                          onMouseDown={() => handleSpecSelect(subcategorySearch)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left border-b border-slate-100 dark:border-slate-700"
                        >
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                            <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                            Add &ldquo;{subcategorySearch}&rdquo;
                          </span>
                        </button>
                      )}
                    {availableSpecs.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onMouseDown={() => handleSpecSelect(spec)}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                      >
                        <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{spec}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {errors.subcategory && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                  <AlertCircle size={13} />
                  {errors.subcategory}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Tags ── */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
            Issue Tags
            <span className="ml-2 text-xs font-normal text-slate-400">(Optional)</span>
          </label>

          <div className="space-y-3">
            {formData.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-1.5 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-700/60 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="w-4 h-4 rounded-full bg-cyan-200 dark:bg-cyan-700/50 flex items-center justify-center text-cyan-600 dark:text-cyan-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-500 transition-all"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a tag and press Enter…"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/40 dark:focus:ring-cyan-800/30 outline-none transition-all bg-white/90 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium"
              />
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-mono">Enter</kbd> to add · No spaces · e.g. pothole, urgent
              </p>
            </div>
          </div>
        </div>

        {/* ── Section divider ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Evidence</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        {/* ── Photo Upload ── */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
            Photo Evidence <span className="text-red-500">*</span>
          </label>

          {/* Upload Box */}
          <label
            className={`
      flex flex-col items-center justify-center
      w-full h-40 border-2 border-dashed rounded-xl
      transition-all group

      ${
        uploading
          ? "cursor-not-allowed opacity-60 pointer-events-none bg-gray-100 dark:bg-gray-900"
          : "cursor-pointer bg-gray-50 dark:bg-gray-800"
      }

      ${
        errors.photos
          ? "border-red-300 dark:border-red-500 bg-red-50/40 dark:bg-red-950/30"
          : uploading
            ? "border-gray-300 dark:border-gray-700"
            : "border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
      }
    `}
          >
            {/* Content */}
            <div className="flex flex-col items-center justify-center pt-5 pb-6 gap-1">
              {/* Uploading State */}
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />

                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Uploading images...
                  </p>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Please wait
                  </p>
                </>
              ) : (
                <>
                  {/* Normal State */}
                  <Camera
                    className={`w-10 h-10 mb-2 transition-colors
              ${
                errors.photos
                  ? "text-red-400 dark:text-red-400"
                  : "text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
              }`}
                  />

                  <p
                    className={`text-sm font-medium
              ${
                errors.photos
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-300"
              }`}
                  >
                    Click to upload or drag and drop
                  </p>

                  <p
                    className={`text-xs mt-1
              ${
                errors.photos
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
                  >
                    PNG, JPG up to 10MB
                  </p>
                </>
              )}
            </div>

            {/* Hidden Input */}
            <input
              ref={imageInputRef}
              type="file"
              multiple
              hidden
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                if (uploading) return;

                handleImageUpload(e);

                // Clear error
                setErrors((prev) => ({
                  ...prev,
                  photos: "",
                }));
              }}
            />
          </label>

          {/* Error Message */}
          {errors.photos && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.photos}
            </p>
          )}

          {/* IMAGE CAROUSEL */}
          {images.length > 0 && (
            <div className="mt-4">
              {/* Upload Count Badge */}
              <div
                className="
          px-4 py-1.5 rounded-full
          bg-white/80 dark:bg-dark-400/80
          backdrop-blur-md mb-2
          border border-emerald-200 dark:border-emerald-700
          shadow-md shadow-emerald-500/10
          flex items-center gap-2
          text-xs font-semibold text-gray-700 dark:text-gray-200
        "
              >
                <Camera className="w-4 h-4 text-emerald-500" />

                <span>
                  {images.length} Image{images.length > 1 ? "s" : ""}
                </span>

                <span className="text-emerald-600 dark:text-emerald-400">
                  Uploaded
                </span>
              </div>

              {/* Carousel */}
              <ImageCarousel images={images} removeMedia={removeMedia} />
            </div>
          )}
        </div>

        {/* ── Video Upload ── */}
        <div className="mt-2">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
            Video Evidence
            <span className="ml-2 text-xs font-normal text-slate-400">(Optional)</span>
          </label>

          <label
            className={`
      relative
      flex flex-col items-center justify-center
      w-full h-44 border-2 border-dashed rounded-xl
      transition-all group overflow-hidden

      ${
        uploadingVideo
          ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950 cursor-wait"
          : isVideoDisabled
            ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed pointer-events-none"
            : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
      }
    `}
          >
            {/* Loader Overlay */}
            {uploadingVideo && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Uploading video...
                </p>
              </div>
            )}

            {/* Content */}
            <div className="flex flex-col items-center justify-center gap-2 z-0">
              <Video
                className={`
          w-10 h-10 transition-colors
          ${
            isVideoDisabled || uploadingVideo
              ? "text-gray-400"
              : "text-gray-400 group-hover:text-emerald-500"
          }
        `}
              />

              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {uploadingVideo
                  ? "Uploading..."
                  : isVideoDisabled
                    ? "Video Uploaded"
                    : "Upload Video Evidence"}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                MP4 / WebM • Max 50MB
              </p>
            </div>

            {/* Input */}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
              disabled={uploadingVideo || isVideoDisabled}
            />
          </label>

          {/* Preview */}
          {video?.length > 0 && (
            <div className="relative mt-3 rounded-xl overflow-hidden shadow">
              <MediaPreview storageId={video} isVideo />

              <button
                onClick={() => removeMedia(video, "video")}
                className="
          absolute top-2 right-2
          bg-red-500 hover:bg-red-600
          p-1.5 rounded-full
          text-white shadow
          transition
        "
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default DetailsCard;
