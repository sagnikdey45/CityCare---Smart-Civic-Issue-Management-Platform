function validateIssueForm(issue) {
  // Basic validation for mandatory fields and description length
  if (
    !issue ||
    !issue.title ||
    !issue.description ||
    !issue.location ||
    !issue.category ||
    !Array.isArray(issue.subcategory) ||
    issue.subcategory.length === 0 ||
    !Array.isArray(issue.photos) ||
    issue.photos.length === 0
  ) {
    return { valid: false, message: "Mandatory fields missing" };
  }
  // Validate description length
  if (issue.description.length > 1000) {
    return {
      valid: false,
      message: "Description exceeds 1000 character limit",
    };
  }

  return { valid: true };
}

module.exports = {
  validateIssueForm,
};
