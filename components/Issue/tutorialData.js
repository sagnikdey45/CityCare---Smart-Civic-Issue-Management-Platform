export const tutorialSteps = [
  // Navbar & Intro
  {
    target: '[data-tutorial="navbar-logo"]',
    title: "Welcome to CityCare",
    description: "Thank you for helping us build a better city. This quick guide will walk you through the reporting process.",
    formStep: 1,
    position: "bottom",
  },
  {
    target: '[data-tutorial="navbar-status"]',
    title: "Report Status",
    description: "This indicator shows you're in the middle of creating a high-impact civic report.",
    formStep: 1,
    position: "bottom",
  },
  
  // Step 1: Details
  {
    target: '[data-tutorial="details-title"]',
    title: "Issue Title",
    description: "Start with a clear, concise title. For example: 'Broken street light at 5th Ave'.",
    formStep: 1,
    position: "bottom",
  },
  {
    target: '[data-tutorial="details-description"]',
    title: "Detailed Description",
    description: "Provide as much detail as possible. Mention landmarks, duration, and the urgency of the matter.",
    formStep: 1,
    position: "bottom",
  },
  {
    target: '[data-tutorial="details-category"]',
    title: "Select Category",
    description: "Choose the department that should handle this. Each category has its own specialized officers.",
    formStep: 1,
    position: "bottom",
  },
  {
    target: '[data-tutorial="details-severity"]',
    title: "Severity Level",
    description: "Help us prioritize. High severity issues like large leaks or dangerous hazards are handled instantly.",
    formStep: 1,
    position: "top",
  },
  {
    target: '[data-tutorial="details-subcategory"]',
    title: "Specific Classification",
    description: "Add tags or subcategories to help our team route this to the right field experts.",
    formStep: 1,
    position: "top",
  },
  {
    target: '[data-tutorial="details-media"]',
    title: "Photo & Video Evidence",
    description: "A picture is worth a thousand words. Upload clear photos and videos to speed up verification.",
    formStep: 1,
    position: "top",
  },

  // Step 2: Location
  {
    target: '[data-tutorial="location-search"]',
    title: "Find the Location",
    description: "Search for an address or intersection. We use Google Places for high accuracy.",
    formStep: 2,
    position: "bottom",
  },
  {
    target: '[data-tutorial="location-current"]',
    title: "Instant Location",
    description: "On site? Tap here to use your device's GPS to pinpoint the exact spot immediately.",
    formStep: 2,
    position: "bottom",
  },
  {
    target: '[data-tutorial="location-map"]',
    title: "Interactive Map",
    description: "You can drag the pin manually on the map to get the coordinates exactly right.",
    formStep: 2,
    position: "top",
  },

  // Step 3: Privacy
  {
    target: '[data-tutorial="anonymity-toggle"]',
    title: "Anonymity Control",
    description: "Toggle this if you'd like to remain anonymous to the public while still earning CityPoints.",
    formStep: 3,
    position: "bottom",
  },
  {
    target: '[data-tutorial="anonymity-email"]',
    title: "Contact Info",
    description: "Optional, but recommended. We'll send you real-time status updates as your report is resolved.",
    formStep: 3,
    position: "top",
  },

  // Step 4: Preview & Submit
  {
    target: '[data-tutorial="preview-btn"]',
    title: "Review & Submit",
    description: "Continue to the final step to double-check all your information before sending.",
    formStep: 3,
    position: "top",
  },
];
