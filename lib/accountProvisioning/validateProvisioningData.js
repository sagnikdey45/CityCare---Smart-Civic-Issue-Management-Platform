import { CANONICAL_DEPARTMENTS } from "./provisioningConstants";
import { generateTemporaryPassword } from "./generateTemporaryPassword";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s]{10,15}$/;

/**
 * Normalizes role string to canonical value or null if invalid
 */
export function normalizeRole(rawRole) {
  if (!rawRole) return null;
  const cleaned = rawRole.toLowerCase().trim().replace(/[\s_\-]+/g, "_");
  if (cleaned === "unit_officer" || cleaned === "unitofficer" || cleaned === "ward_officer") {
    return "unit_officer";
  }
  if (cleaned === "field_officer" || cleaned === "fieldofficer") {
    return "field_officer";
  }
  if (cleaned === "city_admin" || cleaned === "cityadmin") {
    return "city_admin";
  }
  return null;
}

/**
 * Normalizes department string to canonical department or null if invalid
 */
export function normalizeDepartment(rawDept) {
  if (!rawDept) return null;
  const cleaned = rawDept.toLowerCase().trim().replace(/[\s\-\/]+/g, "_");

  // Check alias matches
  if (cleaned.includes("road") || cleaned.includes("infrastruct")) return "road";
  if (cleaned.includes("electr") || cleaned.includes("power")) return "electricity";
  if (cleaned.includes("water") || cleaned.includes("sewag")) return "water";
  if (cleaned.includes("sanitat") || cleaned.includes("waste_manag")) return "sanitation";
  if (cleaned.includes("drain") || cleaned.includes("storm")) return "drainage";
  if (cleaned.includes("solid") || cleaned.includes("garbage")) return "solid_waste";
  if (cleaned.includes("health") || cleaned.includes("hygien")) return "public_health";
  if (cleaned.includes("other") || cleaned.includes("misc")) return "other";

  const directMatch = CANONICAL_DEPARTMENTS.find((d) => d.value === cleaned);
  return directMatch ? directMatch.value : null;
}

/**
 * Validates parsed Officer CSV rows against CityCare business rules
 */
export function validateOfficerRows(rows, referenceData = {}) {
  const existingUODepartments = referenceData.existingUODepartments || [];
  const existingEmails = new Set(
    (referenceData.existingEmails || []).map((e) => e.toLowerCase().trim())
  );

  const seenEmailsInCSV = new Set();
  const seenUOCityDeptInCSV = new Set();

  const validRows = [];
  const invalidRows = [];
  const warningRows = [];

  rows.forEach(({ rowNumber, data }) => {
    const errors = [];
    const warnings = [];

    const fullName = (data.fullName || "").trim();
    const email = (data.email || "").toLowerCase().trim();
    const phone = (data.phone || "").trim();
    const dob = (data.dob || "").trim();
    const state = (data.state || "Uttar Pradesh").trim();
    const city = (data.city || "Varanasi").trim();
    const district = (data.district || city).trim();
    const rawDept = (data.department || "").trim();
    const rawRole = (data.role || "").trim();
    const specialisation = (data.specialisation || "").trim();

    // 1. Full Name check
    if (!fullName) {
      errors.push("Full Name is required");
    }

    // 2. Email format & duplicate checks
    if (!email) {
      errors.push("Email address is required");
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push("Invalid email format");
    } else {
      if (seenEmailsInCSV.has(email)) {
        errors.push("Duplicate email in uploaded CSV");
      } else {
        seenEmailsInCSV.add(email);
      }

      if (existingEmails.has(email)) {
        errors.push("Account with this email already exists in system");
      }
    }

    // 3. Phone validation
    if (!phone) {
      warnings.push("Phone number is recommended");
    } else if (!PHONE_REGEX.test(phone)) {
      warnings.push("Phone number format should be 10 digits");
    }

    // 4. City & State check
    if (!city) errors.push("City is required");
    if (!state) errors.push("State is required");

    // 5. Role validation (STRICT: does NOT default unknown role to unit_officer)
    const normalizedRole = normalizeRole(rawRole);
    if (!rawRole) {
      errors.push("Role is required (unit_officer or field_officer)");
    } else if (!normalizedRole || (normalizedRole !== "unit_officer" && normalizedRole !== "field_officer")) {
      errors.push(`Invalid role "${rawRole}". Must be Unit Officer or Field Officer`);
    }

    // 6. Department validation
    const normalizedDept = normalizeDepartment(rawDept);
    if (!rawDept) {
      errors.push("Department is required");
    } else if (!normalizedDept) {
      errors.push(`Unrecognized department "${rawDept}"`);
    }

    // 7. Unit Officer Uniqueness check (1 active UO per City + Department)
    if (normalizedRole === "unit_officer" && city && normalizedDept) {
      const cityDeptKey = `${city.toLowerCase().trim()}_${normalizedDept}`;

      if (seenUOCityDeptInCSV.has(cityDeptKey)) {
        errors.push(
          `Multiple Unit Officers assigned to ${normalizedDept} in ${city} within this upload`
        );
      } else {
        seenUOCityDeptInCSV.add(cityDeptKey);
      }

      const existingUO = existingUODepartments.find(
        (uo) => uo.city === city.toLowerCase().trim() && uo.department === normalizedDept
      );
      if (existingUO) {
        errors.push(
          `A Unit Officer (${existingUO.fullName}) is already assigned to ${normalizedDept} in ${city}`
        );
      }
    }

    const rowPayload = {
      clientRowId: `row-${rowNumber}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      rowNumber,
      fullName,
      email,
      phone: phone || "9876543210",
      dob,
      state,
      city,
      district,
      department: normalizedDept || rawDept,
      role: normalizedRole || rawRole,
      specialisation,
      tempPassword: generateTemporaryPassword(12),
      validationStatus: errors.length > 0 ? "invalid" : warnings.length > 0 ? "warning" : "valid",
      errors,
      warnings,
    };

    if (errors.length > 0) {
      invalidRows.push(rowPayload);
    } else if (warnings.length > 0) {
      warningRows.push(rowPayload);
      validRows.push(rowPayload);
    } else {
      validRows.push(rowPayload);
    }
  });

  return {
    validRows,
    invalidRows,
    warningRows,
    stats: {
      total: rows.length,
      valid: validRows.length,
      invalid: invalidRows.length,
      warnings: warningRows.length,
    },
  };
}

/**
 * Validates parsed City Admin CSV rows
 */
export function validateCityAdminRows(rows, referenceData = {}) {
  const existingCityAdmins = referenceData.existingCityAdmins || [];
  const existingEmails = new Set(
    (referenceData.existingEmails || []).map((e) => e.toLowerCase().trim())
  );

  const seenEmailsInCSV = new Set();
  const validRows = [];
  const invalidRows = [];
  const warningRows = [];

  rows.forEach(({ rowNumber, data }) => {
    const errors = [];
    const warnings = [];

    const fullName = (data.fullName || "").trim();
    const email = (data.email || "").toLowerCase().trim();
    const phone = (data.phone || "").trim();
    const dob = (data.dob || "").trim();
    const state = (data.state || "Uttar Pradesh").trim();
    const city = (data.city || "Varanasi").trim();

    if (!fullName) errors.push("Full Name is required");

    if (!email) {
      errors.push("Email address is required");
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push("Invalid email format");
    } else {
      if (seenEmailsInCSV.has(email)) {
        errors.push("Duplicate email in uploaded CSV");
      } else {
        seenEmailsInCSV.add(email);
      }

      if (existingEmails.has(email)) {
        errors.push("Account with this email already exists in system");
      }
    }

    if (!city) errors.push("City is required");
    if (!state) errors.push("State is required");

    const rowPayload = {
      clientRowId: `ca-row-${rowNumber}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      rowNumber,
      fullName,
      email,
      phone: phone || "9876543220",
      dob,
      state,
      city,
      tempPassword: generateTemporaryPassword(12),
      validationStatus: errors.length > 0 ? "invalid" : warnings.length > 0 ? "warning" : "valid",
      errors,
      warnings,
    };

    if (errors.length > 0) {
      invalidRows.push(rowPayload);
    } else if (warnings.length > 0) {
      warningRows.push(rowPayload);
      validRows.push(rowPayload);
    } else {
      validRows.push(rowPayload);
    }
  });

  return {
    validRows,
    invalidRows,
    warningRows,
    stats: {
      total: rows.length,
      valid: validRows.length,
      invalid: invalidRows.length,
      warnings: warningRows.length,
    },
  };
}
