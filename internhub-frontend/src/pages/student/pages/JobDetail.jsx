import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import { MOCK_APPLICATIONS, icons } from "../components/data/mockData";

const JobDetail = ({ job, setPage, setSelectedJob }) => {
  if (!job) return null;
  const alreadyApplied = MOCK_APPLICATIONS.some(a => a.title === job.title);

  return (
    <div className="space-y-6">
      <button onClick={() => setPage("browse")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition">
        ← Back to Browse
      </button>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-4">
          <Avatar initials={job.logo} color="bg-indigo-100 text-indigo-700" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Icon d={icons.map} size={12} /> {job.location}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                job.type === "remote" ? "bg-sky-50 text-sky-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                {job.type}
              </span>
              <span className="text-xs text-gray-400">{job.posted}</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">About the Role</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
        </div>

        <div className="pt-2">
          {alreadyApplied ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-100 px-4 py-3 rounded-xl text-sm font-medium">
              <Icon d={icons.check} size={16} /> Already applied
            </div>
          ) : (
            <button
              onClick={() => { setSelectedJob(job); setPage("apply"); }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition">
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;