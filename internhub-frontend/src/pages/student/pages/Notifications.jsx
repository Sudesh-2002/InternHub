// src/pages/student/pages/Notifications.jsx

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE   = "http://127.0.0.1:8000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const TYPE = {
  application: {
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0" />
      </svg>
    ),
    bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-700",
  },
  account: {
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-500", badge: "bg-rose-100 text-rose-700",
  },
  info: {
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-500", badge: "bg-sky-100 text-sky-700",
  },
};

const Sk = ({ cls }) => <div className={`animate-pulse bg-gray-100 rounded-xl ${cls}`} />;

// ─────────────────────────────────────────────────────────────────────────────
const Notifications = ({ setUnread: setParentUnread }) => {
  const [notifs,  setNotifs]  = useState([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  const syncUnread = (count) => {
    setUnread(count);
    setParentUnread?.(count);
  };

  const fetchNotifs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/student/notifications`, { headers: authHeader() });
      setNotifs(res.data.data ?? []);
      syncUnread(res.data.unread_count ?? 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markOne = async (id) => {
    const n = notifs.find(n => n.id === id);
    if (n?.is_read) return;
    try {
      await axios.patch(`${API_BASE}/student/notifications/${id}/read`, {}, { headers: authHeader() });
      setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
      syncUnread(Math.max(0, unread - 1));
    } catch { /* silent */ }
  };

  const markAll = async () => {
    try {
      await axios.patch(`${API_BASE}/student/notifications/read-all`, {}, { headers: authHeader() });
      setNotifs(p => p.map(n => ({ ...n, is_read: true })));
      syncUnread(0);
    } catch { /* silent */ }
  };

  const FILTERS = ["all", "unread", "application", "account"];
  const LABELS  = { all: "All", unread: "Unread", application: "Applications", account: "Account" };

  const visible = notifs.filter(n =>
    filter === "all"    ? true :
    filter === "unread" ? !n.is_read :
    n.type === filter
  );

  return (
    <div className="max-w-2xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? "Loading…" : `${unread} unread · ${notifs.length} total`}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAll}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              filter === f
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
            }`}>
            {LABELS[f]}
            {f === "unread" && unread > 0 && (
              <span className="ml-1.5 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                <Sk cls="w-10 h-10 flex-shrink-0" />
                <div className="flex-1 space-y-2"><Sk cls="h-3.5 w-40" /><Sk cls="h-3 w-60" /><Sk cls="h-2.5 w-24" /></div>
              </div>
            ))
          : visible.length === 0
            ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">No notifications yet.</p>
              </div>
            )
            : visible.map(n => {
                const t = TYPE[n.type] ?? TYPE.info;
                return (
                  <div key={n.id} onClick={() => markOne(n.id)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                      n.is_read
                        ? "bg-white border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20"
                        : "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-100/60"
                    }`}>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.bg} ${t.text}`}>
                      {t.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className={`text-sm font-semibold ${n.is_read ? "text-gray-600" : "text-gray-900"}`}>
                          {n.title}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${t.badge}`}>
                          {n.type}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${n.is_read ? "text-gray-400" : "text-gray-600"}`}>
                        {n.message}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{n.time}</p>
                    </div>

                    {!n.is_read && (
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${t.dot}`} />
                    )}
                  </div>
                );
              })
        }
      </div>
    </div>
  );
};

export default Notifications;