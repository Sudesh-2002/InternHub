import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Ico } from "../components/Shared";

const API_BASE = "http://127.0.0.1:8000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

// Type config 
const TYPE = {
  verification: {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    bg: "bg-emerald-50",
    icon_: "text-emerald-600",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  listing: {
    icon: "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z",
    bg: "bg-indigo-50",
    icon_: "text-indigo-600",
    dot: "bg-indigo-500",
    badge: "bg-indigo-100 text-indigo-700",
  },
  application: {
    icon: "M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0",
    bg: "bg-violet-50",
    icon_: "text-violet-600",
    dot: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700",
  },
  info: {
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    bg: "bg-sky-50",
    icon_: "text-sky-600",
    dot: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700",
  },
};

const Sk = ({ cls }) => <div className={`animate-pulse bg-gray-100 rounded-xl ${cls}`} />;

const Notifications = ({ setUnread: setParentUnread }) => {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Sync unread count up to parent (sidebar badge)
  const syncUnread = (count) => {
    setUnread(count);
    setParentUnread?.(count);
  };

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/company/notifications`, { headers: authHeader() });
      setNotifs(res.data.data ?? []);
      const count = res.data.unread_count ?? 0;
      syncUnread(count);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markOne = async (id) => {
    const n = notifs.find(n => n.id === id);
    if (n?.is_read) return;
    try {
      await axios.patch(`${API_BASE}/company/notifications/${id}/read`, {}, { headers: authHeader() });
      setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
      const newCount = Math.max(0, unread - 1);
      syncUnread(newCount);
    } catch { /* silent */ }
  };

  const markAll = async () => {
    try {
      await axios.patch(`${API_BASE}/company/notifications/read-all`, {}, { headers: authHeader() });
      setNotifs(p => p.map(n => ({ ...n, is_read: true })));
      syncUnread(0);
    } catch { /* silent */ }
  };

  const visible = notifs.filter(n =>
    filter === "all" ? true :
      filter === "unread" ? !n.is_read :
        n.type === filter
  );

  const FILTERS = ["all", "unread", "verification", "listing", "application"];
  const FILTER_LABELS = { all: "All", unread: "Unread", verification: "Verification", listing: "Listings", application: "Applications" };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Notifications</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {loading ? "Loading…" : `${unread} unread · ${notifs.length} total`}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAll}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition px-3 py-1.5 rounded-lg hover:bg-indigo-50">
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${filter === f
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}>
            {FILTER_LABELS[f]}
            {f === "unread" && unread > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-500 text-white rounded-full text-[10px] font-bold">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {loading
          ? Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100">
              <Sk cls="w-10 h-10 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Sk cls="h-3.5 w-48" />
                <Sk cls="h-3 w-64" />
                <Sk cls="h-2.5 w-24" />
              </div>
            </div>
          ))
          : visible.length === 0
            ? (
              <div className="py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Ico d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" size={26} color="#d1d5db" />
                </div>
                <p className="text-gray-400 text-sm font-medium">No notifications found.</p>
              </div>
            )
            : visible.map(n => {
              const t = TYPE[n.type] ?? TYPE.info;
              return (
                <div key={n.id} onClick={() => markOne(n.id)}
                  className={`group flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-150 ${n.is_read
                      ? "bg-white border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20"
                      : "bg-white border-indigo-200 shadow-sm shadow-indigo-50 ring-1 ring-indigo-100/60"
                    }`}>

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.bg}`}>
                    <Ico d={t.icon} size={17} color="" className={t.icon_} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className={`text-sm font-semibold leading-snug ${n.is_read ? "text-gray-600" : "text-gray-900"}`}>
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