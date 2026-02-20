import { useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Send,
  Image as ImageIcon,
  FileText,
  Users,
  Shield,
  Ban,
  RefreshCw,
  Edit,
  Lock,
  TrendingUp,
  ChevronLeft,
  Star,
  Briefcase,
  Award,
  MapPinned,
  VideoIcon,
  CircleCheckBig,
  Map,
  Camera,
} from "lucide-react";
import * as localStorageService from "@/lib/localStorageService";
import { mockUsers } from "@/lib/mockData";
import ImageCarousel from "./ImageCarousel";

export function WOIssueDetailPanel({
  issue,
  fieldOfficers,
  onClose,
  onUpdate,
  hideHeader = false,
}) {
  const user = mockUsers[2];
  const [activeTab, setActiveTab] = useState("overview");
  const [authenticityCheck, setAuthenticityCheck] = useState(
    issue.authenticity_checked || {
      location_valid: false,
      evidence_sufficient: false,
      not_duplicate: false,
      within_jurisdiction: false,
    },
  );
  const [rejectionCategory, setRejectionCategory] = useState("spam");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState(
    issue.assigned_to || "",
  );
  const [updateMessage, setUpdateMessage] = useState("");
  const [slaDate, setSlaDate] = useState(issue.sla_due_date || "");
  const [reworkReason, setReworkReason] = useState("");
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignReason, setReassignReason] = useState("");
  const [customReassignReason, setCustomReassignReason] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRevisedSLA, setShowRevisedSLA] = useState(false);
  const [revisedSlaDate, setRevisedSlaDate] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const reassignReasons = [
    "Field Officer Unavailable",
    "Workload too High",
    "Lacks Required Expertise",
    "Performance Issues",
    "Officer Requested Transfer",
    "Better Match Available",
    "Other",
  ];

  const overdueActions = [
    "Reassign to Different Officer",
    "Escalate to Admin",
    "Reject Due to Non-Feasibility",
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVerifyAndApprove = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedIssue = localStorageService.verifyAndApproveIssue(
        issue.id,
        authenticityCheck,
        slaDate,
      );
      if (updatedIssue) {
        onUpdate(updatedIssue);
        alert(
          "Issue verified successfully! Now ready for field officer assignment.",
        );
        setActiveTab("assignment");
      } else {
        alert("Failed to verify issue. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying issue:", error);
      alert("Failed to verify issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user) return;
    if (!rejectionNotes.trim()) {
      alert("Please provide rejection notes");
      return;
    }

    setIsLoading(true);
    try {
      const updatedIssue = localStorageService.rejectIssue(
        issue.id,
        rejectionCategory || "spam",
        getRejectionReasonText(rejectionCategory),
        rejectionNotes,
        user.id,
      );
      if (updatedIssue) {
        onUpdate(updatedIssue);
        alert("Issue rejected successfully");
        onClose();
      } else {
        alert("Failed to reject issue. Please try again.");
      }
    } catch (error) {
      console.error("Error rejecting issue:", error);
      alert("Failed to reject issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignOfficer = async () => {
    if (!user) return;
    if (!selectedOfficer) {
      alert("Please select a field officer");
      return;
    }

    setIsLoading(true);
    try {
      const updatedIssue = localStorageService.assignFieldOfficer(
        issue.id,
        selectedOfficer,
      );
      if (updatedIssue) {
        onUpdate(updatedIssue);
        alert("Field officer assigned successfully!");
        setIsReassigning(false);
      } else {
        alert("Failed to assign field officer. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning field officer:", error);
      alert("Failed to assign field officer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReassignOfficer = async () => {
    if (!user) return;
    if (!selectedOfficer) {
      alert("Please select a field officer");
      return;
    }
    if (!reassignReason) {
      alert("Please select a reason for reassignment");
      return;
    }
    if (reassignReason === "Other" && !customReassignReason.trim()) {
      alert("Please provide a custom reason");
      return;
    }

    if (!showRevisedSLA && issue.is_overdue) {
      setShowRevisedSLA(true);
      return;
    }

    const reasonText =
      reassignReason === "Other" ? customReassignReason : reassignReason;

    setIsLoading(true);
    try {
      const updatedIssue = localStorageService.reassignFieldOfficer(
        issue.id,
        selectedOfficer,
        reasonText,
        revisedSlaDate || undefined,
      );
      if (updatedIssue) {
        onUpdate(updatedIssue);
        alert(`Field officer reassigned successfully! Reason: ${reasonText}`);
        setIsReassigning(false);
        setShowRevisedSLA(false);
        setReassignReason("");
        setCustomReassignReason("");
        setRevisedSlaDate("");
      } else {
        alert("Failed to reassign field officer. Please try again.");
      }
    } catch (error) {
      console.error("Error reassigning field officer:", error);
      alert("Failed to reassign field officer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromOverdueAction = () => {
    setIsReassigning(false);
    setIsRejecting(false);
    setShowRevisedSLA(false);
    setRevisedSlaDate("");
    setReassignReason("");
    setCustomReassignReason("");
    setSelectedOfficer(issue.assigned_to || "");
  };

  const handleApproveResolution = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedIssue = localStorageService.approveResolution(
        issue.id,
        user.id,
      );
      if (updatedIssue) {
        onUpdate(updatedIssue);
        alert("Resolution approved! Issue marked as resolved.");
        onClose();
      } else {
        alert("Failed to approve resolution. Please try again.");
      }
    } catch (error) {
      console.error("Error approving resolution:", error);
      alert("Failed to approve resolution. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestRework = async () => {
    if (!user) return;
    if (!reworkReason.trim()) {
      alert("Please provide a reason for rework");
      return;
    }

    setIsLoading(true);
    try {
      const updatedIssue = localStorageService.requestRework(
        issue.id,
        reworkReason,
        user.id,
      );
      if (updatedIssue) {
        onUpdate(updatedIssue);
        alert("Rework requested. Field officer will be notified.");
        setReworkReason("");
      } else {
        alert("Failed to request rework. Please try again.");
      }
    } catch (error) {
      console.error("Error requesting rework:", error);
      alert("Failed to request rework. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostUpdate = async () => {
    if (!user) return;
    if (!updateMessage.trim()) {
      alert("Please enter an update message");
      return;
    }

    setIsLoading(true);
    try {
      localStorageService.postIssueUpdate(
        issue.id,
        updateMessage,
        user.id,
        "unit_officer",
      );
      alert("Update posted successfully");
      setUpdateMessage("");
    } catch (error) {
      console.error("Error posting update:", error);
      alert("Failed to post update. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalateToAdmin = async () => {
    if (!user) return;
    if (!escalationReason.trim()) {
      alert("Please provide a reason for escalation");
      return;
    }

    setIsLoading(true);
    try {
      const updatedIssue = localStorageService.escalateToAdmin(
        issue.id,
        escalationReason,
        user.id,
      );
      if (updatedIssue) {
        onUpdate(updatedIssue);
        alert(
          "Issue escalated to admin successfully. Admin will review and take action.",
        );
        setEscalationReason("");
        onClose();
      } else {
        alert("Failed to escalate issue. Please try again.");
      }
    } catch (error) {
      console.error("Error escalating to admin:", error);
      alert("Failed to escalate issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverdueAction = (action) => {
    if (action === "Reassign to Different Officer") {
      setIsReassigning(true);
      setReassignReason("");
      setActiveTab("overdue_actions");
    } else if (action === "Reject Due to Non-Feasibility") {
      setIsRejecting(true);
      setRejectionCategory("out_of_jurisdiction");
    } else if (action === "Escalate to Admin") {
      setActiveTab("overdue_actions");
    }
  };

  const handleReverifyReopened = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedIssue = localStorageService.reverifyReopenedIssue(issue.id);
      if (updatedIssue) {
        onUpdate(updatedIssue);
        alert("Issue re-verified successfully! Status changed to In Progress.");
      } else {
        alert("Failed to re-verify issue. Please try again.");
      }
    } catch (error) {
      console.error("Error re-verifying issue:", error);
      alert("Failed to re-verify issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRejectionReasonText = (category) => {
    const reasons = {
      spam: "This appears to be spam or not a genuine civic issue.",
      duplicate: "This issue has already been reported and is being addressed.",
      invalid_location:
        "The location provided is invalid or cannot be verified.",
      insufficient_evidence:
        "Insufficient evidence provided to verify and process this issue.",
      out_of_jurisdiction:
        "This issue is outside the jurisdiction of this ward.",
      false_report: "This issue appears to be a false or misleading report.",
    };
    return reasons[category || "spam"] || "Issue rejected";
  };

  const showAssignmentTab =
    issue.internal_status === "verified" ||
    issue.internal_status === "reopened" ||
    (issue.assigned_to &&
      (issue.internal_status === "assigned" ||
        issue.internal_status === "fo_marked_resolved"));

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "from-red-500 to-red-600";
      case "medium":
        return "from-orange-500 to-orange-600";
      default:
        return "from-green-500 to-green-600";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Header */}
      {!hideHeader && (
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`px-4 py-2 rounded-xl bg-gradient-to-r ${getSeverityColor(issue.severity)} text-white font-bold text-sm shadow-lg`}
                >
                  {issue.severity.toUpperCase()}
                </div>
                <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-semibold text-gray-700 border-2 border-gray-200 shadow-sm">
                  {issue.ticket_id}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {issue.title}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-teal-600" />
                  <span className="font-medium">{issue.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-cyan-600" />
                  <span>{formatDate(issue.created_at)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2.5 rounded-xl hover:bg-white/70 transition-all shadow-sm flex-shrink-0 hover:shadow-md"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 pt-4 border-b border-gray-200 flex-shrink-0 bg-white shadow-sm">
        <div className="flex gap-2 -mb-px overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3 font-semibold text-sm border-b-3 transition-all whitespace-nowrap rounded-t-lg ${
              activeTab === "overview"
                ? "border-teal-600 text-teal-700 bg-teal-50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-5 py-3 font-semibold text-sm border-b-3 transition-all whitespace-nowrap rounded-t-lg ${
              activeTab === "timeline"
                ? "border-teal-600 text-teal-700 bg-teal-50"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Timeline
          </button>
          {showAssignmentTab && (
            <button
              onClick={() => setActiveTab("assignment")}
              className={`px-5 py-3 font-semibold text-sm border-b-3 transition-all whitespace-nowrap rounded-t-lg ${
                activeTab === "assignment"
                  ? "border-teal-600 text-teal-700 bg-teal-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Assignment
            </button>
          )}
          {issue.internal_status === "fo_marked_resolved" && (
            <button
              onClick={() => setActiveTab("verification")}
              className={`px-5 py-3 font-semibold text-sm border-b-3 transition-all whitespace-nowrap rounded-t-lg ${
                activeTab === "verification"
                  ? "border-teal-600 text-teal-700 bg-teal-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Verification
            </button>
          )}
          {issue.internal_status === "pending_verification" &&
            issue.status !== "rejected" && (
              <button
                onClick={() => setActiveTab("rejection")}
                className={`px-5 py-3 font-semibold text-sm border-b-3 transition-all whitespace-nowrap rounded-t-lg ${
                  activeTab === "rejection"
                    ? "border-red-600 text-red-700 bg-red-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Rejection
              </button>
            )}
          {issue.internal_status === "reopened" && (
            <>
              <button
                onClick={() => setActiveTab("reverification")}
                className={`px-5 py-3 font-semibold text-sm border-b-3 transition-all whitespace-nowrap rounded-t-lg ${
                  activeTab === "reverification"
                    ? "border-teal-600 text-teal-700 bg-teal-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Re-Verification
              </button>
              <button
                onClick={() => setActiveTab("rejection")}
                className={`px-5 py-3 font-semibold text-sm border-b-3 transition-all whitespace-nowrap rounded-t-lg ${
                  activeTab === "rejection"
                    ? "border-red-600 text-red-700 bg-red-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Rejection
              </button>
            </>
          )}
          {issue.is_overdue &&
            issue.status !== "resolved" &&
            issue.status !== "rejected" && (
              <button
                onClick={() => setActiveTab("overdue_actions")}
                className={`px-5 py-3 font-semibold text-sm border-b-3 transition-all whitespace-nowrap rounded-t-lg flex items-center gap-2 ${
                  activeTab === "overdue_actions"
                    ? "border-red-600 text-red-700 bg-red-50"
                    : "border-transparent text-red-600 hover:text-red-900 hover:bg-red-50"
                }`}
              >
                <AlertTriangle size={16} />
                Overdue Actions
              </button>
            )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Warnings */}
            {issue.is_overdue && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl p-5 shadow-lg">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                    <AlertTriangle className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-red-900 text-lg mb-1">
                      SLA Overdue
                    </p>
                    <p className="text-red-700">
                      This issue has exceeded its SLA deadline and requires
                      immediate attention.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {issue.is_duplicate && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-5 shadow-lg">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-md">
                    <AlertTriangle className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-yellow-900 text-lg mb-1">
                      Possible Duplicate
                    </p>
                    <p className="text-yellow-700">
                      This issue may be a duplicate of issue #
                      {issue.duplicate_of}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Issue Details */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
                  <FileText size={20} className="text-white" />
                </div>
                Issue Details
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <span className="font-semibold text-teal-700 text-sm uppercase tracking-wide">
                    Description
                  </span>
                  <p className="text-gray-700 mt-2 leading-relaxed">
                    {issue.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="font-semibold text-teal-700 text-sm uppercase tracking-wide block mb-2">
                      Category
                    </span>
                    <p className="text-gray-800 capitalize font-medium">
                      {issue.category}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="font-semibold text-teal-700 text-sm uppercase tracking-wide block mb-2">
                      Upvotes
                    </span>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-blue-500" />
                      <p className="text-gray-800 font-bold text-lg">
                        {issue.upvotes}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white col-span-2 rounded-xl p-4 border border-gray-200 shadow-sm">
                    <span className="font-semibold text-teal-700 text-sm uppercase tracking-wide block mb-2">
                      Reported By
                    </span>
                    <p className="text-gray-800 font-medium">
                      {issue.reporter?.full_name || "Anonymous"}
                    </p>
                  </div>
                </div>
                {issue.sla_due_date && (
                  <div
                    className={`rounded-xl p-4 border-2 shadow-sm ${
                      issue.is_overdue
                        ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-300"
                        : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                    }`}
                  >
                    <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide block mb-2">
                      SLA Due Date
                    </span>
                    <p
                      className={`font-bold text-lg ${issue.is_overdue ? "text-red-700" : "text-green-700"}`}
                    >
                      {formatDate(issue.sla_due_date)}
                      {issue.is_overdue && " (Overdue!)"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <MapPinned size={20} className="text-white" />
                </div>
                Location
              </h3>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-3">
                <p className="text-gray-700 font-medium">{issue.address}</p>
                {issue.latitude && issue.longitude && (
                  <p className="text-gray-500 text-sm mt-2">
                    Coordinates: {issue.latitude}, {issue.longitude}
                  </p>
                )}
              </div>
            </div>

            {/* Photo Evidence */}
            {issue.photo_url && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
                {/* Header */}
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                  Evidence Photos
                </h3>

                {/* Carousel */}
                <ImageCarousel
                  images={[issue.photo_url, ...(issue.additional_photos || [])]}
                />
              </div>
            )}

            {/* Dummy Video Evidence */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-lg mt-8">
              {/* Header */}
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
                  <VideoIcon size={20} className="text-white" />
                </div>
                Evidence Video
              </h3>

              {/* Video Player */}
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-md bg-black">
                <video
                  controls
                  className="w-full h-[350px] object-contain bg-black"
                  poster="https://images.pexels.com/photos/7722560/pexels-photo-7722560.jpeg"
                >
                  <source
                    src="https://www.w3schools.com/html/mov_bbb.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Info */}
              <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                <span className="font-medium">Demo Video:</span>
                <span>Road damage inspection footage</span>
              </div>
            </div>

            {/* Authenticity Checklist */}
            {issue.internal_status === "pending_verification" &&
              issue.status !== "rejected" && (
                <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border-2 border-teal-300 rounded-2xl p-6 shadow-xl">
                  <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                    <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
                      <Shield size={20} className="text-white" />
                    </div>
                    Authenticity Verification
                  </h3>
                  <div className="space-y-4 mb-6">
                    {[
                      {
                        key: "location_valid",
                        label: "Location is valid and verifiable",
                      },
                      {
                        key: "evidence_sufficient",
                        label: "Evidence is sufficient",
                      },
                      { key: "not_duplicate", label: "Not a duplicate issue" },
                      {
                        key: "within_jurisdiction",
                        label: "Within jurisdiction",
                      },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-4 cursor-pointer bg-white rounded-xl p-4 border-2 border-teal-200 hover:border-teal-400 transition-all shadow-sm hover:shadow-md group"
                      >
                        <input
                          type="checkbox"
                          checked={authenticityCheck[key]}
                          onChange={(e) =>
                            setAuthenticityCheck({
                              ...authenticityCheck,
                              [key]: e.target.checked,
                            })
                          }
                          className="w-6 h-6 text-teal-600 rounded-lg focus:ring-2 focus:ring-teal-500 cursor-pointer"
                        />
                        <span className="font-medium text-gray-700 group-hover:text-teal-700 transition-colors">
                          {label}
                        </span>
                        {authenticityCheck[key] && (
                          <CheckCircle
                            size={20}
                            className="ml-auto text-teal-600"
                          />
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-teal-200 shadow-sm mb-6">
                    <label className="block font-semibold text-gray-700 mb-3">
                      Set SLA Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={slaDate}
                      onChange={(e) => setSlaDate(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>

                  <button
                    onClick={() => handleVerifyAndApprove()}
                    disabled={
                      !Object.values(authenticityCheck).every((v) => v) ||
                      isLoading
                    }
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                      Object.values(authenticityCheck).every((v) => v) &&
                      !isLoading
                        ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <CheckCircle size={24} />
                    {isLoading ? "Verifying..." : "Verify & Approve Issue"}
                  </button>
                </div>
              )}
          </div>
        )}

        {/* Continue with other tabs in the implementation - this is getting long, so I'll shorten the remaining tabs while maintaining the enhanced design pattern */}

        {/* TIMELINE TAB */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">
                Issue Timeline
              </h3>
              <div className="space-y-5">
                {[
                  {
                    icon: Clock,
                    color: "from-yellow-400 to-amber-500",
                    title: "Issue Reported",
                    date: issue.created_at,
                    detail: `Reported by ${issue.reporter?.full_name}`,
                  },
                  issue.internal_status !== "pending_verification" && {
                    icon: CheckCircle,
                    color: "from-teal-500 to-cyan-600",
                    title: "Verified by Ward Officer",
                    date: issue.updated_at,
                  },
                  issue.assigned_to && {
                    icon: User,
                    color: "from-blue-500 to-indigo-600",
                    title: "Assigned to Field Officer",
                    detail: `Assigned to ${issue.assignee?.full_name}`,
                  },
                  issue.internal_status === "fo_marked_resolved" && {
                    icon: Eye,
                    color: "from-green-500 to-emerald-600",
                    title: "Marked Resolved by Field Officer",
                    detail: "Awaiting Ward Officer verification",
                  },
                  issue.status === "resolved" && {
                    icon: CheckCircle,
                    color: "from-emerald-500 to-green-600",
                    title: "Verified & Resolved",
                    date: issue.wo_verified_at,
                  },
                  issue.status === "rejected" && {
                    icon: XCircle,
                    color: "from-red-500 to-rose-600",
                    title: "Issue Rejected",
                    detail: issue.rejection_reason,
                  },
                ]
                  .filter(Boolean)
                  .map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                      >
                        <item.icon className="text-white" size={20} />
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <p className="font-bold text-gray-900">{item.title}</p>
                        {item.date && (
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(item.date)}
                          </p>
                        )}
                        {item.detail && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Post Update */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">
                Post Update
              </h3>
              <textarea
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder="Write an update for citizens and field officers..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none shadow-sm"
                rows={4}
              />
              <button
                onClick={handlePostUpdate}
                className="mt-4 w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Post Update
              </button>
            </div>
          </div>
        )}

        {/* ASSIGNMENT TAB */}
        {activeTab === "assignment" && (
          <div className="space-y-6">
            {/* Current Assignment Info */}
            {issue.assigned_to && !isReassigning && (
              <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-300 rounded-2xl p-6 shadow-xl">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                      <Lock size={20} className="text-white" />
                    </div>
                    <h3 className="font-bold text-blue-900 text-lg">
                      Currently Assigned Field Officer
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsReassigning(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Edit size={16} />
                    Reassign
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-5 border-2 border-blue-200 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {issue.assignee?.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {issue.assignee?.full_name}
                      </h4>
                      <p className="text-gray-600">{issue.assignee?.email}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-xl shadow-sm">
                      <Star
                        className="text-amber-500 fill-amber-500"
                        size={20}
                      />
                      <span className="font-bold text-gray-900 text-lg">
                        {issue.assignee?.rating}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 shadow-sm">
                      <p className="text-gray-600 text-sm mb-1">
                        Active Workload
                      </p>
                      <p className="font-bold text-gray-900 text-xl">
                        {issue.assignee?.active_workload}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 shadow-sm">
                      <p className="text-gray-600 text-sm mb-1">
                        Total Resolved
                      </p>
                      <p className="font-bold text-gray-900 text-xl">
                        {issue.assignee?.total_resolved}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 shadow-sm">
                      <p className="text-gray-600 text-sm mb-1">Status</p>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                          issue.assignee?.availability_status === "available"
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : issue.assignee?.availability_status === "busy"
                              ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                              : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {issue.assignee?.availability_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reassignment Form */}
            {(isReassigning || !issue.assigned_to) && (
              <>
                {isReassigning && (
                  <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-6 shadow-xl">
                    <h3 className="font-bold text-orange-900 mb-4 text-lg flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
                        <AlertTriangle size={20} className="text-white" />
                      </div>
                      Reassignment Reason (Required)
                    </h3>
                    <select
                      value={reassignReason}
                      onChange={(e) => setReassignReason(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-4 shadow-sm font-medium"
                    >
                      <option value="">-- Select Reason --</option>
                      {reassignReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>

                    {reassignReason === "Other" && (
                      <textarea
                        value={customReassignReason}
                        onChange={(e) =>
                          setCustomReassignReason(e.target.value)
                        }
                        placeholder="Explain the reason for reassignment..."
                        className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none shadow-sm"
                        rows={3}
                      />
                    )}
                  </div>
                )}

                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
                  <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                    <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
                      <Users size={20} className="text-white" />
                    </div>
                    {isReassigning
                      ? "Select New Field Officer"
                      : "Assign Field Officer"}
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-3">
                        Select Field Officer
                      </label>
                      <select
                        value={selectedOfficer}
                        onChange={(e) => setSelectedOfficer(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm font-medium"
                      >
                        <option value="">-- Select Officer --</option>
                        {fieldOfficers
                          .filter((officer) => officer.id !== issue.assigned_to)
                          .map((officer) => (
                            <option key={officer.id} value={officer.id}>
                              {officer.full_name} (Rating: {officer.rating},
                              Active: {officer.active_workload})
                            </option>
                          ))}
                      </select>
                    </div>

                    <button
                      onClick={
                        isReassigning
                          ? handleReassignOfficer
                          : handleAssignOfficer
                      }
                      disabled={
                        !selectedOfficer ||
                        (isReassigning && !reassignReason) ||
                        isLoading
                      }
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                        selectedOfficer &&
                        (!isReassigning || reassignReason) &&
                        !isLoading
                          ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <User size={20} />
                      {isLoading
                        ? isReassigning
                          ? "Reassigning..."
                          : "Assigning..."
                        : isReassigning
                          ? "Confirm Reassignment"
                          : "Assign Officer"}
                    </button>

                    {isReassigning && (
                      <button
                        onClick={() => {
                          setIsReassigning(false);
                          setReassignReason("");
                          setCustomReassignReason("");
                          setSelectedOfficer(issue.assigned_to || "");
                        }}
                        className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Field Officer Cards */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Available Field Officers
                  </h4>
                  {fieldOfficers
                    .filter((officer) => officer.id !== issue.assigned_to)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .map((officer) => (
                      <div
                        key={officer.id}
                        onClick={() => setSelectedOfficer(officer.id)}
                        className={`bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl ${
                          selectedOfficer === officer.id
                            ? "border-teal-500 shadow-xl ring-4 ring-teal-100"
                            : "border-gray-200 hover:border-teal-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {officer.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">
                                {officer.full_name}
                              </h4>
                              <p className="text-gray-600">{officer.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-xl shadow-sm">
                            <Star
                              className="text-amber-500 fill-amber-500"
                              size={18}
                            />
                            <span className="font-bold text-gray-900">
                              {officer.rating}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 shadow-sm">
                            <p className="text-gray-600 text-sm">
                              Active Workload
                            </p>
                            <p className="font-bold text-gray-900 text-lg">
                              {officer.active_workload}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 shadow-sm">
                            <p className="text-gray-600 text-sm">
                              Total Resolved
                            </p>
                            <p className="font-bold text-gray-900 text-lg">
                              {officer.total_resolved}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 shadow-sm">
                            <p className="text-gray-600 text-sm">Status</p>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                                officer.availability_status === "available"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : officer.availability_status === "busy"
                                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                                    : "bg-gray-300 text-gray-700"
                              }`}
                            >
                              {officer.availability_status}
                            </span>
                          </div>
                        </div>
                        {officer.specializations &&
                          officer.specializations.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {officer.specializations.map((spec) => (
                                <span
                                  key={spec}
                                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-full font-semibold border border-teal-200 shadow-sm"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* VERIFICATION TAB */}
        {activeTab === "verification" && (
          <div className="space-y-6">
            {/* FO Issue Photo (Before Work - Dummy Data) */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-xl mb-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <Camera size={20} className="text-white" />
                </div>
                Field Officer Issue Capture (Before Work)
              </h3>

              <div className="space-y-3">
                <p className="text-gray-600 text-sm">
                  Photo captured by Field Officer at the issue location before
                  starting the work. (Dummy image used for demonstration
                  purposes.)
                </p>

                <img
                  src="https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Field officer issue capture"
                  className="w-full rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-shadow"
                />
              </div>
            </div>

            {/* FO Completion Proof */}
            {issue.fo_completion_proof &&
            issue.fo_completion_proof.length > 0 ? (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                  Field Officer Completion Proof
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {issue.fo_completion_proof.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Completion proof ${idx + 1}`}
                      className="w-full rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-shadow"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                    <AlertTriangle className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-red-900 text-lg mb-1">
                      Missing Completion Proof
                    </p>
                    <p className="text-red-700">
                      Field officer has not uploaded completion proof images.
                      Verification cannot proceed without evidence.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FO Location Trace */}
            {issue.fo_location_trace &&
              issue.fo_location_trace.length > 0 &&
              (() => {
                const beforeLocation = issue.fo_location_trace[0];
                const afterLocation =
                  issue.fo_location_trace[issue.fo_location_trace.length - 1];

                const generateMapsLink = (lat, lng) =>
                  `https://www.google.com/maps?q=${lat},${lng}`;

                return (
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
                    <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                        <MapPin size={20} className="text-white" />
                      </div>
                      Field Officer Location Verification
                    </h3>

                    <div className="space-y-4">
                      {/* BEFORE WORK */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">
                            <MapPin className="inline mr-2 text-blue-600" />
                            Before Work (Issue Stage)
                          </p>

                          <p className="text-gray-600 text-sm">
                            Sigra Area, Varanasi
                          </p>

                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(
                              beforeLocation.timestamp,
                            ).toLocaleString()}
                          </p>
                        </div>

                        <a
                          href={generateMapsLink(
                            beforeLocation.lat,
                            beforeLocation.lng,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                        >
                          View on Maps
                        </a>
                      </div>

                      {/* AFTER COMPLETION */}
                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">
                            <CircleCheckBig className="inline mr-2 text-green-600" />
                            After Completion (Proof Submission)
                          </p>

                          <p className="text-gray-600 text-sm">
                            Sigra Area, Varanasi
                          </p>

                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(afterLocation.timestamp).toLocaleString()}
                          </p>
                        </div>

                        <a
                          href={generateMapsLink(
                            afterLocation.lat,
                            afterLocation.lng,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                        >
                          View on Maps
                        </a>
                      </div>

                      {/* OFFICIAL ISSUE ADDRESS */}
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-indigo-900 flex items-center gap-2">
                            <Map className="text-indigo-600" /> Official Issue
                            Address
                          </p>
                          <p className="text-indigo-700 text-sm mt-1">
                            {issue.address}
                          </p>
                        </div>

                        <a
                          href={generateMapsLink(
                            issue.latitude,
                            issue.longitude,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
                        >
                          View on Maps
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Verification Actions */}
            <div className="space-y-4">
              <button
                onClick={handleApproveResolution}
                disabled={
                  !issue.fo_completion_proof ||
                  issue.fo_completion_proof.length === 0 ||
                  isLoading
                }
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                  issue.fo_completion_proof &&
                  issue.fo_completion_proof.length > 0 &&
                  !isLoading
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <CheckCircle size={20} />
                {isLoading ? "Approving..." : "Approve Resolution"}
              </button>

              <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-6 shadow-xl">
                <h4 className="font-bold text-gray-900 mb-4 text-lg">
                  Request Rework
                </h4>
                <textarea
                  value={reworkReason}
                  onChange={(e) => setReworkReason(e.target.value)}
                  placeholder="Explain what needs to be reworked..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none mb-4 shadow-sm"
                  rows={3}
                  disabled={isLoading}
                />
                <button
                  onClick={handleRequestRework}
                  disabled={isLoading || !reworkReason.trim()}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                    !isLoading && reworkReason.trim()
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <RefreshCw size={20} />
                  {isLoading ? "Requesting..." : "Request Rework"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECTION TAB */}
        {activeTab === "rejection" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-red-900 mb-5 flex items-center gap-3 text-lg">
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-md">
                  <Ban size={20} className="text-white" />
                </div>
                Reject Issue
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block font-semibold text-gray-700 mb-3">
                    Rejection Reason
                  </label>
                  <select
                    value={rejectionCategory}
                    onChange={(e) => setRejectionCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm font-medium"
                  >
                    <option value="spam">Spam</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="invalid_location">Invalid Location</option>
                    <option value="insufficient_evidence">
                      Insufficient Evidence
                    </option>
                    <option value="out_of_jurisdiction">
                      Out of Jurisdiction
                    </option>
                    <option value="false_report">False Report</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-3">
                    Explanation (Required)
                  </label>
                  <textarea
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Provide a detailed explanation for this rejection..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none shadow-sm"
                    rows={5}
                    required
                  />
                </div>

                <div className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-red-900 mb-2">
                    Default Rejection Message:
                  </p>
                  <p className="text-gray-700">
                    {getRejectionReasonText(rejectionCategory)}
                  </p>
                </div>

                <button
                  onClick={handleReject}
                  disabled={!rejectionNotes.trim() || isLoading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                    rejectionNotes.trim() && !isLoading
                      ? "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <XCircle size={20} />
                  {isLoading ? "Rejecting..." : "Reject Issue"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RE-VERIFICATION TAB */}
        {activeTab === "reverification" && (
          <div className="space-y-6">
            {/* Reopening Details */}
            {issue.reopened_at && (
              <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-6 shadow-xl">
                <h4 className="font-bold text-orange-900 mb-4 text-lg flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
                    <RefreshCw size={20} className="text-white" />
                  </div>
                  Issue Reopened
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
                    <span className="text-orange-800 font-semibold">
                      Reopened At:
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatDate(issue.reopened_at)}
                    </span>
                  </div>
                  {issue.reopening_reason && (
                    <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
                      <span className="text-orange-800 font-semibold block mb-2">
                        Reason for Reopening:
                      </span>
                      <p className="text-gray-900">{issue.reopening_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Re-uploaded Evidence */}
            {issue.reopening_photos && issue.reopening_photos.length > 0 && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                  Re-uploaded Evidence
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {issue.reopening_photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Re-uploaded evidence ${idx + 1}`}
                      className="w-full rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-shadow"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Original Evidence for Comparison */}
            {issue.photo_url && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                  <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg shadow-md">
                    <ImageIcon size={20} className="text-white" />
                  </div>
                  Original Evidence (For Comparison)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <img
                    src={issue.photo_url}
                    alt="Original evidence"
                    className="w-full rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-shadow"
                  />
                  {issue.additional_photos?.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Original evidence ${idx + 1}`}
                      className="w-full rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-shadow"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Re-verification Checklist */}
            <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border-2 border-teal-300 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
                  <Shield size={20} className="text-white" />
                </div>
                Re-Verification Checklist
              </h3>
              <p className="text-teal-800 mb-5">
                Review the reopened issue and new evidence provided. Confirm
                that the issue is legitimate and needs to be addressed again.
              </p>
              <div className="space-y-4 mb-6">
                {[
                  {
                    key: "location_valid",
                    label: "Issue still exists at the reported location",
                  },
                  {
                    key: "evidence_sufficient",
                    label: "New evidence is sufficient and valid",
                  },
                  {
                    key: "not_duplicate",
                    label: "Previous resolution was inadequate",
                  },
                  {
                    key: "within_jurisdiction",
                    label: "Citizen's concern is legitimate",
                  },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-4 cursor-pointer bg-white rounded-xl p-4 border-2 border-teal-200 hover:border-teal-400 transition-all shadow-sm hover:shadow-md group"
                  >
                    <input
                      type="checkbox"
                      checked={authenticityCheck[key]}
                      onChange={(e) =>
                        setAuthenticityCheck({
                          ...authenticityCheck,
                          [key]: e.target.checked,
                        })
                      }
                      className="w-6 h-6 text-teal-600 rounded-lg focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className="font-medium text-gray-700 group-hover:text-teal-700 transition-colors">
                      {label}
                    </span>
                    {authenticityCheck[key] && (
                      <CheckCircle
                        size={20}
                        className="ml-auto text-teal-600"
                      />
                    )}
                  </label>
                ))}
              </div>

              <button
                onClick={handleReverifyReopened}
                disabled={
                  !Object.values(authenticityCheck).every((v) => v) || isLoading
                }
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                  Object.values(authenticityCheck).every((v) => v) && !isLoading
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <CheckCircle size={20} />
                {isLoading
                  ? "Re-Verifying..."
                  : "Re-Verify & Continue to In Progress"}
              </button>
            </div>
          </div>
        )}

        {/* OVERDUE ACTIONS TAB */}
        {activeTab === "overdue_actions" && (
          <div className="space-y-6">
            {!isReassigning && !isRejecting ? (
              <>
                <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                      <AlertTriangle className="text-white" size={28} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 text-xl mb-2">
                        SLA Overdue - Immediate Action Required
                      </h3>
                      <p className="text-red-800">
                        This issue has exceeded its SLA deadline. Choose an
                        action to resolve this situation.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() =>
                        handleOverdueAction("Reassign to Different Officer")
                      }
                      className="w-full p-5 bg-white border-2 border-red-200 rounded-xl hover:border-red-500 hover:shadow-xl transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl group-hover:from-orange-200 group-hover:to-red-200 transition-colors shadow-sm">
                            <RefreshCw size={22} className="text-red-600" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-lg">
                              Reassign to Different Officer
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              Transfer to another available field officer
                            </p>
                          </div>
                        </div>
                        <span className="text-red-600 text-2xl group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        handleOverdueAction("Reject Due to Non-Feasibility")
                      }
                      className="w-full p-5 bg-white border-2 border-red-200 rounded-xl hover:border-red-500 hover:shadow-xl transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl group-hover:from-orange-200 group-hover:to-red-200 transition-colors shadow-sm">
                            <Ban size={22} className="text-red-600" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-lg">
                              Reject Due to Non-Feasibility
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              Close this issue as it cannot be resolved
                            </p>
                          </div>
                        </div>
                        <span className="text-red-600 text-2xl group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Escalate to Admin Section */}
                <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-xl">
                  <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-3 text-lg">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    Escalate to Admin Level
                  </h3>
                  <p className="text-amber-800 mb-5">
                    Escalate this overdue issue to admin.{" "}
                    <strong>No SLA enforcement</strong> - admin will handle
                    timeline management.
                  </p>
                  <textarea
                    value={escalationReason}
                    onChange={(e) => setEscalationReason(e.target.value)}
                    placeholder="Explain why this issue needs admin attention (required)..."
                    className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none mb-5 shadow-sm"
                    rows={4}
                  />
                  <button
                    onClick={handleEscalateToAdmin}
                    disabled={isLoading || !escalationReason.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                      !isLoading && escalationReason.trim()
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <TrendingUp size={20} />
                    {isLoading ? "Escalating..." : "Escalate to Admin"}
                  </button>
                </div>

                {issue.assigned_to && (
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">
                      Current Assignment
                    </h4>
                    <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {issue.assignee?.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {issue.assignee?.full_name}
                          </h4>
                          <p className="text-gray-600">
                            {issue.assignee?.email}
                          </p>
                          <p className="text-sm text-red-600 mt-1 font-semibold">
                            Currently overdue on this task
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : isReassigning ? (
              <>
                {/* Back Button */}
                <button
                  onClick={handleBackFromOverdueAction}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors font-semibold"
                >
                  <ChevronLeft size={20} />
                  <span>Back to Options</span>
                </button>

                {/* Reassignment Form in Overdue Tab */}
                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-6 shadow-xl">
                  <h3 className="font-bold text-orange-900 mb-5 text-lg flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
                      <RefreshCw size={20} className="text-white" />
                    </div>
                    Reassign Overdue Issue
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-3">
                        Reassignment Reason (Required)
                      </label>
                      <select
                        value={reassignReason}
                        onChange={(e) => setReassignReason(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm font-medium"
                      >
                        <option value="">-- Select Reason --</option>
                        {reassignReasons.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>

                    {reassignReason === "Other" && (
                      <textarea
                        value={customReassignReason}
                        onChange={(e) =>
                          setCustomReassignReason(e.target.value)
                        }
                        placeholder="Explain the reason for reassignment..."
                        className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none shadow-sm"
                        rows={3}
                      />
                    )}
                  </div>
                </div>

                {!showRevisedSLA ? (
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
                    <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3 text-lg">
                      <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
                        <Users size={20} className="text-white" />
                      </div>
                      Select New Field Officer
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-3">
                          Select Field Officer
                        </label>
                        <select
                          value={selectedOfficer}
                          onChange={(e) => setSelectedOfficer(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm font-medium"
                        >
                          <option value="">-- Select Officer --</option>
                          {fieldOfficers
                            .filter(
                              (officer) => officer.id !== issue.assigned_to,
                            )
                            .map((officer) => (
                              <option key={officer.id} value={officer.id}>
                                {officer.full_name} (Rating: {officer.rating},
                                Active: {officer.active_workload})
                              </option>
                            ))}
                        </select>
                      </div>

                      <button
                        onClick={handleReassignOfficer}
                        disabled={
                          !selectedOfficer || !reassignReason || isLoading
                        }
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                          selectedOfficer && reassignReason && !isLoading
                            ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <User size={20} />
                        {isLoading ? "Processing..." : "Continue to Set SLA"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-300 rounded-2xl p-6 shadow-xl">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-3 text-lg">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
                        <Calendar size={20} className="text-white" />
                      </div>
                      Set Revised SLA Deadline
                    </h3>
                    <p className="text-blue-800 mb-5">
                      Set a new deadline for this reassigned issue to ensure
                      timely resolution.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-3">
                          Revised SLA Deadline (Required)
                        </label>
                        <input
                          type="datetime-local"
                          value={revisedSlaDate}
                          onChange={(e) => setRevisedSlaDate(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                      </div>

                      <button
                        onClick={handleReassignOfficer}
                        disabled={!revisedSlaDate || isLoading}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                          revisedSlaDate && !isLoading
                            ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle size={20} />
                        {isLoading ? "Reassigning..." : "Confirm Reassignment"}
                      </button>

                      <button
                        onClick={() => setShowRevisedSLA(false)}
                        className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors shadow-sm"
                      >
                        Back to Officer Selection
                      </button>
                    </div>
                  </div>
                )}

                {/* Field Officer Cards */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Available Field Officers
                  </h4>
                  {fieldOfficers
                    .filter((officer) => officer.id !== issue.assigned_to)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .map((officer) => (
                      <div
                        key={officer.id}
                        onClick={() => setSelectedOfficer(officer.id)}
                        className={`bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl ${
                          selectedOfficer === officer.id
                            ? "border-teal-500 shadow-xl ring-4 ring-teal-100"
                            : "border-gray-200 hover:border-teal-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {officer.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">
                                {officer.full_name}
                              </h4>
                              <p className="text-gray-600">{officer.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-xl shadow-sm">
                            <Star
                              className="text-amber-500 fill-amber-500"
                              size={18}
                            />
                            <span className="font-bold text-gray-900">
                              {officer.rating}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 shadow-sm">
                            <p className="text-gray-600 text-sm">
                              Active Workload
                            </p>
                            <p className="font-bold text-gray-900 text-lg">
                              {officer.active_workload}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 shadow-sm">
                            <p className="text-gray-600 text-sm">
                              Total Resolved
                            </p>
                            <p className="font-bold text-gray-900 text-lg">
                              {officer.total_resolved}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 shadow-sm">
                            <p className="text-gray-600 text-sm">Status</p>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${
                                officer.availability_status === "available"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : officer.availability_status === "busy"
                                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                                    : "bg-gray-300 text-gray-700"
                              }`}
                            >
                              {officer.availability_status}
                            </span>
                          </div>
                        </div>
                        {officer.specializations &&
                          officer.specializations.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {officer.specializations.map((spec) => (
                                <span
                                  key={spec}
                                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 rounded-full font-semibold border border-teal-200 shadow-sm"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                </div>
              </>
            ) : isRejecting ? (
              <>
                {/* Back Button */}
                <button
                  onClick={handleBackFromOverdueAction}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors font-semibold"
                >
                  <ChevronLeft size={20} />
                  <span>Back to Options</span>
                </button>

                {/* Rejection Form */}
                <div className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl">
                  <h3 className="font-bold text-red-900 mb-5 text-lg flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-md">
                      <Ban size={20} className="text-white" />
                    </div>
                    Reject Due to Non-Feasibility
                  </h3>
                  <p className="text-red-800 mb-5">
                    Please provide a detailed reason for rejecting this overdue
                    issue.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-3">
                        Rejection Category
                      </label>
                      <select
                        value={rejectionCategory}
                        onChange={(e) => setRejectionCategory(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm font-medium"
                      >
                        <option value="spam">Spam/False Report</option>
                        <option value="duplicate">Duplicate Issue</option>
                        <option value="out_of_jurisdiction">
                          Out of Jurisdiction
                        </option>
                        <option value="insufficient_evidence">
                          Insufficient Information
                        </option>
                        <option value="false_report">Not Feasible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-3">
                        Detailed Rejection Notes (Required)
                      </label>
                      <textarea
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        placeholder="Provide a detailed explanation for why this issue cannot be resolved..."
                        className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none shadow-sm"
                        rows={5}
                      />
                    </div>

                    <button
                      onClick={handleReject}
                      disabled={!rejectionNotes.trim() || isLoading}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 ${
                        rejectionNotes.trim() && !isLoading
                          ? "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <XCircle size={20} />
                      {isLoading ? "Rejecting..." : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
