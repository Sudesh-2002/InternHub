// src/pages/company/components/Sidebar.jsx

import { NavLink, useNavigate } from "react-router-dom";
import { Ico } from "./Shared";
import { NAV, COMPANY } from "../data/mockData";

const Sidebar = ({ unread, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Replace with your actual logout logic, e.g. useAuth().logout()
    navigate("/login");
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30
      w-60 bg-white border-r border-gray-100 flex flex-col
      transition-transform duration-300
      ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}>

      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-2.5 border-b border-gray-100 flex-shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <span className="font-bold text-gray-900 text-base">
          Intern<span className="text-indigo-500">Hub</span>
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(n => (
          <NavLink
            key={n.id}
            to={n.path}
            end={n.path === "/dashboard"}
            onClick={onClose}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }>
            {({ isActive }) => (
              <>
                <Ico d={n.icon} size={17} color="currentColor" sw={isActive ? 2.2 : 1.7} />
                {n.label}
                {n.id === "notifs" && unread > 0 && (
                  <span className="ml-auto w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {unread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card + Logout */}
      <div className="px-3 py-4 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {COMPANY.initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-gray-800 truncate">{COMPANY.name}</p>
            <p className="text-xs text-gray-400 truncate">{COMPANY.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition">
          <Ico
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1"
            size={17} color="currentColor" sw={1.8}
          />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;