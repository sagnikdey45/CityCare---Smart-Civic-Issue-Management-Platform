import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * System Admin Query: Fetch global universal audit logs with filters
 */
export const getSystemAuditLogs = query({
  args: {
    adminUserId: v.id("users"),
    role: v.optional(v.string()),
    city: v.optional(v.string()),
    department: v.optional(v.string()),
    actionCategory: v.optional(v.string()),
    issueCode: v.optional(v.string()),
    dateRange: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Auth check
    const user = await ctx.db.get(args.adminUserId);
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: System Admin privileges required");
    }

    let logs = await ctx.db.query("auditLogs").collect();

    // Filtering
    if (args.role) {
      logs = logs.filter((l) => l.performerRole === args.role);
    }

    if (args.city) {
      const targetCity = args.city.toLowerCase().trim();
      logs = logs.filter((l) => l.city?.toLowerCase().trim() === targetCity);
    }

    if (args.department) {
      const targetDept = args.department.toLowerCase().trim();
      logs = logs.filter((l) => l.department?.toLowerCase().trim() === targetDept);
    }

    if (args.actionCategory) {
      logs = logs.filter((l) => l.actionCategory === args.actionCategory);
    }

    if (args.issueCode) {
      const targetCode = args.issueCode.toLowerCase().trim();
      logs = logs.filter((l) => l.issueCode?.toLowerCase().includes(targetCode));
    }

    if (args.dateRange) {
      const now = Date.now();
      let cutoff = 0;
      if (args.dateRange === "24h") cutoff = now - 24 * 60 * 60 * 1000;
      else if (args.dateRange === "7d") cutoff = now - 7 * 24 * 60 * 60 * 1000;
      else if (args.dateRange === "30d") cutoff = now - 30 * 24 * 60 * 60 * 1000;

      if (cutoff > 0) {
        logs = logs.filter((l) => l.timestamp >= cutoff);
      }
    }

    // Sort descending by timestamp
    logs.sort((a, b) => b.timestamp - a.timestamp);

    const page = args.page || 1;
    const pageSize = args.pageSize || 50;
    const startIndex = (page - 1) * pageSize;
    const paginatedLogs = logs.slice(startIndex, startIndex + pageSize);

    return {
      total: logs.length,
      page,
      pageSize,
      logs: paginatedLogs,
    };
  },
});

/**
 * City Admin Query: Fetch city-scoped audit logs (universal auditLogs + cityAdminAuditLogs)
 */
export const getCityAuditLogs = query({
  args: {
    cityAdminUserId: v.id("users"),
    role: v.optional(v.string()),
    category: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Derive City Admin city securely from database profile
    const cityAdmin = await ctx.db
      .query("cityAdmins")
      .withIndex("by_user", (q) => q.eq("userId", args.cityAdminUserId))
      .first();

    if (!cityAdmin) {
      throw new Error("City Admin profile not found");
    }

    const cityNorm = cityAdmin.city.toLowerCase().trim();

    // 1. Fetch universal audit logs for this city
    const universalLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_city", (q) => q.eq("city", cityAdmin.city))
      .collect();

    // 2. Fetch specialized cityAdminAuditLogs for this city
    const specializedLogs = await ctx.db
      .query("cityAdminAuditLogs")
      .withIndex("by_city", (q) => q.eq("city", cityAdmin.city))
      .collect();

    // User lookup map for full name rendering
    const users = await ctx.db.query("users").collect();
    const userMap = new Map(users.map((u) => [u._id, u]));

    // Map universal logs
    const normalizedUniversal = universalLogs.map((log) => {
      const performer = log.performedByUserId ? userMap.get(log.performedByUserId) : null;
      return {
        id: log._id,
        isUniversal: true,
        action: log.action,
        actionCategory: log.actionCategory,
        performerName: performer?.fullName || "System/User",
        performerRole: log.performerRole,
        issueId: log.issueId,
        issueCode: log.issueCode || "N/A",
        city: log.city,
        department: log.department,
        oldValue: log.oldValue,
        newValue: log.newValue,
        reason: log.reason,
        description: log.description,
        source: log.source,
        timestamp: log.timestamp,
      };
    });

    // Map specialized cityAdminAuditLogs (for backwards compatibility)
    const normalizedSpecialized = specializedLogs.map((log) => {
      const performer = userMap.get(log.performedByUserId);
      return {
        id: log._id,
        isUniversal: false,
        action: log.action,
        actionCategory: "escalation",
        performerName: performer?.fullName || "City Admin",
        performerRole: "city_admin",
        issueId: log.affectedEntityId,
        issueCode: log.issueCode || "N/A",
        city: log.city,
        department: "N/A",
        oldValue: log.oldValue,
        newValue: log.newValue,
        reason: log.reason,
        description: `City Admin action: ${log.action}`,
        source: "web",
        timestamp: log.timestamp,
      };
    });

    // Merge and deduplicate near-identical entries (within 2 seconds on same issueCode & action)
    const combined = [...normalizedUniversal];

    for (const spec of normalizedSpecialized) {
      const isDuplicate = normalizedUniversal.some(
        (u) =>
          u.issueCode === spec.issueCode &&
          Math.abs(u.timestamp - spec.timestamp) < 3000
      );
      if (!isDuplicate) {
        combined.push(spec);
      }
    }

    let filtered = combined;

    if (args.role) {
      filtered = filtered.filter((l) => l.performerRole === args.role);
    }

    if (args.category) {
      filtered = filtered.filter((l) => l.actionCategory === args.category);
    }

    filtered.sort((a, b) => b.timestamp - a.timestamp);

    const page = args.page || 1;
    const pageSize = args.pageSize || 50;
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
      total: filtered.length,
      page,
      pageSize,
      logs: paginated,
    };
  },
});
