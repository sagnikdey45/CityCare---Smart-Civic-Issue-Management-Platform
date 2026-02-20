import {
  X,
  Calendar,
  MapPin,
  Tag,
  Clock,
  User,
  CheckCircle,
  PlayCircle,
  MessageSquare,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { IssueDiscussion } from "../IssueDiscussion";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  in_progress: "bg-blue-100 text-blue-800 border-blue-300",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const categoryLabels = {
  road: "Road & Infrastructure",
  lighting: "Street Lighting",
  waste: "Waste Management",
  water: "Water Supply",
  other: "Other",
};

const categoryIcons = {
  road: "🛣️",
  lighting: "💡",
  waste: "🗑️",
  water: "💧",
  other: "📋",
};

export function OfficerIssueModal({
  issue,
  onClose,
  onStatusUpdate,
  officerRole,
}) {
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [showStartForm, setShowStartForm] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [completionData, setCompletionData] = useState({
    workDone: "",
    materialsUsed: "",
    timeSpent: "",
    teamSize: "",
    estimatedDuration: "",
    additionalNotes: "",
  });

  const [startWorkData, setStartWorkData] = useState({
    estimatedTime: "",
    teamAssigned: "",
    plannedApproach: "",
  });

  if (!issue) return null;

  function handleStartWork() {
    if (issue.status !== "pending") return;

    const comment = `Started working on this issue.\n\nEstimated Time: ${startWorkData.estimatedTime || "Not specified"}\nTeam: ${startWorkData.teamAssigned || "Not specified"}\nApproach: ${startWorkData.plannedApproach || "Standard procedure"}`;

    onStatusUpdate(issue.id, "in_progress", comment);
    setShowStartForm(false);
    setStartWorkData({
      estimatedTime: "",
      teamAssigned: "",
      plannedApproach: "",
    });
  }

  function handleCompleteWork() {
    if (issue.status !== "in_progress") return;

    if (!completionData.workDone.trim()) {
      alert("Please describe the work that was completed");
      return;
    }

    const comment = `Work completed successfully.\n\n📋 Work Done:\n${completionData.workDone}\n\n${completionData.materialsUsed ? `🔧 Materials/Resources Used:\n${completionData.materialsUsed}\n\n` : ""}${completionData.timeSpent ? `⏱️ Time Spent: ${completionData.timeSpent}\n` : ""}${completionData.teamSize ? `👥 Team Size: ${completionData.teamSize}\n` : ""}${completionData.estimatedDuration ? `📅 Expected Duration: ${completionData.estimatedDuration}\n` : ""}${completionData.additionalNotes ? `\n📝 Additional Notes:\n${completionData.additionalNotes}` : ""}`;

    onStatusUpdate(issue.id, "resolved", comment);
    setShowCompletionForm(false);
    setCompletionData({
      workDone: "",
      materialsUsed: "",
      timeSpent: "",
      teamSize: "",
      estimatedDuration: "",
      additionalNotes: "",
    });
  }

  const roleTitle =
    officerRole === "unit_officer" ? "Ward Officer" : "Field Officer";
  const canStart = issue.status === "pending";
  const canComplete = issue.status === "in_progress";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-6 flex justify-between items-start rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold">{issue.title}</h2>
            <p className="text-teal-100 text-sm mt-1 font-mono">
              {issue.ticket}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-teal-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="border-b border-gray-200 bg-white sticky top-[108px] z-10">
          <div className="flex">
            <button
              onClick={() => setActiveTab("details")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === "details"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <FileText size={18} className="inline mr-2" />
              Issue Details
            </button>
            <button
              onClick={() => setActiveTab("discussion")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === "discussion"
                  ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <MessageSquare size={18} className="inline mr-2" />
              Discussion
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "details" && (
            <>
              {(canStart || canComplete) && (
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    {officerRole === "unit_officer" ? "🏛️" : "🔧"} {roleTitle}{" "}
                    Actions
                  </h3>

                  {!showStartForm && !showCompletionForm && (
                    <div className="flex gap-3">
                      {canStart && (
                        <button
                          onClick={() => setShowStartForm(true)}
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <PlayCircle size={20} className="mr-2" />
                          Start Work
                        </button>
                      )}
                      {canComplete && (
                        <button
                          onClick={() => setShowCompletionForm(true)}
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <CheckCircle size={20} className="mr-2" />
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  )}

                  {showStartForm && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <PlayCircle
                            size={18}
                            className="mr-2 text-blue-600"
                          />
                          Starting Work - Provide Details
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Estimated Time to Complete
                            </label>
                            <input
                              type="text"
                              value={startWorkData.estimatedTime}
                              onChange={(e) =>
                                setStartWorkData({
                                  ...startWorkData,
                                  estimatedTime: e.target.value,
                                })
                              }
                              placeholder="e.g., 2-3 hours, 1 day, 1 week"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Team/Personnel Assigned
                            </label>
                            <input
                              type="text"
                              value={startWorkData.teamAssigned}
                              onChange={(e) =>
                                setStartWorkData({
                                  ...startWorkData,
                                  teamAssigned: e.target.value,
                                })
                              }
                              placeholder="e.g., 2 workers, Maintenance team A"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Planned Approach
                            </label>
                            <textarea
                              value={startWorkData.plannedApproach}
                              onChange={(e) =>
                                setStartWorkData({
                                  ...startWorkData,
                                  plannedApproach: e.target.value,
                                })
                              }
                              placeholder="Briefly describe how you plan to address this issue..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={handleStartWork}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Confirm & Start
                          </button>
                          <button
                            onClick={() => {
                              setShowStartForm(false);
                              setStartWorkData({
                                estimatedTime: "",
                                teamAssigned: "",
                                plannedApproach: "",
                              });
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {showCompletionForm && (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <CheckCircle
                            size={18}
                            className="mr-2 text-emerald-600"
                          />
                          Complete Work - Document Your Work
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <span className="text-red-500">*</span> Work
                              Completed (Required)
                            </label>
                            <textarea
                              value={completionData.workDone}
                              onChange={(e) =>
                                setCompletionData({
                                  ...completionData,
                                  workDone: e.target.value,
                                })
                              }
                              placeholder="Describe in detail what work was completed, what was fixed/improved..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Materials/Resources Used
                            </label>
                            <textarea
                              value={completionData.materialsUsed}
                              onChange={(e) =>
                                setCompletionData({
                                  ...completionData,
                                  materialsUsed: e.target.value,
                                })
                              }
                              placeholder="List materials, equipment, or resources used..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Spent
                              </label>
                              <input
                                type="text"
                                value={completionData.timeSpent}
                                onChange={(e) =>
                                  setCompletionData({
                                    ...completionData,
                                    timeSpent: e.target.value,
                                  })
                                }
                                placeholder="e.g., 3 hours"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Team Size
                              </label>
                              <input
                                type="text"
                                value={completionData.teamSize}
                                onChange={(e) =>
                                  setCompletionData({
                                    ...completionData,
                                    teamSize: e.target.value,
                                  })
                                }
                                placeholder="e.g., 2 workers"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expected Duration/Warranty
                            </label>
                            <input
                              type="text"
                              value={completionData.estimatedDuration}
                              onChange={(e) =>
                                setCompletionData({
                                  ...completionData,
                                  estimatedDuration: e.target.value,
                                })
                              }
                              placeholder="e.g., Fix should last 2-3 years"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Additional Notes
                            </label>
                            <textarea
                              value={completionData.additionalNotes}
                              onChange={(e) =>
                                setCompletionData({
                                  ...completionData,
                                  additionalNotes: e.target.value,
                                })
                              }
                              placeholder="Any other important information, follow-up needed, etc..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none"
                            />
                          </div>
                        </div>

                        {!completionData.workDone.trim() && (
                          <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle
                              size={18}
                              className="text-amber-600 flex-shrink-0 mt-0.5"
                            />
                            <p className="text-sm text-amber-800">
                              Please describe the work completed before
                              submitting
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={handleCompleteWork}
                            disabled={!completionData.workDone.trim()}
                            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Submit & Mark Complete
                          </button>
                          <button
                            onClick={() => {
                              setShowCompletionForm(false);
                              setCompletionData({
                                workDone: "",
                                materialsUsed: "",
                                timeSpent: "",
                                teamSize: "",
                                estimatedDuration: "",
                                additionalNotes: "",
                              });
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!canStart && !canComplete && (
                    <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-4 text-center">
                      <CheckCircle
                        size={24}
                        className="inline text-emerald-600 mb-2"
                      />
                      <p className="text-emerald-800 font-medium">
                        This issue has been completed
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${
                    statusColors[issue.status] || statusColors.pending
                  }`}
                >
                  {statusLabels[issue.status] || issue.status}
                </span>
                <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
                  <Tag size={16} className="mr-1" />
                  {categoryIcons[issue.category]}{" "}
                  {categoryLabels[issue.category]}
                </div>
                <div
                  className={`flex items-center text-sm px-3 py-2 rounded-full font-medium ${
                    issue.severity === "high"
                      ? "bg-red-100 text-red-800"
                      : issue.severity === "medium"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {issue.severity.toUpperCase()} Priority
                </div>
              </div>

              {issue.photoUrl && (
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={issue.photoUrl}
                    alt={issue.title}
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {issue.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Calendar size={18} className="mr-2 text-teal-600" />
                  <div>
                    <p className="font-medium">Reported</p>
                    <p>{new Date(issue.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Clock size={18} className="mr-2 text-teal-600" />
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p>{new Date(issue.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {issue.address && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start text-sm text-blue-900">
                    <MapPin
                      size={20}
                      className="mr-2 mt-1 flex-shrink-0 text-blue-600"
                    />
                    <div>
                      <p className="font-medium mb-1">Location</p>
                      <p>{issue.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {issue.reporter && (
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <User size={18} className="mr-2 text-gray-500" />
                  <span>
                    Reported by:{" "}
                    <span className="font-medium">
                      {issue.reporter.full_name}
                    </span>
                  </span>
                </div>
              )}

              {issue.upvotes > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 font-medium">
                    👍 {issue.upvotes}{" "}
                    {issue.upvotes === 1 ? "citizen has" : "citizens have"}{" "}
                    upvoted this issue
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "discussion" && <IssueDiscussion issueId={issue.id} />}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
