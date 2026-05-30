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
      if (!threadMap.has(otherUserId)) threadMap.set(otherUserId, []);
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
      setShowThreadList(false);
      return;
    }
    const newThread = {
      otherUser: recipient,
      messages: [],
      lastMessage: null,
      unreadCount: 0,
    };
    // Add to threads list immediately so sidebar stays consistent
    setThreads((prev) => [newThread, ...prev]);
    setSelectedThread(newThread);
    setShowNewConversation(false);
    setShowThreadList(false);
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
    if (profile.role === "admin") return allIssues;
    else if (profile.role === "unit_officer")
      return allIssues.filter((issue) => issue.wardOfficer?.id === user.id);
    else if (profile.role === "field_officer")
      return allIssues.filter((issue) => issue.assignedTo === user.id);
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

  // ─── helpers ───────────────────────────────────────────────────────────────
  function roleGradient(role) {
    return role === "admin"
      ? "from-rose-500 to-orange-600"
      : role === "unit_officer"
        ? "from-teal-500 to-emerald-600"
        : "from-cyan-500 to-blue-600";
  }
  function roleLabel(role) {
    return role === "admin"
      ? "Admin"
      : role === "unit_officer"
        ? "Ward Officer"
        : "Field Officer";
  }
  function statusDot(status) {
    return status === "resolved"
      ? "bg-emerald-500"
      : status === "in_progress"
        ? "bg-blue-500"
        : "bg-amber-500";
  }
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <div
        className={`${showThreadList ? "flex" : "hidden"} md:flex w-full md:w-72 lg:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0`}
      >
        {/* Sidebar header */}
        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <MessageSquare size={15} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">Messages</span>
            {totalUnread > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full animate-pulse leading-none">
                {totalUnread}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowNewConversation(true)}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors group"
            title="Start new conversation"
          >
            <UserPlus size={14} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </button>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto py-2">
          {threads.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={20} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start one with the button above</p>
            </div>
          ) : (
            <div className="px-2 space-y-0.5">
              {threads.map((thread) => {
                const isActive = selectedThread?.otherUser.id === thread.otherUser.id;
                return (
                  <button
                    key={thread.otherUser.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`w-full px-3 py-3 rounded-xl text-left transition-all duration-150 group ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-500/10"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleGradient(thread.otherUser.role)} flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0`}
                        >
                          {thread.otherUser.full_name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold leading-tight ${isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200"}`}>
                            {thread.otherUser.full_name}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                            {roleLabel(thread.otherUser.role)}
                          </p>
                        </div>
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 animate-pulse">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate leading-relaxed pl-[42px]">
                      {thread.lastMessage
                        ? (
                          <>
                            {thread.lastMessage.from_user_id === user?.id
                              ? <span className="text-slate-300 dark:text-slate-600">You: </span>
                              : ""}
                            {thread.lastMessage.message}
                          </>
                        )
                        : <span className="italic">No messages yet</span>}
                    </p>
                    {thread.lastMessage && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 pl-[42px]">
                        <Clock size={9} />
                        <span>{new Date(thread.lastMessage.created_at).toLocaleString()}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ CHAT AREA ════════════════════════════════════════════════════════ */}
      <div
        className={`${selectedThread ? "flex" : "hidden md:flex"} flex-1 flex-col bg-slate-50 dark:bg-slate-950 min-w-0`}
      >
        {selectedThread ? (
          <>
            {/* Chat header */}
            <div className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedThread(null); setShowThreadList(true); }}
                  className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronRight size={17} className="text-slate-500 rotate-180" />
                </button>
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleGradient(selectedThread.otherUser.role)} flex items-center justify-center text-white text-[11px] font-bold shadow-sm`}
                >
                  {selectedThread.otherUser.full_name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {selectedThread.otherUser.full_name}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {selectedThread.otherUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedThread(null); setShowThreadList(true); }}
                className="hidden md:flex p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={15} className="text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {selectedThread.messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={22} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    No messages yet
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Send a message to start the conversation
                  </p>
                </div>
              )}
              {selectedThread.messages.map((msg) => {
                const isFromMe = msg.from_user_id === user?.id;
                const allIssues = getIssues();
                const referencedIssues = msg.issue_ids
                  ? allIssues.filter((issue) => msg.issue_ids.includes(issue.id))
                  : [];

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%] md:max-w-[62%] ${isFromMe ? "order-2" : "order-1"}`}>
                      {/* Bubble */}
                      <div
                        className={`px-4 py-3 shadow-sm ${
                          isFromMe
                            ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl rounded-br-sm"
                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>

                        {/* Issue references */}
                        {msg.issue_ids && msg.issue_ids.length > 0 && (
                          <div className={`mt-3 pt-3 border-t ${isFromMe ? "border-white/20" : "border-slate-100 dark:border-slate-700"} space-y-1.5`}>
                            <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-2 ${isFromMe ? "text-white/60" : "text-slate-400 dark:text-slate-500"}`}>
                              <FileText size={10} />
                              <span>
                                {msg.issue_ids.length === 1 ? "Linked Issue" : `${msg.issue_ids.length} Linked Issues`}
                              </span>
                            </div>
                            {referencedIssues.map((issue) => (
                              <div
                                key={issue.id}
                                className={`group relative flex items-stretch rounded-lg transition-all duration-150 hover:-translate-y-px hover:shadow-md cursor-pointer ${
                                  isFromMe
                                    ? "bg-white/15 hover:bg-white/25"
                                    : "bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600"
                                }`}
                              >
                                <div className={`w-1 shrink-0 ${statusDot(issue.status)}`} />
                                <div className="px-2.5 py-1.5 flex-1 min-w-0 flex items-center gap-2">
                                  <span className={`font-mono text-[10px] font-bold shrink-0 ${isFromMe ? "text-white/55" : "text-slate-400"}`}>
                                    {issue.ticket}
                                  </span>
                                  <span className={`text-xs font-medium truncate ${isFromMe ? "text-white/90" : "text-slate-700 dark:text-slate-300"}`}>
                                    {issue.title}
                                  </span>
                                </div>
                                {/* Hover tooltip */}
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 pointer-events-none">
                                  <div className="bg-slate-900 text-white text-xs rounded-xl p-3.5 shadow-2xl border border-slate-700/60">
                                    <p className="font-semibold mb-1">{issue.ticket}: {issue.title}</p>
                                    <p className="text-slate-400 mb-2.5 leading-relaxed line-clamp-3">{issue.description}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${issue.severity === "high" ? "bg-red-500/20 text-red-300" : issue.severity === "medium" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}`}>
                                        {issue.severity}
                                      </span>
                                      <span className="text-slate-600">·</span>
                                      <span className="text-slate-400 capitalize">{issue.category}</span>
                                      <span className="text-slate-600">·</span>
                                      <span className="text-slate-400 capitalize">{issue.status.replace("_", " ")}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className={`text-[10px] text-slate-400 mt-1 ${isFromMe ? "text-right" : "text-left"}`}>
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* ── INPUT BAR ─────────────────────────────────────────────── */}
            <div className="px-4 pb-4 pt-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              {/* Issue reference picker */}
              <div className="mb-2 relative" ref={issueDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowIssueDropdown(!showIssueDropdown)}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-xl border transition-all flex items-center justify-between ${
                    selectedIssue
                      ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-300"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={12} className={selectedIssue ? "text-blue-500" : "text-slate-400"} />
                    <span className="truncate">
                      {selectedIssue
                        ? `${selectedIssue.ticket} — ${selectedIssue.title}`
                        : "Link an issue (optional)"}
                    </span>
                  </div>
                  <ChevronDown
                    size={12}
                    className={`shrink-0 transition-transform ${showIssueDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showIssueDropdown && (
                  <div className="absolute z-50 w-full bottom-full mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-hidden flex flex-col">
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-700 shrink-0">
                      <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={issueSearchTerm}
                          onChange={(e) => setIssueSearchTerm(e.target.value)}
                          placeholder="Search by ID, title…"
                          className="w-full pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white placeholder:text-slate-400"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <button
                        onClick={() => handleSelectIssue("")}
                        className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-400 border-b border-slate-100 dark:border-slate-700/50"
                      >
                        No issue reference
                      </button>
                      {filteredIssues.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No issues found</div>
                      ) : (
                        filteredIssues.map((issue) => (
                          <button
                            key={issue.id}
                            onClick={() => handleSelectIssue(issue.id)}
                            className={`w-full px-3 py-2.5 text-left text-xs border-b border-slate-100 dark:border-slate-700/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedIssueId === issue.id ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(issue.status)}`} />
                              <span className="font-mono text-[10px] text-slate-400 shrink-0">{issue.ticket}</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{issue.title}</span>
                            </div>
                            <p className="text-slate-400 line-clamp-1 pl-4 text-[11px]">{issue.description}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Compose row */}
              <div className="flex gap-2 items-end bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 dark:focus-within:border-blue-600 transition-all">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent resize-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none leading-relaxed py-1 max-h-32"
                  rows={2}
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
                  className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-500/25 active:scale-95 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-150 shrink-0 self-end mb-0.5"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 hidden sm:block text-right">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No conversation selected</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Pick a thread from the sidebar</p>
            </div>
          </div>
        )}
      </div>

      {/* ══ NEW CONVERSATION MODAL ═══════════════════════════════════════════ */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[80vh] flex flex-col">
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">New Conversation</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Search and select a colleague</p>
              </div>
              <button
                onClick={() => { setShowNewConversation(false); setColleagueSearchTerm(""); }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={15} className="text-slate-400" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={colleagueSearchTerm}
                  onChange={(e) => setColleagueSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or role…"
                  className="w-full pl-8 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Colleague list */}
            <div className="flex-1 overflow-y-auto p-3">
              {availableColleagues.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User size={17} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {colleagueSearchTerm ? "No colleagues found" : "No colleagues available"}
                  </p>
                  {colleagueSearchTerm && (
                    <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {availableColleagues.map((colleague) => (
                    <button
                      key={colleague.id}
                      onClick={() => { handleStartConversation(colleague.id); setColleagueSearchTerm(""); }}
                      className="w-full px-3 py-2.5 rounded-xl text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:-translate-y-px hover:shadow-sm transition-all duration-150 group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleGradient(colleague.role)} flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0`}
                        >
                          {colleague.full_name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors truncate">
                            {colleague.full_name}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400 dark:text-slate-500">
                            {roleLabel(colleague.role)}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {colleague.email}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors shrink-0" />
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
