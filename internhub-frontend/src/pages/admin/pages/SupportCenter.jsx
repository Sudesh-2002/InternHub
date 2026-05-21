import { useState, useEffect, useCallback, useRef } from "react";
import { Page, SectionHeader, Btn, Ico, useToast, Toast, SearchBar } from "../components/Shared";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const hdrs = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

const STATUS_CFG = {
  open: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", label: "Open" },
  in_progress: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200", label: "In Progress" },
  resolved: { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-500 ring-1 ring-gray-200", label: "Resolved" },
  closed: { dot: "bg-gray-300", badge: "bg-gray-100 text-gray-400 ring-1 ring-gray-200", label: "Closed" },
};
const PRIORITY_CFG = {
  low: "bg-slate-100 text-slate-500",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-600",
};

const StarDisplay = ({ rating, size = 14 }) => {
  if (!rating) return null;
  return (
    <span className="flex items-center gap-0.5" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= rating ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
      <span className="text-[10px] text-gray-400 ml-1 font-medium">{rating}/5</span>
    </span>
  );
};

const Stat = ({ label, value, icon, color }) => {
  const colors = {
    green: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    gray: { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  };
  const c = colors[color] || colors.gray;
  return (
    <div className={`bg-white border ${c.border} rounded-2xl p-4 flex items-center gap-3 shadow-sm`}>
      <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Ico d={icon} size={16} color="" className={c.text} />
      </div>
      <div>
        <p className={`text-xl font-bold ${c.text}`}>{value ?? "—"}</p>
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
};

const Bubble = ({ msg }) => (
  <div className={`flex gap-2.5 ${msg.is_admin ? "flex-row-reverse" : "flex-row"}`}>
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 ${msg.is_admin ? "bg-indigo-600" : "bg-slate-400"}`}>
      {msg.is_admin ? "A" : (msg.sender?.[0] ?? "U")}
    </div>
    <div className={`max-w-[74%] flex flex-col gap-1 ${msg.is_admin ? "items-end" : "items-start"}`}>
      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.is_admin
          ? "bg-indigo-600 text-white rounded-tr-sm"
          : "bg-gray-100 text-gray-800 rounded-tl-sm"
        }`}>
        {msg.message}
      </div>
      <p className="text-[10px] text-gray-400 px-1">{msg.sender} · {msg.created_at}</p>
    </div>
  </div>
);

const SupportCenter = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoad, setDetailLoad] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fPriority, setFPriority] = useState("all");
  const [fRole, setFRole] = useState("all");
  const { toasts, add: toast, remove } = useToast();
  const msgEnd = useRef(null);
  const pollRef = useRef(null);
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  useEffect(() => {
    if (selected?.messages) msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ status: fStatus, priority: fPriority, role: fRole, search, page }).toString();
      const res = await fetch(`${API}/admin/support-tickets?${q}`, { headers: hdrs() });
      const json = await res.json();
      if (res.ok) { setTickets(json.data || []); setMeta(json.meta); setStats(json.stats || {}); }
    } catch { toast("Network error", "error"); }
    finally { setLoading(false); }
  }, [fStatus, fPriority, fRole, search, page]);

  const pollMessages = useCallback(async () => {
    const cur = selectedRef.current;
    if (!cur?.id || cur.status === "closed") return;
    try {
      const res = await fetch(`${API}/admin/support-tickets/${cur.id}`, { headers: hdrs() });
      const json = await res.json();
      if (!res.ok) return;
      const incoming = json.data?.messages || [];
      const existing = selectedRef.current?.messages || [];
      if (incoming.length !== existing.length) {
        setSelected(prev => ({ ...prev, ...json.data, messages: incoming }));
        fetchTickets();
      }
    } catch { }
  }, [fetchTickets]);

  useEffect(() => {
    if (selected?.id && selected.status !== "closed") {
      pollRef.current = setInterval(pollMessages, 3000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [selected?.id, selected?.status, pollMessages]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openTicket = async (id) => {
    setDetailLoad(true);
    setSelected({ id });
    setReply("");
    try {
      const res = await fetch(`${API}/admin/support-tickets/${id}`, { headers: hdrs() });
      const json = await res.json();
      if (res.ok) setSelected(json.data);
      else toast("Could not load ticket", "error");
    } catch { toast("Network error", "error"); }
    finally { setDetailLoad(false); }
  };

  const changeStatus = async (status) => {
    try {
      const res = await fetch(`${API}/admin/support-tickets/${selected.id}/status`, {
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

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/admin/support-tickets/${selected.id}/reply`, {
        method: "POST", headers: hdrs(), body: JSON.stringify({ message: reply }),
      });
      const json = await res.json();
      if (res.ok) {
        setSelected(s => ({
          ...s,
          messages: [...(s.messages || []), json.data],
          status: s.status === "open" ? "in_progress" : s.status,
        }));
        setReply("");
        fetchTickets();
      } else toast(json.message || "Failed", "error");
    } catch { toast("Network error", "error"); }
    finally { setSending(false); }
  };

  const stCfg = selected ? (STATUS_CFG[selected.status] || STATUS_CFG.open) : null;

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      <SectionHeader
        title="Support Center"
        subtitle="Manage user conversations and respond to queries"
      />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Stat label="Open" value={stats.open} color="green" icon="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z" />
        <Stat label="In Progress" value={stats.in_progress} color="blue" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
        <Stat label="Resolved" value={stats.resolved} color="gray" icon="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
        <Stat label="Total" value={stats.total} color="violet" icon="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
        <Stat label="Avg Rating" value={stats.avg_rating ? `${stats.avg_rating} ★` : "—"} color="amber" icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z" />
      </div>

      <div className="flex gap-5" style={{ minHeight: 560 }}>

        <div className={`flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all ${selected ? "w-[42%] flex-shrink-0" : "flex-1"}`}>

          <div className="p-4 border-b border-gray-100 space-y-3 flex-shrink-0">
            <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search conversations or users…" />
            <div className="flex flex-wrap gap-1.5">
              {["all", "open", "in_progress", "resolved", "closed"].map(s => (
                <button key={s} onClick={() => { setFStatus(s); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition capitalize ${fStatus === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {s.replace("_", " ")}
                </button>
              ))}
              <select value={fPriority} onChange={e => setFPriority(e.target.value)}
                className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white focus:outline-none">
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select value={fRole} onChange={e => setFRole(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white focus:outline-none">
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="company">Companies</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm animate-pulse">Loading conversations…</div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Ico d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z" size={22} color="#6366f1" />
                </div>
                <p className="text-gray-400 font-semibold text-sm">No conversations found</p>
                <p className="text-gray-300 text-xs mt-1">Try adjusting filters</p>
              </div>
            ) : tickets.map(t => {
              const sc = STATUS_CFG[t.status] || STATUS_CFG.open;
              const isActive = selected?.id === t.id;
              return (
                <button key={t.id} onClick={() => openTicket(t.id)}
                  className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-all ${isActive ? "bg-indigo-50/70 border-l-[3px] border-indigo-500" : "border-l-[3px] border-transparent"}`}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-gray-800 truncate flex-1">{t.subject}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_CFG[t.priority]}`}>{t.priority}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sc.badge}`}>{sc.label}</span>
                    <span className="text-[10px] text-gray-400 truncate">{t.user}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ml-auto ${t.user_role === "student" ? "bg-indigo-50 text-indigo-600" : "bg-teal-50 text-teal-600"}`}>
                      {t.user_role}
                    </span>
                  </div>
                  {t.last_message && <p className="text-[11px] text-gray-400 truncate">{t.last_message}</p>}
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[9px] text-gray-300">{t.updated_at}</p>
                    {t.rating && (
                      <span className="text-[10px] text-amber-500 font-semibold">{"★".repeat(t.rating)}</span>
                    )}
                    {t.ended_by_user && !t.rating && (
                      <span className="text-[9px] text-gray-400 italic">awaiting rating</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 flex-shrink-0">
              <Btn variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Btn>
              <span className="text-xs text-gray-400">{page} / {meta.last_page}</span>
              <Btn variant="secondary" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>Next →</Btn>
            </div>
          )}
        </div>

        {selected && (
          <div className="flex-1 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{selected.subject || "Loading…"}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {stCfg && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${stCfg.badge}`}>{stCfg.label}</span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_CFG[selected.priority]}`}>
                      {selected.priority}
                    </span>
                    {selected.user && (
                      <span className="text-[11px] text-gray-500">{selected.user}</span>
                    )}
                    {selected.user_role && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${selected.user_role === "student" ? "bg-indigo-50 text-indigo-600" : "bg-teal-50 text-teal-600"}`}>
                        {selected.user_role}
                      </span>
                    )}
                    {selected.user_email && (
                      <span className="text-[10px] text-gray-400">{selected.user_email}</span>
                    )}
                  </div>

                  {selected.rating && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 rounded-xl border border-amber-100">
                      <Ico d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z" size={14} color="#f59e0b" />
                      <StarDisplay rating={selected.rating} size={15} />
                      <span className="text-[10px] text-amber-700 font-medium ml-1">User rating</span>
                    </div>
                  )}
                  {selected.ended_by_user && !selected.rating && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-gray-400 italic">Conversation ended by user · awaiting rating</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                  {["open", "in_progress", "resolved", "closed"].map(s => (
                    <button key={s} disabled={selected.status === s} onClick={() => changeStatus(s)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition capitalize ${selected.status === s ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}>
                      {s.replace("_", " ")}
                    </button>
                  ))}
                  <button onClick={() => setSelected(null)} className="ml-1 text-gray-400 hover:text-gray-600 transition">
                    <Ico d="M6 18L18 6M6 6l12 12" size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {detailLoad ? (
                <div className="text-center text-gray-400 text-sm animate-pulse py-12">Loading conversation…</div>
              ) : (selected.messages || []).length === 0 ? (
                <div className="text-center text-gray-300 text-sm py-12">No messages yet.</div>
              ) : (
                (selected.messages || []).map(msg => <Bubble key={msg.id} msg={msg} />)
              )}
              <div ref={msgEnd} />
            </div>

            {!["closed"].includes(selected.status) ? (
              <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-gray-50/50">
                <textarea
                  value={reply} onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendReply(); }}
                  placeholder="Type your reply… (Ctrl+Enter to send)"
                  rows={2}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition shadow-sm"
                />
                <Btn onClick={sendReply} disabled={sending || !reply.trim()} className="self-end">
                  {sending ? "Sending…" : (
                    <><Ico d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" size={13} />Send</>
                  )}
                </Btn>
              </div>
            ) : (
              <div className="px-5 py-3 border-t border-gray-100 text-center text-xs text-gray-400 bg-gray-50/50 flex-shrink-0">
                This conversation is closed.
              </div>
            )}
          </div>
        )}

        {!selected && !loading && tickets.length > 0 && (
          <div className="flex-1 flex items-center justify-center bg-white border border-gray-100 rounded-2xl shadow-sm">
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Ico d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z" size={28} color="#6366f1" />
              </div>
              <p className="text-gray-500 font-semibold">Select a conversation</p>
              <p className="text-gray-400 text-xs mt-1">Click any conversation in the queue to view and reply</p>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default SupportCenter;
