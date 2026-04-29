import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────
   API CONFIG
───────────────────────────────────────── */
const API_BASE = "http://127.0.0.1:8000/api/company/profile";

const getAuthHeaders = () => ({
  Accept: "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
  // Do NOT set Content-Type here — browser sets it automatically for FormData
});

/* ─────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────── */
const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1.5">
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
  </div>
);

const inputBase =
  "w-full bg-white/70 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 " +
  "placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400/30 " +
  "focus:border-violet-400 transition-all duration-150 hover:border-slate-300 backdrop-blur-sm";

const Input = (p) => <input className={inputBase} {...p} />;
const TA    = ({ rows = 3, ...p }) => <textarea className={inputBase + " resize-none"} rows={rows} {...p} />;
const Sel   = ({ children, ...p }) => <select className={inputBase} {...p}>{children}</select>;

/* ─────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────── */
const STEPS = [
  { n: 1, label: "Identity"    },
  { n: 2, label: "Description" },
  { n: 3, label: "Contact"     },
  { n: 4, label: "Documents"   },
];

const StepBar = ({ current }) => (
  <div className="flex items-center gap-0 mb-8">
    {STEPS.map((s, i) => {
      const done   = s.n < current;
      const active = s.n === current;
      return (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`
              w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
              ${done   ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200" : ""}
              ${active ? "bg-white border-violet-600 text-violet-600 shadow-lg shadow-violet-100 scale-110" : ""}
              ${!done && !active ? "bg-white border-slate-200 text-slate-400" : ""}
            `}>
              {done
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                : s.n
              }
            </div>
            <span className={`text-[11px] font-semibold whitespace-nowrap transition-colors duration-200
              ${active ? "text-violet-600" : done ? "text-violet-400" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-[2px] mx-2 mb-4 rounded-full transition-all duration-500
              ${done ? "bg-violet-400" : "bg-slate-100"}`}
            />
          )}
        </div>
      );
    })}
  </div>
);

/* ─────────────────────────────────────────
   DOCUMENT ROW
───────────────────────────────────────── */
const DocRow = ({ label, hint, value, existingUrl, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 group">
    <div className="min-w-0 pr-4">
      <p className="text-sm font-semibold text-slate-700 group-hover:text-violet-700 transition-colors">
        {label}
      </p>
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </div>
    <label className="flex-shrink-0 cursor-pointer">
      {value || existingUrl ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {value ? "Ready" : "Uploaded"}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8" />
          </svg>
          Upload
        </span>
      )}
      <input type="file" className="hidden" onChange={(e) => onChange(e.target.files[0] || null)} />
    </label>
  </div>
);

/* ─────────────────────────────────────────
   LOADING SCREEN
───────────────────────────────────────── */
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f0ff] via-[#f8f8ff] to-[#f0f5ff]">
    <div className="flex flex-col items-center gap-3">
      <span className="w-8 h-8 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-400 font-medium">Loading profile…</p>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const CompanyProfile = ({ toast }) => {
  const [step,     setStep]     = useState(1);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [animDir,  setAnimDir]  = useState("forward");
  const [visible,  setVisible]  = useState(true);
  const logoRef = useRef();

  /* ── State: Step 1 – Identity ── */
  const [id, setId] = useState({
    logoPreview:      null,   // data-URL for <img> preview
    logoFile:         null,   // File object to upload
    existingLogoUrl:  null,   // URL returned by API
    companyName:      "",
    registeredName:   "",
    industry:         "Software & Technology",
    registrationNo:   "",
    yearFounded:      "",
    companySize:      "50-100",
    headquarters:     "",
    website:          "",
  });

  /* ── State: Step 2 – Description ── */
  const [desc, setDesc] = useState({
    about:        "",
    mission:      "",
    vision:       "",
    services:     "",
    technologies: "",
    culture:      "",
  });

  /* ── State: Step 3 – Contact ── */
  const [contact, setContact] = useState({
    officialEmail: "",
    hrEmail:       "",
    phone:         "",
    address:       "",
    linkedin:      "",
    facebook:      "",
    website:       "",
  });

  /* ── State: Step 4 – Documents ── */
  const [docs, setDocs] = useState({
    businessCert:       null,   // new File
    taxDocs:            null,
    verificationDoc:    null,
    hrAuth:             null,
    businessCertUrl:    null,   // existing URL from API
    taxDocsUrl:         null,
    verificationDocUrl: null,
    hrAuthUrl:          null,
  });

  /* ── Updater helpers ── */
  const sId  = (k, v) => setId(p      => ({ ...p, [k]: v }));
  const sDsc = (k, v) => setDesc(p    => ({ ...p, [k]: v }));
  const sCnt = (k, v) => setContact(p => ({ ...p, [k]: v }));
  const sDoc = (k, v) => setDocs(p    => ({ ...p, [k]: v }));

  /* ── Load existing profile on mount ── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(API_BASE, { headers: getAuthHeaders() });
        const json = await res.json();
        const d    = json.data;
        if (!d) return;

        setId(p => ({
          ...p,
          existingLogoUrl: d.logo_url        ?? null,
          logoPreview:     d.logo_url        ?? null,
          companyName:     d.company_name    ?? "",
          registeredName:  d.registered_name ?? "",
          industry:        d.industry        ?? "Software & Technology",
          registrationNo:  d.registration_no ?? "",
          yearFounded:     d.year_founded    ?? "",
          companySize:     d.company_size    ?? "50-100",
          headquarters:    d.headquarters    ?? "",
          website:         d.website         ?? "",
        }));

        setDesc({
          about:        d.about        ?? "",
          mission:      d.mission      ?? "",
          vision:       d.vision       ?? "",
          services:     d.services     ?? "",
          technologies: d.technologies ?? "",
          culture:      d.culture      ?? "",
        });

        setContact({
          officialEmail: d.official_email ?? "",
          hrEmail:       d.hr_email       ?? "",
          phone:         d.phone          ?? "",
          address:       d.address        ?? "",
          linkedin:      d.linkedin_url   ?? "",
          facebook:      d.facebook_url   ?? "",
          website:       d.website        ?? "",
        });

        setDocs(p => ({
          ...p,
          businessCertUrl:    d.business_cert_url    ?? null,
          taxDocsUrl:         d.tax_docs_url         ?? null,
          verificationDocUrl: d.verification_doc_url ?? null,
          hrAuthUrl:          d.hr_auth_url          ?? null,
        }));
      } catch (err) {
        console.error("Failed to load company profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Logo file picker ── */
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    sId("logoFile", file);
    const reader = new FileReader();
    reader.onload = (ev) => sId("logoPreview", ev.target.result);
    reader.readAsDataURL(file);
  };

  /* ── Build multipart FormData from all state ── */
  const buildFormData = useCallback(() => {
    const fd = new FormData();

    // Identity
    fd.append("company_name",    id.companyName);
    fd.append("registered_name", id.registeredName);
    fd.append("industry",        id.industry);
    fd.append("registration_no", id.registrationNo);
    fd.append("year_founded",    id.yearFounded);
    fd.append("company_size",    id.companySize);
    fd.append("headquarters",    id.headquarters);
    fd.append("website",         id.website);
    if (id.logoFile) fd.append("logo", id.logoFile);

    // Description
    fd.append("about",        desc.about);
    fd.append("mission",      desc.mission);
    fd.append("vision",       desc.vision);
    fd.append("services",     desc.services);
    fd.append("technologies", desc.technologies);
    fd.append("culture",      desc.culture);

    // Contact
    fd.append("official_email", contact.officialEmail);
    fd.append("hr_email",       contact.hrEmail);
    fd.append("phone",          contact.phone);
    fd.append("address",        contact.address);
    fd.append("linkedin_url",   contact.linkedin);
    fd.append("facebook_url",   contact.facebook);

    // Documents (only append if a new file was selected)
    if (docs.businessCert)    fd.append("business_cert",    docs.businessCert);
    if (docs.taxDocs)         fd.append("tax_docs",         docs.taxDocs);
    if (docs.verificationDoc) fd.append("verification_doc", docs.verificationDoc);
    if (docs.hrAuth)          fd.append("hr_auth",          docs.hrAuth);

    return fd;
  }, [id, desc, contact, docs]);

  /* ── Animated step navigation ── */
  const navigate = (dir) => {
    setAnimDir(dir);
    setVisible(false);
    setTimeout(() => {
      setStep(s => dir === "forward" ? s + 1 : s - 1);
      setVisible(true);
    }, 180);
  };

  /* ── Final save — POST (upsert) to API ── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(API_BASE, {
        method:  "POST",
        headers: getAuthHeaders(),
        body:    buildFormData(),
      });

      if (!res.ok) {
        const err        = await res.json();
        const firstError = Object.values(err.errors ?? {})[0]?.[0] ?? "Save failed.";
        toast?.(firstError, "error");
        return;
      }

      toast?.("Company profile saved successfully!", "success");
    } catch (err) {
      console.error(err);
      toast?.("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived display values ── */
  const initials = (id.companyName || "CO")
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();

  /* ─────────────────────────────────────────
     EARLY RETURN — loading
  ───────────────────────────────────────── */
  if (loading) return <LoadingScreen />;

  /* ─────────────────────────────────────────
     PANELS
  ───────────────────────────────────────── */
  const panels = {

    /* ── STEP 1: Identity ── */
    1: (
      <div className="space-y-5">
        {/* Logo upload block */}
        <div className="flex items-center gap-5 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
          <div
            onClick={() => logoRef.current.click()}
            className="w-[72px] h-[72px] rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden hover:border-violet-300 hover:bg-violet-50/40 transition-all flex-shrink-0 bg-white"
          >
            {id.logoPreview
              ? <img src={id.logoPreview} alt="logo" className="w-full h-full object-cover rounded-2xl" />
              : <div className="text-center select-none">
                  <div className="text-xl font-black text-slate-200">{initials}</div>
                  <div className="text-[9px] text-slate-300 font-semibold mt-0.5">LOGO</div>
                </div>
            }
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          <div>
            <p className="text-sm font-bold text-slate-700">Company Logo</p>
            <p className="text-xs text-slate-400 mt-0.5">PNG or SVG · 200×200px recommended</p>
            <button
              onClick={() => logoRef.current.click()}
              className="mt-2 px-3 py-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg border border-violet-100 transition"
            >
              {id.logoPreview ? "Change" : "Upload Logo"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Company Name">
              <Input value={id.companyName} onChange={e => sId("companyName", e.target.value)} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Registered Business Name" hint="As per official registration certificate">
              <Input value={id.registeredName} onChange={e => sId("registeredName", e.target.value)} />
            </Field>
          </div>
          <Field label="Industry / Sector">
            <Sel value={id.industry} onChange={e => sId("industry", e.target.value)}>
              {["Software & Technology","Finance & Banking","Healthcare","Education",
                "Retail & E-Commerce","Manufacturing","Consulting","Media & Entertainment","Other"]
                .map(s => <option key={s}>{s}</option>)}
            </Sel>
          </Field>
          <Field label="Registration Number">
            <Input value={id.registrationNo} onChange={e => sId("registrationNo", e.target.value)} placeholder="e.g. PV 00123456" />
          </Field>
          <Field label="Year Founded">
            <Input type="number" min="1900" max="2099" value={id.yearFounded} onChange={e => sId("yearFounded", e.target.value)} />
          </Field>
          <Field label="Company Size">
            <Sel value={id.companySize} onChange={e => sId("companySize", e.target.value)}>
              {["1-10","11-50","50-100","100-500","500-1000","1000+"]
                .map(s => <option key={s} value={s}>{s} employees</option>)}
            </Sel>
          </Field>
          <Field label="Headquarters">
            <Input value={id.headquarters} onChange={e => sId("headquarters", e.target.value)} />
          </Field>
          <Field label="Website">
            <Input type="url" value={id.website} onChange={e => sId("website", e.target.value)} placeholder="https://yourcompany.com" />
          </Field>
        </div>
      </div>
    ),

    /* ── STEP 2: Description ── */
    2: (
      <div className="space-y-5">
        <Field label="About the Company">
          <TA rows={3} value={desc.about} onChange={e => sDsc("about", e.target.value)} placeholder="Brief overview of your company…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mission Statement">
            <TA rows={3} value={desc.mission} onChange={e => sDsc("mission", e.target.value)} placeholder="Your company's mission…" />
          </Field>
          <Field label="Vision Statement">
            <TA rows={3} value={desc.vision} onChange={e => sDsc("vision", e.target.value)} placeholder="Your company's vision…" />
          </Field>
        </div>
        <Field label="Services / Products">
          <TA rows={2} value={desc.services} onChange={e => sDsc("services", e.target.value)} placeholder="Main services or products offered…" />
        </Field>
        <Field label="Technologies Used" hint="Comma-separated list of key technologies">
          <Input value={desc.technologies} onChange={e => sDsc("technologies", e.target.value)} placeholder="e.g. React, Node.js, AWS" />
        </Field>
        <Field label="Work Culture Description">
          <TA rows={2} value={desc.culture} onChange={e => sDsc("culture", e.target.value)} placeholder="Describe your team culture…" />
        </Field>
      </div>
    ),

    /* ── STEP 3: Contact ── */
    3: (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Official Email">
            <Input type="email" value={contact.officialEmail} onChange={e => sCnt("officialEmail", e.target.value)} />
          </Field>
          <Field label="HR Email">
            <Input type="email" value={contact.hrEmail} onChange={e => sCnt("hrEmail", e.target.value)} />
          </Field>
          <Field label="Phone Number">
            <Input type="tel" value={contact.phone} onChange={e => sCnt("phone", e.target.value)} />
          </Field>
          <Field label="Company Website">
            <Input type="url" value={contact.website} onChange={e => sCnt("website", e.target.value)} />
          </Field>
          <div className="col-span-2">
            <Field label="Office Address">
              <TA rows={2} value={contact.address} onChange={e => sCnt("address", e.target.value)} placeholder="Full postal address…" />
            </Field>
          </div>
          <Field label="LinkedIn URL">
            <Input type="url" value={contact.linkedin} onChange={e => sCnt("linkedin", e.target.value)} placeholder="https://linkedin.com/company/…" />
          </Field>
          <Field label="Facebook URL">
            <Input type="url" value={contact.facebook} onChange={e => sCnt("facebook", e.target.value)} placeholder="https://facebook.com/…" />
          </Field>
        </div>
      </div>
    ),

    /* ── STEP 4: Documents ── */
    4: (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            All documents are stored securely and used exclusively for admin verification. Accepted formats: PDF, JPG, PNG.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white/60">
          <DocRow
            label="Business Registration Certificate" hint="Official certificate of incorporation"
            value={docs.businessCert} existingUrl={docs.businessCertUrl}
            onChange={f => sDoc("businessCert", f)}
          />
          <DocRow
            label="Tax / Legal Documents" hint="VAT certificate or tax registration document"
            value={docs.taxDocs} existingUrl={docs.taxDocsUrl}
            onChange={f => sDoc("taxDocs", f)}
          />
          <DocRow
            label="Company Verification Documents" hint="Any additional verification required by admin"
            value={docs.verificationDoc} existingUrl={docs.verificationDocUrl}
            onChange={f => sDoc("verificationDoc", f)}
          />
          <DocRow
            label="HR Authorization Letter" hint="Authorizing HR to post jobs on behalf of the company"
            value={docs.hrAuth} existingUrl={docs.hrAuthUrl}
            onChange={f => sDoc("hrAuth", f)}
          />
        </div>
      </div>
    ),
  };

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Fraunces:wght@600;700;800&display=swap');
        .cp-root    { font-family: 'DM Sans', sans-serif; }
        .cp-heading { font-family: 'Fraunces', serif; }

        @keyframes slideInForward {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes slideInBack {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        .panel-enter-forward { animation: slideInForward 0.22s ease-out forwards; }
        .panel-enter-back    { animation: slideInBack    0.22s ease-out forwards; }
        .panel-exit          { animation: fadeOut        0.16s ease-in  forwards; }
      `}</style>

      <div className="cp-root min-h-screen bg-gradient-to-br from-[#f0f0ff] via-[#f8f8ff] to-[#f0f5ff] flex items-start justify-center py-12 px-4">

        {/* Soft background shapes */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-120px] right-[-80px] w-[440px] h-[440px] rounded-full bg-violet-100/40 blur-[80px]" />
          <div className="absolute bottom-[-100px] left-[-60px] w-[360px] h-[360px] rounded-full bg-indigo-100/30 blur-[80px]" />
        </div>

        <div className="relative w-full max-w-[620px]">

          {/* ── Top identity strip ── */}
          <div className="flex items-center gap-4 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-base font-black shadow-lg shadow-violet-200 flex-shrink-0 overflow-hidden">
              {id.logoPreview
                ? <img src={id.logoPreview} alt="logo" className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <div>
              <h1 className="cp-heading text-xl font-bold text-slate-900 leading-tight">
                {id.companyName || "Your Company"}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {[id.headquarters, id.industry].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          {/* ── Main card ── */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl shadow-2xl shadow-violet-100/50 overflow-hidden">

            {/* Card header */}
            <div className="px-8 pt-8 pb-0">
              <StepBar current={step} />
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                  <h2 className="cp-heading text-lg font-bold text-slate-900">
                    {["","Company Identity","Company Description","Contact Information","Company Documents"][step]}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-medium ml-3.5">
                  {["",
                    "Core details and official registration information",
                    "Help candidates understand who you are",
                    "Public and internal contact details",
                    "Official documents for admin verification",
                  ][step]}
                </p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mx-8" />

            {/* Panel content */}
            <div className="px-8 py-7">
              <div
                key={step}
                className={visible
                  ? (animDir === "forward" ? "panel-enter-forward" : "panel-enter-back")
                  : "panel-exit"}
              >
                {panels[step]}
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mx-8" />

            {/* ── Navigation bar ── */}
            <div className="px-8 py-5 flex items-center justify-between">

              {/* Progress dots */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {STEPS.map(s => (
                    <div key={s.n} className={`h-1 rounded-full transition-all duration-300
                      ${s.n === step ? "w-6 bg-violet-500" : s.n < step ? "w-3 bg-violet-300" : "w-3 bg-slate-200"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-semibold ml-1">{step} / 4</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    onClick={() => navigate("back")}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-700 rounded-xl transition-all active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}

                {step < 4 ? (
                  <button
                    onClick={() => navigate("forward")}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl transition-all shadow-md shadow-violet-200 hover:shadow-violet-300 active:scale-95"
                  >
                    Continue
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 rounded-xl transition-all shadow-md shadow-violet-200 hover:shadow-violet-300 active:scale-95"
                  >
                    {saving
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" />
                        </svg>
                    }
                    {saving ? "Saving…" : "Save Profile"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-5 font-medium">
            Your information is saved automatically as you move between steps
          </p>
        </div>
      </div>
    </>
  );
};

export default CompanyProfile;