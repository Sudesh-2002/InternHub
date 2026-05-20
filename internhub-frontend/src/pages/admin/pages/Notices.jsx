import { useState, useEffect, useRef, useCallback } from "react";
import {
  Page, SectionHeader, Badge, Btn, Modal,
  Input, Textarea, Select, Ico, useToast, Toast, FilterPills
} from "../components/Shared";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const NOTICE_TYPES = [
  { value: "general", label: "General" },
  { value: "maintenance", label: "Maintenance" },
  { value: "internship_alert", label: "Internship Alert" },
  { value: "platform_update", label: "Platform Update" },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users", icon: "M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0" },
  { value: "students", label: "Students Only", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z" },
  { value: "companies", label: "Companies Only", icon: "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" },
  { value: "user", label: "Specific User", icon: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" },
];

const TYPE_STYLE = {
  general: "text-sky-700 bg-sky-50 ring-1 ring-sky-200",
  maintenance: "text-amber-700 bg-amber-50 ring-1 ring-amber-200",
  internship_alert: "text-indigo-700 bg-indigo-50 ring-1 ring-indigo-200",
  platform_update: "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200",
};

const AUDIENCE_STYLE = {
  all: "text-violet-700 bg-violet-50 ring-1 ring-violet-200",
  students: "text-sky-700 bg-sky-50 ring-1 ring-sky-200",
  companies: "text-orange-700 bg-orange-50 ring-1 ring-orange-200",
  user: "text-rose-700 bg-rose-50 ring-1 ring-rose-200",
};

const AUDIENCE_LABEL = { all: "All Users", students: "Students", companies: "Companies", user: "Specific User" };
const TYPE_LABEL = { general: "General", maintenance: "Maintenance", internship_alert: "Internship Alert", platform_update: "Platform Update" };

const EMPTY_FORM = { title: "", type: "general", body: "", audience: "all", target_user_id: null };

const token = () => localStorage.getItem("token");
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

const Skeleton = () => (
  <div className="grid gap-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-pulse">
        <div className="w-24 h-6 bg-gray-100 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-50 rounded w-3/4" />
          <div className="h-3 bg-gray-50 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const UserSearchField = ({ value, onChange }) => {
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const search = useCallback((q) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/admin/users/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() });
        const json = await res.json();
        setResults(json.data || []);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
  }, []);

  const pick = (user) => {
    setQuery(`${user.name} (${user.email})`);
    setOpen(false);
    onChange(user);
  };

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
        Search User *
      </label>
      <div className="relative">
        <Ico d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={14} color="#94a3b8"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); search(e.target.value); }}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {results.map(u => (
            <button key={u.id} type="button" onClick={() => pick(u)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition text-left">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {u.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${u.role === "student" ? "bg-sky-100 text-sky-700" : "bg-orange-100 text-orange-700"}`}>
                {u.role}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 text-sm text-gray-400">
          No users found.
        </div>
      )}
    </div>
  );
};

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [targetUser, setTargetUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const { toasts, add: toast, remove } = useToast();

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/announcements`, { headers: authHeaders() });
      const json = await res.json();
      if (res.ok) setNotices(json.data || []);
      else toast(json.message || "Failed to load announcements", "error");
    } catch {
      toast("Network error — could not load announcements", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setTargetUser(null);
    setModal(true);
  };

  const openEdit = (n) => {
    setForm({ title: n.title, type: n.type, body: n.body, audience: n.audience, target_user_id: n.target_user?.id || null });
    setEditing(n.id);
    setTargetUser(n.target_user || null);
    setModal(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast("Title is required", "error"); return; }
    if (!form.body.trim()) { toast("Body is required", "error"); return; }
    if (form.audience === "user" && !form.target_user_id) {
      toast("Please select a specific user", "error"); return;
    }

    setSaving(true);
    try {
      const isEdit = !!editing;
      const url = isEdit ? `${API}/admin/announcements/${editing}` : `${API}/admin/announcements`;
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit
        ? { title: form.title, body: form.body, type: form.type }
        : { ...form };

      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      const json = await res.json();

      if (!res.ok) { toast(json.message || "Save failed", "error"); return; }

      toast(json.message || (isEdit ? "Notice updated" : "Notice published & notifications sent"), "success");
      setModal(false);
      await fetchNotices();
    } catch {
      toast("Network error — save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this announcement? Existing notifications won't be removed.")) return;
    try {
      const res = await fetch(`${API}/admin/announcements/${id}`, { method: "DELETE", headers: authHeaders() });
      const json = await res.json();
      if (res.ok) { toast("Announcement deleted", "success"); setNotices(p => p.filter(n => n.id !== id)); }
      else toast(json.message || "Delete failed", "error");
    } catch {
      toast("Network error — delete failed", "error");
    }
  };

  const filterOptions = ["all", ...NOTICE_TYPES.map(t => t.value)];
  const filtered = filter === "all" ? notices : notices.filter(n => n.type === filter);

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      {modal && (
        <Modal
          title={editing ? "Edit Announcement" : "New Announcement"}
          onClose={() => setModal(false)}
          footer={
            <>
              <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
              <Btn onClick={save} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : editing ? "Save Changes" : "Publish Notice"}
              </Btn>
            </>
          }
        >
          <div className="space-y-5">
            <Input
              label="Title *"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Announcement title…"
            />

            <Select label="Type" value={form.type} onChange={e => set("type", e.target.value)}>
              {NOTICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>

            <Textarea
              label="Body *"
              rows={4}
              value={form.body}
              onChange={e => set("body", e.target.value)}
              placeholder="Write the announcement content…"
            />

            {!editing && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Audience *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { set("audience", opt.value); set("target_user_id", null); setTargetUser(null); }}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${form.audience === opt.value
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-700"
                        }`}
                    >
                      <Ico d={opt.icon} size={14} />
                      {opt.label}
                    </button>
                  ))}
                </div>

                {form.audience === "user" && (
                  <div className="mt-4">
                    <UserSearchField
                      value={targetUser}
                      onChange={(u) => { setTargetUser(u); set("target_user_id", u.id); }}
                    />
                    {targetUser && (
                      <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <div className="w-6 h-6 rounded-lg bg-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {targetUser.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-indigo-800 truncate">{targetUser.name}</p>
                          <p className="text-[10px] text-indigo-500 truncate">{targetUser.email}</p>
                        </div>
                        <button type="button" onClick={() => { setTargetUser(null); set("target_user_id", null); }}
                          className="text-indigo-400 hover:text-indigo-700 transition">
                          <Ico d="M18 6L6 18M6 6l12 12" size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {form.audience !== "user" && (
                  <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5">
                    <Ico d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={13} />
                    {form.audience === "all" && "This notice will notify all students and companies."}
                    {form.audience === "students" && "This notice will notify all registered students only."}
                    {form.audience === "companies" && "This notice will notify all registered companies only."}
                  </p>
                )}
              </div>
            )}

            {editing && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                <Ico d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" size={14} color="#94a3b8" />
                <span className="text-xs text-gray-500">Audience is locked after publishing. Create a new notice to change targeting.</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      <SectionHeader
        title="Announcements & Notices"
        subtitle="Create platform-wide or targeted notices — sent directly to users' notification panels"
        action={
          <Btn onClick={openNew}>
            <Ico d="M12 5v14M5 12h14" size={14} />
            New Notice
          </Btn>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {filterOptions.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${filter === f ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300"
              }`}>
            {f === "all" ? "All" : TYPE_LABEL[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Ico d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7-1a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" size={22} color="#6366f1" />
          </div>
          <p className="text-gray-500 font-medium">No announcements yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first notice to notify users.</p>
          <div className="mt-4">
            <Btn onClick={openNew}>
              <Ico d="M12 5v14M5 12h14" size={14} />
              New Notice
            </Btn>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(n => (
            <div key={n.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200">

              <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex-shrink-0 ${TYPE_STYLE[n.type] || "text-gray-500 bg-gray-100"}`}>
                {TYPE_LABEL[n.type] || n.type}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h3 className="text-gray-900 font-semibold text-sm">{n.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${AUDIENCE_STYLE[n.audience] || "bg-gray-100 text-gray-500"}`}>
                      <Ico d={AUDIENCE_OPTIONS.find(a => a.value === n.audience)?.icon || ""} size={10} />
                      {AUDIENCE_LABEL[n.audience] || n.audience}
                    </span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed line-clamp-2">{n.body}</p>

                {/* Specific target user */}
                {n.target_user && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-rose-50 border border-rose-100 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                    <Ico d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" size={11} />
                    {n.target_user.name} · {n.target_user.email}
                    <span className="ml-1 capitalize text-rose-500 font-normal">({n.target_user.role})</span>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2.5">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Ico d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={11} />
                    {n.created_at}
                  </span>
                  {n.admin_name && (
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Ico d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={11} />
                      {n.admin_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 flex-shrink-0">
                <Btn variant="ghost" size="sm" onClick={() => openEdit(n)} title="Edit">
                  <Ico d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={13} />
                </Btn>
                <Btn variant="danger" size="sm" onClick={() => del(n.id)} title="Delete">
                  <Ico d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" size={13} />
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
};

export default Notices;