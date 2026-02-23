function validateResolutionSubmission(data) {
  if (!data.beforeImage || !data.afterImage || !data.note) {
    return { valid: false };
  }
  return { valid: true };
}

module.exports = {
  validateResolutionSubmission,
};
