// src/pages/admin/pages/RolesPermissions.jsx

import { useState, useEffect, useCallback } from "react";
import { Page, SectionHeader, Btn, Ico, useToast, Toast } from "../components/Shared";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Role config ────────────────────────────────────────────────── */
const ROLES = [
  {
    key:    "student",
    label:  "Student",
    desc:   "Registered students looking for internships",
    icon:   "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.055a11.952 11.952 0 0 0-6.824-2.998 12.078 12.078 0 0 1 .665-6.479L12 14z",
    color:  { bg: "bg-sky-500/10", text: "text-sky-600", border: "border-sky-500/20", badge: "bg-sky-100 text-sky-700" },
    locked: false,
  },
  {
    key:    "company",
    label:  "Company",
    desc:   "Verified companies posting internship opportunities",
    icon:   "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z",
    color:  { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20", badge: "bg-orange-100 text-orange-700" },
    locked: false,
  },
  {
    key:    "admin",
    label:  "Admin",
    desc:   "Platform administrators — always full access",
    icon:   "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    color:  { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-500/20", badge: "bg-violet-100 text-violet-700" },
    locked: true,
  },
];

/* ── Toggle switch ──────────────────────────────────────────────── */
const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none
      ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
      ${checked ? "bg-indigo-600" : "bg-gray-200"}`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200
        ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
    />
  </button>
);

/* ── Skeleton ───────────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white border border-gray-100 rounded-2xl shadow-sm" />)}
    </div>
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
          <div className="flex-1 h-4 bg-gray-100 rounded" />
          <div className="w-10 h-5 bg-gray-100 rounded-full" />
          <div className="w-10 h-5 bg-gray-100 rounded-full" />
          <div className="w-10 h-5 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

/* ── Main Component ─────────────────────────────────────────────── */
const RolesPermissions = () => {
  const [groups,   setGroups]   = useState([]);   // [{category, items: [{key, label, desc, roles:{student,company,admin}}]}]
  const [summary,  setSummary]  = useState({});   // {student: N, company: N, admin: N}
  const [total,    setTotal]    = useState(0);
  const [dirty,    setDirty]    = useState({});   // {`${role}.${key}`: true/false}
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [resetting,setResetting]= useState(false);
  const { toasts, add: toast, remove } = useToast();

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/role-permissions`, { headers: authHeaders() });
      const json = await res.json();
      if (res.ok) {
        setGroups(json.data || []);
        setSummary(json.summary || {});
        setTotal(json.total || 0);
        setDirty({});
      } else {
        toast(json.message || "Failed to load permissions", "error");
      }
    } catch {
      toast("Network error — could not load permissions", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Toggle a cell ── */
  const togglePerm = (role, permKey, newVal) => {
    const mapKey = `${role}.${permKey}`;

    // Update the groups state
    setGroups(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item =>
        item.key === permKey
          ? { ...item, roles: { ...item.roles, [role]: newVal } }
          : item
      ),
    })));

    // Track as dirty
    setDirty(prev => ({ ...prev, [mapKey]: newVal }));

    // Update summary count
    setSummary(prev => ({
      ...prev,
      [role]: newVal
        ? (prev[role] || 0) + 1
        : Math.max(0, (prev[role] || 0) - 1),
    }));
  };

  const hasDirty = Object.keys(dirty).length > 0;

  /* ── Save ── */
  const save = async () => {
    if (!hasDirty) return;
    setSaving(true);
    try {
      const changes = Object.entries(dirty).map(([mapKey, is_enabled]) => {
        const [role, ...rest] = mapKey.split(".");
        return { role, permission_key: rest.join("."), is_enabled };
      });

      const res  = await fetch(`${API}/admin/role-permissions`, {
        method:  "PATCH",
        headers: authHeaders(),
        body:    JSON.stringify({ changes }),
      });
      const json = await res.json();

      if (res.ok) {
        toast(json.message || "Permissions saved", "success");
        setDirty({});
      } else {
        toast(json.message || "Save failed", "error");
      }
    } catch {
      toast("Network error — save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Reset ── */
  const resetDefaults = async () => {
    if (!window.confirm("Reset all permissions to platform defaults? This cannot be undone.")) return;
    setResetting(true);
    try {
      const res  = await fetch(`${API}/admin/role-permissions/reset`, {
        method: "POST", headers: authHeaders(),
      });
      const json = await res.json();
      if (res.ok) {
        toast(json.message || "Reset to defaults", "success");
        await fetchData();
      } else {
        toast(json.message || "Reset failed", "error");
      }
    } catch {
      toast("Network error — reset failed", "error");
    } finally {
      setResetting(false);
    }
  };

  /* ── Render ── */
  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      {/* ── Header ── */}
      <SectionHeader
        title="Roles & Permissions"
        subtitle="Control which features are available to each user role on the platform"
        action={
          <div className="flex items-center gap-2">
            <Btn variant="secondary" size="sm" onClick={resetDefaults} disabled={resetting || loading}>
              {resetting
                ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-gray-400/40 border-t-gray-400 rounded-full animate-spin" />Resetting…</span>
                : <><Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" size={13} />Reset Defaults</>
              }
            </Btn>
            {hasDirty && (
              <Btn onClick={save} disabled={saving}>
                {saving
                  ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</span>
                  : <><Ico d="M5 13l4 4L19 7" size={13} sw={2.5} />Save Changes</>
                }
              </Btn>
            )}
          </div>
        }
      />

      {/* ── Unsaved changes banner ── */}
      {hasDirty && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Ico d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={15} color="#b45309" />
          <p className="text-sm text-amber-800 font-medium">
            You have unsaved changes — click <span className="font-bold">Save Changes</span> to apply them.
          </p>
        </div>
      )}

      {loading ? <Skeleton /> : (
        <>
          {/* ── Role Summary Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ROLES.map(role => (
              <div key={role.key}
                className={`bg-white border rounded-2xl p-5 shadow-sm ${role.color.border} hover:shadow-md transition-all duration-200`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${role.color.bg} border ${role.color.border} flex items-center justify-center flex-shrink-0`}>
                    <Ico d={role.icon} size={17} color="" className={role.color.text} />
                  </div>
                  {role.locked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                      <Ico d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" size={9} />
                      Full Access
                    </span>
                  )}
                </div>
                <p className="text-gray-900 font-bold text-sm">{role.label}</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{role.desc}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Permissions enabled</span>
                  <span className={`text-sm font-bold ${role.color.text}`}>
                    {summary[role.key] ?? 0} / {total}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Permission Matrix ── */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_100px_100px_100px] border-b border-gray-100 bg-gray-50 px-5 py-3.5">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Permission</div>
              {ROLES.map(role => (
                <div key={role.key} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-lg ${role.color.bg} flex items-center justify-center`}>
                    <Ico d={role.icon} size={12} color="" className={role.color.text} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{role.label}</span>
                </div>
              ))}
            </div>

            {/* Groups */}
            {groups.map((group, gi) => (
              <div key={group.category}>
                {/* Category header */}
                <div className="px-5 py-2.5 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                    {group.category}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    ({group.items.length} permission{group.items.length !== 1 ? "s" : ""})
                  </span>
                </div>

                {/* Permission rows */}
                {group.items.map((item, idx) => {
                  const isLastInGroup = idx === group.items.length - 1;
                  const isLastGroup   = gi === groups.length - 1;
                  return (
                    <div
                      key={item.key}
                      className={`grid grid-cols-[1fr_100px_100px_100px] items-center px-5 py-4 hover:bg-gray-50/60 transition-colors
                        ${!isLastInGroup || !isLastGroup ? "border-b border-gray-50" : ""}`}
                    >
                      {/* Label + description */}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.description}</p>
                        )}
                      </div>

                      {/* Toggle cells */}
                      {ROLES.map(role => (
                        <div key={role.key} className="flex justify-center">
                          {role.locked ? (
                            // Admin — always on, locked
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                                <Ico d="M5 13l4 4L19 7" size={11} color="#7c3aed" sw={2.5} />
                              </div>
                            </div>
                          ) : (
                            <Toggle
                              checked={!!item.roles[role.key]}
                              onChange={(val) => togglePerm(role.key, item.key, val)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ── Legend ── */}
          <div className="flex items-center gap-6 px-1">
            <p className="text-xs text-gray-400 font-medium">Legend:</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 rounded-full bg-indigo-600 relative">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white shadow" />
              </div>
              <span className="text-xs text-gray-500">Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 rounded-full bg-gray-200 relative">
                <div className="absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-white shadow" />
              </div>
              <span className="text-xs text-gray-500">Disabled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                <Ico d="M5 13l4 4L19 7" size={11} color="#7c3aed" sw={2.5} />
              </div>
              <span className="text-xs text-gray-500">Always enabled (Admin)</span>
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

export default RolesPermissions;
