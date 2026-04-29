import { useState, useEffect, useCallback } from "react";
import {
  Page, SectionHeader, Table, Tr, Td, Badge, Avatar,
  SearchBar, FilterPills, Btn, Modal, Ico, useToast, Toast,
} from "../components/Shared";

/* ─────────────────────────────────────────
   API HELPERS
───────────────────────────────────────── */
const TOKEN = () => localStorage.getItem("token") ?? "";
const API_BASE = "http://127.0.0.1:8000/api";

const apiFetch = (url, opts = {}) =>
  fetch(`${API_BASE}${url}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN()}`,
      ...opts.headers,
    },
    ...opts,
  }).then(async (r) => {
    const json = await r.json();
    if (!r.ok) throw new Error(json.message ?? "Request failed");
    return json;
  });

/* ─────────────────────────────────────────
   SECTION BLOCK (used inside modal)
───────────────────────────────────────── */
const DetailBlock = ({ label, children }) => (
  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5">
    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{label}</p>
    {children}
  </div>
);

/* ─────────────────────────────────────────
   FULL STUDENT DETAIL MODAL
───────────────────────────────────────── */
const StudentDetail = ({ studentId, onClose, onStatusChange }) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/admin/students/${studentId}`)
      .then((res) => setData(res.data))
      .catch((e)  => setError(e.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  const s = data;

  return (
    <Modal
      title="Student Profile"
      onClose={onClose}
      footer={
        !loading && s && (
          <>
            <Btn variant="secondary" onClick={onClose}>Close</Btn>
            {s.status === "active"
              ? <Btn variant="danger"  onClick={() => onStatusChange(s.id, "suspended")}>Suspend</Btn>
              : <Btn variant="success" onClick={() => onStatusChange(s.id, "active")}>Activate</Btn>
            }
          </>
        )
      }
    >
      {/* Loading */}
      {loading && (
        <div className="space-y-3 animate-pulse py-2">
          {[72, 48, 48, 80].map((h, i) => (
            <div key={i} className="rounded-xl bg-white/5" style={{ height: h }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="py-6 text-center text-sm text-red-400">{error}</div>
      )}

      {/* Content */}
      {!loading && !error && s && (
        <div className="space-y-4">

          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar name={s.name} size={14} />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-base truncate">{s.name}</h3>
              <p className="text-zinc-400 text-sm">{s.email}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge status={s.status} />
                {s.location && (
                  <span className="text-xs text-zinc-500">{s.location}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Registered",    s.registered        ?? "—"],
              ["Applications",  s.applications_count ?? 0],
              ["Phone",         s.phone              ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{k}</p>
                <p className="text-zinc-200 text-sm font-semibold">{v}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          {s.summary && (
            <DetailBlock label="Summary">
              <p className="text-zinc-300 text-sm leading-relaxed">{s.summary}</p>
            </DetailBlock>
          )}

          {/* Skills */}
          {s.skills?.length > 0 && (
            <DetailBlock label="Skills">
              <div className="flex flex-wrap gap-1.5">
                {s.skills.map((sk) => (
                  <span key={sk}
                    className="px-2.5 py-1 bg-violet-500/10 text-violet-300 text-xs font-semibold rounded-lg ring-1 ring-violet-500/20">
                    {sk}
                  </span>
                ))}
              </div>
            </DetailBlock>
          )}

          {/* Education */}
          {s.education?.length > 0 && (
            <DetailBlock label="Education">
              <div className="space-y-2">
                {s.education.map((e, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-zinc-200 font-semibold">{e.degree}</p>
                    <p className="text-zinc-400 text-xs">{e.university}</p>
                    <p className="text-zinc-600 text-xs">
                      {e.start} – {e.end ?? "Present"}
                      {e.gpa ? ` · GPA: ${e.gpa}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </DetailBlock>
          )}

          {/* Experience */}
          {s.experience?.length > 0 && (
            <DetailBlock label="Experience">
              <div className="space-y-2">
                {s.experience.map((ex, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-zinc-200 font-semibold">{ex.title}</p>
                    <p className="text-zinc-400 text-xs">{ex.company} · {ex.duration}</p>
                    {ex.description && (
                      <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{ex.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </DetailBlock>
          )}

          {/* Projects */}
          {s.projects?.length > 0 && (
            <DetailBlock label="Projects">
              <div className="space-y-2">
                {s.projects.map((pr, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-zinc-200 font-semibold">{pr.title}</p>
                    {pr.description && (
                      <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{pr.description}</p>
                    )}
                    {pr.tech && (
                      <p className="text-zinc-600 text-xs mt-0.5">Tech: {pr.tech}</p>
                    )}
                    {pr.github && (
                      <a href={pr.github} target="_blank" rel="noreferrer"
                        className="text-xs text-violet-400 hover:underline mt-0.5 block">
                        {pr.github}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </DetailBlock>
          )}

          {/* Links */}
          {(s.github || s.linkedin || s.portfolio) && (
            <DetailBlock label="Links">
              <div className="space-y-1">
                {[
                  ["GitHub",    s.github],
                  ["LinkedIn",  s.linkedin],
                  ["Portfolio", s.portfolio],
                ].filter(([, v]) => v).map(([label, url]) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500 w-16">{label}</span>
                    <a href={url} target="_blank" rel="noreferrer"
                      className="text-violet-400 hover:underline truncate max-w-[200px]">
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            </DetailBlock>
          )}

          {/* Resume */}
          {s.resume_url && (
            <a href={s.resume_url} target="_blank" rel="noreferrer" download={s.resume_name}>
              <Btn variant="secondary" size="sm">
                <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={13} />
                {s.resume_name ? `Download ${s.resume_name}` : "Download Resume"}
              </Btn>
            </a>
          )}
        </div>
      )}
    </Modal>
  );
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const StudentManagement = () => {
  const [students,    setStudents]   = useState([]);
  const [stats,       setStats]      = useState({ total: 0, active: 0, suspended: 0, inactive: 0 });
  const [pagination,  setPagination] = useState(null);
  const [search,      setSearch]     = useState("");
  const [filter,      setFilter]     = useState("all");
  const [selectedId,  setSelectedId] = useState(null);
  const [pageLoading, setPageLoading]= useState(true);
  const [pageError,   setPageError]  = useState(null);

  const { toasts, add: toast, remove } = useToast();

  /* ── Fetch list ── */
  const fetchStudents = useCallback((params = {}) => {
    setPageLoading(true);
    setPageError(null);

    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.filter && params.filter !== "all") qs.set("status", params.filter);
    qs.set("per_page", "20");

    apiFetch(`/admin/students?${qs}`)
      .then((res) => {
        setStudents(res.data.data ?? []);
        setPagination(res.data);
        setStats(res.stats ?? { total: 0, active: 0, suspended: 0, inactive: 0 });
      })
      .catch((e) => setPageError(e.message))
      .finally(() => setPageLoading(false));
  }, []);

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => fetchStudents({ search, filter }), 350);
    return () => clearTimeout(t);
  }, [search, filter, fetchStudents]);

  /* ── Status change ── */
  const changeStatus = async (id, status) => {
    try {
      await apiFetch(`/admin/students/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setStudents((p) => p.map((s) => s.id === id ? { ...s, status } : s));
      setStats((prev) => {
        const old = students.find((s) => s.id === id)?.status;
        if (!old || old === status) return prev;
        return { ...prev, [old]: prev[old] - 1, [status]: prev[status] + 1 };
      });
      toast(`Student ${status === "active" ? "activated" : "suspended"} successfully`, status === "active" ? "success" : "error");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  /* ── Delete ── */
  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student? This cannot be undone.")) return;
    try {
      await apiFetch(`/admin/students/${id}`, { method: "DELETE" });
      setStudents((p) => p.filter((s) => s.id !== id));
      setStats((prev) => {
        const st = students.find((s) => s.id === id)?.status ?? "active";
        return { ...prev, total: prev.total - 1, [st]: Math.max(0, prev[st] - 1) };
      });
      if (selectedId === id) setSelectedId(null);
      toast("Student deleted", "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const header = ["ID","Name","Email","University","Degree","Status","Registered","Applications"];
    const rows   = students.map((s) => [
      s.id, s.name, s.email, s.university ?? "", s.degree ?? "",
      s.status, s.registered, s.applications_count,
    ]);
    const csv  = [header, ...rows].map((r) => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href  = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = "students.csv";
    link.click();
  };

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      {/* Detail modal */}
      {selectedId && (
        <StudentDetail
          studentId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChange={(id, status) => {
            changeStatus(id, status);
            // optimistically update modal too (it re-fetches on open)
          }}
        />
      )}

      <SectionHeader
        title="Student Management"
        subtitle={`${stats.total} students registered on the platform`}
        action={
          <Btn onClick={exportCSV}>
            <Ico d="M12 5v14M5 12h14" size={14} />
            Export CSV
          </Btn>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total",     value: stats.total,     color: "text-white"       },
          { label: "Active",    value: stats.active,    color: "text-emerald-400" },
          { label: "Suspended", value: stats.suspended, color: "text-red-400"     },
          { label: "Inactive",  value: stats.inactive,  color: "text-zinc-400"    },
        ].map((s) => (
          <div key={s.label} className="bg-[#161b27] border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-600 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
        <FilterPills
          options={["all", "active", "suspended", "inactive"]}
          active={filter}
          onChange={setFilter}
        />
      </div>

      {/* Error */}
      {pageError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4">
          {pageError}
        </div>
      )}

      {/* Table */}
      <Table headers={["Student", "University", "Degree", "Status", "Registered", "Apps", "Actions"]}>
        {pageLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Tr key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <Td key={j}>
                    <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                  </Td>
                ))}
              </Tr>
            ))
          : students.length === 0
          ? (
            <Tr>
              <Td colSpan={7}>
                <p className="text-center text-zinc-600 py-8 text-sm">No students found.</p>
              </Td>
            </Tr>
          )
          : students.map((s) => (
            <Tr key={s.id} onClick={() => setSelectedId(s.id)}>
              <Td>
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} size={9} />
                  <div>
                    <p className="text-white font-semibold text-sm">{s.name}</p>
                    <p className="text-zinc-500 text-xs">{s.email}</p>
                  </div>
                </div>
              </Td>
              <Td><span className="text-xs">{s.university ?? "—"}</span></Td>
              <Td><span className="text-xs">{s.degree ?? "—"}</span></Td>
              <Td><Badge status={s.status} /></Td>
              <Td><span className="text-xs">{s.registered}</span></Td>
              <Td>
                <span className="text-xs text-zinc-400">{s.applications_count}</span>
              </Td>
              <Td>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Btn variant="ghost" size="sm" onClick={() => setSelectedId(s.id)}>
                    <Ico d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={13} />
                    View
                  </Btn>
                  {s.status === "active"
                    ? <Btn variant="danger"  size="sm" onClick={() => changeStatus(s.id, "suspended")}>Suspend</Btn>
                    : <Btn variant="success" size="sm" onClick={() => changeStatus(s.id, "active")}>Activate</Btn>
                  }
                  <Btn variant="danger" size="sm" onClick={() => deleteStudent(s.id)}>
                    <Ico d="M3 6h18M19 6l-1 14H6L5 6" size={13} />
                  </Btn>
                </div>
              </Td>
            </Tr>
          ))
        }
      </Table>

      {/* Pagination info */}
      {pagination && pagination.total > pagination.per_page && (
        <p className="text-xs text-zinc-600 text-center pt-1">
          Showing {pagination.from}–{pagination.to} of {pagination.total} students
        </p>
      )}
    </Page>
  );
};

export default StudentManagement;