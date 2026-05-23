import { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  Clock,
  Shield,
  Wrench,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CornerDownRight,
  Bot,
  CheckCheck,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";

const QUICK_REPLIES = [
  "What is the current status of this issue?",
  "When can I expect a resolution?",
  "I have additional details to provide.",
  "Thank you for the update!",
];

export function IssueMessaging({ issue }) {
  console.log("IssueMessaging rendered with issue:", issue);
  const { data: session } = useSession();
  const user = session?.user;

  const hasFieldOfficer = !!issue?.assignedFieldOfficer;
  const hasWardOfficer = !!issue?.assignedUnitOfficer;

  const [selectedOfficer, setSelectedOfficer] = useState(
    hasFieldOfficer ? "field" : "ward",
  );
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousMessagesLength = useRef(0);

  const citizenId = user?.id;
  const issueId = issue?._id || issue?.id;

  const messages = useQuery(
    api.messages.getCitizenIssueMessages,
    issueId && citizenId
      ? {
          issueId,
          citizenId,
          unitOfficerId: issue?.assignedUnitOfficer?.userId ?? undefined,
          fieldOfficerId: issue?.assignedFieldOfficer?.userId ?? undefined,
        }
      : "skip",
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);

  const currentOfficerUserId =
    selectedOfficer === "field"
      ? issue?.assignedFieldOfficer?.userId
      : issue?.assignedUnitOfficer?.userId;

  const filteredMessages = messages
    ? messages.filter(
        (msg) =>
          (msg.senderId === user?.id &&
            msg.recipientId === currentOfficerUserId) ||
          (msg.senderId === currentOfficerUserId &&
            msg.recipientId === user?.id),
      )
    : undefined;

  useEffect(() => {
    if (
      !issueId ||
      !citizenId ||
      !currentOfficerUserId ||
      !filteredMessages ||
      filteredMessages.length === 0
    ) {
      return;
    }

    const hasUnread = filteredMessages.some(
      (msg) =>
        msg.senderId === currentOfficerUserId &&
        msg.recipientId === citizenId &&
        msg.isRead === false
    );

    if (hasUnread) {
      markMessagesAsRead({
        issueId,
        currentUserId: citizenId,
        senderId: currentOfficerUserId,
      }).catch((err) => {
        console.error("Failed to mark messages as read:", err);
      });
    }
  }, [selectedOfficer, filteredMessages, issueId, citizenId, currentOfficerUserId, markMessagesAsRead]);

  useEffect(() => {
    if (filteredMessages?.length > previousMessagesLength.current) {
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          150;
        if (isNearBottom || previousMessagesLength.current === 0) {
          scrollToBottom();
        }
      }
    }
    previousMessagesLength.current = filteredMessages?.length || 0;
  }, [filteredMessages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSendMessage(textToSend) {
    const content = typeof textToSend === "string" ? textToSend : newMessage;
    const recipientId =
      selectedOfficer === "field"
        ? issue?.assignedFieldOfficer?.userId
        : issue?.assignedUnitOfficer?.userId;

    if (!content?.trim() || sending || !user || !recipientId) return;

    setSending(true);
    try {
      await sendMessage({
        issueId,
        senderId: user.id,
        recipientId: recipientId,
        message: content.trim(),
      });

      if (typeof textToSend !== "string") {
        setNewMessage("");
      }
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }


  function formatTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!user || (!hasFieldOfficer && !hasWardOfficer)) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-white/60 dark:bg-[#0c0c0e]/60 backdrop-blur-2xl rounded-[2.5rem] border border-gray-200/80 dark:border-white/10 shadow-2xl">
        <div className="relative mb-6 group">
          <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-150"></div>
          <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 p-6 rounded-3xl border border-amber-200 dark:border-amber-500/30 shadow-lg">
            <User className="w-16 h-16 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          No Assigned Officer Yet
        </h3>
        <p className="text-base text-gray-600 dark:text-gray-400 font-medium max-w-md leading-relaxed mb-8">
          Once a Unit Officer or Field Officer is assigned to investigate your
          civic issue, a secure, direct messaging channel will automatically
          open here.
        </p>
        <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-5 py-3 rounded-2xl text-sm font-bold text-amber-700 dark:text-amber-300 shadow-sm">
          <Clock size={18} className="animate-pulse" />
          <span>Awaiting department assignment...</span>
        </div>
      </div>
    );
  }

  const currentOfficer =
    selectedOfficer === "field"
      ? issue?.assignedFieldOfficer
      : issue?.assignedUnitOfficer;

  return (
    <div className="flex flex-col h-full min-h-[650px] bg-white/60 dark:bg-[#0c0c0e]/60 backdrop-blur-2xl rounded-[2.5rem] border border-gray-200/80 dark:border-white/10 shadow-2xl p-6 sm:p-8 overflow-hidden relative">
      {/* Officer Switcher Tabs */}
      {hasFieldOfficer && hasWardOfficer && (
        <div className="flex items-center bg-gray-100/80 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200/60 dark:border-white/10 mb-6 shadow-inner role-switcher">
          <button
            onClick={() => setSelectedOfficer("field")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-extrabold text-sm transition-all duration-500 ${
              selectedOfficer === "field"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] scale-[1.02]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5"
            }`}
          >
            <Wrench
              size={18}
              className={selectedOfficer === "field" ? "animate-bounce" : ""}
            />
            <span>
              Field Officer (
              {issue.assignedFieldOfficer?.fullName?.split(" ")[0]})
            </span>
          </button>
          <button
            onClick={() => setSelectedOfficer("ward")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-extrabold text-sm transition-all duration-500 ${
              selectedOfficer === "ward"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-[0_8px_20px_rgba(79,70,229,0.3)] scale-[1.02]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5"
            }`}
          >
            <Shield
              size={18}
              className={selectedOfficer === "ward" ? "animate-bounce" : ""}
            />
            <span>
              Ward Officer ({issue.assignedUnitOfficer?.fullName?.split(" ")[0]}
              )
            </span>
          </button>
        </div>
      )}

      {/* Active Officer Info Banner */}
      {currentOfficer && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 dark:from-blue-500/20 dark:via-indigo-500/10 dark:to-purple-500/20 rounded-2xl border border-blue-200/60 dark:border-blue-500/30 p-5 mb-6 shadow-sm backdrop-blur-md flex items-center justify-between flex-wrap gap-4 group">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-3.5 rounded-2xl shadow-lg flex items-center justify-center border border-white/20 text-white font-black text-lg">
                {selectedOfficer === "field" ? (
                  <Wrench size={22} />
                ) : (
                  <Shield size={22} />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0c0c0e] rounded-full shadow-sm animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg tracking-tight">
                  {currentOfficer.fullName}
                </h4>
                <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase border border-blue-200 dark:border-blue-500/30">
                  {selectedOfficer === "field"
                    ? "Field Ops"
                    : currentOfficer.department || "Unit Lead"}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Secure Citizen-Officer Messaging Channel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-black/40 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
            <Clock size={14} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Avg. Response:{" "}
              <span className="text-blue-600 dark:text-blue-400 font-black">
                2h
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-white/10 p-5 space-y-4 mb-6 shadow-inner [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {messages === undefined ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
            <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 animate-pulse">
              Loading secure conversation...
            </p>
          </div>
        ) : filteredMessages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150"></div>
              <div className="relative bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 p-6 rounded-3xl border border-blue-200 dark:border-blue-500/30 shadow-lg">
                <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
              Start the Conversation
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-sm mb-6 leading-relaxed">
              Have questions or additional details about your reported issue?
              Send a message to the assigned officer directly.
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm">
              <Sparkles size={14} className="animate-spin" />
              <span>End-to-end encrypted civic channel</span>
            </div>
          </div>
        ) : (
          filteredMessages?.map((msg) => {
            const isOwnMessage = msg.senderId === user?.id;
            return (
              <div
                key={msg._id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group/msg transition-all`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-[1.5rem] px-5 py-4 shadow-md backdrop-blur-sm relative ${
                    isOwnMessage
                      ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-br-sm shadow-indigo-500/20 border border-indigo-400/30"
                      : "bg-white dark:bg-[#1e1e24] text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-white/10 shadow-black/5"
                  }`}
                >
                  {!isOwnMessage && msg.sender && (
                    <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-gray-100 dark:border-white/5">
                      <span className="font-extrabold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent tracking-tight">
                        {msg.sender.fullName}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-white/5">
                        {msg.sender.role.replace("_", " ")}
                      </span>
                    </div>
                  )}

                  <p className="text-sm sm:text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                    {msg.message}
                  </p>

                  <div
                    className={`flex items-center justify-end gap-1.5 mt-2 pt-1 text-[11px] font-bold ${
                      isOwnMessage
                        ? "text-indigo-100/80"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    <span>{formatTime(msg.createdAt)}</span>
                    {isOwnMessage && (
                      <CheckCheck
                        size={14}
                        className={
                          msg.isRead ? "text-emerald-400" : "text-indigo-200/60"
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Quick Replies */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Bot size={14} className="text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Suggested Quick Replies
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          {QUICK_REPLIES.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(reply)}
              disabled={sending}
              className="flex-shrink-0 bg-white dark:bg-[#18181b] hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all duration-300 flex items-center gap-2 group active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{reply}</span>
              <CornerDownRight
                size={12}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-[#18181b] rounded-2xl border-2 border-gray-200 dark:border-white/10 focus-within:border-blue-500 dark:focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-lg overflow-hidden">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Type your message to ${currentOfficer?.fullName?.split(" ")[0] || "the officer"}...`}
          className="w-full px-5 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none font-medium text-sm sm:text-[15px] resize-none"
          rows={3}
        />
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-black/40 border-t border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 hidden sm:block">
              Enter ↵ to send <span className="mx-1.5">•</span> Shift + Enter
              for new line
            </p>
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 sm:hidden">
              {newMessage.length} chars
            </span>
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!newMessage.trim() || sending}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-800 dark:disabled:to-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-[1.03] active:scale-95"
          >
            <Send size={16} className={sending ? "animate-pulse" : ""} />
            <span>{sending ? "Sending..." : "Send Message"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
