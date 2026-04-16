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

  useEffect(() => {
    if (Array.isArray(formData.photos)) {
      setImages(formData.photos);
    } else {
      setImages([]);
    }
    if (formData.videos) {
      setVideo(formData.videos);
    } else {
      setVideo(null);
    }
  }, [formData.photos, formData.videos]);

  const MAX_IMAGE_SIZE_MB = 50;
  const MAX_VIDEO_SIZE_MB = 100;
  const MAX_IMAGE_BYTES   = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const MAX_VIDEO_BYTES   = MAX_VIDEO_SIZE_MB * 1024 * 1024;

  const uploadFile = async (file) => {
    console.debug(`[upload] ${file.name} | type: ${file.type} | size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    let url = await generateUploadUrl();
    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!res.ok) {
      if (res.status === 413) throw new Error(`File too large for the server (HTTP 413).`);
      throw new Error(`Upload failed (HTTP ${res.status}).`);
    }

    let json = await res.json();
    if (!json?.storageId) throw new Error("Upload succeeded but no storage ID was returned.");
    return json.storageId;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;

    const valid = [];
    const tooBig = [];
    for (const f of files) {
      if (f.size > MAX_IMAGE_BYTES) { tooBig.push(f.name); } else { valid.push(f); }
    }

    if (tooBig.length) {
      toast.warning(`${tooBig.length} file(s) skipped — images must be under ${MAX_IMAGE_SIZE_MB} MB: ${tooBig.join(", ")}`);
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
      toast.success(`${uploaded.length} image(s) uploaded successfully!`);
    } catch (err) {
      toast.dismiss(loadImage);
      toast.error(err.message || "Failed to upload images.");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error(`File too large. Max ${MAX_VIDEO_SIZE_MB} MB.`);
      return;
    }

    setUploadingVideo(true);
    const loadVideo = toast.loading(`Uploading video…`);

    try {
      const id = await uploadFile(file);
      setVideo(id);
      setFormData((prev) => ({ ...prev, videos: id }));
      toast.dismiss(loadVideo);
      toast.success("Video uploaded successfully!");
    } catch (err) {
      toast.dismiss(loadVideo);
      toast.error(err.message || "Failed to upload video.");
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const removeMedia = async (id, type) => {
    await deleteMedia({ storageId: id });
    if (type === "image") {
      setImages((p) => p.filter((x) => x !== id));
      setFormData((p) => ({ ...p, photos: (p.photos || []).filter((x) => x !== id) }));
    } else if (type === "video") {
      setVideo(null);
      setFormData((p) => ({ ...p, videos: undefined }));
    }
  };

  const currentSpecs = subcategory[formData.category] || [];
  const filteredSpecs = currentSpecs.filter((spec) => spec.toLowerCase().includes(subcategorySearch.toLowerCase()));
  const availableSpecs = filteredSpecs.filter((spec) => !formData.subcategory?.includes(spec));

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

  const removeSpec = (spec) => {
    setFormData((prev) => ({
      ...prev,
      subcategory: prev.subcategory.filter((s) => s !== spec),
    }));
  };

  const handleSpecKeyPress = (e) => {
    if (e.key === "Enter" && subcategorySearch.trim()) {
      e.preventDefault();
      handleSpecSelect(subcategorySearch.trim());
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = tagInput.trim().toLowerCase();
      if (value && !formData.tags?.includes(value)) {
        setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), value] }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleInput = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl shadow-slate-200/60 dark:shadow-black/40">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-cyan-50/20 dark:from-emerald-950/20 dark:via-transparent dark:to-teal-950/10 pointer-events-none" />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <NotebookText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">Issue Details</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Fill in all required fields to continue</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div data-tutorial="details-title">
            <label htmlFor="title" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInput("title", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 font-medium ${
                errors.title ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200/40" : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 bg-white/90 dark:bg-slate-800/80"
              } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
              placeholder="e.g., Broken streetlight on Main Street"
            />
            {errors.title && (
              <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/20">
                <AlertCircle size={14} className="flex-shrink-0" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Description */}
          <div data-tutorial="details-description">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="description" className="block text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide">
                Description <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs font-semibold tabular-nums ${formData.description.length < 20 ? "text-amber-500" : "text-emerald-600"}`}>
                {formData.description.length}/500
              </span>
            </div>
            <textarea
              id="description"
              rows={5}
              value={formData.description}
              onChange={(e) => handleInput("description", e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 resize-none transition-all outline-none focus:ring-4 font-medium leading-relaxed ${
                errors.description ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200/40" : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 bg-white/90 dark:bg-slate-800/80"
              } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500`}
              placeholder="Describe the issue in detail..."
            />
            {errors.description && (
              <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/20">
                <AlertCircle size={14} className="flex-shrink-0" />
                {errors.description}
              </div>
            )}
          </div>

          {/* Classification Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Classification</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Category */}
            <div className="relative" data-tutorial="details-category">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
                Category <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowDropdown((prev) => !prev)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 font-medium ${
                  errors.category
                    ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200/40"
                    : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-200/50 bg-white/90 dark:bg-slate-800/80"
                } text-slate-900 dark:text-slate-100`}
              >
                <span className="flex items-center gap-2">
                  {formData.category ? (
                    <>
                      {(() => {
                        const selected = categories.find((cat) => cat.value === formData.category);
                        const Icon = selected?.icon;
                        return Icon ? <><Icon className={`w-5 h-5 ${selected.color}`} /><span className="font-semibold">{selected.label}</span></> : <span className="text-slate-400">Select a category</span>;
                      })()}
                    </>
                  ) : <span className="text-slate-400">Select a category</span>}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>
              {showDropdown && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = formData.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => { handleInput("category", cat.value); setShowDropdown(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all ${isSelected ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700" : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 ${isSelected ? "bg-emerald-100" : ""}`}><Icon className={`w-4 h-4 ${cat.color}`} /></span>
                          <span className="font-medium">{cat.label}</span>
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.category && (
                <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {errors.category}
                </div>
              )}
            </div>

            {/* Severity */}
            <div data-tutorial="details-severity">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">
                Severity Level <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {severityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleInput("priority", level.value)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${formData.priority === level.value ? `${level.color} ring-4 scale-[1.04] shadow-md` : "bg-white/80 dark:bg-slate-800/80 text-slate-500 border-slate-200 dark:border-slate-700 hover:-translate-y-0.5"}`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
              {errors.priority && (
                <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {errors.priority}
                </div>
              )}
            </div>

            {formData.category === "other" && (
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={formData.otherCategoryName}
                  onChange={(e) => handleInput("otherCategoryName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all outline-none bg-white/90 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
                  placeholder="Describe other category..."
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Tags & Subcategories</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          </div>

          {/* Subcategories */}
          <div data-tutorial="details-subcategory">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">Sub-Categories <span className="text-red-500">*</span></label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.subcategory?.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700/50 rounded-full px-3 py-1.5 shadow-sm">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{s}</span>
                    <button type="button" onClick={() => removeSpec(s)} className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-800/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-emerald-600 dark:text-emerald-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ml-1 shadow-sm">
                      <X size={10} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={subcategorySearch}
                onChange={(e) => setSpecialisationSearch(e.target.value)}
                onKeyPress={handleSpecKeyPress}
                onFocus={() => setShowSpecDropdown(true)}
                onBlur={() => setTimeout(() => setShowSpecDropdown(false), 150)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 font-medium ${
                  errors.subcategory
                    ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200/40"
                    : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200/50 bg-white/90 dark:bg-slate-800/80"
                } text-slate-900 dark:text-slate-100`}
                placeholder="Search or add sub-category..."
              />
              {showSpecDropdown && (subcategorySearch || availableSpecs.length > 0) && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                  {subcategorySearch && !currentSpecs.includes(subcategorySearch) && (
                    <button type="button" onMouseDown={() => handleSpecSelect(subcategorySearch)} className="w-full px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-left text-sm font-bold text-emerald-600 border-b border-slate-100 dark:border-slate-700">
                      Add "{subcategorySearch}"
                    </button>
                  )}
                  {availableSpecs.map((s) => (
                    <button key={s} type="button" onMouseDown={() => handleSpecSelect(s)} className="w-full px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-left text-sm text-slate-700 dark:text-slate-200 transition-colors font-medium">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.subcategory && (
              <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/20">
                <AlertCircle size={14} className="flex-shrink-0" />
                {errors.subcategory}
              </div>
            )}
          </div>

          {/* Tags */}
          <div data-tutorial="details-tags">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">Issue Tags</label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-700/50 rounded-full px-3 py-1.5 shadow-sm">
                    <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">#{t}</span>
                    <button type="button" onClick={() => handleRemoveTag(t)} className="p-1 rounded-full bg-cyan-100 dark:bg-cyan-800/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-cyan-600 dark:text-cyan-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 ml-1 shadow-sm">
                      <X size={10} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/50 transition-all outline-none bg-white/90 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Type tag and press Enter..."
              />
            </div>
          </div>

          {/* Evidence */}
          <div data-tutorial="details-media" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Evidence</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">Photo Evidence <span className="text-red-500">*</span></label>
              <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                uploading ? "opacity-60 bg-gray-100/50 dark:bg-slate-800/50" : 
                errors.photos ? "border-red-300 bg-red-50/30 dark:border-red-500/50 dark:bg-red-900/10 hover:border-red-400 dark:hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20" : 
                "bg-gray-50/50 dark:bg-gray-800/50 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 shadow-sm"
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? <Loader2 className="w-8 h-8 animate-spin text-emerald-500" /> : <><Camera className="w-10 h-10 text-gray-400 mb-2" /><p className="text-sm font-medium text-gray-600 dark:text-gray-300">Click or drag and drop</p></>}
                </div>
                <input ref={imageInputRef} type="file" multiple hidden accept="image/*" disabled={uploading} onChange={handleImageUpload} />
              </label>
              {images.length > 0 && <div className="mt-4"><ImageCarousel images={images} removeMedia={removeMedia} /></div>}
              {errors.photos && (
                <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5 font-bold tracking-wide animate-in fade-in slide-in-from-top-1 duration-200 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {errors.photos}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-wide">Video Evidence (Optional)</label>
              <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all cursor-pointer ${uploadingVideo ? "bg-emerald-50" : "bg-gray-50 dark:bg-gray-800 hover:border-emerald-500"}`}>
                <div className="flex flex-col items-center justify-center">
                  {uploadingVideo ? <Loader2 className="w-8 h-8 animate-spin text-emerald-600" /> : <><Video className="w-10 h-10 text-gray-400 mb-2" /><p className="text-sm font-medium text-gray-600 dark:text-gray-300">Upload Video</p></>}
                </div>
                <input ref={videoInputRef} type="file" hidden accept="video/*" disabled={uploadingVideo || isVideoDisabled} onChange={handleVideoUpload} />
              </label>
              {video && <div className="relative mt-3 rounded-xl overflow-hidden shadow-lg"><MediaPreview storageId={video} isVideo /><button onClick={() => removeMedia(video, "video")} className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-full text-white"><X size={14} /></button></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsCard;
