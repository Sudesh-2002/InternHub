// src/pages/admin/pages/Applications.jsx

import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import {
  Page, SectionHeader, Table, Tr, Td, Badge, SearchBar,
  FilterPills, Btn, Ico, Avatar, useToast, Toast,
} from "../components/Shared";

const FILTER_OPTIONS = ["all", "pending", "reviewed", "accepted", "rejected", "flagged"];

const Applications = () => {
  const [apps,    setApps]    = useState([]);
  const [meta,    setMeta]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");
  const [page,    setPage]    = useState(1);
  const { toasts, add: toast, remove } = useToast();

  // ── Fetch ──────────────────────────────────────────────
  const fetchApps = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/applications", {
        params: { search, filter, page },
      });
      setApps(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast("Failed to load applications", "error");
    } finally {
      setLoading(false);
    }
  }, [search, filter, page]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  // Reset to page 1 when search/filter changes
  useEffect(() => { setPage(1); }, [search, filter]);

  // ── Actions ────────────────────────────────────────────
  const toggleFlag = async (id) => {
    try {
      const res = await api.patch(`/admin/applications/${id}/flag`);
      setApps(prev => prev.map(a =>
        a.id === id ? { ...a, is_flagged: res.data.is_flagged } : a
      ));
      toast(res.data.message, "success");
    } catch {
      toast("Action failed", "error");
    }
  };




  const flaggedCount = apps.filter(a => a.is_flagged).length;

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      <SectionHeader
        title="Internship Applications"
        subtitle={meta ? `${meta.total} total applications` : "Loading…"}
        action={
          <Btn variant="secondary">
            <Ico d="M12 5v14M5 12h14" size={14} />
            Export
          </Btn>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search student, company or position…"
        />
        <FilterPills
          options={FILTER_OPTIONS}
          active={filter}
          onChange={setFilter}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-8">
          <span className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
          Loading applications…
        </div>
      ) : (
        <>
          <Table headers={["Student", "Company", "Position", "Status", "Applied", "Flagged", "Actions"]}>
            {apps.length === 0 ? (
              <Tr>
                <Td colSpan={7}>
                  <p className="text-center text-gray-400 py-10 text-sm">
                    No applications found.
                  </p>
                </Td>
              </Tr>
            ) : apps.map(a => (
              <Tr key={a.id}>
                {/* Student */}
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={a.student} src={a.avatar_url} size={8} />
                    <div className="min-w-0">
                      <p className="text-gray-800 font-semibold text-sm truncate">{a.student}</p>
                      <p className="text-gray-400 text-xs truncate">{a.email}</p>
                    </div>
                  </div>
                </Td>

                {/* Company */}
                <Td><span className="text-xs text-gray-700">{a.company}</span></Td>

                {/* Position */}
                <Td><span className="text-xs text-gray-700">{a.job}</span></Td>

                {/* Status - read-only, managed by company */}
                <Td><Badge status={a.status} /></Td>

                {/* Applied */}
                <Td><span className="text-xs text-gray-500">{a.applied}</span></Td>

                {/* Flagged */}
                <Td>
                  {a.is_flagged
                    ? <span className="text-xs text-orange-600 font-bold">⚠ Flagged</span>
                    : <span className="text-xs text-gray-300">—</span>}
                </Td>

                {/* Actions */}
                <Td>
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {a.resume_url && (
                      <a href={a.resume_url} target="_blank" rel="noreferrer">
                        <Btn variant="ghost" size="sm">
                          <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={12} />
                          Resume
                        </Btn>
                      </a>
                    )}
                    <Btn
                      variant={a.is_flagged ? "secondary" : "warning"}
                      size="sm"
                      onClick={() => toggleFlag(a.id)}
                    >
                      {a.is_flagged ? "Unflag" : "Flag"}
                    </Btn>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400">
                Showing {meta.from}–{meta.to} of {meta.total} applications
              </p>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  ← Prev
                </Btn>
                <span className="px-3 py-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg">
                  {meta.current_page} / {meta.last_page}
                </span>
                <Btn variant="secondary" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>
                  Next →
                </Btn>
              </div>
            </div>
          )}
        </>
      )}
    </Page>
  );
};

export default Applications;