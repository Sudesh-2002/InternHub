import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config";

const API = API_BASE_URL;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const TYPE_CONFIG = {
  student_registered: {
    label: "Student",
    bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-500",
    badge: "bg-indigo-100 text-indigo-700",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  company_registered: {
    label: "Company",
    bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
      </svg>
    ),
  },
  listing_submitted: {
    label: "Listing",
    bg: "bg-violet-50", text: "text-violet-600", dot: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
      </svg>
    ),
  },
  verification_request: {
    label: "Verification",
    bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  support_ticket: {
    label: "Support",
    bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
};

const DEFAULT_TYPE = {
  label: "System",
  bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400",
  badge: "bg-gray-100 text-gray-600",
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const Sk = () => (
  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 animate-pulse">
    <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-gray-100 rounded w-40" />
      <div className="h-3 bg-gray-100 rounded w-64" />
      <div className="h-2.5 bg-gray-100 rounded w-24" />
    </div>
  </div>
);

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "student_registered", label: "Students" },
  { key: "company_registered", label: "Companies" },
  { key: "listing_submitted", label: "Listings" },
  { key: "support_ticket", label: "Support" },
];

const AdminNotifications = ({ setUnread: setParentUnread }) => {
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const syncUnread = (count) => {
    setUnread(count);
    setParentUnread?.(count);
  };

  const fetchNotifs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/admin/notifications`, { headers: auth() });
      setNotifs(res.data.data ?? []);
      syncUnread(res.data.unread_count ?? 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markOne = async (n) => {
    if (n.is_read) {
      if (n.link) navigate(n.link);
      return;
    }
    try {
      await axios.patch(`${API}/admin/notifications/${n.id}/read`, {}, { headers: auth() });
      setNotifs(p => p.map(x => x.id === n.id ? { ...x, is_read: true } : x));
      syncUnread(Math.max(0, unread - 1));
    } catch { /* silent */ }
    finally { if (n.link) navigate(n.link); }
  };

  const markAll = async () => {
    try {
      await axios.patch(`${API}/admin/notifications/read-all`, {}, { headers: auth() });
      setNotifs(p => p.map(n => ({ ...n, is_read: true })));
      syncUnread(0);
    } catch { /* silent */ }
  };

  const visible = notifs.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    return n.type === filter;
  });

  return (
    <div className="min-h-full -m-6 lg:-m-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? "Loading…" : `${unread} unread · ${notifs.length} total`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchNotifs}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              title="Refresh">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
            {unread > 0 && (
              <button onClick={markAll}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${filter === f.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                }`}>
              {f.label}
              {f.key === "unread" && unread > 0 && (
                <span className="ml-1.5 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {loading
            ? Array(5).fill(0).map((_, i) => <Sk key={i} />)
            : visible.length === 0
              ? (
                <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm font-medium">No notifications here.</p>
                  <p className="text-gray-300 text-xs mt-1">New events will appear automatically.</p>
                </div>
              )
              : visible.map(n => {
                const t = TYPE_CONFIG[n.type] ?? DEFAULT_TYPE;
                return (
                  <div key={n.id} onClick={() => markOne(n)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all group ${n.is_read
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
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.badge}`}>
                          {t.label}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${n.is_read ? "text-gray-400" : "text-gray-600"}`}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-[11px] text-gray-400 font-medium">{n.time}</p>
                        {n.link && (
                          <span className="text-[11px] text-indigo-500 font-semibold group-hover:underline">
                            View →
                          </span>
                        )}
                      </div>
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
    </div>
  );
};

export default AdminNotifications;
