import { Calendar, MapPin, Tag, User, AlertTriangle } from 'lucide-react';

const statusColors = {
  pending: 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-300',
  in_progress: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border-blue-300',
  resolved: 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-300',
  rejected: 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-300',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const categoryLabels = {
  road: 'Road & Infrastructure',
  lighting: 'Street Lighting',
  waste: 'Waste Management',
  water: 'Water Supply',
  other: 'Other',
};

const categoryIcons = {
  road: '🛣️',
  lighting: '💡',
  waste: '🗑️',
  water: '💧',
  other: '📋',
};

export function AdminIssueCard({ issue, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
    >
      {issue.photo_url && (
        <div className="relative overflow-hidden h-48">
          <img
            src={issue.photo_url}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 flex-1 group-hover:text-blue-600 transition-colors">{issue.title}</h3>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${
                statusColors[issue.status]
              }`}
            >
              {statusLabels[issue.status]}
            </span>
            {issue.is_overdue && issue.status !== 'resolved' && issue.status !== 'rejected' && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full flex items-center gap-1 border border-red-300">
                <AlertTriangle size={12} />
                Overdue
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{issue.description}</p>

        <div className="space-y-2.5">
          <div className="flex items-center text-sm text-gray-600">
            <div className="bg-blue-50 p-1.5 rounded-md mr-2">
              <Tag size={14} className="text-blue-600" />
            </div>
            <span className="font-medium">
              {categoryIcons[issue.category]} {categoryLabels[issue.category]}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <div className="bg-gray-50 p-1.5 rounded-md mr-2">
              <Calendar size={14} className="text-gray-600" />
            </div>
            <span>{new Date(issue.created_at).toLocaleDateString()}</span>
          </div>

          {issue.address && (
            <div className="flex items-center text-sm text-gray-600">
              <div className="bg-green-50 p-1.5 rounded-md mr-2">
                <MapPin size={14} className="text-green-600" />
              </div>
              <span className="truncate">{issue.address}</span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <span className="font-mono text-xs bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-semibold">
              {issue.ticket_id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
