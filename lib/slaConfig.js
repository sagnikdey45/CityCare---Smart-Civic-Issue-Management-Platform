export const SLA_CONFIGURATIONS = [
  {
    category: "Roads & Infrastructure",
    subcategory: "Pothole",
    severityLevels: { critical: 24, high: 48, medium: 72, low: 120 },
  },
  {
    category: "Roads & Infrastructure",
    subcategory: "Street Light",
    severityLevels: { critical: 12, high: 24, medium: 48, low: 72 },
  },
  {
    category: "Roads & Infrastructure",
    subcategory: "Road Damage",
    severityLevels: { critical: 12, high: 24, medium: 48, low: 96 },
  },
  {
    category: "Sanitation",
    subcategory: "Garbage Collection",
    severityLevels: { critical: 6, high: 12, medium: 24, low: 48 },
  },
  {
    category: "Sanitation",
    subcategory: "Drainage Issue",
    severityLevels: { critical: 12, high: 24, medium: 48, low: 72 },
  },
  {
    category: "Sanitation",
    subcategory: "Public Toilet",
    severityLevels: { critical: 6, high: 12, medium: 24, low: 48 },
  },
  {
    category: "Water Supply",
    subcategory: "No Water",
    severityLevels: { critical: 6, high: 12, medium: 24, low: 48 },
  },
  {
    category: "Water Supply",
    subcategory: "Leakage",
    severityLevels: { critical: 12, high: 24, medium: 48, low: 72 },
  },
  {
    category: "Water Supply",
    subcategory: "Contamination",
    severityLevels: { critical: 2, high: 6, medium: 12, low: 24 },
  },
  {
    category: "Public Safety",
    subcategory: "Illegal Activity",
    severityLevels: { critical: 2, high: 6, medium: 12, low: 24 },
  },
  {
    category: "Public Safety",
    subcategory: "Stray Animals",
    severityLevels: { critical: 12, high: 24, medium: 48, low: 72 },
  },
  {
    category: "Parks & Recreation",
    subcategory: "Equipment Damage",
    severityLevels: { critical: 48, high: 72, medium: 120, low: 168 },
  },
  {
    category: "Parks & Recreation",
    subcategory: "Maintenance",
    severityLevels: { critical: 48, high: 72, medium: 120, low: 168 },
  },
];

export const CATEGORIES = [
  {
    name: "Roads & Infrastructure",
    subcategories: [
      "Pothole",
      "Street Light",
      "Road Damage",
      "Traffic Signal",
      "Sidewalk",
    ],
  },
  {
    name: "Sanitation",
    subcategories: [
      "Garbage Collection",
      "Drainage Issue",
      "Public Toilet",
      "Waste Management",
    ],
  },
  {
    name: "Water Supply",
    subcategories: ["No Water", "Leakage", "Contamination", "Pipeline Issue"],
  },
  {
    name: "Public Safety",
    subcategories: [
      "Illegal Activity",
      "Stray Animals",
      "Building Safety",
      "Fire Hazard",
    ],
  },
  {
    name: "Parks & Recreation",
    subcategories: [
      "Equipment Damage",
      "Maintenance",
      "Vandalism",
      "Cleanliness",
    ],
  },
  {
    name: "Electricity",
    subcategories: [
      "Power Outage",
      "Cable Issue",
      "Transformer Problem",
      "Meter Issue",
    ],
  },
];

export function getSLADeadline(category, subcategory, severity, createdAt) {
  const config = SLA_CONFIGURATIONS.find(
    (c) => c.category === category && c.subcategory === subcategory,
  );

  const hours = config?.severityLevels[severity] || 72;

  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

export function calculateSLAStatus(slaDeadline) {
  if (!slaDeadline) {
    return { status: "on_track", hoursRemaining: 0, percentageRemaining: 100 };
  }

  const now = new Date();
  const deadline = new Date(slaDeadline);
  const hoursRemaining =
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  const config = SLA_CONFIGURATIONS[0];
  const totalHours = config?.severityLevels.medium || 72;
  const percentageRemaining = (hoursRemaining / totalHours) * 100;

  if (hoursRemaining < 0) {
    return {
      status: "breached",
      hoursRemaining: Math.abs(hoursRemaining),
      percentageRemaining: 0,
    };
  }

  if (percentageRemaining <= 20) {
    return { status: "at_risk", hoursRemaining, percentageRemaining };
  }

  return { status: "on_track", hoursRemaining, percentageRemaining };
}

export function formatTimeRemaining(hours, status) {
  const absHours = Math.abs(hours);

  if (absHours < 1) {
    const minutes = Math.floor(absHours * 60);
    return status === "breached"
      ? `${minutes}m overdue`
      : `${minutes}m remaining`;
  }

  if (absHours < 24) {
    return status === "breached"
      ? `${Math.floor(absHours)}h overdue`
      : `${Math.floor(absHours)}h remaining`;
  }

  const days = Math.floor(absHours / 24);
  const remainingHours = Math.floor(absHours % 24);

  return status === "breached"
    ? `${days}d ${remainingHours}h overdue`
    : `${days}d ${remainingHours}h remaining`;
}
