// src/pages/company/pages/Applicants.jsx

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Ico, StatusBadge } from "../components/Shared";
import { avatarColors } from "../data/mockData";

const Applicants = ({ applicants, setApplicants, jobs, toast }) => {
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get("jobId");

  const [jobFilter, setJobFilter]       = useState(jobIdParam ? Number(jobIdParam) : "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]             = useState("");

  // Sync filter when URL param changes (e.g. navigating from ManageJobs)
  useEffect(() => {
    setJobFilter(jobIdParam ? Number(jobIdParam) : "all");
  }, [jobIdParam]);

  const filtered = applicants.filter(a =>
    (jobFilter === "all" || a.jobId === jobFilter) &&
    (statusFilter === "all" || a.status === statusFilter) &&
    (
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
    )
  );

  const updateStatus = (id, status) => {
    setApplicants(p => p.map(a => a.id === id ? { ...a, status } : a));
    toast(`Application marked as ${status}`, "success");
  };

  const actionBtn = (label, status, id, cls) => (
    <button onClick={() => updateStatus(id, status)}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${cls}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-6">

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Ico
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            size={15} color="#9ca3af"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search applicants…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition" />
        </div>

        <select
          value={jobFilter}
          onChange={e => setJobFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="bg-white border border-gray-200 rounded-xl text-sm text-gray-700 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition">
          <option value="all">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>

        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "accepted", "reviewed", "rejected"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-500 hover:text-gray-800 border border-gray-200"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <span className="text-sm text-gray-500">
            <span className="text-gray-800 font-semibold">{filtered.length}</span> applicants
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Applicant", "Applied For", "University", "Status", "Applied", "Actions"].map(h => (
                  <th key={h}
                    className={`px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-widest ${
                      h === "Actions" ? "text-right" : "text-left"
                    }`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const job = jobs.find(j => j.id === a.jobId);
                return (
                  <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {a.avatar}
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">{a.name}</p>
                          <p className="text-gray-400 text-xs">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs max-w-[160px]">
                      <span className="line-clamp-2">{job?.title || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 text-xs">{a.university}</p>
                      <p className="text-gray-400 text-xs">GPA {a.gpa}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{a.applied}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end flex-wrap">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-sky-100 text-gray-600 hover:text-sky-700 rounded-lg text-xs font-medium transition">
                          <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={13} />
                          Resume
                        </button>
                        {a.status !== "accepted" &&
                          actionBtn("Accept", "accepted", a.id, "bg-emerald-50 text-emerald-700 hover:bg-emerald-100")}
                        {a.status !== "rejected" &&
                          actionBtn("Reject", "rejected", a.id, "bg-red-50 text-red-600 hover:bg-red-100")}
                        {a.status === "pending" &&
                          actionBtn("Review", "reviewed", a.id, "bg-blue-50 text-blue-600 hover:bg-blue-100")}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-sm">
                    No applicants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Applicants;