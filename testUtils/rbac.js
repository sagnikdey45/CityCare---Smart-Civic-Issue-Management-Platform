function checkRoutePermission(role, route) {
  const accessControl = {
    citizen: "/citizen",
    unitOfficer: "/unit-officer",
    fieldOfficer: "/field-officer",
    cityAdmin: "/city-admin",
  };

  if (!role || !route) return false;

  const userBaseRoute = accessControl[role];

  if (!userBaseRoute) return false;

  // Prevent logged-in users from accessing auth routes
  if (route === "/sign-in" || route === "/sign-up") {
    return false;
  }

  // Allow only their own dashboard & subroutes
  return route.startsWith(userBaseRoute);
}

module.exports = {
  checkRoutePermission,
};
