/**
 * Map raw public issues from Convex query getCityPublicIssues to normalized
 * display objects consumable by Public Moderation web cards and modals.
 */
export const mapToMobilePublicIssues = (issues = []) => {
  return (issues || []).map((issue, index) => {
    const isResolved = issue.status === "resolved";
    const isRejected = issue.status === "rejected";

    return {
      id: issue.id || `PUB-${String(index + 1).padStart(3, "0")}`,
      original_issue_id: issue.issueCode,

      title: issue.title,
      category: issue.category,

      ward: issue.ward || issue.city,
      location: `${issue.address || ""}${issue.address && issue.city ? ", " : ""}${issue.city || ""}`,

      status: isResolved ? "Resolved" : "Rejected",

      description: issue.description,
      summary: issue.publicCompletionNote || "",

      before_images: issue.photosBefore || [],
      after_images: issue.photosAfter || [],

      created_at: issue.createdAt,
      reviewed_at: issue.reviewedAt || undefined,

      resolved_by:
        issue.resolvedBy || "Field Officer Team — CityCare Department",
      resolved_date:
        isResolved && issue.resolvedAt
          ? issue.resolvedAt
          : issue.rejectedAt || issue.createdAt,

      moderated_by: issue.moderatedBy || "Unit Officer",
      moderated_at: isResolved
        ? issue.resolvedAt
        : issue.rejectedAt || issue.createdAt,

      public_visible: issue.publicVisible ?? false,
      publish_status:
        issue.publishStatus || (issue.publicVisible ? "published" : "draft"),

      rejection_reason: isRejected ? issue.rejectionReason || "" : undefined,

      view_count: issue.viewCount || 0,
      foVisible: issue.foVisible ?? true,
    };
  });
};
