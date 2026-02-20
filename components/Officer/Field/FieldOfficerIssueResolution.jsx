import { useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  Tag,
  User,
  CheckCircle,
  PlayCircle,
  Camera,
  Upload,
  AlertCircle,
  Clock,
  ExternalLink,
  Package,
  MessageCircle,
  ChevronRight,
  FileText,
  MapPinned,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { PhotoUploadZone } from "./PhotoUploadZone";
import { Toast } from "./Toast";

const statusColors = {
  pending:
    "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600",
  in_progress:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
  resolved:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
  rejected:
    "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700",
};

const categoryLabels = {
  road: "Road & Infrastructure",
  lighting: "Street Lighting",
  waste: "Waste Management",
  water: "Water Supply",
  other: "Other",
};

export function FieldOfficerIssueResolution({
  issue,
  onClose,
  onStatusUpdate,
}) {
  const [currentStatus, setCurrentStatus] = useState(
    issue?.status || "pending",
  );
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [beforeWorkLocation, setBeforeWorkLocation] = useState(null);
  const [afterWorkLocation, setAfterWorkLocation] = useState(null);
  const [resolutionComment, setResolutionComment] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState(null);

  if (!issue) return null;

  const isAssigned = currentStatus === "pending";
  const isInProgress = currentStatus === "in_progress";
  const isResolved = currentStatus === "resolved";

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleBeforePhotoChange = (photo, location) => {
    setBeforePhoto(photo);
    if (location) {
      setBeforeWorkLocation(location);
      showToast("Before work photo captured with location", "success");
    } else if (photo === null) {
      setBeforeWorkLocation(null);
    }
  };

  const handleAfterPhotoChange = (photo, location) => {
    setAfterPhoto(photo);
    if (location) {
      setAfterWorkLocation(location);
      showToast("After work photo captured with location", "success");
    } else if (photo === null) {
      setAfterWorkLocation(null);
    }
  };

  const handleMarkInProgress = () => {
    setCurrentStatus("in_progress");
    onStatusUpdate(
      issue.id,
      "in_progress",
      "Field officer marked issue as in progress",
    );
    showToast("Issue marked as In Progress", "success");
  };

  const handleSubmitResolution = () => {
    if (!beforePhoto) {
      showToast("Please upload before work photo", "error");
      return;
    }
    if (!afterPhoto) {
      showToast("Please upload after work photo", "error");
      return;
    }
    if (resolutionComment.trim().length < 20) {
      showToast(
        "Please provide a detailed resolution comment (minimum 20 characters)",
        "error",
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmitResolution = () => {
    setCurrentStatus("resolved");
    let fullComment = `Work completed successfully.\n\nResolution Details:\n${resolutionComment}\n\nBefore Photo: Uploaded`;

    if (beforeWorkLocation) {
      fullComment += `\nBefore Work Location: ${beforeWorkLocation.lat.toFixed(6)}, ${beforeWorkLocation.lng.toFixed(6)}`;
    }

    fullComment += `\nAfter Photo: Uploaded`;

    if (afterWorkLocation) {
      fullComment += `\nAfter Work Location: ${afterWorkLocation.lat.toFixed(6)}, ${afterWorkLocation.lng.toFixed(6)}`;
    }

    onStatusUpdate(issue.id, "resolved", fullComment);
    setShowConfirmModal(false);
    showToast("Issue submitted for verification successfully!", "success");
    setTimeout(() => onClose(), 2000);
  };

  const getProgressSteps = () => {
    const steps = [
      { label: "Assigned", status: "pending", active: true },
      {
        label: "In Progress",
        status: "in_progress",
        active: isInProgress || isResolved,
      },
      {
        label: "Awaiting Verification",
        status: "resolved",
        active: isResolved,
      },
    ];
    return steps;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900 text-white p-6 flex justify-between items-start z-10 shadow-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                  Logged in as: Field Officer
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">
                {issue.title}
              </h2>
              <p className="text-blue-100 text-sm font-mono">
                {issue.ticket_id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-lg p-2"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {getProgressSteps().map((step, index) => (
                <div key={step.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        step.active
                          ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white shadow-lg shadow-blue-500/50"
                          : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {step.active ? (
                        <CheckCircle size={20} />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-current" />
                      )}
                    </div>
                    <p
                      className={`text-xs mt-2 font-medium ${
                        step.active
                          ? "text-blue-700 dark:text-blue-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < getProgressSteps().length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                        getProgressSteps()[index + 1].active
                          ? "bg-blue-600 dark:bg-blue-500"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rework Alert Banner */}
          {issue.rework_requested && (
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white px-6 py-4 border-y-4 border-red-700 shadow-xl">
              <div className="flex items-center gap-4 max-w-6xl mx-auto">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl animate-pulse">
                  <AlertTriangle className="text-white" size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <RotateCcw size={20} />
                      REWORK REQUIRED - Immediate Attention Needed
                    </h3>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mt-2">
                    <p className="font-semibold text-sm mb-1">
                      Ward Officer Review:
                    </p>
                    <p className="text-sm leading-relaxed">
                      {issue.rework_reason}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left Section - Issue Details */}
              <div className="space-y-6">
                <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/60 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText
                      className="text-blue-600 dark:text-blue-400"
                      size={24}
                    />
                    Issue Details
                  </h3>

                  {/* Status & Category Badges */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${statusColors[currentStatus]}`}
                    >
                      {currentStatus === "pending"
                        ? "Assigned"
                        : currentStatus === "in_progress"
                          ? "In Progress"
                          : "Awaiting Verification"}
                    </span>
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-700">
                      <Tag className="inline mr-1" size={14} />
                      {categoryLabels[issue.category]}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                        issue.severity === "high"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700"
                          : issue.severity === "medium"
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {issue.severity.toUpperCase()} Priority
                    </span>
                  </div>

                  {/* Citizen's Issue Photo */}
                  {issue.photo_url && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Camera
                          className="text-blue-600 dark:text-blue-400"
                          size={18}
                        />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Citizen's Reported Issue Photo
                        </h4>
                      </div>
                      <div className="rounded-xl overflow-hidden shadow-lg border-2 border-blue-300 dark:border-blue-700">
                        <img
                          src={issue.photo_url}
                          alt={issue.title}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 mb-6 border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                      Description
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {/* Location */}
                  {issue.address && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <MapPinned
                          className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1"
                          size={20}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                            Location
                          </p>
                          <p className="text-blue-800 dark:text-blue-300 text-sm">
                            {issue.address}
                          </p>
                        </div>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Meta Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Calendar
                        className="text-blue-600 dark:text-blue-400"
                        size={18}
                      />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Date Assigned
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100 font-semibold">
                          {new Date(issue.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Clock
                        className="text-blue-600 dark:text-blue-400"
                        size={18}
                      />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Last Updated
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100 font-semibold">
                          {new Date(issue.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reporter Info */}
                  {issue.reporter && (
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg mt-3 border border-slate-200 dark:border-slate-700">
                      <User
                        className="text-slate-600 dark:text-slate-400"
                        size={18}
                      />
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Citizen Name
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100 font-semibold">
                          {issue.reporter.full_name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upvotes */}
                  {issue.upvotes > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-4 mt-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          className="text-orange-600 dark:text-orange-400"
                          size={20}
                        />
                        <p className="text-orange-800 dark:text-orange-300 font-semibold">
                          {issue.upvotes}{" "}
                          {issue.upvotes === 1
                            ? "citizen has"
                            : "citizens have"}{" "}
                          upvoted this issue
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section - Resolution Workflow */}
              <div className="space-y-6">
                {/* Before & After Photos Comparison Section */}
                {(beforePhoto || afterPhoto) && (
                  <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/60 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Camera
                        className="text-blue-600 dark:text-blue-400"
                        size={24}
                      />
                      Work Evidence Photos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Before Photo Display */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                            Before Work
                          </h4>
                          {beforePhoto && (
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle size={12} />
                              Uploaded
                            </span>
                          )}
                        </div>
                        {beforePhoto ? (
                          <div className="rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-lg">
                            <img
                              src={beforePhoto}
                              alt="Before work"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ) : (
                          <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-900/30">
                            <div className="text-center">
                              <Camera
                                className="text-slate-400 dark:text-slate-600 mx-auto mb-2"
                                size={32}
                              />
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                No photo yet
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* After Photo Display */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                            After Work
                          </h4>
                          {afterPhoto && (
                            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle size={12} />
                              Uploaded
                            </span>
                          )}
                        </div>
                        {afterPhoto ? (
                          <div className="rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-lg">
                            <img
                              src={afterPhoto}
                              alt="After work"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        ) : (
                          <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-900/30">
                            <div className="text-center">
                              <Camera
                                className="text-slate-400 dark:text-slate-600 mx-auto mb-2"
                                size={32}
                              />
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                No photo yet
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {beforePhoto && afterPhoto && (
                      <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                        <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium text-center">
                          ✓ Both photos captured successfully
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/60 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Package
                      className="text-blue-600 dark:text-blue-400"
                      size={24}
                    />
                    Resolution Workflow
                  </h3>

                  {/* Step 1: Start Work */}
                  {isAssigned && (
                    <div className="space-y-6 mb-6">
                      {/* Citizen's Issue Photo - Prominent Display */}
                      {issue.photo_url && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-amber-300 dark:border-amber-700">
                          <div className="flex items-center gap-2 mb-4">
                            <Camera
                              className="text-amber-600 dark:text-amber-400"
                              size={20}
                            />
                            <h4 className="text-lg font-bold text-amber-900 dark:text-amber-200">
                              Citizen's Reported Issue Photo
                            </h4>
                          </div>
                          <p className="text-amber-800 dark:text-amber-300 text-sm mb-4">
                            This is the original photo submitted by the citizen.
                            Review it carefully before starting work.
                          </p>
                          <div className="rounded-xl overflow-hidden border-3 border-amber-400 dark:border-amber-600 shadow-2xl">
                            <img
                              src={issue.photo_url}
                              alt={issue.title}
                              className="w-full h-72 object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            1
                          </div>
                          <h4 className="text-lg font-bold text-blue-900 dark:text-blue-200">
                            Start Work
                          </h4>
                        </div>
                        <p className="text-blue-800 dark:text-blue-300 mb-4 text-sm">
                          Ready to begin? Click below to mark this issue as in
                          progress. You'll then capture before and after photos
                          with your live location.
                        </p>
                        <button
                          onClick={handleMarkInProgress}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/50 dark:shadow-blue-900/50 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <PlayCircle size={20} />
                          Mark as In Progress
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Before Work Photo */}
                  {isInProgress && (
                    <>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            2
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                            Before Work Photo
                          </h4>
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-bold px-2 py-1 rounded">
                            Required
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                          Upload a photo showing the site condition before
                          starting work
                        </p>
                        <PhotoUploadZone
                          photo={beforePhoto}
                          onPhotoChange={handleBeforePhotoChange}
                          label="Before Work"
                          captureLocation={true}
                        />
                        {beforeWorkLocation && (
                          <div className="mt-3 flex items-center gap-2 text-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                            <MapPinned
                              className="text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                              size={16}
                            />
                            <div className="flex-1">
                              <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                                Location captured
                              </p>
                              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                                {beforeWorkLocation.lat.toFixed(6)},{" "}
                                {beforeWorkLocation.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step 3: After Work Photo */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            3
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                            After Work Photo
                          </h4>
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-bold px-2 py-1 rounded">
                            Required
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                          Upload completion evidence showing the resolved issue
                        </p>
                        <PhotoUploadZone
                          photo={afterPhoto}
                          onPhotoChange={handleAfterPhotoChange}
                          label="After Work"
                          captureLocation={true}
                        />
                        {afterWorkLocation && (
                          <div className="mt-3 flex items-center gap-2 text-sm bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                            <MapPinned
                              className="text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                              size={16}
                            />
                            <div className="flex-1">
                              <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                                Location captured
                              </p>
                              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                                {afterWorkLocation.lat.toFixed(6)},{" "}
                                {afterWorkLocation.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step 4: Resolution Comment */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            4
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                            Resolution Comment
                          </h4>
                          <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-bold px-2 py-1 rounded">
                            Required
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                          Describe the work completed, materials used, and
                          observations
                        </p>
                        <textarea
                          value={resolutionComment}
                          onChange={(e) => setResolutionComment(e.target.value)}
                          placeholder="Example: Removed accumulated garbage (approx. 50kg). Used municipal waste bags and sanitized the area. Installed signage to prevent future dumping. Work completed by 2-person team in 1.5 hours."
                          className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none transition-all"
                          rows={6}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <p
                            className={`text-xs font-medium ${
                              resolutionComment.length >= 20
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {resolutionComment.length} characters (minimum 20)
                          </p>
                          {resolutionComment.length > 0 &&
                            resolutionComment.length < 20 && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                {20 - resolutionComment.length} more needed
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Step 5: Submit Resolution */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-emerald-600 dark:bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                            5
                          </div>
                          <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                            Submit for Verification
                          </h4>
                        </div>

                        {(!beforePhoto ||
                          !afterPhoto ||
                          resolutionComment.length < 20) && (
                          <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <AlertCircle
                              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                              size={18}
                            />
                            <div className="text-sm text-amber-800 dark:text-amber-300">
                              <p className="font-semibold mb-1">
                                Complete all required fields:
                              </p>
                              <ul className="list-disc list-inside space-y-1">
                                {!beforePhoto && (
                                  <li>Upload before work photo</li>
                                )}
                                {!afterPhoto && (
                                  <li>Upload after work photo</li>
                                )}
                                {resolutionComment.length < 20 && (
                                  <li>Add detailed resolution comment</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleSubmitResolution}
                          disabled={
                            !beforePhoto ||
                            !afterPhoto ||
                            resolutionComment.length < 20
                          }
                          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-emerald-500 dark:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg shadow-emerald-500/50 dark:shadow-emerald-900/50 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                        >
                          <CheckCircle size={20} />
                          Submit for Verification
                        </button>
                      </div>
                    </>
                  )}

                  {/* Resolved State */}
                  {isResolved && (
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-8 border-2 border-emerald-200 dark:border-emerald-800 text-center">
                      <div className="bg-emerald-600 dark:bg-emerald-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <h4 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mb-2">
                        Work Submitted!
                      </h4>
                      <p className="text-emerald-800 dark:text-emerald-300">
                        This issue has been submitted for verification and is
                        awaiting approval.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="backdrop-blur-md bg-white/70 dark:bg-slate-800/60 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wide">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <MessageCircle
                          className="text-blue-600 dark:text-blue-400"
                          size={18}
                        />
                        <span className="text-slate-900 dark:text-white font-medium text-sm">
                          Contact Citizen
                        </span>
                      </div>
                      <ChevronRight
                        className="text-slate-400 dark:text-slate-500"
                        size={18}
                      />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <MapPin
                          className="text-blue-600 dark:text-blue-400"
                          size={18}
                        />
                        <span className="text-slate-900 dark:text-white font-medium text-sm">
                          View on Map
                        </span>
                      </div>
                      <ChevronRight
                        className="text-slate-400 dark:text-slate-500"
                        size={18}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">
              Confirm Submission
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              Are you sure you want to submit this issue for verification? This
              action will notify the ward officer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmitResolution}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 dark:hover:from-emerald-600 dark:hover:to-emerald-700 transition-all shadow-lg"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
