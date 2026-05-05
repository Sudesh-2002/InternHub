// src/pages/company/pages/DashboardHome.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Ico } from "../components/Shared";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-sky-500", "bg-emerald-500",
  "bg-violet-500", "bg-rose-500", "bg-amber-500",
];

// ── Micro components ──────────────────────────────────────────────────────────
const Sk = ({ cls }) => <div className={`animate-pulse bg-gray-100 rounded-xl ${cls}`} />;

const StatusPill = ({ status }) => {
  const map = {
    active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100   text-amber-700",
    rejected: "bg-red-100     text-red-600",
    approved: "bg-emerald-100 text-emerald-700",
    accepted: "bg-emerald-100 text-emerald-700",
    reviewed: "bg-blue-100    text-blue-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, from, to, loading }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${from} ${to} border border-white shadow-sm`}>
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-white/80 shadow-sm flex items-center justify-center">
        <Ico d={icon} size={19} color="" className="text-gray-700" />
      </div>
    </div>
    {loading
      ? <><Sk cls="h-8 w-14 mb-1.5" /><Sk cls="h-3 w-28" /></>
      : <>
        <p className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">{value ?? 0}</p>
        <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </>
    }
    {/* decorative circle */}
    <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/20" />
  </div>
);

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const colors = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-400",
    red: "bg-red-400",
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-gray-600 capitalize">{label}</span>
        <span className="text-xs font-bold text-gray-800">{value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[color] ?? "bg-gray-400"} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const DashboardHome = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/company/dashboard`, { headers: authHeader() })
      .then(r => setData(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats ?? {};
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const total = s.total_applicants ?? 0;
  const pending = s.pending_applicants ?? 0;
  const active = s.active_jobs ?? 0;
  const pendingJ = s.pending_jobs ?? 0;

  return (
    <div className="space-y-6">

      {/* ── Welcome Banner ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 shadow-xl shadow-indigo-100">
        {/* blobs */}
        <div className="absolute -right-8 -top-8 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute right-28 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07]">
          <Ico d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" size={130} sw={1} />
        </div>

        <div className="relative">
          <p className="text-indigo-300 text-sm font-medium mb-1">{greeting} 👋</p>
          <h2 className="text-white text-2xl md:text-3xl font-extrabold mb-1 tracking-tight">
            {loading ? <span className="opacity-50">Loading…</span> : (data?.company_name ?? "Your Company")}
          </h2>
          <p className="text-indigo-300 text-sm">Here's what's happening with your internship programme today.</p>
        </div>
      </div>

      {/* ── Four Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard loading={loading} label="Jobs Posted" value={s.total_jobs} sub={`${active} active`} icon="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" from="from-violet-50" to="to-indigo-50" />
        <StatCard loading={loading} label="Active Listings" value={active} sub={`${pendingJ} pending approval`} icon="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" from="from-emerald-50" to="to-teal-50" />
        <StatCard loading={loading} label="Total Applicants" value={total} sub="all time" icon="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0" from="from-sky-50" to="to-blue-50" />
        <StatCard loading={loading} label="Pending Review" value={pending} sub="need attention" icon="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" from="from-amber-50" to="to-orange-50" />
      </div>

      {/* ── Two-column lower section ──────────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* Recent Listings — wider */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Recent Listings</p>
            <button onClick={() => navigate("/company/dashboard/jobs")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition">
              All listings →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading
              ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-2"><Sk cls="h-3.5 w-44" /><Sk cls="h-2.5 w-28" /></div>
                  <Sk cls="h-6 w-16 rounded-full" />
                </div>
              ))
              : (data?.recent_jobs ?? []).length === 0
                ? <p className="px-6 py-12 text-center text-sm text-gray-400">No listings posted yet.</p>
                : (data?.recent_jobs ?? []).map(j => (
                  <div key={j.id}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-indigo-50/30 transition cursor-pointer"
                    onClick={() => navigate("/company/dashboard/jobs")}
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Ico d="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" size={16} color="" className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-semibold truncate">{j.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {j.applicants} applicant{j.applicants !== 1 ? "s" : ""} · Posted {j.posted}
                      </p>
                    </div>
                    <StatusPill status={j.status} />
                  </div>
                ))
            }
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Application breakdown */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex-1">
            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-5">Application Breakdown</p>
            {loading
              ? <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Sk key={i} cls="h-7 w-full" />)}</div>
              : total === 0
                ? <p className="text-sm text-gray-400 text-center py-8">No applications yet.</p>
                : <div className="space-y-4">
                  <ProgressBar label="Pending" value={s.pending_applicants ?? 0} max={total} color="amber" />
                  <ProgressBar label="Accepted" value={(data?.recent_applicants ?? []).filter(a => a.status === "accepted").length} max={total} color="emerald" />
                  <ProgressBar label="Reviewed" value={(data?.recent_applicants ?? []).filter(a => a.status === "reviewed").length} max={total} color="indigo" />
                  <ProgressBar label="Rejected" value={(data?.recent_applicants ?? []).filter(a => a.status === "rejected").length} max={total} color="red" />
                </div>
            }
          </div>

          {/* Recent applicants */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Latest Applicants</p>
              <button onClick={() => navigate("/company/dashboard/applicants")}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition">
                All →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {loading
                ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                    <Sk cls="w-8 h-8 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-1.5"><Sk cls="h-3 w-24" /><Sk cls="h-2.5 w-36" /></div>
                  </div>
                ))
                : (data?.recent_applicants ?? []).length === 0
                  ? <p className="px-5 py-8 text-center text-xs text-gray-400">No applicants yet.</p>
                  : (data?.recent_applicants ?? []).map((a, i) => (
                    <div key={a.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/60 transition">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 overflow-hidden ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                        {a.avatar_url
                          ? <img src={a.avatar_url} alt={a.name} className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.style.display = "none"; }} />
                          : a.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 font-semibold truncate">{a.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{a.job}</p>
                      </div>
                      <StatusPill status={a.status} />
                    </div>
                  ))
              }
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default DashboardHome;