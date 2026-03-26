import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  Camera,
  MessageCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { IssueDiscussion } from "./IssueDiscussion";
import { getUpdatesByIssueId } from "../lib/mockData";
import { IssueMessaging } from "./Citizen/IssueMessaging";

const statusSteps = [
  {
    status: "pending",
    label: "Reported",
    icon: AlertCircle,
    description: "Issue submitted and awaiting review",
  },
  {
    status: "in_progress",
    label: "In Progress",
    icon: Clock,
    description: "Work has started on resolving this issue",
  },
  {
    status: "resolved",
    label: "Resolved",
    icon: CheckCircle,
    description: "Issue has been successfully resolved",
  },
];

export function IssueDetailModal({ issue, onClose }) {
  const [activeTab, setActiveTab] = useState("progress");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [issueUpdates, setIssueUpdates] = useState([]);

  useEffect(() => {
    if (issue) {
      console.log("Fetching issue updates for issue:", issue.id);
      const updates = getUpdatesByIssueId(issue.id);
      console.log("Fetched issue updates:", updates);
      setIssueUpdates(updates);
    }
  }, [issue]);

  if (!issue) return null;

  const allPhotos = issue.photo_url
    ? [issue.photo_url, ...(issue.additional_photos || [])]
    : issue.additional_photos || [];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + allPhotos.length) % allPhotos.length,
    );
  };

  const currentStepIndex =
    issue.status === "resolved"
      ? 2
      : issue.status === "in_progress"
        ? 1
        : issue.status === "rejected"
          ? -1
          : 0;

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDaysSince(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / 86400000);
  }

  const daysSinceReported = getDaysSince(issue.created_at);

  const statusColors = {
    pending: {
      gradient: "from-amber-500 to-yellow-600",
      light: "from-amber-50 to-yellow-50/50",
      border: "border-amber-300",
      text: "text-amber-600",
      bg: "bg-amber-100",
      badgeBg: "bg-amber-50",
      iconBg: "bg-amber-500",
      circleBorder: "border-amber-500",
      lineGradient: "from-amber-500 to-yellow-600",
    },
    in_progress: {
      gradient: "from-blue-600 to-indigo-700",
      light: "from-blue-50 to-indigo-50/50",
      border: "border-blue-300",
      text: "text-blue-600",
      bg: "bg-blue-100",
      badgeBg: "bg-blue-50",
      iconBg: "bg-blue-500",
      circleBorder: "border-blue-500",
      lineGradient: "from-blue-500 to-indigo-600",
    },
    resolved: {
      gradient: "from-emerald-500 to-green-600",
      light: "from-emerald-50 to-green-50/50",
      border: "border-emerald-300",
      text: "text-emerald-600",
      bg: "bg-emerald-100",
      badgeBg: "bg-emerald-50",
      iconBg: "bg-emerald-500",
      circleBorder: "border-emerald-500",
      lineGradient: "from-emerald-500 to-green-600",
    },
    rejected: {
      gradient: "from-red-500 to-red-700",
      light: "from-red-50 to-red-100/50",
      border: "border-red-300",
      text: "text-red-600",
      bg: "bg-red-100",
      badgeBg: "bg-red-50",
      iconBg: "bg-red-500",
      circleBorder: "border-red-500",
      lineGradient: "from-red-500 to-red-700",
    },
  };

  const currentColors = statusColors[issue.status] || statusColors.pending;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        className={`bg-white rounded-2xl ${isFullscreen ? "w-full h-full max-w-none max-h-none" : "max-w-4xl w-full max-h-[90vh]"} flex flex-col shadow-2xl animate-slideUp overflow-hidden transition-all duration-300`}
      >
        <div
          className={`relative bg-gradient-to-r ${currentColors.gradient} p-6 text-white`}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="pr-24">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-3">
              {issue.ticket_id}
            </span>
            <h2 className="text-3xl font-bold mb-2">{issue.title}</h2>
            <p className="text-blue-100 text-sm">
              Tracking your issue progress
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 px-6">
            <button
              onClick={() => setActiveTab("progress")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === "progress"
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <TrendingUp size={18} />
              <span>Progress</span>
            </button>

            {!issue.is_anonymous && (
              <button
                onClick={() => setActiveTab("discussion")}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                  activeTab === "discussion"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <MessageSquare size={18} />
                <span>Discussion</span>
              </button>
            )}

            {(issue.assignee || issue.unit_officer) && (
              <button
                onClick={() => setActiveTab("messages")}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                  activeTab === "messages"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <MessageCircle size={18} />
                <span>Messages</span>
              </button>
            )}
          </div>
        </div>

        <div
          className={`flex-1 overflow-y-auto ${activeTab === "messages" ? "p-0" : "p-6"}`}
        >
          {activeTab === "progress" && (
            <div>
              {issue.status === "rejected" ? (
                <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl border-2 border-red-300 p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-500 p-3 rounded-full">
                      <XCircle className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900 mb-1">
                        Issue Rejected
                      </h3>
                      <p className="text-red-700 text-sm">
                        This issue was reviewed and could not be processed.
                        Please check the details or contact support for more
                        information.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    Progress Timeline
                  </h3>

                  {issueUpdates.length > 0 ? (
                    <div className="relative">
                      {issueUpdates.map((update, index) => {
                        const isLastUpdate = index === issueUpdates.length - 1;
                        const stepColors = statusColors[update.status];
                        const StatusIcon =
                          update.status === "resolved"
                            ? CheckCircle
                            : update.status === "in_progress"
                              ? Clock
                              : update.status === "rejected"
                                ? XCircle
                                : AlertCircle;

                        return (
                          <div
                            key={update.id}
                            className="relative flex gap-4 pb-6 last:pb-0"
                          >
                            {!isLastUpdate && (
                              <div
                                className={`absolute left-[18px] top-[40px] w-0.5 h-[calc(100%-16px)] bg-gradient-to-b ${stepColors.lineGradient}`}
                              />
                            )}

                            <div
                              className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-4 bg-gradient-to-br ${stepColors.gradient} border-${update.status === "pending" ? "amber" : update.status === "resolved" ? "emerald" : update.status === "rejected" ? "red" : "blue"}-100 shadow-lg ${isLastUpdate ? "animate-pulse" : ""}`}
                            >
                              <StatusIcon size={18} className="text-white" />
                            </div>

                            <div className="flex-1 pt-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span
                                  className={`text-xs font-semibold ${stepColors.text} ${stepColors.badgeBg} px-2 py-1 rounded-full uppercase`}
                                >
                                  {update.status === "in_progress"
                                    ? "In Progress"
                                    : update.status === "resolved"
                                      ? "Resolved"
                                      : update.status === "rejected"
                                        ? "Rejected"
                                        : "Pending"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(update.created_at).toLocaleString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                {update.comment}
                              </p>
                              {update.updater && (
                                <div className="flex items-center gap-2 mt-2">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                      update.updater.role === "admin"
                                        ? "bg-orange-600"
                                        : update.updater.role === "unit_officer"
                                          ? "bg-teal-600"
                                          : update.updater.role ===
                                              "field_officer"
                                            ? "bg-cyan-600"
                                            : "bg-gray-600"
                                    }`}
                                  >
                                    {update.updater.full_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-gray-700 font-medium">
                                      {update.updater.full_name}
                                    </span>
                                    <span className="text-gray-500"> • </span>
                                    <span className="text-gray-500 capitalize">
                                      {update.updater.role.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="relative">
                      {statusSteps.map((step, index) => {
                        const isCompleted =
                          index < currentStepIndex ||
                          (index === currentStepIndex &&
                            issue.status === "resolved");
                        const isCurrent =
                          index === currentStepIndex &&
                          issue.status !== "resolved";
                        const Icon = step.icon;

                        const stepColors = statusColors[step.status];

                        return (
                          <div
                            key={step.status}
                            className="relative flex gap-4 pb-8 last:pb-0"
                          >
                            {index < statusSteps.length - 1 && (
                              <div
                                className={`absolute left-[18px] top-[40px] w-0.5 h-[calc(100%-40px)] ${
                                  isCompleted
                                    ? `bg-gradient-to-b ${stepColors.lineGradient}`
                                    : "bg-gray-200"
                                }`}
                              />
                            )}

                            <div
                              className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                                isCompleted
                                  ? `bg-gradient-to-br ${stepColors.gradient} border-${step.status === "pending" ? "amber" : step.status === "resolved" ? "emerald" : "blue"}-100 shadow-lg`
                                  : isCurrent
                                    ? `bg-white ${stepColors.circleBorder} shadow-lg animate-pulse`
                                    : "bg-white border-gray-300"
                              }`}
                            >
                              <Icon
                                size={18}
                                className={
                                  isCompleted
                                    ? "text-white"
                                    : isCurrent
                                      ? stepColors.text
                                      : "text-gray-400"
                                }
                              />
                            </div>

                            <div className="flex-1 pt-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4
                                  className={`font-bold ${
                                    isCompleted || isCurrent
                                      ? "text-gray-900"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {step.label}
                                </h4>
                                {isCompleted && (
                                  <span
                                    className={`text-xs ${stepColors.text} ${stepColors.badgeBg} px-2 py-1 rounded-full font-medium`}
                                  >
                                    Completed
                                  </span>
                                )}
                                {isCurrent && (
                                  <span
                                    className={`text-xs ${stepColors.text} ${stepColors.badgeBg} px-2 py-1 rounded-full font-semibold`}
                                  >
                                    Current Stage
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="text-blue-600" size={20} />
                    </div>
                    <h4 className="font-semibold text-gray-900">Timeline</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reported:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(issue.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Open:</span>
                      <span className="font-medium text-gray-900">
                        {daysSinceReported} days
                      </span>
                    </div>
                    {issue.updated_at &&
                      issue.updated_at !== issue.created_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Update:</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(issue.updated_at)}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <TrendingUp className="text-emerald-600" size={20} />
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      Community Support
                    </h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upvotes:</span>
                      <span className="font-medium text-gray-900">
                        {issue.upvotes}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority Score:</span>
                      <span className="font-medium text-gray-900">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Severity:</span>
                      <span
                        className={`font-medium ${
                          issue.priority === "high"
                            ? "text-red-600"
                            : issue.priority === "medium"
                              ? "text-amber-600"
                              : "text-green-600"
                        }`}
                      >
                        {issue.priority.charAt(0).toUpperCase() +
                          issue.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Issue Details
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {issue.description}
                </p>

                {issue.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin
                      size={16}
                      className="text-gray-400 mt-0.5 flex-shrink-0"
                    />
                    <span>{issue.address}</span>
                  </div>
                )}
              </div>

              {issue.assignee && (
                <div
                  className={`bg-gradient-to-br ${currentColors.light} rounded-xl border ${currentColors.border} p-5 mb-6`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`bg-gradient-to-br ${currentColors.gradient} p-3 rounded-full`}
                    >
                      <User className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Assigned Officer
                      </h4>
                      <p className="text-sm text-gray-600">
                        {issue.assignee.full_name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {issue.assignee.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {allPhotos.length > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="text-gray-600" size={18} />
                      <h4 className="font-semibold text-gray-900">
                        Photo Evidence
                      </h4>
                    </div>
                    {allPhotos.length > 1 && (
                      <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        {currentPhotoIndex + 1} / {allPhotos.length}
                      </span>
                    )}
                  </div>

                  <div className="relative group">
                    <img
                      src={allPhotos[currentPhotoIndex]}
                      alt={`${issue.title} - Photo ${currentPhotoIndex + 1}`}
                      className="w-full rounded-lg shadow-md border border-gray-200"
                    />

                    {allPhotos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft size={20} className="text-gray-700" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                          aria-label="Next photo"
                        >
                          <ChevronRight size={20} className="text-gray-700" />
                        </button>

                        <div className="flex justify-center gap-2 mt-3">
                          {allPhotos.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPhotoIndex(index)}
                              className={`h-2 rounded-full transition-all ${
                                index === currentPhotoIndex
                                  ? "w-8 bg-blue-600"
                                  : "w-2 bg-gray-300 hover:bg-gray-400"
                              }`}
                              aria-label={`Go to photo ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "discussion" && !issue.is_anonymous && (
            <div>
              <IssueDiscussion issueId={issue.id} />
            </div>
          )}

          {activeTab === "messages" &&
            (issue.assignee || issue.unit_officer) && (
              <div className="h-full">
                <IssueMessaging issue={issue} />
              </div>
            )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 bg-gradient-to-r ${currentColors.gradient} text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
