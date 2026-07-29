import { v } from "convex/values";
import { query } from "./_generated/server";

const normalizeKey = (val) => (val || "").toLowerCase().trim();

// Helper to resolve the admin's database user ID (v.id("users"))
async function resolveCityAdminUserId(ctx, cityAdminUserIdStr) {
  if (cityAdminUserIdStr) {
    try {
      const user = await ctx.db.get(cityAdminUserIdStr);
      if (user && user.role === "city_admin") {
        return user._id;
      }
    } catch (e) {
      // Not a valid ID format or not found
    }
  }
  return null;
}

export const getCityAdminOverview = query({
  args: {
    cityAdminUserId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Resolve user & role
    const user = await ctx.db.get(args.cityAdminUserId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role !== "city_admin") {
      throw new Error("Unauthorized. Only City Admins can access this data.");
    }

    // 2. Query cityAdmins profile
    const cityAdmin = await ctx.db
      .query("cityAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.cityAdminUserId))
      .unique();
    if (!cityAdmin) {
      throw new Error("City Admin profile not found.");
    }

    const city = cityAdmin.city;
    const state = cityAdmin.state;
    const now = Date.now();
    const rangeDays = args.days ?? 7;
    const isAllTime = rangeDays === 0;

    // Filter range calculation
    const cutoff = isAllTime ? 0 : now - rangeDays * 24 * 60 * 60 * 1000;

    // 3. Query issues within the city (indexed)
    const allCityIssues = await ctx.db
      .query("issues")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();

    // Split into all-time vs range-filtered
    const rangeIssues = allCityIssues.filter((i) => {
      const created = i.createdAt ?? i._creationTime ?? now;
      return isAllTime || created >= cutoff;
    });

    // 4. Query officers within the city (indexed/filtered)
    const unitOfficers = await ctx.db
      .query("unitOfficers")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();

    const fieldOfficers = await ctx.db
      .query("fieldOfficers")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();

    // 5. Active & Terminal classifications
    const activeStatuses = [
      "pending",
      "verified",
      "assigned",
      "in_progress",
      "pending_uo_verification",
      "rework_required",
      "reopened",
      "escalated",
    ];

    const getStatusCount = (issuesList, statusName) =>
      issuesList.filter(
        (i) => normalizeKey(i.status) === normalizeKey(statusName),
      ).length;

    // SLA Calculations
    let overdueIssuesCount = 0;
    let dueSoonIssuesCount = 0;
    let onTrackIssuesCount = 0;
    let totalCompletedWithSla = 0;
    let compliantCompletedCount = 0;
    let totalResolutionTimeMs = 0;
    let resolvedWithTimeCount = 0;

    const activeSlaIssues = [];

    // Let's process active issues for current SLA status
    for (const issue of allCityIssues) {
      const isTerminal = [
        "resolved",
        "closed",
        "rejected",
        "withdrawn",
      ].includes(normalizeKey(issue.status));
      if (!isTerminal) {
        if (issue.slaDeadline) {
          if (issue.slaDeadline < now) {
            overdueIssuesCount++;
            activeSlaIssues.push({
              issue,
              type: "overdue",
              delay: now - issue.slaDeadline,
            });
          } else if (issue.slaDeadline - now < 48 * 60 * 60 * 1000) {
            dueSoonIssuesCount++;
            activeSlaIssues.push({
              issue,
              type: "due_soon",
              remaining: issue.slaDeadline - now,
            });
          } else {
            onTrackIssuesCount++;
          }
        }
      } else {
        // Historical metrics on completed/terminal issues
        if (issue.slaDeadline && (issue.resolvedAt || issue.closedAt)) {
          totalCompletedWithSla++;
          const completedAt = issue.resolvedAt ?? issue.closedAt ?? now;
          if (completedAt <= issue.slaDeadline) {
            compliantCompletedCount++;
          }
        }
        if (issue.createdAt && (issue.resolvedAt || issue.closedAt)) {
          const completedAt = issue.resolvedAt ?? issue.closedAt ?? now;
          totalResolutionTimeMs += completedAt - issue.createdAt;
          resolvedWithTimeCount++;
        }
      }
    }

    const slaComplianceRate =
      totalCompletedWithSla > 0
        ? Math.round((compliantCompletedCount / totalCompletedWithSla) * 100)
        : 100;

    const averageResolutionTimeHours =
      resolvedWithTimeCount > 0
        ? Math.round(
            totalResolutionTimeMs / resolvedWithTimeCount / (1000 * 60 * 60),
          )
        : 0;

    // Find nearest upcoming deadline
    let nearestDeadline = null;
    let nearestDeadlineIssue = null;
    let mostOverdueIssue = null;
    let maxOverdueDelay = -1;

    for (const item of activeSlaIssues) {
      if (item.type === "due_soon" || item.type === "on_track") {
        if (
          nearestDeadline === null ||
          item.issue.slaDeadline < nearestDeadline
        ) {
          nearestDeadline = item.issue.slaDeadline;
          nearestDeadlineIssue = {
            id: item.issue._id,
            code: item.issue.issueCode,
            title: item.issue.title,
            deadline: item.issue.slaDeadline,
          };
        }
      } else if (item.type === "overdue") {
        if (item.delay > maxOverdueDelay) {
          maxOverdueDelay = item.delay;
          mostOverdueIssue = {
            id: item.issue._id,
            code: item.issue.issueCode,
            title: item.issue.title,
            overdueHours: Math.round(item.delay / (1000 * 60 * 60)),
          };
        }
      }
    }

    // Duplicate detection inside city (from rangeIssues)
    const duplicateGroupsList = [];
    const processed = new Set();
    let duplicateIssuesCount = 0;
    let redundantDuplicateIssuesCount = 0;

    const calculateSimilarity = (str1, str2) => {
      const words1 = new Set((str1 || "").toLowerCase().split(/\s+/));
      const words2 = new Set((str2 || "").toLowerCase().split(/\s+/));
      const intersection = new Set([...words1].filter((x) => words2.has(x)));
      return intersection.size / Math.max(words1.size, words2.size);
    };

    for (let i = 0; i < rangeIssues.length; i++) {
      const issue = rangeIssues[i];
      if (processed.has(issue._id)) continue;

      const groupDuplicates = [];
      for (let j = 0; j < rangeIssues.length; j++) {
        const other = rangeIssues[j];
        if (i === j || processed.has(other._id)) continue;

        const similarity = calculateSimilarity(issue.title, other.title);
        if (similarity > 0.7) {
          groupDuplicates.push({
            id: other._id,
            code: other.issueCode,
            title: other.title,
            address: other.address,
            similarity: Math.round(similarity * 100),
          });
          processed.add(other._id);
        }
      }

      if (groupDuplicates.length > 0) {
        duplicateGroupsList.push({
          primary: {
            id: issue._id,
            code: issue.issueCode,
            title: issue.title,
            address: issue.address,
          },
          duplicates: groupDuplicates,
        });
        processed.add(issue._id);
        duplicateIssuesCount += groupDuplicates.length + 1;
        redundantDuplicateIssuesCount += groupDuplicates.length;
      }
    }

    // Officers overview stats
    const activeOfficersCount =
      unitOfficers.filter((o) => o.accountApproved).length +
      fieldOfficers.filter((o) => o.accountApproved).length;

    const overloadedOfficersList = fieldOfficers.filter(
      (o) => o.accountApproved && (o.assignedIssueIds || []).length >= 5,
    );
    const officersWithOverdue = new Set();
    for (const item of activeSlaIssues) {
      if (item.type === "overdue" && item.issue.assignedUnitOfficer) {
        officersWithOverdue.add(String(item.issue.assignedUnitOfficer));
      }
      if (item.type === "overdue" && item.issue.assignedFieldOfficer) {
        officersWithOverdue.add(String(item.issue.assignedFieldOfficer));
      }
    }

    // Top performing officer
    let topPerformingOfficer = null;
    let maxResolvedCount = -1;
    for (const uo of unitOfficers) {
      const resolvedCount = (uo.resolvedIssueIds || []).length;
      if (resolvedCount > maxResolvedCount) {
        maxResolvedCount = resolvedCount;
        topPerformingOfficer = {
          id: uo._id,
          name: uo.fullName,
          role: "unit_officer",
          resolvedCount,
        };
      }
    }
    for (const fo of fieldOfficers) {
      const resolvedCount = fo.totalResolvedIssues || 0;
      if (resolvedCount > maxResolvedCount) {
        maxResolvedCount = resolvedCount;
        topPerformingOfficer = {
          id: fo._id,
          name: fo.fullName,
          role: "field_officer",
          resolvedCount,
        };
      }
    }

    // Officer requiring attention
    let officerRequiringAttention = null;
    if (overloadedOfficersList.length > 0) {
      const target = overloadedOfficersList[0];
      officerRequiringAttention = {
        id: target._id,
        name: target.fullName,
        reason: "Overloaded capacity",
      };
    } else if (officersWithOverdue.size > 0) {
      const officerId = [...officersWithOverdue][0];
      const uo = unitOfficers.find((o) => String(o.userId) === officerId);
      const fo = fieldOfficers.find((o) => String(o.userId) === officerId);
      if (uo) {
        officerRequiringAttention = {
          id: uo._id,
          name: uo.fullName,
          reason: "Has overdue issues assigned",
        };
      } else if (fo) {
        officerRequiringAttention = {
          id: fo._id,
          name: fo.fullName,
          reason: "Has overdue issues assigned",
        };
      }
    }

    const getIssueSlaStatusAndHours = (issue, nowTime) => {
      const isTerminal = [
        "resolved",
        "closed",
        "rejected",
        "withdrawn",
      ].includes(normalizeKey(issue.status));
      if (isTerminal) return { slaStatus: "resolved", hoursRemaining: 0 };
      if (!issue.slaDeadline) return { slaStatus: "no_sla", hoursRemaining: 0 };
      const diff = issue.slaDeadline - nowTime;
      const hours = Math.round(diff / (1000 * 60 * 60));
      if (diff < 0) {
        return { slaStatus: "breached", hoursRemaining: hours };
      }
      if (diff < 48 * 60 * 60 * 1000) {
        return { slaStatus: "at_risk", hoursRemaining: hours };
      }
      return { slaStatus: "on_track", hoursRemaining: hours };
    };

    const officerIds = new Set();
    for (const issue of rangeIssues) {
      if (issue.assignedUnitOfficer)
        officerIds.add(String(issue.assignedUnitOfficer));
      if (issue.assignedFieldOfficer)
        officerIds.add(String(issue.assignedFieldOfficer));
    }

    const officerNamesMap = new Map();
    for (const id of officerIds) {
      const u = await ctx.db.get(id);
      if (u) {
        officerNamesMap.set(id, u.fullName);
      }
    }

    const mapIssues = rangeIssues
      .filter((i) => {
        const lat = Number(i.latitude);
        const lng = Number(i.longitude);
        return (
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        );
      })
      .map((i) => {
        const { slaStatus, hoursRemaining } = getIssueSlaStatusAndHours(i, now);
        const assignedUnitOfficerName = i.assignedUnitOfficer
          ? (officerNamesMap.get(String(i.assignedUnitOfficer)) ?? null)
          : null;
        const assignedFieldOfficerName = i.assignedFieldOfficer
          ? (officerNamesMap.get(String(i.assignedFieldOfficer)) ?? null)
          : null;
        return {
          id: i._id,
          code: i.issueCode,
          title: i.title,
          description: i.description || "",
          category: i.category,
          subcategory: i.subcategory ?? [],
          priority: i.priority,
          status: i.status,

          address: i.address,
          city: i.city,
          state: i.state,
          postal: i.postal,

          latitude: Number(i.latitude),
          longitude: Number(i.longitude),

          createdAt: i.createdAt ?? i._creationTime,
          slaDeadline: i.slaDeadline,

          assignedUnitOfficerId: i.assignedUnitOfficer,
          assignedUnitOfficerName,

          assignedFieldOfficerId: i.assignedFieldOfficer,
          assignedFieldOfficerName,

          isEscalated:
            i.escalatedToAdmin === true ||
            i.status === "escalated" ||
            Boolean(i.escalation),

          slaStatus,
          hoursRemaining,
        };
      });

    function getIssueSlaStatus(issue, nowTime) {
      const isTerminal = [
        "resolved",
        "closed",
        "rejected",
        "withdrawn",
      ].includes(normalizeKey(issue.status));
      if (isTerminal) return "resolved";
      if (!issue.slaDeadline) return "no_sla";
      if (issue.slaDeadline < nowTime) return "breached";
      if (issue.slaDeadline - nowTime < 48 * 60 * 60 * 1000) return "at_risk";
      return "on_track";
    }

    // Recent Issues (limit 5)
    const recentIssues = [...rangeIssues]
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
      .slice(0, 5)
      .map((i) => ({
        id: i._id,
        code: i.issueCode,
        title: i.title,
        status: i.status,
        category: i.category,
        createdAt: i.createdAt,
      }));

    // Needs Urgent Attention list
    const urgentIssues = rangeIssues
      .filter((i) => {
        const isTerminal = [
          "resolved",
          "closed",
          "rejected",
          "withdrawn",
        ].includes(normalizeKey(i.status));
        if (isTerminal) return false;
        const slaStatus = getIssueSlaStatus(i, now);
        const isEsc =
          !!i.escalatedToAdmin || (i.escalation && !i.escalation.resolved);
        const isReopened = !!i.isReopened;
        const isHighPriority =
          i.priority === "high" || i.priority === "critical";
        const isUnassigned = !i.assignedUnitOfficer && !i.assignedFieldOfficer;
        return (
          slaStatus === "breached" ||
          slaStatus === "at_risk" ||
          isEsc ||
          isReopened ||
          isHighPriority ||
          isUnassigned
        );
      })
      .map((i) => {
        let reason = "Requires review";
        const slaStatus = getIssueSlaStatus(i, now);
        if (slaStatus === "breached") {
          reason = "SLA Deadline Breached";
        } else if (i.escalation && !i.escalation.resolved) {
          reason = `Escalated: ${i.escalation.reason}`;
        } else if (i.isReopened) {
          reason = "Reopened by citizen";
        } else if (i.priority === "critical" || i.priority === "high") {
          reason = `${i.priority} severity issue`;
        } else if (!i.assignedUnitOfficer && !i.assignedFieldOfficer) {
          reason = "Unassigned ticket";
        }
        return {
          id: i._id,
          code: i.issueCode,
          title: i.title,
          status: i.status,
          category: i.category,
          priority: i.priority,
          reason,
        };
      })
      .slice(0, 5);

    // Escalated Issues Section
    const cityEscalations = rangeIssues.filter(
      (i) => i.escalation && !i.escalation.resolved,
    );

    const recentEscalations = [...cityEscalations]
      .sort(
        (a, b) =>
          (b.escalation.escalatedAt ?? 0) - (a.escalation.escalatedAt ?? 0),
      )
      .slice(0, 5)
      .map((i) => ({
        id: i._id,
        code: i.issueCode,
        title: i.title,
        category: i.category,
        priority: i.priority,
        status: i.status,
        assignedUnitOfficer: i.assignedUnitOfficer,
        assignedFieldOfficer: i.assignedFieldOfficer,
        escalationCategory: i.escalation.category,
        escalationReason: i.escalation.reason,
        escalatedAt: i.escalation.escalatedAt,
        adminReviewStatus: i.escalation.adminReviewStatus || "pending",
      }));

    // Status distribution
    const statusKeys = [
      ...new Set(rangeIssues.map((i) => i.status).filter(Boolean)),
    ];
    const statusDistribution = statusKeys.map((key) => ({
      status: key,
      count: rangeIssues.filter((i) => i.status === key).length,
    }));

    // Category distribution
    const categoryKeys = [
      ...new Set(rangeIssues.map((i) => i.category).filter(Boolean)),
    ];
    const categoryDistribution = categoryKeys.map((key) => ({
      category: key,
      count: rangeIssues.filter((i) => i.category === key).length,
    }));

    // Department/Category performance breakdown
    const departmentPerformance = categoryKeys.map((cat) => {
      const catIssues = allCityIssues.filter((i) => i.category === cat);
      const activeCat = catIssues.filter((i) =>
        activeStatuses.includes(normalizeKey(i.status)),
      );
      const overdueCat = catIssues.filter(
        (i) => getIssueSlaStatus(i, now) === "breached",
      );
      const escalatedCat = catIssues.filter(
        (i) => i.escalation && !i.escalation.resolved,
      );
      const resolvedCat = catIssues.filter((i) =>
        ["resolved", "closed"].includes(normalizeKey(i.status)),
      );

      let compRate = 100;
      const resolvedWithSla = resolvedCat.filter((i) => i.slaDeadline);
      if (resolvedWithSla.length > 0) {
        const compliant = resolvedWithSla.filter(
          (i) => (i.resolvedAt ?? i.closedAt ?? 0) <= i.slaDeadline,
        );
        compRate = Math.round(
          (compliant.length / resolvedWithSla.length) * 100,
        );
      }

      return {
        department: cat,
        totalIssues: catIssues.length,
        activeIssues: activeCat.length,
        overdueIssues: overdueCat.length,
        escalatedIssues: escalatedCat.length,
        slaComplianceRate: compRate,
      };
    });

    // Recent Administrative Activity
    const rawUpdates = await ctx.db.query("issueUpdates").collect();
    const cityIssuesSet = new Set(allCityIssues.map((i) => String(i._id)));
    const cityAdminUpdates = rawUpdates
      .filter((u) => cityIssuesSet.has(String(u.issueId)))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    const recentAdministrativeActivity = [];
    for (const update of cityAdminUpdates) {
      const updater = await ctx.db.get(update.updatedBy);
      const targetIssue = allCityIssues.find(
        (i) => String(i._id) === String(update.issueId),
      );
      recentAdministrativeActivity.push({
        id: update._id,
        action: update.comment || "Workflow updated",
        performedBy: updater?.fullName || "Administrative System",
        performerRole: updater?.role || "system",
        timestamp: new Date(update.createdAt).toLocaleString(),
        affectedEntity: targetIssue?.issueCode || "Unknown",
        notes: `Status changed to ${update.status}`,
      });
    }

    return {
      scope: {
        cityAdminUserId: args.cityAdminUserId,
        cityAdminProfileId: cityAdmin._id,
        city,
        state,
        rangeDays,
        rangeLabel: isAllTime ? "All Time" : `${rangeDays} Days`,
        generatedAt: now,
      },

      summary: {
        totalIssues: rangeIssues.length,
        invalidCoordsCount: rangeIssues.length - mapIssues.length,
        activeIssues: rangeIssues.filter((i) =>
          activeStatuses.includes(normalizeKey(i.status)),
        ).length,
        pendingIssues: getStatusCount(rangeIssues, "pending"),
        verifiedIssues: getStatusCount(rangeIssues, "verified"),
        assignedIssues: getStatusCount(rangeIssues, "assigned"),
        inProgressIssues: getStatusCount(rangeIssues, "in_progress"),
        pendingVerificationIssues: getStatusCount(
          rangeIssues,
          "pending_uo_verification",
        ),
        reworkRequiredIssues: getStatusCount(rangeIssues, "rework_required"),
        reopenedIssues:
          getStatusCount(rangeIssues, "reopened") +
          rangeIssues.filter((i) => i.isReopened).length,
        escalatedIssues:
          getStatusCount(rangeIssues, "escalated") + cityEscalations.length,
        resolvedIssues: getStatusCount(rangeIssues, "resolved"),
        closedIssues: getStatusCount(rangeIssues, "closed"),
        rejectedIssues:
          getStatusCount(rangeIssues, "rejected") +
          rangeIssues.filter((i) => i.rejection).length,
        withdrawnIssues: getStatusCount(rangeIssues, "withdrawn"),

        overdueIssues: overdueIssuesCount,
        dueSoonIssues: dueSoonIssuesCount,
        onTrackIssues: onTrackIssuesCount,
        slaComplianceRate,
        averageResolutionTimeHours,

        totalUnitOfficers: unitOfficers.length,
        totalFieldOfficers: fieldOfficers.length,
        activeOfficers: activeOfficersCount,
        overloadedOfficers: overloadedOfficersList.length,

        duplicateGroups: duplicateGroupsList.length,
        duplicateIssues: duplicateIssuesCount,
        redundantDuplicateIssues: redundantDuplicateIssuesCount,
      },

      recentIssues,
      urgentIssues,
      recentEscalations,
      slaSnapshot: {
        overdueCount: overdueIssuesCount,
        dueSoonCount: dueSoonIssuesCount,
        onTrackCount: onTrackIssuesCount,
        nearestDeadline: nearestDeadline
          ? new Date(nearestDeadline).toISOString()
          : null,
        nearestDeadlineIssue,
        mostOverdueIssue,
      },
      mapIssues,
      statusDistribution,
      categoryDistribution,
      departmentPerformance,
      recentAdministrativeActivity,
      officerSnapshot: {
        totalUnitOfficers: unitOfficers.length,
        totalFieldOfficers: fieldOfficers.length,
        activeOfficers: activeOfficersCount,
        unassignedOfficers:
          unitOfficers.filter((o) => (o.activeIssueIds || []).length === 0)
            .length +
          fieldOfficers.filter((o) => (o.assignedIssueIds || []).length === 0)
            .length,
        overloadedFieldOfficers: overloadedOfficersList.length,
        officersWithOverdueCount: officersWithOverdue.size,
        topPerformingOfficer,
        officerRequiringAttention,
      },
    };
  },
});

export const getCityAdminProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.role !== "city_admin") {
      return null;
    }
    const profile = await ctx.db
      .query("cityAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    return profile;
  },
});
