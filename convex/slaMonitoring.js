import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireCityAdmin } from "./helpers/cityAdminAuth";

/**
 * Backend helper to define SLA state consistently.
 */
function calculateIssueSlaState(issue, now) {
  const terminalStatuses = ["resolved", "closed", "rejected", "withdrawn"];

  if (terminalStatuses.includes(issue.status)) {
    return {
      status: "completed",
      hoursRemaining: 0,
      overdueHours: 0,
    };
  }

  if (!issue.slaDeadline) {
    return {
      status: "no_deadline",
      hoursRemaining: null,
      overdueHours: 0,
    };
  }

  const difference = issue.slaDeadline - now;

  if (difference < 0) {
    return {
      status: "breached",
      hoursRemaining: 0,
      overdueHours: Math.ceil(Math.abs(difference) / 3600000),
    };
  }

  const hoursRemaining = Math.round((difference / 3600000) * 10) / 10;

  if (hoursRemaining <= 24) {
    return {
      status: "due_soon",
      hoursRemaining,
      overdueHours: 0,
    };
  }

  if (hoursRemaining <= 48) {
    return {
      status: "at_risk",
      hoursRemaining,
      overdueHours: 0,
    };
  }

  return {
    status: "on_track",
    hoursRemaining,
    overdueHours: 0,
  };
}

const TERMINAL_ISSUE_STATUSES = new Set([
  "resolved",
  "closed",
  "rejected",
  "withdrawn",
]);

function isActiveIssue(issue) {
  return !TERMINAL_ISSUE_STATUSES.has(issue.status);
}

/**
 * Backend helper to define Escalation state consistently.
 */
function getEscalationState(issue) {
  const isEscalated =
    issue.status === "escalated" ||
    issue.escalatedToAdmin === true ||
    Boolean(issue.escalationReason) ||
    Boolean(issue.escalationCategory) ||
    Boolean(issue.escalation?.reason);

  const resolved =
    issue.escalationResolved === true ||
    issue.escalation?.resolved === true ||
    issue.escalationAdminReviewStatus === "resolved" ||
    issue.escalation?.adminReviewStatus === "resolved";

  const reviewStatus = resolved
    ? "resolved"
    : issue.escalationAdminReviewStatus ||
      issue.escalation?.adminReviewStatus ||
      "pending";

  return {
    isEscalated,
    reviewStatus,
    resolved,
    isActive: isEscalated && !resolved,
  };
}

/**
 * Scoped SLA Monitoring Data Query for City Admin.
 */
export const getScopedSLAMonitoringData = query({
  args: {
    cityAdminUserId: v.id("users"),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    priority: v.optional(v.string()),
    slaStatus: v.optional(v.string()),
    escalationStatus: v.optional(v.string()),
    assignmentStatus: v.optional(v.string()),
    dateRange: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { city, state } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const now = Date.now();

    // 1. Fetch raw issues in this city using index
    const issuesList = await ctx.db
      .query("issues")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();

    // 2. Fetch escalation resolution action history
    const allActions = await ctx.db
      .query("escalationResolutionActions")
      .collect();
    const actionsByIssue = new Map();
    allActions.forEach((a) => {
      const list = actionsByIssue.get(String(a.issueId)) || [];
      list.push(a);
      actionsByIssue.set(String(a.issueId), list);
    });

    // 3. User mapping
    const userIds = new Set();
    issuesList.forEach((i) => {
      if (i.reportedBy) userIds.add(i.reportedBy);
      if (i.assignedUnitOfficer) userIds.add(i.assignedUnitOfficer);
      if (i.assignedFieldOfficer) userIds.add(i.assignedFieldOfficer);
    });
    const users = await Promise.all(
      Array.from(userIds).map((id) => ctx.db.get(id)),
    );
    const userMap = new Map(
      users.filter(Boolean).map((u) => [String(u._id), u]),
    );

    // 4. Officer profiles for department & workload
    const allUos = await ctx.db
      .query("unitOfficers")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();
    const allFos = await ctx.db
      .query("fieldOfficers")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();

    const uoProfileMapByUserId = new Map(
      allUos.map((p) => [String(p.userId), p]),
    );
    const foProfileMapByUserId = new Map(
      allFos.map((p) => [String(p.userId), p]),
    );

    // 5. Normalise list into standard issue shape
    const normalisedIssues = await Promise.all(
      issuesList.map(async (issue) => {
        const uoUser = userMap.get(String(issue.assignedUnitOfficer));
        const foUser = userMap.get(String(issue.assignedFieldOfficer));
        const uoProfile = uoProfileMapByUserId.get(
          String(issue.assignedUnitOfficer),
        );
        const foProfile = foProfileMapByUserId.get(
          String(issue.assignedFieldOfficer),
        );

        const slaState = calculateIssueSlaState(issue, now);
        const escalationState = getEscalationState(issue);

        const rawActions = actionsByIssue.get(String(issue._id)) || [];
        const enrichedActions = await Promise.all(
          rawActions.map(async (a) => {
            const perf = await ctx.db.get(a.performedBy);
            return {
              id: a._id,
              issueId: a.issueId,
              type: a.actionType,
              performed_by: perf ? perf.fullName : "City Admin",
              performedByRole: "city_admin",
              performed_at: a.performedAt,
              old_value: a.oldValue,
              newValue: a.newValue,
              notes: a.notes,
            };
          }),
        );
        enrichedActions.sort((x, y) => x.performed_at - y.performed_at);

        const subcategoryList = Array.isArray(issue.subcategory)
          ? issue.subcategory
          : issue.subcategory
            ? [issue.subcategory]
            : [];

        const assignedUnitOfficer =
          uoProfile || uoUser
            ? {
                profileId: uoProfile?._id,
                userId: uoUser?._id || uoProfile?.userId,
                name: uoProfile?.fullName || uoUser?.fullName || "Unit Officer",
                department: uoProfile?.department || issue.category,
              }
            : null;

        const assignedFieldOfficer =
          foProfile || foUser
            ? {
                profileId: foProfile?._id,
                userId: foUser?._id || foProfile?.userId,
                name:
                  foProfile?.fullName || foUser?.fullName || "Field Officer",
                department: foProfile?.department || issue.category,
              }
            : null;

        const isEscalated = escalationState.isEscalated;
        const escCategory =
          issue.escalationCategory ||
          issue.escalation?.category ||
          issue.category;
        const escPriority =
          issue.escalationPriority ||
          issue.escalation?.priority ||
          issue.priority;
        const escReason =
          issue.escalationReason || issue.escalation?.reason || "";
        const escComments =
          issue.escalationComments || issue.escalation?.comments || "";
        const escAt =
          issue.escalatedAt ||
          issue.escalation?.escalatedAt ||
          issue._creationTime;
        const escBy = issue.escalatedBy || issue.escalation?.escalatedBy;
        const escReviewedAt =
          issue.escalationReviewedAt || issue.escalation?.reviewedAt;
        const escReviewedBy =
          issue.escalationReviewedBy || issue.escalation?.reviewedBy;
        const escResolved =
          issue.escalationResolved || issue.escalation?.resolved || false;
        const escResolvedAt =
          issue.escalationResolvedAt || issue.escalation?.resolvedAt;
        const escResolutionNotes =
          issue.escalationResolutionNotes ||
          issue.escalation?.resolutionNote ||
          "";
        const escCount =
          issue.escalationCount ||
          issue.escalation?.escalationCount ||
          (isEscalated ? 1 : 0);

        return {
          id: issue._id,
          code: issue.issueCode,
          ticket_id: issue.issueCode,
          title: issue.title,
          description: issue.description,
          category: issue.category,
          subcategory: subcategoryList,
          department: issue.department || issue.category,
          status: issue.status,
          priority: issue.priority,
          severity: issue.priority,
          address: issue.address,
          city: issue.city,
          state: issue.state,
          createdAt: issue.createdAt ?? issue._creationTime,
          updatedAt: issue.updatedAt,

          assignedUnitOfficer,
          assignedFieldOfficer,
          assigned_officer: assignedUnitOfficer,
          field_officer: assignedFieldOfficer,

          sla: {
            originalDeadline: issue.originalSlaDeadline || issue.slaDeadline,
            deadline: issue.slaDeadline,
            status: slaState.status,
            hoursRemaining: slaState.hoursRemaining,
            overdueHours: slaState.overdueHours,
            extensionCount:
              issue.slaExtensionCount ?? issue.slaExtendedCount ?? 0,
            extensionHistory: issue.slaExtensionHistory ?? [],
          },
          sla_deadline: issue.slaDeadline,
          sla_status: slaState.status,
          hours_remaining: slaState.hoursRemaining,
          overdue_hours: slaState.overdueHours,

          escalation: {
            isEscalated,
            status: escalationState.reviewStatus,
            category: escCategory,
            priority: escPriority,
            reason: escReason,
            comments: escComments,
            escalatedAt: escAt,
            escalatedBy: escBy,
            reviewedAt: escReviewedAt,
            reviewedBy: escReviewedBy,
            resolved: escResolved,
            resolvedAt: escResolvedAt,
            resolutionNotes: escResolutionNotes,
            resolutionActions: enrichedActions,
            count: escCount,
          },
          is_escalated: isEscalated,
          escalation_category: escCategory,
          escalation_priority: escPriority,
          escalation_reason: escReason,
          escalation_comments: escComments,
          escalated_at: escAt,
          escalation_admin_review_status: escalationState.reviewStatus,
          escalation_resolved: escResolved,
          escalation_resolved_at: escResolvedAt,
          escalation_resolution_notes: escResolutionNotes,
          escalation_resolution_actions: enrichedActions,
          escalation_count: escCount,
        };
      }),
    );

    // 6. Calculate summary metrics across full city dataset
    // City-wide KPI cards are calculated from all eligible city-scoped issues and do not change with pagination.
    const scopedIssues = normalisedIssues;
    const activeIssues = scopedIssues.filter(isActiveIssue);

    const classifiedActiveIssues = activeIssues.map((issue) => ({
      issue,
      slaState: calculateIssueSlaState(issue, now),
    }));

    const breachedCount = classifiedActiveIssues.filter(
      ({ slaState }) => slaState.status === "breached",
    ).length;

    const dueSoonCount = classifiedActiveIssues.filter(
      ({ slaState }) => slaState.status === "due_soon",
    ).length;

    const atRiskCount = classifiedActiveIssues.filter(
      ({ slaState }) => slaState.status === "at_risk",
    ).length;

    const onTrackCount = classifiedActiveIssues.filter(
      ({ slaState }) => slaState.status === "on_track",
    ).length;

    const noDeadlineCount = classifiedActiveIssues.filter(
      ({ slaState }) => slaState.status === "no_deadline",
    ).length;

    const monitoredIssueCount = classifiedActiveIssues.filter(
      ({ slaState }) => slaState.status !== "no_deadline",
    ).length;

    const compliantActiveCount = onTrackCount + atRiskCount + dueSoonCount;

    const complianceRate =
      monitoredIssueCount > 0
        ? Math.round((compliantActiveCount / monitoredIssueCount) * 100)
        : 0;

    const activeEscalatedIssues = scopedIssues.filter((issue) => {
      const state = getEscalationState(issue);
      return state.isActive;
    });

    const escalatedCount = activeEscalatedIssues.length;

    const pendingReviewCount = activeEscalatedIssues.filter((issue) => {
      const state = getEscalationState(issue);
      return state.reviewStatus === "pending";
    }).length;

    const reviewedEscalationCount = activeEscalatedIssues.filter((issue) => {
      const state = getEscalationState(issue);
      return state.reviewStatus === "reviewed";
    }).length;

    const resolvedEscalationCount = scopedIssues.filter((issue) => {
      const state = getEscalationState(issue);
      return state.resolved;
    }).length;

    const criticalEscalations = activeEscalatedIssues.filter(
      (i) => i.priority === "critical",
    ).length;

    const unassignedIssues = activeIssues.filter(
      (i) => !i.assignedUnitOfficer && !i.assignedFieldOfficer,
    ).length;

    const resolvedIssues = normalisedIssues.filter(
      (i) => TERMINAL_ISSUE_STATUSES.has(i.status) && i.sla.deadline,
    );
    const totalResolutionMs = resolvedIssues.reduce(
      (sum, i) => sum + Math.max(0, (i.updatedAt || now) - i.createdAt),
      0,
    );
    const averageResolutionHours =
      resolvedIssues.length > 0
        ? Math.round(
            totalResolutionMs / (1000 * 60 * 60) / resolvedIssues.length,
          )
        : 0;

    const reviewedEscalationItems = normalisedIssues.filter(
      (i) => i.escalation.reviewedAt && i.escalation.escalatedAt,
    );
    const totalAckMs = reviewedEscalationItems.reduce(
      (sum, i) =>
        sum + Math.max(0, i.escalation.reviewedAt - i.escalation.escalatedAt),
      0,
    );
    const averageAcknowledgementHours =
      reviewedEscalationItems.length > 0
        ? Math.round(
            totalAckMs / (1000 * 60 * 60) / reviewedEscalationItems.length,
          )
        : 0;

    // 7. Escalation Analytics
    const categoryCounts = {};
    const deptCounts = {};
    const priorityCounts = {};
    normalisedIssues.forEach((i) => {
      if (i.escalation.isEscalated) {
        const cat = i.escalation.category || i.category || "other";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

        const dept = i.department || i.category || "other";
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;

        const prio = i.priority || "medium";
        priorityCounts[prio] = (priorityCounts[prio] || 0) + 1;
      }
    });

    const byCategory = Object.entries(categoryCounts).map(
      ([category, count]) => ({
        category,
        count,
      }),
    );
    const byDepartment = Object.entries(deptCounts).map(
      ([department, count]) => ({
        department,
        count,
      }),
    );
    const byPriority = Object.entries(priorityCounts).map(
      ([priority, count]) => ({
        priority,
        count,
      }),
    );

    const monitoredIssuesList = normalisedIssues.filter(
      (i) => !TERMINAL_ISSUE_STATUSES.has(i.status),
    );

    const mostDelayed = monitoredIssuesList
      .filter((i) => i.sla.status === "breached")
      .sort((a, b) => (b.sla.overdueHours || 0) - (a.sla.overdueHours || 0))
      .slice(0, 5);

    const unresolvedCritical = monitoredIssuesList
      .filter(
        (i) =>
          i.priority === "critical" &&
          (i.sla.status === "breached" ||
            i.sla.status === "due_soon" ||
            i.escalation.isEscalated),
      )
      .slice(0, 5);

    const repeatedEscalations = monitoredIssuesList
      .filter((i) => (i.escalation.count || 0) > 1)
      .slice(0, 5);

    // 8. Apply Filtering
    let filtered = normalisedIssues;

    if (args.search) {
      const q = args.search.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.code.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          (i.description || "").toLowerCase().includes(q) ||
          (i.address || "").toLowerCase().includes(q) ||
          (i.department || "").toLowerCase().includes(q) ||
          (i.assignedUnitOfficer?.name || "").toLowerCase().includes(q) ||
          (i.assignedFieldOfficer?.name || "").toLowerCase().includes(q) ||
          (i.escalation?.reason || "").toLowerCase().includes(q),
      );
    }

    if (args.status && args.status !== "all") {
      filtered = filtered.filter((i) => i.status === args.status);
    }

    if (args.category && args.category !== "all") {
      filtered = filtered.filter((i) => i.category === args.category);
    }

    if (args.priority && args.priority !== "all") {
      filtered = filtered.filter((i) => i.priority === args.priority);
    }

    if (args.slaStatus && args.slaStatus !== "all") {
      filtered = filtered.filter((i) => i.sla.status === args.slaStatus);
    }

    if (args.escalationStatus && args.escalationStatus !== "all") {
      filtered = filtered.filter((i) => {
        if (args.escalationStatus === "escalated")
          return i.escalation.isEscalated;
        if (args.escalationStatus === "pending")
          return i.escalation.isEscalated && i.escalation.status === "pending";
        if (args.escalationStatus === "reviewed")
          return i.escalation.isEscalated && i.escalation.status === "reviewed";
        if (args.escalationStatus === "resolved") return i.escalation.resolved;
        return true;
      });
    }

    if (args.assignmentStatus && args.assignmentStatus !== "all") {
      filtered = filtered.filter((i) => {
        if (args.assignmentStatus === "fully_assigned")
          return Boolean(i.assignedUnitOfficer && i.assignedFieldOfficer);
        if (args.assignmentStatus === "partially_assigned")
          return Boolean(
            (i.assignedUnitOfficer && !i.assignedFieldOfficer) ||
              (!i.assignedUnitOfficer && i.assignedFieldOfficer),
          );
        if (args.assignmentStatus === "unassigned")
          return !i.assignedUnitOfficer && !i.assignedFieldOfficer;
        return true;
      });
    }

    if (args.dateRange && args.dateRange !== "all") {
      const periodMs =
        args.dateRange === "24h"
          ? 24 * 60 * 60 * 1000
          : args.dateRange === "7d"
            ? 7 * 24 * 60 * 60 * 1000
            : args.dateRange === "30d"
              ? 30 * 24 * 60 * 60 * 1000
              : 0;
      if (periodMs > 0) {
        filtered = filtered.filter((i) => i.createdAt >= now - periodMs);
      }
    }

    // 9. Sorting
    const sortBy = args.sortBy || "newest";
    filtered.sort((a, b) => {
      if (sortBy === "oldest") {
        return a.createdAt - b.createdAt;
      }
      if (sortBy === "sla_urgency") {
        const deadlineA = a.sla.deadline || Infinity;
        const deadlineB = b.sla.deadline || Infinity;
        return deadlineA - deadlineB;
      }
      if (sortBy === "escalated_at") {
        return (
          (b.escalation.escalatedAt || 0) - (a.escalation.escalatedAt || 0)
        );
      }
      if (sortBy === "updated") {
        return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
      }
      return b.createdAt - a.createdAt;
    });

    // 10. Pagination
    const page = args.page || 1;
    const pageSize = args.pageSize || 10;
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const cityInfo = {
      city,
      state,
    };

    const metrics = {
      totalIssues: scopedIssues.length,
      activeIssues: activeIssues.length,
      monitoredIssues: monitoredIssueCount,

      complianceRate,

      breachedCount,
      atRiskCount,
      dueSoonCount,
      onTrackCount,
      noDeadlineCount,

      escalatedCount,
      pendingReviewCount,
      reviewedEscalationCount,
      resolvedEscalationCount,

      slaStatusDistribution: {
        breached: breachedCount,
        at_risk: atRiskCount,
        due_soon: dueSoonCount,
        on_track: onTrackCount,
        no_deadline: noDeadlineCount,
      },
    };

    const summary = {
      ...metrics,
      breached: breachedCount,
      atRisk: atRiskCount,
      dueSoon: dueSoonCount,
      onTrack: onTrackCount,
      noDeadline: noDeadlineCount,

      escalated: escalatedCount,
      pendingAdminReview: pendingReviewCount,

      reviewedEscalations: reviewedEscalationCount,
      resolvedEscalations: resolvedEscalationCount,

      criticalEscalations,
      unassignedIssues,
      averageResolutionHours,
      averageAcknowledgementHours,

      slaStatusDistribution: {
        breached: breachedCount,
        at_risk: atRiskCount,
        due_soon: dueSoonCount,
        on_track: onTrackCount,
        no_deadline: noDeadlineCount,
      },
    };

    return {
      cityInfo,
      scope: {
        mode: "city",
        city,
        state,
      },
      metrics,
      summary,
      issues: paginated,
      escalationAnalytics: {
        byCategory,
        byDepartment,
        byPriority,
        mostDelayed,
        unresolvedCritical,
        repeatedEscalations,
      },
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  },
});

/**
 * Acknowledge Escalation Mutation (Formally marks escalation as reviewed by City Admin)
 */
export const reviewEscalation = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized for this city");
    }

    const now = Date.now();

    await ctx.db.patch(args.issueId, {
      escalationAdminReviewStatus: "reviewed",
      escalationReviewedAt: now,
      escalationReviewedBy: args.cityAdminUserId,
      escalation: {
        ...(issue.escalation || {}),
        adminReviewStatus: "reviewed",
        reviewedAt: now,
        reviewedBy: args.cityAdminUserId,
      },
      updatedAt: now,
    });

    await ctx.db.insert("escalationResolutionActions", {
      issueId: args.issueId,
      actionType: "review_escalation",
      performedBy: args.cityAdminUserId,
      performedAt: now,
      notes: "Escalation formally acknowledged and under review by City Admin.",
    });

    await ctx.db.insert("issueUpdates", {
      issueId: args.issueId,
      status: issue.status,
      comment: "Escalation review formally initiated by City Admin.",
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer_and_citizen",
      createdAt: now,
    });

    await ctx.db.insert("cityAdminAuditLogs", {
      action: "Escalation Acknowledged",
      performedByUserId: args.cityAdminUserId,
      performerRole: "city_admin",
      city,
      affectedEntityType: "issue_escalation",
      affectedEntityId: issue._id,
      issueCode: issue.issueCode,
      oldValue: "pending",
      newValue: "reviewed",
      reason: "Formally acknowledged escalation",
      timestamp: now,
    });

    const notifyUsers = [
      issue.assignedUnitOfficer,
      issue.assignedFieldOfficer,
    ].filter(Boolean);
    for (const userId of notifyUsers) {
      await ctx.db.insert("notifications", {
        userId,
        issueId: args.issueId,
        title: "Escalation Acknowledged",
        message: `The escalation for issue ${issue.issueCode} was formally acknowledged by City Admin.`,
        type: "assigned",
        read: false,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Request Corrective Action Mutation
 * Sends corrective instructions to the currently assigned Unit Officer and Field Officer.
 * Communication-only action: does not patch issue/escalation status, does not create an escalation resolution action,
 * and does not send citizen/public notifications.
 */
export const requestCorrectiveAction = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
    actionRequest: v.string(),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized for this city");
    }

    const actionRequest = args.actionRequest.trim();
    if (!actionRequest) {
      throw new Error("Corrective action instructions are required.");
    }

    const officerRecipientIds = [
      issue.assignedUnitOfficer,
      issue.assignedFieldOfficer,
    ].filter(Boolean);

    const uniqueOfficerRecipientIds = officerRecipientIds.filter(
      (id, index, array) =>
        array.findIndex((candidate) => String(candidate) === String(id)) ===
        index,
    );

    if (uniqueOfficerRecipientIds.length === 0) {
      throw new Error(
        "No assigned officers are available to receive the corrective action request.",
      );
    }

    const now = Date.now();

    await ctx.db.insert("issueUpdates", {
      issueId: args.issueId,
      status: issue.status,
      comment: `Corrective action requested by City Admin: ${actionRequest}`,
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer",
      createdAt: now,
    });

    for (const officerUserId of uniqueOfficerRecipientIds) {
      await ctx.db.insert("notifications", {
        userId: String(officerUserId),
        issueId: args.issueId,
        title: `Corrective Action Required - ${issue.issueCode || issue.title}`,
        message: actionRequest,
        type: "corrective_action_requested",
        read: false,
        createdAt: now,
      });
    }

    return {
      success: true,
      notifiedOfficerCount: uniqueOfficerRecipientIds.length,
    };
  },
});

/**
 * Approve Escalation Resolution Mutation
 * Resolves the administrative escalation. The civic issue retains its current operational status.
 */
export const approveEscalation = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized for this city");
    }

    const now = Date.now();

    await ctx.db.patch(args.issueId, {
      escalatedToAdmin: false,
      escalationResolved: true,
      escalationResolvedAt: now,
      escalationResolutionNotes: args.notes,
      escalationAdminReviewStatus: "resolved",
      escalation: {
        ...(issue.escalation || {}),
        resolved: true,
        resolvedAt: now,
        resolutionNote: args.notes,
        adminReviewStatus: "resolved",
      },
      updatedAt: now,
    });

    await ctx.db.insert("escalationResolutionActions", {
      issueId: args.issueId,
      actionType: "approve_escalation",
      performedBy: args.cityAdminUserId,
      performedAt: now,
      notes: args.notes,
    });

    await ctx.db.insert("issueUpdates", {
      issueId: args.issueId,
      status: issue.status,
      comment: `Escalation approved and resolved by City Admin. Note: ${args.notes}`,
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer_and_citizen",
      createdAt: now,
    });

    await ctx.db.insert("cityAdminAuditLogs", {
      action: "Escalation Resolution Approved",
      performedByUserId: args.cityAdminUserId,
      performerRole: "city_admin",
      city,
      affectedEntityType: "issue_escalation",
      affectedEntityId: issue._id,
      issueCode: issue.issueCode,
      oldValue: "reviewed",
      newValue: "resolved",
      reason: args.notes,
      timestamp: now,
    });

    const notifyUsers = [
      issue.assignedUnitOfficer,
      issue.assignedFieldOfficer,
    ].filter(Boolean);
    for (const userId of notifyUsers) {
      await ctx.db.insert("notifications", {
        userId,
        issueId: args.issueId,
        title: "Escalation Resolved",
        message: `Administrative escalation for issue ${issue.issueCode} has been resolved by City Admin.`,
        type: "assigned",
        read: false,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Dismiss Escalation Mutation
 * Closes the escalation while preserving the civic issue status.
 */
export const dismissEscalation = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized for this city");
    }

    const now = Date.now();

    await ctx.db.patch(args.issueId, {
      escalatedToAdmin: false,
      escalationResolved: true,
      escalationResolvedAt: now,
      escalationResolutionNotes: `Escalation dismissed: ${args.reason}`,
      escalationAdminReviewStatus: "dismissed",
      escalation: {
        ...(issue.escalation || {}),
        resolved: true,
        resolvedAt: now,
        resolutionNote: `Escalation dismissed: ${args.reason}`,
        adminReviewStatus: "dismissed",
      },
      updatedAt: now,
    });

    await ctx.db.insert("escalationResolutionActions", {
      issueId: args.issueId,
      actionType: "dismiss_escalation",
      performedBy: args.cityAdminUserId,
      performedAt: now,
      notes: `Escalation dismissed. Reason: ${args.reason}`,
    });

    await ctx.db.insert("issueUpdates", {
      issueId: args.issueId,
      status: issue.status,
      comment: `Administrative escalation dismissed. Reason: ${args.reason}`,
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer_and_citizen",
      createdAt: now,
    });

    await ctx.db.insert("cityAdminAuditLogs", {
      action: "Escalation Dismissed",
      performedByUserId: args.cityAdminUserId,
      performerRole: "city_admin",
      city,
      affectedEntityType: "issue_escalation",
      affectedEntityId: issue._id,
      issueCode: issue.issueCode,
      oldValue: "pending",
      newValue: "dismissed",
      reason: args.reason,
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Reject Escalation Response Mutation
 * Formally rejects an officer's submitted corrective response as insufficient.
 * Keeps the escalation open and sets review status back to action_required.
 */
export const rejectEscalationResponse = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized for this city");
    }

    const now = Date.now();

    await ctx.db.patch(args.issueId, {
      escalatedToAdmin: true,
      escalationResolved: false,
      escalationAdminReviewStatus: "action_required",
      escalation: {
        ...(issue.escalation || {}),
        resolved: false,
        adminReviewStatus: "action_required",
        lastRejectionReason: args.reason,
      },
      updatedAt: now,
    });

    await ctx.db.insert("escalationResolutionActions", {
      issueId: args.issueId,
      actionType: "reject_escalation_response",
      performedBy: args.cityAdminUserId,
      performedAt: now,
      notes: `Escalation response rejected as insufficient. Reason: ${args.reason}`,
    });

    await ctx.db.insert("issueUpdates", {
      issueId: args.issueId,
      status: issue.status,
      comment: `Escalation response rejected by City Admin. Reason: ${args.reason}`,
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer_and_citizen",
      createdAt: now,
    });

    await ctx.db.insert("cityAdminAuditLogs", {
      action: "Escalation Response Rejected",
      performedByUserId: args.cityAdminUserId,
      performerRole: "city_admin",
      city,
      affectedEntityType: "issue_escalation",
      affectedEntityId: issue._id,
      issueCode: issue.issueCode,
      oldValue: "response_submitted",
      newValue: "action_required",
      reason: args.reason,
      timestamp: now,
    });

    const notifyUsers = [
      issue.assignedUnitOfficer,
      issue.assignedFieldOfficer,
    ].filter(Boolean);
    for (const userId of notifyUsers) {
      await ctx.db.insert("notifications", {
        userId,
        issueId: args.issueId,
        title: "Escalation Response Rejected",
        message: `City Admin rejected your escalation response for issue ${issue.issueCode}: "${args.reason}".`,
        type: "assigned",
        read: false,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Bulk Acknowledge Escalations Mutation exclusively for City Admin
 */
export const bulkAcknowledgeEscalations = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueIds: v.array(v.id("issues")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const now = Date.now();
    const successfulIssueIds = [];
    const skippedIssues = [];

    for (const issueId of args.issueIds) {
      const issue = await ctx.db.get(issueId);
      if (!issue) {
        skippedIssues.push({ issueId, reason: "Issue not found" });
        continue;
      }
      if (issue.city !== city) {
        skippedIssues.push({ issueId, reason: "Unauthorized" });
        continue;
      }

      const escalationState = getEscalationState(issue);
      if (!escalationState.isEscalated) {
        skippedIssues.push({ issueId, reason: "No active escalation" });
        continue;
      }

      if (
        issue.escalationResolved ||
        escalationState.reviewStatus === "resolved" ||
        escalationState.reviewStatus === "dismissed"
      ) {
        skippedIssues.push({ issueId, reason: "Escalation already closed" });
        continue;
      }

      await ctx.db.patch(issue._id, {
        escalationAdminReviewStatus: "reviewed",
        escalationReviewedAt: now,
        escalationReviewedBy: args.cityAdminUserId,
        escalation: {
          ...(issue.escalation || {}),
          adminReviewStatus: "reviewed",
          reviewedAt: now,
          reviewedBy: args.cityAdminUserId,
        },
        updatedAt: now,
      });

      await ctx.db.insert("escalationResolutionActions", {
        issueId: issue._id,
        actionType: "review_escalation",
        performedBy: args.cityAdminUserId,
        performedAt: now,
        notes: args.note || "Escalation acknowledged in bulk by City Admin.",
      });

      await ctx.db.insert("issueUpdates", {
        issueId: issue._id,
        status: issue.status,
        comment: `Escalation acknowledged in bulk by City Admin.\nNote: ${args.note || "Under review"}`,
        updatedBy: args.cityAdminUserId,
        role: "city_admin",
        attachments: [],
        scope: "officer_and_citizen",
        createdAt: now,
      });

      await ctx.db.insert("cityAdminAuditLogs", {
        action: "Escalation Acknowledged",
        performedByUserId: args.cityAdminUserId,
        performerRole: "city_admin",
        city,
        affectedEntityType: "issue_escalation",
        affectedEntityId: issue._id,
        issueCode: issue.issueCode,
        oldValue: "pending",
        newValue: "reviewed",
        reason: args.note || "Bulk Acknowledgement",
        timestamp: now,
      });

      successfulIssueIds.push(issueId);
    }

    return {
      successfulIssueIds,
      skippedIssues,
    };
  },
});
