import { Routes, Route } from "react-router-dom";
import { AdminLayout }     from "./components/Shared";

import DashboardOverview   from "./pages/DashboardOverview";
import AdminProfile        from "./pages/AdminProfile";
import StudentManagement   from "./pages/StudentManagement";
import CompanyManagement   from "./pages/CompanyManagement";
import CompanyVerification from "./pages/CompanyVerification";
import InternshipManagement from "./pages/InternshipManagement";
import Applications        from "./pages/Applications";
import Notices             from "./pages/Notices";
import Reports             from "./pages/Reports";
import LoginLogs           from "./pages/LoginLogs";
// import RolesPermissions    from "./pages/RolesPermissions";
// import Complaints          from "./pages/Complaints";
// import Messages            from "./pages/Messages";
// import SystemSettings      from "./pages/SystemSettings";
// import AuditLogs           from "./pages/AuditLogs";
// import Notifications       from "./pages/Notifications";
// import ContentModeration   from "./pages/ContentModeration";

const AdminDashboard = () => (
  <AdminLayout>
    <Routes>
      <Route index                   element={<DashboardOverview />} />
      <Route path="profile"          element={<AdminProfile />} />
      <Route path="students"         element={<StudentManagement />} />
      <Route path="companies"        element={<CompanyManagement />} />
      <Route path="verification"     element={<CompanyVerification />} />
      <Route path="verification/:id" element={<CompanyVerification />} />
      <Route path="internships"      element={<InternshipManagement />} />
      <Route path="applications"     element={<Applications />} />
      <Route path="notices"          element={<Notices />} />
      <Route path="reports"          element={<Reports />} />
      <Route path="login-logs"       element={<LoginLogs />} />
      {/* <Route path="roles"            element={<RolesPermissions />} />
      <Route path="complaints"       element={<Complaints />} />
      <Route path="messages"         element={<Messages />} />
      <Route path="settings"         element={<SystemSettings />} />
      <Route path="audit"            element={<AuditLogs />} />
      <Route path="notifications"    element={<Notifications />} />
      <Route path="moderation"       element={<ContentModeration />} /> */}
    </Routes>
  </AdminLayout>
);

export default AdminDashboard;