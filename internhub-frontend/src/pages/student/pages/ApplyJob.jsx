import { useState } from "react";
import Icon from "../components/Icon";
import { icons } from "../components/data/mockData";

const ApplyJob = ({ job, setPage }) => {
  const [resume, setResume]       = useState(null);
  const [note, setNote]           = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Icon d={icons.check} size={28} stroke="#16a34a" sw={2.5} />
      </div>
      <h2 className="text-xl font-bold text-gray-800">Application Submitted!</h2>
      <p className="text-sm text-gray-400">We've sent your application to <strong>{job?.company}</strong>.</p>
      <button onClick={() => setPage("applications")}
        className="mt-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition">
        View My Applications
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={() => setPage("job-detail")}
        className="text-sm text-gray-500 hover:text-indigo-600 transition">← Back</button>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Apply for Position</h2>
        <p className="text-sm text-gray-400 mt-1">{job?.title} at {job?.company}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resume (PDF)</label>
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition ${
            resume ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 bg-gray-50"
          }`}>
            <Icon d={icons.upload} size={24} stroke={resume ? "#6366f1" : "#9ca3af"} />
            <span className={`text-sm mt-2 font-medium ${resume ? "text-indigo-600" : "text-gray-400"}`}>
              {resume ? resume.name : "Click to upload your resume"}
            </span>
            {!resume && <span className="text-xs text-gray-300 mt-1">PDF files only</span>}
            <input type="file" accept=".pdf" className="hidden"
              onChange={e => setResume(e.target.files[0])} />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Note <span className="text-gray-300 font-normal">(optional)</span>
          </label>
          <textarea
            value={note} onChange={e => setNote(e.target.value)}
            rows={4} placeholder="Tell the company why you're a great fit..."
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
          />
        </div>

        <button type="submit" disabled={!resume || loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

export default ApplyJob;