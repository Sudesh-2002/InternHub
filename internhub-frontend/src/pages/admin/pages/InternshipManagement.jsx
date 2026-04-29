import { useEffect, useState } from "react";

import api from "../../../services/api";

import {
  Page,
  SectionHeader,
  Table,
  Tr,
  Td,
  Badge,
  SearchBar,
  FilterPills,
  Btn,
  Modal,
  Ico,
  Textarea,
  useToast,
  Toast,
} from "../components/Shared";

const InternshipManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({});

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);

  const { toasts, add: toast, remove } = useToast();

  // ─────────────────────────────────────────────
  // Fetch internships
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchInternships();
  }, [search, filter]);

  const fetchInternships = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/internships", {
        params: {
          search,
          status: filter,
        },
      });

      setJobs(res.data.data.internships);
      setStats(res.data.data.stats);

    } catch (err) {
      console.error(err);
      toast("Failed to load internships", "error");

    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Update status
  // ─────────────────────────────────────────────
  const doAction = async (id, status) => {
    try {

      await api.patch(`/admin/internships/${id}/status`, {
        status,
      });

      toast(
        `Internship ${status}`,
        status === "approved" ? "success" : "warning"
      );

      setSelected(null);

      fetchInternships();

    } catch (err) {
      console.error(err);
      toast("Action failed", "error");
    }
  };

  // ─────────────────────────────────────────────
  // Delete internship
  // ─────────────────────────────────────────────
  const deleteJob = async (id) => {
    if (!window.confirm("Remove this internship?")) return;

    try {

      await api.delete(`/admin/internships/${id}`);

      toast("Internship removed", "success");

      fetchInternships();

    } catch (err) {
      console.error(err);
      toast("Delete failed", "error");
    }
  };

  return (
    <Page>
      <Toast toasts={toasts} remove={remove} />

      {/* Modal */}
      {selected && (
        <Modal
          title="Internship Details"
          onClose={() => setSelected(null)}
          footer={
            <div className="flex flex-wrap gap-2">

              <Btn
                variant="secondary"
                onClick={() => setSelected(null)}
              >
                Cancel
              </Btn>

              {selected.status === "pending" && (
                <>
                  <Btn
                    variant="success"
                    onClick={() =>
                      doAction(selected.id, "approved")
                    }
                  >
                    Approve
                  </Btn>

                  <Btn
                    variant="danger"
                    onClick={() =>
                      doAction(selected.id, "rejected")
                    }
                  >
                    Reject
                  </Btn>
                </>
              )}

              {selected.status !== "flagged" && (
                <Btn
                  variant="warning"
                  onClick={() =>
                    doAction(selected.id, "flagged")
                  }
                >
                  Flag
                </Btn>
              )}
            </div>
          }
        >
          <div className="space-y-4">

            <div>
              <h3 className="text-white font-bold text-base">
                {selected.title}
              </h3>

              <p className="text-zinc-400 text-sm mt-0.5">
                {selected.company} · {selected.location}
              </p>

              <div className="mt-2 flex gap-2">
                <Badge status={selected.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">

              {[
                ["Posted", selected.posted],
                ["Deadline", selected.deadline],
                ["Applications", selected.applications],
                ["Type", selected.type],
                ["Salary", selected.salary || "Not specified"],
                ["Duration", selected.duration || "Not specified"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="bg-white/[0.03] rounded-xl p-3"
                >
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                    {k}
                  </p>

                  <p className="text-zinc-200 text-sm font-medium">
                    {v}
                  </p>
                </div>
              ))}

            </div>

            <div>
              <p className="text-sm text-zinc-400 mb-2">
                Description
              </p>

              <div className="bg-white/[0.03] rounded-xl p-4 text-sm text-zinc-300">
                {selected.description || "No description"}
              </div>
            </div>

            <Textarea
              label="Admin Note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for action…"
            />

          </div>
        </Modal>
      )}

      {/* Header */}
      <SectionHeader
        title="Internship Management"
        subtitle={`${stats.total || 0} internship listings total`}
        action={
          <Btn variant="secondary">
            <Ico d="M12 5v14M5 12h14" size={14} />
            Export
          </Btn>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">

        {[
          {
            label: "Total",
            value: stats.total || 0,
            color: "text-white",
          },
          {
            label: "Approved",
            value: stats.approved || 0,
            color: "text-emerald-400",
          },
          {
            label: "Pending",
            value: stats.pending || 0,
            color: "text-amber-400",
          },
          {
            label: "Flagged",
            value: stats.flagged || 0,
            color: "text-orange-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#161b27] border border-white/5 rounded-2xl p-4 text-center"
          >
            <p className={`text-2xl font-bold ${s.color}`}>
              {s.value}
            </p>

            <p className="text-xs text-zinc-600 font-medium mt-0.5">
              {s.label}
            </p>
          </div>
        ))}

      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search internships or companies…"
        />

        <FilterPills
          options={[
            "all",
            "approved",
            "pending",
            "rejected",
            "flagged",
          ]}
          active={filter}
          onChange={setFilter}
        />

      </div>

      {/* Table */}
      {loading ? (
        <div className="text-zinc-400 text-sm">
          Loading internships...
        </div>
      ) : (
        <Table
          headers={[
            "Title",
            "Company",
            "Location",
            "Deadline",
            "Status",
            "Apps",
            "Actions",
          ]}
        >
          {jobs.map((j) => (
            <Tr
              key={j.id}
              onClick={() => setSelected(j)}
            >
              <Td>
                <p className="text-white font-semibold text-sm">
                  {j.title}
                </p>
              </Td>

              <Td>
                <span className="text-xs">
                  {j.company}
                </span>
              </Td>

              <Td>
                <span className="text-xs">
                  {j.location}
                </span>
              </Td>

              <Td>
                <span className="text-xs">
                  {j.deadline}
                </span>
              </Td>

              <Td>
                <Badge status={j.status} />
              </Td>

              <Td>
                <span className="text-white font-semibold text-sm">
                  {j.applications}
                </span>
              </Td>

              <Td>
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >

                  {j.status === "pending" && (
                    <Btn
                      variant="success"
                      size="sm"
                      onClick={() =>
                        doAction(j.id, "approved")
                      }
                    >
                      Approve
                    </Btn>
                  )}

                  {j.status !== "flagged" && (
                    <Btn
                      variant="warning"
                      size="sm"
                      onClick={() =>
                        doAction(j.id, "flagged")
                      }
                    >
                      Flag
                    </Btn>
                  )}

                  <Btn
                    variant="danger"
                    size="sm"
                    onClick={() => deleteJob(j.id)}
                  >
                    <Ico
                      d="M3 6h18M19 6l-1 14H6L5 6"
                      size={12}
                    />
                  </Btn>

                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
    </Page>
  );
};

export default InternshipManagement;