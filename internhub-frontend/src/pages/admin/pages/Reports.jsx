// src/pages/admin/pages/Reports.jsx

import { useState } from "react";
import { Page, SectionHeader, Btn, Ico } from "../components/Shared";

const BarChart = ({ data, color, label }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="bg-[#161b27] border border-white/5 rounded-2xl p-5">
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-5">{label}</p>
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-zinc-600 font-semibold">{d.value}</span>
            <div className="w-full rounded-t-lg transition-all duration-700"
              style={{ height: `${Math.max((d.value / max) * 100, 4)}px`, background: color, opacity: 0.5 + (i/data.length)*0.5 }} />
            <span className="text-[9px] text-zinc-600 font-medium">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HBarChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 w-28 truncate flex-shrink-0">{d.label}</span>
          <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value/max)*100}%`, background: color }} />
          </div>
          <span className="text-xs text-zinc-500 w-8 text-right">{d.value}</span>
        </div>
      ))}
    </div>
  );
};

const INTERNSHIP_GROWTH = [
  {label:"Nov",value:28},{label:"Dec",value:41},{label:"Jan",value:35},{label:"Feb",value:55},{label:"Mar",value:72},{label:"Apr",value:63},
];
const STUDENT_ENGAGEMENT = [
  {label:"Nov",value:120},{label:"Dec",value:185},{label:"Jan",value:160},{label:"Feb",value:240},{label:"Mar",value:310},{label:"Apr",value:280},
];
const ACTIVE_COMPANIES = [
  {label:"Nov",value:8},{label:"Dec",value:14},{label:"Jan",value:11},{label:"Feb",value:22},{label:"Mar",value:19},{label:"Apr",value:28},
];
const APP_TRENDS = [
  {label:"Nov",value:340},{label:"Dec",value:520},{label:"Jan",value:480},{label:"Feb",value:710},{label:"Mar",value:920},{label:"Apr",value:840},
];
const POPULAR_FIELDS = [
  {label:"Software Dev",value:142},{label:"Data Science",value:98},{label:"UI/UX Design",value:76},
  {label:"Cloud/DevOps",value:61},{label:"Cybersecurity",value:43},{label:"Mobile Dev",value:38},
];

const SUMMARY_STATS = [
  { label:"Students Registered",   value:"1,842", delta:"+12%",  color:"text-violet-400" },
  { label:"Companies Verified",    value:"89",    delta:"+8%",   color:"text-sky-400" },
  { label:"Internships Posted",    value:"389",   delta:"+15%",  color:"text-emerald-400" },
  { label:"Applications Submitted",value:"6,284", delta:"+21%",  color:"text-amber-400" },
  { label:"Acceptance Rate",       value:"34%",   delta:"+3%",   color:"text-rose-400" },
  { label:"Avg Apps/Listing",      value:"16.1",  delta:"+5%",   color:"text-cyan-400" },
];

const Reports = () => {
  const [period, setPeriod] = useState("6m");

  return (
    <Page>
      <SectionHeader title="Reports & Analytics" subtitle="Platform-wide performance overview"
        action={
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {["1m","3m","6m","1y"].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${period===p ? "bg-violet-600 text-white" : "bg-[#161b27] border border-white/5 text-zinc-500 hover:text-white"}`}>
                  {p}
                </button>
              ))}
            </div>
            <Btn variant="secondary" size="sm">
              <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={13} />
              Export PDF
            </Btn>
            <Btn variant="secondary" size="sm">
              <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={13} />
              Export CSV
            </Btn>
          </div>
        }
      />

      {/* Summary stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {SUMMARY_STATS.map(s => (
          <div key={s.label} className="bg-[#161b27] border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-zinc-600 font-medium mt-0.5 leading-snug">{s.label}</p>
            <p className="text-[10px] text-emerald-400 font-semibold mt-1">{s.delta}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-5">
        <BarChart data={INTERNSHIP_GROWTH}  color="#7c3aed" label="Internship Growth (Monthly)" />
        <BarChart data={STUDENT_ENGAGEMENT} color="#0ea5e9" label="Student Engagement (Sessions)" />
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-5">
        <BarChart data={ACTIVE_COMPANIES} color="#10b981" label="Active Companies" />
        <BarChart data={APP_TRENDS}       color="#f59e0b" label="Application Trends" />
      </div>

      {/* Popular fields */}
      <div className="bg-[#161b27] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Most Popular Internship Fields</p>
          <span className="text-xs text-zinc-600">By applications</span>
        </div>
        <HBarChart data={POPULAR_FIELDS} color="#7c3aed" />
      </div>
    </Page>
  );
};

export default Reports;