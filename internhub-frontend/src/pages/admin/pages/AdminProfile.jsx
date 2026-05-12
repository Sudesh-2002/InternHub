
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

const Section = ({ title, action, children }) => (
  <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-sm">
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
    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
  />
);

const InfoRow = ({ iconPath, label, value }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
      <Icon d={iconPath} size={13} stroke="#9ca3af" />
    </div>
    <span className="w-32 flex-shrink-0 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
      {label}
    </span>
    <span className="flex-1 text-sm text-gray-800 font-medium truncate text-right">
      {value || <span className="text-gray-300 italic font-normal">Not set</span>}
    </span>
  </div>
);

const StatTile = ({ label, value, sub, accent = "indigo" }) => {
  const map = {
    indigo: { num: "text-indigo-600", bg: "bg-indigo-50" },
    sky: { num: "text-sky-600", bg: "bg-sky-50" },
    emerald: { num: "text-emerald-600", bg: "bg-emerald-50" },
  };
  const c = map[accent] || map.indigo;
  return (
    <div className={`flex-1 ${c.bg} border border-gray-100 rounded-xl px-4 py-4`}>
      <p className={`text-2xl font-bold ${c.num}`}>{value ?? "—"}</p>
      <p className="text-xs font-semibold text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
};

const AdminProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const avatarRef = useRef();
  const { refreshUser } = useAuth();

  const loadProfile = () => {
    setLoading(true);
    setError(null);
    apiFetch("/admin/profile")
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { loadProfile(); }, []);

  const openModal = (key, initial = {}) => { setDraft(initial); setModal(key); };
  const closeModal = () => { setModal(null); setDraft({}); };
  const showToast = (message, type = "success") => setToast({ message, type });
  const hideToast = () => setToast(null);

  const editBtn = (key, initial) => (
    <button
      onClick={() => openModal(key, initial)}
      className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-700 transition"
    >
      <Icon d={icons.edit} size={13} /> Edit
    </button>
  );

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
      await refreshUser();
    } catch (e) {
      showToast(e.message || "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (file) => {
    if (!file) return;
    setSaving(true);
    showToast("Uploading…", "loading");
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await apiFetch("/admin/profile/avatar", { method: "POST", body: fd });
      setData((prev) => ({ ...prev, avatar_url: res.avatar_url }));
      setAvatarError(false);
      await refreshUser();
      showToast("Profile picture updated.", "success");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full -m-6 lg:-m-8 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-5 animate-pulse">
          <div className="bg-white/80 border border-white/90 rounded-3xl p-6 h-36" />
          <div className="bg-white/80 border border-white/90 rounded-3xl p-6 h-56" />
          <div className="bg-white/80 border border-white/90 rounded-3xl p-6 h-28" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full -m-6 lg:-m-8 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 py-24">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={loadProfile} className="text-xs text-indigo-600 underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full -m-6 lg:-m-8 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5 pb-12">

        {/* ══ TOP CARD ══ */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-7 shadow-lg shadow-indigo-100/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-sm">
                {data.avatar_url && !avatarError
                  ? <img
                    src={data.avatar_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                  : (data.name?.charAt(0)?.toUpperCase() || "A")
                }
              </div>
              <label className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Icon d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8" size={15} stroke="white" />
                <span className="text-white text-[9px] font-semibold">Change</span>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => { if (e.target.files[0]) handleAvatarChange(e.target.files[0]); }}
                />
              </label>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full uppercase tracking-wide">
                  Admin
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                {data.department ? `${data.department} · Platform Administrator` : "Platform Administrator"}
              </p>
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

        {/* ══ ACCOUNT INFORMATION ══ */}
        <Section
          title="Account Information"
          action={editBtn("info", {
            name: data.name,
            email: data.email,
            phone: data.phone,
            department: data.department,
            location: data.location,
          })}
        >
          <InfoRow
            iconPath="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z"
            label="Full Name"
            value={data.name}
          />
          <InfoRow
            iconPath="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"
            label="Email Address"
            value={data.email}
          />
          <InfoRow
            iconPath="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.36 12 19.79 19.79 0 011.27 3.33 2 2 0 013.27 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.96a16 16 0 006.13 6.13l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
            label="Phone Number"
            value={data.phone}
          />
          <InfoRow
            iconPath="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            label="Department"
            value={data.department}
          />
          <InfoRow
            iconPath="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
            label="Location"
            value={data.location}
          />
          <InfoRow
            iconPath="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            label="Member Since"
            value={data.joined}
          />
          <InfoRow
            iconPath="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
            label="Admin ID"
            value={data.admin_id}
          />
        </Section>

        {/* ══ PLATFORM OVERVIEW ══ */}
        <Section title="Platform Overview">
          <div className="flex gap-3">
            <StatTile
              label="Students"
              value={data.stats?.total_students}
              sub="Registered accounts"
              accent="indigo"
            />
            <StatTile
              label="Companies"
              value={data.stats?.total_companies}
              sub="Registered accounts"
              accent="sky"
            />
            <StatTile
              label="Internships"
              value={data.stats?.total_internships}
              sub="Active listings"
              accent="emerald"
            />
          </div>
        </Section>

        {/* ══ BIO ══ */}
        <Section title="Bio / Notes" action={editBtn("bio", { bio: data.bio })}>
          <p className="text-sm text-gray-600 leading-relaxed">
            {data.bio || <span className="text-gray-300 italic">No bio added yet.</span>}
          </p>
        </Section>

        {/* ════════ MODALS ════════ */}

        {/* Account Info modal */}
        {modal === "info" && (
          <Modal
            title="Edit Account Information"
            saving={saving}
            onClose={closeModal}
            onSave={() =>
              syncField({
                name: draft.name,
                email: draft.email,
                phone: draft.phone,
                department: draft.department,
                location: draft.location,
              })
            }
          >
            <Field label="Full Name">
              <Input
                value={draft.name || ""}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
              />
            </Field>
            <Field label="Email Address">
              <Input
                type="email"
                value={draft.email || ""}
                onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                placeholder="admin@example.com"
              />
            </Field>
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
            <Field label="Location">
              <Input
                value={draft.location || ""}
                onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Colombo, Sri Lanka"
              />
            </Field>
          </Modal>
        )}

        {/* Bio modal */}
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

      </div>
    </div>
  );
};

export default AdminProfile;