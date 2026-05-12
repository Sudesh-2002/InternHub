import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useSessionTimeout } from "../../hooks/useSessionTimeout";
import SessionTimeoutModal from "../../components/SessionTimeoutModal";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { Toasts, useToast } from "./components/Shared";
import DashboardHome from "./pages/DashboardHome";
import PostJob from "./pages/PostJob";
import ManageJobs from "./pages/ManageJobs";
import Applicants from "./pages/Applicants";
import CompanyProfile from "./pages/CompanyProfile";
import Notifications from "./pages/Notifications";
import { MOCK_JOBS } from "./data/mockData";

const API_BASE = "http://127.0.0.1:8000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [unread, setUnread] = useState(0);
  const [showTimeout, setShowTimeout] = useState(false);
  const { toasts, add: toast } = useToast();

  //  Session Timeout 
  const { stayLoggedIn, WARNING_SECONDS } = useSessionTimeout({
    enabled: !!user,
    onWarning: () => setShowTimeout(true),
    onExpire: async () => {
      setShowTimeout(false);
      await logout();
      navigate("/login");
    },
    onReset: () => setShowTimeout(false),
  });

  const handleStayLoggedIn = () => { stayLoggedIn(); setShowTimeout(false); };
  const handleTimeoutLogout = async () => { setShowTimeout(false); await logout(); navigate("/login"); };

  // Fetch unread notification count from backend on mount
  useEffect(() => {
    axios.get(`${API_BASE}/company/notifications`, { headers: authHeader() })
      .then(r => setUnread(r.data.unread_count ?? 0))
      .catch(() => { });
  }, []);

  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* Session Timeout Modal */}
      <SessionTimeoutModal
        isOpen={showTimeout}
        secondsLeft={WARNING_SECONDS}
        onStay={handleStayLoggedIn}
        onLogout={handleTimeoutLogout}
      />
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        unread={unread}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        <Topbar
          unread={unread}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
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
              <Notifications setUnread={setUnread} />
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