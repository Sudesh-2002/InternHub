// src/pages/student/pages/MyApplications.jsx

import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE   = "http://127.0.0.1:8000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const AVATAR_COLORS = [
  "bg-indigo-500","bg-sky-500","bg-emerald-500",
  "bg-violet-500","bg-rose-500","bg-amber-500",
];

const Sk = ({ cls }) => <div className={`animate-pulse bg-gray-100 rounded-xl ${cls}`} />;

const STATUS = {
  pending:  { pill: "bg-amber-100  text-amber-700",  dot: "bg-amber-400"  },
  accepted: { pill: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  rejected: { pill: "bg-red-100    text-red-600",    dot: "bg-red-400"    },
  reviewed: { pill: "bg-blue-100   text-blue-700",   dot: "bg-blue-400"   },
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] ?? { pill: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const MyApplications = () => {
  const [apps,    setApps]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    axios.get(`${API_BASE}/student/applications`, { headers: authHeader() })
      .then(r => { setApps(r.data.data ?? []); setTotal(r.data.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = filter === "all" ? apps : apps.filter(a => a.status === filter);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? "Loading…" : `${total} application${total !== 1 ? "s" : ""} total`}
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {["all","pending","reviewed","accepted","rejected"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
                <Sk cls="w-11 h-11 flex-shrink-0" />
                <div className="flex-1 space-y-2"><Sk cls="h-3.5 w-48" /><Sk cls="h-2.5 w-32" /></div>
                <Sk cls="h-6 w-20 rounded-full" />
              </div>
            ))
          : visible.length === 0
            ? (
              <div className="bg-white border border-gray-100 rounded-2xl py-20 text-center">
                <p className="text-gray-400 text-sm">No applications found.</p>
              </div>
            )
            : visible.map((app, i) => (
                <div key={app.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-indigo-100 hover:shadow-sm transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {app.logo_url
                        ? <img src={app.logo_url} alt={app.company} className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.style.display = "none"; }} />
                        : app.company?.slice(0, 2).toUpperCase() ?? "IN"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{app.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {app.company}
                        {app.location ? ` · ${app.location}` : ""}
                        {app.type ? ` · ${app.type}` : ""}
                        {" · Applied "}{app.applied}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {app.resume_url && (
                      <a href={app.resume_url} target="_blank" rel="noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition">
                        Resume ↗
                      </a>
                    )}
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))
        }
      </div>
    </div>
  );
};

export default MyApplications;