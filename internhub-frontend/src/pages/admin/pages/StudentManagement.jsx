// src/pages/admin/pages/StudentManagement.jsx

import { useState } from "react";
import { Page, SectionHeader, Table, Tr, Td, Badge, Avatar, SearchBar, FilterPills, Btn, Modal, Input, Ico, useToast, Toast } from "../components/Shared";

const STUDENTS = [
  { id:1, name:"Asel Perera",     email:"asel@gmail.com",   university:"University of Moratuwa", degree:"BSc Computer Science", status:"active",    registered:"2025-10-12", skills:["React","Laravel","MySQL"],   applications:4 },
  { id:2, name:"Kasun Silva",     email:"kasun@gmail.com",  university:"SLIIT",                  degree:"BSc IT",               status:"active",    registered:"2025-11-03", skills:["Python","Django","AWS"],     applications:7 },
  { id:3, name:"Nimasha Fernando",email:"nima@gmail.com",   university:"University of Colombo",  degree:"BSc Software Eng",     status:"suspended", registered:"2025-09-21", skills:["Vue","Node.js"],             applications:2 },
  { id:4, name:"Dinesh Rajapaksa",email:"din@gmail.com",    university:"NSBM",                   degree:"BSc Data Science",     status:"active",    registered:"2026-01-08", skills:["R","SQL","Tableau"],         applications:3 },
  { id:5, name:"Chamari Wickrama",email:"chama@gmail.com",  university:"University of Kelaniya", degree:"BSc Mathematics",      status:"inactive",  registered:"2026-02-14", skills:["Excel","Python","SPSS"],     applications:1 },
  { id:6, name:"Lahiru Bandara",  email:"lahiru@gmail.com", university:"IIT",                    degree:"BSc Computer Science", status:"active",    registered:"2026-03-01", skills:["Angular","Firebase"],        applications:5 },
  { id:7, name:"Priya Kumari",    email:"priya@gmail.com",  university:"University of Ruhuna",   degree:"BSc IT",               status:"active",    registered:"2026-04-10", skills:["Swift","Kotlin","Flutter"],  applications:2 },
];

const StudentDetail = ({ student, onClose, onStatusChange }) => (
  <Modal title="Student Profile" onClose={onClose}
    footer={
      <>
        <Btn variant="secondary" onClick={onClose}>Close</Btn>
        {student.status === "active"
          ? <Btn variant="danger" onClick={() => onStatusChange(student.id, "suspended")}>Suspend</Btn>
          : <Btn variant="success" onClick={() => onStatusChange(student.id, "active")}>Activate</Btn>}
      </>
    }>
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar name={student.name} size={14} />
        <div>
          <h3 className="text-white font-bold text-base">{student.name}</h3>
          <p className="text-zinc-400 text-sm">{student.email}</p>
          <Badge status={student.status} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          ["University", student.university],
          ["Degree",     student.degree],
          ["Registered", student.registered],
          ["Applications", student.applications],
        ].map(([k, v]) => (
          <div key={k} className="bg-white/[0.03] rounded-xl p-3">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{k}</p>
            <p className="text-zinc-200 text-sm font-medium">{v}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Skills</p>
        <div className="flex flex-wrap gap-2">
          {student.skills.map(s => (
            <span key={s} className="px-2.5 py-1 bg-violet-500/10 text-violet-300 text-xs font-semibold rounded-lg ring-1 ring-violet-500/20">{s}</span>
          ))}
        </div>
      </div>
      <Btn variant="secondary" size="sm" onClick={() => {}}>
        <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={13} />
        Download Resume
      </Btn>
    </div>
  </Modal>
);

const StudentManagement = () => {
  const [students, setStudents] = useState(STUDENTS);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const { toasts, add: toast, remove } = useToast();

  const filtered = students.filter(s =>
    (filter === "all" || s.status === filter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.email.toLowerCase().includes(search.toLowerCase()) ||
     s.university.toLowerCase().includes(search.toLowerCase()))
  );

  const changeStatus = (id, status) => {
    setStudents(p => p.map(s => s.id === id ? { ...s, status } : s));
    setSelected(prev => prev ? { ...prev, status } : prev);
    toast(`Student ${status === "active" ? "activated" : "suspended"} successfully`, status === "active" ? "success" : "error");
  };

  const deleteStudent = (id) => {
    if (!window.confirm("Delete this student? This cannot be undone.")) return;
    setStudents(p => p.filter(s => s.id !== id));
    toast("Student deleted", "success");
  };

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />
      {selected && <StudentDetail student={selected} onClose={() => setSelected(null)} onStatusChange={changeStatus} />}

      <SectionHeader title="Student Management" subtitle={`${students.length} students registered on the platform`}
        action={<Btn><Ico d="M12 5v14M5 12h14" size={14} />Export CSV</Btn>}
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Total",     value: students.length,                            color:"text-white" },
          { label:"Active",    value: students.filter(s=>s.status==="active").length,    color:"text-emerald-400" },
          { label:"Suspended", value: students.filter(s=>s.status==="suspended").length, color:"text-red-400" },
          { label:"Inactive",  value: students.filter(s=>s.status==="inactive").length,  color:"text-zinc-400" },
        ].map(s => (
          <div key={s.label} className="bg-[#161b27] border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-600 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, university…" />
        <FilterPills options={["all","active","suspended","inactive"]} active={filter} onChange={setFilter} />
      </div>

      {/* Table */}
      <Table headers={["Student","University","Degree","Status","Registered","Actions"]}>
        {filtered.map(s => (
          <Tr key={s.id} onClick={() => setSelected(s)}>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={s.name} size={9} />
                <div>
                  <p className="text-white font-semibold text-sm">{s.name}</p>
                  <p className="text-zinc-500 text-xs">{s.email}</p>
                </div>
              </div>
            </Td>
            <Td><span className="text-xs">{s.university}</span></Td>
            <Td><span className="text-xs">{s.degree}</span></Td>
            <Td><Badge status={s.status} /></Td>
            <Td><span className="text-xs">{s.registered}</span></Td>
            <Td>
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                <Btn variant="ghost" size="sm" onClick={() => setSelected(s)}>
                  <Ico d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={13} />
                  View
                </Btn>
                {s.status === "active"
                  ? <Btn variant="danger" size="sm" onClick={() => changeStatus(s.id, "suspended")}>Suspend</Btn>
                  : <Btn variant="success" size="sm" onClick={() => changeStatus(s.id, "active")}>Activate</Btn>}
                <Btn variant="danger" size="sm" onClick={() => deleteStudent(s.id)}>
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

export default StudentManagement;