// src/pages/company/pages/Notifications.jsx

import { Ico } from "../components/Shared";

const TYPE_ICON = {
  applicant: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  approval:  "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  rejection: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
};

const TYPE_COLOR = {
  applicant: "bg-violet-500/10 text-violet-600",
  approval:  "bg-emerald-500/10 text-emerald-600",
  rejection: "bg-red-500/10 text-red-600",
};

const Notifications = ({ notifs, setNotifs }) => {
  const unread = notifs.filter(n => !n.read).length;

  const markAll = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const markOne = (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="max-w-2xl space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-400 text-sm mt-0.5">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition">
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {notifs.map(n => (
          <div key={n.id} onClick={() => markOne(n.id)}
            className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
              n.read
                ? "bg-white border-gray-100 hover:border-gray-200"
                : "bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-100"
            }`}>

            {/* Icon */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[n.type]}`}>
              <Ico d={TYPE_ICON[n.type]} size={16} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${n.read ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                {n.text}
              </p>
              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
            </div>

            {/* Unread dot */}
            {!n.read && (
              <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
            )}
          </div>
        ))}

        {notifs.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;