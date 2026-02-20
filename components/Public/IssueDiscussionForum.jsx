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
} from "lucide-react";

export default function IssueDiscussionForum({ issueId, issueTitle }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [upvotedComments, setUpvotedComments] = useState(new Set());

  useEffect(() => {
    loadComments();
  }, [issueId]);

  const loadComments = () => {
    // Dummy data - replace with actual Supabase query
    const dummyComments = [
      {
        id: "1",
        user_name: "Rajesh Kumar",
        user_avatar: "RK",
        comment_text:
          "This has been a major problem for months! Thank you for finally fixing it. The road is much smoother now.",
        upvotes: 28,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        is_pinned: true,
        replies: [
          {
            id: "1-1",
            user_name: "Priya Singh",
            comment_text: "Agreed! The work quality looks good.",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            upvotes: 5,
          },
        ],
      },
      {
        id: "2",
        user_name: "Amit Verma",
        user_avatar: "AV",
        comment_text:
          "Great work by the municipal team. Response time was impressive.",
        upvotes: 15,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        is_pinned: false,
        replies: [],
      },
      {
        id: "3",
        user_name: "Sunita Devi",
        user_avatar: "SD",
        comment_text:
          "I live nearby and I can confirm the issue has been completely resolved. No more waterlogging!",
        upvotes: 12,
        created_at: new Date(Date.now() - 10800000).toISOString(),
        is_pinned: false,
        replies: [],
      },
      {
        id: "4",
        user_name: "Vikram Yadav",
        user_avatar: "VY",
        comment_text:
          "Hope the quality of repair lasts through the monsoon season.",
        upvotes: 8,
        created_at: new Date(Date.now() - 14400000).toISOString(),
        is_pinned: false,
        replies: [
          {
            id: "4-1",
            user_name: "Municipal Officer",
            comment_text:
              "We used high-quality materials that are monsoon-resistant. Regular inspections will be conducted.",
            created_at: new Date(Date.now() - 13000000).toISOString(),
            upvotes: 10,
          },
        ],
      },
      {
        id: "5",
        user_name: "Neha Gupta",
        user_avatar: "NG",
        comment_text:
          "Similar issue near Ravindrapuri. When will that be fixed?",
        upvotes: 6,
        created_at: new Date(Date.now() - 18000000).toISOString(),
        is_pinned: false,
        replies: [],
      },
    ];
    setComments(dummyComments);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: Date.now().toString(),
      user_name: "Anonymous Citizen",
      user_avatar: "AC",
      comment_text: newComment,
      upvotes: 0,
      created_at: new Date().toISOString(),
      is_pinned: false,
      replies: [],
    };

    setComments([newCommentObj, ...comments]);
    setNewComment("");
  };

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return;

    const newReply = {
      id: `${commentId}-${Date.now()}`,
      user_name: "Anonymous Citizen",
      comment_text: replyText,
      created_at: new Date().toISOString(),
      upvotes: 0,
    };

    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, newReply],
          };
        }
        return comment;
      }),
    );

    setReplyText("");
    setReplyingTo(null);
  };

  const handleUpvote = (commentId) => {
    if (upvotedComments.has(commentId)) {
      setUpvotedComments(
        new Set([...upvotedComments].filter((id) => id !== commentId)),
      );
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, upvotes: comment.upvotes - 1 }
            : comment,
        ),
      );
    } else {
      setUpvotedComments(new Set([...upvotedComments, commentId]));
      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, upvotes: comment.upvotes + 1 }
            : comment,
        ),
      );
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    if (sortBy === "popular") {
      return b.upvotes - a.upvotes;
    } else {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  });

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Be respectful and constructive
              </span>
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
              className={`${
                comment.is_pinned
                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border-2 border-amber-300 dark:border-amber-700"
                  : "bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
              } rounded-xl p-5`}
            >
              {/* Comment Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {comment.user_avatar}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.user_name}
                    </span>
                    {comment.is_pinned && (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded">
                        Pinned
                      </span>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
                    {comment.comment_text}
                  </p>
                </div>
                <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical size={18} />
                </button>
              </div>

              {/* Comment Actions */}
              <div className="flex items-center gap-4 ml-13">
                <button
                  onClick={() => handleUpvote(comment.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    upvotedComments.has(comment.id)
                      ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                      : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600"
                  }`}
                >
                  <ThumbsUp size={14} />
                  <span>{comment.upvotes}</span>
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
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
                  <Flag size={14} />
                  Report
                </button>
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-4 ml-13 flex items-start gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyText.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reply
                  </button>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-4 ml-13 space-y-3">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="flex items-start gap-3 bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="text-white" size={14} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {reply.user_name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getTimeAgo(reply.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {reply.comment_text}
                        </p>
                        <button className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400">
                          <ThumbsUp size={12} />
                          <span>{reply.upvotes}</span>
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
