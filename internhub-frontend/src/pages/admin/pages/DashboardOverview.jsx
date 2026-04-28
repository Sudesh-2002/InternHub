// src/pages/admin/pages/DashboardOverview.jsx

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Page, StatCard, SectionHeader, Ico, Badge, Avatar } from "../components/Shared";

// ── Mini bar chart (CSS only) ─────────────────────────────────────────────────
const BarChart = ({ data, color = "#7c3aed" }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md transition-all duration-500"
            style={{ height: `${(d.value / max) * 80}px`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }} />
          <span className="text-[9px] text-zinc-600 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Line sparkline ────────────────────────────────────────────────────────────
const Sparkline = ({ data, color = "#7c3aed" }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120, h = 40;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h * 0.9 - 2;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${points} ${w},${h}`}
        fill={color} fillOpacity="0.08" stroke="none" />
    </svg>
  );
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const RECENT_STUDENTS = [
  { name: "Asel Perera",     email: "asel@gmail.com",   university: "UoM",   date: "Apr 26" },
  { name: "Kasun Silva",     email: "kasun@gmail.com",  university: "SLIIT", date: "Apr 25" },
  { name: "Nimasha F.",      email: "nima@gmail.com",   university: "UoC",   date: "Apr 24" },
  { name: "Dinesh R.",       email: "din@gmail.com",    university: "NSBM",  date: "Apr 23" },
];

const RECENT_INTERNSHIPS = [
  { title: "Frontend Intern",    company: "TechCorp",   status: "pending",  date: "Apr 26" },
  { title: "UI/UX Design Intern",company: "DesignHub",  status: "approved", date: "Apr 25" },
  { title: "Data Analyst Intern",company: "DataFlow",   status: "pending",  date: "Apr 24" },
  { title: "Backend Engineer",   company: "CloudBase",  status: "approved", date: "Apr 22" },
];

const MONTH_DATA = [
  { label: "Nov", value: 32 }, { label: "Dec", value: 48 }, { label: "Jan", value: 41 },
  { label: "Feb", value: 65 }, { label: "Mar", value: 80 }, { label: "Apr", value: 74 },
];

const COMPANY_DATA = [
  { label: "Nov", value: 4 }, { label: "Dec", value: 7 }, { label: "Jan", value: 5 },
  { label: "Feb", value: 12 }, { label: "Mar", value: 9 }, { label: "Apr", value: 15 },
];

const SPARKLINE_DATA = [22, 35, 28, 45, 40, 58, 52, 68, 61, 74];

const SYSTEM_NOTIFS = [
  { msg: "3 companies awaiting verification", type: "warning", time: "Just now" },
  { msg: "2 new abuse reports filed",         type: "error",   time: "1h ago" },
  { msg: "Server backup completed",           type: "success", time: "3h ago" },
  { msg: "5 internships pending approval",    type: "info",    time: "5h ago" },
];

// ─────────────────────────────────────────────────────────────────────────────
const DashboardOverview = () => {
  const stats = [
    { label: "Total Students",    value: 1842, color: "violet", delta: 12, icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
    { label: "Total Companies",   value: 134,  color: "sky",    delta: 8,  icon: "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" },
    { label: "Total Internships", value: 389,  color: "emerald",delta: 15, icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
    { label: "Pending Approvals", value: 18,   color: "amber",  delta: -3, icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
    { label: "Active Internships",value: 241,  color: "cyan",   delta: 5,  icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
    { label: "Total Applications",value: 6284, color: "rose",   delta: 21, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" },
  ];

  return (
    <Page>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
            Dashboard Overview
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-600 font-medium">Last updated</p>
          <p className="text-xs text-zinc-400">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Student registrations */}
        <div className="bg-[#161b27] border border-white/5 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Student Registrations</p>
              <p className="text-2xl font-bold text-white mt-1">+74 <span className="text-sm text-emerald-400 font-semibold">this month</span></p>
            </div>
            <Sparkline data={SPARKLINE_DATA} color="#7c3aed" />
          </div>
          <BarChart data={MONTH_DATA} color="#7c3aed" />
        </div>

        {/* Company signups */}
        <div className="bg-[#161b27] border border-white/5 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Company Sign-ups</p>
              <p className="text-2xl font-bold text-white mt-1">+15 <span className="text-sm text-sky-400 font-semibold">this month</span></p>
            </div>
            <Sparkline data={[4,7,5,12,9,15,11,18,14,20]} color="#0ea5e9" />
          </div>
          <BarChart data={COMPANY_DATA} color="#0ea5e9" />
        </div>

        {/* System notifications */}
        <div className="bg-[#161b27] border border-white/5 rounded-2xl p-5">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">System Alerts</p>
          <div className="space-y-3">
            {SYSTEM_NOTIFS.map((n, i) => {
              const iconColor = { warning:"text-amber-400", error:"text-red-400", success:"text-emerald-400", info:"text-sky-400" }[n.type];
              const bgColor   = { warning:"bg-amber-500/10", error:"bg-red-500/10", success:"bg-emerald-500/10", info:"bg-sky-500/10" }[n.type];
              const dotD = n.type === "success" ? "M20 6L9 17l-5-5" : n.type === "error" ? "M18 6L6 18M6 6l12 12" : "M12 8v4m0 4h.01";
              return (
                <div key={i} className={`flex items-start gap-3 p-3 ${bgColor} rounded-xl`}>
                  <Ico d={dotD} size={13} color="" className={`${iconColor} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 leading-snug">{n.msg}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending widgets */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Pending verifications */}
        <div className="bg-[#161b27] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Awaiting Verification</p>
            <NavLink to="/admin/dashboard/verification" className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition">View all →</NavLink>
          </div>
          <div className="space-y-3">
            {["TechCorp Solutions","CloudBase Ltd","DataFlow Inc"].map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <Avatar name={c} size={8} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{c}</p>
                  <p className="text-xs text-zinc-600">Submitted {i + 1}d ago</p>
                </div>
                <Badge status="pending" />
              </div>
            ))}
          </div>
          <div className="mt-4 bg-amber-500/8 border border-amber-500/15 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Ico d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={14} color="" className="text-amber-400" />
            <p className="text-xs text-amber-400 font-semibold">3 companies need review</p>
          </div>
        </div>

        {/* Recent students */}
        <div className="bg-[#161b27] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recent Registrations</p>
            <NavLink to="/admin/dashboard/students" className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition">View all →</NavLink>
          </div>
          <div className="space-y-3">
            {RECENT_STUDENTS.map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <Avatar name={s.name} size={8} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{s.name}</p>
                  <p className="text-xs text-zinc-600">{s.university} · {s.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent internships */}
        <div className="bg-[#161b27] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recent Internship Posts</p>
            <NavLink to="/admin/dashboard/internships" className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition">View all →</NavLink>
          </div>
          <div className="space-y-3">
            {RECENT_INTERNSHIPS.map((j, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{j.title}</p>
                  <p className="text-xs text-zinc-600">{j.company} · {j.date}</p>
                </div>
                <Badge status={j.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default DashboardOverview;