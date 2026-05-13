// src/pages/admin/pages/SupportCenter.jsx

import { useState, useEffect, useCallback } from "react";
import { Page, SectionHeader, Btn, Ico, useToast, Toast, SearchBar, Badge, Avatar } from "../components/Shared";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const hdrs = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

/* ── Status/priority colours ────────────────────────────────────── */
const STATUS_STYLE = {
  open:        "bg-emerald-100 text-emerald-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved:    "bg-gray-100 text-gray-600",
  closed:      "bg-gray-200 text-gray-500",
};
const PRIORITY_STYLE = {
  low:    "bg-slate-100 text-slate-500",
  medium: "bg-amber-100 text-amber-700",
  high:   "bg-red-100 text-red-600",
};

/* ── Stat card ──────────────────────────────────────────────────── */
const Stat = ({ label, value, color }) => {
  const c = { green: "text-emerald-600", blue: "text-blue-600", gray: "text-gray-500", violet: "text-violet-600" };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
      <p className={`text-2xl font-bold ${c[color] || "text-gray-800"}`}>{value ?? "—"}</p>
      <p className="text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
};

/* ── Thread message bubble ──────────────────────────────────────── */
const Bubble = ({ msg }) => (
  <div className={`flex gap-3 ${msg.is_admin ? "flex-row-reverse" : "flex-row"}`}>
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${msg.is_admin ? "bg-indigo-600" : "bg-gray-400"}`}>
      {msg.is_admin ? "A" : msg.sender?.[0] ?? "U"}
    </div>
    <div className={`max-w-[75%] ${msg.is_admin ? "items-end" : "items-start"} flex flex-col gap-1`}>
      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
        msg.is_admin ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"
      }`}>
        {msg.message}
      </div>
      <p className="text-[10px] text-gray-400 px-1">{msg.sender} · {msg.created_at}</p>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const SupportCenter = () => {
  const [tickets,    setTickets]    = useState([]);
  const [stats,      setStats]      = useState({});
  const [meta,       setMeta]       = useState(null);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);   // { ...ticket, messages: [] }
  const [detailLoad, setDetailLoad] = useState(false);
  const [reply,      setReply]      = useState("");
  const [sending,    setSending]    = useState(false);

  const [search,   setSearch]   = useState("");
  const [fStatus,  setFStatus]  = useState("all");
  const [fPriority,setFPriority]= useState("all");
  const [fRole,    setFRole]    = useState("all");

  const { toasts, add: toast, remove } = useToast();

  /* ── Fetch list ── */
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ status: fStatus, priority: fPriority, role: fRole, search, page }).toString();
      const res  = await fetch(`${API}/admin/support-tickets?${q}`, { headers: hdrs() });
      const json = await res.json();
      if (res.ok) { setTickets(json.data || []); setMeta(json.meta); setStats(json.stats || {}); }
    } catch { toast("Network error", "error"); }
    finally { setLoading(false); }
  }, [fStatus, fPriority, fRole, search, page]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  /* ── Open ticket detail ── */
  const openTicket = async (id) => {
    setDetailLoad(true);
    setSelected({ id });
    try {
      const res  = await fetch(`${API}/admin/support-tickets/${id}`, { headers: hdrs() });
      const json = await res.json();
      if (res.ok) setSelected(json.data);
      else toast("Could not load ticket", "error");
    } catch { toast("Network error", "error"); }
    finally { setDetailLoad(false); }
  };

  /* ── Status change ── */
  const changeStatus = async (status) => {
    try {
      const res  = await fetch(`${API}/admin/support-tickets/${selected.id}/status`, {
        method: "PATCH", headers: hdrs(), body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (res.ok) {
        setSelected(s => ({ ...s, status }));
        toast(json.message || "Status updated", "success");
        fetchTickets();
      } else toast(json.message || "Failed", "error");
    } catch { toast("Network error", "error"); }
  };

  /* ── Reply ── */
  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res  = await fetch(`${API}/admin/support-tickets/${selected.id}/reply`, {
        method: "POST", headers: hdrs(), body: JSON.stringify({ message: reply }),
      });
      const json = await res.json();
      if (res.ok) {
        setSelected(s => ({ ...s, messages: [...(s.messages || []), json.data], status: json.data ? (s.status === 'open' ? 'in_progress' : s.status) : s.status }));
        setReply("");
        fetchTickets();
      } else toast(json.message || "Failed", "error");
    } catch { toast("Network error", "error"); }
    finally { setSending(false); }
  };

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />
      <SectionHeader title="Support Center" subtitle="Manage user support tickets and respond to queries" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Open"        value={stats.open}        color="green" />
        <Stat label="In Progress" value={stats.in_progress} color="blue" />
        <Stat label="Resolved"    value={stats.resolved}    color="gray" />
        <Stat label="Total"       value={stats.total}       color="violet" />
      </div>

      <div className="flex gap-5 min-h-[500px]">
        {/* ── Ticket List Panel ── */}
        <div className={`flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden ${selected ? "w-[42%] flex-shrink-0" : "flex-1"}`}>
          {/* Filters */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search tickets or users…" />
            <div className="flex flex-wrap gap-2">
              {["all","open","in_progress","resolved","closed"].map(s => (
                <button key={s} onClick={() => { setFStatus(s); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${fStatus === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {s.replace("_", " ")}
                </button>
              ))}
              <select value={fPriority} onChange={e => setFPriority(e.target.value)}
                className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white">
                <option value="all">All Priorities</option>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
              <select value={fRole} onChange={e => setFRole(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white">
                <option value="all">All Roles</option>
                <option value="student">Students</option><option value="company">Companies</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading…</div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-400 font-semibold">No tickets found</p>
                <p className="text-gray-300 text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : tickets.map(t => (
              <button key={t.id} onClick={() => openTicket(t.id)} className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-all ${selected?.id === t.id ? "bg-indigo-50/60 border-l-2 border-indigo-500" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.subject}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>{t.status.replace("_"," ")}</span>
                  <span className="text-xs text-gray-400 truncate">{t.user}</span>
                </div>
                {t.last_message && <p className="text-xs text-gray-400 truncate">{t.last_message}</p>}
                <p className="text-[10px] text-gray-300 mt-1">{t.created_at}</p>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
              <Btn variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Btn>
              <span className="text-xs text-gray-400">{page} / {meta.last_page}</span>
              <Btn variant="secondary" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next →</Btn>
            </div>
          )}
        </div>

        {/* ── Thread Detail Panel ── */}
        {selected && (
          <div className="flex-1 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{selected.subject || "Loading…"}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[selected.status]}`}>{selected.status?.replace("_"," ")}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[selected.priority]}`}>{selected.priority}</span>
                  {selected.user && <span className="text-xs text-gray-400">{selected.user} · {selected.user_role}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {["open","in_progress","resolved","closed"].map(s => (
                  <button key={s} disabled={selected.status === s} onClick={() => changeStatus(s)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${selected.status === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {s.replace("_"," ")}
                  </button>
                ))}
                <button onClick={() => setSelected(null)} className="ml-2 text-gray-400 hover:text-gray-600">
                  <Ico d="M6 18L18 6M6 6l12 12" size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {detailLoad ? (
                <div className="text-center text-gray-400 text-sm animate-pulse py-10">Loading thread…</div>
              ) : (selected.messages || []).map(msg => <Bubble key={msg.id} msg={msg} />)}
            </div>

            {/* Reply box */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <textarea
                value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendReply(); }}
                placeholder="Type your reply… (Ctrl+Enter to send)"
                rows={2}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition"
              />
              <Btn onClick={sendReply} disabled={sending || !reply.trim()} className="self-end">
                {sending ? "…" : <><Ico d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" size={14} />Send</>}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default SupportCenter;
