const { loginUser } = require("@/testUtils/auth");

describe("Authentication Logic", () => {
  test("Login succeeds with valid credentials", async () => {
    const result = await loginUser("valid@email.com", "correctPassword");
    expect(result.success).toBe(true);
  });

  test("Login fails with wrong password", async () => {
    const result = await loginUser("valid@email.com", "wrongPassword");
    expect(result.success).toBe(false);
  });

  test("Login fails with missing fields", async () => {
    const result = await loginUser("", "");
    expect(result.success).toBe(false);
  });
});
