// src/pages/company/pages/CompanyProfile.jsx

import { useState } from "react";
import { Ico } from "../components/Shared";

const CompanyProfile = ({ toast }) => {
  const [profile, setProfile] = useState({
    name:        "TechCorp Solutions",
    description: "We build innovative software products for modern businesses.",
    website:     "https://techcorp.io",
    location:    "Colombo, Sri Lanka",
    email:       "hr@techcorp.io",
    founded:     "2018",
    size:        "50-100",
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const save = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    toast("Company profile updated!", "success");
  };

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent transition";

  return (
    <div className="max-w-2xl space-y-6">

      {/* Avatar card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          TC
        </div>
        <div>
          <h3 className="text-gray-900 font-bold text-lg">{profile.name}</h3>
          <p className="text-gray-400 text-sm">{profile.location}</p>
          <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg text-xs font-medium cursor-pointer transition">
            <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} size={13} />
            Upload Logo
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-7 space-y-5">
        <h3 className="text-gray-900 font-semibold">Company Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Company Name</label>
            <input className={inputCls} value={profile.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Location</label>
            <input className={inputCls} value={profile.location} onChange={e => set("location", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Website</label>
            <input className={inputCls} value={profile.website} onChange={e => set("website", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Contact Email</label>
            <input type="email" className={inputCls} value={profile.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Company Size</label>
            <select className={inputCls} value={profile.size} onChange={e => set("size", e.target.value)}>
              {["1-10", "11-50", "50-100", "100-500", "500+"].map(s => (
                <option key={s} value={s}>{s} employees</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">About the Company</label>
            <textarea className={inputCls} rows={4}
              value={profile.description}
              onChange={e => set("description", e.target.value)} />
          </div>
        </div>

        <button onClick={save} disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Ico d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8" size={14} sw={2} />
          }
          {loading ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

export default CompanyProfile;