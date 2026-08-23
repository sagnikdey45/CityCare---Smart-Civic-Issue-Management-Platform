/**
 * Audit Formatters & Sanitization Helpers
 */

const SENSITIVE_KEYS = ["password", "token", "secret", "otp", "hash", "key", "auth"];

/**
 * Recursively sanitize objects/arrays to strip sensitive credentials or secret keys
 */
export function sanitizeAuditValue(value) {
  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    // If string itself contains sensitive patterns
    if (SENSITIVE_KEYS.some((k) => value.toLowerCase().includes(k) && value.length > 20)) {
      return "[REDACTED]";
    }
    return value;
  }

  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditValue(item));
  }

  const sanitized = {};
  for (const [key, val] of Object.entries(value)) {
    const isSensitiveKey = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));
    if (isSensitiveKey) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeAuditValue(val);
    }
  }

  return sanitized;
}

/**
 * Format timestamp to localized string
 */
export function formatAuditDate(timestamp) {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Format Role Display Label
 */
export function formatRoleLabel(role) {
  if (!role) return "System";
  const roleMap = {
    citizen: "Citizen",
    unit_officer: "Unit Officer",
    field_officer: "Field Officer",
    city_admin: "City Admin",
    admin: "System Admin",
    system: "System",
  };
  return roleMap[role.toLowerCase()] || role;
}

/**
 * Format Department Display Label
 */
export function formatDepartmentLabel(dept) {
  if (!dept) return "General";
  const deptMap = {
    road: "Road & Infrastructure",
    roads: "Road & Infrastructure",
    electricity: "Electricity & Lighting",
    water: "Water Supply",
    sanitation: "Public Sanitation",
    drainage: "Drainage & Sewerage",
    solid_waste: "Solid Waste Management",
    public_health: "Public Health",
    other: "Other Maintenance",
  };
  const key = String(dept).toLowerCase().trim();
  return (
    deptMap[key] ||
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

/**
 * Export Audit Logs to CSV file
 */
export function exportAuditLogsToCSV(logs, filename = "CityCare_Audit_Logs.csv") {
  if (!logs || !logs.length) return;

  const headers = [
    "Timestamp",
    "Actor",
    "Role",
    "Action",
    "Category",
    "Issue Code",
    "Issue Title",
    "City",
    "Department",
    "Source",
    "Reason",
    "Description",
    "Old Value",
    "New Value",
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const cleanStr = String(typeof str === "object" ? JSON.stringify(str) : str).replace(/"/g, '""');
    return `"${cleanStr}"`;
  };

  const rows = logs.map((log) => [
    escapeCSV(formatAuditDate(log.timestamp)),
    escapeCSV(log.performer?.name || "System"),
    escapeCSV(formatRoleLabel(log.performer?.role)),
    escapeCSV(log.actionFormatted || log.action),
    escapeCSV(log.actionCategory),
    escapeCSV(log.issueCode || "N/A"),
    escapeCSV(log.issueTitle || "N/A"),
    escapeCSV(log.city || "Global"),
    escapeCSV(formatDepartmentLabel(log.department)),
    escapeCSV(log.source ? log.source.toUpperCase() : "WEB"),
    escapeCSV(log.reason || ""),
    escapeCSV(log.description || ""),
    escapeCSV(sanitizeAuditValue(log.oldValue)),
    escapeCSV(sanitizeAuditValue(log.newValue)),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
