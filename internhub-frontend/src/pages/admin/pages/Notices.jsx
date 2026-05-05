// src/pages/admin/pages/Notices.jsx

import { useState } from "react";
import { Page, SectionHeader, Badge, Btn, Modal, Input, Textarea, Select, Ico, useToast, Toast } from "../components/Shared";

const NOTICE_TYPES = ["general","maintenance","internship alerts","university updates"];

const MOCK = [
  { id:1, title:"Platform Maintenance on May 5",    type:"maintenance",         body:"We will be down for 2 hours on May 5 from 2–4AM.",          scheduled:"2026-05-05", status:"scheduled" },
  { id:2, title:"New Internship Batch Released",   type:"internship alerts",   body:"25 new verified internships are now live on the platform.",  scheduled:null,         status:"active" },
  { id:3, title:"University Partners Update",      type:"university updates",  body:"UoM and SLIIT are now officially onboarded as partners.",    scheduled:null,         status:"active" },
  { id:4, title:"Welcome to InternHub",            type:"general",             body:"We're excited to launch InternHub. Good luck everyone!",     scheduled:null,         status:"active" },
];

const EMPTY = { title:"", type:"general", body:"", scheduled:"" };

const Notices = () => {
  const [notices, setNotices] = useState(MOCK);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const { toasts, add: toast, remove } = useToast();

  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const openNew  = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (n) => { setForm({...n}); setEditing(n.id); setModal(true); };

  const save = () => {
    if (!form.title.trim() || !form.body.trim()) { toast("Title and body are required","error"); return; }
    if (editing) {
      setNotices(p => p.map(n => n.id === editing ? {...n,...form} : n));
      toast("Notice updated","success");
    } else {
      setNotices(p => [...p, {...form, id:Date.now(), status: form.scheduled ? "scheduled":"active"}]);
      toast("Notice published","success");
    }
    setModal(false);
  };

  const del = (id) => {
    if (!window.confirm("Delete this notice?")) return;
    setNotices(p => p.filter(n => n.id !== id));
    toast("Notice deleted","success");
  };

  const typeColor = { general:"text-sky-700 bg-sky-50", maintenance:"text-amber-700 bg-amber-50", "internship alerts":"text-indigo-700 bg-indigo-50", "university updates":"text-emerald-700 bg-emerald-50" };

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />
      {modal && (
        <Modal title={editing ? "Edit Notice" : "Create Notice"} onClose={() => setModal(false)}
          footer={<><Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn><Btn onClick={save}>Save Notice</Btn></>}>
          <div className="space-y-4">
            <Input label="Title *" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Notice title…" />
            <Select label="Type" value={form.type} onChange={e => set("type", e.target.value)}>
              {NOTICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Textarea label="Body *" rows={4} value={form.body} onChange={e => set("body", e.target.value)} placeholder="Notice content…" />
            <Input label="Schedule (optional)" type="datetime-local" value={form.scheduled} onChange={e => set("scheduled", e.target.value)} />
          </div>
        </Modal>
      )}

      <SectionHeader title="Announcements & Notices" subtitle="Platform-wide notices for students and companies"
        action={<Btn onClick={openNew}><Ico d="M12 5v14M5 12h14" size={14} />New Notice</Btn>}
      />

      <div className="grid gap-4">
        {notices.map(n => (
          <div key={n.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex-shrink-0 ${typeColor[n.type] || "text-gray-500 bg-gray-100"}`}>
              {n.type}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-gray-900 font-semibold text-sm">{n.title}</h3>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge status={n.status} />
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-1 leading-relaxed">{n.body}</p>
              {n.scheduled && (
                <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                  <Ico d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={12} />
                  Scheduled: {n.scheduled}
                </p>
              )}
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <Btn variant="ghost" size="sm" onClick={() => openEdit(n)}><Ico d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" size={13} /></Btn>
              <Btn variant="danger" size="sm" onClick={() => del(n.id)}><Ico d="M3 6h18M19 6l-1 14H6L5 6" size={13} /></Btn>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
};

export default Notices;