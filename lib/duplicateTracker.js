// Haversine Formula for distance (meters) calculations b/w two lat/lon points
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Earth radius in meters
  const R = 6371e3;

  // Convert degrees to radians
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  // Haversine formula
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  // Angular distance in radians
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in meters
  return R * c;
}

// Common stopwords to ignore
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
]);

// Cleans text and returns a set of unique, meaningful words for similarity comparison
function cleanAndTokenize(text) {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "") // removes punctuation
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 2 && // ignores small words
            !STOP_WORDS.has(word),
        ),
    ),
  ];
}

// Returns a similarity score between 0 and 1
function textSimilarity(text1, text2) {
  const words1 = cleanAndTokenize(text1);
  const words2 = cleanAndTokenize(text2);

  if (!words1.length || !words2.length) return 0;

  const common = words1.filter((word) => words2.includes(word));

  return common.length / Math.max(words1.length, words2.length);
}

function subcategoryOverlap(sub1 = [], sub2 = []) {
  return sub1.some((item) => sub2.includes(item));
}

export function duplicateTracker(currentIssue, existingIssues) {
  const matches = [];

  existingIssues.forEach((issue) => {
    let score = 0;
    const reasons = [];

    // Location Proximity
    const distance = calculateDistance(
      parseFloat(currentIssue.latitude),
      parseFloat(currentIssue.longitude),
      parseFloat(issue.latitude),
      parseFloat(issue.longitude),
    );

    if (distance <= 300) {
      score += 55;
      reasons.push("Nearby location (≤300m)");
    }

    // Category match
    if (currentIssue.category === issue.category) {
      score += 15;
      reasons.push("Same category");
    }

    // Subcategory overlap
    if (subcategoryOverlap(currentIssue.subcategory, issue.subcategory)) {
      score += 10;
      reasons.push("Subcategory overlap");
    }

    // Title similarity
    const titleScore = textSimilarity(currentIssue.title, issue.title);

    if (titleScore >= 0.5) {
      score += 10;
      reasons.push("Similar title");
    }

    // Description similarity
    const descScore = textSimilarity(
      currentIssue.description,
      issue.description,
    );

    if (descScore >= 0.4) {
      score += 10;
      reasons.push("Similar description");
    }

    if (score >= 60) {
      matches.push({
        issueId: issue._id,
        score,
        threshold: 60,
        strongDuplicate: score >= 80,
        reasons,
      });
    }
  });

  return matches.sort((a, b) => b.score - a.score);
}
