import { getWardOfficerIssues, getFieldOfficers } from "./wardOfficerMockData";

const ISSUES_KEY = "city_care_issues";
const USERS_KEY = "city_care_users";

export function initializeLocalStorage() {
  const defaultIssues = getWardOfficerIssues();
  const defaultUsers = getFieldOfficers();

  localStorage.setItem(ISSUES_KEY, JSON.stringify(defaultIssues));
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
}

export function getIssuesFromStorage() {
  const stored = localStorage.getItem(ISSUES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getWardOfficerIssues();
    }
  }
  return getWardOfficerIssues();
}

export function getUsersFromStorage() {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getFieldOfficers();
    }
  }
  return getFieldOfficers();
}

export function updateIssue(issueId, updates) {
  const issues = getIssuesFromStorage();
  const issueIndex = issues.findIndex((i) => i.id === issueId);

  if (issueIndex === -1) return null;

  const updatedIssue = {
    ...issues[issueIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  issues[issueIndex] = updatedIssue;
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));

  return updatedIssue;
}

export function getIssueById(issueId) {
  const issues = getIssuesFromStorage();
  return issues.find((i) => i.id === issueId) || null;
}

export function getUserById(userId) {
  const users = getUsersFromStorage();
  return users.find((u) => u.id === userId) || null;
}

export function verifyAndApproveIssue(issueId, authenticityCheck, slaDate) {
  return updateIssue(issueId, {
    internal_status: "verified",
    status: "pending",
    authenticity_checked: authenticityCheck,
    sla_due_date: slaDate || null,
  });
}

export function assignFieldOfficer(issueId, fieldOfficerId, reason) {
  const officer = getUserById(fieldOfficerId);
  return updateIssue(issueId, {
    status: "in_progress",
    internal_status: "assigned",
    assigned_to: fieldOfficerId,
    assignee: officer,
    assignment_reason: reason || null,
  });
}

export function reassignFieldOfficer(
  issueId,
  newFieldOfficerId,
  reason,
  revisedSlaDate,
) {
  const officer = getUserById(newFieldOfficerId);
  const updateData = {
    status: "in_progress",
    internal_status: "assigned",
    assigned_to: newFieldOfficerId,
    assignee: officer,
    assignment_reason: reason,
    sla_status: "reassigned",
    is_overdue: false,
  };

  if (revisedSlaDate) {
    updateData.sla_deadline = revisedSlaDate;
  }

  return updateIssue(issueId, updateData);
}

export function approveResolution(issueId, wardOfficerId) {
  return updateIssue(issueId, {
    status: "resolved",
    internal_status: "wo_verified",
    wo_verified_at: new Date().toISOString(),
    wo_verified_by: wardOfficerId,
  });
}

export function requestRework(issueId, reason, wardOfficerId) {
  return updateIssue(issueId, {
    status: "in_progress",
    internal_status: "assigned",
    rework_requested: true,
    rework_reason: reason,
    rework_requested_by: wardOfficerId,
    rework_requested_at: new Date().toISOString(),
  });
}

export function rejectIssue(issueId, category, reason, notes, wardOfficerId) {
  return updateIssue(issueId, {
    status: "rejected",
    internal_status: "rejected",
    rejection_category: category,
    rejection_reason: reason,
    rejection_notes: notes,
    rejected_by: wardOfficerId,
    rejected_at: new Date().toISOString(),
    sla_status: "rejected",
    is_overdue: false,
  });
}

export function escalateToAdmin(issueId, escalationReason, wardOfficerId) {
  return updateIssue(issueId, {
    status: "in_progress",
    internal_status: "escalated_to_admin",
    escalation_reason: escalationReason,
    escalated_by: wardOfficerId,
    escalated_at: new Date().toISOString(),
    sla_status: "escalated",
    is_overdue: false,
  });
}

export function getWardOfficerIssuesFromStorage(wardOfficerId) {
  const issues = getIssuesFromStorage();

  if (wardOfficerId) {
    return issues.filter((i) => i.unit_officer_id === wardOfficerId);
  }

  return issues;
}

export function getFieldOfficersFromStorage() {
  return getUsersFromStorage().filter((u) => u.role === "field_officer");
}

export function postIssueUpdate(issueId, message, userId, userRole) {
  console.log("Issue update posted:", {
    issueId,
    message,
    userId,
    userRole,
    timestamp: new Date().toISOString(),
  });
  return true;
}

export function reverifyReopenedIssue(issueId) {
  return updateIssue(issueId, {
    status: "in_progress",
    internal_status: "assigned",
  });
}
