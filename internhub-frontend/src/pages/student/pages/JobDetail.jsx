import { useEffect, useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import { icons } from "../components/data/mockData";
import axios from "axios";
import API_BASE_URL from "../../../config";

const JobDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const job = location.state?.job;

  const [applied, setApplied] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!job?.id) { setLoading(false); return; }

    const checkApplication = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/student/applications/check/${job.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setApplied(res.data.applied);
        setStatus(res.data.status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkApplication();
  }, [job?.id]);

  if (!job) return <Navigate to="/student/dashboard/browse" replace />;

  const getStatusMessage = () => {
    if (status === "pending") return "Application submitted — waiting for company response";
    if (status === "reviewed") return "Your application is being reviewed";
    if (status === "accepted") return "Congratulations! You've been selected";
    if (status === "rejected") return "Application not selected";
    return "Already applied";
  };

  return (
    <div className="space-y-6">

      <button onClick={() => navigate("/student/dashboard/browse")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition">
        ← Back to Browse
      </button>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">

        <div className="flex items-start gap-4">
          <Avatar initials={job.company_name?.slice(0, 2).toUpperCase() || "??"} color="bg-indigo-100 text-indigo-700" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.company_name}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {job.location && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Icon d={icons.map} size={12} /> {job.location}
                </span>
              )}
              {job.type && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.type === "Remote"
                  ? "bg-sky-50 text-sky-600"
                  : job.type === "Hybrid"
                    ? "bg-violet-50 text-violet-600"
                    : "bg-emerald-50 text-emerald-600"
                  }`}>
                  {job.type}
                </span>
              )}
              {job.salary && (
                <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">
                  {job.salary}
                </span>
              )}
              {job.deadline && (
                <span className="text-xs text-gray-400">Deadline: {job.deadline}</span>
              )}
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {job.description && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">About the Role</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
          </div>
        )}

        {job.requirements && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Requirements</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{job.requirements}</p>
          </div>
        )}

        {job.duration && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" size={14} />
            Duration: <span className="font-medium text-gray-700">{job.duration}</span>
          </div>
        )}

        {job.vacancies && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={14} />
            Vacancies: <span className="font-medium text-gray-700">{job.vacancies}</span>
          </div>
        )}

        {/* Application status banner */}
        {applied && (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm">
            {getStatusMessage()}
          </div>
        )}

        {/* CTA Button */}
        <div className="pt-2">
          {loading ? (
            <div className="text-sm text-gray-400">Checking application status…</div>
          ) : applied ? (
            <button disabled
              className="w-full py-3 bg-gray-200 text-gray-500 font-semibold text-sm rounded-xl cursor-not-allowed">
              Already Applied
            </button>
          ) : (
            <button
              onClick={() => navigate("/student/dashboard/apply", { state: { job } })}
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