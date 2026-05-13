// src/pages/admin/pages/Reports.jsx

import { useState, useEffect, useCallback } from "react";
import { Page, SectionHeader, Btn, Ico, useToast, Toast } from "../components/Shared";

const API = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

/* ── Colour map ─────────────────────────────────────────────────── */
const COLOR = {
  violet:  "#7c3aed",
  sky:     "#0ea5e9",
  emerald: "#10b981",
  amber:   "#f59e0b",
  rose:    "#f43f5e",
  cyan:    "#06b6d4",
};

/* ── Bar chart (vertical) ───────────────────────────────────────── */
const BarChart = ({ data, color, label }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-full">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">{label}</p>
      <div className="flex items-end gap-1.5" style={{ height: 120 }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-gray-500 font-semibold">{d.value || ""}</span>
            <div className="w-full rounded-t-lg transition-all duration-700"
              style={{ height: `${Math.max((d.value / max) * 100, 4)}%`, background: color, opacity: 0.55 + (i / data.length) * 0.45 }} />
            <span className="text-[9px] text-gray-400 font-medium">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Horizontal bar chart ───────────────────────────────────────── */
const HBarChart = ({ data, color, label }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-full">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">{label}</p>
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 font-medium w-32 truncate flex-shrink-0">{d.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(d.value / max) * 100}%`, background: color }} />
            </div>
            <span className="text-xs font-bold text-gray-500 w-8 text-right flex-shrink-0">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Donut chart (pure SVG) ─────────────────────────────────────── */
const DonutChart = ({ data, label }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 48, cx = 60, cy = 60, strokeW = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map(d => {
    const pct  = d.value / total;
    const dash = pct * circumference;
    const seg  = { ...d, dashArray: `${dash} ${circumference - dash}`, dashOffset: -offset };
    offset += dash;
    return seg;
  });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm h-full">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">{label}</p>
      <div className="flex items-center gap-6">
        <svg width={120} height={120} viewBox="0 0 120 120" className="flex-shrink-0">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeW} />
          {segments.map((seg, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={strokeW}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              style={{ transition: "stroke-dasharray 0.7s ease" }}
              transform={`rotate(-90 ${cx} ${cy})`} />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1f2937">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#9ca3af">total</text>
        </svg>
        <div className="space-y-2 flex-1">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                <span className="text-xs text-gray-600 font-medium">{seg.label}</span>
              </div>
              <span className="text-xs font-bold text-gray-500">{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Summary tile ───────────────────────────────────────────────── */
const SummaryTile = ({ label, value, color }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
    <p className="text-2xl font-bold tracking-tight" style={{ color: COLOR[color] || color }}>{value}</p>
    <p className="text-[10px] text-gray-500 font-semibold mt-1 leading-snug uppercase tracking-wide">{label}</p>
  </div>
);

/* ── Sparkline ──────────────────────────────────────────────────── */
const Sparkline = ({ data, color }) => {
  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 100, h = 36;
  const pts = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * w;
    const y = h - ((v - min) / range) * h * 0.85 - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity="0.08" stroke="none" />
    </svg>
  );
};

/* ── Skeleton loader ────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="space-y-5 animate-pulse">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
    </div>
    <div className="grid lg:grid-cols-2 gap-5">
      {[...Array(4)].map((_, i) => <div key={i} className="h-52 bg-gray-100 rounded-2xl" />)}
    </div>
  </div>
);

/* ── Export CSV helper ──────────────────────────────────────────── */
const exportCSV = (summary) => {
  const rows = [["Metric", "Value"], ...summary.map(s => [s.label, s.value])];
  const csv  = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "internhub_report.csv"; a.click();
  URL.revokeObjectURL(url);
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
const Reports = () => {
  const [period,  setPeriod]  = useState("6m");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, add: toast, remove } = useToast();

  const fetchData = useCallback(async (p) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/reports?period=${p}`, { headers: authHeaders() });
      const json = await res.json();
      if (res.ok) setData(json);
      else toast(json.message || "Failed to load analytics", "error");
    } catch {
      toast("Network error — could not load analytics", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(period); }, [period, fetchData]);

  const PERIODS = ["1m", "3m", "6m", "1y"];

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      {/* ── Header ── */}
      <SectionHeader
        title="Reports & Analytics"
        subtitle="Platform-wide performance metrics based on live database data"
        action={
          <div className="flex items-center gap-2">
            {/* Period picker */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
                    period === p ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
            <Btn variant="secondary" size="sm" onClick={() => data && exportCSV(data.summary)} disabled={!data}>
              <Ico d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" size={13} />
              Export CSV
            </Btn>
          </div>
        }
      />

      {loading ? <Skeleton /> : !data ? (
        <div className="py-20 text-center text-gray-400">Failed to load analytics</div>
      ) : (
        <>
          {/* ── Summary KPI tiles ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.summary.map(s => <SummaryTile key={s.label} {...s} />)}
          </div>

          {/* ── Monthly growth charts ── */}
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Student registrations with sparkline header */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Student Registrations</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {data.charts.students.reduce((s, d) => s + d.value, 0)}
                    <span className="text-sm font-medium text-gray-400 ml-2">this period</span>
                  </p>
                </div>
                <Sparkline data={data.charts.students} color={COLOR.violet} />
              </div>
              <div className="flex items-end gap-1.5" style={{ height: 100 }}>
                {data.charts.students.map((d, i) => {
                  const max = Math.max(...data.charts.students.map(x => x.value), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-md transition-all duration-700"
                        style={{ height: `${Math.max((d.value / max) * 90, 3)}%`, background: COLOR.violet, opacity: 0.55 + (i / data.charts.students.length) * 0.45 }} />
                      <span className="text-[9px] text-gray-400 font-medium">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Company signups */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Company Sign-ups</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {data.charts.companies.reduce((s, d) => s + d.value, 0)}
                    <span className="text-sm font-medium text-gray-400 ml-2">this period</span>
                  </p>
                </div>
                <Sparkline data={data.charts.companies} color={COLOR.sky} />
              </div>
              <div className="flex items-end gap-1.5" style={{ height: 100 }}>
                {data.charts.companies.map((d, i) => {
                  const max = Math.max(...data.charts.companies.map(x => x.value), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-md transition-all duration-700"
                        style={{ height: `${Math.max((d.value / max) * 90, 3)}%`, background: COLOR.sky, opacity: 0.55 + (i / data.charts.companies.length) * 0.45 }} />
                      <span className="text-[9px] text-gray-400 font-medium">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Internship + Application charts ── */}
          <div className="grid lg:grid-cols-2 gap-5">
            <BarChart data={data.charts.internships}  color={COLOR.emerald} label="Internship Postings (Monthly)" />
            <BarChart data={data.charts.applications} color={COLOR.amber}   label="Applications Submitted (Monthly)" />
          </div>

          {/* ── Breakdowns row ── */}
          <div className="grid lg:grid-cols-3 gap-5">
            <DonutChart data={data.status_breakdown} label="Application Status Breakdown" />
            <HBarChart  data={data.type_breakdown}   color={COLOR.violet}  label="Internship Types" />
            <HBarChart  data={data.top_locations}    color={COLOR.cyan}    label="Top Locations" />
          </div>

          {/* ── Top companies ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Most Active Companies</p>
              <span className="text-xs text-gray-400">By listings posted</span>
            </div>
            <div className="space-y-3">
              {data.top_companies.map((c, i) => {
                const max = Math.max(...data.top_companies.map(x => x.value), 1);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 w-4">{i + 1}</span>
                    <span className="text-xs text-gray-700 font-semibold w-40 truncate flex-shrink-0">{c.label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(c.value / max) * 100}%`, background: "linear-gradient(90deg, #7c3aed, #6366f1)" }} />
                    </div>
                    <span className="text-xs font-bold text-indigo-600 w-8 text-right">{c.value}</span>
                  </div>
                );
              })}
              {data.top_companies.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </Page>
  );
};

export default Reports;