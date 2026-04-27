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

  const inputCls =
    "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition shadow-sm hover:border-slate-300";

  const labelCls =
    "block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-5">

        {/* Page heading */}
        <div className="mb-2">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Company Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your public company information</p>
        </div>

        {/* Avatar card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-6 shadow-sm shadow-slate-100/80">
          {/* Logo badge */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-indigo-200">
              TC
            </div>
            <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-slate-900 font-bold text-xl leading-tight">{profile.name}</h3>
            <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
              <Ico d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" size={12} />
              {profile.location}
            </p>
            <label className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150">
              <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} size={13} />
              Upload Logo
              <input type="file" className="hidden" accept="image/*" />
            </label>
          </div>

          {/* Quick stat pills */}
          <div className="hidden sm:flex flex-col gap-2 items-end flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold">
              <Ico d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" size={12} />
              Est. {profile.founded}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold">
              <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" size={12} />
              {profile.size} employees
            </span>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/80 overflow-hidden">
          {/* Card header strip */}
          <div className="px-7 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <h3 className="text-slate-700 font-bold text-sm tracking-tight">Company Information</h3>
            <span className="text-xs text-slate-400">All fields are public</span>
          </div>

          <div className="p-7 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Company Name — full width */}
              <div className="col-span-2">
                <label className={labelCls}>Company Name</label>
                <input
                  className={inputCls}
                  value={profile.name}
                  onChange={e => set("name", e.target.value)}
                />
              </div>

              {/* Location */}
              <div>
                <label className={labelCls}>Location</label>
                <input
                  className={inputCls}
                  value={profile.location}
                  onChange={e => set("location", e.target.value)}
                />
              </div>

              {/* Website */}
              <div>
                <label className={labelCls}>Website</label>
                <input
                  className={inputCls}
                  value={profile.website}
                  onChange={e => set("website", e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelCls}>Contact Email</label>
                <input
                  type="email"
                  className={inputCls}
                  value={profile.email}
                  onChange={e => set("email", e.target.value)}
                />
              </div>

              {/* Company Size */}
              <div>
                <label className={labelCls}>Company Size</label>
                <select
                  className={inputCls}
                  value={profile.size}
                  onChange={e => set("size", e.target.value)}
                >
                  {["1-10", "11-50", "50-100", "100-500", "500+"].map(s => (
                    <option key={s} value={s}>{s} employees</option>
                  ))}
                </select>
              </div>

              {/* About — full width */}
              <div className="col-span-2">
                <label className={labelCls}>About the Company</label>
                <textarea
                  className={inputCls}
                  rows={4}
                  value={profile.description}
                  onChange={e => set("description", e.target.value)}
                />
              </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-400">Changes are saved to your public profile immediately.</p>
              <button
                onClick={save}
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all duration-150 flex items-center gap-2 shadow-md shadow-indigo-200"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Ico d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8" size={14} sw={2} />
                }
                {loading ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyProfile;