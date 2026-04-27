// src/pages/company/pages/PostJob.jsx

import { useState } from "react";
import { Ico } from "../components/Shared";

const PostJob = ({ onPosted, toast }) => {
  const [form, setForm] = useState({
    title: "", description: "", location: "", type: "Remote", salary: "", deadline: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Job title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.location.trim())    e.location    = "Location is required";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    toast("Job posted! Awaiting admin approval.", "success");
    onPosted({
      ...form,
      id: Date.now(),
      status: "pending",
      applicants: 0,
      posted: new Date().toISOString().slice(0, 10),
    });
    setForm({ title: "", description: "", location: "", type: "Remote", salary: "", deadline: "" });
    setErrors({});
  };

  const inputCls = (k) =>
    `w-full bg-gray-50 border ${errors[k] ? "border-red-400" : "border-gray-200"} rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors[k] ? "focus:ring-red-400/40" : "focus:ring-indigo-500/40"} focus:border-transparent transition`;

  return (
    <div className="max-w-2xl">
      <div className="mb-7">
        <h2 className="text-xl font-bold text-gray-900">Post a New Internship</h2>
        <p className="text-gray-400 text-sm mt-1">Fill in the details below. Your listing goes live after admin review.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-7 space-y-5">

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Job Title *</label>
          <input className={inputCls("title")} placeholder="e.g. Frontend Developer Intern"
            value={form.title}
            onChange={e => { set("title", e.target.value); setErrors(p => ({ ...p, title: "" })); }} />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Description *</label>
          <textarea className={inputCls("description")} rows={5}
            placeholder="Describe the role, responsibilities, and requirements…"
            value={form.description}
            onChange={e => { set("description", e.target.value); setErrors(p => ({ ...p, description: "" })); }} />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Location + Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Location *</label>
            <input className={inputCls("location")} placeholder="e.g. Colombo or Remote"
              value={form.location}
              onChange={e => { set("location", e.target.value); setErrors(p => ({ ...p, location: "" })); }} />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Work Type</label>
            <select className={inputCls()} value={form.type} onChange={e => set("type", e.target.value)}>
              {["Remote", "On-site", "Hybrid"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Salary + Deadline */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Salary <span className="normal-case font-normal text-gray-400">(optional)</span>
            </label>
            <input className={inputCls()} placeholder="e.g. $800/mo"
              value={form.salary} onChange={e => set("salary", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
              Deadline <span className="normal-case font-normal text-gray-400">(optional)</span>
            </label>
            <input type="date" className={inputCls()}
              value={form.deadline} onChange={e => set("deadline", e.target.value)} />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button onClick={submit} disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Ico d="M12 5v14M5 12h14" size={16} sw={2.5} />}
            {loading ? "Posting…" : "Post Internship"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostJob;