const { isSessionValid } = require("@/testUtils/userSession");

describe("Session Timeout Logic", () => {
  // Showing the session validity logic with fixed timestamps for testing

  // Valid session within 24 hours
  test("Session valid within 24 hours", () => {
    const valid = isSessionValid("2026-02-21T18:30:00", "2026-02-22T17:30:00");
    expect(valid).toBe(true);
  });

  // Invalid session after 24 hours
  test("Session invalid after 24 hours", () => {
    const valid = isSessionValid("2026-02-21T18:30:00", "2026-02-22T19:30:00");
    expect(valid).toBe(false);
  });
});
