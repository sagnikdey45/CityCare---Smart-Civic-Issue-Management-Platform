import { mockUsers, mockUserBadges, mockBadges } from "./mockData";

export const ACTIVITY_POINTS = {
  REPORT_ISSUE: 10,
  ISSUE_VERIFIED: 20,
  COMMENT_ADDED: 5,
  HELPFUL_COMMENT: 10,
  ISSUE_RESOLVED: 15,
};

export async function awardPoints(
  userId,
  activityType,
  points,
  relatedIssueId
) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const user = mockUsers.find((u) => u.id === userId);
  if (user) {
    user.points += points;
  }

  return { success: true };
}

export async function getLeaderboard(limit = 10) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const sortedUsers = [...mockUsers]
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);

  return { data: sortedUsers, error: null };
}

export async function getUserBadges(userId) {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const userBadges = mockUserBadges[userId] || [];
  return { data: userBadges, error: null };
}

export async function getAllBadges() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return { data: mockBadges, error: null };
}
