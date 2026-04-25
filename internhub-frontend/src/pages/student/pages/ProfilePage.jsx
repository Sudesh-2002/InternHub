import { useState } from "react";
import Icon from "../components/Icon";
import { icons } from "../components/data/mockData";

const ProfilePage = ({ user }) => {
  const [skills, setSkills]       = useState("React, Node.js, Tailwind CSS, Python");
  const [education, setEducation] = useState("BSc Computer Science, University of Colombo, 2022–2026");
  const [saved, setSaved]         = useState(false);
  const [resume, setResume]       = useState(null);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-400 mt-1">Manage your information and resume.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
          {user?.name?.charAt(0) || "S"}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Student</span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
        <h3 className="font-semibold text-gray-800">Edit Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
          <textarea value={skills} onChange={e => setSkills(e.target.value)} rows={3}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
          <textarea value={education} onChange={e => setEducation(e.target.value)} rows={3}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resume (PDF)</label>
          <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition ${
            resume ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 bg-gray-50"
          }`}>
            <Icon d={icons.upload} size={16} stroke={resume ? "#6366f1" : "#9ca3af"} />
            <span className={`text-sm ${resume ? "text-indigo-600 font-medium" : "text-gray-400"}`}>
              {resume ? resume.name : "Upload / update resume"}
            </span>
            <input type="file" accept=".pdf" className="hidden" onChange={e => setResume(e.target.files[0])} />
          </label>
        </div>

        <button onClick={handleSave}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition">
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;