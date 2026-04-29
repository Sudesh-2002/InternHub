// src/pages/company/pages/ManageJobs.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ico, StatusBadge, ConfirmModal } from "../components/Shared";
import { typeColors } from "../data/mockData";

const ManageJobs = ({ jobs, setJobs, toast }) => {
  const navigate = useNavigate();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [confirm, setConfirm] = useState(null);

  const filtered = jobs.filter(j =>
    (filter === "all" || j.status === filter) &&
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  const deleteJob = (id) => {
    setJobs(p => p.filter(j => j.id !== id));
    toast("Job deleted successfully", "success");
    setConfirm(null);
  };

  const goToApplicants = (jobId) => {
    navigate(`/company/dashboard/applicants?jobId=${jobId}`);
  };

  return (
    <div className="space-y-6">

      {confirm && (
        <ConfirmModal
          title="Delete Job?"
          body={`Are you sure you want to delete "${confirm.title}"? This cannot be undone.`}
          danger
          onConfirm={() => deleteJob(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Ico
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            size={15} color="#9ca3af"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search job titles…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition" />
        </div>
        <div className="flex gap-2">
          {["all", "approved", "pending", "rejected"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-500 hover:text-gray-800 border border-gray-200"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Position", "Type", "Status", "Applicants", "Posted", ""].map((h, i) => (
                  <th key={i} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4">
                    <p className="text-gray-800 font-medium">{j.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{j.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${typeColors[j.type] || "bg-gray-100 text-gray-500"}`}>
                      {j.type}
                    </span>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={j.status} /></td>
                  <td className="px-6 py-4">
                    <span className="text-gray-800 font-semibold">{j.applicants}</span>
                    <span className="text-gray-400 text-xs ml-1">applicants</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{j.posted}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => goToApplicants(j.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-medium transition">
                        <Ico d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={13} />
                        Applicants
                      </button>
                      <button onClick={() => setConfirm(j)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-medium transition">
                        <Ico d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" size={13} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-sm">
                    No jobs found.
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

export default ManageJobs;