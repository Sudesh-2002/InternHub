// src/pages/admin/pages/CompanyManagement.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, SectionHeader, Table, Tr, Td, Badge, Avatar, SearchBar, FilterPills, Btn, Modal, Ico, useToast, Toast } from "../components/Shared";

const COMPANIES = [
  { id:1, name:"TechCorp Solutions", email:"hr@techcorp.io",   industry:"Software",     website:"techcorp.io",   status:"verified",  registered:"2025-09-10", listings:5, regNumber:"REG-001234" },
  { id:2, name:"DesignHub Creative", email:"hr@designhub.lk",  industry:"Design",       website:"designhub.lk", status:"pending",   registered:"2026-03-22", listings:2, regNumber:"REG-002341" },
  { id:3, name:"DataFlow Analytics", email:"hr@dataflow.io",   industry:"Data",         website:"dataflow.io",  status:"pending",   registered:"2026-04-01", listings:0, regNumber:"REG-003412" },
  { id:4, name:"CloudBase Ltd",      email:"hr@cloudbase.io",  industry:"Cloud/DevOps", website:"cloudbase.io", status:"suspended", registered:"2025-11-15", listings:3, regNumber:"REG-004523" },
  { id:5, name:"AppWorks Studio",    email:"hr@appworks.lk",   industry:"Mobile",       website:"appworks.lk",  status:"verified",  registered:"2026-01-08", listings:4, regNumber:"REG-005634" },
  { id:6, name:"CyberShield Labs",   email:"hr@cybershield.io",industry:"Cybersecurity",website:"cybershield.io",status:"rejected",  registered:"2026-02-20", listings:0, regNumber:"REG-006745" },
];

const CompanyDetail = ({ company, onClose, onAction }) => (
  <Modal title="Company Profile" onClose={onClose}
    footer={
      <div className="flex flex-wrap gap-2">
        <Btn variant="secondary" size="sm" onClick={onClose}>Close</Btn>
        {company.status === "pending" && (
          <>
            <Btn variant="success" size="sm" onClick={() => { onAction(company.id,"verified"); onClose(); }}>Verify</Btn>
            <Btn variant="danger"  size="sm" onClick={() => { onAction(company.id,"rejected"); onClose(); }}>Reject</Btn>
          </>
        )}
        {company.status === "verified" && (
          <Btn variant="danger" size="sm" onClick={() => { onAction(company.id,"suspended"); onClose(); }}>Suspend</Btn>
        )}
        {company.status === "suspended" && (
          <Btn variant="success" size="sm" onClick={() => { onAction(company.id,"verified"); onClose(); }}>Reinstate</Btn>
        )}
      </div>
    }>
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar name={company.name} size={14} />
        <div>
          <h3 className="text-white font-bold text-base">{company.name}</h3>
          <p className="text-zinc-400 text-sm">{company.email}</p>
          <Badge status={company.status} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Industry",    company.industry],
          ["Website",     company.website],
          ["Reg. Number", company.regNumber],
          ["Listings",    company.listings],
          ["Registered",  company.registered],
        ].map(([k,v]) => (
          <div key={k} className="bg-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{k}</p>
            <p className="text-zinc-200 text-sm font-medium">{v}</p>
          </div>
        ))}
      </div>
      {/* Uploaded documents mock */}
      <div>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Uploaded Documents</p>
        <div className="space-y-2">
          {["Business Registration Certificate","Tax Documents","HR Authorization Letter"].map(doc => (
            <div key={doc} className="flex items-center justify-between bg-white/[0.03] rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Ico d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" size={14} color="#7c3aed" />
                <span className="text-xs text-zinc-300">{doc}</span>
              </div>
              <Btn variant="ghost" size="sm">
                <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={12} />
              </Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Modal>
);

const CompanyManagement = () => {
  const [companies, setCompanies] = useState(COMPANIES);
  const [search,   setSearch]     = useState("");
  const [filter,   setFilter]     = useState("all");
  const [selected, setSelected]   = useState(null);
  const { toasts, add: toast, remove } = useToast();
  const navigate = useNavigate();

  const filtered = companies.filter(c =>
    (filter === "all" || c.status === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
     c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAction = (id, newStatus) => {
    setCompanies(p => p.map(c => c.id === id ? { ...c, status: newStatus } : c));
    toast(`Company ${newStatus} successfully`, newStatus === "verified" ? "success" : "error");
  };

  const deleteCompany = (id) => {
    if (!window.confirm("Delete this company permanently?")) return;
    setCompanies(p => p.filter(c => c.id !== id));
    toast("Company deleted", "success");
  };

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />
      {selected && <CompanyDetail company={selected} onClose={() => setSelected(null)} onAction={handleAction} />}

      <SectionHeader title="Company Management" subtitle={`${companies.length} companies on the platform`}
        action={
          <Btn onClick={() => navigate("/admin/dashboard/verification")}>
            <Ico d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" size={14} />
            Verification Queue
          </Btn>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Total",     value: companies.length,                             color:"text-white" },
          { label:"Verified",  value: companies.filter(c=>c.status==="verified").length,  color:"text-emerald-400" },
          { label:"Pending",   value: companies.filter(c=>c.status==="pending").length,   color:"text-amber-400" },
          { label:"Suspended", value: companies.filter(c=>c.status==="suspended").length, color:"text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#161b27] border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-600 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search companies…" />
        <FilterPills options={["all","verified","pending","rejected","suspended"]} active={filter} onChange={setFilter} />
      </div>

      {/* Table */}
      <Table headers={["Company","Industry","Status","Listings","Registered","Actions"]}>
        {filtered.map(c => (
          <Tr key={c.id} onClick={() => setSelected(c)}>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={c.name} size={9} />
                <div>
                  <p className="text-white font-semibold text-sm">{c.name}</p>
                  <p className="text-zinc-500 text-xs">{c.email}</p>
                </div>
              </div>
            </Td>
            <Td><span className="text-xs">{c.industry}</span></Td>
            <Td><Badge status={c.status} /></Td>
            <Td><span className="text-white font-semibold">{c.listings}</span></Td>
            <Td><span className="text-xs">{c.registered}</span></Td>
            <Td>
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                <Btn variant="ghost" size="sm" onClick={() => navigate(`/admin/dashboard/verification/${c.id}`)}>
                  <Ico d="M9 12l2 2 4-4" size={13} /> Verify
                </Btn>
                {c.status === "verified"
                  ? <Btn variant="danger" size="sm" onClick={() => handleAction(c.id,"suspended")}>Suspend</Btn>
                  : c.status !== "verified" && <Btn variant="success" size="sm" onClick={() => handleAction(c.id,"verified")}>Approve</Btn>}
                <Btn variant="danger" size="sm" onClick={() => deleteCompany(c.id)}>
                  <Ico d="M3 6h18M19 6l-1 14H6L5 6" size={13} />
                </Btn>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>
    </Page>
  );
};

export default CompanyManagement;