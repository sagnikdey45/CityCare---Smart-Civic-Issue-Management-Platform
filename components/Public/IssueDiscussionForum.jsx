import { useState } from "react";
import {
  MessageSquare,
  ThumbsUp,
  User,
  Send,
  Clock,
  TrendingUp,
  Reply,
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
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-white/60 dark:border-white/10 p-8 mb-8 relative z-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200/60 dark:border-slate-700/60">
        <div>
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-xl shadow-lg shadow-teal-500/30">
              <MessageSquare className="text-white" size={24} />
            </div>
            Community Discussion
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 ml-1">
            Share your thoughts, experiences, or updates regarding this issue.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100/80 dark:bg-slate-800/80 p-1.5 rounded-xl border border-gray-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setSortBy("popular")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
              sortBy === "popular"
                ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <TrendingUp size={16} />
            Popular
          </button>
          <button
            onClick={() => setSortBy("recent")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
              sortBy === "recent"
                ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Clock size={16} />
            Recent
          </button>
        </div>
      </div>

      {/* Add Comment */}
      <div className="mb-10">
        {!userId ? (
          <div className="bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200/80 dark:border-slate-700/80 rounded-2xl p-8 text-center shadow-inner">
            <div className="w-16 h-16 bg-gray-200/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300/50 dark:border-slate-700/50">
              <Shield className="text-gray-400 dark:text-gray-500" size={28} />
            </div>
            <h4 className="text-lg text-gray-900 dark:text-white font-extrabold mb-2 tracking-tight">Login Required</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">You must be logged in to participate in the discussion.</p>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20 border border-white/20">
              <User className="text-white" size={24} />
            </div>
            <div className="flex-1 bg-white dark:bg-slate-950/50 rounded-2xl shadow-inner border border-gray-200/80 dark:border-slate-700/80 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all duration-300">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What's your perspective on this issue?..."
                rows={3}
                className="w-full px-5 py-4 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none text-base"
              />
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50/80 dark:bg-slate-900/80 border-t border-gray-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-gray-300 text-teal-500 focus:ring-teal-500/30 w-4 h-4 transition-all cursor-pointer"
                  />
                  <EyeOff size={16} />
                  Post Anonymously
                </label>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
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
          <div className="text-center py-16 px-4 bg-gray-50/50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-gray-100 dark:border-slate-700">
              <MessageSquare
                className="text-gray-300 dark:text-gray-600"
                size={36}
              />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 tracking-tight">No Comments Yet</h4>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Be the first to spark the conversation and share your insights.
            </p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="group bg-white dark:bg-slate-900/60 border border-gray-100 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Comment Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner border border-white/10">
                  <span className="text-white text-sm font-extrabold tracking-wider">
                    {getInitials(comment.userName)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-extrabold text-gray-900 dark:text-white tracking-tight text-lg">
                      {comment.userName}
                    </span>
                    {comment.userRole === "unit_officer" || comment.userRole === "field_officer" ? (
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-blue-200 dark:border-blue-800/50 shadow-sm">
                        <Shield size={12} /> Official
                      </span>
                    ) : null}
                    <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">
                      • {getTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-3 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {comment.comments}
                  </p>
                </div>
              </div>

              {/* Comment Actions */}
              <div className="flex items-center gap-3 ml-16 mt-2">
                <button
                  onClick={() => handleUpvoteDiscussion(comment.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    comment.likedBy?.includes(userId)
                      ? "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50 shadow-sm"
                      : "bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50"
                  }`}
                >
                  <ThumbsUp size={16} className={comment.likedBy?.includes(userId) ? "fill-current" : ""} />
                  <span>{comment.likeCount}</span>
                </button>
                <button
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 text-gray-500 dark:text-gray-400 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <Reply size={16} />
                  Reply
                </button>
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-5 ml-16 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 bg-white dark:bg-slate-950/50 rounded-xl shadow-inner border border-gray-200/80 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-400 transition-all overflow-hidden">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={userId ? "Write your reply..." : "Login to reply..."}
                        disabled={!userId}
                        className="w-full px-4 py-3 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 text-[15px] disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyText.trim() || !userId}
                      className="px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-teal-500/20"
                    >
                      Post Reply
                    </button>
                  </div>
                  {userId && (
                    <div className="flex items-center px-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-teal-500 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={isReplyAnonymous}
                          onChange={(e) => setIsReplyAnonymous(e.target.checked)}
                          className="rounded border-gray-300 text-teal-500 focus:ring-teal-500/30 w-3.5 h-3.5"
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
                <div className="mt-5 ml-16 space-y-4">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="flex items-start gap-4 bg-gray-50/80 dark:bg-slate-950/30 rounded-2xl p-5 border border-gray-100 dark:border-slate-800/80 shadow-sm"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                        <span className="text-white text-xs font-extrabold tracking-widest">
                          {getInitials(reply.userName)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2.5 mb-2">
                          <span className="font-extrabold text-[15px] text-gray-900 dark:text-white tracking-tight">
                            {reply.userName}
                          </span>
                          {reply.userRole === "unit_officer" || reply.userRole === "field_officer" ? (
                            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-md flex items-center gap-1 border border-blue-200 dark:border-blue-800/50">
                              <Shield size={10} /> Official
                            </span>
                          ) : null}
                          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                            • {getTimeAgo(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-[14.5px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {reply.reply}
                        </p>
                        <button 
                          onClick={() => handleUpvoteReply(reply.id)}
                          className={`flex items-center gap-1.5 mt-3 text-xs font-bold transition-all duration-300 px-3 py-1.5 rounded-lg border ${
                            reply.likedBy?.includes(userId) 
                              ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-200/50 dark:border-teal-800/50" 
                              : "bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 border-gray-200/50 dark:border-slate-700/50"
                          }`}
                        >
                          <ThumbsUp size={14} className={reply.likedBy?.includes(userId) ? "fill-current" : ""} />
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
