const { validateIssueForm } = require("@/testUtils/issueValidations");

describe("Issue Form Validation", () => {
  test("Reject form when mandatory fields are missing", () => {
    const result = validateIssueForm({
      title: "",
      description: "",
      location: "",
      category: "",
      subcategory: [],
      photos: [],
    });

    expect(result.valid).toBe(false);
  });

  test("Reject description exceeding 1000 characters", () => {
    const longText = "a".repeat(1001);

    const result = validateIssueForm({
      title: "Garbage Issue",
      description: longText,
      location: "Varanasi",
      category: "waste",
      subcategory: ["overflow"],
      photos: ["image1.jpg"],
    });

    expect(result.valid).toBe(false);
  });

  test("Accept valid issue form", () => {
    const result = validateIssueForm({
      title: "Garbage Accumulation",
      description: "There is garbage near the main road.",
      location: "Varanasi",
      category: "waste",
      subcategory: ["overflow"],
      photos: ["image1.jpg"],
    });

    expect(result.valid).toBe(true);
  });
});
