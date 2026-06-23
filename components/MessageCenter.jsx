"use client";

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
  Briefcase,
  MapPin,
  Users,
  CheckCheck,
  Check,
  Tag,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useSession } from "next-auth/react";
import { mockUsers } from "../lib/mockData";

export function MessagesCenter({ user, profile }) {
  const { data: session } = useSession();

  // Resolve user email to query their profile in Convex database
  let resolvedEmail = session?.user?.email;
  if (!resolvedEmail && user) {
    if (user.email) {
      resolvedEmail = user.email;
    } else if (user.id) {
      const mockU = mockUsers.find((u) => u.id === user.id);
      if (mockU) resolvedEmail = mockU.email;
    }
  }

  const dbUser = useQuery(api.users.getUserByEmail, {
    email: resolvedEmail || "ankit@example.com",
  });

  const CURRENT_USER_ID = dbUser?._id;

  const rawConvs = useQuery(
    api.directMessages.getUserConversations,
    CURRENT_USER_ID ? { userId: CURRENT_USER_ID } : "skip"
  ) || [];

  const rawOfficials = useQuery(
    api.directMessages.getAllOfficials,
    CURRENT_USER_ID ? { userId: CURRENT_USER_ID } : "skip"
  ) || [];

  const startConversationMutation = useMutation(api.directMessages.startConversation);
  const sendMessageMutation = useMutation(api.directMessages.sendMessage);
  const markMessagesAsReadMutation = useMutation(api.directMessages.markMessagesAsRead);
  const updateConversationIssueMutation = useMutation(api.directMessages.updateConversationIssue);
  const seedCityAdminIfNeeded = useMutation(api.users.seedCityAdminIfNeeded);

  // States
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [activeRecipientId, setActiveRecipientId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [issueSearchTerm, setIssueSearchTerm] = useState("");
  const [showIssueDropdown, setShowIssueDropdown] = useState(false);
  const [colleagueSearchTerm, setColleagueSearchTerm] = useState("");

  // Filters for New Conversation Modal
  const [selectedCityFilter, setSelectedCityFilter] = useState("all");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");

  const issueDropdownRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showThreadList, setShowThreadList] = useState(true);

  // Map Convex raw conversations to local thread format
  const conversations = rawConvs.map((conv) => {
    const otherUser = rawOfficials.find(
      (o) => o.id !== CURRENT_USER_ID && conv.participantIds.includes(o.id)
    );
    return {
      ...conv,
      id: conv._id,
      otherUser,
      unreadCount: conv.unreadCountMap ? conv.unreadCountMap[CURRENT_USER_ID] || 0 : 0,
      lastMessage: conv.lastMessage || "",
      lastMessageTime: conv.lastMessageTime || Date.now(),
    };
  });

  // Inject draft conversation if activeRecipientId is set and no conversation exists yet
  if (activeRecipientId) {
    const otherUser = rawOfficials.find((o) => o.id === activeRecipientId);
    if (otherUser) {
      conversations.push({
        id: "draft",
        participantIds: [CURRENT_USER_ID, activeRecipientId],
        otherUser,
        unreadCount: 0,
        lastMessage: "",
        lastMessageTime: Date.now(),
      });
    }
  }

  // Sort conversations by lastMessageTime descending
  const sortedConversations = [...conversations].sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  const selectedThread = conversations.find((c) => c.id === selectedThreadId);

  // Fetch messages for active conversation
  const rawMessages = useQuery(
    api.directMessages.getMessagesByConversation,
    selectedThreadId && selectedThreadId !== "draft" ? { conversationId: selectedThreadId } : "skip"
  ) || [];

  // Fetch available issues to reference
  const availableIssues = useQuery(
    api.directMessages.getLinkableIssues,
    CURRENT_USER_ID
      ? {
          userId: CURRENT_USER_ID,
          otherUserId: selectedThread?.otherUser?.id || activeRecipientId || undefined,
        }
      : "skip"
  ) || [];

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
  }, [rawMessages.length]);

  useEffect(() => {
    if (selectedThreadId && CURRENT_USER_ID) {
      markMessagesAsReadMutation({
        conversationId: selectedThreadId,
        userId: CURRENT_USER_ID,
      }).catch((err) => console.error("Error marking messages as read:", err));
    }
  }, [selectedThreadId, rawMessages.length, CURRENT_USER_ID]);

  useEffect(() => {
    if (CURRENT_USER_ID && dbUser?.role === "city_admin") {
      seedCityAdminIfNeeded({ userId: CURRENT_USER_ID }).catch((err) =>
        console.error("Error seeding city admin profile:", err)
      );
    }
  }, [CURRENT_USER_ID, dbUser]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleSelectThread(thread) {
    setSelectedThreadId(thread.id);
    setActiveRecipientId(thread.id === "draft" ? thread.participantIds.find(id => id !== CURRENT_USER_ID) : null);
    setShowThreadList(false);
    if (thread.id !== "draft") {
      markMessagesAsReadMutation({
        conversationId: thread.id,
        userId: CURRENT_USER_ID,
      }).catch((err) => console.error("Error marking messages as read:", err));
    }
    setTimeout(scrollToBottom, 100);
  }

  async function handleSendReply() {
    if (!selectedThreadId || !CURRENT_USER_ID || !replyText.trim()) return;
    setSending(true);
    try {
      if (selectedThreadId === "draft" && activeRecipientId) {
        // Create conversation and send first message
        const convId = await startConversationMutation({
          participantIds: [CURRENT_USER_ID, activeRecipientId],
          initialMessage: replyText.trim(),
          fromId: CURRENT_USER_ID,
          fromName: dbUser.fullName,
          fromRole: dbUser.role,
          issueId: selectedIssueId ? selectedIssueId : undefined,
          issueTitle: selectedIssue ? selectedIssue.title : undefined,
          issueStatus: selectedIssue ? selectedIssue.status : undefined,
        });
        setSelectedThreadId(convId);
        setActiveRecipientId(null);
      } else if (selectedThreadId && selectedThreadId !== "draft") {
        await sendMessageMutation({
          conversationId: selectedThreadId,
          fromId: CURRENT_USER_ID,
          fromName: dbUser.fullName,
          fromRole: dbUser.role,
          message: replyText.trim(),
          issueIds: selectedIssueId ? [selectedIssueId] : undefined,
        });
      }
      setReplyText("");
      setSelectedIssueId("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 100);
    }
  }

  function handleStartConversation(recipientId) {
    if (!CURRENT_USER_ID) return;
    const recipient = rawOfficials.find((u) => u.id === recipientId);
    if (!recipient) return;

    // Check if conversation already exists
    const existing = conversations.find(
      (c) => c.participantIds.includes(recipientId) && c.id !== "draft"
    );
    if (existing) {
      setSelectedThreadId(existing.id);
      setActiveRecipientId(null);
    } else {
      setSelectedThreadId("draft");
      setActiveRecipientId(recipientId);
    }
    setShowNewConversation(false);
    setShowThreadList(false);
  }

  // Get available colleagues matching filter/search criteria
  function getFilteredColleagues() {
    if (!CURRENT_USER_ID) return [];
    
    let list = rawOfficials.filter((u) => u.id !== CURRENT_USER_ID);

    // Apply Search Term
    if (colleagueSearchTerm.trim()) {
      const q = colleagueSearchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          (c.department && c.department.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q))
      );
    }

    // Apply Role Filter
    if (selectedRoleFilter !== "all") {
      list = list.filter((c) => c.role.toLowerCase() === selectedRoleFilter.toLowerCase());
    }

    // Apply City Filter
    if (selectedCityFilter !== "all") {
      list = list.filter((c) => c.city && c.city.toLowerCase() === selectedCityFilter.toLowerCase());
    }

    // Apply Department Filter
    if (selectedDeptFilter !== "all") {
      list = list.filter(
        (c) => c.department && c.department.toLowerCase() === selectedDeptFilter.toLowerCase()
      );
    }

    return list;
  }

  // Dynamic filter values
  const availableCities = Array.from(
    new Set(rawOfficials.map((o) => o.city).filter(Boolean))
  ).sort();
  
  const availableDepts = Array.from(
    new Set(rawOfficials.map((o) => o.department).filter(Boolean))
  ).sort();

  const filteredColleagues = getFilteredColleagues();

  // Grouped colleagues for UI rendering
  function getGroupedColleagues() {
    const colleagues = filteredColleagues;
    const grouped = {};

    colleagues.forEach((c) => {
      // Group by City first
      const cityGroup = c.city || "Administration / Global";
      if (!grouped[cityGroup]) grouped[cityGroup] = {};

      // Then group by Department
      const deptGroup = c.department || "General Administration";
      if (!grouped[cityGroup][deptGroup]) grouped[cityGroup][deptGroup] = [];

      grouped[cityGroup][deptGroup].push(c);
    });

    return grouped;
  }

  const groupedColleagues = getGroupedColleagues();

  function getFilteredIssues() {
    if (!issueSearchTerm.trim()) return availableIssues;
    const searchLower = issueSearchTerm.toLowerCase();
    return availableIssues.filter(
      (issue) =>
        issue.ticket.toLowerCase().includes(searchLower) ||
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower)
    );
  }

  function handleSelectIssue(issueId) {
    setSelectedIssueId(issueId);
    setShowIssueDropdown(false);
    setIssueSearchTerm("");
  }

  function handleLinkConversationIssue(issueId) {
    if (!selectedThreadId) return;

    if (!issueId) {
      updateConversationIssueMutation({
        conversationId: selectedThreadId,
        issueId: undefined,
        issueTitle: undefined,
        issueStatus: undefined,
      }).catch((err) => console.error(err));
      return;
    }

    const issue = availableIssues.find((i) => i.id === issueId);
    if (issue) {
      updateConversationIssueMutation({
        conversationId: selectedThreadId,
        issueId: issue.id,
        issueTitle: issue.title,
        issueStatus: issue.status,
      }).catch((err) => console.error(err));
    }
  }

  const totalUnread = conversations.reduce((sum, t) => sum + t.unreadCount, 0);
  const filteredIssues = getFilteredIssues();
  const selectedIssue = availableIssues.find((issue) => issue.id === selectedIssueId);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function roleGradient(role) {
    const r = (role || "").toLowerCase();
    if (r === "admin" || r === "administrator") return "from-rose-500 to-red-600";
    if (r === "cityadmin" || r === "city_admin") return "from-violet-500 to-purple-600";
    if (r === "unitofficer" || r === "unit_officer") return "from-teal-500 to-emerald-600";
    return "from-cyan-500 to-blue-600";
  }

  function roleLabel(role) {
    const r = (role || "").toLowerCase();
    if (r === "admin" || r === "administrator") return "Admin";
    if (r === "cityadmin" || r === "city_admin") return "City Admin";
    if (r === "unitofficer" || r === "unit_officer") return "Ward Officer";
    return "Field Officer";
  }

  function statusDot(status) {
    const s = (status || "").toLowerCase();
    if (s === "resolved" || s === "closed") return "bg-emerald-500";
    if (s === "in_progress" || s === "assigned") return "bg-blue-500";
    return "bg-amber-500";
  }

  if (!dbUser) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-500"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-12rem)] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <div
        className={`${showThreadList ? "flex" : "hidden"} md:flex w-full md:w-72 lg:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0`}
      >
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
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all duration-150 active:scale-95 group"
            title="Start new conversation"
          >
            <UserPlus size={14} className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {sortedConversations.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={20} className="text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start one with the button above</p>
            </div>
          ) : (
            <div className="px-2 space-y-0.5">
              {sortedConversations.map((thread) => {
                const isActive = selectedThread?.id === thread.id;
                const other = thread.otherUser;
                if (!other) return null;

                return (
                  <button
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`w-full px-3 py-3 rounded-xl text-left transition-all duration-150 group ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-500/10"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        {other.avatar ? (
                          <img
                            src={other.avatar}
                            alt={other.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleGradient(other.role)} flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0`}
                          >
                            {other.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                        )}
                        <div>
                          <p className={`text-sm font-semibold leading-tight ${isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-800 dark:text-slate-200"}`}>
                            {other.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                            {roleLabel(other.role)}
                          </p>
                        </div>
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 animate-pulse">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-450 dark:text-slate-500 truncate leading-relaxed pl-[40px]">
                      {thread.lastMessageSenderId === CURRENT_USER_ID && (
                        <span className="text-slate-400 dark:text-slate-600 font-medium">You: </span>
                      )}
                      {thread.lastMessage}
                    </p>
                    {thread.lastMessageTime && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1 pl-[40px]">
                        <Clock size={9} />
                        <span>{new Date(thread.lastMessageTime).toLocaleString()}</span>
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
                  onClick={() => { setSelectedThreadId(null); setShowThreadList(true); }}
                  className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <ChevronRight size={17} className="text-slate-500 rotate-180" />
                </button>
                {selectedThread.otherUser?.avatar ? (
                  <img
                    src={selectedThread.otherUser.avatar}
                    alt={selectedThread.otherUser.name}
                    className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-slate-100"
                  />
                ) : (
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleGradient(selectedThread.otherUser?.role)} flex items-center justify-center text-white text-[11px] font-bold shadow-sm`}
                  >
                    {selectedThread.otherUser?.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                    {selectedThread.otherUser?.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                      {roleLabel(selectedThread.otherUser?.role)}
                    </span>
                    {selectedThread.otherUser?.department && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize">
                          {selectedThread.otherUser.department.replace("_", " ")}
                        </span>
                      </>
                    )}
                    {selectedThread.otherUser?.city && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {selectedThread.otherUser.city}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedThread.issueRef ? (
                  <div 
                    style={{
                      backgroundColor: statusDot(selectedThread.issueRef.status).replace("bg-", "rgba(") + ", 0.1)",
                      borderColor: statusDot(selectedThread.issueRef.status).replace("bg-", "rgba(") + ", 0.2)",
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800"
                  >
                    <Tag size={12} className="text-blue-500" />
                    <span className="max-w-[120px] truncate">{selectedThread.issueRef.issueTitle}</span>
                    <button
                      onClick={() => handleLinkConversationIssue(null)}
                      className="ml-1 text-[10px] hover:text-red-500 font-bold"
                      title="Unlink Issue"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowIssueDropdown(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:text-blue-500 transition-colors"
                  >
                    <Tag size={12} />
                    <span>Link Context</span>
                  </button>
                )}
                <button
                  onClick={() => { setSelectedThreadId(null); setShowThreadList(true); }}
                  className="hidden md:flex p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={15} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {rawMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={22} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    No messages yet
                  </p>
                  <p className="text-xs text-slate-405 dark:text-slate-505 mt-1">
                    Send a message to start the conversation
                  </p>
                </div>
              )}
              {rawMessages.map((msg, index) => {
                const isFromMe = msg.fromId === CURRENT_USER_ID;
                const referencedIssues = msg.issueIds
                  ? availableIssues.filter((issue) => msg.issueIds.includes(issue.id || issue._id))
                  : [];

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%] md:max-w-[62%] ${isFromMe ? "order-2" : "order-1"}`}>
                      <div
                        className={`px-4 py-3 shadow-sm ${
                          isFromMe
                            ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-2xl rounded-br-sm"
                            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-wrap">
                          {msg.message}
                        </p>

                        {/* Issue references */}
                        {msg.issueIds && msg.issueIds.length > 0 && (
                          <div className={`mt-3 pt-3 border-t ${isFromMe ? "border-white/20" : "border-slate-100 dark:border-slate-700"} space-y-1.5`}>
                            <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-2 ${isFromMe ? "text-white/60" : "text-slate-400 dark:text-slate-500"}`}>
                              <FileText size={10} />
                              <span>
                                {msg.issueIds.length === 1 ? "Linked Issue" : `${msg.issueIds.length} Linked Issues`}
                              </span>
                            </div>
                            {referencedIssues.map((issue) => (
                              <div
                                key={issue.id}
                                className={`group relative flex items-stretch rounded-lg transition-all duration-150 hover:-translate-y-px hover:shadow-md cursor-pointer ${
                                  isFromMe
                                    ? "bg-white/15 hover:bg-white/25"
                                    : "bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-650"
                                }`}
                              >
                                <div className={`w-1 shrink-0 ${statusDot(issue.status)}`} />
                                <div className="px-2.5 py-1.5 flex-1 min-w-0 flex items-center gap-2">
                                  <span className={`font-mono text-[10px] font-bold shrink-0 ${isFromMe ? "text-white/70" : "text-slate-400"}`}>
                                    {issue.ticket}
                                  </span>
                                  <span className={`text-xs font-semibold truncate ${isFromMe ? "text-white/95" : "text-slate-700 dark:text-slate-300"}`}>
                                    {issue.title}
                                  </span>
                                </div>
                                {/* Hover tooltip */}
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-72 pointer-events-none transition-all duration-150">
                                  <div className="bg-slate-950 text-white text-xs rounded-xl p-3.5 shadow-2xl border border-slate-800">
                                    <p className="font-semibold mb-1 text-teal-400">{issue.ticket}: {issue.title}</p>
                                    <p className="text-slate-400 mb-2.5 leading-relaxed line-clamp-3 text-wrap">{issue.description}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${issue.severity === "high" ? "bg-red-500/20 text-red-350" : issue.severity === "medium" ? "bg-amber-500/20 text-amber-350" : "bg-blue-500/20 text-blue-350"}`}>
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
                      <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 ${isFromMe ? "justify-end" : "justify-start"}`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        {isFromMe && (
                          msg.read ? (
                            <CheckCheck size={12} className="text-amber-500" />
                          ) : (
                            <Check size={12} className="text-slate-400" />
                          )
                        )}
                      </div>
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
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-between ${
                    selectedIssue
                      ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-300"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={12} className={selectedIssue ? "text-blue-500" : "text-slate-450"} />
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
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-405" />
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
                        className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-400 border-b border-slate-100 dark:border-slate-700/50 font-medium"
                      >
                        No issue reference
                      </button>
                      {filteredIssues.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No issues found</div>
                      ) : (
                        filteredIssues.map((issue) => (
                          <button
                            key={issue.id}
                            onClick={() => {
                              handleSelectIssue(issue.id);
                              handleLinkConversationIssue(issue.id);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-xs border-b border-slate-100 dark:border-slate-700/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedIssueId === issue.id ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(issue.status)}`} />
                              <span className="font-mono text-[10px] text-slate-400 shrink-0">{issue.ticket}</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{issue.title}</span>
                            </div>
                            <p className="text-slate-405 line-clamp-1 pl-4 text-[11px]">{issue.description}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Compose row */}
              <div className="flex gap-2 items-end bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 dark:focus-within:border-blue-600 transition-all">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent resize-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none leading-relaxed py-1 max-h-32 font-medium"
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
                  className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-500 hover:from-blue-505 hover:to-cyan-450 text-white rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-500/25 active:scale-95 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-150 shrink-0 self-end mb-0.5"
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
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MessageSquare size={24} className="text-slate-350 dark:text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No conversation selected</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Pick a thread from the sidebar</p>
            </div>
          </div>
        )}
      </div>

      {/* ══ NEW CONVERSATION MODAL ═══════════════════════════════════════════ */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-blue-500" />
                  New Secure Conversation
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Start a direct messaging thread with an official</p>
              </div>
              <button
                onClick={() => {
                  setShowNewConversation(false);
                  setColleagueSearchTerm("");
                  setSelectedCityFilter("all");
                  setSelectedDeptFilter("all");
                  setSelectedRoleFilter("all");
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-90"
              >
                <X size={15} className="text-slate-400" />
              </button>
            </div>

            {/* Advanced Search & Filtering Controls */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  type="text"
                  value={colleagueSearchTerm}
                  onChange={(e) => setColleagueSearchTerm(e.target.value)}
                  placeholder="Search colleagues by name, email, role, or region..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all font-medium"
                />
              </div>

              {/* Filtering Select Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* City/Region Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    <MapPin size={10} /> Region/City
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCityFilter}
                      onChange={(e) => setSelectedCityFilter(e.target.value)}
                      className="w-full pl-2 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-200 font-semibold appearance-none cursor-pointer"
                    >
                      <option value="all">All Regions</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city.toLowerCase()}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Department Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    <Building2 size={10} /> Department
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDeptFilter}
                      onChange={(e) => setSelectedDeptFilter(e.target.value)}
                      className="w-full pl-2 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-200 font-semibold appearance-none cursor-pointer"
                    >
                      <option value="all">All Departments</option>
                      {availableDepts.map((dept) => (
                        <option key={dept} value={dept.toLowerCase()}>
                          {dept.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Role Filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                    <SlidersHorizontal size={10} /> Role
                  </label>
                  <div className="relative">
                    <select
                      value={selectedRoleFilter}
                      onChange={(e) => setSelectedRoleFilter(e.target.value)}
                      className="w-full pl-2 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-200 font-semibold appearance-none cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admins</option>
                      <option value="city_admin">City Admins</option>
                      <option value="unit_officer">Unit Officers</option>
                      <option value="field_officer">Field Officers</option>
                    </select>
                    <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Colleague list grouped by Region */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {filteredColleagues.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User size={20} className="text-slate-350" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    No colleagues match your filters
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms or filters.</p>
                </div>
              ) : (
                Object.entries(groupedColleagues).map(([city, depts]) => (
                  <div key={city} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <h4 className="text-xs font-black uppercase tracking-wider text-teal-650 dark:text-teal-405 border-b border-teal-100 dark:border-teal-900 pb-1.5 flex items-center gap-1.5">
                      <MapPin size={12} className="text-teal-500" />
                      {city}
                    </h4>

                    <div className="space-y-4 pl-2">
                      {Object.entries(depts).map(([dept, colleagues]) => (
                        <div key={dept} className="space-y-2">
                          <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 capitalize">
                            <Building2 size={10} />
                            {dept.replace("_", " ")}
                          </h5>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {colleagues.map((colleague) => (
                              <button
                                key={colleague.id}
                                onClick={() => {
                                  handleStartConversation(colleague.id);
                                  setColleagueSearchTerm("");
                                }}
                                className="px-3.5 py-3 rounded-2xl text-left border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 bg-white hover:bg-blue-50/20 dark:bg-slate-900 dark:hover:bg-slate-850 hover:-translate-y-px hover:shadow-sm transition-all duration-150 flex items-center gap-3 group"
                              >
                                {colleague.avatar ? (
                                  <img
                                    src={colleague.avatar}
                                    alt={colleague.name}
                                    className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-100"
                                  />
                                ) : (
                                  <div
                                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleGradient(colleague.role)} flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0`}
                                  >
                                    {colleague.name.split(" ").map((n) => n[0]).join("")}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {colleague.name}
                                  </p>
                                  <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400 mt-0.5">
                                    {roleLabel(colleague.role)}
                                  </p>
                                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-medium">
                                    {colleague.email}
                                  </p>
                                </div>
                                <ChevronRight size={14} className="text-slate-355 dark:text-slate-700 group-hover:text-blue-500 transition-colors shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
