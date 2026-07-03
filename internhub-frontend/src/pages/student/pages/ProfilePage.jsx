import { useState, useEffect, useRef } from "react";
import Icon from "../components/Icon";
import { icons } from "../components/data/mockData";
import { fetchProfile, updateProfile, uploadResume, deleteResume, uploadAvatar, deleteAvatar } from "../../../services/api";
import Toast from "../../../components/Toast";
import { useAuth } from "../../../context/AuthContext";
import PasswordStrengthChecker, { isPasswordStrong } from "../../../components/PasswordStrengthChecker";
import API_BASE_URL from "../../../config";

const Section = ({ title, action, children }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const SkillBadge = ({ label, onRemove }) => (
  <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
    {label}
    {onRemove && (
      <button onClick={() => onRemove(label)} className="hover:text-indigo-900">
        <Icon d={icons.x} size={11} sw={2.5} />
      </button>
    )}
  </span>
);

const Modal = ({ title, onClose, onSave, children }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <Icon d={icons.x} size={18} />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
      <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition">
          Cancel
        </button>
        <button onClick={onSave}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition">
          Save
        </button>
      </div>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props}
    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
);

const Textarea = (props) => (
  <textarea {...props}
    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" />
);

const ProfilePage = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [avatarError, setAvatarError] = useState(false);
  const avatarRef = useRef();
  const { refreshUser } = useAuth();

  // Password change state
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((profile) => {
        setData({
          ...profile,
          skills: profile.skills || [],
          education: profile.education || [],
          experience: profile.experience || [],
          projects: profile.projects || [],
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const openModal = (key, initial = {}) => { setDraft(initial); setModal(key); };
  const closeModal = () => setModal(null);

  const showToast = (message, type = "success") => setToast({ message, type });
  const hideToast = () => setToast(null);

  const handlePasswordChange = async () => {
    setPwError("");
    if (!isPasswordStrong(pwForm.new_password)) {
      return setPwError("Password does not meet the requirements below.");
    }
    if (pwForm.new_password !== pwForm.new_password_confirmation) {
      return setPwError("New passwords do not match.");
    }
    setPwSaving(true);
    const token = localStorage.getItem("token") ?? "";
    try {
      const res = await fetch(`${API_BASE_URL}/profile/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: pwForm.current_password,
          new_password: pwForm.new_password,
          new_password_confirmation: pwForm.new_password_confirmation,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPwError(json.message || "Failed to change password.");
      } else {
        showToast("Password changed successfully.", "success");
        closeModal();
        setPwForm({ current_password: "", new_password: "", new_password_confirmation: "" });
      }
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwSaving(false);
    }
  };

  //  Sync to server 
  const syncToServer = async (newData) => {
    setSaving(true);
    showToast("Saving…", "loading");
    try {
      await updateProfile({
        name: newData.name,
        phone: newData.phone,
        location: newData.location,
        summary: newData.summary,
        skills: newData.skills,
        education: newData.education,
        experience: newData.experience,
        projects: newData.projects,
        github: newData.github,
        linkedin: newData.linkedin,
        portfolio: newData.portfolio,
      });
      setData(newData);
      showToast("Changes saved", "success");
    } catch (err) {
      showToast("Failed to save. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const editBtn = (key, initial) => (
    <button onClick={() => openModal(key, initial)}
      className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-700 transition">
      <Icon d={icons.edit} size={13} /> Edit
    </button>
  );

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || data.skills.includes(s)) { setSkillInput(""); return; }
    const newData = { ...data, skills: [...data.skills, s] };
    syncToServer(newData);
    setSkillInput("");
  };

  const removeSkill = (s) => {
    const newData = { ...data, skills: data.skills.filter((x) => x !== s) };
    syncToServer(newData);
  };

  const removeItem = (key, id) => {
    const newData = { ...data, [key]: data[key].filter((i) => i.id !== id) };
    syncToServer(newData);
  };

  const saveItem = (key, item) => {
    const list = data[key];
    const exists = list.find((i) => i.id === item.id);
    const updated = exists
      ? list.map((i) => (i.id === item.id ? item : i))
      : [...list, { ...item, id: Date.now() }];
    const newData = { ...data, [key]: updated };
    syncToServer(newData);
    closeModal();
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setSaving(true);
    showToast("Uploading…", "loading");
    try {
      const res = await uploadAvatar(file);
      setData((prev) => ({ ...prev, avatar_url: res.avatar_url }));
      setAvatarError(false);
      await refreshUser();
      showToast("Profile photo updated.", "success");
    } catch {
      showToast("Avatar upload failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm("Remove your profile photo?")) return;
    setSaving(true);
    showToast("Removing…", "loading");
    try {
      await deleteAvatar();
      setData((prev) => ({ ...prev, avatar_url: null }));
      await refreshUser();
      showToast("Profile photo removed.", "success");
    } catch {
      showToast("Failed to remove photo.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;
    setSaving(true);
    showToast("Saving…", "loading");
    try {
      const res = await uploadResume(file);
      setData((prev) => ({ ...prev, resume_name: res.resume_name, resume_url: res.resume_url }));
      showToast("Changes saved", "success");
    } catch (err) {
      showToast("Resume upload failed. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm("Remove your uploaded resume?")) return;
    setSaving(true);
    showToast("Saving…", "loading");
    try {
      await deleteResume();
      setData((prev) => ({ ...prev, resume_name: null, resume_url: null }));
      showToast("Changes saved", "success");
    } catch (err) {
      showToast("Failed to delete resume.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading your profile…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative flex-shrink-0 group">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-sm">
              {data.avatar_url && !avatarError
                ? <img
                  src={data.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
                : (data.name?.charAt(0) || "S")
              }
            </div>
            <label className="absolute inset-0 flex flex-col items-center justify-center gap-0.5
                              bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100
                              transition cursor-pointer">
              <Icon d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8" size={15} stroke="white" />
              <span className="text-white text-[9px] font-semibold">Change</span>
              <input
                ref={avatarRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => { if (e.target.files[0]) handleAvatarUpload(e.target.files[0]); }}
              />
            </label>
          </div>
          {data.avatar_url && (
            <button onClick={handleAvatarDelete}
              className="text-[10px] text-red-400 hover:text-red-600 transition -mt-3 sm:hidden">
              Remove photo
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{data.location}</p>
              </div>
              {editBtn("basic", { name: data.name, email: data.email, phone: data.phone, location: data.location })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" size={13} />
                {data.email}
              </span>
              {data.phone && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.27 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" size={13} />
                  {data.phone}
                </span>
              )}
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-3">
              {data.github && (
                <a href={data.github} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition">
                  <Icon d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" size={14} />
                  GitHub
                </a>
              )}
              {data.linkedin && (
                <a href={data.linkedin} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition">
                  <Icon d={["M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z", "M2 9h4v12H2z", "M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"]} size={14} />
                  LinkedIn
                </a>
              )}
              {data.portfolio && (
                <a href={data.portfolio} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition">
                  <Icon d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" size={14} />
                  Portfolio
                </a>
              )}
              <button onClick={() => openModal("social", { github: data.github, linkedin: data.linkedin, portfolio: data.portfolio })}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition">
                Edit links
              </button>
            </div>
          </div>
        </div>
      </div>

      <Section title="Professional Summary" action={editBtn("summary", { summary: data.summary })}>
        <p className="text-sm text-gray-600 leading-relaxed">
          {data.summary || <span className="text-gray-300 italic">No summary added yet.</span>}
        </p>
      </Section>

      <Section title="Skills">
        <div className="flex flex-wrap gap-2 mb-4">
          {data.skills.map(s => <SkillBadge key={s} label={s} onRemove={removeSkill} />)}
          {data.skills.length === 0 && <p className="text-sm text-gray-300 italic">No skills added.</p>}
        </div>
        <div className="flex gap-2">
          <input
            value={skillInput} onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add a skill and press Enter"
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <button onClick={addSkill}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition">
            Add
          </button>
        </div>
      </Section>

      <Section title="Education"
        action={
          <button onClick={() => openModal("edu-new", { degree: "", university: "", start: "", end: "", gpa: "" })}
            className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-700">
            + Add
          </button>
        }>
        <div className="space-y-4">
          {data.education.map(e => (
            <div key={e.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon d="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5" size={16} stroke="#6366f1" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{e.degree}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{e.university}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {e.start} – {e.end}
                    {e.gpa && <span className="ml-2 text-indigo-600 font-medium">GPA: {e.gpa}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openModal("edu-edit", { ...e })}
                  className="text-gray-400 hover:text-indigo-600 transition">
                  <Icon d={icons.edit} size={14} />
                </button>
                <button onClick={() => removeItem("education", e.id)}
                  className="text-gray-400 hover:text-red-500 transition">
                  <Icon d={icons.x} size={14} />
                </button>
              </div>
            </div>
          ))}
          {data.education.length === 0 && <p className="text-sm text-gray-300 italic">No education added.</p>}
        </div>
      </Section>

      <Section title="Experience"
        action={
          <button onClick={() => openModal("exp-new", { title: "", company: "", duration: "", description: "" })}
            className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-700">
            + Add
          </button>
        }>
        <div className="space-y-4">
          {data.experience.map(e => (
            <div key={e.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon d={icons.briefcase} size={16} stroke="#059669" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{e.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{e.company} · {e.duration}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">{e.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openModal("exp-edit", { ...e })} className="text-gray-400 hover:text-indigo-600 transition">
                  <Icon d={icons.edit} size={14} />
                </button>
                <button onClick={() => removeItem("experience", e.id)} className="text-gray-400 hover:text-red-500 transition">
                  <Icon d={icons.x} size={14} />
                </button>
              </div>
            </div>
          ))}
          {data.experience.length === 0 && <p className="text-sm text-gray-500 italic">No experience added.</p>}
        </div>
      </Section>

      <Section title="Projects"
        action={
          <button onClick={() => openModal("proj-new", { title: "", description: "", tech: "", github: "" })}
            className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-700">
            + Add
          </button>
        }>
        <div className="space-y-4">
          {data.projects.map(p => (
            <div key={p.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{p.title}</p>
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noreferrer"
                        className="text-xs text-indigo-500 hover:text-indigo-700 transition">
                        GitHub →
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.tech && p.tech.split(",").map(t => (
                      <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openModal("proj-edit", { ...p })} className="text-gray-400 hover:text-indigo-600 transition">
                    <Icon d={icons.edit} size={14} />
                  </button>
                  <button onClick={() => removeItem("projects", p.id)} className="text-gray-400 hover:text-red-500 transition">
                    <Icon d={icons.x} size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {data.projects.length === 0 && <p className="text-sm text-gray-300 italic">No projects added.</p>}
        </div>
      </Section>

      <Section title="Resume / CV">
        <div className="flex flex-col gap-3">
          {data.resume_name ? (
            <div className="flex items-center gap-3 min-w-0 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <Icon d={icons.apps} size={18} stroke="#6366f1" className="flex-shrink-0" />
              <span className="text-sm text-indigo-700 font-medium truncate flex-1 min-w-0">{data.resume_name}</span>
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic">No resume uploaded yet.</div>
          )}
          <div className="flex flex-wrap gap-2">
            {data.resume_url && (
              <>
                <a href={data.resume_url} download={data.resume_name} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition">
                  <Icon d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"]} size={13} />
                  Download
                </a>
                <button onClick={handleResumeDelete}
                  className="flex items-center gap-1.5 px-4 py-2 border border-red-100 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                  Remove
                </button>
              </>
            )}
            <label className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition">
              <Icon d={icons.upload} size={13} stroke="white" />
              {data.resume_name ? "Replace" : "Upload PDF"}
              <input type="file" accept=".pdf" className="hidden"
                onChange={e => { if (e.target.files[0]) handleResumeUpload(e.target.files[0]); }} />
            </label>
          </div>
        </div>
      </Section>

      {/* Change Password Section */}
      <Section
        title="Security"
        action={
          <button
            onClick={() => { setPwError(""); setModal("password"); }}
            className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-700 transition"
          >
            <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={13} /> Change Password
          </button>
        }
      >
        <p className="text-sm text-gray-400 italic">Password is hidden for security.</p>
      </Section>

      {modal === "basic" && (
        <Modal title="Edit Basic Info" onClose={closeModal}
          onSave={() => { syncToServer({ ...data, ...draft }); closeModal(); }}>
          <Field label="Full Name"><Input value={draft.name || ""} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} /></Field>
          <Field label="Email"><Input type="email" value={draft.email || ""} onChange={e => setDraft(p => ({ ...p, email: e.target.value }))} /></Field>
          <Field label="Phone"><Input value={draft.phone || ""} onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))} /></Field>
          <Field label="Location"><Input value={draft.location || ""} onChange={e => setDraft(p => ({ ...p, location: e.target.value }))} /></Field>
        </Modal>
      )}

      {modal === "summary" && (
        <Modal title="Edit Summary" onClose={closeModal}
          onSave={() => { syncToServer({ ...data, summary: draft.summary }); closeModal(); }}>
          <Field label="Professional Summary">
            <Textarea rows={5} value={draft.summary || ""} onChange={e => setDraft(p => ({ ...p, summary: e.target.value }))} />
          </Field>
        </Modal>
      )}

      {modal === "social" && (
        <Modal title="Edit Social Links" onClose={closeModal}
          onSave={() => { syncToServer({ ...data, github: draft.github, linkedin: draft.linkedin, portfolio: draft.portfolio }); closeModal(); }}>
          <Field label="GitHub URL"><Input value={draft.github || ""} onChange={e => setDraft(p => ({ ...p, github: e.target.value }))} /></Field>
          <Field label="LinkedIn URL"><Input value={draft.linkedin || ""} onChange={e => setDraft(p => ({ ...p, linkedin: e.target.value }))} /></Field>
          <Field label="Portfolio URL"><Input value={draft.portfolio || ""} onChange={e => setDraft(p => ({ ...p, portfolio: e.target.value }))} /></Field>
        </Modal>
      )}

      {(modal === "edu-new" || modal === "edu-edit") && (
        <Modal title={modal === "edu-new" ? "Add Education" : "Edit Education"} onClose={closeModal}
          onSave={() => saveItem("education", draft)}>
          <Field label="Degree"><Input value={draft.degree || ""} onChange={e => setDraft(p => ({ ...p, degree: e.target.value }))} /></Field>
          <Field label="University"><Input value={draft.university || ""} onChange={e => setDraft(p => ({ ...p, university: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Year"><Input value={draft.start || ""} onChange={e => setDraft(p => ({ ...p, start: e.target.value }))} /></Field>
            <Field label="End Year"><Input value={draft.end || ""} onChange={e => setDraft(p => ({ ...p, end: e.target.value }))} /></Field>
          </div>
          <Field label="GPA (optional)"><Input value={draft.gpa || ""} onChange={e => setDraft(p => ({ ...p, gpa: e.target.value }))} /></Field>
        </Modal>
      )}

      {(modal === "exp-new" || modal === "exp-edit") && (
        <Modal title={modal === "exp-new" ? "Add Experience" : "Edit Experience"} onClose={closeModal}
          onSave={() => saveItem("experience", draft)}>
          <Field label="Job Title"><Input value={draft.title || ""} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} /></Field>
          <Field label="Company"><Input value={draft.company || ""} onChange={e => setDraft(p => ({ ...p, company: e.target.value }))} /></Field>
          <Field label="Duration"><Input placeholder="Jun 2024 – Aug 2024" value={draft.duration || ""} onChange={e => setDraft(p => ({ ...p, duration: e.target.value }))} /></Field>
          <Field label="Description"><Textarea rows={3} value={draft.description || ""} onChange={e => setDraft(p => ({ ...p, description: e.target.value }))} /></Field>
        </Modal>
      )}

      {(modal === "proj-new" || modal === "proj-edit") && (
        <Modal title={modal === "proj-new" ? "Add Project" : "Edit Project"} onClose={closeModal}
          onSave={() => saveItem("projects", draft)}>
          <Field label="Project Title"><Input value={draft.title || ""} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} /></Field>
          <Field label="Description"><Textarea rows={3} value={draft.description || ""} onChange={e => setDraft(p => ({ ...p, description: e.target.value }))} /></Field>
          <Field label="Technologies Used"><Input placeholder="React, Laravel, MySQL" value={draft.tech || ""} onChange={e => setDraft(p => ({ ...p, tech: e.target.value }))} /></Field>
          <Field label="GitHub Link (optional)"><Input value={draft.github || ""} onChange={e => setDraft(p => ({ ...p, github: e.target.value }))} /></Field>
        </Modal>
      )}

      {modal === "password" && (
        <Modal
          title="Change Password"
          onClose={() => { closeModal(); setPwForm({ current_password: "", new_password: "", new_password_confirmation: "" }); }}
          onSave={handlePasswordChange}
        >
          {pwSaving && <div className="text-xs text-indigo-600 mb-1">Saving…</div>}
          {pwError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg">
              {pwError}
            </div>
          )}

          <Field label="Current Password">
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                placeholder="Enter your current password"
                value={pwForm.current_password}
                onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                <Icon d={showCurrent ? "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22" : "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z"} size={15} />
              </button>
            </div>
          </Field>

          <Field label="New Password">
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="Min 8 chars, A–Z, a–z, 0–9"
                value={pwForm.new_password}
                onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                <Icon d={showNew ? "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22" : "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z"} size={15} />
              </button>
            </div>
            <PasswordStrengthChecker password={pwForm.new_password} />
          </Field>

          <Field label="Confirm New Password">
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat new password"
                value={pwForm.new_password_confirmation}
                onChange={(e) => setPwForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
                style={{
                  borderColor:
                    pwForm.new_password_confirmation.length > 0
                      ? pwForm.new_password === pwForm.new_password_confirmation
                        ? "#22c55e"
                        : "#ef4444"
                      : undefined,
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                <Icon d={showConfirm ? "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22" : "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z"} size={15} />
              </button>
            </div>
            {pwForm.new_password_confirmation.length > 0 && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${
                pwForm.new_password === pwForm.new_password_confirmation ? "text-green-600" : "text-red-500"
              }`}>
                {pwForm.new_password === pwForm.new_password_confirmation ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </Field>
        </Modal>
      )}

    </div>
  );
};

export default ProfilePage;