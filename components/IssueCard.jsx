import {
  MapPin,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader,
} from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pending Review",
    color: "amber",
    icon: Clock,
    progress: 25,
    bgGradient: "from-amber-50 to-amber-100/50",
    borderColor: "border-amber-300",
    textColor: "text-amber-700",
    badgeBg: "bg-amber-100",
  },
  in_progress: {
    label: "In Progress",
    color: "blue",
    icon: Loader,
    progress: 65,
    bgGradient: "from-blue-50 to-blue-100/50",
    borderColor: "border-blue-300",
    textColor: "text-blue-700",
    badgeBg: "bg-blue-100",
  },
  resolved: {
    label: "Resolved",
    color: "emerald",
    icon: CheckCircle,
    progress: 100,
    bgGradient: "from-emerald-50 to-emerald-100/50",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-700",
    badgeBg: "bg-emerald-100",
  },
  rejected: {
    label: "Rejected",
    color: "red",
    icon: XCircle,
    progress: 100,
    bgGradient: "from-red-50 to-red-100/50",
    borderColor: "border-red-300",
    textColor: "text-red-700",
    badgeBg: "bg-red-100",
  },
};

const categoryLabels = {
  road: "Road & Infrastructure",
  lighting: "Street Lighting",
  waste: "Waste Management",
  water: "Water Supply",
  other: "Other",
};

export function IssueCard({ issue, onClick }) {
  const config = statusConfig[issue.status];
  const StatusIcon = config.icon;

  function getTimeAgo(date) {
    const now = new Date();
    const issueDate = new Date(date);
    const diffMs = now.getTime() - issueDate.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return issueDate.toLocaleDateString();
  }

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer bg-gradient-to-br ${config.bgGradient} rounded-xl border-2 ${config.borderColor} p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
              {issue.id}
            </span>
            <span
              className={`px-3 py-1 ${config.badgeBg} ${config.textColor} rounded-full text-xs font-semibold flex items-center gap-1`}
            >
              <StatusIcon size={14} />
              {config.label}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {issue.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {issue.description}
          </p>
        </div>

        {issue.photoUrl ? (
          <img
            src={issue.photoUrl}
            alt={issue.title}
            className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md ml-4"
          />
        ) : (
          <img
            src={"/dummy.png"}
            alt={issue.title}
            className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md ml-4"
          />
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin size={16} className="mr-2 text-gray-400" />
          <span className="line-clamp-1">
            {issue.address || "Location not specified"}
          </span>
        </div>

        {issue.assignee && (
          <div className="flex items-center text-sm text-gray-600">
            <User size={16} className="mr-2 text-gray-400" />
            <span>Assigned to {issue.assignee.full_name}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-500">
          <Clock size={16} className="mr-2 text-gray-400" />
          <span>Reported {getTimeAgo(issue.created_at)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-1">
          <span>Progress</span>
          <span className={config.textColor}>{config.progress}%</span>
        </div>

        <div className="relative h-3 bg-white rounded-full overflow-hidden border border-gray-200 shadow-inner">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${
              issue.status === "pending"
                ? "from-amber-400 to-amber-500"
                : issue.status === "in_progress"
                  ? "from-blue-400 to-blue-600"
                  : issue.status === "resolved"
                    ? "from-emerald-400 to-emerald-600"
                    : "from-red-400 to-red-600"
            } transition-all duration-500 shadow-lg`}
            style={{ width: `${config.progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/30"></div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-200 text-gray-600 font-medium">
          {categoryLabels[issue.category]}
        </span>

        {issue.upvotes > 0 && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <span className="text-blue-600 font-semibold">{issue.upvotes}</span>{" "}
            upvotes
          </span>
        )}
      </div>
    </div>
  );
}
