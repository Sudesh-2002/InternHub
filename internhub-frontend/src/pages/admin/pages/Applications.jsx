// src/pages/admin/pages/Applications.jsx

import { useState } from "react";
import { Page, SectionHeader, Table, Tr, Td, Badge, SearchBar, FilterPills, Btn, Ico, Avatar, useToast, Toast } from "../components/Shared";

const APPS = [
  { id:1, student:"Asel Perera",    company:"TechCorp",  job:"Frontend Intern",     status:"pending",  applied:"2026-04-12", spam: false },
  { id:2, student:"Kasun Silva",    company:"TechCorp",  job:"Frontend Intern",     status:"accepted", applied:"2026-04-13", spam: false },
  { id:3, student:"Nimasha F.",     company:"DesignHub", job:"UI/UX Intern",        status:"rejected", applied:"2026-04-19", spam: false },
  { id:4, student:"Dinesh R.",      company:"DataFlow",  job:"Data Analyst Intern", status:"pending",  applied:"2026-04-20", spam: true  },
  { id:5, student:"Chamari W.",     company:"CloudBase", job:"Backend Intern",      status:"accepted", applied:"2026-04-07", spam: false },
  { id:6, student:"Lahiru B.",      company:"AppWorks",  job:"Mobile Dev Intern",   status:"pending",  applied:"2026-04-09", spam: false },
  { id:7, student:"Priya K.",       company:"TechCorp",  job:"Frontend Intern",     status:"reviewed", applied:"2026-04-14", spam: true  },
];

const Applications = () => {
  const [apps,   setApps]   = useState(APPS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { toasts, add: toast, remove } = useToast();

  const filtered = apps.filter(a =>
    (filter === "all" || (filter === "spam" ? a.spam : a.status === filter)) &&
    (a.student.toLowerCase().includes(search.toLowerCase()) ||
     a.company.toLowerCase().includes(search.toLowerCase()) ||
     a.job.toLowerCase().includes(search.toLowerCase()))
  );

  const markSpam = (id) => {
    setApps(p => p.map(a => a.id === id ? { ...a, spam: !a.spam } : a));
    toast("Application flagged as spam", "success");
  };

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />
      <SectionHeader title="Internship Applications"
        subtitle={`${apps.length} total · ${apps.filter(a=>a.spam).length} flagged as spam`}
        action={<Btn variant="secondary"><Ico d="M12 5v14M5 12h14" size={14} />Export</Btn>}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search student, company or job…" />
        <FilterPills options={["all","pending","accepted","rejected","reviewed","spam"]} active={filter} onChange={setFilter} />
      </div>
      <Table headers={["Student","Company","Position","Status","Applied","Spam","Actions"]}>
        {filtered.map(a => (
          <Tr key={a.id}>
            <Td><div className="flex items-center gap-2"><Avatar name={a.student} size={8} /><span className="text-white font-medium text-sm">{a.student}</span></div></Td>
            <Td><span className="text-xs">{a.company}</span></Td>
            <Td><span className="text-xs">{a.job}</span></Td>
            <Td><Badge status={a.status} /></Td>
            <Td><span className="text-xs">{a.applied}</span></Td>
            <Td>
              {a.spam
                ? <span className="text-xs text-orange-400 font-bold">⚠ Spam</span>
                : <span className="text-xs text-zinc-600">—</span>}
            </Td>
            <Td>
              <div className="flex items-center gap-1.5">
                <Btn variant="ghost" size="sm"><Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={12} />Resume</Btn>
                <Btn variant={a.spam ? "secondary" : "warning"} size="sm" onClick={() => markSpam(a.id)}>
                  {a.spam ? "Unflag" : "Spam"}
                </Btn>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>
    </Page>
  );
};

export default Applications;