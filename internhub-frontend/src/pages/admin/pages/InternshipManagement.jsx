// src/pages/admin/pages/InternshipManagement.jsx

import { useState } from "react";
import { Page, SectionHeader, Table, Tr, Td, Badge, SearchBar, FilterPills, Btn, Modal, Ico, Textarea, useToast, Toast } from "../components/Shared";

const INTERNSHIPS = [
  { id:1, title:"Frontend Developer Intern",  company:"TechCorp Solutions",  location:"Remote",      deadline:"2026-05-15", status:"approved", posted:"2026-04-10", applications:24 },
  { id:2, title:"UI/UX Design Intern",        company:"DesignHub Creative",  location:"Colombo",     deadline:"2026-05-30", status:"pending",  posted:"2026-04-18", applications:12 },
  { id:3, title:"Data Analyst Intern",        company:"DataFlow Analytics",  location:"Remote",      deadline:"2026-05-28", status:"pending",  posted:"2026-04-20", applications:8 },
  { id:4, title:"Backend Engineer Intern",    company:"CloudBase Ltd",       location:"Hybrid",      deadline:"2026-06-01", status:"approved", posted:"2026-04-05", applications:31 },
  { id:5, title:"Mobile Dev Intern",          company:"AppWorks Studio",     location:"Colombo",     deadline:"2026-06-10", status:"flagged",  posted:"2026-04-22", applications:5 },
  { id:6, title:"Cybersecurity Intern",       company:"CyberShield Labs",    location:"Remote",      deadline:"2026-05-20", status:"rejected", posted:"2026-04-08", applications:0 },
  { id:7, title:"DevOps Intern",              company:"CloudBase Ltd",       location:"Remote",      deadline:"2026-05-25", status:"approved", posted:"2026-04-12", applications:18 },
];

const InternshipManagement = () => {
  const [jobs,     setJobs]   = useState(INTERNSHIPS);
  const [search,   setSearch] = useState("");
  const [filter,   setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [note,     setNote]   = useState("");
  const { toasts, add: toast, remove } = useToast();

  const filtered = jobs.filter(j =>
    (filter === "all" || j.status === filter) &&
    (j.title.toLowerCase().includes(search.toLowerCase()) ||
     j.company.toLowerCase().includes(search.toLowerCase()))
  );

  const doAction = (id, status) => {
    setJobs(p => p.map(j => j.id === id ? { ...j, status } : j));
    setSelected(null);
    toast(`Internship ${status}`, status === "approved" ? "success" : "error");
  };

  const deleteJob = (id) => {
    if (!window.confirm("Remove this internship?")) return;
    setJobs(p => p.filter(j => j.id !== id));
    toast("Internship removed", "success");
  };

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      {selected && (
        <Modal title="Internship Details" onClose={() => setSelected(null)}
          footer={
            <div className="flex flex-wrap gap-2">
              <Btn variant="secondary" onClick={() => setSelected(null)}>Cancel</Btn>
              {selected.status === "pending" && <>
                <Btn variant="success" onClick={() => doAction(selected.id,"approved")}>Approve</Btn>
                <Btn variant="danger"  onClick={() => doAction(selected.id,"rejected")}>Reject</Btn>
              </>}
              {selected.status !== "flagged" && (
                <Btn variant="warning" onClick={() => doAction(selected.id,"flagged")}>Flag</Btn>
              )}
            </div>
          }>
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-bold text-base">{selected.title}</h3>
              <p className="text-zinc-400 text-sm mt-0.5">{selected.company} · {selected.location}</p>
              <div className="mt-2 flex gap-2"><Badge status={selected.status} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[["Posted",selected.posted],["Deadline",selected.deadline],["Applications",selected.applications]].map(([k,v]) => (
                <div key={k} className="bg-white/[0.03] rounded-xl p-3">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{k}</p>
                  <p className="text-zinc-200 text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>
            <Textarea label="Admin Note" rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Reason for action…" />
          </div>
        </Modal>
      )}

      <SectionHeader title="Internship Management" subtitle={`${jobs.length} internship listings total`}
        action={<Btn variant="secondary"><Ico d="M12 5v14M5 12h14" size={14} />Export</Btn>}
      />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Total",    value: jobs.length,                           color:"text-white" },
          { label:"Approved", value: jobs.filter(j=>j.status==="approved").length, color:"text-emerald-400" },
          { label:"Pending",  value: jobs.filter(j=>j.status==="pending").length,  color:"text-amber-400" },
          { label:"Flagged",  value: jobs.filter(j=>j.status==="flagged").length,  color:"text-orange-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#161b27] border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-600 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search internships or companies…" />
        <FilterPills options={["all","approved","pending","rejected","flagged"]} active={filter} onChange={setFilter} />
      </div>

      <Table headers={["Title","Company","Location","Deadline","Status","Apps","Actions"]}>
        {filtered.map(j => (
          <Tr key={j.id} onClick={() => setSelected(j)}>
            <Td><p className="text-white font-semibold text-sm">{j.title}</p></Td>
            <Td><span className="text-xs">{j.company}</span></Td>
            <Td><span className="text-xs">{j.location}</span></Td>
            <Td><span className="text-xs">{j.deadline}</span></Td>
            <Td><Badge status={j.status} /></Td>
            <Td><span className="text-white font-semibold text-sm">{j.applications}</span></Td>
            <Td>
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                {j.status === "pending" && <Btn variant="success" size="sm" onClick={() => doAction(j.id,"approved")}>Approve</Btn>}
                {j.status !== "flagged" && <Btn variant="warning" size="sm" onClick={() => doAction(j.id,"flagged")}>Flag</Btn>}
                <Btn variant="danger" size="sm" onClick={() => deleteJob(j.id)}><Ico d="M3 6h18M19 6l-1 14H6L5 6" size={12} /></Btn>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>
    </Page>
  );
};

export default InternshipManagement;