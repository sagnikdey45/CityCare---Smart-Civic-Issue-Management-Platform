const { checkRoutePermission } = require("@/testUtils/rbac");

describe("RBAC Logic", () => {
  // CITIZEN
  test("Citizen can access their dashboard", () => {
    expect(checkRoutePermission("citizen", "/citizen")).toBe(true);
  });

  test("Citizen cannot access Unit Officer dashboard", () => {
    expect(checkRoutePermission("citizen", "/unit-officer")).toBe(false);
  });

  test("Citizen cannot access Field Officer dashboard", () => {
    expect(checkRoutePermission("citizen", "/field-officer")).toBe(false);
  });

  test("Citizen cannot access City Admin dashboard", () => {
    expect(checkRoutePermission("citizen", "/city-admin")).toBe(false);
  });

  // FIELD OFFICER
  test("Field Officer can access their dashboard", () => {
    expect(checkRoutePermission("fieldOfficer", "/field-officer")).toBe(true);
  });

  test("Field Officer cannot access Citizen dashboard", () => {
    expect(checkRoutePermission("fieldOfficer", "/citizen")).toBe(false);
  });

  test("Field Officer cannot access Unit Officer dashboard", () => {
    expect(checkRoutePermission("fieldOfficer", "/unit-officer")).toBe(false);
  });

  // UNIT OFFICER
  test("Unit Officer can access their dashboard", () => {
    expect(checkRoutePermission("unitOfficer", "/unit-officer")).toBe(true);
  });

  test("Unit Officer cannot access Field dashboard", () => {
    expect(checkRoutePermission("unitOfficer", "/field-officer")).toBe(false);
  });

  test("Unit Officer cannot access Citizen dashboard", () => {
    expect(checkRoutePermission("unitOfficer", "/citizen")).toBe(false);
  });

  // AUTH ROUTES
  test("Logged-in users cannot access sign-in", () => {
    expect(checkRoutePermission("citizen", "/sign-in")).toBe(false);
  });

  test("Logged-in users cannot access sign-up", () => {
    expect(checkRoutePermission("unitOfficer", "/sign-up")).toBe(false);
  });

  // INVALID ROLE
  test("Invalid role denied access", () => {
    expect(checkRoutePermission("guest", "/citizen")).toBe(false);
  });
});
