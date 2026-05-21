import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCitizenIssueMessages = query({
  args: {
    issueId: v.id("issues"),
    citizenId: v.id("users"),
    unitOfficerId: v.optional(v.id("users")),
    fieldOfficerId: v.optional(v.id("users")),
  },

  handler: async (ctx, args) => {
    const allowedUserIds = new Set([args.citizenId]);

    if (args.unitOfficerId) {
      allowedUserIds.add(args.unitOfficerId);
    }

    if (args.fieldOfficerId) {
      allowedUserIds.add(args.fieldOfficerId);
    }

    const messages = await ctx.db
      .query("issueMessages")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();

    const filteredMessages = messages.filter(
      (message) =>
        allowedUserIds.has(message.senderId) &&
        allowedUserIds.has(message.recipientId),
    );

    const enrichedMessages = await Promise.all(
      filteredMessages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        const recipient = await ctx.db.get(message.recipientId);

        return {
          ...message,
          sender: sender
            ? {
                _id: sender._id,
                fullName: sender.fullName,
                email: sender.email,
                role: sender.role,
              }
            : null,
          recipient: recipient
            ? {
                _id: recipient._id,
                fullName: recipient.fullName,
                email: recipient.email,
                role: recipient.role,
              }
            : null,
        };
      }),
    );

    return enrichedMessages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const sendMessage = mutation({
  args: {
    issueId: v.id("issues"),
    senderId: v.id("users"),
    recipientId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("issueMessages", {
      issueId: args.issueId,
      senderId: args.senderId,
      recipientId: args.recipientId,
      message: args.message,
      isRead: false,
      createdAt: Date.now(),
    });

    return messageId;
  },
});
