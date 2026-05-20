// src/pages/shared/ChatWidget.jsx
// Floating chat bubble for Student & Company dashboards

import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = "http://localhost:8000/api";
const hdrs = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const STATUS_DOT = {
  open:        "bg-emerald-500",
  in_progress: "bg-blue-500",
  resolved:    "bg-gray-400",
  closed:      "bg-gray-400",
};

/* ── Star rating component ─────────────────────────────────────── */
const Stars = ({ value, onChange, readOnly = false, size = 22 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && onChange && onChange(n)}
        style={{ fontSize: size, lineHeight: 1 }}
        className={`transition-transform ${!readOnly ? "hover:scale-125 cursor-pointer" : "cursor-default"}`}
      >
        <span style={{ color: n <= (value || 0) ? "#f59e0b" : "#d1d5db" }}>★</span>
      </button>
    ))}
  </div>
);

/* ── Message bubble ─────────────────────────────────────────────── */
const Bubble = ({ msg }) => (
  <div className={`flex gap-2 ${msg.is_admin ? "flex-row-reverse" : "flex-row"}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5 ${msg.is_admin ? "bg-indigo-600" : "bg-slate-400"}`}>
      {msg.is_admin ? "S" : (msg.sender?.[0] ?? "U")}
    </div>
    <div className={`max-w-[80%] flex flex-col gap-0.5 ${msg.is_admin ? "items-end" : "items-start"}`}>
      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${
        msg.is_admin
          ? "bg-indigo-600 text-white rounded-tr-sm"
          : "bg-gray-100 text-gray-800 rounded-tl-sm"
      }`}>
        {msg.message}
      </div>
      <p className="text-[9px] text-gray-400 px-1">{msg.is_admin ? "Support" : msg.sender} · {msg.created_at}</p>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   MAIN WIDGET
════════════════════════════════════════════════════════════════ */
const ChatWidget = ({ apiPrefix }) => {
  const base = `${API_BASE}/${apiPrefix}/support-tickets`;

  const [open,        setOpen]        = useState(false);
  const [tickets,     setTickets]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [selected,    setSelected]    = useState(null);
  const [detailLoad,  setDetailLoad]  = useState(false);
  const [reply,       setReply]       = useState("");
  const [sending,     setSending]     = useState(false);
  const [showCreate,  setShowCreate]  = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [hovStar,     setHovStar]     = useState(0);
  const [ratingVal,   setRatingVal]   = useState(0);
  const [ratingDone,  setRatingDone]  = useState(false);
  const [endingConv,  setEndingConv]  = useState(false);
  const [toast,       setToast]       = useState(null);
  const [form, setForm] = useState({ subject: "", category: "general", priority: "medium", message: "" });

  const msgEnd = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Scroll to bottom ── */
  useEffect(() => {
    if (selected?.messages) {
      msgEnd.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selected?.messages]);

  /* ── Fetch ticket list ── */
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(base, { headers: hdrs() });
      const json = await res.json();
      if (res.ok) setTickets(json.data || []);
    } catch {}
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { if (open) fetchTickets(); }, [open, fetchTickets]);

  /* ── Open thread ── */
  const openThread = async (id) => {
    setDetailLoad(true);
    setSelected({ id });
    setReply("");
    setRatingVal(0);
    setRatingDone(false);
    try {
      const res  = await fetch(`${base}/${id}`, { headers: hdrs() });
      const json = await res.json();
      if (res.ok) {
        setSelected(json.data);
        setRatingDone(json.data.rating !== null);
      }
    } catch {}
    finally { setDetailLoad(false); }
  };

  /* ── Send reply ── */
  const sendReply = async () => {
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      const res  = await fetch(`${base}/${selected.id}/reply`, {
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
      const res  = await fetch(`${base}/${selected.id}/end`, { method: "POST", headers: hdrs() });
      const json = await res.json();
      if (res.ok) {
        setSelected(s => ({ ...s, status: "resolved", ended_by_user: true }));
        fetchTickets();
        showToast("Conversation ended. Please rate your experience!");
      } else showToast(json.message || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setEndingConv(false); }
  };

  /* ── Submit rating ── */
  const submitRating = async (rating) => {
    try {
      const res  = await fetch(`${base}/${selected.id}/rate`, {
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

  /* ── Create ticket ── */
  const createTicket = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      const res  = await fetch(base, { method: "POST", headers: hdrs(), body: JSON.stringify(form) });
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

  const isClosed    = selected && (selected.status === "closed" || (selected.ended_by_user && selected.status === "resolved"));
  const canReply    = selected && !isClosed;
  const canEnd      = selected && !selected.ended_by_user && !["closed"].includes(selected.status) && ["open", "in_progress"].includes(selected.status);
  const needsRating = selected && selected.ended_by_user && !ratingDone;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-24 right-5 z-[300] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl transition-all ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Floating button */}
      <button
        id="chat-widget-btn"
        onClick={() => setOpen(v => !v)}
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
            {tickets.some(t => t.status === "in_progress") && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[200] w-[360px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ animation: "slideUp 0.2s ease" }}>

          <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-sm">Support Center</p>
                <p className="text-white/70 text-[10px]">We typically reply in minutes</p>
              </div>
            </div>
            {selected ? (
              <button onClick={() => setSelected(null)} className="text-white/80 hover:text-white transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
            ) : (
              <button onClick={() => setShowCreate(true)} className="text-white/80 hover:text-white transition text-lg font-bold leading-none" title="New ticket">+</button>
            )}
          </div>

          {/* ── Thread View ── */}
          {selected && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Ticket meta bar */}
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                <p className="text-xs font-bold text-gray-800 truncate">{selected.subject || "Loading…"}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[selected.status] || "bg-gray-400"}`} />
                  <span className="text-[10px] text-gray-500 capitalize">{selected.status?.replace("_", " ")}</span>
                  {selected.rating && (
                    <span className="ml-auto text-[10px] text-amber-500 font-semibold">{"★".repeat(selected.rating)}</span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {detailLoad ? (
                  <p className="text-center text-gray-400 text-xs animate-pulse py-8">Loading…</p>
                ) : (selected.messages || []).map(msg => <Bubble key={msg.id} msg={msg} />)}
                <div ref={msgEnd} />
              </div>

              {/* Rating prompt */}
              {needsRating && (
                <div className="px-4 py-3 border-t border-amber-100 bg-amber-50 flex-shrink-0">
                  <p className="text-xs font-bold text-amber-800 mb-2">How was your experience? Rate us!</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => submitRating(n)}
                        onMouseEnter={() => setHovStar(n)}
                        onMouseLeave={() => setHovStar(0)}
                        className="text-2xl transition-transform hover:scale-125"
                      >
                        <span style={{ color: n <= (hovStar || ratingVal) ? "#f59e0b" : "#d1d5db" }}>★</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rated confirmation */}
              {ratingDone && selected.rating && (
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex-shrink-0 text-center">
                  <p className="text-[10px] text-gray-500">You rated this conversation</p>
                  <p className="text-sm text-amber-500 font-bold">{"★".repeat(selected.rating)}{"☆".repeat(5 - selected.rating)}</p>
                </div>
              )}

              {/* Reply box */}
              {canReply && (
                <div className="px-3 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendReply(); }}
                    placeholder="Type a message… (Ctrl+Enter)"
                    rows={2}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                  <div className="flex flex-col gap-1.5">
                    <button onClick={sendReply} disabled={sending || !reply.trim()}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition">
                      {sending ? "…" : "Send"}
                    </button>
                    {canEnd && (
                      <button onClick={endConversation} disabled={endingConv}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 text-[10px] font-semibold rounded-xl transition">
                        End
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Conversation ended */}
              {isClosed && !needsRating && !ratingDone && (
                <div className="px-4 py-3 border-t border-gray-100 text-center text-[11px] text-gray-400 flex-shrink-0">
                  This conversation has ended.
                </div>
              )}
            </div>
          )}

          {/* ── Ticket List ── */}
          {!selected && !showCreate && (
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
                  <p className="text-gray-400 text-[10px] mt-1">Click + to start a new support request</p>
                </div>
              ) : tickets.map(t => (
                <button key={t.id} onClick={() => openThread(t.id)}
                  className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-gray-800 truncate flex-1">{t.subject}</p>
                    {t.rating && <span className="text-[10px] text-amber-500">{"★".repeat(t.rating)}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[t.status] || "bg-gray-400"}`} />
                    <span className="text-[10px] text-gray-500 capitalize">{t.status.replace("_", " ")}</span>
                    <span className="text-[10px] text-gray-300 capitalize">· {t.category}</span>
                  </div>
                  {t.last_message && <p className="text-[10px] text-gray-400 truncate mt-1">{t.last_message}</p>}
                  <p className="text-[9px] text-gray-300 mt-1">{t.updated_at}</p>
                </button>
              ))}
            </div>
          )}

          {/* ── Create Form ── */}
          {!selected && showCreate && (
            <form onSubmit={createTicket} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <button type="button" onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                </button>
                <p className="text-xs font-bold text-gray-800">New Support Request</p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Subject *</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    required maxLength={200} placeholder="Brief description"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="billing">Billing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Message *</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required maxLength={5000} rows={4} placeholder="Describe your issue…"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none" />
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 text-xs text-gray-500 hover:text-gray-700 font-semibold transition border border-gray-200 rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition">
                  {submitting ? "Sending…" : "Submit"}
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
