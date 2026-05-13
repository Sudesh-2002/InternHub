import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import LogoutConfirmModal from "../../../components/LogoutConfirmModal";
import SessionTimeoutModal from "../../../components/SessionTimeoutModal";
import { useSessionTimeout } from "../../../hooks/useSessionTimeout";

export const Ico = ({ d, size = 18, sw = 1.7, color = "currentColor", fill = "none", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const statusMap = {
  active:    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  verified:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  approved:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  pending:   "bg-amber-50   text-amber-700   ring-1 ring-amber-200",
  rejected:  "bg-red-50     text-red-700     ring-1 ring-red-200",
  suspended: "bg-red-50     text-red-700     ring-1 ring-red-200",
  inactive:  "bg-gray-100   text-gray-500    ring-1 ring-gray-200",
  flagged:   "bg-orange-50  text-orange-700  ring-1 ring-orange-200",
  open:      "bg-sky-50     text-sky-700     ring-1 ring-sky-200",
  closed:    "bg-gray-100   text-gray-500    ring-1 ring-gray-200",
  resolved:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  scheduled: "bg-indigo-50  text-indigo-700  ring-1 ring-indigo-200",
  general:   "bg-sky-50     text-sky-700     ring-1 ring-sky-200",
  maintenance:"bg-amber-50  text-amber-700   ring-1 ring-amber-200",
};
export const Badge = ({ status }) => {
  const cls = statusMap[status?.toLowerCase()] ?? "bg-gray-100 text-gray-500 ring-1 ring-gray-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
};

// ── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = "violet", delta }) => {
  const colors = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
    sky:    { bg: "bg-sky-500/10",    text: "text-sky-400",    border: "border-sky-500/20" },
    emerald:{ bg: "bg-emerald-500/10",text: "text-emerald-400",border: "border-emerald-500/20" },
    amber:  { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/20" },
    rose:   { bg: "bg-rose-500/10",   text: "text-rose-400",   border: "border-rose-500/20" },
    cyan:   { bg: "bg-cyan-500/10",   text: "text-cyan-400",   border: "border-cyan-500/20" },
  };
  const c = colors[color] || colors.violet;
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          <Ico d={icon} size={18} color="" className={c.text} />
        </div>
        {delta !== undefined && (
          <span className={`text-xs font-semibold ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {delta >= 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value?.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
};

// ── Section header ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── Table wrapper ────────────────────────────────────────────────────────────
export const Table = ({ headers, children, empty }) => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {headers.map(h => (
              <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
          {!children?.length && (
            <tr><td colSpan={headers.length} className="px-5 py-14 text-center text-gray-400 text-sm">{empty ?? "No records found."}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const Tr = ({ children, onClick }) => (
  <tr onClick={onClick} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${onClick ? "cursor-pointer" : ""}`}>
    {children}
  </tr>
);
export const Td = ({ children, className = "" }) => (
  <td className={`px-5 py-3.5 text-gray-700 text-sm ${className}`}>{children}</td>
);

// ── Search + Filter bar ───────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = "Search…" }) => (
  <div className="relative flex-1 min-w-0">
    <Ico d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={14} color="#52525b"
      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition" />
  </div>
);

// ── Filter pill ───────────────────────────────────────────────────────────────
export const FilterPills = ({ options, active, onChange }) => (
  <div className="flex gap-1.5 flex-wrap">
    {options.map(o => (
      <button key={o} onClick={() => onChange(o)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
          active === o ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300"
        }`}>
        {o}
      </button>
    ))}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-gray-900 font-semibold text-base">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
          <Ico d="M18 6L6 18M6 6l12 12" size={18} />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">{footer}</div>}
    </div>
  </div>
);

// ── Button ────────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, className = "", type = "button" }) => {
  const base = "inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  const variants = {
    primary:  "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
    secondary:"bg-white hover:bg-gray-50 text-gray-600 border border-gray-200",
    danger:   "bg-red-600 hover:bg-red-700 text-white",
    success:  "bg-emerald-600 hover:bg-emerald-700 text-white",
    ghost:    "text-gray-400 hover:text-gray-700 hover:bg-gray-100",
    warning:  "bg-amber-500 hover:bg-amber-600 text-white",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// ── Input ────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>}
    <input {...props}
      className={`w-full bg-gray-50 border ${error ? "border-red-400" : "border-gray-200"} rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/30 transition`} />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const Textarea = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>}
    <textarea {...props}
      className={`w-full bg-gray-50 border ${error ? "border-red-400" : "border-gray-200"} rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/30 transition resize-none`} />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const Select = ({ label, children, ...props }) => (
  <div>
    {label && <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>}
    <select {...props}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition">
      {children}
    </select>
  </div>
);

// ── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["bg-indigo-600","bg-sky-600","bg-emerald-600","bg-amber-600","bg-rose-600","bg-teal-600","bg-violet-600","bg-pink-600"];
export const Avatar = ({ name, src, size = 8 }) => {
  const i = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return (
    <div className={`w-${size} h-${size} rounded-xl ${AVATAR_COLORS[i]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden`}>
      {src
        ? <img src={src} alt={name || "avatar"} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
        : (name?.slice(0,2).toUpperCase() || "??")}
    </div>
  );
};

// ── Toast ──────────────────────────────────────────────────────────────────────
export const Toast = ({ toasts, remove }) => (
  <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 items-end">
    {toasts.map(t => (
      <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl min-w-[220px] ${
        t.type === "success" ? "bg-emerald-600 text-white" :
        t.type === "error"   ? "bg-red-600 text-white"     : "bg-white text-gray-700 border border-gray-100 shadow-lg"
      }`}>
        {t.type === "success" && <Ico d="M20 6L9 17l-5-5" size={14} sw={2.5} />}
        {t.type === "error"   && <Ico d="M18 6L6 18M6 6l12 12" size={14} sw={2.5} />}
        {t.msg}
        <button onClick={() => remove(t.id)} className="ml-auto opacity-60 hover:opacity-100"><Ico d="M18 6L6 18M6 6l12 12" size={12} /></button>
      </div>
    ))}
  </div>
);

let _tid = 0;
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = "success") => {
    const id = ++_tid;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, add, remove };
};

// ── Page wrapper ──────────────────────────────────────────────────────────────
export const Page = ({ children, className = "" }) => (
  <div className={`space-y-6 animate-[fadeUp_0.25s_ease] ${className}`}>
    {children}
  </div>
);

// ── Sidebar nav items ─────────────────────────────────────────────────────────
// Items with disabled:true are not yet implemented — they render greyed out.
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/admin/dashboard",               label: "Dashboard",      icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10", end: true },
      { to: "/admin/dashboard/profile",        label: "Admin Profile",  icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
      { to: "/admin/dashboard/notifications",  label: "Notifications",  icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0", disabled: true },
    ],
  },
  {
    label: "Users",
    items: [
      { to: "/admin/dashboard/students",       label: "Students",       icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
      { to: "/admin/dashboard/companies",      label: "Companies",      icon: "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" },
      { to: "/admin/dashboard/verification",   label: "Verification",   icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
      { to: "/admin/dashboard/roles",          label: "Roles & Perms",  icon: "M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 0 1 21 9z" },
    ],
  },
  {
    label: "Internships",
    items: [
      { to: "/admin/dashboard/internships",    label: "Internships",    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
      { to: "/admin/dashboard/applications",   label: "Applications",   icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" },
      { to: "/admin/dashboard/moderation",     label: "Moderation",     icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/admin/dashboard/notices",        label: "Announcements",  icon: "M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7-1a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
      { to: "/admin/dashboard/messages",       label: "Support Center", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z" },
      { to: "/admin/dashboard/complaints",     label: "Complaints",     icon: "M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", disabled: true },
    ],
  },
  {
    label: "Analytics",
    items: [
      { to: "/admin/dashboard/reports",        label: "Reports",        icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2" },
      { to: "/admin/dashboard/login-logs",     label: "Login Logs",     icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
      { to: "/admin/dashboard/audit",          label: "Audit Logs",     icon: "M10 21h7a2 2 0 0 0 2-2V9.414a1 1 0 0 0-.293-.707l-5.414-5.414A1 1 0 0 0 13.586 3H7a2 2 0 0 0-2 2v11m0 5l4.879-4.879m0 0a3 3 0 1 0 4.243-4.242 3 3 0 0 0-4.243 4.242z", disabled: true },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/dashboard/settings",       label: "Settings",       icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
    ],
  },
];

// ── Admin Layout (Sidebar + Topbar) ───────────────────────────────────────────
export const AdminLayout = ({ children }) => {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [showLogout,   setShowLogout]   = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showTimeout,  setShowTimeout]  = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { toasts, add: toast, remove } = useToast();

  const confirmLogout = async () => {
    setLogoutLoading(true);
    await logout();
    navigate("/login");
  };

  // ── Session Timeout ──────────────────────────────────────────────────────
  const { stayLoggedIn, WARNING_SECONDS } = useSessionTimeout({
    enabled:   !!user,
    onWarning: () => setShowTimeout(true),
    onExpire:  async () => {
      setShowTimeout(false);
      await logout();
      navigate("/login");
    },
    onReset:   () => setShowTimeout(false),
  });

  const handleStayLoggedIn = () => { stayLoggedIn(); setShowTimeout(false); };
  const handleTimeoutLogout = async () => { setShowTimeout(false); await logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <LogoutConfirmModal
        isOpen={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={confirmLogout}
        loading={logoutLoading}
      />
      <SessionTimeoutModal
        isOpen={showTimeout}
        secondsLeft={WARNING_SECONDS}
        onStay={handleStayLoggedIn}
        onLogout={handleTimeoutLogout}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }
        select option { background:#fff; }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Ico d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={16} color="white" sw={2} />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-sm leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>InternHub</p>
            <p className="text-gray-400 text-[10px] font-medium mt-0.5">Admin Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  item.disabled ? (
                    // Not yet implemented — render greyed out, not clickable
                    <div key={item.to}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 cursor-not-allowed select-none"
                      title="Coming soon">
                      <Ico d={item.icon} size={15} sw={1.7} />
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Soon</span>
                    </div>
                  ) : (
                  <NavLink key={item.to} to={item.to} end={item.end}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      }`
                    }>
                    <Ico d={item.icon} size={15} sw={1.7} />
                    <span className="flex-1 truncate">{item.label}</span>
                  </NavLink>
                  )
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin user */}
        <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden">
              {user?.admin_profile?.avatar_url
                ? <img
                    src={user.admin_profile.avatar_url}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                : user?.name?.slice(0, 2).toUpperCase() || "AD"
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-xs font-semibold truncate">{user?.name || "Admin"}</p>
              <p className="text-gray-400 text-[10px] truncate">{user?.email || "admin@internhub.io"}</p>
            </div>
          </div>
          <button onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-sm font-medium text-red-500/70 hover:text-red-400 hover:bg-red-500/5 transition">
            <Ico d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
          <button className="lg:hidden text-gray-500 hover:text-gray-800 transition" onClick={() => setSidebarOpen(true)}>
            <Ico d="M4 6h16M4 12h16M4 18h16" size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <NavLink to="/admin/dashboard/notifications"
              className="relative w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition">
              <Ico d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </NavLink>
            <NavLink to="/admin/dashboard/settings"
              className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-700 transition">
              <Ico d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" size={16} />
            </NavLink>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global toast notifications for admin */}
      <Toast toasts={toasts} remove={remove} />
    </div>
  );
};