// src/pages/student/pages/Notifications.jsx

import Icon from "../components/Icon";
import { MOCK_NOTIFICATIONS, icons } from "../components/data/mockData";

const iconMap = {
  accepted: { icon: icons.check, color: "text-green-600",  bg: "bg-green-50" },
  rejected: { icon: icons.x,     color: "text-red-500",    bg: "bg-red-50" },
  info:     { icon: icons.bell,  color: "text-indigo-600", bg: "bg-indigo-50" },
};

const Notifications = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
      <p className="text-sm text-gray-400 mt-1">{MOCK_NOTIFICATIONS.length} updates</p>
    </div>
    <div className="space-y-3">
      {MOCK_NOTIFICATIONS.map(n => {
        const { icon, color, bg } = iconMap[n.type] ?? iconMap.info;
        return (
          <div key={n.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Icon d={icon} size={16} stroke={color.replace("text-", "")} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default Notifications;