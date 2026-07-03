import { useState, useEffect, useCallback, useRef } from "react";
import API_BASE_URL from "../../config";

const API_BASE = API_BASE_URL;

const STATUS_STYLE = {
  open: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  resolved: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  closed: { bg: "bg-gray-200", text: "text-gray-500", dot: "bg-gray-400" },
};
const PRIORITY_STYLE = {
  low: "bg-slate-100 text-slate-500",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-600",
};

const authHdrs = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const Stars = ({ value, hovered, onHover, onClick, readOnly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        disabled={readOnly}
        onMouseEnter={() => !readOnly && onHover && onHover(n)}
        onMouseLeave={() => !readOnly && onHover && onHover(0)}
        onClick={() => !readOnly && onClick && onClick(n)}
        className={`text-2xl transition-transform ${!readOnly ? "hover:scale-125 cursor-pointer" : "cursor-default"}`}
      >
        <span style={{ color: n <= (hovered || value || 0) ? "#f59e0b" : "#d1d5db" }}>★</span>
      </button>
    ))}
  </div>
);

const Bubble = ({ msg }) => (
  <div className={`flex gap-2.5 ${msg.is_admin ? "flex-row-reverse" : "flex-row"}`}>
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${msg.is_admin ? "bg-indigo-600" : "bg-slate-400"}`}>
      {msg.is_admin ? "S" : (msg.sender?.[0] ?? "U")}
    </div>
    <div className={`max-w-[78%] flex flex-col gap-1 ${msg.is_admin ? "items-end" : "items-start"}`}>
      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.is_admin ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"
        }`}>
        {msg.message}
      </div>
      <p className="text-[10px] text-gray-400 px-1">{msg.is_admin ? "Support Team" : msg.sender} · {msg.created_at}</p>
    </div>
  </div>
);

/* MAIN */
const SupportPage = ({ apiPrefix }) => {
  const baseUrl = `${API_BASE}/${apiPrefix}/support-tickets`;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoad, setDetailLoad] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [toast, setToast] = useState(null);
  const [hovStar, setHovStar] = useState(0);
  const [ratingDone, setRatingDone] = useState(false);

  const [form, setForm] = useState({ subject: "", category: "general", priority: "medium", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const msgEnd = useRef(null);
  const pollRef = useRef(null);
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* Auto-scroll */
  useEffect(() => {
    if (selected?.messages) msgEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  /* ── Fetch ── */
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(baseUrl, { headers: authHdrs() });
      const json = await res.json();
      if (res.ok) setTickets(json.data || []);
    } catch { showToast("Could not load tickets", "error"); }
    finally { setLoading(false); }
  }, [baseUrl]);

  /* ── Real-time polling: fetch new messages every 3s when thread open ── */
  const pollMessages = useCallback(async () => {
    const cur = selectedRef.current;
    if (!cur?.id || cur.ended_by_user || cur.status === "closed") return;
    try {
      const res = await fetch(`${baseUrl}/${cur.id}`, { headers: authHdrs() });
      const json = await res.json();
      if (!res.ok) return;
      const incoming = json.data?.messages || [];
      const existing = selectedRef.current?.messages || [];
      if (incoming.length !== existing.length) {
        setSelected(prev => ({ ...prev, ...json.data, messages: incoming }));
        fetchTickets();
      }
    } catch { }
  }, [baseUrl, fetchTickets]);

  /* Start / stop polling when thread selected */
  useEffect(() => {
    if (selected?.id && !selected.ended_by_user && selected.status !== "closed") {
      pollRef.current = setInterval(pollMessages, 3000);
    } else {
      clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [selected?.id, selected?.ended_by_user, selected?.status, pollMessages]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openDetail = async (id) => {
    setDetailLoad(true);
    setSelected({ id });
    setReply("");
    setHovStar(0);
    try {
      const res = await fetch(`${baseUrl}/${id}`, { headers: authHdrs() });
      const json = await res.json();
      if (res.ok) {
        setSelected(json.data);
        setRatingDone(json.data.rating !== null);
      }
    } catch { showToast("Could not load ticket", "error"); }
    finally { setDetailLoad(false); }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(baseUrl, { method: "POST", headers: authHdrs(), body: JSON.stringify(form) });
      const json = await res.json();
      if (res.ok) {
        showToast("Ticket submitted successfully!");
        setShowCreate(false);
        setForm({ subject: "", category: "general", priority: "medium", message: "" });
        fetchTickets();
        openDetail(json.data.id);
      } else showToast(json.message || "Failed to submit", "error");
    } catch { showToast("Network error", "error"); }
    finally { setSubmitting(false); }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${baseUrl}/${selected.id}/reply`, {
        method: "POST", headers: authHdrs(), body: JSON.stringify({ message: reply }),
      });
      const json = await res.json();
      if (res.ok) {
        setSelected(s => ({ ...s, messages: [...(s.messages || []), json.data] }));
        setReply("");
      } else showToast(json.message || "Failed to send", "error");
    } catch { showToast("Network error", "error"); }
    finally { setSending(false); }
  };

  const endConversation = async () => {
    if (ending) return;
    if (!window.confirm("End this conversation? You will be asked to rate your experience.")) return;
    setEnding(true);
    try {
      const res = await fetch(`${baseUrl}/${selected.id}/end`, { method: "POST", headers: authHdrs() });
      const json = await res.json();
      if (res.ok) {
        setSelected(s => ({ ...s, status: "resolved", ended_by_user: true }));
        fetchTickets();
        showToast("Conversation ended. Please rate your experience!");
      } else showToast(json.message || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setEnding(false); }
  };

  const submitRating = async (rating) => {
    try {
      const res = await fetch(`${baseUrl}/${selected.id}/rate`, {
        method: "POST", headers: authHdrs(), body: JSON.stringify({ rating }),
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

  const ss = selected ? (STATUS_STYLE[selected.status] || STATUS_STYLE.open) : null;
  const canReply = selected && !selected.ended_by_user && !["closed"].includes(selected.status);
  const canEnd = selected && !selected.ended_by_user && ["open", "in_progress"].includes(selected.status);
  const showRatingPrompt = selected?.ended_by_user && !ratingDone;

  return (
    <div className="max-w-4xl mx-auto">

      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all ${toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Support Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Submit and track your support conversations</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold rounded-xl transition shadow-md hover:shadow-lg hover:-translate-y-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          New Ticket
        </button>
      </div>

      <div className={`flex gap-5 ${selected ? "items-start" : ""}`}>

        {/* Ticket List */}
        <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden ${selected ? "w-[42%] flex-shrink-0" : "w-full"}`}>
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm animate-pulse">Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <p className="text-gray-500 font-semibold text-sm">No support tickets yet</p>
              <p className="text-gray-400 text-xs mt-1">Click "New Ticket" to submit your first request</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tickets.map(t => {
                const stl = STATUS_STYLE[t.status] || STATUS_STYLE.open;
                return (
                  <button key={t.id} onClick={() => openDetail(t.id)}
                    className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-all ${selected?.id === t.id ? "bg-indigo-50/60 border-l-[3px] border-indigo-500" : "border-l-[3px] border-transparent"}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-gray-800 truncate flex-1">{t.subject}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${stl.dot}`} />
                      <span className={`text-[10px] font-semibold capitalize ${stl.text}`}>{t.status.replace("_", " ")}</span>
                      <span className="text-[10px] text-gray-400 capitalize">· {t.category}</span>
                    </div>
                    {t.last_message && <p className="text-xs text-gray-400 truncate mt-1">{t.last_message}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-gray-300">{t.updated_at}</p>
                      {t.rating && <span className="text-[10px] text-amber-500">{"★".repeat(t.rating)}</span>}
                      {t.ended_by_user && !t.rating && <span className="text-[9px] text-gray-400 italic">rate us?</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Thread Panel */}
        {selected && (
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: 580 }}>
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{selected.subject}</p>
                {ss && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className={`w-1.5 h-1.5 rounded-full ${ss.dot}`} />
                    <span className={`text-[10px] font-semibold ${ss.text}`}>{selected.status?.replace("_", " ")}</span>
                    {selected.rating && (
                      <span className="text-[10px] text-amber-500 font-bold ml-1">{"★".repeat(selected.rating)} ({selected.rating}/5)</span>
                    )}
                    {selected.ended_by_user && !selected.rating && (
                      <span className="text-[9px] text-gray-400 italic">· ended · awaiting rating</span>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {detailLoad ? (
                <div className="text-center text-gray-400 animate-pulse py-8 text-sm">Loading…</div>
              ) : (selected.messages || []).map(msg => <Bubble key={msg.id} msg={msg} />)}
              <div ref={msgEnd} />
            </div>

            {/* Rating prompt */}
            {showRatingPrompt && (
              <div className="px-4 py-4 border-t border-amber-100 bg-amber-50 flex-shrink-0">
                <p className="text-sm font-bold text-amber-800 mb-1">How satisfied were you with our support?</p>
                <p className="text-xs text-amber-600 mb-3">Your feedback helps us improve</p>
                <Stars
                  value={0}
                  hovered={hovStar}
                  onHover={setHovStar}
                  onClick={submitRating}
                />
              </div>
            )}

            {ratingDone && selected.rating && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-500 text-sm">★</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700">You rated this support</p>
                  <p className="text-[10px] text-amber-500">{"★".repeat(selected.rating)}{"☆".repeat(5 - selected.rating)} · {selected.rating}/5</p>
                </div>
              </div>
            )}

            {/* Reply box */}
            {canReply && (
              <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex gap-2">
                  <textarea
                    value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendReply(); }}
                    placeholder="Reply… (Ctrl+Enter to send)"
                    rows={2}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                  <div className="flex flex-col gap-1.5">
                    <button onClick={sendReply} disabled={sending || !reply.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition">
                      {sending ? "…" : "Send"}
                    </button>
                    {canEnd && (
                      <button onClick={endConversation} disabled={ending}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 text-[10px] font-semibold rounded-xl transition">
                        End Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!canReply && !showRatingPrompt && !ratingDone && (
              <div className="px-4 py-3 border-t border-gray-100 text-center text-xs text-gray-400 flex-shrink-0">
                {selected.status === "closed" ? "This ticket has been closed by admin." : "This conversation has ended."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={createTicket} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-900">New Support Ticket</p>
              <button type="button" onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Subject *</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required maxLength={200}
                  placeholder="Brief description of your issue"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Message *</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required maxLength={5000} rows={4}
                  placeholder="Describe your issue in detail…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-semibold transition">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition">
                {submitting ? "Submitting…" : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
