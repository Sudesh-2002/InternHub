import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

import {
  Ico,
  StatusBadge,
  ConfirmModal,
} from "../components/Shared";

import { typeColors } from "../data/mockData";

const emptyForm = {
  title: "",
  location: "",
  type: "",
  salary: "",
  deadline: "",
  duration: "",
  vacancies: "",
  description: "",
  requirements: "",
};

const ManageJobs = ({ toast }) => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [confirm, setConfirm] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // ─────────────────────────────
  // FETCH
  // ─────────────────────────────
  useEffect(() => {
    fetchJobs();
  }, [search, filter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const res = await api.get("/company/manage-jobs", {
        params: { search, status: filter },
      });

      setJobs(res.data.data);

    } catch {
      toast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // DELETE
  // ─────────────────────────────
  const deleteJob = async (id) => {
    try {
      await api.delete(`/company/manage-jobs/${id}`);
      toast("Job deleted", "success");
      setConfirm(null);
      fetchJobs();
    } catch {
      toast("Delete failed", "error");
    }
  };

  // ─────────────────────────────
  // OPEN EDIT (PRE-FILL)
  // ─────────────────────────────
  const openEdit = (job) => {
    setEditingId(job.id);

    setForm({
      title: job.title || "",
      location: job.location || "",
      type: job.type || "",
      salary: job.salary || "",
      deadline: job.deadline || "",
      duration: job.duration || "",
      vacancies: job.vacancies || "",
      description: job.description || "",
      requirements: job.requirements || "",
    });

    setEditOpen(true);
  };

  // ─────────────────────────────
  // UPDATE
  // ─────────────────────────────
  const updateJob = async () => {
    try {
      await api.put(`/company/manage-jobs/${editingId}`, form);

      toast("Job updated", "success");

      setEditOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      fetchJobs();

    } catch {
      toast("Update failed", "error");
    }
  };

  const goToApplicants = (id) => {
    navigate(`/company/dashboard/applicants?jobId=${id}`);
  };

  // ─────────────────────────────
  return (
    <div className="space-y-6">

      {/* CONFIRM DELETE */}
      {confirm && (
        <ConfirmModal
          title="Delete Job?"
          body={`Delete "${confirm.title}" permanently?`}
          danger
          onConfirm={() => deleteJob(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 space-y-5">

            <h2 className="text-lg font-bold text-gray-800">
              Edit Job Posting
            </h2>

            {/* GRID FORM */}
            <div className="grid grid-cols-2 gap-4">

              {/* TITLE */}
              <div>
                <label className="text-xs text-gray-500 font-semibold">
                  Job Title
                </label>
                <input
                  className="w-full border p-2 rounded-lg mt-1"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>

              {/* LOCATION */}
              <div>
                <label className="text-xs text-gray-500 font-semibold">
                  Location
                </label>
                <input
                  className="w-full border p-2 rounded-lg mt-1"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>

              {/* TYPE */}
              <div>
                <label className="text-xs text-gray-500 font-semibold">
                  Job Type
                </label>
                <input
                  className="w-full border p-2 rounded-lg mt-1"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                />
              </div>

              {/* SALARY */}
              <div>
                <label className="text-xs text-gray-500 font-semibold">
                  Salary
                </label>
                <input
                  className="w-full border p-2 rounded-lg mt-1"
                  value={form.salary}
                  onChange={(e) =>
                    setForm({ ...form, salary: e.target.value })
                  }
                />
              </div>

              {/* DEADLINE */}
              <div>
                <label className="text-xs text-gray-500 font-semibold">
                  Deadline
                </label>
                <input
                  type="date"
                  className="w-full border p-2 rounded-lg mt-1"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                />
              </div>

              {/* VACANCIES */}
              <div>
                <label className="text-xs text-gray-500 font-semibold">
                  Vacancies
                </label>
                <input
                  type="number"
                  className="w-full border p-2 rounded-lg mt-1"
                  value={form.vacancies}
                  onChange={(e) =>
                    setForm({ ...form, vacancies: e.target.value })
                  }
                />
              </div>

              {/* DURATION */}
              <div>
                <label className="text-xs text-gray-500 font-semibold">
                  Duration
                </label>
                <input
                  className="w-full border p-2 rounded-lg mt-1"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                />
              </div>

            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-xs text-gray-500 font-semibold">
                Job Description
              </label>
              <textarea
                className="w-full border p-2 rounded-lg mt-1"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* REQUIREMENTS */}
            <div>
              <label className="text-xs text-gray-500 font-semibold">
                Requirements
              </label>
              <textarea
                className="w-full border p-2 rounded-lg mt-1"
                rows={3}
                value={form.requirements}
                onChange={(e) =>
                  setForm({ ...form, requirements: e.target.value })
                }
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2">

              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={updateJob}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>
      )}

      {/* FILTER */}
      <div className="flex gap-3">

        <input
          className="border p-2 rounded-lg w-full"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {["all", "approved", "pending", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-sm ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}

      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-2xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50">
            <tr>
              {["Job", "Type", "Status", "Applicants", "Posted", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs text-gray-500 font-semibold"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t hover:bg-gray-50">

                {/* JOB */}
                <td className="px-5 py-4 align-middle">
                  <p className="font-semibold text-gray-800">
                    {j.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {j.location}
                  </p>
                </td>

                {/* TYPE */}
                <td className="px-5 py-4 align-middle">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      typeColors[j.type] ||
                      "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {j.type}
                  </span>
                </td>

                {/* STATUS */}
                <td className="px-5 py-4 align-middle">
                  <StatusBadge status={j.status} />
                </td>

                {/* APPLICANTS */}
                <td className="px-5 py-4 align-middle font-semibold">
                  {j.applicants}
                </td>

                {/* POSTED */}
                <td className="px-5 py-4 text-gray-500 text-xs align-middle">
                  {j.posted}
                </td>

                {/* ACTIONS */}
                <td className="px-5 py-4 align-middle">
                  <div className="flex gap-2">

                    <button
                      onClick={() => goToApplicants(j.id)}
                      className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-xs"
                    >
                      Applicants
                    </button>

                    <button
                      onClick={() => openEdit(j)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => setConfirm(j)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs"
                    >
                      Delete
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ManageJobs;