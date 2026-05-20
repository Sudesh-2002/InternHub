import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../../../services/api";

import {
  Page,
  StatCard,
  Ico,
  Badge,
  Avatar,
} from "../components/Shared";

const BarChart = ({ data, color = "#7c3aed" }) => {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{
              height: `${(d.value / max) * 80}px`,
              background: color,
              opacity: 0.7 + (i / data.length) * 0.3,
            }}
          />
          <span className="text-[9px] text-gray-400 font-medium">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// Sparkline
const Sparkline = ({ data, color = "#7c3aed" }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const w = 120;
  const h = 40;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h * 0.9 - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <polyline
        points={`0,${h} ${points} ${w},${h}`}
        fill={color}
        fillOpacity="0.08"
        stroke="none"
      />
    </svg>
  );
};

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({});
  const [studentChart, setStudentChart] = useState([]);
  const [companyChart, setCompanyChart] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [awaitingVerification, setAwaitingVerification] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/dashboard");

      const data = res.data.data;

      setStats(data.stats || {});
      setStudentChart(data.student_chart || []);
      setCompanyChart(data.company_chart || []);
      setRecentStudents(data.recent_students || []);
      setAwaitingVerification(data.awaiting_verification || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      label: "Total Students",
      value: stats.total_students || 0,
      color: "violet",
      icon:
        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    },
    {
      label: "Total Companies",
      value: stats.total_companies || 0,
      color: "sky",
      icon:
        "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745",
    },
    {
      label: "Total Internships",
      value: stats.total_internships || 0,
      color: "emerald",
      icon:
        "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7",
    },
    {
      label: "Pending Approvals",
      value: stats.pending_approvals || 0,
      color: "amber",
      icon:
        "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    },
    {
      label: "Active Internships",
      value: stats.active_internships || 0,
      color: "cyan",
      icon:
        "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0",
    },
    {
      label: "Total Applications",
      value: stats.total_applications || 0,
      color: "rose",
      icon:
        "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5",
    },
  ];

  if (loading) {
    return (
      <Page>
        <div className="text-gray-500">Loading dashboard...</div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Welcome back, Admin.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium">
            Last updated
          </p>

          <p className="text-xs text-gray-600">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Student registrations */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Student Registrations
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-1">
                +
                {studentChart.length
                  ? studentChart[studentChart.length - 1].value
                  : 0}
              </p>
            </div>

            <Sparkline
              data={studentChart.map((d) => d.value)}
              color="#7c3aed"
            />
          </div>

          <BarChart data={studentChart} color="#7c3aed" />
        </div>

        {/* Company Signups */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Company Sign-ups
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-1">
                +
                {companyChart.length
                  ? companyChart[companyChart.length - 1].value
                  : 0}
              </p>
            </div>

            <Sparkline
              data={companyChart.map((d) => d.value)}
              color="#0ea5e9"
            />
          </div>

          <BarChart data={companyChart} color="#0ea5e9" />
        </div>
      </div>

      {/* Lower Widgets */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Awaiting verification */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Awaiting Verification
            </p>

            <NavLink
              to="/admin/dashboard/verification"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition"
            >
              View all →
            </NavLink>
          </div>

          <div className="space-y-3">
            {awaitingVerification.map((company) => (
              <div
                key={company.id}
                className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
              >
                <Avatar
                  name={company.company_name}
                  src={company.logo_url}
                  size={8}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">
                    {company.company_name}
                  </p>

                  <p className="text-xs text-gray-500">
                    Submitted {company.submitted}
                  </p>
                </div>

                <Badge status="pending" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Recent Registrations
            </p>

            <NavLink
              to="/admin/dashboard/students"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition"
            >
              View all →
            </NavLink>
          </div>

          <div className="space-y-3">
            {recentStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
              >
                <Avatar name={student.name} src={student.avatar_url} size={8} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">
                    {student.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {student.university} · {student.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default DashboardOverview;