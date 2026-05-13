// src/pages/admin/pages/SystemSettings.jsx

import { useState, useEffect, useCallback } from "react";
import { Page, SectionHeader, Btn, Ico, useToast, Toast } from "../components/Shared";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const hdrs = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

/* ── Group meta ─────────────────────────────────────────────────── */
const GROUP_META = {
  platform:      { label: "Platform",       icon: "M3.055 11H5a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 1 2 2v2.945M8 3.935V5.5A2.5 2.5 0 0 0 10.5 8h.5a2 2 0 0 1 2 2 2 2 0 0 0 4 0 2 2 0 0 1 2-2h1.064M15 20.488V18a2 2 0 0 1 2-2h3.064M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",   color: "violet" },
  internship:    { label: "Internship",     icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2", color: "sky" },
  applications:  { label: "Applications",   icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z",              color: "emerald" },
  notifications: { label: "Notifications",  icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-9.33-4.993M15 17H9a2 2 0 0 1-2-2v-1a5.99 5.99 0 0 1 2.578-4.913",                 color: "amber" },
  security:      { label: "Security",       icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", color: "rose" },
};

const COLOR_CLS = {
  violet:  { bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700",  icon: "text-violet-500" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     icon: "text-sky-500" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: "text-emerald-500" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   icon: "text-amber-500" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    icon: "text-rose-500" },
};

/* ── Toggle switch ──────────────────────────────────────────────── */
const Toggle = ({ checked, onChange, disabled }) => (
  <button type="button" onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? "bg-indigo-600" : "bg-gray-200"} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
  </button>
);

/* ── Setting row ────────────────────────────────────────────────── */
const SettingRow = ({ setting, value, onChange }) => (
  <div className="flex items-start justify-between gap-6 py-4 border-b border-gray-50 last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800">{setting.label}</p>
      {setting.description && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{setting.description}</p>}
    </div>
    <div className="flex-shrink-0">
      {setting.type === "boolean" ? (
        <Toggle checked={!!value} onChange={onChange} />
      ) : setting.type === "integer" ? (
        <input
          type="number" min={0} value={value ?? ""}
          onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
          className="w-24 text-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      ) : (
        <input
          type="text" value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          className="w-48 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      )}
    </div>
  </div>
);

/* ── Group card ─────────────────────────────────────────────────── */
const GroupCard = ({ group, values, onChange, onSave, saving }) => {
  const meta = GROUP_META[group.group] || { label: group.group, icon: "", color: "violet" };
  const c    = COLOR_CLS[meta.color] || COLOR_CLS.violet;

  return (
    <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden border-gray-100`}>
      {/* Group header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${c.bg} border-gray-100`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" className={c.icon}>
              {meta.icon.split("M").filter(Boolean).map((d, i) => <path key={i} d={`M${d}`} />)}
            </svg>
          </div>
          <p className={`text-sm font-bold ${c.text} uppercase tracking-wide`}>{meta.label}</p>
        </div>
        <Btn size="sm" onClick={() => onSave(group.group)} disabled={saving === group.group}>
          {saving === group.group
            ? <><span className="animate-pulse">Saving…</span></>
            : <><Ico d="M5 13l4 4L19 7" size={12} sw={2.5} />Save</>
          }
        </Btn>
      </div>

      {/* Settings rows */}
      <div className="px-6">
        {group.items.map(setting => (
          <SettingRow
            key={setting.key}
            setting={setting}
            value={values[setting.key]}
            onChange={val => onChange(setting.key, val)}
          />
        ))}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════ */
const SystemSettings = () => {
  const [groups,   setGroups]   = useState([]);
  const [values,   setValues]   = useState({});  // flat key→value map
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(null); // group name being saved
  const [resetting,setResetting]= useState(false);
  const { toasts, add: toast, remove } = useToast();

  /* ── Fetch ── */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/settings`, { headers: hdrs() });
      const json = await res.json();
      if (res.ok) {
        setGroups(json.data || []);
        // Build flat map
        const flat = {};
        (json.data || []).forEach(g => g.items.forEach(s => { flat[s.key] = s.value; }));
        setValues(flat);
      } else toast(json.message || "Failed to load settings", "error");
    } catch { toast("Network error", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  /* ── Change a single value ── */
  const handleChange = (key, val) => setValues(v => ({ ...v, [key]: val }));

  /* ── Save one group ── */
  const saveGroup = async (groupName) => {
    const group = groups.find(g => g.group === groupName);
    if (!group) return;

    const changes = group.items.map(s => ({ key: s.key, value: values[s.key] }));
    setSaving(groupName);
    try {
      const res  = await fetch(`${API}/admin/settings`, {
        method: "PATCH", headers: hdrs(), body: JSON.stringify({ settings: changes }),
      });
      const json = await res.json();
      if (res.ok) toast(`${GROUP_META[groupName]?.label || groupName} settings saved!`, "success");
      else toast(json.message || "Failed to save", "error");
    } catch { toast("Network error", "error"); }
    finally { setSaving(null); }
  };

  /* ── Reset all ── */
  const resetAll = async () => {
    if (!window.confirm("Reset ALL settings to factory defaults?")) return;
    setResetting(true);
    try {
      const res  = await fetch(`${API}/admin/settings/reset`, { method: "POST", headers: hdrs() });
      const json = await res.json();
      if (res.ok) { toast("All settings reset to defaults.", "success"); fetchSettings(); }
      else toast(json.message || "Failed to reset", "error");
    } catch { toast("Network error", "error"); }
    finally { setResetting(false); }
  };

  /* ── Tab state ── */
  const tabs = groups.map(g => g.group);
  const [activeTab, setActiveTab] = useState(null);
  useEffect(() => { if (groups.length && !activeTab) setActiveTab(groups[0].group); }, [groups]);

  const activeGroup = groups.find(g => g.group === activeTab);

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      <SectionHeader
        title="System Settings"
        subtitle="Configure platform-wide behaviour, limits, and security settings"
        action={
          <Btn variant="danger" size="sm" onClick={resetAll} disabled={resetting}>
            <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" size={13} />
            {resetting ? "Resetting…" : "Reset Defaults"}
          </Btn>
        }
      />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl" />)}
        </div>
      ) : (
        <div className="flex gap-5">
          {/* ── Tab sidebar ── */}
          <div className="w-44 flex-shrink-0">
            <nav className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {tabs.map(tab => {
                const meta = GROUP_META[tab] || { label: tab, color: "violet" };
                const c    = COLOR_CLS[meta.color] || COLOR_CLS.violet;
                const active = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold transition-all border-l-2 ${
                      active
                        ? `${c.bg} ${c.text} border-indigo-500`
                        : "text-gray-500 hover:bg-gray-50 border-transparent"
                    }`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"
                      className={active ? c.icon : "text-gray-400"}>
                      {meta.icon.split("M").filter(Boolean).map((d, i) => <path key={i} d={`M${d}`} />)}
                    </svg>
                    {meta.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ── Active group card ── */}
          <div className="flex-1 min-w-0">
            {activeGroup && (
              <GroupCard
                group={activeGroup}
                values={values}
                onChange={handleChange}
                onSave={saveGroup}
                saving={saving}
              />
            )}
          </div>
        </div>
      )}
    </Page>
  );
};

export default SystemSettings;
