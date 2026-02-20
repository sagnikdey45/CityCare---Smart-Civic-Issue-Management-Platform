import { useState, useEffect } from "react";
import { ThumbsUp, Heart, Sparkles, Send, MessageSquare } from "lucide-react";
import { mockComments, mockReactions, currentMockUser } from "../lib/mockData";
// import { analyzeSentiment } from '../lib/aiClassification';
import { awardPoints, ACTIVITY_POINTS } from "../lib/gamification";

const reactionIcons = {
  thumbsup: { icon: ThumbsUp, label: "Thumbs Up", color: "text-blue-600" },
  heart: { icon: Heart, label: "Heart", color: "text-red-500" },
  celebrate: { icon: Sparkles, label: "Celebrate", color: "text-yellow-500" },
};

export function IssueDiscussion({ issueId }) {
  const user = { id: "4" };
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState({});
  const [userReactions, setUserReactions] = useState(new Set());
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    loadComments();
    loadReactions();
  }, [issueId]);

  async function loadComments() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const issueComments = mockComments[issueId] || [];
    setComments(issueComments);
  }

  async function loadReactions() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const issueReactions = mockReactions[issueId] || [];

    const reactionCounts = {};
    const userReactionSet = new Set();

    issueReactions.forEach((reaction) => {
      reactionCounts[reaction.reaction_type] =
        (reactionCounts[reaction.reaction_type] || 0) + 1;
      if (user && reaction.user_id === user.id) {
        userReactionSet.add(reaction.reaction_type);
      }
    });

    setReactions(reactionCounts);
    setUserReactions(userReactionSet);
  }

  async function handleAddComment() {
    if (!newComment.trim() || loading) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      //   const sentiment = await analyzeSentiment(newComment);

      const newCommentObj = {
        id: `c-${Date.now()}`,
        issue_id: issueId,
        user_id: isAnonymous ? undefined : user?.id,
        comment: newComment,
        sentiment_score: 56,
        isAnonymous: isAnonymous,
        createdAt: new Date().toISOString(),
        commenter: isAnonymous ? undefined : currentMockUser || undefined,
      };

      if (!mockComments[issueId]) {
        mockComments[issueId] = [];
      }
      mockComments[issueId].push(newCommentObj);

      if (user && !isAnonymous) {
        await awardPoints(
          user.id,
          "comment_added",
          ACTIVITY_POINTS.COMMENT_ADDED,
          issueId
        );
      }

      setNewComment("");
      await loadComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReaction(reactionType) {
    if (!user) return;

    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!mockReactions[issueId]) {
      mockReactions[issueId] = [];
    }

    const existingIndex = mockReactions[issueId].findIndex(
      (r) => r.user_id === user.id && r.reaction_type === reactionType
    );

    if (existingIndex >= 0) {
      mockReactions[issueId].splice(existingIndex, 1);
    } else {
      mockReactions[issueId].push({
        id: `r-${Date.now()}`,
        issue_id: issueId,
        user_id: user.id,
        reaction_type: reactionType,
        createdAt: new Date().toISOString(),
      });
    }

    await loadReactions();
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <MessageSquare size={20} className="mr-2 text-blue-600" />
          Community Reactions
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.keys(reactionIcons).map((type) => {
            const { icon: Icon, label, color } = reactionIcons[type];
            const count = reactions[type] || 0;
            const isActive = userReactions.has(type);

            return (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                disabled={!user}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${
                  isActive
                    ? `${color} bg-white border-current shadow-md`
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm"
                } ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Icon size={18} fill={isActive ? "currentColor" : "none"} />
                <span className="font-medium">{count}</span>
                <span className="text-xs hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Discussion ({comments.length})
        </h3>

        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {comment.isAnonymous
                      ? "?"
                      : comment.commenter?.full_name?.charAt(0).toUpperCase() ||
                        "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {comment.isAnonymous
                        ? "Anonymous Citizen"
                        : comment.commenter?.full_name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {comment.sentiment_score !== null &&
                  comment.sentiment_score !== undefined && (
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comment.sentiment_score > 0.2
                          ? "bg-green-100 text-green-700"
                          : comment.sentiment_score < -0.2
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {comment.sentiment_score > 0.2
                        ? "😊"
                        : comment.sentiment_score < -0.2
                          ? "😟"
                          : "😐"}
                    </div>
                  )}
              </div>
              <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 focus-within:border-blue-500 transition-all">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts or updates about this issue..."
            className="w-full px-3 py-2 border-0 focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Post anonymously</span>
            </label>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <Send size={18} />
              <span>{loading ? "Posting..." : "Post Comment"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
