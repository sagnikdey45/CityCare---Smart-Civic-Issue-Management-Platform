// ---------------------------------------------------------
// CityCare Duplicate Issue Detection Algorithm
// ---------------------------------------------------------

// ---------------------------------------------------------
// 1. Distance Calculation
// ---------------------------------------------------------

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;

  const latitude1 = Number(lat1);
  const longitude1 = Number(lon1);
  const latitude2 = Number(lat2);
  const longitude2 = Number(lon2);

  if (
    Number.isNaN(latitude1) ||
    Number.isNaN(longitude1) ||
    Number.isNaN(latitude2) ||
    Number.isNaN(longitude2)
  ) {
    return Infinity;
  }

  const φ1 = (latitude1 * Math.PI) / 180;
  const φ2 = (latitude2 * Math.PI) / 180;
  const Δφ = ((latitude2 - latitude1) * Math.PI) / 180;
  const Δλ = ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ---------------------------------------------------------
// 2. Your CityCare Categories
// ---------------------------------------------------------

export const categories = [
  {
    value: "road",
    label: "Road & Infrastructure",
  },
  {
    value: "electricity",
    label: "Electricity & Lighting",
  },
  {
    value: "water",
    label: "Water Supply",
  },
  {
    value: "sanitation",
    label: "Sanitation & Waste",
  },
  {
    value: "drainage",
    label: "Drainage & Sewer",
  },
  {
    value: "solid_waste",
    label: "Solid Waste Management",
  },
  {
    value: "public_health",
    label: "Public Health",
  },
  {
    value: "other",
    label: "Other",
  },
];

// ---------------------------------------------------------
// 3. Your CityCare Subcategories
// ---------------------------------------------------------

export const subcategory = {
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
};

// ---------------------------------------------------------
// 4. Category Compatibility
// ---------------------------------------------------------
// Used when citizen selects a related category instead of exact category.
// Example:
// "Road flooded due to drain blockage"
// One citizen may choose road, another may choose drainage.

const CATEGORY_COMPATIBILITY = {
  road: ["drainage", "water", "sanitation"],
  electricity: [],
  water: ["drainage", "road", "public_health"],
  sanitation: ["solid_waste", "drainage", "public_health"],
  drainage: ["road", "water", "sanitation"],
  solid_waste: ["sanitation", "public_health"],
  public_health: ["sanitation", "solid_waste", "water"],
  other: [],
};

// ---------------------------------------------------------
// 5. Subcategory Alias Map
// ---------------------------------------------------------
// Main keys are normalized versions of your actual labels.
// Example:
// "Pothole Repair" becomes "pothole_repair" internally.
// But in database you can still store "Pothole Repair".

const SUBCATEGORY_ALIASES = {
  // Road
  pothole_repair: [
    "pothole",
    "potholes",
    "road hole",
    "road holes",
    "broken road",
    "damaged road",
    "road damage",
    "crater",
    "asphalt damage",
  ],

  asphalt_laying: [
    "asphalt",
    "tar",
    "tarring",
    "road laying",
    "road resurfacing",
    "road surface",
    "uneven road",
  ],

  footpath_repair: [
    "footpath",
    "sidewalk",
    "pavement",
    "broken footpath",
    "damaged footpath",
    "pedestrian path",
  ],

  speed_breaker_construction: [
    "speed breaker",
    "speed bump",
    "speed hump",
    "road bump",
    "breaker",
  ],

  road_marking: [
    "road marking",
    "zebra crossing",
    "lane marking",
    "traffic marking",
    "road paint",
    "faded marking",
  ],

  // Electricity
  street_light_repair: [
    "street light",
    "streetlight",
    "lamp post",
    "light pole",
    "road light",
    "public light",
    "broken light",
    "light not working",
    "dark street",
    "darkness",
  ],

  cable_maintenance: [
    "cable",
    "electric cable",
    "wire",
    "wires",
    "loose wire",
    "hanging wire",
    "damaged wire",
    "exposed wire",
  ],

  transformer_inspection: [
    "transformer",
    "electric transformer",
    "faulty transformer",
    "sparking transformer",
    "transformer blast",
  ],

  meter_repair: [
    "meter",
    "electric meter",
    "faulty meter",
    "meter box",
    "meter issue",
  ],

  // Water
  pipeline_repair: [
    "pipeline",
    "pipe",
    "broken pipe",
    "pipe damage",
    "water pipe",
    "pipe burst",
    "burst pipe",
  ],

  leakage_detection: [
    "leakage",
    "water leak",
    "leaking",
    "leak",
    "pipe leak",
    "water seepage",
    "continuous water flow",
  ],

  valve_maintenance: [
    "valve",
    "water valve",
    "broken valve",
    "valve issue",
    "valve leak",
  ],

  tanker_management: [
    "tanker",
    "water tanker",
    "tanker delay",
    "tanker not arrived",
    "water supply tanker",
  ],

  water_quality_testing: [
    "dirty water",
    "contaminated water",
    "bad smell water",
    "muddy water",
    "unsafe water",
    "water quality",
    "polluted water",
  ],

  // Sanitation
  waste_collection: [
    "waste collection",
    "garbage collection",
    "trash collection",
    "waste not collected",
    "garbage not collected",
    "garbage",
    "trash",
    "rubbish",
  ],

  drain_cleaning: [
    "drain cleaning",
    "blocked drain",
    "clogged drain",
    "dirty drain",
    "drain blockage",
    "drain overflow",
  ],

  public_toilet_maintenance: [
    "public toilet",
    "toilet",
    "dirty toilet",
    "broken toilet",
    "toilet maintenance",
    "community toilet",
  ],

  garbage_segregation: [
    "garbage segregation",
    "waste segregation",
    "dry waste",
    "wet waste",
    "mixed waste",
    "segregation",
  ],

  sewage_handling: [
    "sewage",
    "sewerage",
    "sewage overflow",
    "sewage leak",
    "dirty water overflow",
    "sewer smell",
  ],

  // Drainage
  manhole_cleaning: [
    "manhole",
    "open manhole",
    "blocked manhole",
    "dirty manhole",
    "manhole overflow",
    "manhole cleaning",
  ],

  flood_prevention: [
    "flood",
    "flooding",
    "waterlogging",
    "water logged",
    "standing water",
    "rain water",
    "road flooded",
  ],

  storm_water_management: [
    "storm water",
    "rainwater",
    "rain water drain",
    "storm drain",
    "storm water drainage",
  ],

  sewer_line_repair: [
    "sewer line",
    "sewer pipe",
    "sewer damage",
    "broken sewer",
    "sewer repair",
  ],

  // Solid Waste
  dumping_site_management: [
    "dumping site",
    "illegal dumping",
    "waste dumping",
    "garbage dump",
    "open dumping",
    "dump yard",
  ],

  waste_transportation: [
    "waste transportation",
    "garbage vehicle",
    "garbage truck",
    "waste truck",
    "waste vehicle",
    "garbage pickup",
  ],

  recycling_operations: [
    "recycling",
    "recycle",
    "recyclable waste",
    "plastic recycling",
    "waste recycling",
  ],

  // Public Health
  mosquito_control: [
    "mosquito",
    "mosquitoes",
    "mosquito breeding",
    "fogging",
    "dengue",
    "malaria",
    "stagnant water",
  ],

  disinfection: [
    "disinfection",
    "sanitize",
    "sanitization",
    "chemical spray",
    "disinfectant",
    "public sanitization",
  ],

  disease_prevention: [
    "disease",
    "infection",
    "fever",
    "dengue prevention",
    "malaria prevention",
    "health risk",
  ],

  sanitation_inspection: [
    "sanitation inspection",
    "hygiene check",
    "unclean area",
    "dirty area",
    "health inspection",
  ],
};

// ---------------------------------------------------------
// 6. Stop Words
// ---------------------------------------------------------

const STOP_WORDS = new Set([
  "the",
  "is",
  "at",
  "which",
  "on",
  "a",
  "an",
  "and",
  "or",
  "for",
  "to",
  "of",
  "in",
  "near",
  "with",
  "this",
  "that",
  "there",
  "here",
  "from",
  "by",
  "it",
  "be",
  "are",
  "was",
  "were",
  "as",
  "has",
  "have",
  "had",
  "very",
  "please",
  "kindly",
  "urgent",
  "issue",
  "problem",
  "area",
  "location",
  "place",
  "people",
  "residents",
  "citizens",
  "facing",
  "causing",
  "caused",
  "many",
  "some",
  "due",
]);

// ---------------------------------------------------------
// 7. Basic Normalization
// ---------------------------------------------------------

function normalizeLabel(value = "") {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function normalizePhrase(value = "") {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

// ---------------------------------------------------------
// 8. Get Known Subcategory Labels as Normalized Values
// ---------------------------------------------------------

function getKnownSubcategoryMap() {
  const map = {};

  Object.values(subcategory).forEach((items) => {
    items.forEach((label) => {
      const normalized = normalizeLabel(label);
      map[normalized] = label;
    });
  });

  return map;
}

const KNOWN_SUBCATEGORY_MAP = getKnownSubcategoryMap();

// ---------------------------------------------------------
// 9. Normalize Subcategory
// ---------------------------------------------------------
// Accepts:
// "Pothole Repair"
// "pothole repair"
// "pothole"
// "road hole"
// and returns:
// "pothole_repair"

function normalizeSubcategory(value = "") {
  const normalizedLabel = normalizeLabel(value);
  const normalizedPhrase = normalizePhrase(value);

  if (KNOWN_SUBCATEGORY_MAP[normalizedLabel]) {
    return normalizedLabel;
  }

  for (const [mainSubcategory, aliases] of Object.entries(
    SUBCATEGORY_ALIASES,
  )) {
    const normalizedAliases = aliases.map(normalizePhrase);

    if (
      normalizedLabel === mainSubcategory ||
      normalizedAliases.includes(normalizedPhrase)
    ) {
      return mainSubcategory;
    }
  }

  // Important:
  // If you add a new custom subcategory later,
  // it will still be compared after normalization.
  // Example: "Bridge Repair" -> "bridge_repair"
  return normalizedLabel;
}

// ---------------------------------------------------------
// 10. Phrase Normalization for Title and Description
// ---------------------------------------------------------

const PHRASE_NORMALIZATION = [
  // Road
  [/pothole(s)?/g, "pothole_repair"],
  [/road\s*hole(s)?/g, "pothole_repair"],
  [/broken\s*road/g, "pothole_repair"],
  [/damaged\s*road/g, "pothole_repair"],
  [/road\s*damage/g, "pothole_repair"],

  [/asphalt/g, "asphalt_laying"],
  [/road\s*resurfacing/g, "asphalt_laying"],
  [/road\s*surface/g, "asphalt_laying"],
  [/uneven\s*road/g, "asphalt_laying"],

  [/footpath/g, "footpath_repair"],
  [/sidewalk/g, "footpath_repair"],
  [/pavement/g, "footpath_repair"],

  [/speed\s*breaker/g, "speed_breaker_construction"],
  [/speed\s*bump/g, "speed_breaker_construction"],
  [/speed\s*hump/g, "speed_breaker_construction"],

  [/zebra\s*crossing/g, "road_marking"],
  [/lane\s*marking/g, "road_marking"],
  [/road\s*marking/g, "road_marking"],
  [/faded\s*marking/g, "road_marking"],

  // Electricity
  [/street\s*light/g, "street_light_repair"],
  [/streetlight/g, "street_light_repair"],
  [/lamp\s*post/g, "street_light_repair"],
  [/light\s*pole/g, "street_light_repair"],
  [/dark\s*street/g, "street_light_repair"],
  [/broken\s*light/g, "street_light_repair"],
  [/light\s*not\s*working/g, "street_light_repair"],

  [/hanging\s*wire/g, "cable_maintenance"],
  [/loose\s*wire/g, "cable_maintenance"],
  [/exposed\s*wire/g, "cable_maintenance"],
  [/damaged\s*wire/g, "cable_maintenance"],
  [/electric\s*cable/g, "cable_maintenance"],

  [/transformer/g, "transformer_inspection"],
  [/electric\s*meter/g, "meter_repair"],
  [/meter\s*box/g, "meter_repair"],

  // Water
  [/pipe\s*burst/g, "pipeline_repair"],
  [/burst\s*pipe/g, "pipeline_repair"],
  [/broken\s*pipe/g, "pipeline_repair"],
  [/water\s*pipe/g, "pipeline_repair"],
  [/pipeline/g, "pipeline_repair"],

  [/water\s*leakage/g, "leakage_detection"],
  [/pipe\s*leak/g, "leakage_detection"],
  [/water\s*leak/g, "leakage_detection"],
  [/leaking/g, "leakage_detection"],
  [/leakage/g, "leakage_detection"],

  [/water\s*tanker/g, "tanker_management"],
  [/tanker/g, "tanker_management"],

  [/dirty\s*water/g, "water_quality_testing"],
  [/contaminated\s*water/g, "water_quality_testing"],
  [/muddy\s*water/g, "water_quality_testing"],
  [/bad\s*smell\s*water/g, "water_quality_testing"],

  [/water\s*valve/g, "valve_maintenance"],

  // Sanitation
  [/garbage\s*collection/g, "waste_collection"],
  [/waste\s*collection/g, "waste_collection"],
  [/trash\s*collection/g, "waste_collection"],
  [/garbage/g, "waste_collection"],
  [/trash/g, "waste_collection"],
  [/rubbish/g, "waste_collection"],

  [/blocked\s*drain/g, "drain_cleaning"],
  [/clogged\s*drain/g, "drain_cleaning"],
  [/dirty\s*drain/g, "drain_cleaning"],
  [/drain\s*overflow/g, "drain_cleaning"],

  [/public\s*toilet/g, "public_toilet_maintenance"],
  [/community\s*toilet/g, "public_toilet_maintenance"],
  [/dirty\s*toilet/g, "public_toilet_maintenance"],
  [/broken\s*toilet/g, "public_toilet_maintenance"],

  [/waste\s*segregation/g, "garbage_segregation"],
  [/garbage\s*segregation/g, "garbage_segregation"],
  [/mixed\s*waste/g, "garbage_segregation"],

  [/sewage/g, "sewage_handling"],
  [/sewerage/g, "sewage_handling"],
  [/sewer\s*smell/g, "sewage_handling"],
  [/sewage\s*overflow/g, "sewage_handling"],

  // Drainage
  [/open\s*manhole/g, "manhole_cleaning"],
  [/blocked\s*manhole/g, "manhole_cleaning"],
  [/dirty\s*manhole/g, "manhole_cleaning"],
  [/manhole/g, "manhole_cleaning"],

  [/water\s*logging/g, "flood_prevention"],
  [/waterlogging/g, "flood_prevention"],
  [/flooding/g, "flood_prevention"],
  [/flood/g, "flood_prevention"],
  [/standing\s*water/g, "flood_prevention"],

  [/storm\s*water/g, "storm_water_management"],
  [/rain\s*water\s*drain/g, "storm_water_management"],
  [/storm\s*drain/g, "storm_water_management"],

  [/sewer\s*line/g, "sewer_line_repair"],
  [/sewer\s*pipe/g, "sewer_line_repair"],
  [/broken\s*sewer/g, "sewer_line_repair"],

  // Solid Waste
  [/dumping\s*site/g, "dumping_site_management"],
  [/illegal\s*dumping/g, "dumping_site_management"],
  [/garbage\s*dump/g, "dumping_site_management"],
  [/open\s*dumping/g, "dumping_site_management"],

  [/garbage\s*truck/g, "waste_transportation"],
  [/waste\s*truck/g, "waste_transportation"],
  [/garbage\s*vehicle/g, "waste_transportation"],
  [/waste\s*vehicle/g, "waste_transportation"],

  [/recycling/g, "recycling_operations"],
  [/recycle/g, "recycling_operations"],

  // Public Health
  [/mosquito(es)?/g, "mosquito_control"],
  [/mosquito\s*breeding/g, "mosquito_control"],
  [/fogging/g, "mosquito_control"],
  [/dengue/g, "mosquito_control"],
  [/malaria/g, "mosquito_control"],
  [/stagnant\s*water/g, "mosquito_control"],

  [/disinfection/g, "disinfection"],
  [/sanitization/g, "disinfection"],
  [/sanitize/g, "disinfection"],
  [/chemical\s*spray/g, "disinfection"],

  [/disease/g, "disease_prevention"],
  [/infection/g, "disease_prevention"],
  [/health\s*risk/g, "disease_prevention"],
  [/fever/g, "disease_prevention"],

  [/sanitation\s*inspection/g, "sanitation_inspection"],
  [/hygiene\s*check/g, "sanitation_inspection"],
  [/dirty\s*area/g, "sanitation_inspection"],
  [/unclean\s*area/g, "sanitation_inspection"],
];

// ---------------------------------------------------------
// 11. Normalize Title and Description
// ---------------------------------------------------------

function normalizeText(text = "") {
  let normalized = normalizePhrase(text);

  PHRASE_NORMALIZATION.forEach(([pattern, replacement]) => {
    normalized = normalized.replace(pattern, replacement);
  });

  return normalized.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------
// 12. Tokenization
// ---------------------------------------------------------

function cleanAndTokenize(text = "") {
  return [
    ...new Set(
      normalizeText(text)
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
    ),
  ];
}

// ---------------------------------------------------------
// 13. Similarity Functions
// ---------------------------------------------------------

function jaccardSimilarity(words1, words2) {
  if (!words1.length || !words2.length) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const commonWords = [...set1].filter((word) => set2.has(word));
  const unionWords = new Set([...set1, ...set2]);

  return commonWords.length / unionWords.size;
}

function overlapSimilarity(words1, words2) {
  if (!words1.length || !words2.length) return 0;

  const smaller = words1.length <= words2.length ? words1 : words2;
  const larger = new Set(words1.length <= words2.length ? words2 : words1);

  const commonWords = smaller.filter((word) => larger.has(word));

  return commonWords.length / smaller.length;
}

function textSimilarity(text1 = "", text2 = "") {
  const words1 = cleanAndTokenize(text1);
  const words2 = cleanAndTokenize(text2);

  if (!words1.length || !words2.length) {
    return {
      score: 0,
      percentage: 0,
      commonWords: [],
      words1,
      words2,
    };
  }

  const commonWords = words1.filter((word) => words2.includes(word));

  const jaccard = jaccardSimilarity(words1, words2);
  const overlap = overlapSimilarity(words1, words2);

  const finalScore = jaccard * 0.6 + overlap * 0.4;

  return {
    score: Number(finalScore.toFixed(2)),
    percentage: Math.round(finalScore * 100),
    commonWords,
    words1,
    words2,
  };
}

// ---------------------------------------------------------
// 14. Location Score
// ---------------------------------------------------------

function getLocationScore(distance) {
  if (distance <= 100) {
    return {
      score: 50,
      reason: `Very nearby location (${Math.round(distance)}m away)`,
    };
  }

  if (distance <= 200) {
    return {
      score: 40,
      reason: `Nearby location (${Math.round(distance)}m away)`,
    };
  }

  if (distance <= 300) {
    return {
      score: 30,
      reason: `Close location (${Math.round(distance)}m away)`,
    };
  }

  return {
    score: 0,
    reason: null,
  };
}

// ---------------------------------------------------------
// 15. Category Score
// ---------------------------------------------------------
// Here category is expected as:
// "road", "electricity", "water", etc.

function getCategoryScore(currentCategory, existingCategory) {
  if (!currentCategory || !existingCategory) {
    return {
      score: 0,
      reason: null,
    };
  }

  const current = normalizeLabel(currentCategory);
  const existing = normalizeLabel(existingCategory);

  if (current === existing) {
    return {
      score: 15,
      reason: "Same category",
    };
  }

  const relatedCategories = CATEGORY_COMPATIBILITY[current] || [];

  if (relatedCategories.includes(existing)) {
    return {
      score: 7,
      reason: "Related category",
    };
  }

  return {
    score: 0,
    reason: null,
  };
}

// ---------------------------------------------------------
// 16. Subcategory Score
// ---------------------------------------------------------
// Here subcategories are expected as labels:
// ["Pothole Repair", "Footpath Repair"]
//
// Additional new labels are also supported.
// Example:
// ["Bridge Repair"] will internally become "bridge_repair".

function getSubcategoryScore(
  currentSubcategories = [],
  existingSubcategories = [],
) {
  const currentList = Array.isArray(currentSubcategories)
    ? currentSubcategories
    : [currentSubcategories];

  const existingList = Array.isArray(existingSubcategories)
    ? existingSubcategories
    : [existingSubcategories];

  const normalizedCurrent = currentList
    .filter(Boolean)
    .map(normalizeSubcategory);

  const normalizedExisting = existingList
    .filter(Boolean)
    .map(normalizeSubcategory);

  const existingSet = new Set(normalizedExisting);

  const matchedNormalizedSubcategories = normalizedCurrent.filter((item) =>
    existingSet.has(item),
  );

  const matchedLabels = matchedNormalizedSubcategories.map((item) => {
    return KNOWN_SUBCATEGORY_MAP[item] || item.replace(/_/g, " ");
  });

  if (matchedNormalizedSubcategories.length > 0) {
    return {
      score: 10,
      reason: `Matching subcategory: ${matchedLabels.join(", ")}`,
      matchedSubcategories: matchedLabels,
      matchedNormalizedSubcategories,
    };
  }

  return {
    score: 0,
    reason: null,
    matchedSubcategories: [],
    matchedNormalizedSubcategories: [],
  };
}

// ---------------------------------------------------------
// 17. Duplicate Level
// ---------------------------------------------------------

export function getDuplicateLevel(score) {
  if (score >= 90) return "Almost Certain Duplicate";
  if (score >= 80) return "Strong Duplicate";
  if (score >= 60) return "Possible Duplicate";
  return "Not Duplicate";
}

// ---------------------------------------------------------
// 18. Main Duplicate Tracker
// ---------------------------------------------------------

export function duplicateTracker(currentIssue, existingIssues = []) {
  const matches = [];

  if (!currentIssue || !Array.isArray(existingIssues)) {
    return matches;
  }

  existingIssues.forEach((issue) => {
    let score = 0;
    const reasons = [];

    if (currentIssue._id && issue._id && currentIssue._id === issue._id) {
      return;
    }

    const distance = calculateDistance(
      currentIssue.latitude,
      currentIssue.longitude,
      issue.latitude,
      issue.longitude,
    );

    if (!Number.isFinite(distance)) {
      return;
    }

    const locationResult = getLocationScore(distance);

    if (locationResult.score > 0) {
      score += locationResult.score;
      reasons.push(locationResult.reason);
    }

    const categoryResult = getCategoryScore(
      currentIssue.category,
      issue.category,
    );

    if (categoryResult.score > 0) {
      score += categoryResult.score;
      reasons.push(categoryResult.reason);
    }

    const subcategoryResult = getSubcategoryScore(
      currentIssue.subcategory,
      issue.subcategory,
    );

    if (subcategoryResult.score > 0) {
      score += subcategoryResult.score;
      reasons.push(subcategoryResult.reason);
    }

    const titleResult = textSimilarity(currentIssue.title, issue.title);

    if (titleResult.score >= 0.45) {
      const titlePoints = Math.round(titleResult.score * 15);
      score += titlePoints;
      reasons.push(`Similar title (${titleResult.percentage}%)`);
    }

    const descriptionResult = textSimilarity(
      currentIssue.description,
      issue.description,
    );

    if (descriptionResult.score >= 0.35) {
      const descriptionPoints = Math.round(descriptionResult.score * 13);
      score += descriptionPoints;
      reasons.push(`Similar description (${descriptionResult.percentage}%)`);
    }

    if (
      distance <= 200 &&
      categoryResult.score >= 15 &&
      subcategoryResult.score > 0
    ) {
      score += 5;
      reasons.push("Strong location-category-subcategory match");
    }

    score = Math.min(score, 100);

    if (score >= 60) {
      matches.push({
        issueId: issue._id,
        score,
        threshold: 60,
        duplicateLevel: getDuplicateLevel(score),
        strongDuplicate: score >= 80,
        almostCertainDuplicate: score >= 90,
        distance: Math.round(distance),
        reasons,
        debug: {
          locationScore: locationResult.score,
          categoryScore: categoryResult.score,
          subcategoryScore: subcategoryResult.score,
          titleSimilarity: titleResult,
          descriptionSimilarity: descriptionResult,
          matchedSubcategories: subcategoryResult.matchedSubcategories,
          matchedNormalizedSubcategories:
            subcategoryResult.matchedNormalizedSubcategories,
        },
      });
    }
  });

  return matches.sort((a, b) => b.score - a.score);
}
