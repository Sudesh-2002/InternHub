import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Icon from "./components/Icon";
import { icons, MOCK_NOTIFICATIONS } from "./components/data/mockData";
import DashboardHome  from "./pages/DashboardHome";
import BrowseJobs     from "./pages/BrowseJobs";
import JobDetail      from "./pages/JobDetail";
import ApplyJob       from "./pages/ApplyJob";
import MyApplications from "./pages/MyApplications";
import ProfilePage    from "./pages/ProfilePage";
import Notifications  from "./pages/Notifications";

const NAV = [
  { id: "home",          label: "Home",          icon: icons.home },
  { id: "browse",        label: "Browse Jobs",   icon: icons.browse },
  { id: "applications",  label: "Applications",  icon: icons.apps },
  { id: "profile",       label: "Profile",       icon: icons.profile },
  { id: "notifications", label: "Notifications", icon: icons.bell },
];

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [page, setPage]               = useState("home");
  const [selectedJob, setSelectedJob] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const notifCount = MOCK_NOTIFICATIONS.length;

  const renderPage = () => {
    switch (page) {
      case "home":          return <DashboardHome user={user} setPage={setPage} />;
      case "browse":        return <BrowseJobs setPage={setPage} setSelectedJob={setSelectedJob} />;
      case "job-detail":    return <JobDetail job={selectedJob} setPage={setPage} setSelectedJob={setSelectedJob} />;
      case "apply":         return <ApplyJob job={selectedJob} setPage={setPage} />;
      case "applications":  return <MyApplications />;
      case "profile":       return <ProfilePage user={user} />;
      case "notifications": return <Notifications />;
      default:              return null;
    }
  };

  const activePage = ["job-detail", "apply"].includes(page) ? "browse" : page;

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-60 bg-white border-r border-gray-100 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="px-6 py-5 flex items-center gap-2.5 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base">InternHub</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <button key={item.id}
              onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                activePage === item.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}>
              <Icon d={item.icon} size={17} />
              {item.label}
              {item.id === "notifications" && notifCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {notifCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition">
            <Icon d={icons.logout} size={17} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => setPage("notifications")}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 transition">
              <Icon d={icons.bell} size={18} />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
              )}
            </button>
            <button onClick={() => setPage("browse")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition">
              + Find Jobs
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-3xl w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;