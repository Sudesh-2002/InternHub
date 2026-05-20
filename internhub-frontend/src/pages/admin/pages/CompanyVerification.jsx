import { useState, useEffect } from "react";
import { Page, SectionHeader, Badge, Avatar, Btn, Ico, Textarea, useToast, Toast } from "../components/Shared";

const API = "http://127.0.0.1:8000";

const BASE = `${API}/api/admin/verifications`;

const TOKEN = () => localStorage.getItem("token") ?? "";

const apiFetch = (url, options = {}) =>
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${TOKEN()}`,
      ...options.headers,
    },
    ...options,
  }).then(async (res) => {

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  });

const fetchVerifications = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return apiFetch(`${BASE}${qs ? `?${qs}` : ""}`);
};

const reviewCompany = (id, action, admin_note) =>
  apiFetch(`${BASE}/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ action, admin_note }),
  });

// ─────────────────────────────────────────────────────────────────────────────
const CompanyVerification = () => {
  const [companies, setCompanies] = useState([]);
  const [active, setActive] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const { toasts, add: toast, remove } = useToast();

  useEffect(() => {
    fetchVerifications()
      .then((data) => {
        setCompanies(data);
        if (data.length > 0) setActive(data[0]);
      })
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  // Sync active panel when companies list updates
  useEffect(() => {
    if (active) {
      const updated = companies.find((c) => c.id === active.id);
      if (updated) setActive(updated);
    }
  }, [companies]);

  // Review action
  const doAction = async (id, action) => {
    setActioning(true);
    try {
      const res = await reviewCompany(id, action, note);

      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? res.company : c))
      );

      toast(res.message, action === "approve" ? "success" : "error");
      setNote("");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setActioning(false);
    }
  };

  const pending = companies.filter((c) => c.status === "pending");

  if (loading) {
    return (
      <Page>
        <SectionHeader title="Company Verification" subtitle="Loading…" />
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
          <div className="lg:col-span-2 bg-gray-100 rounded-2xl h-64 animate-pulse" />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />
      <SectionHeader
        title="Company Verification"
        subtitle={`${pending.length} companies awaiting review`}
      />

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Queue ({pending.length})
            </p>
          </div>

          {companies.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              No companies found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setActive(c); setNote(c.admin_note ?? ""); }}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors ${active?.id === c.id ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}>
                  <Avatar name={c.name} src={c.logo_url} size={10} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active?.id === c.id ? "text-indigo-700" : "text-gray-800"
                      }`}>
                      {c.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{c.submitted}</p>
                  </div>
                  <Badge status={c.status} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {active && (
          <div className="lg:col-span-2 space-y-5">

            {/* Company info card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <Avatar name={active.name} src={active.logo_url} size={14} />
                  <div>
                    <h3 className="text-gray-900 font-bold text-lg">{active.name}</h3>
                    <p className="text-gray-500 text-sm">{active.email}</p>
                    <div className="mt-1"><Badge status={active.status} /></div>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  ["Industry", active.industry],
                  ["Website", active.website],
                  ["Reg. Number", active.regNumber],
                  ["Submitted", active.submitted],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{k}</p>
                    <p className="text-gray-700 text-xs font-medium truncate">{v || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Documents */}
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Uploaded Documents
                </p>
                <div className="space-y-2">
                  {active.docs.map((doc) => (
                    <div
                      key={doc.name}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 border ${doc.uploaded
                          ? "bg-gray-50 border-gray-100"
                          : "bg-red-50 border-red-100"
                        }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.uploaded ? "bg-emerald-50" : "bg-red-50"
                          }`}>
                          <Ico
                            d={doc.uploaded ? "M20 6L9 17l-5-5" : "M18 6L6 18M6 6l12 12"}
                            size={11} color=""
                            className={doc.uploaded ? "text-emerald-600" : "text-red-500"}
                          />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{doc.name}</span>
                      </div>
                      {doc.uploaded ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer">
                          <Btn variant="secondary" size="sm">
                            <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"]} size={12} />
                            View
                          </Btn>
                        </a>
                      ) : (
                        <span className="text-xs text-red-400 font-semibold">Missing</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin actions card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                Admin Actions
              </p>

              <Textarea
                label="Verification Note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for the company or for internal records…"
              />

              {active.status === "pending" && (
                <div className="flex flex-wrap gap-3 pt-1">
                  <Btn
                    variant="success"
                    onClick={() => doAction(active.id, "approve")}
                    disabled={actioning}>
                    {actioning
                      ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Ico d="M20 6L9 17l-5-5" size={14} sw={2.5} />}
                    Approve & Verify
                  </Btn>
                  <Btn
                    variant="danger"
                    onClick={() => doAction(active.id, "reject")}
                    disabled={actioning}>
                    <Ico d="M18 6L6 18M6 6l12 12" size={14} sw={2.5} />
                    Reject
                  </Btn>
                  <Btn
                    variant="warning"
                    onClick={() => doAction(active.id, "resubmit")}
                    disabled={actioning}>
                    <Ico d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" size={14} />
                    Request Resubmission
                  </Btn>
                </div>
              )}

              {active.status !== "pending" && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${active.status === "verified"
                    ? "bg-emerald-50 border border-emerald-200"
                    : active.status === "resubmit"
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-red-50 border border-red-200"
                  }`}>
                  <Ico
                    d={active.status === "verified" ? "M20 6L9 17l-5-5" : "M18 6L6 18M6 6l12 12"}
                    size={14} color=""
                    className={
                      active.status === "verified" ? "text-emerald-400"
                        : active.status === "resubmit" ? "text-amber-400"
                          : "text-red-400"
                    }
                  />
                  <span className={`text-sm font-semibold ${active.status === "verified" ? "text-emerald-700"
                      : active.status === "resubmit" ? "text-amber-700"
                        : "text-red-700"
                    }`}>
                    This company has been {active.status}.
                  </span>
                </div>
              )}

              {/* Previous admin note (read-only if already actioned) */}
              {active.status !== "pending" && active.admin_note && (
                <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Last Admin Note
                  </p>
                  <p className="text-gray-700 text-sm">{active.admin_note}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default CompanyVerification;