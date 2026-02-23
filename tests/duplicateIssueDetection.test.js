const { isDuplicate } = require("@/testUtils/duplicateIssueDetection");

describe("Duplicate Detection Algorithm", () => {
  const baseIssue = {
    lat: 25.3176,
    lon: 82.9739,
    title: "Garbage accumulation near main road",
    category: "Sanitation",
    subcategory: ["overflow"],
  };

  test("Flags duplicate when location, category, subcategory and text match", () => {
    const similarIssue = {
      lat: 25.3177,
      lon: 82.9738,
      title: "Garbage accumulation near main road",
      category: "Sanitation",
      subcategory: ["overflow"],
    };

    expect(isDuplicate(baseIssue, similarIssue)).toBe(true);
  });

  test("Flags duplicate when location and category+subcategory match but text differs", () => {
    const issue = {
      lat: 25.3177,
      lon: 82.9738,
      title: "Waste problem",
      category: "Sanitation",
      subcategory: ["overflow"],
    };

    expect(isDuplicate(baseIssue, issue)).toBe(true);
  });

  test("Flags duplicate when location and text match but category differs", () => {
    const issue = {
      lat: 25.3177,
      lon: 82.9738,
      title: "Garbage accumulation near main road",
      category: "Road",
      subcategory: ["damage"],
    };

    expect(isDuplicate(baseIssue, issue)).toBe(true);
  });

  test("Does NOT flag duplicate if location is far", () => {
    const issue = {
      lat: 30.0,
      lon: 85.0,
      title: "Garbage accumulation near main road",
      category: "Sanitation",
      subcategory: ["overflow"],
    };

    expect(isDuplicate(baseIssue, issue)).toBe(false);
  });

  test("Does NOT flag duplicate if nothing matches", () => {
    const issue = {
      lat: 30.0,
      lon: 85.0,
      title: "Street light broken",
      category: "Lighting",
      subcategory: ["pole"],
    };

    expect(isDuplicate(baseIssue, issue)).toBe(false);
  });
});
