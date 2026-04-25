import { useAuth } from "../../context/AuthContext";

const CompanyDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: "40px" }}>
      <h1>🏢 Company Dashboard</h1>
      <p>Welcome, <strong>{user?.name}</strong>!</p>
      <button onClick={logout} style={{ marginTop: "20px", padding: "10px 20px",
        backgroundColor: "#ef4444", color: "#fff", border: "none",
        borderRadius: "8px", cursor: "pointer" }}>
        Logout
      </button>
    </div>
  );
};
export default CompanyDashboard;