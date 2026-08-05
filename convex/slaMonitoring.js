import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to require City Admin authentication and profile
async function requireCityAdmin(ctx, userId) {
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "city_admin") {
    throw new Error("City Admin access required");
  }

  const profile = await ctx.db
    .query("cityAdmins")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  if (!profile) {
    throw new Error("City Admin profile not found");
  }

  return {
    user,
    profile,
    city: profile.city,
    state: profile.state,
  };
}

// Scoped SLA Monitoring Data Query for City Admin
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
    dateRange: v.optional(
      v.union(
        v.literal("today"),
        v.literal("7d"),
        v.literal("30d"),
        v.literal("all"),
      ),
    ),
    sortBy: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { city, state } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const now = Date.now();

    // Fetch raw issues in this city
    const issuesList = await ctx.db
      .query("issues")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();

    // Joins & Enrichment
    // 1. Gather all action logs for the issues
    const allActions = await ctx.db
      .query("escalationResolutionActions")
      .collect();
    const actionsByIssue = new Map();
    allActions.forEach((a) => {
      const list = actionsByIssue.get(String(a.issueId)) || [];
      list.push(a);
      actionsByIssue.set(String(a.issueId), list);
    });

    // 2. Fetch users to map names
    const allUserIds = new Set();
    issuesList.forEach((i) => {
      if (i.reportedBy) allUserIds.add(i.reportedBy);
      if (i.assignedUnitOfficer) allUserIds.add(i.assignedUnitOfficer);
      if (i.assignedFieldOfficer) allUserIds.add(i.assignedFieldOfficer);
    });
    const users = await Promise.all(
      Array.from(allUserIds).map((id) => ctx.db.get(id)),
    );
    const userMap = new Map(
      users.filter(Boolean).map((u) => [String(u._id), u]),
    );

    // 3. Fetch officer profiles to check workloads/profileIds
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

    // Normalise list
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

        // Resolve SLA Status
        let calculatedSlaStatus = "no_deadline";
        let hoursRemaining = null;
        let overdueHours = null;

        if (issue.slaDeadline) {
          if (issue.status === "resolved" || issue.status === "closed") {
            calculatedSlaStatus =
              (issue.resolvedAt ?? issue.closedAt ?? now) <= issue.slaDeadline
                ? "resolved_on_time"
                : "breached";
          } else {
            if (now > issue.slaDeadline) {
              calculatedSlaStatus = "breached";
              overdueHours = Math.round(
                (now - issue.slaDeadline) / (1000 * 60 * 60),
              );
            } else {
              hoursRemaining = Math.round(
                (issue.slaDeadline - now) / (1000 * 60 * 60),
              );
              calculatedSlaStatus =
                hoursRemaining <= 24 ? "due_soon" : "on_track";
            }
          }
        }

        const isEscalated = issue.escalatedToAdmin || false;

        // Resolve action logs
        const actions = actionsByIssue.get(String(issue._id)) || [];
        const enrichedActions = await Promise.all(
          actions.map(async (a) => {
            const perf = await ctx.db.get(a.performedBy);
            return {
              id: a._id,
              issueId: a.issueId,
              type: a.actionType,
              performed_by: perf ? perf.fullName : "Administrator",
              performed_at: a.performedAt,
              old_value: a.oldValue,
              newValue: a.newValue,
              notes: a.notes,
            };
          }),
        );
        enrichedActions.sort((x, y) => x.performed_at - y.performed_at);

        return {
          id: issue._id,
          ticket_id: issue.issueCode,
          title: issue.title,
          description: issue.description,
          category: issue.category,
          status: issue.status,
          severity: issue.priority,
          location: issue.address,
          city: issue.city,
          state: issue.state,

          sla_deadline: issue.slaDeadline,
          original_sla_deadline: issue.originalSlaDeadline || issue.slaDeadline,
          sla_status: calculatedSlaStatus,
          hours_remaining: hoursRemaining,
          overdue_hours: overdueHours,

          assigned_officer: uoUser
            ? {
                id: uoProfile?._id,
                userId: uoUser._id,
                name: uoUser.fullName,
              }
            : null,

          field_officer: foUser
            ? {
                id: foProfile?._id,
                userId: foUser._id,
                name: foUser.fullName,
              }
            : null,

          is_escalated: isEscalated,
          escalated_at: issue.escalation?.escalatedAt,
          escalation_category: issue.escalation?.category,
          escalation_priority: issue.escalation?.priority,
          escalation_reason: issue.escalation?.reason,
          escalation_comments: issue.escalation?.comments,
          escalation_admin_review_status:
            issue.escalation?.adminReviewStatus || "pending",
          escalation_resolved: issue.escalation?.resolved || false,
          escalation_resolved_at: issue.escalation?.resolvedAt,
          escalation_resolution_notes: issue.escalation?.resolutionNote,
          escalation_count: issue.escalation?.escalationCount || 0,
          escalation_resolution_actions: enrichedActions,
          sla_extended_count: issue.slaExtendedCount || 0,
        };
      }),
    );

    // Calculate Summary Metrics
    const totalIssues = normalisedIssues.length;
    const monitoredIssuesList = normalisedIssues.filter(
      (i) =>
        i.status !== "resolved" &&
        i.status !== "closed" &&
        i.status !== "rejected" &&
        i.status !== "withdrawn",
    );
    const monitoredIssues = monitoredIssuesList.length;
    const breached = monitoredIssuesList.filter(
      (i) => i.sla_status === "breached",
    ).length;
    const atRisk = monitoredIssuesList.filter(
      (i) => i.sla_status === "at_risk",
    ).length;
    const dueSoon = monitoredIssuesList.filter(
      (i) => i.sla_status === "due_soon",
    ).length;
    const onTrack = monitoredIssuesList.filter(
      (i) => i.sla_status === "on_track",
    ).length;
    const noDeadline = monitoredIssuesList.filter(
      (i) => i.sla_status === "no_deadline",
    ).length;
    const escalated = monitoredIssuesList.filter((i) => i.is_escalated).length;
    const pendingAdminReview = monitoredIssuesList.filter(
      (i) => i.is_escalated && i.escalation_admin_review_status === "pending",
    ).length;
    const resolvedEscalations = normalisedIssues.filter(
      (i) => i.is_escalated && i.escalation_resolved,
    ).length;

    // SLA compliance rate
    let totalResolvedWithSla = 0;
    let resolvedOnTime = 0;
    normalisedIssues.forEach((i) => {
      if (
        (i.status === "resolved" || i.status === "closed") &&
        i.sla_deadline
      ) {
        totalResolvedWithSla++;
        if (i.sla_status === "resolved_on_time") {
          resolvedOnTime++;
        }
      }
    });
    const complianceRate =
      totalResolvedWithSla > 0
        ? Math.round((resolvedOnTime / totalResolvedWithSla) * 100)
        : 100;

    // Average resolution time for resolved issues
    const resolvedIssues = normalisedIssues.filter(
      (i) =>
        (i.status === "resolved" || i.status === "closed") && i.sla_deadline,
    );
    const totalResolutionMs = resolvedIssues.reduce(
      (sum, i) =>
        sum +
        ((i.escalation_resolved_at || now) -
          (i.escalated_at || i.sla_deadline)),
      0,
    );
    const averageResolutionHours =
      resolvedIssues.length > 0
        ? Math.round(
            totalResolutionMs / (1000 * 60 * 60) / resolvedIssues.length,
          )
        : 0;

    // Build Analytics
    const categoryCounts = {};
    const deptCounts = {};
    normalisedIssues.forEach((i) => {
      if (i.is_escalated) {
        categoryCounts[i.escalation_category || "other"] =
          (categoryCounts[i.escalation_category || "other"] || 0) + 1;
        deptCounts[i.category || "Other"] =
          (deptCounts[i.category || "Other"] || 0) + 1;
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

    const mostDelayed = monitoredIssuesList
      .filter((i) => i.sla_status === "breached")
      .sort((a, b) => (b.overdue_hours || 0) - (a.overdue_hours || 0))
      .slice(0, 5);

    const unresolvedCritical = monitoredIssuesList
      .filter(
        (i) =>
          i.severity === "critical" &&
          (i.sla_status === "breached" || i.sla_status === "due_soon"),
      )
      .slice(0, 5);

    // Apply Filter logic on UI list
    let filtered = normalisedIssues;

    if (args.search) {
      const q = args.search.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.ticket_id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          (i.description || "").toLowerCase().includes(q) ||
          (i.location || "").toLowerCase().includes(q) ||
          (i.escalation_reason || "").toLowerCase().includes(q),
      );
    }

    if (args.status && args.status !== "all") {
      filtered = filtered.filter((i) => i.status === args.status);
    }
    if (args.category && args.category !== "all") {
      filtered = filtered.filter((i) => i.category === args.category);
    }
    if (args.priority && args.priority !== "all") {
      filtered = filtered.filter((i) => i.severity === args.priority);
    }
    if (args.slaStatus && args.slaStatus !== "all") {
      filtered = filtered.filter((i) => i.sla_status === args.slaStatus);
    }
    if (args.escalationStatus && args.escalationStatus !== "all") {
      filtered = filtered.filter((i) => {
        if (args.escalationStatus === "escalated") return i.is_escalated;
        if (args.escalationStatus === "pending")
          return (
            i.is_escalated && i.escalation_admin_review_status === "pending"
          );
        if (args.escalationStatus === "resolved") return i.escalation_resolved;
        return true;
      });
    }
    if (args.assignmentStatus && args.assignmentStatus !== "all") {
      filtered = filtered.filter((i) => {
        if (args.assignmentStatus === "fully_assigned")
          return i.assigned_officer && i.field_officer;
        if (args.assignmentStatus === "unassigned")
          return !i.assigned_officer && !i.field_officer;
        return true;
      });
    }

    // Sort
    const sortBy = args.sortBy || "deadline";
    filtered.sort((a, b) => {
      if (sortBy === "deadline") {
        return (a.sla_deadline || Infinity) - (b.sla_deadline || Infinity);
      }
      if (sortBy === "severity") {
        const weights = { critical: 4, high: 3, medium: 2, low: 1 };
        return (weights[b.severity] || 0) - (weights[a.severity] || 0);
      }
      return (b.escalated_at || 0) - (a.escalated_at || 0);
    });

    // Pagination
    const page = args.page || 1;
    const pageSize = args.pageSize || 10;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      scope: {
        mode: "city",
        city,
        state,
      },
      summary: {
        totalIssues,
        monitoredIssues,
        breached,
        atRisk,
        dueSoon,
        onTrack,
        noDeadline,
        escalated,
        pendingAdminReview,
        resolvedEscalations,
        averageResolutionHours,
        complianceRate,
      },
      issues: paginated,
      escalationAnalytics: {
        byCategory,
        byDepartment,
        mostDelayed,
        unresolvedCritical,
      },
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  },
});

// Scope-Aware Assignable Candidate Query
export const getScopedAssignableOfficers = query({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized");
    }

    // Fetch unit officers & field officers in this city
    const uos = await ctx.db
      .query("unitOfficers")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();
    const fos = await ctx.db
      .query("fieldOfficers")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();

    const uoUserIds = uos.map((o) => o.userId);
    const foUserIds = fos.map((o) => o.userId);

    const allUsers = await Promise.all(
      [...uoUserIds, ...foUserIds].map((id) => ctx.db.get(id)),
    );
    const userMap = new Map(
      allUsers.filter(Boolean).map((u) => [String(u._id), u]),
    );

    const mappedUos = uos
      .filter((o) => o.accountApproved !== false)
      .map((o) => {
        const u = userMap.get(String(o.userId));
        const currentWorkload = (o.activeIssueIds || []).length;
        const maximumCapacity = 50;
        const availableCapacity = Math.max(
          0,
          maximumCapacity - currentWorkload,
        );
        const compatibilityWarnings = [];

        if (o.department !== issue.category) {
          compatibilityWarnings.push("Department mismatch");
        }

        const isRecommended =
          o.department === issue.category && currentWorkload < maximumCapacity;

        return {
          profileId: o._id,
          userId: o.userId,
          fullName: o.fullName || u?.fullName || "Unit Officer",
          email: o.email || u?.email || "",
          city: o.city,
          department: o.department,
          currentWorkload,
          maximumCapacity,
          availableCapacity,
          overdueIssueCount: 0,
          performanceScore: o.efficiencyScore || 85,
          isRecommended,
          recommendationReason: isRecommended
            ? "Matches category and has workload capacity"
            : "Available candidate",
          compatibilityWarnings,
        };
      });

    const mappedFos = fos
      .filter((o) => o.accountApproved !== false)
      .map((o) => {
        const u = userMap.get(String(o.userId));
        const currentWorkload = o.currentActiveIssues || 0;
        const maximumCapacity = o.maxIssueCapacity || 10;
        const availableCapacity = Math.max(
          0,
          maximumCapacity - currentWorkload,
        );
        const compatibilityWarnings = [];

        if (o.department !== issue.category) {
          compatibilityWarnings.push("Department mismatch");
        }

        const isRecommended =
          o.department === issue.category && currentWorkload < maximumCapacity;

        return {
          profileId: o._id,
          userId: o.userId,
          fullName: o.fullName || u?.fullName || "Field Officer",
          email: o.email || u?.email || "",
          city: o.city,
          department: o.department,
          currentWorkload,
          maximumCapacity,
          availableCapacity,
          overdueIssueCount: 0,
          performanceScore: o.efficiencyScore || 85,
          isRecommended,
          recommendationReason: isRecommended
            ? "Matches category and has workload capacity"
            : "Available candidate",
          compatibilityWarnings,
        };
      });

    return {
      unitOfficers: mappedUos,
      fieldOfficers: mappedFos,
    };
  },
});

// Scoped SLA Deadlines extension mutation
export const extendIssueSla = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
    newDeadline: v.number(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized");
    }

    const now = Date.now();
    const oldDeadlineStr = issue.slaDeadline
      ? new Date(issue.slaDeadline).toISOString()
      : "None";
    const newDeadlineStr = new Date(args.newDeadline).toISOString();

    // Update issue SLA
    await ctx.db.patch(args.issueId, {
      slaDeadline: args.newDeadline,
      slaExtendedCount: (issue.slaExtendedCount || 0) + 1,
      lastSlaExtensionAt: now,
      slaBreached: false,
      escalation: issue.escalation
        ? {
            ...issue.escalation,
            adminReviewStatus: "reviewed",
          }
        : undefined,
    });

    // Resolution actions
    await ctx.db.insert("escalationResolutionActions", {
      issueId: args.issueId,
      actionType: "extend_sla",
      performedBy: args.cityAdminUserId,
      performedAt: now,
      oldValue: oldDeadlineStr,
      newValue: newDeadlineStr,
      notes: args.notes,
    });

    // Timeline update
    await ctx.db.insert("issueUpdates", {
      issueId: args.issueId,
      status: issue.status,
      comment: `SLA Deadline extended to ${new Date(args.newDeadline).toLocaleString()}. Reason: ${args.notes}`,
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer_and_citizen",
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("cityAdminAuditLogs", {
      action: "SLA Deadline Extended",
      performedByUserId: args.cityAdminUserId,
      performerRole: "city_admin",
      city: issue.city,
      affectedEntityType: "issue",
      affectedEntityId: issue._id,
      issueCode: issue.issueCode,
      oldValue: oldDeadlineStr,
      newValue: newDeadlineStr,
      reason: args.notes,
      timestamp: now,
    });

    // Notifications
    const parties = [issue.reportedBy];
    if (issue.assignedUnitOfficer) parties.push(issue.assignedUnitOfficer);
    if (issue.assignedFieldOfficer) parties.push(issue.assignedFieldOfficer);

    for (const p of parties) {
      await ctx.db.insert("notifications", {
        userId: p,
        issueId: args.issueId,
        title: "SLA Deadline Extended",
        message: `Resolution deadline target extended for issue ${issue.issueCode}.`,
        type: "assigned",
        read: false,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

// Scoped Reassign responsible officer mutation
export const reassignIssueOfficer = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
    newUnitOfficerId: v.optional(v.id("unitOfficers")),
    newFieldOfficerId: v.optional(v.id("fieldOfficers")),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized");
    }

    const now = Date.now();
    const oldUo = issue.assignedUnitOfficer;
    const oldFo = issue.assignedFieldOfficer;

    const patches = {};

    // Unit Officer reassignment
    if (args.newUnitOfficerId) {
      const uoProfile = await ctx.db.get(args.newUnitOfficerId);
      if (!uoProfile || uoProfile.city !== city) {
        throw new Error("Invalid Unit Officer selected");
      }

      patches.assignedUnitOfficer = uoProfile.userId;

      // Workload subtraction
      if (oldUo) {
        const oldUoProfile = await ctx.db
          .query("unitOfficers")
          .withIndex("by_user", (q) => q.eq("userId", oldUo))
          .unique();
        if (oldUoProfile) {
          await ctx.db.patch(oldUoProfile._id, {
            activeIssueIds: (oldUoProfile.activeIssueIds || []).filter(
              (id) => id !== args.issueId,
            ),
          });
        }
      }

      // Workload addition
      await ctx.db.patch(uoProfile._id, {
        activeIssueIds: [...(uoProfile.activeIssueIds || []), args.issueId],
      });
    }

    // Field Officer reassignment
    if (args.newFieldOfficerId) {
      const foProfile = await ctx.db.get(args.newFieldOfficerId);
      if (!foProfile || foProfile.city !== city) {
        throw new Error("Invalid Field Officer selected");
      }

      patches.assignedFieldOfficer = foProfile.userId;

      // Workload subtraction
      if (oldFo) {
        const oldFoProfile = await ctx.db
          .query("fieldOfficers")
          .withIndex("by_user", (q) => q.eq("userId", oldFo))
          .unique();
        if (oldFoProfile) {
          const updatedIds = (oldFoProfile.assignedIssueIds || []).filter(
            (id) => id !== args.issueId,
          );
          await ctx.db.patch(oldFoProfile._id, {
            assignedIssueIds: updatedIds,
            currentActiveIssues: updatedIds.length,
          });
        }
      }

      // Workload addition
      const updatedIds = [...(foProfile.assignedIssueIds || []), args.issueId];
      await ctx.db.patch(foProfile._id, {
        assignedIssueIds: updatedIds,
        currentActiveIssues: updatedIds.length,
      });
    }

    await ctx.db.patch(args.issueId, patches);

    // Timeline update
    await ctx.db.insert("issueUpdates", {
      issueId: args.issueId,
      status: issue.status,
      comment: `Officer reassigned. Justification: ${args.notes}`,
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer_and_citizen",
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("cityAdminAuditLogs", {
      action: "Officer Reassigned",
      performedByUserId: args.cityAdminUserId,
      performerRole: "city_admin",
      city: issue.city,
      affectedEntityType: "issue",
      affectedEntityId: issue._id,
      issueCode: issue.issueCode,
      oldValue: String(oldUo || "None"),
      newValue: String(patches.assignedUnitOfficer || oldUo || "None"),
      reason: args.notes,
      timestamp: now,
    });

    return { success: true };
  },
});

// Scoped Category / department correction mutation
export const changeIssueCategory = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
    newCategory: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized");
    }

    const now = Date.now();
    const oldCategory = issue.category;

    // Category mapping to department
    const deptMap = {
      road: "Roads & Traffic",
      electricity: "Electricity & Streetlights",
      water: "Water Supply & Sewage",
      sanitation: "Sanitation & Waste Management",
      drainage: "Drainage Department",
      solid_waste: "Sanitation & Waste Management",
      public_health: "Public Health Department",
      other: "General Administration",
    };
    const newDept =
      deptMap[args.newCategory.toLowerCase()] || "General Administration";

    await ctx.db.patch(args.issueId, {
      category: args.newCategory,
      department: newDept,
    });

    // Resolution actions
    await ctx.db.insert("escalationResolutionActions", {
      issueId: args.issueId,
      actionType: "change_category",
      performedBy: args.cityAdminUserId,
      performedAt: now,
      oldValue: oldCategory,
      newValue: args.newCategory,
      notes: args.notes,
    });

    // Timeline update
    await ctx.db.insert("issueUpdates", {
      issueId: args.issueId,
      status: issue.status,
      comment: `Issue category reclassified to ${args.newCategory}. Department: ${newDept}. Reason: ${args.notes}`,
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer_and_citizen",
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("cityAdminAuditLogs", {
      action: "Issue Category Changed",
      performedByUserId: args.cityAdminUserId,
      performerRole: "city_admin",
      city: issue.city,
      affectedEntityType: "issue",
      affectedEntityId: issue._id,
      issueCode: issue.issueCode,
      oldValue: oldCategory,
      newValue: args.newCategory,
      reason: args.notes,
      timestamp: now,
    });

    return { success: true };
  },
});

// Acknowledge Escalation Mutation
export const reviewEscalation = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized");
    }

    const now = Date.now();

    await ctx.db.patch(args.issueId, {
      escalation: issue.escalation
        ? {
            ...issue.escalation,
            adminReviewStatus: "reviewed",
          }
        : undefined,
    });

    await ctx.db.insert("escalationResolutionActions", {
      issueId: args.issueId,
      actionType: "review_escalation",
      performedBy: args.cityAdminUserId,
      performedAt: now,
      notes: "Escalation formally acknowledged and reviewed by administrator.",
    });

    await ctx.db.insert("issueUpdates", {
      issueId: args.issueId,
      status: issue.status,
      comment: "Escalation review initiated by Administrator.",
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer_and_citizen",
      createdAt: now,
    });

    return { success: true };
  },
});

// Approve Escalation Resolution
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
      throw new Error("Issue not found or unauthorized");
    }

    const now = Date.now();

    await ctx.db.patch(args.issueId, {
      escalatedToAdmin: false,
      escalation: issue.escalation
        ? {
            ...issue.escalation,
            resolved: true,
            resolvedAt: now,
            resolutionNote: args.notes,
            adminReviewStatus: "resolved",
          }
        : undefined,
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
      comment: `Escalation resolved by Administrator. Note: ${args.notes}`,
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer_and_citizen",
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("cityAdminAuditLogs", {
      action: "Escalation Resolved",
      performedByUserId: args.cityAdminUserId,
      performerRole: "city_admin",
      city: issue.city,
      affectedEntityType: "issue",
      affectedEntityId: issue._id,
      issueCode: issue.issueCode,
      oldValue: "reviewed",
      newValue: "resolved",
      reason: args.notes,
      timestamp: now,
    });

    return { success: true };
  },
});

// Dismiss Escalation Mutation
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
      throw new Error("Issue not found or unauthorized");
    }

    const now = Date.now();

    await ctx.db.patch(args.issueId, {
      escalatedToAdmin: false,
      escalation: issue.escalation
        ? {
            ...issue.escalation,
            resolved: true,
            resolvedAt: now,
            resolutionNote: args.reason,
            adminReviewStatus: "resolved",
          }
        : undefined,
    });

    await ctx.db.insert("escalationResolutionActions", {
      issueId: args.issueId,
      actionType: "reject_escalation",
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

    return { success: true };
  },
});

// Reject Civic Issue (Formally reject the issue itself)
export const rejectEscalation = mutation({
  args: {
    cityAdminUserId: v.id("users"),
    issueId: v.id("issues"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { city } = await requireCityAdmin(ctx, args.cityAdminUserId);
    const issue = await ctx.db.get(args.issueId);
    if (!issue || issue.city !== city) {
      throw new Error("Issue not found or unauthorized");
    }

    const now = Date.now();

    await ctx.db.patch(args.issueId, {
      status: "rejected",
      escalatedToAdmin: false,
      escalation: issue.escalation
        ? {
            ...issue.escalation,
            resolved: true,
            resolvedAt: now,
            resolutionNote: `Issue rejected. Reason: ${args.reason}`,
            adminReviewStatus: "resolved",
          }
        : undefined,
    });

    await ctx.db.insert("escalationResolutionActions", {
      issueId: args.issueId,
      actionType: "reject_escalation",
      performedBy: args.cityAdminUserId,
      performedAt: now,
      notes: `Civic issue formally rejected. Reason: ${args.reason}`,
    });

    await ctx.db.insert("issueUpdates", {
      issueId: args.issueId,
      status: "rejected",
      comment: `Civic issue formally rejected by administrator. Reason: ${args.reason}`,
      updatedBy: args.cityAdminUserId,
      role: "city_admin",
      attachments: [],
      scope: "officer_and_citizen",
      createdAt: now,
    });

    return { success: true };
  },
});

// Bulk Acknowledge Escalations Mutation exclusively for City Admin
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
      if (!issue.escalation) {
        skippedIssues.push({ issueId, reason: "No active escalation" });
        continue;
      }
      if (
        issue.escalation.resolved ||
        issue.escalation.adminReviewStatus === "resolved" ||
        issue.escalation.adminReviewStatus === "dismissed"
      ) {
        skippedIssues.push({ issueId, reason: "Escalation already closed" });
        continue;
      }

      await ctx.db.patch(issue._id, {
        escalation: {
          ...issue.escalation,
          adminReviewStatus: "reviewed",
          acknowledgedAt: now,
          acknowledgedBy: args.cityAdminUserId,
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
