import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = "http://localhost:8000/api";
const hdrs = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const STATUS_DOT = {
  open: "bg-emerald-500",
  in_progress: "bg-blue-500",
  resolved: "bg-gray-400",
  closed: "bg-gray-400",
};

const Bubble = ({ msg }) => (
  <div className={`flex gap-2 ${msg.is_admin ? "flex-row-reverse" : "flex-row"}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5 ${msg.is_admin ? "bg-indigo-600" : "bg-slate-400"}`}>
      {msg.is_admin ? "S" : (msg.sender?.[0] ?? "U")}
    </div>
    <div className={`max-w-[80%] flex flex-col gap-0.5 ${msg.is_admin ? "items-end" : "items-start"}`}>
      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.is_admin
          ? "bg-indigo-600 text-white rounded-tr-sm"
          : "bg-gray-100 text-gray-800 rounded-tl-sm"
        }`}>
        {msg.message}
      </div>
      <p className="text-[9px] text-gray-400 px-1">{msg.is_admin ? "Support" : msg.sender} · {msg.created_at}</p>
    </div>
  </div>
);

/* MAIN WIDGET */
const ChatWidget = ({ apiPrefix }) => {
  const base = `${API_BASE}/${apiPrefix}/support-tickets`;

  const [open, setOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoad, setDetailLoad] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hovStar, setHovStar] = useState(0);
  const [ratingDone, setRatingDone] = useState(false);
  const [endingConv, setEndingConv] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ subject: "", category: "general", priority: "medium", message: "" });

  const msgEnd = useRef(null);
  const pollRef = useRef(null);
  const selectedRef = useRef(selected);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (selected?.messages) msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  /* ── Fetch ticket list ── */
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(base, { headers: hdrs() });
      const json = await res.json();
      if (res.ok) setTickets(json.data || []);
    } catch { }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { if (open) fetchTickets(); }, [open, fetchTickets]);

  /* ── Real-time polling: fetch new messages every 3s when thread open ── */
  const pollMessages = useCallback(async () => {
    const cur = selectedRef.current;
    if (!cur?.id || cur.ended_by_user || cur.status === "closed") return;
    try {
      const res = await fetch(`${base}/${cur.id}`, { headers: hdrs() });
      const json = await res.json();
      if (!res.ok) return;
      const incoming = json.data?.messages || [];
      const existing = selectedRef.current?.messages || [];
      if (incoming.length !== existing.length) {
        setSelected(prev => ({ ...prev, ...json.data, messages: incoming }));
        fetchTickets();
      }
    } catch { }
  }, [base, fetchTickets]);

  /* Start / stop polling when a thread is selected */
  useEffect(() => {
    if (selected?.id && !selected.ended_by_user && selected.status !== "closed") {
      pollRef.current = setInterval(pollMessages, 3000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [selected?.id, selected?.ended_by_user, selected?.status, pollMessages]);

  /* ── Open thread ── */
  const openThread = async (id) => {
    clearInterval(pollRef.current);
    setDetailLoad(true);
    setSelected({ id });
    setReply("");
    setHovStar(0);
    setRatingDone(false);
    try {
      const res = await fetch(`${base}/${id}`, { headers: hdrs() });
      const json = await res.json();
      if (res.ok) {
        setSelected(json.data);
        setRatingDone(json.data.rating !== null);
      }
    } catch { }
    finally { setDetailLoad(false); }
  };

  const sendReply = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${base}/${selected.id}/reply`, {
        method: "POST", headers: hdrs(), body: JSON.stringify({ message: reply }),
      });
      const json = await res.json();
      if (res.ok) {
        setSelected(s => ({ ...s, messages: [...(s.messages || []), json.data] }));
        setReply("");
        fetchTickets();
      } else showToast(json.message || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setSending(false); }
  };

  /* ── End conversation ── */
  const endConversation = async () => {
    if (endingConv) return;
    setEndingConv(true);
    try {
      const res = await fetch(`${base}/${selected.id}/end`, { method: "POST", headers: hdrs() });
      const json = await res.json();
      if (res.ok) {
        setSelected(s => ({ ...s, status: "resolved", ended_by_user: true }));
        fetchTickets();
        showToast("Conversation ended. Please rate your experience!");
      } else showToast(json.message || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setEndingConv(false); }
  };

  const submitRating = async (rating) => {
    try {
      const res = await fetch(`${base}/${selected.id}/rate`, {
        method: "POST", headers: hdrs(), body: JSON.stringify({ rating }),
      });
      const json = await res.json();
      if (res.ok) {
        setSelected(s => ({ ...s, rating }));
        setRatingDone(true);
        fetchTickets();
        showToast("Thank you for your feedback! ⭐");
      } else showToast(json.message || "Failed", "error");
    } catch { showToast("Network error", "error"); }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(base, { method: "POST", headers: hdrs(), body: JSON.stringify(form) });
      const json = await res.json();
      if (res.ok) {
        showToast("Ticket submitted!");
        setShowCreate(false);
        setForm({ subject: "", category: "general", priority: "medium", message: "" });
        fetchTickets();
        openThread(json.data.id);
      } else showToast(json.message || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setSubmitting(false); }
  };

  const isClosed = selected && (selected.status === "closed" || (selected.ended_by_user));
  const canReply = selected && !isClosed;
  const canEnd = selected && !selected.ended_by_user && ["open", "in_progress"].includes(selected.status);
  const needsRating = selected && selected.ended_by_user && !ratingDone;
  const activeCount = tickets.filter(t => t.status === "in_progress").length;

  return (
    <>
      {toast && (
        <div className={`fixed bottom-24 right-5 z-[300] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl ${toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
          }`} style={{ animation: "slideUp 0.2s ease" }}>
          {toast.msg}
        </div>
      )}

      <button
        id="chat-widget-btn"
        onClick={() => { setOpen(v => !v); if (!open) { setSelected(null); setShowCreate(false); } }}
        className="fixed bottom-6 right-6 z-[200] w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        title="Chat with Support"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[200] w-[370px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: 520, animation: "slideUp 0.2s ease" }}>

          <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

          <div className="bg-indigo-600 px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Support Center</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <p className="text-white/70 text-[10px]">We reply in minutes</p>
              </div>
            </div>
            {selected && (
              <button onClick={() => setSelected(null)} className="text-white/80 hover:text-white transition p-1" title="Back to list">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
            )}
          </div>

          {selected && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                <p className="text-xs font-bold text-gray-800 truncate">{selected.subject || "Loading…"}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[selected.status] || "bg-gray-400"}`} />
                  <span className="text-[10px] text-gray-500 capitalize">{selected.status?.replace("_", " ")}</span>
                  {!selected.ended_by_user && selected.status !== "closed" && (
                    <span className="ml-auto text-[9px] text-emerald-500 font-semibold flex items-center gap-0.5">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full inline-block" />
                      Live
                    </span>
                  )}
                  {selected.rating && (
                    <span className="ml-auto text-[10px] text-amber-500 font-semibold">{"★".repeat(selected.rating)}</span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {detailLoad ? (
                  <p className="text-center text-gray-400 text-xs animate-pulse py-8">Loading…</p>
                ) : (selected.messages || []).map(msg => <Bubble key={msg.id} msg={msg} />)}
                <div ref={msgEnd} />
              </div>

              {needsRating && (
                <div className="px-4 py-3 border-t border-amber-100 bg-amber-50 flex-shrink-0">
                  <p className="text-xs font-bold text-amber-800 mb-2">Rate your experience ⭐</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => submitRating(n)}
                        onMouseEnter={() => setHovStar(n)} onMouseLeave={() => setHovStar(0)}
                        className="text-2xl transition-transform hover:scale-125">
                        <span style={{ color: n <= (hovStar || 0) ? "#f59e0b" : "#d1d5db" }}>★</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {ratingDone && selected.rating && (
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex-shrink-0 text-center">
                  <p className="text-[10px] text-gray-500">Your rating</p>
                  <p className="text-sm text-amber-500 font-bold">{"★".repeat(selected.rating)}{"☆".repeat(5 - selected.rating)}</p>
                </div>
              )}

              {canReply && (
                <div className="px-3 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0 bg-white">
                  <textarea
                    value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendReply(); }}
                    placeholder="Type a message… (Ctrl+Enter)"
                    rows={2}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                  <div className="flex flex-col gap-1.5">
                    <button onClick={sendReply} disabled={sending || !reply.trim()}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition">
                      {sending ? "…" : "↑"}
                    </button>
                    {canEnd && (
                      <button onClick={endConversation} disabled={endingConv}
                        className="px-2 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 text-[9px] font-bold rounded-xl transition">
                        End
                      </button>
                    )}
                  </div>
                </div>
              )}

              {isClosed && !needsRating && !ratingDone && (
                <div className="px-4 py-3 border-t border-gray-100 text-center text-[11px] text-gray-400 flex-shrink-0">
                  {selected.status === "closed" ? "Closed by admin." : "This conversation has ended."}
                </div>
              )}
            </div>
          )}

          {!selected && !showCreate && (
            <>
              <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <button onClick={() => setShowCreate(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-sm">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  New Support Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {loading ? (
                  <p className="p-8 text-center text-gray-400 text-xs animate-pulse">Loading…</p>
                ) : tickets.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-semibold text-xs">No conversations yet</p>
                    <p className="text-gray-400 text-[10px] mt-1">Use the button above to get help!</p>
                  </div>
                ) : tickets.map(t => (
                  <button key={t.id} onClick={() => openThread(t.id)}
                    className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-gray-800 truncate flex-1">{t.subject}</p>
                      {t.rating
                        ? <span className="text-[10px] text-amber-500 flex-shrink-0">{"★".repeat(t.rating)}</span>
                        : t.status === "in_progress"
                          ? <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" title="Active" />
                          : null
                      }
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[t.status] || "bg-gray-400"}`} />
                      <span className="text-[10px] text-gray-500 capitalize">{t.status.replace("_", " ")}</span>
                    </div>
                    {t.last_message && <p className="text-[10px] text-gray-400 truncate mt-1">{t.last_message}</p>}
                    <p className="text-[9px] text-gray-300 mt-1">{t.updated_at}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {!selected && showCreate && (
            <form onSubmit={createTicket} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0 bg-gray-50">
                <button type="button" onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                </button>
                <p className="text-sm font-bold text-gray-800">New Support Request</p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject *</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    required maxLength={200} placeholder="What do you need help with?"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message *</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required maxLength={5000} rows={5} placeholder="Describe your issue in detail…"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none" />
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0 bg-white">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 text-xs text-gray-500 hover:text-gray-700 font-semibold transition border border-gray-200 rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-sm">
                  {submitting ? "Sending…" : "🚀 Send Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
