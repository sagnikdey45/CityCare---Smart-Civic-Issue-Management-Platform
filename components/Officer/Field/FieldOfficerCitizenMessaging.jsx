import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  User,
  MessageCircle,
  Clock,
  CheckCheck,
  Phone,
  Mail,
  MapPin,
  Paperclip,
  Image as ImageIcon,
  Smile,
  MoreVertical,
} from "lucide-react";

export function FieldOfficerCitizenMessaging({
  citizenName,
  citizenPhone,
  citizenEmail,
  issueTitle,
  issueId,
  issueLocation,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load dummy messages
    const dummyMessages = [
      {
        id: "1",
        sender: "officer",
        text: "Hello! I am the field officer assigned to your reported issue. I will be visiting the site tomorrow morning.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
      {
        id: "2",
        sender: "citizen",
        text: "Thank you for the update! What time should I expect you?",
        timestamp: new Date(Date.now() - 82800000).toISOString(),
        read: true,
      },
      {
        id: "3",
        sender: "officer",
        text: "I will be there around 10:00 AM. The issue should be resolved by noon.",
        timestamp: new Date(Date.now() - 79200000).toISOString(),
        read: true,
      },
      {
        id: "4",
        sender: "citizen",
        text: "Perfect! I will be available. Is there anything I need to prepare?",
        timestamp: new Date(Date.now() - 75600000).toISOString(),
        read: true,
      },
      {
        id: "5",
        sender: "officer",
        text: "No special preparation needed. Just ensure the area is accessible for our team.",
        timestamp: new Date(Date.now() - 72000000).toISOString(),
        read: true,
      },
      {
        id: "6",
        sender: "citizen",
        text: "Got it. Looking forward to seeing the issue resolved!",
        timestamp: new Date(Date.now() - 68400000).toISOString(),
        read: true,
      },
    ];
    setMessages(dummyMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: "officer",
      text: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate citizen typing after a delay
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const citizenReply = {
          id: (Date.now() + 1).toString(),
          sender: "citizen",
          text: "Thank you for the update! I appreciate your help.",
          timestamp: new Date().toISOString(),
          read: false,
        };
        setMessages((prev) => [...prev, citizenReply]);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return (
        "Yesterday " +
        date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      return (
        date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
        " " +
        date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-700 dark:via-blue-800 dark:to-blue-900 text-white p-6 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{citizenName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-100 text-sm">Active</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all rounded-lg p-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* Citizen Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <MessageCircle size={16} />
              <span className="font-semibold">Issue:</span>
              <span>{issueTitle}</span>
            </div>
            {issueLocation && (
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <MapPin size={16} />
                <span>{issueLocation}</span>
              </div>
            )}
            <div className="flex gap-4 mt-3">
              {citizenPhone && (
                <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
                  <Phone size={16} />
                  <span>{citizenPhone}</span>
                </button>
              )}
              {citizenEmail && (
                <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
                  <Mail size={16} />
                  <span>{citizenEmail}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 space-y-4">
          {/* Date Separator */}
          <div className="flex items-center justify-center my-6">
            <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full text-xs font-semibold">
              Conversation History
            </div>
          </div>

          {messages.map((message, index) => (
            <div key={message.id}>
              {/* Show date separator if message is from different day */}
              {index > 0 &&
                new Date(message.timestamp).toDateString() !==
                  new Date(messages[index - 1].timestamp).toDateString() && (
                  <div className="flex items-center justify-center my-6">
                    <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-1.5 rounded-full text-xs font-semibold">
                      {new Date(message.timestamp).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}

              <div
                className={`flex ${message.sender === "officer" ? "justify-end" : "justify-start"} mb-4`}
              >
                <div
                  className={`flex gap-3 max-w-[70%] ${message.sender === "officer" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === "officer"
                        ? "bg-gradient-to-br from-blue-500 to-blue-700"
                        : "bg-gradient-to-br from-teal-500 to-emerald-600"
                    }`}
                  >
                    <User className="text-white" size={20} />
                  </div>

                  {/* Message Bubble */}
                  <div>
                    <div
                      className={`rounded-2xl p-4 shadow-sm ${
                        message.sender === "officer"
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm"
                          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      {message.hasAttachment && message.attachmentUrl && (
                        <div className="mt-3 pt-3 border-t border-white/20 dark:border-slate-700">
                          <div className="flex items-center gap-2 text-xs">
                            <Paperclip size={14} />
                            <span>attachment.jpg</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timestamp and Read Status */}
                    <div
                      className={`flex items-center gap-2 mt-1 px-2 ${
                        message.sender === "officer"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === "officer" && (
                        <CheckCheck
                          size={14}
                          className={
                            message.read
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-400 dark:text-slate-500"
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex gap-3 max-w-[70%]">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-white" size={20} />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0">
          <div className="flex items-end gap-3">
            {/* Message Input */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="mb-2 p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              <Send size={20} />
            </button>
          </div>

          {/* Message Tips */}
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
