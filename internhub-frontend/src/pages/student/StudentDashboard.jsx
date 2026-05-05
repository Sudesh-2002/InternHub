// src/pages/student/StudentDashboard.jsx

import { useState } from "react";
import { Routes, Route, NavLink, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "./components/Icon";
import { icons, MOCK_NOTIFICATIONS } from "./components/data/mockData";
import LogoutConfirmModal from "../../components/LogoutConfirmModal";

import DashboardHome   from "./pages/DashboardHome";
import BrowseJobs      from "./pages/BrowseJobs";
import JobDetail       from "./pages/JobDetail";
import ApplyJob        from "./pages/ApplyJob";
import MyApplications  from "./pages/MyApplications";
import ProfilePage     from "./pages/ProfilePage";
import Notifications   from "./pages/Notifications";

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV = [
  { to: "/student/dashboard",              label: "Home",         icon: icons.home,    end: true },
  { to: "/student/dashboard/browse",       label: "Browse Jobs",  icon: icons.browse },
  { to: "/student/dashboard/applications", label: "Applications", icon: icons.apps },
  { to: "/student/dashboard/profile",      label: "Profile",      icon: icons.profile },
  { to: "/student/dashboard/notifications",label: "Notifications",icon: icons.bell },
];

// ─────────────────────────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { user, logout }              = useAuth();
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [showLogout,    setShowLogout]    = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const notifCount = MOCK_NOTIFICATIONS.length;

  const confirmLogout = async () => {
    setLogoutLoading(true);
    await logout();
    navigate("/login");
  };

  // Highlight "Browse Jobs" when on job-detail or apply sub-routes
  const browseActive = [
    "/student/dashboard/browse",
    "/student/dashboard/job-detail",
    "/student/dashboard/apply",
  ].some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30
        w-60 bg-white border-r border-gray-100 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-2.5 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base">
            Intern<span className="text-blue-300">Hub</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            // Special active logic for browse group
            const isBrowseItem = item.to === "/student/dashboard/browse";
            const isActive     = isBrowseItem ? browseActive : undefined;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive: routerActive }) => {
                  const active = isBrowseItem ? browseActive : routerActive;
                  return `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`;
                }}
              >
                <Icon d={item.icon} size={17} />
                {item.label}
                {item.to.includes("notifications") && notifCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {notifCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.student_profile?.avatar_url
                ? <img src={user.student_profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : user?.name?.charAt(0) || "S"
              }
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <LogoutConfirmModal
            isOpen={showLogout}
            onCancel={() => setShowLogout(false)}
            onConfirm={confirmLogout}
            loading={logoutLoading}
          />
          <button onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition">
            <Icon d={icons.logout} size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <NavLink to="/student/dashboard/notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 transition">
              <Icon d={icons.bell} size={18} />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
              )}
            </NavLink>
            <button onClick={() => navigate("/student/dashboard/browse")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition">
              + Find Jobs
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 max-w-3xl w-full mx-auto">
          <Routes>
            {/* Default → home */}
            <Route index element={<DashboardHome user={user} />} />

            {/* Browse + sub-pages */}
            <Route path="browse"     element={<BrowseJobs />} />
            <Route path="job-detail" element={<JobDetail />} />
            <Route path="apply"      element={<ApplyJob />} />

            {/* Other pages */}
            <Route path="applications"  element={<MyApplications />} />
            <Route path="profile"       element={<ProfilePage user={user} />} />
            <Route path="notifications" element={<Notifications />} />

            {/* Catch-all → home */}
            <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;