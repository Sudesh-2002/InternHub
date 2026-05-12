import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-sky-500", "bg-emerald-500",
  "bg-violet-500", "bg-rose-500", "bg-amber-500",
];

const Sk = ({ cls }) => <div className={`animate-pulse bg-gray-100 rounded-xl ${cls}`} />;

const STATUS_STYLES = {
  pending: "bg-amber-100  text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100    text-red-600",
  reviewed: "bg-blue-100   text-blue-700",
};

const Badge = ({ status }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"}`}>
    {status}
  </span>
);

const StatCard = ({ label, value, color, bg, loading }) => (
  <div className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
    {loading
      ? <><Sk cls="h-8 w-12 mb-2" /><Sk cls="h-3 w-20" /></>
      : <>
        <p className={`text-3xl font-extrabold tracking-tight ${color}`}>{value ?? 0}</p>
        <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
      </>
    }
  </div>
);

const DashboardHome = ({ user }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/student/dashboard`, { headers: authHeader() })
      .then(r => setData(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats ?? {};
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-7 shadow-lg shadow-indigo-100">
        <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute right-16 bottom-0 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-indigo-300 text-sm font-medium mb-1">{greeting} 👋</p>
          <h2 className="text-white text-2xl font-extrabold tracking-tight mb-1">
            {user?.name?.split(" ")[0] ?? "Student"}
          </h2>
          <p className="text-indigo-300 text-sm">Here's a summary of your internship journey.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard loading={loading} label="Total Applied" value={s.total} color="text-indigo-700" bg="bg-indigo-50" />
        <StatCard loading={loading} label="Pending" value={s.pending} color="text-amber-700" bg="bg-amber-50" />
        <StatCard loading={loading} label="Accepted" value={s.accepted} color="text-emerald-700" bg="bg-emerald-50" />
        <StatCard loading={loading} label="Rejected" value={s.rejected} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Recent Applications</h3>
          <button onClick={() => navigate("/student/dashboard/applications")}
            className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition">
            View all →
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {loading
            ? Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Sk cls="w-10 h-10 flex-shrink-0" />
                <div className="flex-1 space-y-1.5"><Sk cls="h-3.5 w-40" /><Sk cls="h-2.5 w-28" /></div>
                <Sk cls="h-6 w-16 rounded-full" />
              </div>
            ))
            : (data?.recent ?? []).length === 0
              ? <p className="px-5 py-12 text-center text-sm text-gray-400">No applications yet. Start applying!</p>
              : (data?.recent ?? []).map((app, i) => (
                <div key={app.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {app.company?.slice(0, 2).toUpperCase() ?? "IN"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{app.title}</p>
                      <p className="text-xs text-gray-400">{app.company} · {app.applied}</p>
                    </div>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;