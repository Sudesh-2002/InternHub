import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      // Redirect based on role
      if (user.role === "student")  navigate("/student/dashboard");
      if (user.role === "company")  navigate("/company/dashboard");
      if (user.role === "admin")    navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back 👋</h2>
        <p style={styles.subtitle}>Login to your InternHub account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.link}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#f0f4ff",
  },
  card: {
    backgroundColor: "#fff", padding: "40px",
    borderRadius: "16px", width: "100%", maxWidth: "420px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
  },
  title:    { fontSize: "24px", fontWeight: "700", marginBottom: "4px" },
  subtitle: { color: "#666", marginBottom: "24px" },
  field:    { marginBottom: "16px" },
  label:    { display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" },
  input: {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #ddd", fontSize: "14px",
    boxSizing: "border-box", outline: "none",
  },
  button: {
    width: "100%", padding: "12px", backgroundColor: "#4f46e5",
    color: "#fff", border: "none", borderRadius: "8px",
    fontSize: "16px", fontWeight: "600", cursor: "pointer",
    marginTop: "8px",
  },
  error: {
    backgroundColor: "#fee2e2", color: "#b91c1c",
    padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
    fontSize: "14px",
  },
  link: { textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#555" },
};

export default LoginPage;