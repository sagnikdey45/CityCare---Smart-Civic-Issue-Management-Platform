import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Idempotent One-Time Demo Data Seeder for Varanasi and Mumbai
 *
 * Safe for development/demo environments. Uses deterministic email addresses and issue codes.
 * Checks for existing data per city/role/department to avoid duplicate creation.
 */

function isKnownDemoEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  return (
    value === "system.admin.demo@citycare.local" ||
    value.endsWith(".demo@citycare.local")
  );
}

/**
 * Internal query to fetch deterministic demo user accounts for password verification/repair.
 */
export const getDemoUsersForPasswordRepair = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((user) => isKnownDemoEmail(user.email))
      .map((user) => ({
        _id: user._id,
        email: user.email,
        password: user.password,
      }));
  },
});

/**
 * Internal mutation to apply bcrypt password hash patches to demo users needing repair.
 */
export const applyDemoPasswordRepair = internalMutation({
  args: {
    userIds: v.array(v.id("users")),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    let repaired = 0;
    for (const userId of args.userIds) {
      const user = await ctx.db.get(userId);
      if (!user || !isKnownDemoEmail(user.email)) {
        continue;
      }
      await ctx.db.patch(userId, {
        password: args.passwordHash,
      });
      repaired++;
    }
    return { success: true, repaired };
  },
});

const DEPARTMENTS = [
  "road",
  "electricity",
  "water",
  "sanitation",
  "drainage",
  "solid_waste",
  "public_health",
  "other",
];

const DEPARTMENT_LABELS = {
  road: "Road & Infrastructure",
  electricity: "Electricity & Lighting",
  water: "Water Supply",
  sanitation: "Public Sanitation",
  drainage: "Drainage & Sewerage",
  solid_waste: "Solid Waste Management",
  public_health: "Public Health",
  other: "Other Civic Maintenance",
};

const SPECIALISATIONS = {
  road: ["Pothole Repair", "Road Surface Repair", "Footpath Maintenance"],
  electricity: ["Street Lighting", "Electrical Faults", "Public Lighting"],
  water: ["Water Leakage", "Pipeline Repair", "Water Supply"],
  sanitation: ["Public Sanitation", "Drain Cleaning", "Hygiene"],
  drainage: ["Storm Drainage", "Sewer Blockage", "Waterlogging"],
  solid_waste: ["Waste Collection", "Garbage Removal", "Dumping Cleanup"],
  public_health: ["Public Health Hazard", "Vector Control", "Community Health"],
  other: ["General Civic Maintenance"],
};

const DEMO_CITIES = {
  varanasi: {
    city: "Varanasi",
    state: "Uttar Pradesh",
    district: "Varanasi",
    postal: "221001",
    codePrefix: "VNS",
    center: { latitude: 25.3176, longitude: 82.9739 },
    areas: [
      "Lanka",
      "Sigra",
      "Bhelupur",
      "Godowlia",
      "Cantonment",
      "Shivpur",
      "Mahmoorganj",
      "Assi",
    ],
  },
  mumbai: {
    city: "Mumbai",
    state: "Maharashtra",
    district: "Mumbai",
    postal: "400001",
    codePrefix: "MUM",
    center: { latitude: 19.076, longitude: 72.8777 },
    areas: [
      "Andheri",
      "Bandra",
      "Dadar",
      "Powai",
      "Kurla",
      "Colaba",
      "Borivali",
      "Goregaon",
    ],
  },
};

const DEMO_TITLES = {
  road: [
    "Large pothole causing traffic disruption",
    "Damaged road surface near junction",
    "Broken footpath requiring urgent repair",
    "Cracked asphalt hazard on main road",
  ],
  electricity: [
    "Streetlight not functioning at night",
    "Exposed electrical wiring near walkway",
    "Repeated lighting failure in residential area",
    "Damaged transformer enclosure door",
  ],
  water: [
    "Water pipeline leakage on main road",
    "Irregular water supply connection",
    "Public drinking water fountain damaged",
    "Clean water wasting from broken pipe",
  ],
  sanitation: [
    "Public toilet requires urgent sanitation",
    "Drain-side hygiene issue near market",
    "Unsanitary public dumping area",
    "Overflowing public waste receptacle",
  ],
  drainage: [
    "Blocked storm drain causing waterlogging",
    "Waterlogging near traffic junction",
    "Sewer overflow reported in lane",
    "Missing storm drain chamber cover",
  ],
  solid_waste: [
    "Garbage accumulation at street corner",
    "Missed scheduled waste collection",
    "Illegal waste dumping behind complex",
    "Overflowing communal garbage bin",
  ],
  public_health: [
    "Mosquito breeding hotspot in stagnant pool",
    "Public health hazard from stagnant runoff",
    "Stagnant water health concern near school",
    "Open drain pest infestation reported",
  ],
  other: [
    "Damaged civic infrastructure signpost",
    "Public facility maintenance required",
    "Broken park bench in municipal garden",
    "Fallen branch blocking public pathway",
  ],
};

function offsetCoordinates(baseLat, baseLng, index) {
  const offsets = [
    [0.002, 0.001],
    [-0.003, 0.002],
    [0.004, -0.002],
    [-0.002, -0.003],
    [0.005, 0.003],
    [-0.004, 0.004],
    [0.001, -0.005],
    [-0.005, 0.001],
  ];
  const [latOffset, lngOffset] = offsets[index % offsets.length];
  return {
    latitude: (baseLat + latOffset).toFixed(6),
    longitude: (baseLng + lngOffset).toFixed(6),
  };
}

export const seedDemoDataOnce = internalMutation({
  args: {
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const passwordHash = args.passwordHash;

    let systemAdminCreated = false;
    let systemAdminUserId = null;

    // ------------------------------------------------------------------------
    // 1. SYSTEM ADMIN RESOLUTION / SEEDING
    // ------------------------------------------------------------------------
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();

    if (existingAdmin) {
      systemAdminUserId = existingAdmin._id;
    } else {
      const demoAdminEmail = "system.admin.demo@citycare.local";
      const existingDemoAdminUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", demoAdminEmail))
        .unique();

      if (existingDemoAdminUser) {
        systemAdminUserId = existingDemoAdminUser._id;
      } else {
        systemAdminUserId = await ctx.db.insert("users", {
          fullName: "CityCare Demo System Admin",
          email: demoAdminEmail,
          password: passwordHash,
          role: "admin",
          createdAt: new Date(now).toISOString(),
        });
        systemAdminCreated = true;
      }
    }

    const citySummaryResults = {};

    // ------------------------------------------------------------------------
    // 2. CITY-BY-CITY SEEDING (VARANASI & MUMBAI)
    // ------------------------------------------------------------------------
    for (const [cityKey, cityConfig] of Object.entries(DEMO_CITIES)) {
      const cityName = cityConfig.city;
      const cityIndex = cityKey === "varanasi" ? 1 : 2;

      let cityAdminCreated = false;
      let citizensCreated = 0;
      let unitOfficersCreated = 0;
      let fieldOfficersCreated = 0;
      let issuesCreated = 0;

      // Existing records check for safe additive policy
      const existingUOs = await ctx.db
        .query("unitOfficers")
        .withIndex("by_city", (q) => q.eq("city", cityName))
        .collect();

      const existingFOs = await ctx.db
        .query("fieldOfficers")
        .withIndex("by_city", (q) => q.eq("city", cityName))
        .collect();

      const existingCityAdminProfile = await ctx.db
        .query("cityAdmins")
        .withIndex("by_city", (q) => q.eq("city", cityName))
        .first();

      const existingCityIssues = await ctx.db
        .query("issues")
        .withIndex("by_city", (q) => q.eq("city", cityName))
        .collect();

      // ----------------------------------------------------------------------
      // A. DUMMY CITIZENS SEEDING (3 Citizens per City)
      // ----------------------------------------------------------------------
      const cityCitizenUserIds = [];

      for (let cIdx = 1; cIdx <= 3; cIdx++) {
        const citizenEmail = `citizen.${cityKey}.0${cIdx}.demo@citycare.local`;
        let citizenUser = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", citizenEmail))
          .unique();

        if (!citizenUser) {
          const newUserId = await ctx.db.insert("users", {
            fullName: `Demo Citizen ${cityName} 0${cIdx}`,
            email: citizenEmail,
            password: passwordHash,
            role: "citizen",
            createdAt: new Date(now).toISOString(),
          });
          citizensCreated++;
          citizenUser = { _id: newUserId };
        }

        cityCitizenUserIds.push(citizenUser._id);

        const existingCitizenProfile = await ctx.db
          .query("citizens")
          .withIndex("by_user", (q) => q.eq("userId", citizenUser._id))
          .first();

        if (!existingCitizenProfile) {
          const coords = offsetCoordinates(
            cityConfig.center.latitude,
            cityConfig.center.longitude,
            cIdx
          );
          const area = cityConfig.areas[(cIdx - 1) % cityConfig.areas.length];

          await ctx.db.insert("citizens", {
            userId: citizenUser._id,
            fullName: `Demo Citizen ${cityName} 0${cIdx}`,
            email: citizenEmail,
            phone: `+91987${cityIndex}00${cIdx}0`,
            city: cityName,
            state: cityConfig.state,
            region: area,
            postal: cityConfig.postal,
            fullAddress: `${area} Ward 0${cIdx}, ${cityName}, ${cityConfig.state}`,
            latitude: String(coords.latitude),
            longitude: String(coords.longitude),
            points: 0,
            level: 1,
            levelTitle: "Civic Starter",
            badgeCount: 0,
            reportsSubmitted: 0,
            reportsVerified: 0,
            reportsResolved: 0,
            reportsRejected: 0,
            duplicateReports: 0,
            commentsAdded: 0,
            upvotesReceived: 0,
            videoEvidenceAdded: 0,
            currentStreak: 0,
            longestStreak: 0,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      // ----------------------------------------------------------------------
      // B. UNIT OFFICERS SEEDING (8 UOs per City — 1 per Department)
      // ----------------------------------------------------------------------
      const uoProfileMap = new Map(); // dept -> uoProfile
      const uoUserMap = new Map(); // dept -> uoUserId
      const cityUoProfileIds = [];

      for (let dIdx = 0; dIdx < DEPARTMENTS.length; dIdx++) {
        const dept = DEPARTMENTS[dIdx];
        const deptLabel = DEPARTMENT_LABELS[dept];
        const uoEmail = `uo.${dept}.${cityKey}.demo@citycare.local`;

        let uoUser = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", uoEmail))
          .unique();

        if (!uoUser && existingUOs.length === 0) {
          const newUserId = await ctx.db.insert("users", {
            fullName: `${deptLabel} Ward Officer - ${cityName}`,
            email: uoEmail,
            password: passwordHash,
            role: "unit_officer",
            createdAt: new Date(now).toISOString(),
          });
          uoUser = { _id: newUserId };
        } else if (!uoUser) {
          uoUser = existingUOs.find((u) => u.department === dept);
          if (uoUser) uoUser = { _id: uoUser.userId };
        }

        let uoProfile = null;
        if (uoUser) {
          uoProfile = await ctx.db
            .query("unitOfficers")
            .withIndex("by_user", (q) => q.eq("userId", uoUser._id))
            .first();

          if (!uoProfile && existingUOs.length === 0) {
            const uoProfileId = await ctx.db.insert("unitOfficers", {
              userId: uoUser._id,
              fullName: `${deptLabel} Ward Officer - ${cityName}`,
              email: uoEmail,
              phone: `+91987${cityIndex}00${dIdx + 1}1`,
              state: cityConfig.state,
              city: cityName,
              district: cityConfig.district,
              department: dept,
              totalVerifiedIssues: 0,
              totalRejectedIssues: 0,
              avgResolutionTime: 0,
              accountApproved: true,
              rating: 0,
              efficiencyScore: 0,
              assignedFieldOfficers: [],
              activeIssueIds: [],
              resolvedIssueIds: [],
              mustChangePassword: false,
            });
            unitOfficersCreated++;
            uoProfile = await ctx.db.get(uoProfileId);
          }
        } else if (existingUOs.length > 0) {
          uoProfile = existingUOs.find((u) => u.department === dept) || existingUOs[0];
          uoUser = { _id: uoProfile.userId };
        }

        if (uoProfile && uoUser) {
          uoProfileMap.set(dept, uoProfile);
          uoUserMap.set(dept, uoUser._id);
          if (!cityUoProfileIds.includes(uoProfile._id)) {
            cityUoProfileIds.push(uoProfile._id);
          }
        }
      }

      // ----------------------------------------------------------------------
      // C. FIELD OFFICERS SEEDING (16 FOs per City — 2 per Department)
      // ----------------------------------------------------------------------
      const foProfilesByDept = new Map(); // dept -> [foProfile1, foProfile2]
      const foUsersByDept = new Map(); // dept -> [foUser1, foUser2]
      const cityFoProfileIds = [];

      for (let dIdx = 0; dIdx < DEPARTMENTS.length; dIdx++) {
        const dept = DEPARTMENTS[dIdx];
        const deptLabel = DEPARTMENT_LABELS[dept];
        const uoProfile = uoProfileMap.get(dept);

        const deptFoProfiles = [];
        const deptFoUserIds = [];

        for (let foIdx = 1; foIdx <= 2; foIdx++) {
          const foEmail = `fo.${dept}.0${foIdx}.${cityKey}.demo@citycare.local`;

          let foUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", foEmail))
            .unique();

          if (!foUser && existingFOs.length === 0) {
            const newUserId = await ctx.db.insert("users", {
              fullName: `${deptLabel} Field Officer 0${foIdx} - ${cityName}`,
              email: foEmail,
              password: passwordHash,
              role: "field_officer",
              createdAt: new Date(now).toISOString(),
            });
            foUser = { _id: newUserId };
          }

          let foProfile = null;
          if (foUser) {
            foProfile = await ctx.db
              .query("fieldOfficers")
              .withIndex("by_user", (q) => q.eq("userId", foUser._id))
              .first();

            if (!foProfile && existingFOs.length === 0) {
              const foProfileId = await ctx.db.insert("fieldOfficers", {
                userId: foUser._id,
                fullName: `${deptLabel} Field Officer 0${foIdx} - ${cityName}`,
                email: foEmail,
                phone: `+91987${cityIndex}0${dIdx + 1}${foIdx}2`,
                state: cityConfig.state,
                city: cityName,
                district: cityConfig.district,
                department: dept,
                specialisations: SPECIALISATIONS[dept] || [
                  "General Civic Maintenance",
                ],
                reportingUnitOfficerId: uoProfile ? uoProfile._id : undefined,
                currentActiveIssues: 0,
                maxIssueCapacity: 10,
                assignedIssueIds: [],
                completedIssueIds: [],
                totalResolvedIssues: 0,
                avgResolutionTime: 0,
                onTimeCompletionRate: 0,
                accountApproved: true,
                rating: 0,
                efficiencyScore: 0,
                mustChangePassword: false,
              });
              fieldOfficersCreated++;
              foProfile = await ctx.db.get(foProfileId);
            }
          }

          if (foProfile && foUser) {
            deptFoProfiles.push(foProfile);
            deptFoUserIds.push(foUser._id);
            if (!cityFoProfileIds.includes(foProfile._id)) {
              cityFoProfileIds.push(foProfile._id);
            }
          }
        }

        foProfilesByDept.set(dept, deptFoProfiles);
        foUsersByDept.set(dept, deptFoUserIds);

        // Update corresponding UO profile with assignedFieldOfficers IDs
        if (uoProfile && deptFoProfiles.length > 0) {
          const foIds = deptFoProfiles.map((p) => p._id);
          const currentAssigned = uoProfile.assignedFieldOfficers || [];
          const mergedAssigned = Array.from(
            new Set([...currentAssigned, ...foIds])
          );

          if (mergedAssigned.length !== currentAssigned.length) {
            await ctx.db.patch(uoProfile._id, {
              assignedFieldOfficers: mergedAssigned,
            });
          }
        }
      }

      // ----------------------------------------------------------------------
      // D. CITY ADMIN SEEDING (1 per City)
      // ----------------------------------------------------------------------
      const cityAdminEmail = `cityadmin.${cityKey}.demo@citycare.local`;
      let cityAdminUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", cityAdminEmail))
        .unique();

      if (!cityAdminUser && !existingCityAdminProfile) {
        const newUserId = await ctx.db.insert("users", {
          fullName: `Demo City Admin - ${cityName}`,
          email: cityAdminEmail,
          password: passwordHash,
          role: "city_admin",
          createdAt: new Date(now).toISOString(),
        });
        cityAdminUser = { _id: newUserId };
      }

      let cityAdminProfile = existingCityAdminProfile;
      if (cityAdminUser && !cityAdminProfile) {
        const profileId = await ctx.db.insert("cityAdmins", {
          userId: cityAdminUser._id,
          fullName: `Demo City Admin - ${cityName}`,
          email: cityAdminEmail,
          phone: `+91987${cityIndex}00000`,
          state: cityConfig.state,
          city: cityName,
          managedUnitOfficers: cityUoProfileIds,
          managedFieldOfficers: cityFoProfileIds,
          mustChangePassword: false,
          totalIssuesInCity: 0,
          issuesResolved: 0,
          issuesPending: 0,
          avgResolutionTime: 0,
          slaComplianceRate: 0,
          createdAt: now,
          createdBy: systemAdminUserId,
          notes: "Automatically created CityCare demo account.",
        });
        cityAdminCreated = true;
        cityAdminProfile = await ctx.db.get(profileId);
      } else if (cityAdminProfile) {
        // Ensure managed officer arrays are up to date
        const currentUos = cityAdminProfile.managedUnitOfficers || [];
        const currentFos = cityAdminProfile.managedFieldOfficers || [];
        const newUos = Array.from(new Set([...currentUos, ...cityUoProfileIds]));
        const newFos = Array.from(new Set([...currentFos, ...cityFoProfileIds]));
        await ctx.db.patch(cityAdminProfile._id, {
          managedUnitOfficers: newUos,
          managedFieldOfficers: newFos,
        });
      }

      // ----------------------------------------------------------------------
      // E. ISSUES SEEDING (32 Issues per City — 4 per Department)
      // ----------------------------------------------------------------------
      if (existingCityIssues.length === 0) {
        // Status distribution map across 32 issues (indices 0..31)
        const statusSpecs = [
          { status: "pending" }, // 0
          { status: "verified" }, // 1
          { status: "assigned" }, // 2
          { status: "in_progress" }, // 3
          { status: "pending_uo_verification" }, // 4
          { status: "rework_required" }, // 5
          { status: "resolved", slaOutcome: "within" }, // 6
          { status: "resolved", slaOutcome: "breached", feedback: true }, // 7
          { status: "closed" }, // 8
          { status: "rejected" }, // 9
          { status: "escalated" }, // 10
          { status: "pending" }, // 11
          { status: "verified" }, // 12
          { status: "assigned" }, // 13
          { status: "in_progress" }, // 14
          { status: "pending_uo_verification" }, // 15
          { status: "rework_required" }, // 16
          { status: "resolved", slaOutcome: "within", feedback: true }, // 17
          { status: "resolved", slaOutcome: "breached" }, // 18
          { status: "closed" }, // 19
          { status: "rejected" }, // 20
          { status: "pending" }, // 21
          { status: "verified" }, // 22
          { status: "assigned" }, // 23
          { status: "in_progress" }, // 24
          { status: "pending_uo_verification" }, // 25
          { status: "resolved", slaOutcome: "within", feedback: true }, // 26
          { status: "resolved", slaOutcome: "within" }, // 27
          { status: "closed" }, // 28
          { status: "assigned" }, // 29
          { status: "in_progress" }, // 30
          { status: "pending" }, // 31
        ];

        const priorities = ["low", "medium", "high", "critical"];

        const createdCityIssueIds = [];
        let issueGlobalIndex = 0;

        for (let dIdx = 0; dIdx < DEPARTMENTS.length; dIdx++) {
          const dept = DEPARTMENTS[dIdx];
          const deptTitles = DEMO_TITLES[dept] || DEMO_TITLES.other;
          const uoUserId = uoUserMap.get(dept);
          const deptFoUserIds = foUsersByDept.get(dept) || [];

          for (let issueNum = 1; issueNum <= 4; issueNum++) {
            const specIndex = issueGlobalIndex;
            const code = `DEMO-${cityConfig.codePrefix}-${dept.substring(0, 2).toUpperCase()}-${String(issueNum).padStart(3, "0")}`;
            issueGlobalIndex++;

            // Idempotency check via by_issue_code index
            const existingIssue = await ctx.db
              .query("issues")
              .withIndex("by_issue_code", (q) => q.eq("issueCode", code))
              .first();

            if (existingIssue) {
              createdCityIssueIds.push(existingIssue._id);
              continue;
            }

            const spec = statusSpecs[specIndex % statusSpecs.length];
            const title = deptTitles[(issueNum - 1) % deptTitles.length];
            const area = cityConfig.areas[specIndex % cityConfig.areas.length];
            const coords = offsetCoordinates(
              cityConfig.center.latitude,
              cityConfig.center.longitude,
              specIndex
            );
            const reporterUserId =
              cityCitizenUserIds[specIndex % cityCitizenUserIds.length];

            const foUserId =
              deptFoUserIds.length > 0
                ? deptFoUserIds[(issueNum - 1) % deptFoUserIds.length]
                : null;

            // Spaced creation time over past 90 days
            const daysAgo = Math.max(
              1,
              Math.floor(90 - issueGlobalIndex * 2.7)
            );
            const issueCreatedAt = now - daysAgo * DAY_MS;

            // SLA calculation
            let slaDeadline = issueCreatedAt + 4 * DAY_MS;
            let slaBreached = false;
            let resolvedAt = null;
            let closedAt = null;

            if (spec.slaOutcome === "breached") {
              slaBreached = true;
              slaDeadline = issueCreatedAt + 2 * DAY_MS;
            } else if (spec.status === "in_progress" && daysAgo > 5) {
              slaBreached = true;
              slaDeadline = issueCreatedAt + 3 * DAY_MS;
            }

            if (spec.status === "resolved" || spec.status === "closed") {
              resolvedAt = slaBreached
                ? slaDeadline + 1 * DAY_MS
                : issueCreatedAt + 2 * DAY_MS;
              if (spec.status === "closed") {
                closedAt = resolvedAt + 1 * DAY_MS;
              }
            }

            // Status-dependent officer assignment
            let assignedUO = null;
            let assignedFO = null;

            if (spec.status !== "pending") {
              assignedUO = uoUserId || null;
            }

            if (
              [
                "assigned",
                "in_progress",
                "pending_uo_verification",
                "rework_required",
                "resolved",
                "closed",
                "escalated",
              ].includes(spec.status)
            ) {
              assignedFO = foUserId || null;
            }

            // Verification checklist for verified & above
            let verificationChecklist = undefined;
            if (assignedUO && spec.status !== "pending") {
              verificationChecklist = {
                locationValid: true,
                hasSufficientEvidence: true,
                notDuplicate: true,
                isWithinJurisdiction: true,
                notes: "Verified by Ward Officer.",
                verifiedBy: assignedUO,
                verifiedAt: issueCreatedAt + 30 * 60 * 1000,
              };
            }

            // Escalation metadata
            let escalatedToAdmin = false;
            let escalation = undefined;

            if (spec.status === "escalated") {
              escalatedToAdmin = true;
              escalation = {
                category: "sla_breach",
                priority: "high",
                reason:
                  "Issue handling time exceeded maximum acceptable threshold without resolution.",
                comments: "Escalated for immediate administrative intervention.",
                escalatedBy: uoUserId || systemAdminUserId,
                prevIssueStatus: "in_progress",
                escalatedAt: issueCreatedAt + 3 * DAY_MS,
                resolved: false,
                adminReviewStatus: "pending",
                escalationCount: 1,
              };
            }

            // Rework metadata
            let reworkNote = undefined;
            let reworkReasons = undefined;
            let lastReworkRequestedAt = undefined;

            if (spec.status === "rework_required") {
              reworkNote =
                "Resolution evidence is unclear. Please re-upload clearer after-fix photographs.";
              reworkReasons = ["Incomplete evidence"];
              lastReworkRequestedAt = issueCreatedAt + 2 * DAY_MS;
            }

            // Rejection metadata
            let rejection = undefined;
            if (spec.status === "rejected") {
              rejection = {
                reason: "Outside Municipal Scope",
                comment:
                  "The reported location lies outside city municipal jurisdiction boundaries.",
                rejectedBy: uoUserId || systemAdminUserId,
                rejectedAt: issueCreatedAt + 1 * DAY_MS,
              };
            }

            // Citizen feedback
            let citizenRating = null;
            let citizenFeedback = null;
            if (spec.feedback && (resolvedAt || closedAt)) {
              citizenRating = (issueGlobalIndex % 2 === 0) ? 4.5 : 5.0;
              citizenFeedback =
                "Issue was resolved promptly by the municipal team. Thank you!";
            }

            const priority = priorities[(issueGlobalIndex - 1) % priorities.length];

            const issueId = await ctx.db.insert("issues", {
              issueCode: code,
              title,
              description: `${title} reported at ${area}, ${cityName}. Immediate municipal action is requested by residents.`,
              category: dept,
              department: dept,
              subcategory: [
                SPECIALISATIONS[dept]?.[0] || "General Maintenance",
              ],
              otherCategoryName: null,
              priority,
              tags: [dept, cityName.toLowerCase()],
              latitude: String(coords.latitude),
              longitude: String(coords.longitude),
              address: `${area} Ward ${(issueGlobalIndex % 5) + 1}, ${cityName}, ${cityConfig.state}`,
              city: cityName,
              state: cityConfig.state,
              postal: cityConfig.postal,
              googleMapUrl: `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`,
              reportedBy: reporterUserId,
              isAnonymous: issueGlobalIndex % 4 === 0,
              additionalEmail: null,
              photos: [],
              videos: null,
              status: spec.status,
              assignedUnitOfficer: assignedUO,
              assignedFieldOfficer: assignedFO,
              possibleDuplicateIds: [],
              verificationChecklist,
              reworkNote,
              reworkReasons,
              lastReworkRequestedAt,
              rejection,
              escalatedToAdmin,
              escalation,
              slaCategory: "standard",
              slaDeadline,
              slaBreached,
              resolvedAt,
              closedAt,
              citizenRating,
              citizenFeedback,
              reopenCount: 0,
              reopenReason: null,
              isReopened: false,
              createdAt: issueCreatedAt,
            });

            issuesCreated++;
            createdCityIssueIds.push(issueId);

            // Timeline updates history for seeded issue
            await ctx.db.insert("issueUpdates", {
              issueId,
              status: "pending",
              comment: `Issue reported by citizen. Code: ${code}`,
              updatedBy: reporterUserId,
              role: "citizen",
              attachments: [],
              scope: "officer_and_citizen",
              createdAt: issueCreatedAt,
            });

            if (assignedUO && spec.status !== "pending") {
              await ctx.db.insert("issueUpdates", {
                issueId,
                status: "verified",
                comment: "Issue verified by Ward Officer.",
                updatedBy: assignedUO,
                role: "unit_officer",
                attachments: [],
                scope: "officer_and_citizen",
                createdAt: issueCreatedAt + 30 * 60 * 1000,
              });
            }

            if (assignedFO) {
              await ctx.db.insert("issueUpdates", {
                issueId,
                status: "assigned",
                comment: "Field Officer assigned for resolution.",
                updatedBy: assignedUO || systemAdminUserId,
                role: "unit_officer",
                attachments: [],
                scope: "officer_and_citizen",
                createdAt: issueCreatedAt + 2 * 60 * 60 * 1000,
              });
            }

            if (spec.status === "resolved" || spec.status === "closed") {
              await ctx.db.insert("issueUpdates", {
                issueId,
                status: "resolved",
                comment: "Issue resolution completed and verified.",
                updatedBy: assignedUO || systemAdminUserId,
                role: "unit_officer",
                attachments: [],
                scope: "officer_and_citizen",
                createdAt: resolvedAt || now,
              });
            }
          }
        }

        // Create 1 duplicate pair per city for duplicate analytics testing
        if (createdCityIssueIds.length >= 2) {
          const firstId = createdCityIssueIds[0];
          const secondId = createdCityIssueIds[1];
          await ctx.db.patch(firstId, { possibleDuplicateIds: [secondId] });
          await ctx.db.patch(secondId, { possibleDuplicateIds: [firstId] });
        }
      }

      // ----------------------------------------------------------------------
      // F. RECONCILE OFFICER ARRAYS & CITY ADMIN METRICS
      // ----------------------------------------------------------------------
      const allCityIssuesAfter = await ctx.db
        .query("issues")
        .withIndex("by_city", (q) => q.eq("city", cityName))
        .collect();

      // Reconcile UOs
      for (const uoProfile of uoProfileMap.values()) {
        const uoIssues = allCityIssuesAfter.filter(
          (i) => String(i.assignedUnitOfficer) === String(uoProfile.userId)
        );
        const activeIds = uoIssues
          .filter((i) => !["resolved", "closed", "rejected", "withdrawn"].includes(i.status))
          .map((i) => i._id);
        const resolvedIds = uoIssues
          .filter((i) => ["resolved", "closed"].includes(i.status))
          .map((i) => i._id);

        await ctx.db.patch(uoProfile._id, {
          activeIssueIds: activeIds,
          resolvedIssueIds: resolvedIds,
          totalVerifiedIssues: uoIssues.filter((i) => i.verificationChecklist).length,
          totalRejectedIssues: uoIssues.filter((i) => i.status === "rejected").length,
        });
      }

      // Reconcile FOs
      for (const foList of foProfilesByDept.values()) {
        for (const foProfile of foList) {
          const foIssues = allCityIssuesAfter.filter(
            (i) => String(i.assignedFieldOfficer) === String(foProfile.userId)
          );
          const assignedIds = foIssues
            .filter((i) => !["resolved", "closed", "rejected", "withdrawn"].includes(i.status))
            .map((i) => i._id);
          const completedIds = foIssues
            .filter((i) => ["resolved", "closed"].includes(i.status))
            .map((i) => i._id);

          await ctx.db.patch(foProfile._id, {
            assignedIssueIds: assignedIds,
            completedIssueIds: completedIds,
            currentActiveIssues: assignedIds.length,
            totalResolvedIssues: completedIds.length,
          });
        }
      }

      // Reconcile City Admin profile
      if (cityAdminProfile) {
        const totalCount = allCityIssuesAfter.length;
        const resolvedCount = allCityIssuesAfter.filter((i) =>
          ["resolved", "closed"].includes(i.status)
        ).length;
        const pendingCount = allCityIssuesAfter.filter(
          (i) => !["resolved", "closed", "rejected", "withdrawn"].includes(i.status)
        ).length;
        const breachedCount = allCityIssuesAfter.filter((i) => i.slaBreached).length;
        const slaCompliance =
          totalCount > 0
            ? Math.round(((totalCount - breachedCount) / totalCount) * 100)
            : 100;

        await ctx.db.patch(cityAdminProfile._id, {
          totalIssuesInCity: totalCount,
          issuesResolved: resolvedCount,
          issuesPending: pendingCount,
          slaComplianceRate: slaCompliance,
        });
      }

      // ----------------------------------------------------------------------
      // G. AUDIT SYSTEM SEED EVENT (Only if new records were inserted)
      // ----------------------------------------------------------------------
      if (
        cityAdminCreated ||
        citizensCreated > 0 ||
        unitOfficersCreated > 0 ||
        fieldOfficersCreated > 0 ||
        issuesCreated > 0
      ) {
        await ctx.db.insert("auditLogs", {
          performedByUserId: systemAdminUserId,
          performerRole: "system",
          action: "demo_city_seeded",
          actionCategory: "other",
          affectedEntityType: "system",
          affectedEntityId: undefined,
          city: cityName,
          description: `Demo baseline data seeded for ${cityName} (+${cityAdminCreated ? 1 : 0} City Admin, +${unitOfficersCreated} UOs, +${fieldOfficersCreated} FOs, +${citizensCreated} Citizens, +${issuesCreated} Issues).`,
          source: "system",
          timestamp: now,
        });
      }

      citySummaryResults[cityName] = {
        cityAdminCreated,
        citizensCreated,
        unitOfficersCreated,
        fieldOfficersCreated,
        issuesCreated,
      };
    }

    // ------------------------------------------------------------------------
    // 3. REFRESH OFFICER PERFORMANCE METRICS
    // ------------------------------------------------------------------------
    try {
      await ctx.runMutation(
        internal.officerPerformanceMaintenance.refreshAllOfficerPerformance,
        {}
      );
    } catch {
      // Graceful fallback if scheduler/context does not allow direct invocation
    }

    const totalCreatedCount =
      (systemAdminCreated ? 1 : 0) +
      Object.values(citySummaryResults).reduce(
        (sum, c) =>
          sum +
          (c.cityAdminCreated ? 1 : 0) +
          c.citizensCreated +
          c.unitOfficersCreated +
          c.fieldOfficersCreated +
          c.issuesCreated,
        0
      );

    return {
      success: true,
      systemAdmin: {
        created: systemAdminCreated,
        id: String(systemAdminUserId),
      },
      cities: citySummaryResults,
      alreadySeeded: totalCreatedCount === 0,
    };
  },
});
