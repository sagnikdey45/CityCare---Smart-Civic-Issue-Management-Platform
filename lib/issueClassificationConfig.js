import {
  MapPin,
  Zap,
  Droplets,
  Trash2,
  Recycle,
  Package,
  HeartPulse,
  MoreHorizontal,
} from "lucide-react";

export const ISSUE_CATEGORIES = [
  {
    value: "road",
    label: "Road & Infrastructure",
    icon: MapPin,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "electricity",
    label: "Electricity & Lighting",
    icon: Zap,
    color: "text-yellow-600 dark:text-yellow-400",
  },
  {
    value: "water",
    label: "Water Supply",
    icon: Droplets,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  {
    value: "sanitation",
    label: "Sanitation & Waste",
    icon: Trash2,
    color: "text-green-600 dark:text-green-400",
  },
  {
    value: "drainage",
    label: "Drainage & Sewer",
    icon: Recycle,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    value: "solid_waste",
    label: "Solid Waste Management",
    icon: Package,
    color: "text-orange-600 dark:text-orange-400",
  },
  {
    value: "public_health",
    label: "Public Health",
    icon: HeartPulse,
    color: "text-red-600 dark:text-red-400",
  },
  {
    value: "other",
    label: "Other",
    icon: MoreHorizontal,
    color: "text-slate-650 dark:text-slate-400",
  },
];

export const ISSUE_SUBCATEGORIES = {
  sanitation: [
    "Waste Collection",
    "Drain Cleaning",
    "Public Toilet Maintenance",
    "Garbage Segregation",
    "Sewage Handling",
  ],
  road: [
    "Pothole Repair",
    "Asphalt Laying",
    "Footpath Repair",
    "Speed Breaker Construction",
    "Road Marking",
  ],
  water: [
    "Pipeline Repair",
    "Leakage Detection",
    "Valve Maintenance",
    "Tanker Management",
    "Water Quality Testing",
  ],
  electricity: [
    "Street Light Repair",
    "Cable Maintenance",
    "Transformer Inspection",
    "Meter Repair",
  ],
  drainage: [
    "Manhole Cleaning",
    "Flood Prevention",
    "Storm Water Management",
    "Sewer Line Repair",
  ],
  solid_waste: [
    "Dumping Site Management",
    "Waste Transportation",
    "Recycling Operations",
  ],
  public_health: [
    "Mosquito Control",
    "Disinfection",
    "Disease Prevention",
    "Sanitation Inspection",
  ],
  other: [],
};
