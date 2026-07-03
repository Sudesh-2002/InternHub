import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Ico, StatusBadge } from "../components/Shared";
import API_BASE_URL from "../../../config";

const API_BASE = API_BASE_URL;
const token = () => localStorage.getItem("token");
const api = (path, opts = {}) =>
  axios({ url: `${API_BASE}${path}`, headers: { Authorization: `Bearer ${token()}` }, ...opts });

const AVATAR_COLORS = [
  "bg-indigo-600", "bg-sky-600", "bg-emerald-600",
  "bg-amber-600", "bg-rose-600", "bg-violet-600",
];

const Applicants = ({ toast }) => {
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get("jobId");

  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [jobFilter, setJobFilter] = useState(jobIdParam ?? "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { setJobFilter(jobIdParam ?? "all"); }, [jobIdParam]);
  useEffect(() => { setPage(1); }, [jobFilter, statusFilter, search]);

  useEffect(() => {
    api("/company/manage-jobs")
      .then(r => {
        const raw = r.data;
        setJobs(Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []));
      })
      .catch(() => { });
  }, []);

  //  Fetch applicants 
  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page };
      if (jobFilter !== "all") params.job_id = jobFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;

      const res = await api("/company/applications", { params });
      setApplicants(res.data.data || []);
      setMeta(res.data.meta || null);
    } catch {
      toast?.("Failed to load applicants", "error");
    } finally {
      setLoading(false);
    }
  }, [jobFilter, statusFilter, search, page]);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await api(`/company/applications/${id}/status`, {
        method: "PATCH",
        data: { status },
      });
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast?.(`Application marked as ${status}`, "success");
    } catch {
      toast?.("Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const actionBtn = (label, status, id, cls) => (
    <button
      key={label}
      onClick={() => updateStatus(id, status)}
      disabled={updatingId === id}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${cls}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Ico
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            size={15} color="#9ca3af"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search applicants…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
          />
        </div>

        <select
          value={jobFilter}
          onChange={e => setJobFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl text-sm text-gray-700 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
        >
          <option value="all">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>

        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "reviewed", "accepted", "rejected"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition ${statusFilter === s
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-500 hover:text-gray-800 border border-gray-200"
                }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            <span className="text-gray-800 font-semibold">{meta?.total ?? applicants.length}</span> applicants
          </span>
          {loading && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3.5 h-3.5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
              Loading…
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Applicant", "Applied For", "University", "Status", "Applied", "Actions"].map(h => (
                  <th key={h}
                    className={`px-6 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-widest ${h === "Actions" ? "text-right" : "text-left"
                      }`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applicants.map((a, i) => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                        {a.avatar_url
                          ? <img src={a.avatar_url} alt={a.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                          : a.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{a.name}</p>
                        <p className="text-gray-400 text-xs">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs max-w-[160px]">
                    <span className="line-clamp-2">{a.job || "—"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700 text-xs">{a.university || "—"}</p>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{a.applied}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      {a.resume_url && (
                        <a href={a.resume_url} target="_blank" rel="noreferrer">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-sky-100 text-gray-600 hover:text-sky-700 rounded-lg text-xs font-medium transition">
                            <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"]} size={13} />
                            Resume
                          </button>
                        </a>
                      )}
                      {a.status !== "accepted" && actionBtn("Accept", "accepted", a.id, "bg-emerald-50 text-emerald-700 hover:bg-emerald-100")}
                      {a.status !== "rejected" && actionBtn("Reject", "rejected", a.id, "bg-red-50 text-red-600 hover:bg-red-100")}
                      {a.status === "pending" && actionBtn("Review", "reviewed", a.id, "bg-blue-50 text-blue-600 hover:bg-blue-100")}
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && applicants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-sm">
                    No applicants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing {meta.from}–{meta.to} of {meta.total}
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                {meta.current_page} / {meta.last_page}
              </span>
              <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;