/**
 * Universal Audit Logging System Helper for CityCare Backend
 */

export async function createAuditLog(
  ctx,
  {
    performedByUserId,
    performerRole,

    action,
    actionCategory,

    affectedEntityType = "issue",
    affectedEntityId,

    issueId,
    issueCode,

    city,
    department,

    oldValue,
    newValue,

    reason,
    description,

    source = "web",
    timestamp = Date.now(),
  }
) {
  return await ctx.db.insert("auditLogs", {
    performedByUserId,
    performerRole,

    action,
    actionCategory,

    affectedEntityType,

    affectedEntityId: affectedEntityId ? String(affectedEntityId) : undefined,

    issueId,
    issueCode,

    city,
    department,

    oldValue,
    newValue,

    reason,
    description,

    source,
    timestamp,
  });
}

export async function auditIssueAction(
  ctx,
  {
    issue,
    performedByUserId,
    performerRole,

    action,
    actionCategory,

    oldValue,
    newValue,

    reason,
    description,

    source = "web",
  }
) {
  if (!issue) return;

  return createAuditLog(ctx, {
    performedByUserId,
    performerRole,

    action,
    actionCategory,

    affectedEntityType: "issue",
    affectedEntityId: issue._id,

    issueId: issue._id,
    issueCode: issue.issueCode,

    city: issue.city,
    department: issue.department ?? issue.category,

    oldValue,
    newValue,

    reason,
    description,

    source,
  });
}
