// src/pages/admin/pages/AdminProfile.jsx

import { useState, useEffect, useRef } from "react";
import Icon from "../../student/components/Icon";
import { icons } from "../../student/components/data/mockData";
import Toast from "../../../components/Toast";
import { useAuth } from "../../../context/AuthContext";

const apiFetch = async (url, options = {}) => {
  const csrf = decodeURIComponent(
    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ""
  );
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`http://127.0.0.1:8000/api${url}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      "X-XSRF-TOKEN": csrf,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Request failed.");
  return json;
};

/* ─────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────── */
const Section = ({ title, action, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const Modal = ({ title, onClose, onSave, saving, children }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <Icon d={icons.x} size={18} />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2"
        >
          {saving && (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50
               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50
               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
  />
);

/* ── Read-only info row ─────────────────────────────────────────────────────── */
const InfoRow = ({ label, value, mono }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 gap-4">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0 mt-0.5">
      {label}
    </p>
    <p className={`text-sm text-gray-700 text-right font-medium ${mono ? "font-mono" : ""}`}>
      {value || <span className="text-gray-300 italic font-normal">Not set</span>}
    </p>
  </div>
);

/* ── Stat tile ─────────────────────────────────────────────────────────────── */
const StatTile = ({ label, value, sub }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-lg font-bold text-gray-800 mt-0.5">{value ?? "—"}</p>
    {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

/* ── Password strength ─────────────────────────────────────────────────────── */
const strengthOf = (pw) => {
  if (!pw) return null;
  if (pw.length < 6)
    return { label: "Weak",   bar: "bg-red-400",    text: "text-red-500",    w: "w-1/4" };
  if (pw.length < 10)
    return { label: "Fair",   bar: "bg-amber-400",  text: "text-amber-500",  w: "w-2/4" };
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw))
    return { label: "Strong", bar: "bg-emerald-400", text: "text-emerald-600", w: "w-full" };
  return   { label: "Good",   bar: "bg-indigo-400",  text: "text-indigo-600",  w: "w-3/4" };
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const AdminProfile = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [modal,   setModal]   = useState(null);
  const [draft,   setDraft]   = useState({});
  const [toast,   setToast]   = useState(null);
  const [saving,  setSaving]  = useState(false);
  const avatarRef = useRef();
  const { refreshUser } = useAuth();

  /* ── Fetch from API ── */
  const loadProfile = () => {
    setLoading(true);
    setError(null);
    apiFetch("/admin/profile")
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((e)  => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { loadProfile(); }, []);

  const openModal  = (key, initial = {}) => { setDraft(initial); setModal(key); };
  const closeModal = () => { setModal(null); setDraft({}); };
  const showToast  = (message, type = "success") => setToast({ message, type });
  const hideToast  = () => setToast(null);

  const editBtn = (key, initial) => (
    <button
      onClick={() => openModal(key, initial)}
      className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-700 transition"
    >
      <Icon d={icons.edit} size={13} /> Edit
    </button>
  );

  /* ── PATCH text fields ── */
  const syncField = async (patch) => {
    setSaving(true);
    showToast("Saving…", "loading");
    try {
      const res = await apiFetch("/admin/profile", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setData(res.data);
      showToast("Changes saved", "success");
      closeModal();
    } catch (e) {
      showToast(e.message || "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Password change ── */
  const handlePasswordSave = async () => {
    if (!draft.current_password || !draft.new_password) {
      showToast("Please fill in all fields.", "error"); return;
    }
    if (draft.new_password !== draft.confirm_password) {
      showToast("New passwords do not match.", "error"); return;
    }
    setSaving(true);
    showToast("Saving…", "loading");
    try {
      await apiFetch("/admin/profile/password", {
        method: "POST",
        body: JSON.stringify({
          current_password:          draft.current_password,
          new_password:              draft.new_password,
          new_password_confirmation: draft.confirm_password,
        }),
      });
      showToast("Password updated successfully.", "success");
      closeModal();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Avatar upload ── */
  const handleAvatarChange = async (file) => {
    if (!file) return;
    setSaving(true);
    showToast("Uploading…", "loading");
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await apiFetch("/admin/profile/avatar", { method: "POST", body: fd });
      setData((prev) => ({ ...prev, avatar_url: res.avatar_url }));
      await refreshUser(); // update sidebar avatar
      showToast("Profile picture updated.", "success");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── States ── */
  if (loading) {
    return (
      <div className="space-y-5 pb-10 animate-pulse">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 h-40" />
        <div className="bg-white border border-gray-100 rounded-2xl p-6 h-32" />
        <div className="bg-white border border-gray-100 rounded-2xl p-6 h-28" />
        <div className="bg-white border border-gray-100 rounded-2xl p-6 h-24" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={loadProfile} className="text-xs text-indigo-600 underline">
          Retry
        </button>
      </div>
    );
  }

  const strength = strengthOf(draft.new_password);

  /* ── Render ── */
  return (
    <div className="space-y-5 pb-10">

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* ══ TOP CARD ══ */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

          {/* ── Avatar ── */}
          <div className="relative flex-shrink-0 group">
            <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center
                            text-white text-4xl font-bold overflow-hidden shadow-sm">
              {data.avatar_url
                ? <img src={data.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : data.name?.charAt(0)?.toUpperCase() || "A"
              }
            </div>
            {/* Upload overlay on hover */}
            <label className="absolute inset-0 flex flex-col items-center justify-center gap-1
                               bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100
                               transition cursor-pointer">
              <Icon d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8" size={16} stroke="white" />
              <span className="text-white text-[10px] font-semibold">Change</span>
              <input
                ref={avatarRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => { if (e.target.files[0]) handleAvatarChange(e.target.files[0]); }}
              />
            </label>
          </div>

          {/* ── Identity ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[11px]
                                   font-bold rounded-full uppercase tracking-wide">
                    Admin
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  {[data.position, data.department].filter(Boolean).join(" · ") || "Platform Administrator"}
                </p>
              </div>
              {editBtn("details", {
                phone:      data.phone,
                department: data.department,
                position:   data.position,
                location:   data.location,
                timezone:   data.timezone,
              })}
            </div>

            {/* Contact row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" size={13} />
                {data.email}
              </span>
              {data.phone && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Icon d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.36 12 19.79 19.79 0 011.27 3.33 2 2 0 013.27 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.96a16 16 0 006.13 6.13l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" size={13} />
                  {data.phone}
                </span>
              )}
              {data.location && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Icon d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" size={13} />
                  {data.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ ACCOUNT INFORMATION (read-only) ══ */}
      <Section title="Account Information">
        <div className="divide-y divide-gray-100">
          <InfoRow label="Admin ID"       value={data.admin_id}  mono />
          <InfoRow label="Full Name"      value={data.name} />
          <InfoRow label="Email Address"  value={data.email} />
          <InfoRow label="Phone Number"   value={data.phone} />
          <InfoRow label="Account Created" value={data.joined} />
          {data.department && <InfoRow label="Department" value={data.department} />}
          {data.position   && <InfoRow label="Position"   value={data.position}   />}
          {data.timezone   && <InfoRow label="Timezone"   value={data.timezone}   />}
        </div>
      </Section>

      {/* ══ PLATFORM OVERVIEW ══ */}
      <Section title="Platform Overview">
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            label="Students"
            value={data.stats?.total_students}
            sub="Registered accounts"
          />
          <StatTile
            label="Companies"
            value={data.stats?.total_companies}
            sub="Registered accounts"
          />
          <StatTile
            label="Internships"
            value={data.stats?.total_internships}
            sub="Active listings"
          />
        </div>
      </Section>

      {/* ══ BIO ══ */}
      <Section title="Bio / Notes" action={editBtn("bio", { bio: data.bio })}>
        <p className="text-sm text-gray-600 leading-relaxed">
          {data.bio || <span className="text-gray-300 italic">No bio added yet.</span>}
        </p>
      </Section>

      {/* ══ ACCOUNT SECURITY ══ */}
      <Section title="Account Security">
        <div>
          {/* Password */}
          <div className="flex items-center justify-between py-3.5 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-700">Password</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Keep your account secure with a strong password
              </p>
            </div>
            <button
              onClick={() =>
                openModal("password", {
                  current_password: "",
                  new_password:     "",
                  confirm_password: "",
                })
              }
              className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-700 transition"
            >
              <Icon d={icons.edit} size={13} /> Change
            </button>
          </div>

          {/* Email — read-only */}
          <div className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-sm font-semibold text-gray-700">Email Address</p>
              <p className="text-xs text-gray-400 mt-0.5">{data.email}</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <Icon d="M5 13l4 4L19 7" size={12} stroke="#059669" />
              Verified
            </span>
          </div>
        </div>
      </Section>

      {/* ════════ MODALS ════════ */}

      {/* Details */}
      {modal === "details" && (
        <Modal
          title="Edit Profile Details"
          saving={saving}
          onClose={closeModal}
          onSave={() =>
            syncField({
              phone:      draft.phone,
              department: draft.department,
              position:   draft.position,
              location:   draft.location,
              timezone:   draft.timezone,
            })
          }
        >
          <Field label="Phone Number">
            <Input
              value={draft.phone || ""}
              onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+94 77 123 4567"
            />
          </Field>
          <Field label="Department">
            <Input
              value={draft.department || ""}
              onChange={(e) => setDraft((p) => ({ ...p, department: e.target.value }))}
              placeholder="e.g. Platform Operations"
            />
          </Field>
          <Field label="Position / Title">
            <Input
              value={draft.position || ""}
              onChange={(e) => setDraft((p) => ({ ...p, position: e.target.value }))}
              placeholder="e.g. Super Admin"
            />
          </Field>
          <Field label="Location">
            <Input
              value={draft.location || ""}
              onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
              placeholder="e.g. Colombo, Sri Lanka"
            />
          </Field>
          <Field label="Timezone" hint="Used to display times in your local zone">
            <Input
              value={draft.timezone || ""}
              onChange={(e) => setDraft((p) => ({ ...p, timezone: e.target.value }))}
              placeholder="e.g. Asia/Colombo"
            />
          </Field>
        </Modal>
      )}

      {/* Bio */}
      {modal === "bio" && (
        <Modal
          title="Edit Bio"
          saving={saving}
          onClose={closeModal}
          onSave={() => syncField({ bio: draft.bio })}
        >
          <Field label="Bio / Notes">
            <Textarea
              rows={5}
              placeholder="A short note about your admin responsibilities…"
              value={draft.bio || ""}
              onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
            />
          </Field>
        </Modal>
      )}

      {/* Password */}
      {modal === "password" && (
        <Modal
          title="Change Password"
          saving={saving}
          onClose={closeModal}
          onSave={handlePasswordSave}
        >
          <Field label="Current Password">
            <Input
              type="password"
              value={draft.current_password || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, current_password: e.target.value }))
              }
            />
          </Field>
          <Field label="New Password">
            <Input
              type="password"
              value={draft.new_password || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, new_password: e.target.value }))
              }
            />
            {draft.new_password && strength && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.bar} ${strength.w}`}
                  />
                </div>
                <p className={`text-[11px] font-semibold ${strength.text}`}>
                  {strength.label}
                </p>
              </div>
            )}
          </Field>
          <Field label="Confirm New Password">
            <Input
              type="password"
              value={draft.confirm_password || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, confirm_password: e.target.value }))
              }
            />
            {draft.confirm_password &&
              draft.new_password !== draft.confirm_password && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">
                  Passwords do not match.
                </p>
              )}
          </Field>
        </Modal>
      )}

    </div>
  );
};

export default AdminProfile;