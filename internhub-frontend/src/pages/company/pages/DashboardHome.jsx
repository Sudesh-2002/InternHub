// src/pages/company/pages/DashboardHome.jsx

import { useNavigate } from "react-router-dom";
import { Ico, StatusBadge } from "../components/Shared";
import { avatarColors } from "../data/mockData";

const DashboardHome = ({ jobs, applicants }) => {
  const navigate = useNavigate();

  const stats = [
    {
      label: "Total Jobs Posted",
      value: jobs.length,
      icon: "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z",
      color: "violet",
    },
    {
      label: "Total Applicants",
      value: applicants.length,
      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      color: "sky",
    },
    {
      label: "Active Jobs",
      value: jobs.filter(j => j.status === "approved").length,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
      color: "emerald",
    },
    {
      label: "Pending Approval",
      value: jobs.filter(j => j.status === "pending").length,
      icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
      color: "amber",
    },
  ];

  const colorMap = {
    violet:  { bg: "bg-violet-500/10",  text: "text-violet-600"  },
    sky:     { bg: "bg-sky-500/10",     text: "text-sky-600"     },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
    amber:   { bg: "bg-amber-500/10",   text: "text-amber-600"   },
  };

  const recentApplicants = [...applicants]
    .sort((a, b) => new Date(b.applied) - new Date(a.applied))
    .slice(0, 5);

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-7">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
        <div className="relative">
          <p className="text-indigo-200 text-sm font-medium mb-1">Good morning 👋</p>
          <h2 className="text-white text-2xl font-bold mb-1">TechCorp Solutions</h2>
          <p className="text-indigo-200 text-sm">Here's what's happening with your internship listings today.</p>
        </div>
        <div className="absolute right-7 top-1/2 -translate-y-1/2 opacity-20">
          <Ico
            d="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
            size={96} sw={1}
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const c = colorMap[s.color];
          return (
            <div key={s.label}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-sm hover:-translate-y-0.5 transition-all">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                <Ico d={s.icon} size={18} color="" className={c.text} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent jobs + applicants */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent jobs */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-gray-800 font-semibold">Recent Job Listings</h3>
            <button onClick={() => navigate("/company/dashboard/jobs")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {jobs.slice(0, 4).map(j => (
              <div key={j.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-gray-800 font-medium">{j.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{j.applicants} applicants · {j.posted}</p>
                </div>
                <StatusBadge status={j.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent applicants */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-gray-800 font-semibold">Recent Applicants</h3>
            <button onClick={() => navigate("/company/dashboard/applicants")}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentApplicants.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className={`w-9 h-9 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {a.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">{a.name}</p>
                  <p className="text-xs text-gray-400 truncate">{a.email}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;