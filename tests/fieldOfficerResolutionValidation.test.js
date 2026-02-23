const {
  validateResolutionSubmission,
} = require("@/testUtils/fieldOfficerResolutionValidation");

// Reject if before image missing
describe("Resolution Submission Validation", () => {
  test("Reject if before image missing", () => {
    const result = validateResolutionSubmission({
      beforeImage: null,
      afterImage: "img.jpg",
      note: "Work done",
    });
    expect(result.valid).toBe(false);
  });

  // Reject if after image missing
  test("Reject if after image missing", () => {
    const result = validateResolutionSubmission({
      beforeImage: "before.jpg",
      afterImage: null,
      note: "Work done",
    });
    expect(result.valid).toBe(false);
  });

  // Reject if note missing
  test("Reject if note missing", () => {
    const result = validateResolutionSubmission({
      beforeImage: "before.jpg",
      afterImage: "after.jpg",
      note: null,
    });
    expect(result.valid).toBe(false);
  });

  // Accept if all fields present
  test("Accept if all fields present", () => {
    const result = validateResolutionSubmission({
      beforeImage: "before.jpg",
      afterImage: "after.jpg",
      note: "Work completed",
    });
    expect(result.valid).toBe(true);
  });
});
