import { NavLink, useNavigate } from "react-router-dom";
import { Ico } from "./Shared";
import { NAV } from "../data/mockData";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import LogoutConfirmModal from "../../../components/LogoutConfirmModal";

const Sidebar = ({ unread, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isVerified, setIsVerified] = useState(null);
  const [company, setCompany] = useState({
    name: "",
    email: "",
    initials: "",
  });

  const [showLogout, setShowLogout] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const confirmLogout = async () => {
    setLogoutLoading(true);
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/company/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = res.data.data;
        setIsVerified(data?.verification_status === "verified");
        const name = data?.company_name || "Company";
        const email = data?.official_email || "no-email@company.com";

        const initials = name
          .split(" ")
          .map(w => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        setCompany({
          name,
          email,
          initials,
          logoUrl: data?.logo_url ?? null,
        });

      } catch (err) {
        console.error("Profile fetch error:", err);
        setIsVerified(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30
      w-60 bg-white border-r border-gray-100 flex flex-col
      transition-transform duration-300
      ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}>

      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-2.5 border-b border-gray-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <span className="font-bold text-gray-900">
          Intern<span className="text-indigo-500">Hub</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(n => {
          const isPostJob = n.path === "/company/dashboard/post";

          return (
            <div
              key={n.id}
              className={
                isPostJob && isVerified === false
                  ? "pointer-events-none opacity-40"
                  : ""
              }
            >
              <NavLink
                to={n.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:bg-gray-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Ico d={n.icon} size={17} sw={isActive ? 2.2 : 1.7} />
                    {n.label}

                    {n.id === "notifs" && unread > 0 && (
                      <span className="ml-auto w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {isPostJob && isVerified === false && (
                <div className="text-[10px] text-red-500 ml-9">
                  Verification required
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {company.logoUrl
              ? <img
                src={company.logoUrl}
                alt="logo"
                className="w-full h-full object-cover"
                onError={() => setCompany(p => ({ ...p, logoUrl: null }))}
              />
              : company.initials || "C"
            }
          </div>

          <div className="overflow-hidden">
            <p className="text-xs font-semibold truncate">
              {company.name || "Loading..."}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {company.email || "Loading..."}
            </p>
          </div>
        </div>

        <LogoutConfirmModal
          isOpen={showLogout}
          onCancel={() => setShowLogout(false)}
          onConfirm={confirmLogout}
          loading={logoutLoading}
        />
        <button
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl"
        >
          <Ico d="M17 16l4-4m0 0l-4-4m4 4H7" size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;