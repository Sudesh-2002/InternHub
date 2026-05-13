// src/pages/admin/pages/ContentModeration.jsx

import { useState, useEffect, useCallback } from "react";
import {
  Page, SectionHeader, Btn, Ico, useToast, Toast,
  Badge, SearchBar, Avatar
} from "../components/Shared";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Stat card ─────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, color, loading }) => {
  const colors = {
    red:    { bg: "bg-red-500/10",    text: "text-red-500",    border: "border-red-500/20" },
    amber:  { bg: "bg-amber-500/10",  text: "text-amber-500",  border: "border-amber-500/20" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
  };
  const c = colors[color] || colors.red;
  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${c.border}`}>
      <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-3`}>
        <Ico d={icon} size={17} color="" className={c.text} />
      </div>
      {loading
        ? <div className="h-7 w-12 bg-gray-100 rounded animate-pulse mb-1" />
        : <p className={`text-2xl font-bold tracking-tight ${c.text}`}>{value}</p>
      }
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </div>
  );
};

/* ── Confirm dialog helper (inline) ────────────────────────────── */
const Confirm = ({ msg }) => window.confirm(msg);

/* ── Main ───────────────────────────────────────────────────────── */
const ContentModeration = () => {
  const [tab,       setTab]       = useState("listings");   // listings | applications
  const [stats,     setStats]     = useState(null);
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [statsLoad, setStatsLoad] = useState(true);
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);
  const [meta,      setMeta]      = useState(null);
  const [actionId,  setActionId]  = useState(null);  // id currently processing
  const { toasts, add: toast, remove } = useToast();

  /* ── Fetch stats ── */
  const fetchStats = useCallback(async () => {
    setStatsLoad(true);
    try {
      const res  = await fetch(`${API}/admin/moderation/stats`, { headers: authHeaders() });
      const json = await res.json();
      if (res.ok) setStats(json);
    } catch { /* silent */ }
    finally { setStatsLoad(false); }
  }, []);

  /* ── Fetch list ── */
  const fetchItems = useCallback(async (tabKey, q, pg) => {
    setLoading(true);
    setItems([]);
    try {
      let url;
      if (tabKey === "listings") {
        url = `${API}/admin/internships?status=flagged&search=${encodeURIComponent(q)}&page=${pg}`;
      } else {
        url = `${API}/admin/applications?filter=flagged&search=${encodeURIComponent(q)}&page=${pg}`;
      }
      const res  = await fetch(url, { headers: authHeaders() });
      const json = await res.json();
      if (res.ok) {
        if (tabKey === "listings") {
          setItems(json.data?.internships || []);
          setMeta(null);
        } else {
          setItems(json.data || []);
          setMeta(json.meta || null);
        }
      } else {
        toast(json.message || "Failed to load", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchItems(tab, search, page); }, [tab, search, page, fetchItems]);

  const reload = () => { fetchItems(tab, search, page); fetchStats(); };

  /* ── Actions: Listings ── */
  const approveListing = async (id) => {
    setActionId(id);
    try {
      const res = await fetch(`${API}/admin/internships/${id}/status`, {
        method: "PATCH", headers: authHeaders(),
        body: JSON.stringify({ status: "approved" }),
      });
      const json = await res.json();
      if (res.ok) { toast("Listing approved", "success"); reload(); }
      else toast(json.message || "Failed", "error");
    } catch { toast("Network error", "error"); }
    finally { setActionId(null); }
  };

  const rejectListing = async (id) => {
    if (!window.confirm("Reject this listing?")) return;
    setActionId(id);
    try {
      const res = await fetch(`${API}/admin/internships/${id}/status`, {
        method: "PATCH", headers: authHeaders(),
        body: JSON.stringify({ status: "rejected" }),
      });
      const json = await res.json();
      if (res.ok) { toast("Listing rejected", "success"); reload(); }
      else toast(json.message || "Failed", "error");
    } catch { toast("Network error", "error"); }
    finally { setActionId(null); }
  };

  const deleteListing = async (id) => {
    if (!window.confirm("Permanently delete this listing?")) return;
    setActionId(id);
    try {
      const res = await fetch(`${API}/admin/internships/${id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      const json = await res.json();
      if (res.ok) { toast("Listing deleted", "success"); reload(); }
      else toast(json.message || "Failed", "error");
    } catch { toast("Network error", "error"); }
    finally { setActionId(null); }
  };

  /* ── Actions: Applications ── */
  const unflagApplication = async (id) => {
    setActionId(id);
    try {
      const res = await fetch(`${API}/admin/applications/${id}/flag`, {
        method: "PATCH", headers: authHeaders(),
      });
      const json = await res.json();
      if (res.ok) { toast("Application unflagged", "success"); reload(); }
      else toast(json.message || "Failed", "error");
    } catch { toast("Network error", "error"); }
    finally { setActionId(null); }
  };

  const TABS = [
    { key: "listings",     label: "Flagged Listings",     count: stats?.flagged_listings,     icon: "M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
    { key: "applications", label: "Flagged Applications", count: stats?.flagged_applications, icon: "M3 21v-4m0 0V5a2 2 0 0 1 2-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 0 0-2 2zm9-13.5V9" },
  ];

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      {/* ── Header ── */}
      <SectionHeader
        title="Content Moderation"
        subtitle="Review and action flagged internship listings and suspicious applications"
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Flagged Listings"     value={stats?.flagged_listings}     icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"  color="red"    loading={statsLoad} />
        <StatCard label="Flagged Applications" value={stats?.flagged_applications} icon="M3 21v-4m0 0V5a2 2 0 0 1 2-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 0 0-2 2zm9-13.5V9"                                                                                color="red"    loading={statsLoad} />
        <StatCard label="Pending Listings"     value={stats?.pending_listings}     icon="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"                                                                                                                         color="amber"  loading={statsLoad} />
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                tab === t.key
                  ? "text-indigo-700 border-indigo-600 bg-indigo-50/50"
                  : "text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50"
              }`}>
              <Ico d={t.icon} size={14} />
              {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-indigo-100 text-indigo-700" : "bg-red-100 text-red-600"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/40">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder={tab === "listings" ? "Search listings or companies…" : "Search students or jobs…"}
          />
        </div>

        {/* ── Flagged Listings Table ── */}
        {tab === "listings" && (
          loading ? <LoadingSkeleton cols={5} /> :
          items.length === 0 ? <EmptyState label="No flagged listings" icon="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Listing", "Company", "Type", "Posted", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-red-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Ico d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={14} color="#ef4444" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-sm">{item.company}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{item.type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{item.posted}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Btn variant="success" size="sm" disabled={actionId === item.id} onClick={() => approveListing(item.id)}>
                          <Ico d="M5 13l4 4L19 7" size={12} sw={2.5} />Approve
                        </Btn>
                        <Btn variant="warning" size="sm" disabled={actionId === item.id} onClick={() => rejectListing(item.id)}>
                          <Ico d="M6 18L18 6M6 6l12 12" size={12} />Reject
                        </Btn>
                        <Btn variant="danger" size="sm" disabled={actionId === item.id} onClick={() => deleteListing(item.id)}>
                          <Ico d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" size={12} />Delete
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Flagged Applications Table ── */}
        {tab === "applications" && (
          loading ? <LoadingSkeleton cols={5} /> :
          items.length === 0 ? <EmptyState label="No flagged applications" icon="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /> :
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Student", "Internship", "Company", "Applied", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-red-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.student} src={item.avatar_url} size={8} />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.student}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[140px]">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 text-sm max-w-[160px]">
                      <p className="truncate">{item.job}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-sm">{item.company}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">{item.applied}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {item.resume_url && (
                          <a href={item.resume_url} target="_blank" rel="noreferrer">
                            <Btn variant="secondary" size="sm">
                              <Ico d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" size={12} />Resume
                            </Btn>
                          </a>
                        )}
                        <Btn variant="ghost" size="sm" disabled={actionId === item.id} onClick={() => unflagApplication(item.id)}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                          <Ico d="M3 21v-4m0 0V5a2 2 0 0 1 2-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 0 0-2 2zm9-13.5V9" size={12} />Unflag
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/40">
                <p className="text-xs text-gray-400">{meta.from}–{meta.to} of {meta.total}</p>
                <div className="flex gap-2">
                  <Btn variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <Ico d="M15 19l-7-7 7-7" size={13} />Prev
                  </Btn>
                  <Btn variant="secondary" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>
                    Next<Ico d="M9 5l7 7-7 7" size={13} />
                  </Btn>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Page>
  );
};

/* ── Helpers ─────────────────────────────────────────────────────── */
const LoadingSkeleton = ({ cols }) => (
  <div className="animate-pulse p-5 space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className={`h-4 bg-gray-100 rounded ${j === 0 ? "flex-1" : "w-24"}`} />
        ))}
      </div>
    ))}
  </div>
);

const EmptyState = ({ label, icon }) => (
  <div className="py-14 text-center">
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
      <Ico d={icon} size={22} color="#10b981" />
    </div>
    <p className="text-gray-500 font-semibold">{label}</p>
    <p className="text-gray-400 text-sm mt-1">Nothing to review here — all clear!</p>
  </div>
);

export default ContentModeration;
