import { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import {
  Page,
  SectionHeader,
  Table,
  Tr,
  Td,
  SearchBar,
  FilterPills,
  Ico,
} from "../components/Shared";

// ── Colour maps ─────────────────────────────────────────────────────────────
const ACTION_CFG = {
  approve:  { bg: "#ecfdf5", text: "#065f46", dot: "#10b981", label: "Approve"  },
  reject:   { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444", label: "Reject"   },
  resubmit: { bg: "#fffbeb", text: "#92400e", dot: "#f59e0b", label: "Resubmit" },
  suspend:  { bg: "#fff7ed", text: "#9a3412", dot: "#f97316", label: "Suspend"  },
  restore:  { bg: "#f0fdf4", text: "#166534", dot: "#22c55e", label: "Restore"  },
  delete:   { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444", label: "Delete"   },
  create:   { bg: "#eff6ff", text: "#1e40af", dot: "#3b82f6", label: "Create"   },
  update:   { bg: "#f5f3ff", text: "#5b21b6", dot: "#8b5cf6", label: "Update"   },
  login:    { bg: "#f0fdf4", text: "#166534", dot: "#22c55e", label: "Login"    },
};

const ENTITY_CFG = {
  student:      { bg: "#eff6ff", text: "#1e40af" },
  company:      { bg: "#ecfdf5", text: "#065f46" },
  internship:   { bg: "#f5f3ff", text: "#5b21b6" },
  application:  { bg: "#fff7ed", text: "#92400e" },
  announcement: { bg: "#fdf4ff", text: "#701a75" },
  settings:     { bg: "#f1f5f9", text: "#334155" },
};

const ActionBadge = ({ action }) => {
  const c = ACTION_CFG[action] ?? { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af", label: action };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.text,
      padding: "3px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, textTransform: "capitalize",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
};

const EntityBadge = ({ type }) => {
  if (!type) return <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>;
  const c = ENTITY_CFG[type] ?? { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: "3px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, textTransform: "capitalize",
    }}>{type}</span>
  );
};

const StatBox = ({ icon, label, value, color }) => (
  <div style={{
    background: "#fff", border: "1px solid #f1f5f9",
    borderRadius: 16, padding: "20px",
    display: "flex", alignItems: "center", gap: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: color + "18",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Ico d={icon} size={18} color={color} />
    </div>
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3, fontWeight: 500 }}>{label}</p>
    </div>
  </div>
);

const Pagination = ({ current, last, onPage }) => {
  if (last <= 1) return null;
  const pages = Array.from({ length: Math.min(last, 7) }, (_, i) => i + 1);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
      <p style={{ fontSize: 13, color: "#6b7280" }}>Page <strong>{current}</strong> of <strong>{last}</strong></p>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => onPage(current - 1)} disabled={current === 1}
          style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: current === 1 ? "not-allowed" : "pointer", opacity: current === 1 ? 0.4 : 1 }}>
          ← Prev
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => onPage(p)}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid", borderColor: p === current ? "#4f46e5" : "#e5e7eb", background: p === current ? "#4f46e5" : "#fff", color: p === current ? "#fff" : "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {p}
          </button>
        ))}
        {last > 7 && <span style={{ alignSelf: "center", color: "#9ca3af" }}>…</span>}
        <button onClick={() => onPage(current + 1)} disabled={current === last}
          style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: current === last ? "not-allowed" : "pointer", opacity: current === last ? 0.4 : 1 }}>
          Next →
        </button>
      </div>
    </div>
  );
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const ACTION_FILTERS    = ["all", "approve", "reject", "suspend", "restore", "delete", "create", "update"];
const ENTITY_FILTERS    = ["all", "student", "company", "internship", "application", "announcement", "settings"];
const ROLE_FILTERS      = ["all", "admin", "student", "company"];

// ── Main Component ───────────────────────────────────────────────────────────
const AuditLogs = () => {
  const [logs,     setLogs]     = useState([]);
  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [actionF,  setActionF]  = useState("all");
  const [entityF,  setEntityF]  = useState("all");
  const [roleF,    setRoleF]    = useState("all");
  const [page,     setPage]     = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchLogs = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, per_page: 20 });
      if (search)              params.append("search", search);
      if (actionF !== "all")   params.append("action", actionF);
      if (entityF !== "all")   params.append("entity_type", entityF);
      if (roleF   !== "all")   params.append("role", roleF);

      const res = await api.get(`/admin/audit-logs?${params}`);
      setLogs(res.data.logs.data ?? []);
      setPage(res.data.logs.current_page);
      setLastPage(res.data.logs.last_page);
      setStats(res.data.stats ?? {});
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
    } finally {
      setLoading(false);
    }
  }, [search, actionF, entityF, roleF]);

  useEffect(() => {
    const t = setTimeout(() => fetchLogs(1), 350);
    return () => clearTimeout(t);
  }, [search, actionF, entityF, roleF]);

  const handlePage = (p) => {
    if (p < 1 || p > lastPage) return;
    fetchLogs(p);
  };

  return (
    <Page>
      <SectionHeader
        title="Audit Logs"
        subtitle="A complete, tamper-evident trail of every admin action across the platform."
        action={
          <button
            onClick={() => fetchLogs(page)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10,
              border: "1px solid #e5e7eb", background: "#fff",
              color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >
            <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" size={14} />
            Refresh
          </button>
        }
      />

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
        <StatBox
          icon="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"
          label="Actions Today"
          value={stats.total_today ?? 0}
          color="#4f46e5"
        />
        <StatBox
          icon="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10"
          label="Total Records"
          value={stats.total_all ?? 0}
          color="#10b981"
        />
        <StatBox
          icon="M5.121 17.804A13.937 13.937 0 0 1 12 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          label="Actors Today"
          value={stats.unique_actors ?? 0}
          color="#f59e0b"
        />
        <StatBox
          icon="M13 10V3L4 14h7v7l9-11h-7z"
          label="Top Action"
          value={stats.top_action ?? "—"}
          color="#8b5cf6"
        />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, maxWidth: 340 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search actor, description, entity…" />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>Action:</span>
          <FilterPills options={ACTION_FILTERS} active={actionF} onChange={setActionF} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>Entity:</span>
          <FilterPills options={ENTITY_FILTERS} active={entityF} onChange={setEntityF} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>Role:</span>
          <FilterPills options={ROLE_FILTERS} active={roleF} onChange={setRoleF} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
          Loading audit logs…
        </div>
      ) : (
        <>
          <Table
            headers={["Actor", "Role", "Action", "Entity", "Description", "IP", "Time"]}
            empty="No audit log entries found."
          >
            {logs.map(log => (
              <Tr key={log.id}>
                {/* Actor */}
                <Td>
                  <div>
                    <p style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>
                      {log.actor_name ?? "System"}
                    </p>
                    <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                      {log.actor_email ?? "—"}
                    </p>
                  </div>
                </Td>

                {/* Role */}
                <Td>
                  <span style={{
                    background: log.actor_role === "admin" ? "#f5f3ff" : log.actor_role === "company" ? "#ecfdf5" : "#eff6ff",
                    color:      log.actor_role === "admin" ? "#5b21b6" : log.actor_role === "company" ? "#065f46" : "#1e40af",
                    padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "capitalize",
                  }}>
                    {log.actor_role ?? "—"}
                  </span>
                </Td>

                {/* Action */}
                <Td><ActionBadge action={log.action} /></Td>

                {/* Entity */}
                <Td>
                  <div>
                    <EntityBadge type={log.entity_type} />
                    {log.entity_name && (
                      <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.entity_name}
                      </p>
                    )}
                  </div>
                </Td>

                {/* Description */}
                <Td>
                  <span style={{ fontSize: 12, color: "#374151", maxWidth: 260, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={log.description}>
                    {log.description}
                  </span>
                </Td>

                {/* IP */}
                <Td>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#374151" }}>
                    {log.ip_address ?? "—"}
                  </span>
                </Td>

                {/* Time */}
                <Td>
                  <span style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                    {formatDate(log.created_at)}
                  </span>
                </Td>
              </Tr>
            ))}
          </Table>

          <Pagination current={page} last={lastPage} onPage={handlePage} />
        </>
      )}
    </Page>
  );
};

export default AuditLogs;
