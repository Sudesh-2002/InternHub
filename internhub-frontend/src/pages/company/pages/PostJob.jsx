import { Ico } from "../components/Shared";
import { createListing } from "../../../services/api";
import { useEffect, useState } from "react";
import axios from "axios";

const Field = ({ label, optional, children }) => (
  <div className="group">
    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-2 group-focus-within:text-indigo-500 transition-colors duration-200">
      {label}
      {optional && (
        <span className="normal-case font-normal text-gray-300 ml-1.5">— optional</span>
      )}
    </label>
    {children}
  </div>
);

const ErrorMsg = ({ msg }) =>
  msg ? (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      {msg}
    </p>
  ) : null;

const steps = ["Basic Info", "Details", "Settings"];

const StepDot = ({ index, current, label }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
      index < current  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
      : index === current ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-200"
      : "bg-gray-100 text-gray-400"
    }`}>
      {index < current
        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        : index + 1}
    </div>
    <span className={`text-[10px] font-semibold tracking-wide hidden sm:block ${index === current ? "text-indigo-600" : "text-gray-400"}`}>{label}</span>
  </div>
);

const PostJob = ({ onPosted, toast }) => {
  const EMPTY = {
    title: "", description: "", location: "", type: "Remote",
    salary: "", deadline: "", requirements: "", duration: "", vacancies: 1,
  };

  const [form,    setForm]    = useState(EMPTY);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(0);   // 0,1,2
  const [isVerified, setIsVerified] = useState(null);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: "" }));
  };

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!form.title.trim())         e.title       = "Job title is required.";
    if (!form.description.trim())   e.description = "Description is required.";
    if (!form.location.trim())      e.location    = "Location is required.";
    if (Number(form.vacancies) < 1) e.vacancies   = "At least 1 vacancy required.";
    if (form.deadline) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(form.deadline) <= today) e.deadline = "Deadline must be a future date.";
    }
    return e;
  };

  const stepErrors = {
    0: ["title", "description"],
    1: ["requirements", "location"],
    2: ["salary", "duration", "deadline", "vacancies"],
  };

  const nextStep = () => {
    const allErrors = validate();
    const relevant  = {};
    stepErrors[step].forEach(k => { if (allErrors[k]) relevant[k] = allErrors[k]; });
    if (Object.keys(relevant).length) { setErrors(relevant); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/company/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setIsVerified(res.data.data?.verification_status === "verified");
      } catch (err) {
        setIsVerified(false);
      }
    };

    fetchStatus();
  }, []);

  // ── Submit ──
  const submit = async () => {
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) { setErrors(clientErrors); return; }

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        location:    form.location.trim(),
        type:        form.type,
        vacancies:   Number(form.vacancies),
        ...(form.salary.trim()       && { salary:       form.salary.trim() }),
        ...(form.deadline            && { deadline:      form.deadline }),
        ...(form.requirements.trim() && { requirements: form.requirements.trim() }),
        ...(form.duration.trim()     && { duration:      form.duration.trim() }),
      };

      const res = await createListing(payload);

      toast("Job posted! Awaiting admin approval.", "success");
      onPosted(res.listing);
      setForm(EMPTY);
      setStep(0);

    } catch (err) {
      const status = err.response?.status;
      const data   = err.response?.data;

      if (status === 422 && data?.errors) {
        const mapped = {};
        for (const [field, messages] of Object.entries(data.errors)) {
          mapped[field] = Array.isArray(messages) ? messages[0] : messages;
        }
        setErrors(mapped);
        toast("Please fix the highlighted errors.", "error");
      } else if (status === 403) {
        toast("Only company accounts can post internships.", "error");
      } else {
        toast(data?.message ?? "Something went wrong. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Input class ──
  const iCls = (k) =>
    `w-full bg-gray-50 border-2 ${errors[k] ? "border-red-400 bg-red-50/30" : "border-gray-100"} ` +
    `rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 ` +
    `focus:outline-none focus:bg-white focus:border-indigo-400 ` +
    `transition-all duration-200`;

  const typeOptions = ["Remote", "On-site", "Hybrid"];
  const typeIcons = {
    "Remote":  "M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    "On-site": "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    "Hybrid":  "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  };

  if (isVerified === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow">
          <div className="text-red-500 text-lg font-bold mb-2">
            Access Restricted
          </div>
          <p className="text-gray-500 text-sm">
            Your company is not verified yet. You cannot post internships until admin approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-start py-6">

      {/* ── Page heading ── */}
      <div className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Post an Internship</h1>
        <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
          Your listing goes live once our admin team gives the green light.
        </p>
      </div>

      {/* ── Step indicator ── */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-center gap-0">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center">
              <StepDot index={i} current={step} label={label} />
              {i < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-1 transition-colors duration-500 ${i < step ? "bg-indigo-400" : "bg-gray-100"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Card ── */}
      <div className="w-full max-w-2xl">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm shadow-gray-100 overflow-hidden">

          {/* Card top accent */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400" />

          <div className="p-8 space-y-6">

            {/* ── STEP 0: Basic Info ── */}
            {step === 0 && (
              <div className="space-y-5 animate-[fadeSlide_0.3s_ease]">
                <Field label="Job Title *">
                  <input className={iCls("title")} placeholder="e.g. Frontend Developer Intern"
                    value={form.title} onChange={e => set("title", e.target.value)} />
                  <ErrorMsg msg={errors.title} />
                </Field>

                <Field label="Description *">
                  <textarea className={iCls("description")} rows={6}
                    placeholder="Describe the role, responsibilities, and what the intern will learn…"
                    value={form.description} onChange={e => set("description", e.target.value)} />
                  <ErrorMsg msg={errors.description} />
                </Field>
              </div>
            )}

            {/* ── STEP 1: Details ── */}
            {step === 1 && (
              <div className="space-y-5 animate-[fadeSlide_0.3s_ease]">
                <Field label="Requirements" optional>
                  <textarea className={iCls("requirements")} rows={4}
                    placeholder="e.g. Basic React knowledge, good communication skills…"
                    value={form.requirements} onChange={e => set("requirements", e.target.value)} />
                  <ErrorMsg msg={errors.requirements} />
                </Field>

                <Field label="Location *">
                  <input className={iCls("location")} placeholder="e.g. Colombo or Remote"
                    value={form.location} onChange={e => set("location", e.target.value)} />
                  <ErrorMsg msg={errors.location} />
                </Field>

                <Field label="Work Type">
                  <div className="grid grid-cols-3 gap-3 mt-1">
                    {typeOptions.map(t => (
                      <button key={t} type="button" onClick={() => set("type", t)}
                        className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                          form.type === t
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                            : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-gray-100"
                        }`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d={typeIcons[t]} />
                        </svg>
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {/* ── STEP 2: Settings ── */}
            {step === 2 && (
              <div className="space-y-5 animate-[fadeSlide_0.3s_ease]">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Salary" optional>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm font-semibold">Rs.</span>
                      <input className={`${iCls("salary")} pl-8`} placeholder="800/mo"
                        value={form.salary} onChange={e => set("salary", e.target.value)} />
                    </div>
                    <ErrorMsg msg={errors.salary} />
                  </Field>

                  <Field label="Duration" optional>
                    <input className={iCls("duration")} placeholder="e.g. 3 months"
                      value={form.duration} onChange={e => set("duration", e.target.value)} />
                    <ErrorMsg msg={errors.duration} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Application Deadline" optional>
                    <input type="date" className={iCls("deadline")}
                      value={form.deadline} onChange={e => set("deadline", e.target.value)} />
                    <ErrorMsg msg={errors.deadline} />
                  </Field>

                  <Field label="Vacancies">
                    <input type="number" min={1} max={999} className={iCls("vacancies")}
                      value={form.vacancies} onChange={e => set("vacancies", e.target.value)} />
                    <ErrorMsg msg={errors.vacancies} />
                  </Field>
                </div>

                {/* Summary card */}
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Listing Summary</p>
                  {[
                    { label: "Title",    value: form.title },
                    { label: "Location", value: form.location },
                    { label: "Type",     value: form.type },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 text-xs">{label}</span>
                      <span className="text-gray-700 font-medium text-xs truncate max-w-[60%] text-right">{value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── Footer nav ── */}
          <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-indigo-200 hover:shadow-indigo-300">
                Continue
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            ) : (
              <button onClick={submit} disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-indigo-200 hover:shadow-indigo-300">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                {loading ? "Posting…" : "Post Internship"}
              </button>
            )}
          </div>
        </div>

        {/* Fine print */}
        <p className="text-center text-xs text-gray-300 mt-5">
          Your listing will be reviewed by our admin team before going live.
        </p>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
};

export default PostJob;