"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Search,
  Filter,
  FileText,
  Loader2,
  MoreVertical,
  UserCheck,
  Tag,
  AlertTriangle,
  Clock,
  Send,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Mail,
  Phone,
  User,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  Activity,
  ArrowUpRight,
  Zap,
  Droplet,
  Trash2,
  Heart,
  Car,
  AlertOctagon,
  CheckSquare,
  RefreshCw,
  Users,
  Compass,
  FileCheck,
} from "lucide-react";

// Color mappings for summary cards
const SUMMARY_CARD_STYLES = {
  total: {
    color: "cyan-blue",
    bg: "from-cyan-50 to-blue-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
    border: "border-cyan-200 dark:border-cyan-900/40",
    ring: "ring-2 ring-cyan-500/50",
    text: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400",
  },
  active: {
    color: "violet-blue",
    bg: "from-violet-50 to-blue-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
    border: "border-violet-200 dark:border-violet-900/40",
    ring: "ring-2 ring-violet-500/50",
    text: "text-violet-600 dark:text-violet-400",
    iconBg:
      "bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
  },
  unassigned: {
    color: "amber-orange",
    bg: "from-amber-50 to-orange-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
    border: "border-amber-200 dark:border-amber-900/40",
    ring: "ring-2 ring-amber-500/50",
    text: "text-amber-600 dark:text-amber-400",
    iconBg:
      "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  },
  overdue: {
    color: "red-rose",
    bg: "from-red-50 to-rose-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
    border: "border-rose-200 dark:border-rose-900/40",
    ring: "ring-2 ring-rose-500/50",
    text: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
  },
  escalated: {
    color: "orange-red",
    bg: "from-orange-50 to-red-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
    border: "border-orange-200 dark:border-red-900/40",
    ring: "ring-2 ring-orange-500/50",
    text: "text-orange-600 dark:text-orange-400",
    iconBg:
      "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400",
  },
  resolved: {
    color: "emerald-teal",
    bg: "from-emerald-50 to-teal-50/50 dark:from-slate-900/60 dark:to-slate-800/40",
    border: "border-emerald-200 dark:border-emerald-900/40",
    ring: "ring-2 ring-emerald-500/50",
    text: "text-emerald-600 dark:text-emerald-400",
    iconBg:
      "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  },
};

// Status Styles config
const STATUS_STYLES = {
  pending: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  verified: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  assigned: {
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    text: "text-indigo-700 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  in_progress: {
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
  pending_uo_verification: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    text: "text-violet-700 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  rework_required: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  reopened: {
    bg: "bg-pink-50 dark:bg-pink-950/20",
    text: "text-pink-700 dark:text-pink-300",
    dot: "bg-pink-500",
  },
  escalated: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  resolved: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  closed: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-350",
    dot: "bg-slate-500",
  },
  rejected: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  withdrawn: {
    bg: "bg-slate-50 dark:bg-slate-905",
    text: "text-slate-550 dark:text-slate-450",
    dot: "bg-slate-400",
  },
};

// Category config with icons
const CATEGORY_STYLES = {
  road: {
    label: "Road",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    icon: Car,
  },
  electricity: {
    label: "Electricity",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    icon: Zap,
  },
  water: {
    label: "Water",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    icon: Droplet,
  },
  sanitation: {
    label: "Sanitation",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    icon: Trash2,
  },
  drainage: {
    label: "Drainage",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    icon: Compass,
  },
  solid_waste: {
    label: "Solid Waste",
    color: "text-lime-500",
    bg: "bg-lime-500/10",
    icon: Trash2,
  },
  public_health: {
    label: "Public Health",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    icon: Heart,
  },
  other: {
    label: "Other",
    color: "text-slate-505",
    bg: "bg-slate-505/10",
    icon: HelpCircle,
  },
};

export default function CityAdminAllIssues({ cityAdminUserId, onSelectIssue }) {
  // --- States ---
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [escalationFilter, setEscalationFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selected row tracking for bulk actions
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // Detail view drawer
  const [activeIssue, setActiveIssue] = useState(null);

  // Drawer layout tab state
  const [detailTab, setDetailTab] = useState("overview"); // overview, assignments, sla

  // Modals visibility states
  const [modalType, setModalType] = useState(null); // uo_assignment, fo_assignment, classification, priority, status_override, sla_extension, escalate, message, bulk_action
  const [modalIssue, setModalIssue] = useState(null);

  // Modals form input states
  const [modalReason, setModalReason] = useState("");
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDeadlineDate, setSelectedDeadlineDate] = useState("");
  const [escalationCategory, setEscalationCategory] = useState("sla_breach");
  const [escalationPriority, setEscalationPriority] = useState("medium");
  const [messageRecipientId, setMessageRecipientId] = useState("");
  const [messageText, setMessageText] = useState("");

  const [bulkActionType, setBulkActionType] = useState("send_reminder");
  const [bulkPriority, setBulkPriority] = useState("low");
  const [bulkDepartment, setBulkDepartment] = useState("");

  // Error/Success Toasts
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setPage(1); // Reset page on search change
    }, 350);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [
    statusFilter,
    categoryFilter,
    priorityFilter,
    assignmentFilter,
    slaFilter,
    escalationFilter,
    dateRangeFilter,
    sortBy,
  ]);

  // Escape key handler to close panels
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveIssue(null);
        setModalType(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Convex Queries ---
  const queryArgs = {
    cityAdminUserId,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
    assignmentStatus: assignmentFilter !== "all" ? assignmentFilter : undefined,
    slaStatus: slaFilter !== "all" ? slaFilter : undefined,
    escalationStatus: escalationFilter !== "all" ? escalationFilter : undefined,
    dateRange: dateRangeFilter !== "all" ? dateRangeFilter : undefined,
    sortBy,
    page,
    pageSize,
  };

  const response = useQuery(api.cityAdmin.getCityAdminIssues, queryArgs);
  const isQueryLoading = response === undefined;

  // Query for candidates when assignment modal is open
  const assignmentCandidates = useQuery(
    api.cityAdmin.getAssignmentCandidates,
    modalType === "uo_assignment" || modalType === "fo_assignment"
      ? {
          cityAdminUserId,
          issueId: modalIssue?.id,
          officerType:
            modalType === "uo_assignment" ? "unit_officer" : "field_officer",
        }
      : "skip",
  );

  // Helper query for full CSV export
  const exportArgs = {
    ...queryArgs,
    page: 1,
    pageSize: 10000,
  };
  const exportResponse = useQuery(api.cityAdmin.getCityAdminIssues, exportArgs);

  // --- Convex Mutations ---
  const assignUnitOfficerMutation = useMutation(
    api.cityAdmin.assignOrReassignUnitOfficer,
  );
  const assignFieldOfficerMutation = useMutation(
    api.cityAdmin.assignOrReassignFieldOfficer,
  );
  const classificationMutation = useMutation(
    api.cityAdmin.changeIssueClassification,
  );
  const priorityMutation = useMutation(api.cityAdmin.updateIssuePriority);
  const statusOverrideMutation = useMutation(api.cityAdmin.overrideIssueStatus);
  const SLAExtensionMutation = useMutation(api.cityAdmin.updateSlaDeadline);
  const escalateIssueMutation = useMutation(api.cityAdmin.escalateIssue);
  const sendMessageMutation = useMutation(api.cityAdmin.sendIssueMessage);
  const bulkUpdateMutation = useMutation(api.cityAdmin.bulkUpdateIssues);

  // --- Calculations & Sync ---
  const {
    scope,
    issues = [],
    pagination = {},
    filterCounts = {},
  } = response || {};

  // Status & Priority Labels mappings
  const STATUS_LABELS = {
    pending: "Pending",
    verified: "Verified",
    assigned: "Assigned",
    in_progress: "In Progress",
    pending_uo_verification: "Pending UO Verification",
    rework_required: "Rework Required",
    reopened: "Reopened",
    escalated: "Escalated",
    resolved: "Resolved",
    closed: "Closed",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };

  const PRIORITY_LABELS = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };

  const CATEGORY_LABELS = {
    road: "Road",
    electricity: "Electricity",
    water: "Water",
    sanitation: "Sanitation",
    drainage: "Drainage",
    solid_waste: "Solid Waste",
    public_health: "Public Health",
    other: "Other",
  };

  const SLA_LABELS = {
    overdue: "Overdue",
    due_soon: "Due Soon",
    on_track: "On Track",
    no_deadline: "No Deadline",
  };

  // Toast helper
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // --- Handlers ---
  const handleClearFilters = () => {
    setSearchValue("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setAssignmentFilter("all");
    setSlaFilter("all");
    setEscalationFilter("all");
    setDateRangeFilter("all");
    setSelectedRowIds([]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(issues.map((i) => i.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter((rowId) => rowId !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  // Summary card filter trigger click helper
  const handleSummaryCardClick = (cardType) => {
    handleClearFilters();
    if (cardType === "total") {
      // already cleared
    } else if (cardType === "active") {
      setStatusFilter("in_progress");
    } else if (cardType === "unassigned") {
      setAssignmentFilter("unassigned");
    } else if (cardType === "overdue") {
      setSlaFilter("overdue");
    } else if (cardType === "escalated") {
      setEscalationFilter("escalated");
    } else if (cardType === "resolved") {
      setStatusFilter("resolved");
    }
  };

  // Get matching active card ring states
  const getSummaryCardRing = (cardType) => {
    if (
      cardType === "total" &&
      statusFilter === "all" &&
      categoryFilter === "all" &&
      priorityFilter === "all" &&
      assignmentFilter === "all" &&
      slaFilter === "all" &&
      escalationFilter === "all" &&
      dateRangeFilter === "all" &&
      searchValue === ""
    ) {
      return SUMMARY_CARD_STYLES.total.ring;
    }
    if (cardType === "active" && statusFilter === "in_progress")
      return SUMMARY_CARD_STYLES.active.ring;
    if (cardType === "unassigned" && assignmentFilter === "unassigned")
      return SUMMARY_CARD_STYLES.unassigned.ring;
    if (cardType === "overdue" && slaFilter === "overdue")
      return SUMMARY_CARD_STYLES.overdue.ring;
    if (cardType === "escalated" && escalationFilter === "escalated")
      return SUMMARY_CARD_STYLES.escalated.ring;
    if (cardType === "resolved" && statusFilter === "resolved")
      return SUMMARY_CARD_STYLES.resolved.ring;
    return "ring-1 ring-slate-200/50 dark:ring-slate-700/40";
  };

  // Open modal trigger
  const openModal = (type, issue) => {
    setModalType(type);
    setModalIssue(issue);
    setModalReason("");
    setSelectedOfficerId("");

    // Initialize values from issue
    if (issue) {
      setSelectedCategory(issue.category);
      setSelectedSubcategories(issue.subcategory.join(", "));
      setSelectedDepartment(issue.department || "");
      setSelectedPriority(issue.priority);
      setSelectedStatus(issue.status);
      setSelectedDeadlineDate(
        issue.sla.deadline
          ? new Date(issue.sla.deadline).toISOString().substring(0, 16)
          : "",
      );
      setMessageRecipientId(
        issue.assignedUnitOfficer
          ? String(issue.assignedUnitOfficer.userId)
          : "",
      );
    }
  };

  const closeModal = () => {
    setModalType(null);
    setModalIssue(null);
  };

  // Form submission handler
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalIssue && modalType !== "bulk_action") return;
    setIsSubmitting(true);

    try {
      if (modalType === "uo_assignment") {
        if (!selectedOfficerId) throw new Error("Please select a candidate");
        const res = await assignUnitOfficerMutation({
          cityAdminUserId,
          issueId: modalIssue.id,
          newUnitOfficerId: selectedOfficerId,
          reason: modalReason,
        });

        if (res?.code === "INCOMPATIBLE_FIELD_OFFICER") {
          const confirmClear = window.confirm(
            `${res.message}\n\nWould you like to clear the Field Officer assignment?`,
          );
          if (confirmClear) {
            await assignUnitOfficerMutation({
              cityAdminUserId,
              issueId: modalIssue.id,
              newUnitOfficerId: selectedOfficerId,
              reason: modalReason,
              clearIncompatibleFieldOfficer: true,
            });
            showToast(
              "success",
              "Unit Officer assigned and incompatible Field Officer cleared",
            );
          }
        } else {
          showToast("success", "Unit Officer assigned successfully");
        }
      } else if (modalType === "fo_assignment") {
        if (!selectedOfficerId) throw new Error("Please select a candidate");
        await assignFieldOfficerMutation({
          cityAdminUserId,
          issueId: modalIssue.id,
          newFieldOfficerId: selectedOfficerId,
          reason: modalReason,
        });
        showToast("success", "Field Officer assigned successfully");
      } else if (modalType === "classification") {
        const sub = selectedSubcategories
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const res = await classificationMutation({
          cityAdminUserId,
          issueId: modalIssue.id,
          category: selectedCategory,
          subcategory: sub,
          department: selectedDepartment,
          reason: modalReason,
        });

        if (res?.code === "INCOMPATIBLE_OFFICERS") {
          const confirmClear = window.confirm(
            `${res.message}\n\nWould you like to clear the incompatible officer assignments?`,
          );
          if (confirmClear) {
            await classificationMutation({
              cityAdminUserId,
              issueId: modalIssue.id,
              category: selectedCategory,
              subcategory: sub,
              department: selectedDepartment,
              reason: modalReason,
              clearIncompatibleOfficers: true,
            });
            showToast(
              "success",
              "Issue reclassified and incompatible officer assignments cleared",
            );
          }
        } else {
          showToast("success", "Issue classification updated successfully");
        }
      } else if (modalType === "priority") {
        await priorityMutation({
          cityAdminUserId,
          issueId: modalIssue.id,
          priority: selectedPriority,
          reason: modalReason,
        });
        showToast("success", "Priority updated successfully");
      } else if (modalType === "status_override") {
        await statusOverrideMutation({
          cityAdminUserId,
          issueId: modalIssue.id,
          newStatus: selectedStatus,
          reason: modalReason,
        });
        showToast("success", "Status overridden successfully");
      } else if (modalType === "sla_extension") {
        if (!selectedDeadlineDate) throw new Error("Please select a deadline");
        await SLAExtensionMutation({
          cityAdminUserId,
          issueId: modalIssue.id,
          newDeadline: new Date(selectedDeadlineDate).getTime(),
          reason: modalReason,
        });
        showToast("success", "SLA deadline updated successfully");
      } else if (modalType === "escalate") {
        await escalateIssueMutation({
          cityAdminUserId,
          issueId: modalIssue.id,
          category: escalationCategory,
          priority: escalationPriority,
          reason: modalReason,
        });
        showToast("success", "Issue escalated to Platform Administration");
      } else if (modalType === "message") {
        if (!messageText.trim()) throw new Error("Please enter a message");
        await sendMessageMutation({
          cityAdminUserId,
          issueId: modalIssue.id,
          recipientUserId: messageRecipientId,
          messageText: messageText,
        });
        showToast("success", "Issue-linked message sent successfully");
        setMessageText("");
      } else if (modalType === "bulk_action") {
        if (selectedRowIds.length === 0) throw new Error("No rows selected");
        const res = await bulkUpdateMutation({
          cityAdminUserId,
          issueIds: selectedRowIds,
          actionType: bulkActionType,
          priority:
            bulkActionType === "change_priority" ? bulkPriority : undefined,
          department:
            bulkActionType === "assign_department" ? bulkDepartment : undefined,
          reason: modalReason,
        });

        const successCount = res?.successfulIssueIds?.length || 0;
        const skipCount = res?.skippedIssues?.length || 0;

        if (skipCount > 0) {
          showToast(
            "warning",
            `Completed bulk action. Success: ${successCount}, Skipped: ${skipCount} (Reasons: ${res.skippedIssues.map((s) => s.reason).join("; ")})`,
          );
        } else {
          showToast("success", `Bulk action applied to ${successCount} issues`);
        }
        setSelectedRowIds([]);
      }

      closeModal();
      // If we performed action on the active/open issue details, refresh details view
      if (modalIssue && activeIssue && modalIssue.id === activeIssue.id) {
        setActiveIssue(null);
      }
    } catch (err) {
      showToast("error", err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (!exportResponse || !exportResponse.issues) {
      showToast("error", "Export data is not ready yet. Please wait.");
      return;
    }

    const headers = [
      "Issue Code",
      "Title",
      "Category",
      "Subcategory",
      "Department",
      "Status",
      "Priority",
      "Address",
      "City",
      "Reported At",
      "Unit Officer",
      "Field Officer",
      "SLA Deadline",
      "SLA Status",
      "Escalated",
    ];

    const rows = exportResponse.issues.map((i) => [
      i.code,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      `"${i.subcategory.join(", ")}"`,
      i.department || "None",
      i.status,
      i.priority,
      `"${i.address.replace(/"/g, '""')}"`,
      i.city,
      new Date(i.createdAt).toISOString(),
      i.assignedUnitOfficer ? i.assignedUnitOfficer.name : "Unassigned",
      i.assignedFieldOfficer ? i.assignedFieldOfficer.name : "Unassigned",
      i.sla.deadline ? new Date(i.sla.deadline).toISOString() : "None",
      i.sla.status,
      i.escalation.isEscalated ? "Yes" : "No",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `citycare_issues_${scope?.city || "export"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Exported all matching issues successfully");
  };

  // Helper to remove individual filter chips
  const removeFilter = (filterKey) => {
    if (filterKey === "search") setSearchValue("");
    if (filterKey === "status") setStatusFilter("all");
    if (filterKey === "category") setCategoryFilter("all");
    if (filterKey === "priority") setPriorityFilter("all");
    if (filterKey === "assignment") setAssignmentFilter("all");
    if (filterKey === "sla") setSlaFilter("all");
    if (filterKey === "escalation") setEscalationFilter("all");
    if (filterKey === "dateRange") setDateRangeFilter("all");
  };

  // Check if any filter is active for chips rendering
  const activeChips = useMemo(() => {
    const chips = [];
    if (debouncedSearch)
      chips.push({ key: "search", label: `Search: ${debouncedSearch}` });
    if (statusFilter !== "all")
      chips.push({
        key: "status",
        label: `Status: ${STATUS_LABELS[statusFilter] ?? statusFilter}`,
      });
    if (categoryFilter !== "all")
      chips.push({
        key: "category",
        label: `Category: ${CATEGORY_LABELS[categoryFilter] ?? categoryFilter}`,
      });
    if (priorityFilter !== "all")
      chips.push({
        key: "priority",
        label: `Priority: ${PRIORITY_LABELS[priorityFilter] ?? priorityFilter}`,
      });
    if (assignmentFilter !== "all")
      chips.push({
        key: "assignment",
        label: `Assignment: ${assignmentFilter.replace(/_/g, " ")}`,
      });
    if (slaFilter !== "all")
      chips.push({
        key: "sla",
        label: `SLA: ${SLA_LABELS[slaFilter] ?? slaFilter}`,
      });
    if (escalationFilter !== "all")
      chips.push({
        key: "escalation",
        label: `Escalation: ${escalationFilter === "escalated" ? "Escalated" : "Not Escalated"}`,
      });
    if (dateRangeFilter !== "all")
      chips.push({ key: "dateRange", label: `Period: ${dateRangeFilter}` });
    return chips;
  }, [
    debouncedSearch,
    statusFilter,
    categoryFilter,
    priorityFilter,
    assignmentFilter,
    slaFilter,
    escalationFilter,
    dateRangeFilter,
  ]);

  // SLA progress math helper
  const calculateSlaProgress = (issue) => {
    if (!issue.sla.deadline || !issue.createdAt) return 0;
    const total = issue.sla.deadline - issue.createdAt;
    if (total <= 0) return 100;
    const elapsed = Date.now() - issue.createdAt;
    const progress = (elapsed / total) * 100;
    return Number.isFinite(progress)
      ? Math.min(100, Math.max(0, Math.floor(progress)))
      : 0;
  };

  // Initials badge helper
  const getInitials = (name) => {
    return (
      String(name || "")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "??"
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-16 animate-fadeIn relative text-slate-800 dark:text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl transition-all duration-300 transform translate-y-0 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-955/20 dark:border-emerald-850 dark:text-emerald-300"
              : toast.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-955/20 dark:border-amber-850 dark:text-amber-300"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-955/20 dark:border-red-850 dark:text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : toast.type === "warning" ? (
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modern Page Header */}
      <div className="flex mt-5 flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              All Issues
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-wider uppercase rounded-full border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Data
            </div>
          </div>
          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
            Monitor, filter, assign, and manage civic issues across{" "}
            {scope?.city ?? "loading..."}.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Administrative Scope Badge */}
          <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-extrabold text-xs rounded-xl shadow-inner select-none">
            Administrative Scope:{" "}
            <span className="text-cyan-600 dark:text-cyan-400">
              {scope?.city ?? "Varanasi"}, {scope?.state ?? "Uttar Pradesh"}
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-805 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold rounded-xl text-xs transition-all duration-200 shadow shadow-slate-900/10 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-4 h-4" />
            Export CSV ({pagination.totalItems ?? 0})
          </button>
        </div>
      </div>

      {/* Counts Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            type: "total",
            label: "Total Issues",
            value: filterCounts.total,
            desc: "All municipal filings",
            style: SUMMARY_CARD_STYLES.total,
            icon: FileText,
          },
          {
            type: "active",
            label: "Active Issues",
            value: filterCounts.active,
            desc: "Operational progress",
            style: SUMMARY_CARD_STYLES.active,
            icon: Activity,
          },
          {
            type: "unassigned",
            label: "Unassigned",
            value: filterCounts.unassigned,
            desc: "Needs officer review",
            style: SUMMARY_CARD_STYLES.unassigned,
            icon: Users,
          },
          {
            type: "overdue",
            label: "SLA Overdue",
            value: filterCounts.overdue,
            desc: "Immediate attention",
            style: SUMMARY_CARD_STYLES.overdue,
            icon: Clock,
          },
          {
            type: "escalated",
            label: "Escalated",
            value: filterCounts.escalated,
            desc: "High-priority oversight",
            style: SUMMARY_CARD_STYLES.escalated,
            icon: AlertTriangle,
          },
          {
            type: "resolved",
            label: "Resolved",
            value: filterCounts.resolved,
            desc: "Verified & completed",
            style: SUMMARY_CARD_STYLES.resolved,
            icon: CheckCircle2,
          },
        ].map((card) => {
          const Icon = card.icon;
          const isActiveRing = getSummaryCardRing(card.type);
          return (
            <button
              key={card.type}
              onClick={() => handleSummaryCardClick(card.type)}
              className={`text-left bg-gradient-to-br ${card.style.bg} border ${card.style.border} ${isActiveRing} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between h-36 relative overflow-hidden group focus:outline-none`}
            >
              <div className="flex justify-between items-start w-full">
                <div
                  className={`p-2.5 rounded-xl ${card.style.iconBg} transition-transform duration-205 group-hover:scale-110`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-2xl font-black tracking-tight ${card.style.text}`}
                >
                  {card.value ?? 0}
                </span>
              </div>

              <div className="space-y-0.5 mt-4">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                  {card.label}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate leading-none">
                  {card.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search issue code, title, citizen, officer, or location..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-55 hover:bg-slate-100/50 focus:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900/70 dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl font-semibold text-sm text-slate-800 dark:text-white transition-all outline-none"
          />
        </div>

        {/* Dropdowns Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase pl-1">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/25"
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase pl-1">
              Category
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-705 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/25"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-550 dark:text-slate-400 font-black uppercase pl-1">
              Priority
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-705 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/25"
            >
              <option value="all">All Priorities</option>
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-550 dark:text-slate-400 font-black uppercase pl-1">
              Assignment
            </span>
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-705 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/25"
            >
              <option value="all">All Assignments</option>
              <option value="fully_assigned">Fully Assigned</option>
              <option value="unit_officer_only">Unit Officer Only</option>
              <option value="field_officer_only">Field Officer Only</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>

          {/* SLA */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-555 dark:text-slate-400 font-black uppercase pl-1">
              SLA Status
            </span>
            <select
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-705 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/25"
            >
              <option value="all">All SLA States</option>
              {Object.entries(SLA_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Escalation */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-555 dark:text-slate-400 font-black uppercase pl-1">
              Escalation
            </span>
            <select
              value={escalationFilter}
              onChange={(e) => setEscalationFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-705 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/25"
            >
              <option value="all">All Issues</option>
              <option value="escalated">Escalated Only</option>
              <option value="not_escalated">Not Escalated</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-555 dark:text-slate-400 font-black uppercase pl-1">
              Period
            </span>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-705 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/25"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleClearFilters}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-extrabold rounded-xl text-xs text-slate-700 dark:text-slate-200 transition-all duration-200 cursor-pointer border border-slate-200 dark:border-slate-600"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-150 dark:border-slate-700/50 items-center animate-fadeIn">
            <span className="text-[10px] font-black text-slate-400 uppercase mr-1">
              Active Filters:
            </span>
            {activeChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold rounded-lg border border-cyan-150 dark:border-cyan-900/30 transition-all"
              >
                {chip.label}
                <button
                  onClick={() => removeFilter(chip.key)}
                  className="p-0.5 hover:bg-cyan-200/50 dark:hover:bg-cyan-905 rounded text-cyan-500 hover:text-cyan-700 transition-colors"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            {activeChips.length >= 2 && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-black text-rose-500 hover:text-rose-600 ml-2 hover:underline transition-all cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk actions sticky block */}
      {selectedRowIds.length > 0 && (
        <div className="sticky bottom-4 z-40 bg-gradient-to-r from-slate-905/90 to-blue-955/90 backdrop-blur-md text-white rounded-2xl p-4 border border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold">
              {selectedRowIds.length} operational{" "}
              {selectedRowIds.length === 1 ? "issue" : "issues"} selected
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => openModal("bulk_action", null)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-extrabold rounded-xl shadow-md transition-all duration-200 cursor-pointer"
            >
              Perform Bulk Actions
            </button>
            <button
              onClick={() => setSelectedRowIds([])}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-extrabold rounded-xl border border-slate-700 transition-all duration-205 cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Table / Cards View */}
      <div className="bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        {/* Table Summary Toolbar */}
        <div className="px-6 py-5 border-b border-slate-150 dark:border-slate-700/60 bg-slate-50/30 dark:bg-slate-800/40 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {isQueryLoading ? (
              <span>Scanning Operations Room...</span>
            ) : (
              <span>
                {activeChips.length > 0 ? (
                  <>
                    Showing{" "}
                    <span className="text-cyan-600 dark:text-cyan-400">
                      {pagination.totalItems}
                    </span>{" "}
                    matching issues in {scope?.city}
                  </>
                ) : (
                  <>
                    Showing {pagination.totalItems} municipal issues in{" "}
                    {scope?.city}
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <span>Sorted by:</span>
            <span className="text-slate-800 dark:text-slate-300 font-black">
              {sortBy === "newest" && "Newest First"}
              {sortBy === "oldest" && "Oldest First"}
              {sortBy === "priority_high" && "Priority (High to Low)"}
              {sortBy === "priority_low" && "Priority (Low to High)"}
              {sortBy === "sla_soon" && "SLA (Deadline Soonest)"}
              {sortBy === "sla_overdue" && "SLA (Most Overdue)"}
              {sortBy === "updated" && "Recently Updated"}
            </span>
          </div>
        </div>

        {/* Loading / Content Skeletons */}
        {isQueryLoading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-6 flex items-center justify-between animate-pulse"
              >
                <div className="space-y-2.5 w-1/3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-5/6" />
                </div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-12" />
              </div>
            ))}
          </div>
        ) : issues.length === 0 ? (
          /* Visual Empty State Card */
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-fadeIn">
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-3xl mb-4 border border-slate-150 dark:border-slate-800">
              <FileCheck className="w-10 h-10 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white">
              {debouncedSearch
                ? `No issues found for "${debouncedSearch}"`
                : activeChips.length > 0
                  ? "No issues match the selected filters"
                  : "Operations Desk Clean!"}
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs max-w-sm mt-1.5 font-medium leading-relaxed">
              {debouncedSearch
                ? "Verify the spelling or try searching by an issue code, location address, or category name."
                : activeChips.length > 0
                  ? "Try clearing one or more active filters above to check the operational registers."
                  : `No civic issues have been reported in ${scope?.city ?? "your city"} yet.`}
            </p>
            {activeChips.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="mt-6 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-650 text-white dark:text-slate-100 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto max-h-[600px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-left border-b border-slate-200 dark:border-slate-700/60 sticky top-0 z-20 backdrop-blur-md">
                    <th className="py-4 px-5 w-8">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.length === issues.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                      Issue ID & Title
                    </th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 tracking-wider">
                      Category
                    </th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 tracking-wider">
                      Status
                    </th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 tracking-wider">
                      Priority
                    </th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 tracking-wider">
                      Location
                    </th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 tracking-wider">
                      Assigned Officers
                    </th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 tracking-wider">
                      SLA Timeline
                    </th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 tracking-wider">
                      Reported
                    </th>
                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 tracking-wider text-right pr-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-700/50">
                  {issues.map((issue) => {
                    const isSelected = selectedRowIds.includes(issue.id);

                    // SLA status and mapping
                    const slaOverdue = issue.sla.status === "breached";
                    const slaDueSoon = issue.sla.status === "at_risk";
                    const isEscalated = issue.escalation.isEscalated;
                    const isUnassignedCritical =
                      issue.priority === "critical" &&
                      !issue.assignedUnitOfficer &&
                      !issue.assignedFieldOfficer;

                    // Row left indicator class mapping
                    let rowBorderClass = "";
                    if (isUnassignedCritical)
                      rowBorderClass = "border-l-4 border-l-red-600";
                    else if (slaOverdue)
                      rowBorderClass = "border-l-4 border-l-rose-500";
                    else if (isEscalated)
                      rowBorderClass = "border-l-4 border-l-orange-500";
                    else if (slaDueSoon)
                      rowBorderClass = "border-l-4 border-l-amber-500";

                    // Category config
                    const catCfg =
                      CATEGORY_STYLES[issue.category] ?? CATEGORY_STYLES.other;
                    const CatIcon = catCfg.icon;

                    // Status style config
                    const statusCfg = STATUS_STYLES[issue.status] ?? {
                      bg: "bg-slate-50",
                      text: "text-slate-600",
                      dot: "bg-slate-400",
                    };

                    // Progress bar values
                    const progressVal = calculateSlaProgress(issue);

                    return (
                      <tr
                        key={issue.id}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150 ${rowBorderClass} ${
                          isSelected ? "bg-cyan-500/5 dark:bg-cyan-500/10" : ""
                        } ${issue.status === "resolved" || issue.status === "closed" ? "opacity-80" : ""}`}
                      >
                        <td className="py-4 px-5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(issue.id)}
                            className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 font-mono text-[10px] font-black rounded border border-cyan-150 dark:border-cyan-900/30">
                                {issue.code}
                              </span>
                              {isUnassignedCritical && (
                                <span
                                  title="Critical Priority and Unassigned"
                                  className="inline-flex text-red-500 animate-pulse"
                                >
                                  <AlertOctagon className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setDetailTab("overview");
                                setActiveIssue(issue);
                              }}
                              className="text-left font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1 hover:text-cyan-600 dark:hover:text-cyan-400 hover:underline transition-all"
                            >
                              {issue.title}
                            </button>
                            <p className="text-slate-400 dark:text-slate-500 text-xs line-clamp-1 mt-0.5 font-medium leading-none">
                              {issue.description}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${catCfg.bg} ${catCfg.color} text-xs font-bold rounded-lg border border-current/10 capitalize`}
                          >
                            <CatIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            {catCfg.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${statusCfg.bg} ${statusCfg.text} text-[10px] font-black rounded-full uppercase tracking-wider`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                            />
                            {STATUS_LABELS[issue.status] ??
                              issue.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                issue.priority === "critical"
                                  ? "bg-red-500 animate-pulse"
                                  : issue.priority === "high"
                                    ? "bg-orange-500"
                                    : issue.priority === "medium"
                                      ? "bg-amber-500"
                                      : "bg-slate-400"
                              }`}
                            />
                            <span className="text-xs font-bold capitalize text-slate-700 dark:text-slate-200">
                              {PRIORITY_LABELS[issue.priority] ??
                                issue.priority}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-[150px]">
                          <div className="flex items-start gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
                            <span
                              className="text-xs truncate block"
                              title={issue.address}
                            >
                              {issue.address}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-slate-550 dark:text-slate-400 space-y-1.5">
                          {/* Unit Officer assignment display */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                                issue.assignedUnitOfficer
                                  ? "bg-slate-800 text-white"
                                  : "bg-amber-100 dark:bg-amber-955/20 text-amber-600"
                              }`}
                            >
                              {issue.assignedUnitOfficer
                                ? getInitials(issue.assignedUnitOfficer.name)
                                : "UO"}
                            </div>
                            <span className="text-slate-700 dark:text-slate-250 font-semibold truncate block max-w-[100px]">
                              {issue.assignedUnitOfficer ? (
                                issue.assignedUnitOfficer.name
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openModal("uo_assignment", issue)
                                  }
                                  className="text-amber-650 dark:text-amber-400 font-bold hover:underline"
                                >
                                  Assign UO
                                </button>
                              )}
                            </span>
                          </div>

                          {/* Field Officer assignment display */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                                issue.assignedFieldOfficer
                                  ? "bg-slate-800 text-white"
                                  : "bg-amber-100 dark:bg-amber-955/20 text-amber-600"
                              }`}
                            >
                              {issue.assignedFieldOfficer
                                ? getInitials(issue.assignedFieldOfficer.name)
                                : "FO"}
                            </div>
                            <span className="text-slate-700 dark:text-slate-250 font-semibold truncate block max-w-[100px]">
                              {issue.assignedFieldOfficer ? (
                                issue.assignedFieldOfficer.name
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openModal("fo_assignment", issue)
                                  }
                                  className="text-amber-650 dark:text-amber-400 font-bold hover:underline"
                                >
                                  Assign FO
                                </button>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-[110px]">
                          {issue.sla.deadline ? (
                            <div className="flex flex-col gap-1.5 font-bold">
                              <span
                                className={`text-[10px] font-black rounded px-1.5 py-0.5 uppercase tracking-tight text-center ${
                                  issue.sla.status === "breached"
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-455"
                                    : issue.sla.status === "at_risk"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-455"
                                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-455"
                                }`}
                              >
                                {issue.sla.status === "breached"
                                  ? `Overdue by ${issue.sla.overdueHours}h`
                                  : issue.sla.status === "at_risk"
                                    ? `Due in ${issue.sla.hoursRemaining}h`
                                    : "On Track"}
                              </span>
                              {/* SLA progress bar */}
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    issue.sla.status === "breached"
                                      ? "bg-red-500"
                                      : issue.sla.status === "at_risk"
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${progressVal}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              No Deadline
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500 font-semibold">
                          {new Date(issue.createdAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </td>
                        <td className="py-4 px-4 text-right pr-6">
                          <div className="flex justify-end items-center gap-1">
                            <button
                              onClick={() => {
                                setDetailTab("overview");
                                setActiveIssue(issue);
                              }}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-750 dark:hover:text-white transition-colors"
                              title="Quick View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <IssueActionMenu
                              issue={issue}
                              openModal={openModal}
                              setActiveIssue={setActiveIssue}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Layout */}
            <div className="lg:hidden divide-y divide-slate-150 dark:divide-slate-700/60 animate-fadeIn">
              {issues.map((issue) => {
                const catCfg =
                  CATEGORY_STYLES[issue.category] ?? CATEGORY_STYLES.other;
                const statusCfg = STATUS_STYLES[issue.status] ?? {
                  bg: "bg-slate-100",
                  text: "text-slate-700",
                  dot: "bg-slate-400",
                };
                const isSelected = selectedRowIds.includes(issue.id);
                const progressVal = calculateSlaProgress(issue);
                return (
                  <div
                    key={issue.id}
                    className={`p-5 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors ${
                      isSelected ? "bg-cyan-500/5 dark:bg-cyan-500/10" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(issue.id)}
                          className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-4.5 h-4.5 cursor-pointer"
                        />
                        <span className="font-mono text-xs font-extrabold text-cyan-600 dark:text-cyan-400 px-2 py-0.5 bg-cyan-55 dark:bg-cyan-950 border border-cyan-150 dark:border-cyan-900/30 rounded">
                          {issue.code}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-black rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                        {issue.priority} Priority
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-905 dark:text-white text-base mt-1 line-clamp-1">
                      {issue.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 ${catCfg.bg} ${catCfg.color} text-[10px] font-bold rounded capitalize border border-current/10`}
                      >
                        {catCfg.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 ${statusCfg.bg} ${statusCfg.text} text-[9px] font-black rounded-full uppercase tracking-wider`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${statusCfg.dot}`}
                        />
                        {STATUS_LABELS[issue.status] ?? issue.status}
                      </span>
                    </div>

                    <p className="text-slate-500 dark:text-slate-450 text-xs line-clamp-2 mt-3 leading-relaxed font-semibold">
                      {issue.description}
                    </p>

                    <div className="mt-4 p-3 bg-slate-55 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-2 text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{issue.address}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-150 dark:border-slate-700/50">
                        <div>
                          <span className="block text-[9px] font-black text-slate-400 uppercase leading-none mb-1">
                            Unit Officer
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold block">
                            {issue.assignedUnitOfficer ? (
                              issue.assignedUnitOfficer.name
                            ) : (
                              <button
                                onClick={() =>
                                  openModal("uo_assignment", issue)
                                }
                                className="text-amber-600 font-bold hover:underline"
                              >
                                Assign UO
                              </button>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-black text-slate-400 uppercase leading-none mb-1">
                            Field Officer
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold block">
                            {issue.assignedFieldOfficer ? (
                              issue.assignedFieldOfficer.name
                            ) : (
                              <button
                                onClick={() =>
                                  openModal("fo_assignment", issue)
                                }
                                className="text-amber-650 font-bold hover:underline"
                              >
                                Assign FO
                              </button>
                            )}
                          </span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-150 dark:border-slate-700/50 flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-450 uppercase">
                            SLA Deadline
                          </span>
                          <div className="flex items-center gap-2">
                            {issue.sla.deadline ? (
                              <>
                                <span
                                  className={`text-[9px] font-black rounded px-1.5 py-0.5 uppercase ${
                                    issue.sla.status === "breached"
                                      ? "bg-rose-500/10 text-rose-600"
                                      : "bg-emerald-500/10 text-emerald-600"
                                  }`}
                                >
                                  {issue.sla.status === "breached"
                                    ? `Overdue by ${issue.sla.overdueHours}h`
                                    : `Due in ${issue.sla.hoursRemaining}h`}
                                </span>
                                <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      issue.sla.status === "breached"
                                        ? "bg-red-500"
                                        : "bg-emerald-500"
                                    }`}
                                    style={{ width: `${progressVal}%` }}
                                  />
                                </div>
                              </>
                            ) : (
                              <span className="text-slate-400 italic">
                                None
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setDetailTab("overview");
                          setActiveIssue(issue);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-xs font-black rounded-xl transition-all"
                      >
                        View Details
                      </button>
                      <IssueActionMenu
                        issue={issue}
                        openModal={openModal}
                        setActiveIssue={setActiveIssue}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700/60 flex justify-between items-center bg-slate-50/20 dark:bg-slate-800/40">
              <div className="flex gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              {/* Mobile pagination simplifies */}
              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 text-xs font-black text-slate-600 dark:text-slate-400">
                  <span className="hidden sm:inline">Page </span>
                  {page} / {pagination.totalPages || 1}
                </span>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- Action Modals --- */}
      {modalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-205 dark:border-slate-700/60 shadow-2xl max-w-md w-full overflow-hidden transform scale-100 transition-all duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
              <h3 className="text-base font-black tracking-tight uppercase">
                {modalType === "uo_assignment" && "Assign Unit Officer"}
                {modalType === "fo_assignment" && "Assign Field Officer"}
                {modalType === "classification" && "Change Classification"}
                {modalType === "priority" && "Change Priority"}
                {modalType === "status_override" && "Status Override"}
                {modalType === "sla_extension" && "Set SLA Deadline"}
                {modalType === "escalate" && "Escalate Issue"}
                {modalType === "message" && "Send Linked Message"}
                {modalType === "bulk_action" && "Bulk Action Operations"}
              </h3>
              <button
                onClick={closeModal}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              {modalIssue && (
                <div className="bg-slate-55 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-xs text-slate-550 space-y-1.5 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-black text-[9px]">
                      Issue ID:
                    </span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400 font-extrabold">
                      {modalIssue.code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-black text-[9px]">
                      Issue Title:
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {modalIssue.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-black text-[9px]">
                      Current Status:
                    </span>
                    <span className="capitalize text-slate-805 dark:text-slate-350">
                      {STATUS_LABELS[modalIssue.status] ?? modalIssue.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Selectable Officer Candidates List */}
              {(modalType === "uo_assignment" ||
                modalType === "fo_assignment") && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-450">
                    Select Officer Candidate
                  </label>
                  {assignmentCandidates === undefined ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                    </div>
                  ) : assignmentCandidates.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No active officers in {scope?.city || "your city"}{" "}
                      matching department.
                    </div>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {assignmentCandidates.map((cand) => {
                        const progress =
                          (cand.currentWorkload / cand.maximumCapacity) * 100;
                        const workloadBg =
                          progress >= 90
                            ? "bg-red-500"
                            : progress >= 70
                              ? "bg-amber-500"
                              : "bg-emerald-500";
                        const isSelected = selectedOfficerId === cand.profileId;
                        return (
                          <div
                            key={cand.profileId}
                            onClick={() => setSelectedOfficerId(cand.profileId)}
                            className={`flex flex-col gap-2 p-3.5 bg-slate-55 dark:bg-slate-900 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 border rounded-2xl cursor-pointer text-xs transition-all duration-150 ${
                              isSelected
                                ? "border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm"
                                : "border-slate-205 dark:border-slate-700"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-extrabold text-slate-900 dark:text-white">
                                  {cand.name}
                                </p>
                                <p className="text-slate-400 text-[10px] font-semibold">
                                  Dept: {cand.department}
                                </p>
                              </div>
                              {cand.isRecommended && (
                                <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase rounded tracking-wider">
                                  Recommended
                                </span>
                              )}
                            </div>

                            {/* visual workload progress bar */}
                            <div className="space-y-1 mt-1 font-semibold text-[10px] text-slate-550">
                              <div className="flex justify-between">
                                <span>Active Workload:</span>
                                <span>
                                  {cand.currentWorkload} /{" "}
                                  {cand.maximumCapacity} active issues
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${workloadBg}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            {cand.compatibilityWarnings.length > 0 && (
                              <p className="text-red-500 font-bold text-[9px] flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                Department Mismatch Warning
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Classification Inputs */}
              {modalType === "classification" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-450 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                      Subcategories (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={selectedSubcategories}
                      onChange={(e) => setSelectedSubcategories(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      placeholder="e.g. Sanitation Department"
                      className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Priority Inputs */}
              {modalType === "priority" && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                    Select New Priority
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                  >
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status Override Inputs */}
              {modalType === "status_override" && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                    Override To Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* SLA Extension Date */}
              {modalType === "sla_extension" && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                    Select SLA Deadline Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={selectedDeadlineDate}
                    onChange={(e) => setSelectedDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>
              )}

              {/* Escalation Inputs */}
              {modalType === "escalate" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                      Escalation Category
                    </label>
                    <select
                      value={escalationCategory}
                      onChange={(e) => setEscalationCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="sla_breach">SLA Breach</option>
                      <option value="resource_shortage">
                        Resource Shortage
                      </option>
                      <option value="technical_complexity">
                        Technical Complexity
                      </option>
                      <option value="public_safety_risk">
                        Public Safety Risk
                      </option>
                      <option value="legal_or_regulatory">
                        Legal or Regulatory
                      </option>
                      <option value="citizen_escalation">
                        Citizen Escalation
                      </option>
                      <option value="other">Other Reason</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                      Escalation Severity
                    </label>
                    <select
                      value={escalationPriority}
                      onChange={(e) => setEscalationPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Send Message Inputs */}
              {modalType === "message" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                      Select Recipient
                    </label>
                    <select
                      value={messageRecipientId}
                      onChange={(e) => setMessageRecipientId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="">-- Choose Recipient --</option>
                      {modalIssue?.assignedUnitOfficer && (
                        <option
                          value={String(modalIssue.assignedUnitOfficer.userId)}
                        >
                          Unit Officer: {modalIssue.assignedUnitOfficer.name}
                        </option>
                      )}
                      {modalIssue?.assignedFieldOfficer && (
                        <option
                          value={String(modalIssue.assignedFieldOfficer.userId)}
                        >
                          Field Officer: {modalIssue.assignedFieldOfficer.name}
                        </option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                      Message
                    </label>
                    <textarea
                      placeholder="Write your issue-linked message..."
                      rows={4}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full p-3 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan-500/25"
                    />
                  </div>
                </div>
              )}

              {/* Bulk Actions Form */}
              {modalType === "bulk_action" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                      Bulk Action Type
                    </label>
                    <select
                      value={bulkActionType}
                      onChange={(e) => setBulkActionType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="send_reminder">
                        Send Reminder Notification
                      </option>
                      <option value="change_priority">Change Priority</option>
                      <option value="assign_department">
                        Assign Department
                      </option>
                    </select>
                  </div>

                  {bulkActionType === "change_priority" && (
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                        Select Priority
                      </label>
                      <select
                        value={bulkPriority}
                        onChange={(e) => setBulkPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  )}

                  {bulkActionType === "assign_department" && (
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                        Department Name
                      </label>
                      <input
                        type="text"
                        value={bulkDepartment}
                        onChange={(e) => setBulkDepartment(e.target.value)}
                        placeholder="e.g. Road Works Dept"
                        className="w-full px-3 py-2 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Mandatory Audit Reason (except messaging) */}
              {modalType !== "message" && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">
                    Reason / Justification{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Provide justification for this audit-logged action..."
                    required
                    rows={3}
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    className="w-full p-3 bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan-500/25"
                  />
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    This action will notify officers and construct an audit log
                    entry.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-205 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-900 font-extrabold rounded-xl text-xs transition-all duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-805 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-extrabold rounded-xl text-xs shadow-md disabled:opacity-40 transition-all duration-150 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? "Processing..." : "Confirm Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Detail Drawer Slide Panel (Right Side Panel) --- */}
      {activeIssue && (
        <div className="fixed inset-0 z-40 flex justify-end animate-fadeIn">
          {/* Backdrop */}
          <div
            onClick={() => setActiveIssue(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Panel Container */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 h-full shadow-2xl overflow-hidden flex flex-col z-10 transition-transform duration-300">
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs font-black text-cyan-400 uppercase tracking-widest px-2 py-0.5 bg-slate-850 rounded">
                  {activeIssue.code}
                </span>
                <h3 className="font-black text-lg text-white mt-2 leading-tight">
                  {activeIssue.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveIssue(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation inside Drawer */}
            <div className="flex border-b border-slate-150 dark:border-slate-700 bg-slate-50 dark:bg-slate-909 px-4 text-xs font-bold">
              {[
                { id: "overview", label: "Overview" },
                { id: "assignments", label: "Assignments" },
                { id: "sla", label: "SLA Tracker" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  className={`px-4 py-3.5 border-b-2 transition-all cursor-pointer ${
                    detailTab === tab.id
                      ? "border-cyan-505 text-cyan-600 dark:text-cyan-400"
                      : "border-transparent text-slate-500 dark:text-slate-450 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Body Scroll Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto pr-4 custom-scrollbar">
              {detailTab === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Status Tag Ribbon */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-wrap gap-2 items-center justify-between border border-slate-100 dark:border-slate-800/40">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase rounded-full tracking-wider">
                        {activeIssue.priority} Priority
                      </span>
                      <span
                        className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                          activeIssue.status === "pending"
                            ? "bg-slate-200 text-slate-805"
                            : activeIssue.status === "verified"
                              ? "bg-blue-100 text-blue-805"
                              : activeIssue.status === "assigned"
                                ? "bg-amber-100 text-amber-805"
                                : activeIssue.status === "in_progress"
                                  ? "bg-teal-100 text-teal-805"
                                  : activeIssue.status === "resolved"
                                    ? "bg-emerald-100 text-emerald-805"
                                    : "bg-red-105 text-red-805"
                        }`}
                      >
                        {STATUS_LABELS[activeIssue.status] ??
                          activeIssue.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Created:{" "}
                      {new Date(activeIssue.createdAt).toLocaleString("en-GB")}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-455 dark:text-slate-400">
                      Description
                    </h4>
                    <p className="text-sm text-slate-750 dark:text-slate-200 leading-relaxed font-semibold">
                      {activeIssue.description}
                    </p>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-700/50 py-4 text-xs font-semibold">
                    <div>
                      <span className="block text-[10px] text-slate-455 uppercase font-black mb-0.5">
                        Category
                      </span>
                      <span className="text-slate-800 dark:text-slate-100 capitalize">
                        {activeIssue.category}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-455 uppercase font-black mb-0.5">
                        Department
                      </span>
                      <span className="text-slate-800 dark:text-slate-100">
                        {activeIssue.department || "Not Assigned"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-455 uppercase font-black mb-0.5">
                        Subcategory
                      </span>
                      <span className="text-slate-805 dark:text-slate-100 truncate block">
                        {activeIssue.subcategory?.join(", ") || "None"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-455 uppercase font-black mb-0.5">
                        Last Updated
                      </span>
                      <span className="text-slate-800 dark:text-slate-100">
                        {new Date(activeIssue.updatedAt).toLocaleString(
                          "en-GB",
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Location Address details */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-455 dark:text-slate-400">
                      Location
                    </h4>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 rounded-2xl text-xs space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-slate-805 dark:text-white">
                            {activeIssue.address}
                          </p>
                          <p className="text-slate-450 mt-1 font-semibold">
                            Coords: {activeIssue.latitude},{" "}
                            {activeIssue.longitude}
                          </p>
                          <p className="text-slate-450 font-semibold">
                            Postal Code: {activeIssue.postal}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Citizen Contact Card */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-455 dark:text-slate-400">
                      Citizen Reporter
                    </h4>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 rounded-2xl text-xs space-y-2 font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-800 dark:text-white">
                          {activeIssue.citizen.name}
                        </span>
                      </div>
                      {activeIssue.citizen.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-800 dark:text-white">
                            {activeIssue.citizen.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Assignments Tab */}
              {detailTab === "assignments" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase text-slate-455 dark:text-slate-400">
                      Current Assignments
                    </h4>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openModal("uo_assignment", activeIssue)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                      >
                        Assign UO
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal("fo_assignment", activeIssue)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                      >
                        Assign FO
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Unit Officer assignment details */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/40 rounded-2xl text-xs space-y-2 font-semibold">
                      <span className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
                        Unit Officer (UO)
                      </span>
                      {activeIssue.assignedUnitOfficer ? (
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {activeIssue.assignedUnitOfficer.name}
                          </p>
                          <p className="text-slate-455">
                            {activeIssue.assignedUnitOfficer.email}
                          </p>
                          <p className="text-slate-455">
                            Dept: {activeIssue.assignedUnitOfficer.department}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">
                          Unit Officer not assigned
                        </p>
                      )}
                    </div>

                    {/* Field Officer assignment details */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800/40 rounded-2xl text-xs space-y-2 font-semibold">
                      <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        Field Officer (FO)
                      </span>
                      {activeIssue.assignedFieldOfficer ? (
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-white">
                            {activeIssue.assignedFieldOfficer.name}
                          </p>
                          <p className="text-slate-455">
                            {activeIssue.assignedFieldOfficer.email}
                          </p>
                          <p className="text-slate-455">
                            Dept: {activeIssue.assignedFieldOfficer.department}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">
                          Field Officer not assigned
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reclassification warning / button */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex items-center justify-between text-xs font-semibold">
                    <div>
                      <h5 className="font-extrabold text-slate-800 dark:text-white">
                        Change Department Classification
                      </h5>
                      <p className="text-slate-450 text-[10px] mt-0.5 font-bold">
                        Changing this category might clear current assignments.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openModal("classification", activeIssue)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-205 dark:bg-slate-700 dark:hover:bg-slate-650 rounded-lg font-bold border border-slate-200 dark:border-slate-600"
                    >
                      Reclassify
                    </button>
                  </div>
                </div>
              )}

              {/* SLA Tracking Tab */}
              {detailTab === "sla" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase text-slate-455 dark:text-slate-400">
                      SLA Status Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => openModal("sla_extension", activeIssue)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                    >
                      Change Deadline
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-905 border border-slate-105 dark:border-slate-800/40 rounded-2xl text-xs space-y-2 font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-455">SLA Status badge:</span>
                      <span className="font-extrabold capitalize text-slate-800 dark:text-white">
                        {activeIssue.sla.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-455">
                        Original SLA Deadline:
                      </span>
                      <span className="text-slate-800 dark:text-white">
                        {activeIssue.sla.originalDeadline
                          ? new Date(
                              activeIssue.sla.originalDeadline,
                            ).toLocaleString("en-GB")
                          : "None"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-455">Adjusted Deadline:</span>
                      <span className="text-slate-800 dark:text-white">
                        {activeIssue.sla.deadline
                          ? new Date(activeIssue.sla.deadline).toLocaleString(
                              "en-GB",
                            )
                          : "None"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-455">
                        Extension adjustments:
                      </span>
                      <span className="text-slate-800 dark:text-white">
                        {activeIssue.sla.extensionCount} extensions applied
                      </span>
                    </div>
                  </div>

                  {/* Escalation Control */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase text-slate-455 dark:text-slate-400">
                        Escalation Oversight
                      </h4>
                      {!activeIssue.escalation.isEscalated && (
                        <button
                          type="button"
                          onClick={() => openModal("escalate", activeIssue)}
                          className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-650 text-[10px] font-black rounded-lg transition-all"
                        >
                          Escalate Issue
                        </button>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-905 border border-slate-105 dark:border-slate-800/40 rounded-2xl text-xs space-y-2 font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-455">
                          Escalated to Platform Admin:
                        </span>
                        <span className="font-extrabold text-slate-805 dark:text-white">
                          {activeIssue.escalation.isEscalated ? "Yes" : "No"}
                        </span>
                      </div>
                      {activeIssue.escalation.isEscalated && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-455">
                              Escalation Reason:
                            </span>
                            <span className="text-slate-805 dark:text-white">
                              {activeIssue.escalation.reason}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">
                              Escalation Category:
                            </span>
                            <span className="text-slate-850 dark:text-white capitalize">
                              {activeIssue.escalation.category.replace(
                                /_/g,
                                " ",
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Action Footer inside Drawer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-150 dark:border-slate-700/60 flex flex-wrap gap-2 justify-end items-center sticky bottom-0 z-10">
              <button
                type="button"
                onClick={() => openModal("message", activeIssue)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-extrabold rounded-xl text-xs shadow transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Message UO/FO
              </button>
              <button
                type="button"
                onClick={() => setActiveIssue(null)}
                className="px-4 py-2 border border-slate-205 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 font-extrabold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Action dropdown menu helper component ---
function IssueActionMenu({ issue, openModal, setActiveIssue }) {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClose = () => setIsOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [isOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleMenu}
        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer"
        aria-label={`Open actions for ${issue.code}`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-xl z-30 py-2 divide-y divide-slate-105 dark:divide-slate-700/50 animate-fadeIn text-left text-xs font-semibold text-slate-700 dark:text-slate-200">
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setActiveIssue(issue);
              }}
              className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              View Details
            </button>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => openModal("uo_assignment", issue)}
              className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-slate-400" />
              Assign Unit Officer
            </button>
            <button
              type="button"
              onClick={() => openModal("fo_assignment", issue)}
              className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-slate-400" />
              Assign Field Officer
            </button>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => openModal("classification", issue)}
              className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
            >
              <Tag className="w-4 h-4 text-slate-400" />
              Change Category
            </button>
            <button
              type="button"
              onClick={() => openModal("priority", issue)}
              className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-slate-400" />
              Update Priority
            </button>
            <button
              type="button"
              onClick={() => openModal("status_override", issue)}
              className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-slate-400" />
              Status Override
            </button>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => openModal("sla_extension", issue)}
              className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              Adjust SLA Deadline
            </button>
            <button
              type="button"
              onClick={() => openModal("escalate", issue)}
              className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              Escalate Issue
            </button>
            <button
              type="button"
              onClick={() => openModal("message", issue)}
              className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-slate-700/50"
            >
              <Send className="w-4 h-4 text-slate-400" />
              Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
