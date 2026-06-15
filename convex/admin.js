import { query } from "./_generated/server";

export const getOfficerCommandCenterData = query({
  args: {},
  handler: async (ctx) => {
    const rawUnitOfficers = await ctx.db.query("unitOfficers").collect();
    const rawFieldOfficers = await ctx.db.query("fieldOfficers").collect();
    const rawIssues = await ctx.db.query("issues").collect();

    // Map profile pictures to URLs
    const unitOfficers = await Promise.all(
      rawUnitOfficers.map(async (officer) => {
        const profilePictureUrl = officer.profilePicture
          ? await ctx.storage.getUrl(officer.profilePicture)
          : null;
        return {
          ...officer,
          profilePictureUrl,
        };
      })
    );

    const fieldOfficers = await Promise.all(
      rawFieldOfficers.map(async (officer) => {
        const profilePictureUrl = officer.profilePicture
          ? await ctx.storage.getUrl(officer.profilePicture)
          : null;
        return {
          ...officer,
          profilePictureUrl,
        };
      })
    );

    // Combine into officers list
    const combinedOfficers = [
      ...unitOfficers.map((o) => ({
        id: o.userId,
        userId: o.userId,
        fullName: o.fullName,
        full_name: o.fullName, // alias for backwards compatibility
        email: o.email,
        phone: o.phone,
        role: "unit_officer",
        city: o.city,
        state: o.state,
        district: o.district,
        department: o.department,
        ward_zone: o.city || o.district, // alias
        profilePictureUrl: o.profilePictureUrl,
        rating: o.rating,
        efficiencyScore: o.efficiencyScore,
        avgResolutionTime: o.avgResolutionTime,
        accountApproved: o.accountApproved,
        specialisations: [],
        currentActiveIssues: o.activeIssueIds?.length ?? 0,
        maxIssueCapacity: 50,
      })),
      ...fieldOfficers.map((o) => ({
        id: o.userId,
        userId: o.userId,
        fullName: o.fullName,
        full_name: o.fullName, // alias for backwards compatibility
        email: o.email,
        phone: o.phone,
        role: "field_officer",
        city: o.city,
        state: o.state,
        district: o.district,
        department: o.department,
        ward_zone: o.city || o.district, // alias
        profilePictureUrl: o.profilePictureUrl,
        rating: o.rating,
        efficiencyScore: o.efficiencyScore,
        avgResolutionTime: o.avgResolutionTime,
        accountApproved: o.accountApproved,
        specialisations: o.specialisations ?? [],
        currentActiveIssues: o.currentActiveIssues ?? 0,
        maxIssueCapacity: o.maxIssueCapacity ?? 15,
      })),
    ];

    const now = Date.now();

    // Build officerWorkload
    const officerWorkload = combinedOfficers.map((officer) => {
      const assignedIssues = rawIssues.filter((issue) => {
        if (officer.role === "field_officer") {
          return issue.assignedFieldOfficer === officer.userId;
        } else {
          return issue.assignedUnitOfficer === officer.userId;
        }
      });

      const total = assignedIssues.length;

      let pending = 0;
      let inProgress = 0;
      let resolved = 0;
      let rejected = 0;
      let overdue = 0;

      assignedIssues.forEach((issue) => {
        const status = (issue.status || "").toLowerCase().trim();
        
        // Overdue rule: slaDeadline exists, is in the past, and issue is not resolved, closed, rejected, withdrawn
        const isOverdue =
          issue.slaDeadline &&
          issue.slaDeadline < now &&
          !["resolved", "closed", "rejected", "withdrawn"].includes(status);

        if (isOverdue) {
          overdue++;
        }

        if (officer.role === "field_officer") {
          if (status === "pending") {
            pending++;
          } else if (["assigned", "in_progress", "rework_required", "pending_uo_verification"].includes(status)) {
            inProgress++;
          } else if (["resolved", "closed"].includes(status)) {
            resolved++;
          } else if (status === "rejected") {
            rejected++;
          }
        } else {
          // Unit officer
          if (["pending", "verified"].includes(status)) {
            pending++;
          } else if (["assigned", "in_progress", "pending_uo_verification", "rework_required"].includes(status)) {
            inProgress++;
          } else if (["resolved", "closed"].includes(status)) {
            resolved++;
          } else if (status === "rejected") {
            rejected++;
          }
        }
      });

      const completionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      // Workload Status
      let workloadStatus = "balanced";
      if (officer.role === "field_officer") {
        const activeCount = officer.currentActiveIssues;
        const capacity = officer.maxIssueCapacity || 15;
        const workloadPct = capacity > 0 ? (activeCount / capacity) * 100 : 0;
        if (activeCount >= capacity || workloadPct >= 85) {
          workloadStatus = "overloaded";
        } else if (activeCount <= 1 || workloadPct <= 25) {
          workloadStatus = "underutilized";
        }
      } else {
        // Unit Officer workload rules
        const activeCount = assignedIssues.filter(
          (i) => !["resolved", "closed", "rejected", "withdrawn"].includes((i.status || "").toLowerCase().trim())
        ).length;
        if (activeCount >= 15) {
          workloadStatus = "overloaded";
        } else if (activeCount <= 4) {
          workloadStatus = "underutilized";
        }
      }

      return {
        officer,
        total,
        pending,
        inProgress,
        resolved,
        rejected,
        overdue,
        issues: assignedIssues,
        completionRate,
        avgResolutionTime: officer.avgResolutionTime ?? 0,
        workloadStatus,
        rating: officer.rating ?? 0,
      };
    });

    // Stats calculations
    const totalOfficers = combinedOfficers.length;
    const totalUnitOfficers = unitOfficers.length;
    const totalFieldOfficers = fieldOfficers.length;

    const assignedIssues = rawIssues.filter((i) => i.assignedUnitOfficer || i.assignedFieldOfficer).length;

    const overdueIssues = rawIssues.filter((issue) => {
      const status = (issue.status || "").toLowerCase().trim();
      return (
        issue.slaDeadline &&
        issue.slaDeadline < now &&
        !["resolved", "closed", "rejected", "withdrawn"].includes(status)
      );
    }).length;

    const balancedCount = officerWorkload.filter((ow) => ow.workloadStatus === "balanced").length;
    const overloadedCount = officerWorkload.filter((ow) => ow.workloadStatus === "overloaded").length;
    const underutilizedCount = officerWorkload.filter((ow) => ow.workloadStatus === "underutilized").length;

    const avgCompletion =
      totalOfficers > 0
        ? Math.round(
            officerWorkload.reduce((sum, ow) => sum + ow.completionRate, 0) / totalOfficers
          )
        : 0;

    return {
      unitOfficers,
      fieldOfficers,
      officers: combinedOfficers,
      issues: rawIssues,
      officerWorkload,
      stats: {
        totalOfficers,
        totalUnitOfficers,
        totalFieldOfficers,
        assignedIssues,
        overdueIssues,
        balancedCount,
        overloadedCount,
        underutilizedCount,
        avgCompletion,
      },
    };
  },
});
