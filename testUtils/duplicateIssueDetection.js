function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateDuplicateScore(issue1, issue2) {
  let score = 0;

  // Location (55%)

  const distance = haversineDistance(
    issue1.lat,
    issue1.lon,
    issue2.lat,
    issue2.lon,
  );

  // Within 1 km considered same locality
  if (distance <= 1) {
    score += 55;
  }

  // Category + Subcategory (25%)
  let categoryScore = 0;

  if (issue1.category === issue2.category) {
    categoryScore += 15; // category portion
  }

  if (
    Array.isArray(issue1.subcategory) &&
    Array.isArray(issue2.subcategory) &&
    issue1.subcategory.some((sub) => issue2.subcategory.includes(sub))
  ) {
    categoryScore += 10; // subcategory portion
  }

  score += categoryScore;

  // Text Similarity (20%)
  if (
    issue1.title &&
    issue2.title &&
    issue1.title.toLowerCase() === issue2.title.toLowerCase()
  ) {
    score += 20;
  }

  return score; // Returns value out of 100
}

// Helper to check duplicate directly
function isDuplicate(issue1, issue2) {
  const score = calculateDuplicateScore(issue1, issue2);
  return score >= 70;
}

module.exports = {
  haversineDistance,
  calculateDuplicateScore,
  isDuplicate,
};
