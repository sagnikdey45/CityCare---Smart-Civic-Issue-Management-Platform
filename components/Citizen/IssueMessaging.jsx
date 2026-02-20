import { useState, useEffect, useRef } from "react";
import { Send, User, Clock, Shield, Wrench } from "lucide-react";
import { getIssueMessages, mockUsers } from "@/lib/mockData";

export function IssueMessaging({ issue }) {
  console.log("IssueMessaging rendered with issue:", issue);
  const user = mockUsers[0]; // Mocked user data
  const profile = { full_name: "John Doe", role: "citizen" }; // Mocked profile data
  const [selectedOfficer, setSelectedOfficer] = useState("field");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousMessagesLength = useRef(0);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [issue.id, selectedOfficer]);

  useEffect(() => {
    if (messages.length > previousMessagesLength.current) {
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          100;
        if (isNearBottom || previousMessagesLength.current === 0) {
          scrollToBottom();
        }
      }
    }
    previousMessagesLength.current = messages.length;
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function loadMessages() {
    if (!user) return;

    setLoading(true);
    try {
      const recipientId =
        selectedOfficer === "field"
          ? issue.assignee?.id
          : issue.wardOfficer?.id;

      console.log("Loading messages for recipientId:", recipientId);
      console.log("User ID:", user.id);

      if (!recipientId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      console.log("Issue:", getIssueMessages(issue.id));

      const mockMessages = getIssueMessages(issue.id).filter(
        (msg) =>
          (msg.sender_id == user.id && msg.recipient_id == recipientId) ||
          (msg.sender_id == recipientId && msg.recipient_id == user.id),
      );

      // fix === instead of == (TODO)
      // const mockMessages = getIssueMessages(issue.id).filter(
      //   (msg) =>
      //     (msg.sender_id === user.id && msg.recipient_id === recipientId) ||
      //     (msg.sender_id === recipientId && msg.recipient_id === user.id)
      // );

      console.log("Filtered messages:", mockMessages);

      const messagesWithSender = mockMessages.map((msg) => ({
        ...msg,
        sender:
          msg.sender_id == user.id
            ? {
                id: user.id,
                full_name: profile?.full_name || "You",
                role: profile?.role || "citizen",
              }
            : selectedOfficer == "field"
              ? {
                  id: issue.assignee.id,
                  full_name: issue.assignee.full_name,
                  role: issue.assignee.role,
                }
              : {
                  id: issue.wardOfficer.id,
                  full_name: issue.wardOfficer.full_name,
                  role: issue.wardOfficer.role,
                },
      }));

      // fix === instead of == (TODO)
      // const messagesWithSender = mockMessages.map((msg) => ({
      //   ...msg,
      //   sender:
      //     msg.sender_id === user.id
      //       ? {
      //           id: user.id,
      //           full_name: profile?.full_name || "You",
      //           role: profile?.role || "citizen",
      //         }
      //       : selectedOfficer === "field"
      //         ? {
      //             id: issue.assignee.id,
      //             full_name: issue.assignee.full_name,
      //             role: issue.assignee.role,
      //           }
      //         : {
      //             id: issue.wardOfficer.id,
      //             full_name: issue.wardOfficer.full_name,
      //             role: issue.wardOfficer.role,
      //           },
      // }));

      setMessages(messagesWithSender);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage() {
    const recipientId =
      selectedOfficer === "field" ? issue.assignee?.id : issue.wardOfficer?.id;
    if (!newMessage.trim() || sending || !user || !recipientId) return;

    setSending(true);
    try {
      const { error } = await supabase.from("issue_messages").insert({
        issue_id: issue.id,
        sender_id: user.id,
        recipient_id: recipientId,
        message: newMessage.trim(),
        is_read: false,
      });

      if (error) throw error;

      setNewMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateString) {
    const date = new Date(dateString);
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

  const hasFieldOfficer = !!issue.assignee;
  const hasWardOfficer = !!issue.wardOfficer;

  if (!user || (!hasFieldOfficer && !hasWardOfficer)) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600 font-medium">No assigned officer yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Once an officer is assigned to your issue, you'll be able to message
          them here.
        </p>
      </div>
    );
  }

  const currentOfficer =
    selectedOfficer === "field" ? issue.assignee : issue.wardOfficer;

  return (
    <div className="flex flex-col h-full p-6">
      {hasFieldOfficer && hasWardOfficer && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedOfficer("field")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              selectedOfficer === "field"
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Wrench size={18} />
            <span>Field Officer</span>
          </button>
          <button
            onClick={() => setSelectedOfficer("ward")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              selectedOfficer === "ward"
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Shield size={18} />
            <span>Ward Officer</span>
          </button>
        </div>
      )}

      {currentOfficer && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-200 p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-full">
              {selectedOfficer === "field" ? (
                <Wrench className="text-white" size={20} />
              ) : (
                <Shield className="text-white" size={20} />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                Private Conversation
              </h4>
              <p className="text-sm text-gray-600">
                Chatting with {currentOfficer.full_name} (
                {currentOfficer.role.replace("_", " ")})
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3 mb-4"
      >
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="text-gray-600 font-medium">No messages yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Start a conversation with the assigned officer about this issue.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            // TODO: fix == vs === (currently using == to match mock data, but should be === in real implementation)
            const isOwnMessage = msg.sender_id == user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isOwnMessage
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  {!isOwnMessage && msg.sender && (
                    <p className="text-xs font-semibold mb-1 text-gray-600">
                      {msg.sender.full_name}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 focus-within:border-blue-500 transition-all overflow-hidden">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type your message to the officer..."
          className="w-full px-4 py-3 border-0 focus:outline-none resize-none"
          rows={3}
        />
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Press Enter to send, Shift+Enter for new line
          </p>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-medium hover:shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            <Send size={16} />
            <span>{sending ? "Sending..." : "Send"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
