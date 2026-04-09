import { X, Send, User, MessageSquare } from "lucide-react";
import { useState } from "react";

export function AdminMessageModal({ officer, issues, onClose, onSend }) {
  const [message, setMessage] = useState("");
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [sending, setSending] = useState(false);

  if (!officer) return null;

  function handleSend() {
    if (!message.trim()) return;

    setSending(true);
    setTimeout(() => {
      onSend(
        officer.id,
        message,
        selectedIssues.length > 0 ? selectedIssues : undefined,
      );
      setSending(false);
      onClose();
    }, 500);
  }

  function toggleIssue(issueId) {
    setSelectedIssues((prev) =>
      prev.includes(issueId)
        ? prev.filter((id) => id !== issueId)
        : [...prev, issueId],
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 flex justify-between items-start rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <MessageSquare size={28} className="mr-3" />
              Send Message to Officer
            </h2>
            <p className="text-orange-100 text-sm mt-1">
              Communicate work updates and instructions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-orange-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                  officer.role === "unit_officer"
                    ? "bg-gradient-to-br from-teal-600 to-emerald-700"
                    : "bg-gradient-to-br from-cyan-600 to-blue-700"
                }`}
              >
                {officer.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {officer.full_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      officer.role === "unit_officer"
                        ? "bg-teal-200 text-teal-800"
                        : "bg-cyan-200 text-cyan-800"
                    }`}
                  >
                    {officer.role === "unit_officer"
                      ? "🏛️ Ward Officer"
                      : "🔧 Field Officer"}
                  </span>
                  {officer.ward_zone && (
                    <span className="text-sm text-gray-600 font-medium">
                      {officer.ward_zone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {issues && issues.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Reference Specific Issues (Optional)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {issues.map((issue) => (
                  <label
                    key={issue.id}
                    className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIssues.includes(issue.id)}
                      onChange={() => toggleIssue(issue.id)}
                      className="mt-1 mr-3 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-500">
                          {issue.ticket}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            issue.severity === "high"
                              ? "bg-red-100 text-red-700"
                              : issue.severity === "medium"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 text-sm">
                        {issue.title}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {selectedIssues.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {selectedIssues.length}{" "}
                  {selectedIssues.length === 1 ? "issue" : "issues"} selected
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="text-red-500">*</span> Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here... e.g., Please prioritize the high-priority issues, Update on progress needed by end of day, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-40 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              This message will be sent to {officer.full_name} and appear in
              their notifications
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:shadow-lg disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all"
            >
              <Send size={20} className="mr-2" />
              {sending ? "Sending..." : "Send Message"}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
