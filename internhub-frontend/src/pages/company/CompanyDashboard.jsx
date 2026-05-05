// src/pages/company/CompanyDashboard.jsx
//
// Mount this inside a <BrowserRouter> (or your app-level router).
// Add these routes in your router config:
//
//   <Route path="/dashboard" element={<CompanyDashboard />}>
//     <Route index          element={<DashboardHome  ... />} />
//     <Route path="post"        element={<PostJob        ... />} />
//     <Route path="jobs"        element={<ManageJobs     ... />} />
//     <Route path="applicants"  element={<Applicants     ... />} />
//     <Route path="profile"     element={<CompanyProfile ... />} />
//     <Route path="notifs"      element={<Notifications  ... />} />
//   </Route>
//
// OR use the self-contained <Routes> below (no parent router config needed).

import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar  from "./components/Sidebar";
import Topbar   from "./components/Topbar";
import { Toasts, useToast } from "./components/Shared";

import DashboardHome  from "./pages/DashboardHome";
import PostJob        from "./pages/PostJob";
import ManageJobs     from "./pages/ManageJobs";
import Applicants     from "./pages/Applicants";
import CompanyProfile from "./pages/CompanyProfile";
import Notifications  from "./pages/Notifications";

import { MOCK_JOBS, MOCK_NOTIFS } from "./data/mockData";

export default function CompanyDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs]             = useState(MOCK_JOBS);
  const [notifs, setNotifs]         = useState(MOCK_NOTIFS);
  const { toasts, add: toast }      = useToast();

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        unread={unread}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">

        {/* Topbar */}
        <Topbar
          unread={unread}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Routed pages */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route index element={
              <DashboardHome jobs={jobs} />
            } />
            <Route path="post" element={
              <PostJob
                onPosted={j => setJobs(p => [{ ...j }, ...p])}
                toast={toast}
              />
            } />
            <Route path="jobs" element={
              <ManageJobs
                jobs={jobs}
                setJobs={setJobs}
                toast={toast}
              />
            } />
            <Route path="applicants" element={
              <Applicants toast={toast} />
            } />
            <Route path="profile" element={
              <CompanyProfile toast={toast} />
            } />
            <Route path="notifs" element={
              <Notifications notifs={notifs} setNotifs={setNotifs} />
            } />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/company/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}