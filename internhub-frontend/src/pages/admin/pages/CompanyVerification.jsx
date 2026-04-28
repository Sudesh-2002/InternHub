// src/pages/admin/pages/CompanyVerification.jsx

import { useState } from "react";
import { Page, SectionHeader, Badge, Avatar, Btn, Ico, Textarea, useToast, Toast } from "../components/Shared";

const PENDING = [
  {
    id:1, name:"DesignHub Creative", email:"hr@designhub.lk", industry:"Design & Creative",
    website:"https://designhub.lk", regNumber:"REG-002341", submitted:"2026-04-20",
    docs: [
      { name:"Business Registration Certificate", uploaded: true },
      { name:"Tax Documents",                     uploaded: true },
      { name:"HR Authorization Letter",           uploaded: true },
      { name:"Additional Documents",              uploaded: false },
    ],
    status:"pending",
  },
  {
    id:2, name:"DataFlow Analytics", email:"hr@dataflow.io", industry:"Data Science & Analytics",
    website:"https://dataflow.io", regNumber:"REG-003412", submitted:"2026-04-22",
    docs: [
      { name:"Business Registration Certificate", uploaded: true },
      { name:"Tax Documents",                     uploaded: false },
      { name:"HR Authorization Letter",           uploaded: true },
      { name:"Additional Documents",              uploaded: false },
    ],
    status:"pending",
  },
  {
    id:3, name:"CloudBase Ltd", email:"hr@cloudbase.io", industry:"Cloud & DevOps",
    website:"https://cloudbase.io", regNumber:"REG-004523", submitted:"2026-04-24",
    docs: [
      { name:"Business Registration Certificate", uploaded: true },
      { name:"Tax Documents",                     uploaded: true },
      { name:"HR Authorization Letter",           uploaded: true },
      { name:"Additional Documents",              uploaded: true },
    ],
    status:"pending",
  },
];

const CompanyVerification = () => {
  const [companies, setCompanies] = useState(PENDING);
  const [active, setActive]       = useState(PENDING[0]);
  const [note,   setNote]         = useState("");
  const { toasts, add: toast, remove } = useToast();

  const doAction = (id, action) => {
    const map = { approve:"verified", reject:"rejected", resubmit:"pending" };
    setCompanies(p => p.map(c => c.id === id ? { ...c, status: map[action] ?? c.status } : c));
    if (active?.id === id) setActive(prev => ({ ...prev, status: map[action] ?? prev.status }));
    toast(
      action === "approve" ? "Company verified successfully!"
      : action === "reject" ? "Company rejected."
      : "Resubmission requested.",
      action === "approve" ? "success" : "error"
    );
    setNote("");
  };

  const pending = companies.filter(c => c.status === "pending");

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />
      <SectionHeader title="Company Verification" subtitle={`${pending.length} companies awaiting review`} />

      <div className="grid lg:grid-cols-3 gap-5 items-start">

        {/* Queue list */}
        <div className="bg-[#161b27] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Queue ({pending.length})</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {companies.map(c => (
              <button key={c.id} onClick={() => setActive(c)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${active?.id === c.id ? "bg-violet-500/10" : "hover:bg-white/[0.03]"}`}>
                <Avatar name={c.name} size={10} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${active?.id === c.id ? "text-violet-300" : "text-white"}`}>{c.name}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{c.submitted}</p>
                </div>
                <Badge status={c.status} />
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {active && (
          <div className="lg:col-span-2 space-y-5">
            {/* Company info */}
            <div className="bg-[#161b27] border border-white/5 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <Avatar name={active.name} size={14} />
                  <div>
                    <h3 className="text-white font-bold text-lg">{active.name}</h3>
                    <p className="text-zinc-400 text-sm">{active.email}</p>
                    <div className="mt-1"><Badge status={active.status} /></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  ["Industry",    active.industry],
                  ["Website",     active.website],
                  ["Reg. Number", active.regNumber],
                  ["Submitted",   active.submitted],
                ].map(([k,v]) => (
                  <div key={k} className="bg-white/[0.03] rounded-xl p-3">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{k}</p>
                    <p className="text-zinc-200 text-xs font-medium truncate">{v}</p>
                  </div>
                ))}
              </div>

              {/* Documents */}
              <div>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Uploaded Documents</p>
                <div className="space-y-2">
                  {active.docs.map(doc => (
                    <div key={doc.name} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                      doc.uploaded ? "bg-white/[0.03] border-white/5" : "bg-red-500/5 border-red-500/15"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.uploaded ? "bg-emerald-500/15" : "bg-red-500/15"}`}>
                          <Ico d={doc.uploaded ? "M20 6L9 17l-5-5" : "M18 6L6 18M6 6l12 12"} size={11} color="" className={doc.uploaded ? "text-emerald-400" : "text-red-400"} />
                        </div>
                        <span className="text-sm text-zinc-300 font-medium">{doc.name}</span>
                      </div>
                      {doc.uploaded ? (
                        <Btn variant="secondary" size="sm">
                          <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={12} />
                          View
                        </Btn>
                      ) : (
                        <span className="text-xs text-red-400 font-semibold">Missing</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin actions */}
            <div className="bg-[#161b27] border border-white/5 rounded-2xl p-6 space-y-4">
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Admin Actions</p>
              <Textarea label="Verification Note" rows={3} value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add a note for the company or for internal records…" />
              {active.status === "pending" && (
                <div className="flex flex-wrap gap-3 pt-1">
                  <Btn variant="success" onClick={() => doAction(active.id, "approve")}>
                    <Ico d="M20 6L9 17l-5-5" size={14} sw={2.5} /> Approve & Verify
                  </Btn>
                  <Btn variant="danger" onClick={() => doAction(active.id, "reject")}>
                    <Ico d="M18 6L6 18M6 6l12 12" size={14} sw={2.5} /> Reject
                  </Btn>
                  <Btn variant="warning" onClick={() => doAction(active.id, "resubmit")}>
                    <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" size={14} />
                    Request Resubmission
                  </Btn>
                </div>
              )}
              {active.status !== "pending" && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                  active.status === "verified" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"
                }`}>
                  <Ico d={active.status === "verified" ? "M20 6L9 17l-5-5" : "M18 6L6 18M6 6l12 12"} size={14} color="" className={active.status === "verified" ? "text-emerald-400" : "text-red-400"} />
                  <span className={`text-sm font-semibold ${active.status === "verified" ? "text-emerald-400" : "text-red-400"}`}>
                    This company has been {active.status}.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default CompanyVerification;