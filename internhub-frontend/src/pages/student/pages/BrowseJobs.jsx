import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { getJobs } from "../../../services/api";

const BrowseJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchJobs(); }, [search, location, type, pageNum]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobs({ search, location, type, page: pageNum });
      const payload = res.data;
      setJobs((payload.data || []).map(normalizeJob));
      setTotalPages(payload.last_page || 1);
      setTotalJobs(payload.total || 0);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeJob = (job) => ({
    ...job,
    company_name: resolveCompanyName(job),
    deadline: job.deadline
      ? (typeof job.deadline === "string" ? job.deadline : String(job.deadline))
      : null,
  });

  const resolveCompanyName = (job) => {
    if (!job.company) return "Unknown Company";
    if (typeof job.company === "string") return job.company;
    if (typeof job.company === "object" && job.company !== null) {
      return job.company.name ?? job.company.company_name ?? "Unknown Company";
    }
    return "Unknown Company";
  };

  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))];

  const goToDetail = (job) => {
    // Pass job via router location state
    navigate("/student/dashboard/job-detail", { state: { job } });
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Browse Internships</h2>
        <p className="text-sm text-gray-400 mt-1">
          {totalJobs} {totalJobs === 1 ? "opportunity" : "opportunities"} available
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPageNum(1); }}
          placeholder="Search jobs or companies..."
          className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        <select value={location} onChange={e => { setLocation(e.target.value); setPageNum(1); }}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">
          <option value="">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={type} onChange={e => { setType(e.target.value); setPageNum(1); }}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">
          <option value="">All Types</option>
          <option value="Remote">Remote</option>
          <option value="On-site">On-site</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      </div>

      {/* Job list */}
      <div className="space-y-3">
        {loading && (
          <div className="text-center py-10 text-gray-400 text-sm">Loading internships…</div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-gray-400 text-sm">No internships found.</p>
            {(search || location || type) && (
              <button onClick={() => { setSearch(""); setLocation(""); setType(""); setPageNum(1); }}
                className="text-xs text-indigo-600 underline hover:text-indigo-700">
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && jobs.map(job => (
          <div key={job.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-indigo-100 transition-all duration-200"
            onClick={() => goToDetail(job)}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{job.title}</p>
                <p className="text-sm text-gray-400 mt-0.5">{job.company_name}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {job.location && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">{job.type}</span>
                  )}
                  {job.salary && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">{job.salary}</span>
                  )}
                  {job.deadline && (
                    <span className="text-xs text-gray-400">Deadline: {job.deadline}</span>
                  )}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); goToDetail(job); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex-shrink-0">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          <button disabled={pageNum <= 1} onClick={() => setPageNum(p => p - 1)}
            className="px-3 py-1.5 rounded-lg border text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition">
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - pageNum) <= 1)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…"
                ? <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-gray-400 text-sm">…</span>
                : <button key={p} onClick={() => setPageNum(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${p === pageNum ? "bg-indigo-600 text-white" : "border text-gray-600 hover:bg-gray-50"
                    }`}>{p}</button>
            )}
          <button disabled={pageNum >= totalPages} onClick={() => setPageNum(p => p + 1)}
            className="px-3 py-1.5 rounded-lg border text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition">
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;