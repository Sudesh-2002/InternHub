// src/pages/student/pages/MyApplications.jsx

import Avatar from "../components/Avatar";
import Badge  from "../components/Badge";
import { MOCK_APPLICATIONS, avatarColors } from "../components/data/mockData";

const MyApplications = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
      <p className="text-sm text-gray-400 mt-1">
        {MOCK_APPLICATIONS.length} applications total
      </p>
    </div>
    <div className="space-y-3">
      {MOCK_APPLICATIONS.map((app, i) => (
        <div key={app.id}
          className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar
              initials={app.company.slice(0, 2).toUpperCase()}
              color={avatarColors[i % avatarColors.length]}
            />
            <div>
              <p className="text-sm font-semibold text-gray-800">{app.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {app.company} · Applied {app.appliedDate}
              </p>
            </div>
          </div>
          <Badge status={app.status} />
        </div>
      ))}
    </div>
  </div>
);

export default MyApplications;