import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  X,
  Clock,
  User,
  ChevronRight,
  FileText,
  UserPlus,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  mockUsers,
  getIssues,
  initializeMessagesIfNeeded,
} from "../lib/mockData";

export function MessagesCenter({ user, profile }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [issueSearchTerm, setIssueSearchTerm] = useState("");
  const [showIssueDropdown, setShowIssueDropdown] = useState(false);
  const [colleagueSearchTerm, setColleagueSearchTerm] = useState("");
  const issueDropdownRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showThreadList, setShowThreadList] = useState(true);

  useEffect(() => {
    initializeMessagesIfNeeded();
    loadMessages();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        issueDropdownRef.current &&
        !issueDropdownRef.current.contains(event.target)
      ) {
        setShowIssueDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedThread?.messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function loadMessages() {
    if (!user) return;

    const allMessages = getStoredMessages();
    const userMessages = allMessages.filter(
      (m) => m.from_user_id === user.id || m.to_user_id === user.id,
    );

    const threadMap = new Map();

    userMessages.forEach((msg) => {
      const otherUserId =
        msg.from_user_id === user.id ? msg.to_user_id : msg.from_user_id;
      if (!threadMap.has(otherUserId)) {
        threadMap.set(otherUserId, []);
      }
      threadMap.get(otherUserId).push(msg);
    });

    const threadsList = [];
    threadMap.forEach((messages, otherUserId) => {
      const otherUser = mockUsers.find((u) => u.id === otherUserId);
      if (!otherUser) return;

      const sortedMessages = messages.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

      const unreadCount = messages.filter(
        (m) => m.to_user_id === user.id && !m.read,
      ).length;

      threadsList.push({
        otherUser,
        messages: sortedMessages,
        lastMessage: sortedMessages[sortedMessages.length - 1],
        unreadCount,
      });
    });

    threadsList.sort(
      (a, b) =>
        new Date(b.lastMessage.created_at).getTime() -
        new Date(a.lastMessage.created_at).getTime(),
    );

    setThreads(threadsList);
  }

  function getStoredMessages() {
    const stored = localStorage.getItem("messages");
    return stored ? JSON.parse(stored) : [];
  }

  function saveMessages(messages) {
    localStorage.setItem("messages", JSON.stringify(messages));
  }

  function handleSelectThread(thread) {
    setSelectedThread(thread);
    setShowThreadList(false);

    const allMessages = getStoredMessages();
    const updatedMessages = allMessages.map((m) => {
      if (
        m.to_user_id === user?.id &&
        (m.from_user_id === thread.otherUser.id ||
          m.to_user_id === thread.otherUser.id)
      ) {
        return { ...m, read: true };
      }
      return m;
    });

    saveMessages(updatedMessages);
    loadMessages();
    setTimeout(scrollToBottom, 100);
  }

  function handleSendReply() {
    if (!selectedThread || !user || !replyText.trim()) return;

    setSending(true);

    const newMessage = {
      id: `msg-${Date.now()}`,
      from_user_id: user.id,
      to_user_id: selectedThread.otherUser.id,
      message: replyText.trim(),
      created_at: new Date().toISOString(),
      read: false,
      issue_ids: selectedIssueId ? [selectedIssueId] : undefined,
    };

    const allMessages = getStoredMessages();
    allMessages.push(newMessage);
    saveMessages(allMessages);

    setReplyText("");
    setSelectedIssueId("");
    setSending(false);
    loadMessages();

    const updatedThread = threads.find(
      (t) => t.otherUser.id === selectedThread.otherUser.id,
    );
    if (updatedThread) {
      setSelectedThread({
        ...updatedThread,
        messages: [...updatedThread.messages, newMessage],
        lastMessage: newMessage,
      });
    }

    setTimeout(scrollToBottom, 100);
  }

  function handleStartConversation(recipientId) {
    const recipient = mockUsers.find((u) => u.id === recipientId);
    if (!recipient) return;

    const existingThread = threads.find((t) => t.otherUser.id === recipientId);
    if (existingThread) {
      setSelectedThread(existingThread);
      setShowNewConversation(false);
      return;
    }

    const newThread = {
      otherUser: recipient,
      messages: [],
      lastMessage: {
        id: "",
        from_user_id: "",
        to_user_id: "",
        message: "Start a new conversation",
        created_at: new Date().toISOString(),
        read: true,
      },
      unreadCount: 0,
    };

    setSelectedThread(newThread);
    setShowNewConversation(false);
  }

  function getAvailableColleagues() {
    if (!user || !profile) return [];

    const allowedRoles = ["admin", "unit_officer", "field_officer"];
    const allColleagues = mockUsers.filter(
      (u) => u.id !== user.id && allowedRoles.includes(u.role),
    );

    if (!colleagueSearchTerm.trim()) return allColleagues;

    const searchLower = colleagueSearchTerm.toLowerCase();
    return allColleagues.filter(
      (colleague) =>
        colleague.full_name.toLowerCase().includes(searchLower) ||
        colleague.email.toLowerCase().includes(searchLower) ||
        colleague.role.toLowerCase().includes(searchLower),
    );
  }

  function getAvailableIssues() {
    if (!user || !profile) return [];

    const allIssues = getIssues();
    if (profile.role === "admin") {
      return allIssues;
    } else if (profile.role === "unit_officer") {
      return allIssues.filter((issue) => issue.wardOfficer?.id === user.id);
    } else if (profile.role === "field_officer") {
      return allIssues.filter((issue) => issue.assignedTo === user.id);
    }

    return [];
  }

  function getFilteredIssues() {
    const availableIssues = getAvailableIssues();
    if (!issueSearchTerm.trim()) return availableIssues;

    const searchLower = issueSearchTerm.toLowerCase();
    return availableIssues.filter(
      (issue) =>
        issue.ticket.toLowerCase().includes(searchLower) ||
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower),
    );
  }

  function handleSelectIssue(issueId) {
    setSelectedIssueId(issueId);
    setShowIssueDropdown(false);
    setIssueSearchTerm("");
  }

  function getSelectedIssue() {
    const availableIssues = getAvailableIssues();
    return availableIssues.find((issue) => issue.id === selectedIssueId);
  }

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  const availableColleagues = getAvailableColleagues();
  const filteredIssues = getFilteredIssues();
  const selectedIssue = getSelectedIssue();

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100vh-12rem)]">
      <div
        className={`${showThreadList ? "flex" : "hidden"} md:flex w-full md:w-80 lg:w-96 bg-white rounded-xl shadow-lg border border-gray-200 flex-col`}
      >
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <MessageSquare size={24} className="mr-2 text-orange-600" />
              Messages
            </h2>
            <button
              onClick={() => setShowNewConversation(true)}
              className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              title="Start new conversation"
            >
              <UserPlus size={18} />
            </button>
          </div>
          {totalUnread > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {totalUnread} unread {totalUnread === 1 ? "message" : "messages"}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">
                Your conversations will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {threads.map((thread) => (
                <button
                  key={thread.otherUser.id}
                  onClick={() => handleSelectThread(thread)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedThread?.otherUser.id === thread.otherUser.id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                          thread.otherUser.role === "admin"
                            ? "bg-gradient-to-br from-orange-600 to-red-700"
                            : thread.otherUser.role === "unit_officer"
                              ? "bg-gradient-to-br from-teal-600 to-emerald-700"
                              : "bg-gradient-to-br from-cyan-600 to-blue-700"
                        }`}
                      >
                        {thread.otherUser.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {thread.otherUser.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {thread.otherUser.role === "admin"
                            ? "Admin"
                            : thread.otherUser.role === "unit_officer"
                              ? "Ward Officer"
                              : "Field Officer"}
                        </p>
                      </div>
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {thread.lastMessage.from_user_id === user?.id
                      ? "You: "
                      : ""}
                    {thread.lastMessage.message}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    {new Date(thread.lastMessage.created_at).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`${selectedThread ? "flex" : "hidden md:flex"} flex-1 bg-white rounded-xl shadow-lg border border-gray-200 flex-col`}
      >
        {selectedThread ? (
          <>
            <div className="p-3 md:p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={() => {
                      setSelectedThread(null);
                      setShowThreadList(true);
                    }}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Back to conversations"
                  >
                    <ChevronRight
                      size={20}
                      className="text-gray-600 transform rotate-180"
                    />
                  </button>
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg ${
                      selectedThread.otherUser.role === "admin"
                        ? "bg-gradient-to-br from-orange-600 to-red-700"
                        : selectedThread.otherUser.role === "unit_officer"
                          ? "bg-gradient-to-br from-teal-600 to-emerald-700"
                          : "bg-gradient-to-br from-cyan-600 to-blue-700"
                    }`}
                  >
                    {selectedThread.otherUser.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 truncate">
                      {selectedThread.otherUser.full_name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 truncate">
                      {selectedThread.otherUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedThread(null);
                    setShowThreadList(true);
                  }}
                  className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close conversation"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3 md:space-y-4 bg-gray-50">
              {selectedThread.messages.map((msg) => {
                const isFromMe = msg.from_user_id === user?.id;
                const allIssues = getIssues();
                const referencedIssues = msg.issue_ids
                  ? allIssues.filter((issue) =>
                      msg.issue_ids.includes(issue.id),
                    )
                  : [];

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] ${isFromMe ? "order-2" : "order-1"}`}
                    >
                      <div
                        className={`p-4 rounded-lg shadow-sm ${
                          isFromMe
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                        {msg.issue_ids && msg.issue_ids.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                            <div className="flex items-center gap-2 text-xs opacity-90">
                              <FileText size={14} />
                              <span className="font-medium">
                                Referenced {msg.issue_ids.length}{" "}
                                {msg.issue_ids.length === 1
                                  ? "Issue"
                                  : "Issues"}
                                :
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {referencedIssues.map((issue) => (
                                <div
                                  key={issue.id}
                                  className={`group relative text-xs px-2.5 py-1.5 rounded ${
                                    isFromMe
                                      ? "bg-white/20 hover:bg-white/30"
                                      : "bg-gray-100 hover:bg-gray-200"
                                  } transition-colors cursor-pointer`}
                                  title={issue.description}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-mono text-xs ${isFromMe ? "opacity-80" : "text-gray-500"}`}
                                    >
                                      {issue.ticket}
                                    </span>
                                    <span className="font-medium truncate">
                                      {issue.title}
                                    </span>
                                  </div>
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-80">
                                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
                                      <div className="font-semibold mb-1">
                                        {issue.ticket}: {issue.title}
                                      </div>
                                      <div className="text-gray-300 mb-2">
                                        {issue.description}
                                      </div>
                                      <div className="flex items-center gap-4 text-gray-400">
                                        <span className="capitalize">
                                          {issue.category}
                                        </span>
                                        <span>•</span>
                                        <span className="capitalize">
                                          {issue.status.replace("_", " ")}
                                        </span>
                                        <span>•</span>
                                        <span className="capitalize">
                                          {issue.severity}
                                        </span>
                                      </div>
                                      <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-xs text-gray-500 mt-1 ${isFromMe ? "text-right" : "text-left"}`}
                      >
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-5 border-t border-gray-200 bg-white">
              <div className="mb-3 relative" ref={issueDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Issue (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowIssueDropdown(!showIssueDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-left bg-white hover:border-gray-400 transition-colors flex items-center justify-between"
                >
                  <span
                    className={
                      selectedIssue ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {selectedIssue
                      ? `${selectedIssue.ticket} - ${selectedIssue.title}`
                      : "No issue reference"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${showIssueDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showIssueDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={issueSearchTerm}
                          onChange={(e) => setIssueSearchTerm(e.target.value)}
                          placeholder="Search by ID, title, or description..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      <button
                        onClick={() => handleSelectIssue("")}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors text-gray-500 border-b border-gray-200"
                      >
                        No issue reference
                      </button>
                      {filteredIssues.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No issues found
                        </div>
                      ) : (
                        filteredIssues.map((issue) => (
                          <button
                            key={issue.id}
                            onClick={() => handleSelectIssue(issue.id)}
                            className={`w-full px-3 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 ${
                              selectedIssueId === issue.id ? "bg-blue-100" : ""
                            }`}
                          >
                            <div className="font-medium text-gray-900 mb-1">
                              {issue.ticket} - {issue.title}
                            </div>
                            <div className="text-xs text-gray-600 line-clamp-2">
                              {issue.description}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  issue.severity === "high"
                                    ? "bg-red-100 text-red-700"
                                    : issue.severity === "medium"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {issue.severity}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {issue.category}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm md:text-base"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  className="px-4 md:px-6 py-2 md:py-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} className="md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">Send</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 hidden sm:block">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">
                Choose a thread from the left to view messages
              </p>
            </div>
          </div>
        )}
      </div>

      {showNewConversation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">
                  Start New Conversation
                </h3>
                <button
                  onClick={() => {
                    setShowNewConversation(false);
                    setColleagueSearchTerm("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={colleagueSearchTerm}
                  onChange={(e) => setColleagueSearchTerm(e.target.value)}
                  placeholder="Search colleagues by name, email, or role..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {availableColleagues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">
                    {colleagueSearchTerm
                      ? "No colleagues found"
                      : "No colleagues available"}
                  </p>
                  {colleagueSearchTerm && (
                    <p className="text-sm mt-1">Try a different search term</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {availableColleagues.map((colleague) => (
                    <button
                      key={colleague.id}
                      onClick={() => {
                        handleStartConversation(colleague.id);
                        setColleagueSearchTerm("");
                      }}
                      className="w-full p-3 md:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg ${
                            colleague.role === "admin"
                              ? "bg-gradient-to-br from-orange-600 to-red-700"
                              : colleague.role === "unit_officer"
                                ? "bg-gradient-to-br from-teal-600 to-emerald-700"
                                : "bg-gradient-to-br from-cyan-600 to-blue-700"
                          }`}
                        >
                          {colleague.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 group-hover:text-orange-700 transition-colors text-sm md:text-base truncate">
                            {colleague.full_name}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            {colleague.role === "admin"
                              ? "Admin"
                              : colleague.role === "unit_officer"
                                ? "Ward Officer"
                                : "Field Officer"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {colleague.email}
                          </p>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0 md:w-5 md:h-5"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
