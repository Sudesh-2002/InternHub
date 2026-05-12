import { useNavigate, useLocation } from "react-router-dom";
import { Ico } from "./Shared";

const PAGE_TITLES = {
  "/company/dashboard": "Dashboard Overview",
  "/company/dashboard/post": "Post an Internship",
  "/company/dashboard/jobs": "Manage Job Listings",
  "/company/dashboard/applicants": "Applicant Management",
  "/company/dashboard/profile": "Company Profile",
  "/company/dashboard/notifs": "Notifications",
};

const Topbar = ({ unread, onOpenSidebar }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">

      {/* Mobile hamburger */}
      <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={onOpenSidebar}>
        <Ico d="M3 12h18M3 6h18M3 18h18" size={22} color="currentColor" sw={2} />
      </button>

      <div className="hidden lg:block">
        <h1 className="text-gray-900 font-semibold text-base">{title}</h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        <button
          onClick={() => navigate("/company/dashboard/notifs")}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-500 transition">
          <Ico
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0"
            size={18} color="currentColor" sw={1.8}
          />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => navigate("/company/dashboard/post")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5">
          <Ico d="M12 5v14M5 12h14" size={13} color="white" sw={2.5} />
          Post Job
        </button>
      </div>
    </header>
  );
};

export default Topbar;