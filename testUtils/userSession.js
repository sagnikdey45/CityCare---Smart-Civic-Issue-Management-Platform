function isSessionValid(loginTime, currentTime) {
  const login = new Date(loginTime).getTime();
  const current = new Date(currentTime).getTime();
  const diffHours = (current - login) / (1000 * 60 * 60);

  return diffHours <= 24;
}

module.exports = { isSessionValid };
