import { useState } from "react";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import { MOCK_JOBS, avatarColors, icons } from "../components/data/mockData";

const BrowseJobs = ({ setPage, setSelectedJob }) => {
  const [search, setSearch]     = useState("");
  const [location, setLocation] = useState("");
  const [type, setType]         = useState("");
  const [page, setPageNum]      = useState(1);
  const PER_PAGE = 4;

  const filtered = MOCK_JOBS.filter(j => {
    const matchSearch   = j.title.toLowerCase().includes(search.toLowerCase()) ||
                          j.company.toLowerCase().includes(search.toLowerCase());
    const matchLocation = !location || j.location === location;
    const matchType     = !type || j.type === type;
    return matchSearch && matchLocation && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const locations  = [...new Set(MOCK_JOBS.map(j => j.location))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Browse Internships</h2>
        <p className="text-sm text-gray-400 mt-1">{filtered.length} opportunities available</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon d={icons.browse} size={16} />
          </span>
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPageNum(1); }}
            placeholder="Search jobs or companies..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <select value={location} onChange={e => { setLocation(e.target.value); setPageNum(1); }}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
          <option value="">All Locations</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={type} onChange={e => { setType(e.target.value); setPageNum(1); }}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
          <option value="">All Types</option>
          <option value="remote">Remote</option>
          <option value="on-site">On-site</option>
        </select>
      </div>

      <div className="space-y-3">
        {paginated.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">No jobs found.</div>
        )}
        {paginated.map((job, i) => (
          <div key={job.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-sm transition cursor-pointer"
            onClick={() => { setSelectedJob(job); setPage("job-detail"); }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Avatar initials={job.logo} color={avatarColors[i % avatarColors.length]} />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{job.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{job.company}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Icon d={icons.map} size={12} /> {job.location}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      job.type === "remote" ? "bg-sky-50 text-sky-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">{job.posted}</p>
                <button
                  onClick={e => { e.stopPropagation(); setSelectedJob(job); setPage("job-detail"); }}
                  className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-medium transition">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPageNum(p)}
              className={`w-8 h-8 text-sm rounded-lg font-medium transition ${
                p === page ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;