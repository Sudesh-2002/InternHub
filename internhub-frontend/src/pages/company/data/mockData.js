// src/pages/company/data/mockData.js

export const MOCK_JOBS = [
  { id: 1, title: "Frontend Developer Intern", location: "Remote", type: "Remote", status: "approved", applicants: 24, posted: "2026-04-10", deadline: "2026-05-15", salary: "$800/mo" },
  { id: 2, title: "UI/UX Design Intern", location: "Colombo, LK", type: "On-site", status: "pending", applicants: 12, posted: "2026-04-18", deadline: "2026-05-30", salary: "$600/mo" },
  { id: 3, title: "Backend Engineer Intern", location: "Hybrid", type: "Hybrid", status: "approved", applicants: 31, posted: "2026-04-05", deadline: "2026-05-10", salary: "$900/mo" },
  { id: 4, title: "Data Analyst Intern", location: "Remote", type: "Remote", status: "rejected", applicants: 8, posted: "2026-03-28", deadline: "2026-04-28", salary: "$700/mo" },
  { id: 5, title: "Mobile Dev Intern", location: "Colombo, LK", type: "On-site", status: "pending", applicants: 5, posted: "2026-04-22", deadline: "2026-06-01", salary: "$750/mo" },
];

export const MOCK_APPLICANTS = [
  { id: 1, jobId: 1, name: "Asel Perera",      email: "asel@gmail.com",    status: "pending",  applied: "2026-04-12", avatar: "AP", gpa: "3.8", university: "UoM"   },
  { id: 2, jobId: 1, name: "Kasun Silva",       email: "kasun@gmail.com",   status: "accepted", applied: "2026-04-13", avatar: "KS", gpa: "3.6", university: "SLIIT" },
  { id: 3, jobId: 1, name: "Nimasha Fernando",  email: "nimasha@gmail.com", status: "reviewed", applied: "2026-04-14", avatar: "NF", gpa: "3.9", university: "UoC"   },
  { id: 4, jobId: 2, name: "Dinesh Rajapaksa",  email: "dinesh@gmail.com",  status: "rejected", applied: "2026-04-19", avatar: "DR", gpa: "3.4", university: "NSBM"  },
  { id: 5, jobId: 2, name: "Chamari Wickrama",  email: "chamari@gmail.com", status: "pending",  applied: "2026-04-20", avatar: "CW", gpa: "3.7", university: "UoM"   },
  { id: 6, jobId: 3, name: "Lahiru Bandara",    email: "lahiru@gmail.com",  status: "accepted", applied: "2026-04-07", avatar: "LB", gpa: "3.5", university: "IIT"   },
  { id: 7, jobId: 3, name: "Priya Kumari",      email: "priya@gmail.com",   status: "pending",  applied: "2026-04-09", avatar: "PK", gpa: "3.8", university: "UoK"   },
];

export const MOCK_NOTIFS = [
  { id: 1, text: "Asel Perera applied for Frontend Developer Intern",           time: "2 hours ago", read: false, type: "applicant" },
  { id: 2, text: "Your job 'Backend Engineer Intern' was approved by admin",    time: "1 day ago",   read: false, type: "approval"  },
  { id: 3, text: "Lahiru Bandara applied for Backend Engineer Intern",          time: "2 days ago",  read: true,  type: "applicant" },
  { id: 4, text: "Your job 'Data Analyst Intern' was rejected by admin",        time: "3 days ago",  read: true,  type: "rejection" },
  { id: 5, text: "Kasun Silva applied for Frontend Developer Intern",           time: "4 days ago",  read: true,  type: "applicant" },
];

export const COMPANY = { name: "TechCorp Solutions", email: "hr@techcorp.io", initials: "TC" };

export const NAV = [
  { id: "home",       label: "Dashboard",      path: "/company/dashboard",             icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" },
  { id: "post",       label: "Post Internship", path: "/company/dashboard/post",       icon: "M12 5v14M5 12h14" },
  { id: "jobs",       label: "Manage Jobs",     path: "/company/dashboard/jobs",       icon: "M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" },
  { id: "applicants", label: "Applicants",      path: "/company/dashboard/applicants", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { id: "profile",    label: "Company Profile", path: "/company/dashboard/profile",    icon: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { id: "notifs",     label: "Notifications",   path: "/company/dashboard/notifs",     icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" },
];

export const avatarColors = [
  "bg-violet-600", "bg-sky-600", "bg-emerald-600",
  "bg-amber-600",  "bg-rose-600","bg-teal-600", "bg-indigo-600",
];

export const statusConfig = {
  approved: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30" },
  pending:  { label: "Pending",  cls: "bg-amber-500/15  text-amber-600  ring-1 ring-amber-500/30"  },
  rejected: { label: "Rejected", cls: "bg-red-500/15    text-red-600    ring-1 ring-red-500/30"    },
  accepted: { label: "Accepted", cls: "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30" },
  reviewed: { label: "Reviewed", cls: "bg-blue-500/15   text-blue-600   ring-1 ring-blue-500/30"   },
};

export const typeColors = {
  Remote:   "bg-violet-500/15 text-violet-600",
  "On-site":"bg-sky-500/15    text-sky-600",
  Hybrid:   "bg-teal-500/15   text-teal-600",
};