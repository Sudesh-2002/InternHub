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

const EVENT_COLORS = {
  login: { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  logout: { bg: "#eff6ff", text: "#1e40af", dot: "#3b82f6" },
  timeout: { bg: "#fff7ed", text: "#92400e", dot: "#f59e0b" },
};

const ROLE_COLORS = {
  admin: { bg: "#f5f3ff", text: "#5b21b6" },
  company: { bg: "#ecfdf5", text: "#065f46" },
  student: { bg: "#eff6ff", text: "#1e40af" },
};

const EventBadge = ({ event }) => {
  const c = EVENT_COLORS[event] ?? { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      background: c.bg, color: c.text,
      padding: "3px 10px", borderRadius: "99px",
      fontSize: "11px", fontWeight: 700, textTransform: "capitalize",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {event}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const c = ROLE_COLORS[role] ?? { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span style={{
      background: c.bg, color: c.text,
      padding: "3px 10px", borderRadius: "99px",
      fontSize: "11px", fontWeight: 700, textTransform: "capitalize",
    }}>
      {role}
    </span>
  );
};

const StatBox = ({ icon, label, value, color }) => (
  <div style={{
    background: "#fff", border: "1px solid #f1f5f9",
    borderRadius: "16px", padding: "20px",
    display: "flex", alignItems: "center", gap: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: "12px",
      background: color + "18",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Ico d={icon} size={18} color={color} />
    </div>
    <div>
      <p style={{ fontSize: "22px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "3px", fontWeight: 500 }}>{label}</p>
    </div>
  </div>
);

const Pagination = ({ current, last, onPage }) => {
  if (last <= 1) return null;
  const pages = Array.from({ length: Math.min(last, 7) }, (_, i) => i + 1);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px" }}>
      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        Page <strong>{current}</strong> of <strong>{last}</strong>
      </p>
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={() => onPage(current - 1)} disabled={current === 1}
          style={{
            padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb",
            background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600,
            cursor: current === 1 ? "not-allowed" : "pointer", opacity: current === 1 ? 0.4 : 1
          }}
        >← Prev</button>
        {pages.map(p => (
          <button key={p} onClick={() => onPage(p)}
            style={{
              padding: "6px 10px", borderRadius: "8px", border: "1px solid",
              borderColor: p === current ? "#4f46e5" : "#e5e7eb",
              background: p === current ? "#4f46e5" : "#fff",
              color: p === current ? "#fff" : "#374151",
              fontSize: "13px", fontWeight: 600, cursor: "pointer"
            }}
          >{p}</button>
        ))}
        {last > 7 && <span style={{ alignSelf: "center", color: "#9ca3af" }}>…</span>}
        <button
          onClick={() => onPage(current + 1)} disabled={current === last}
          style={{
            padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb",
            background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600,
            cursor: current === last ? "not-allowed" : "pointer", opacity: current === last ? 0.4 : 1
          }}
        >Next →</button>
      </div>
    </div>
  );
};

const parseBrowser = (ua = "") => {
  if (!ua) return "—";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Browser";
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const EVENT_FILTERS = ["all", "login", "logout", "timeout"];
const ROLE_FILTERS = ["all", "student", "company", "admin"];

const LoginLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventF, setEventF] = useState("all");
  const [roleF, setRoleF] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchLogs = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, per_page: 15 });
      if (search) params.append("search", search);
      if (eventF !== "all") params.append("event", eventF);
      if (roleF !== "all") params.append("role", roleF);

      const res = await api.get(`/admin/login-logs?${params}`);
      setLogs(res.data.logs.data ?? []);
      setPage(res.data.logs.current_page);
      setLastPage(res.data.logs.last_page);
      setStats(res.data.stats ?? {});
    } catch (e) {
      console.error("Failed to fetch login logs", e);
    } finally {
      setLoading(false);
    }
  }, [search, eventF, roleF]);

  // Re-fetch when filters/page change
  useEffect(() => {
    const t = setTimeout(() => fetchLogs(1), 350);
    return () => clearTimeout(t);
  }, [search, eventF, roleF]);

  const handlePage = (p) => {
    if (p < 1 || p > lastPage) return;
    fetchLogs(p);
  };

  return (
    <Page>
      <SectionHeader
        title="Login Logs"
        subtitle="Track every login, logout, and session timeout across all users."
        action={
          <button
            onClick={() => fetchLogs(page)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "10px",
              border: "1px solid #e5e7eb", background: "#fff",
              color: "#374151", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >
            <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"
              size={14} />
            Refresh
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
        <StatBox
          icon="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1"
          label="Logins Today"
          value={stats.logins_today ?? 0}
          color="#10b981"
        />
        <StatBox
          icon="M5.121 17.804A13.937 13.937 0 0 1 12 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          label="Active Sessions"
          value={stats.active_sessions ?? 0}
          color="#4f46e5"
        />
        <StatBox
          icon="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          label="Timeouts Today"
          value={stats.timeouts_today ?? 0}
          color="#f59e0b"
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div style={{ flex: "1", minWidth: "200px", maxWidth: "340px" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>Event:</span>
          <FilterPills options={EVENT_FILTERS} active={eventF} onChange={v => { setEventF(v); }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>Role:</span>
          <FilterPills options={ROLE_FILTERS} active={roleF} onChange={v => { setRoleF(v); }} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
          Loading logs…
        </div>
      ) : (
        <>
          <Table
            headers={["User", "Role", "Event", "IP Address", "Browser", "Time"]}
            empty="No login logs found."
          >
            {logs.map(log => (
              <Tr key={log.id}>
                {/* User */}
                <Td>
                  <div>
                    <p style={{ fontWeight: 600, color: "#111827", fontSize: "13px" }}>
                      {log.user?.name ?? "Deleted User"}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "1px" }}>
                      {log.user?.email ?? "—"}
                    </p>
                  </div>
                </Td>

                {/* Role */}
                <Td><RoleBadge role={log.user?.role ?? "—"} /></Td>

                {/* Event */}
                <Td><EventBadge event={log.event} /></Td>

                {/* IP */}
                <Td>
                  <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#374151" }}>
                    {log.ip_address ?? "—"}
                  </span>
                </Td>

                {/* Browser */}
                <Td>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    {parseBrowser(log.user_agent)}
                  </span>
                </Td>

                {/* Time */}
                <Td>
                  <span style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>
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

export default LoginLogs;
