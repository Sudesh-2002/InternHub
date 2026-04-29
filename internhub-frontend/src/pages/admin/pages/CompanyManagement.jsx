// src/pages/admin/pages/CompanyManagement.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Page, SectionHeader, Table, Tr, Td, Badge, Avatar,
  SearchBar, FilterPills, Btn, Modal, Ico, useToast, Toast,
} from "../components/Shared";
import {
  adminFetchCompanies,
  adminUpdateCompanyStatus,
  adminDeleteCompany,
} from "../../../services/api";

// ── Debounce hook ─────────────────────────────────────────────────────────────
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ── Document row ──────────────────────────────────────────────────────────────
const DocRow = ({ label, doc }) => (
  <div className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
    doc?.uploaded
      ? "bg-white/[0.03] border-white/5"
      : "bg-red-500/5 border-red-500/15"
  }`}>
    <div className="flex items-center gap-2.5">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
        doc?.uploaded ? "bg-emerald-500/15" : "bg-red-500/15"
      }`}>
        <Ico
          d={doc?.uploaded ? "M20 6L9 17l-5-5" : "M18 6L6 18M6 6l12 12"}
          size={11} color=""
          className={doc?.uploaded ? "text-emerald-400" : "text-red-400"}
        />
      </div>
      <span className="text-sm text-zinc-300 font-medium">{label}</span>
    </div>
    {doc?.uploaded && doc?.url ? (
      <a href={doc.url} target="_blank" rel="noreferrer">
        <Btn variant="ghost" size="sm">
          <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={12} />
          View
        </Btn>
      </a>
    ) : (
      <span className="text-xs text-red-400 font-semibold">Missing</span>
    )}
  </div>
);

// ── Company detail modal ───────────────────────────────────────────────────────
const CompanyDetail = ({ company, onClose, onAction, actionLoading }) => (
  <Modal
    title="Company Profile"
    onClose={onClose}
    footer={
      <div className="flex flex-wrap gap-2">
        <Btn variant="secondary" size="sm" onClick={onClose}>Close</Btn>
        {company.status === "pending" && (
          <>
            <Btn variant="success" size="sm" disabled={actionLoading}
              onClick={() => onAction(company.id, "verified")}>
              {actionLoading ? "…" : "Verify"}
            </Btn>
            <Btn variant="danger" size="sm" disabled={actionLoading}
              onClick={() => onAction(company.id, "rejected")}>
              {actionLoading ? "…" : "Reject"}
            </Btn>
          </>
        )}
        {company.status === "verified" && (
          <Btn variant="danger" size="sm" disabled={actionLoading}
            onClick={() => onAction(company.id, "suspended")}>
            {actionLoading ? "…" : "Suspend"}
          </Btn>
        )}
        {(company.status === "suspended" || company.status === "rejected") && (
          <Btn variant="success" size="sm" disabled={actionLoading}
            onClick={() => onAction(company.id, "verified")}>
            {actionLoading ? "…" : "Reinstate"}
          </Btn>
        )}
      </div>
    }
  >
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        {company.logo_url ? (
          <img src={company.logo_url} alt={company.name}
            className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
        ) : (
          <Avatar name={company.name} size={14} />
        )}
        <div>
          <h3 className="text-white font-bold text-base">{company.name}</h3>
          <p className="text-zinc-400 text-sm">{company.email}</p>
          <div className="mt-1.5"><Badge status={company.status} /></div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Industry",     company.industry     ?? "—"],
          ["Website",      company.website      ?? "—"],
          ["Reg. Number",  company.reg_number   ?? "—"],
          ["Company Size", company.company_size ?? "—"],
          ["Headquarters", company.headquarters ?? "—"],
          ["Listings",     company.listings_count ?? 0],
          ["Registered",   company.registered   ?? "—"],
        ].map(([k, v]) => (
          <div key={k} className="bg-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{k}</p>
            <p className="text-zinc-200 text-sm font-medium truncate">{v}</p>
          </div>
        ))}
      </div>

      {/* Documents */}
      <div>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
          Uploaded Documents
        </p>
        <div className="space-y-2">
          <DocRow label="Business Registration Certificate" doc={company.docs?.business_cert} />
          <DocRow label="Tax Documents"                     doc={company.docs?.tax_docs} />
          <DocRow label="HR Authorization Letter"           doc={company.docs?.hr_auth} />
          <DocRow label="Additional / Verification Doc"     doc={company.docs?.verification_doc} />
        </div>
      </div>
    </div>
  </Modal>
);

// ─────────────────────────────────────────────────────────────────────────────
const CompanyManagement = () => {
  const [companies,     setCompanies]     = useState([]);
  const [stats,         setStats]         = useState({ total:0, verified:0, pending:0, rejected:0, suspended:0 });
  const [meta,          setMeta]          = useState(null);
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState("");
  const [filter,        setFilter]        = useState("all");
  const [selected,      setSelected]      = useState(null);
  const [fetching,      setFetching]      = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { toasts, add: toast, remove } = useToast();
  const navigate        = useNavigate();
  const debouncedSearch = useDebounce(search);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await adminFetchCompanies({
        search: debouncedSearch || undefined,
        status: filter !== "all" ? filter : undefined,
        page,
      });
      setCompanies(res.companies.data);
      setMeta(res.companies);
      setStats(res.stats);
    } catch (err) {
      toast(err.response?.data?.message ?? "Failed to load companies.", "error");
    } finally {
      setFetching(false);
    }
  }, [debouncedSearch, filter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filter]);

  // ── Status action ───────────────────────────────────────────────────────────
  const handleAction = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const res = await adminUpdateCompanyStatus(id, { status: newStatus });
      setCompanies(prev => prev.map(c => c.id === id ? res.company : c));
      setSelected(prev => prev?.id === id ? res.company : prev);
      setStats(prev => {
        const old = companies.find(c => c.id === id);
        const next = { ...prev };
        if (old) next[old.status] = Math.max(0, (next[old.status] ?? 1) - 1);
        next[newStatus] = (next[newStatus] ?? 0) + 1;
        return next;
      });
      toast(`Company ${newStatus} successfully.`, newStatus === "verified" ? "success" : "error");
    } catch (err) {
      toast(err.response?.data?.message ?? "Action failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this company and all its data?")) return;
    try {
      await adminDeleteCompany(id);
      const deleted = companies.find(c => c.id === id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      if (deleted) {
        setStats(prev => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          [deleted.status]: Math.max(0, (prev[deleted.status] ?? 1) - 1),
        }));
      }
      toast("Company deleted.", "success");
    } catch (err) {
      toast(err.response?.data?.message ?? "Delete failed.", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      {selected && (
        <CompanyDetail
          company={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          actionLoading={actionLoading}
        />
      )}

      <SectionHeader
        title="Company Management"
        subtitle={`${stats.total} companies on the platform`}
        action={
          <Btn onClick={() => navigate("/admin/dashboard/verification")}>
            <Ico d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={14} />
            Verification Queue
          </Btn>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: stats.total,     color: "text-white" },
          { label: "Verified",  value: stats.verified,  color: "text-emerald-400" },
          { label: "Pending",   value: stats.pending,   color: "text-amber-400" },
          { label: "Suspended", value: stats.suspended, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#161b27] border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-600 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by company name or email…" />
        <FilterPills
          options={["all", "verified", "pending", "rejected", "suspended"]}
          active={filter}
          onChange={setFilter}
        />
      </div>

      {/* Loading state */}
      {fetching ? (
        <div className="flex items-center justify-center py-24 text-zinc-600 text-sm gap-3">
          <span className="w-5 h-5 border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
          Loading companies…
        </div>
      ) : (
        <>
          <Table headers={["Company", "Industry", "Status", "Listings", "Registered", "Actions"]}>
            {companies.map(c => (
              <Tr key={c.id} onClick={() => setSelected(c)}>
                <Td>
                  <div className="flex items-center gap-3">
                    {c.logo_url ? (
                      <img src={c.logo_url} alt={c.name}
                        className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <Avatar name={c.name} size={9} />
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm">{c.name}</p>
                      <p className="text-zinc-500 text-xs">{c.email}</p>
                    </div>
                  </div>
                </Td>
                <Td><span className="text-xs">{c.industry ?? "—"}</span></Td>
                <Td><Badge status={c.status} /></Td>
                <Td><span className="text-white font-semibold">{c.listings_count ?? 0}</span></Td>
                <Td><span className="text-xs">{c.registered}</span></Td>
                <Td>
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <Btn variant="ghost" size="sm"
                      onClick={() => navigate(`/admin/dashboard/verification/${c.id}`)}>
                      <Ico d="M9 12l2 2 4-4" size={13} /> Verify
                    </Btn>
                    {c.status === "verified" ? (
                      <Btn variant="danger" size="sm" disabled={actionLoading}
                        onClick={() => handleAction(c.id, "suspended")}>
                        Suspend
                      </Btn>
                    ) : (
                      <Btn variant="success" size="sm" disabled={actionLoading}
                        onClick={() => handleAction(c.id, "verified")}>
                        Approve
                      </Btn>
                    )}
                    <Btn variant="danger" size="sm" onClick={() => handleDelete(c.id)}>
                      <Ico d="M3 6h18M19 6l-1 14H6L5 6" size={13} />
                    </Btn>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-zinc-600">
                Showing {meta.from}–{meta.to} of {meta.total} companies
              </p>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm"
                  disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  ← Prev
                </Btn>
                <span className="px-3 py-1.5 text-xs text-zinc-400 bg-[#161b27] border border-white/5 rounded-lg">
                  {meta.current_page} / {meta.last_page}
                </span>
                <Btn variant="secondary" size="sm"
                  disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </>
      )}
    </Page>
  );
};

export default CompanyManagement;