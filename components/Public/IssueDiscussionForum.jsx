import { useState, useEffect } from "react";
import {
  MessageSquare,
  ThumbsUp,
  User,
  Send,
  Clock,
  TrendingUp,
  Reply,
  Flag,
  MoreVertical,
  Shield,
  EyeOff
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function IssueDiscussionForum({ issueId, issueTitle }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const comments = useQuery(api.issueDiscussions.getIssueDiscussions, { issueId }) || [];
  
  const addComment = useMutation(api.issueDiscussions.addIssueDiscussion);
  const addReply = useMutation(api.issueDiscussions.addIssueReply);
  const likeDiscussion = useMutation(api.issueDiscussions.likeDiscussion);
  const likeReplyObj = useMutation(api.issueDiscussions.likeReply);

  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyAnonymous, setIsReplyAnonymous] = useState(false);
  


  const handleAddComment = async () => {
    if (!newComment.trim() || !userId) return;
    try {
      await addComment({
        issueId,
        citizenId: userId,
        comments: newComment,
        isAnonymous
      });
      setNewComment("");
      setIsAnonymous(false);
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  const handleAddReply = async (discussionId) => {
    if (!replyText.trim() || !userId) return;
    try {
      await addReply({
        issueId,
        discussionId,
        userId,
        reply: replyText,
        isAnonymous: isReplyAnonymous
      });
      setReplyText("");
      setReplyingTo(null);
      setIsReplyAnonymous(false);
    } catch (error) {
      console.error("Failed to add reply", error);
    }
  };

  const handleUpvoteDiscussion = async (id) => {
    if (!userId) return;
    await likeDiscussion({ discussionId: id, userId });
  };

  const handleUpvoteReply = async (id) => {
    if (!userId) return;
    await likeReplyObj({ replyId: id, userId });
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "popular") {
      return b.likeCount - a.likeCount;
    } else {
      return b.createdAt - a.createdAt;
    }
  });

  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare
              className="text-teal-600 dark:text-teal-400"
              size={28}
            />
            Community Discussion
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Share your thoughts and experiences about this issue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy("popular")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === "popular"
                ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
          >
            <TrendingUp size={16} className="inline mr-1" />
            Popular
          </button>
          <button
            onClick={() => setSortBy("recent")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === "recent"
                ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
          >
            <Clock size={16} className="inline mr-1" />
            Recent
          </button>
        </div>
      </div>

      {/* Add Comment */}
      <div className="mb-8">
        {!userId ? (
          <div className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 text-center">
            <Shield className="mx-auto text-gray-400 mb-3" size={32} />
            <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Login to Participate</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">You must be logged in to join the discussion.</p>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts or experience with this issue..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                  <input 
                    type="checkbox" 
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <EyeOff size={16} />
                  Post Anonymously
                </label>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {sortedComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare
              className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
              size={48}
            />
            <p className="text-gray-600 dark:text-gray-400">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-5"
            >
              {/* Comment Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {getInitials(comment.userName)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.userName}
                    </span>
                    {comment.userRole === "unit_officer" || comment.userRole === "field_officer" ? (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded flex items-center gap-1">
                        <Shield size={12} /> Officer
                      </span>
                    ) : null}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">
                    {comment.comments}
                  </p>
                </div>
              </div>

              {/* Comment Actions */}
              <div className="flex items-center gap-4 ml-13">
                <button
                  onClick={() => handleUpvoteDiscussion(comment.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    comment.likedBy?.includes(userId)
                      ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                      : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600"
                  }`}
                >
                  <ThumbsUp size={14} />
                  <span>{comment.likeCount}</span>
                </button>
                <button
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                >
                  <Reply size={14} />
                  Reply
                </button>
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-4 ml-13 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={userId ? "Write your reply..." : "Login to reply..."}
                        disabled={!userId}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyText.trim() || !userId}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reply
                    </button>
                  </div>
                  {userId && (
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                        <input 
                          type="checkbox" 
                          checked={isReplyAnonymous}
                          onChange={(e) => setIsReplyAnonymous(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <EyeOff size={14} />
                        Reply Anonymously
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-13 space-y-3">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {getInitials(reply.userName)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {reply.userName}
                            </span>
                            {reply.userRole === "unit_officer" || reply.userRole === "field_officer" ? (
                              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded flex items-center gap-0.5">
                                <Shield size={10} /> Officer
                              </span>
                            ) : null}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {getTimeAgo(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {reply.reply}
                        </p>
                        <button 
                          onClick={() => handleUpvoteReply(reply.id)}
                          className={`flex items-center gap-1 mt-2 text-xs transition-colors ${
                            reply.likedBy?.includes(userId) ? "text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
                          }`}
                        >
                          <ThumbsUp size={12} />
                          <span>{reply.likeCount}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
