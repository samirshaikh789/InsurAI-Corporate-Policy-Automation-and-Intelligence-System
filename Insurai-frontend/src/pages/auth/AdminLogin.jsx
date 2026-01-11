import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const theme = {
  bg: "#020617",
  surface: "rgba(15,23,42,0.65)",
  border: "rgba(148,163,184,0.15)",

  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",

  neonBlue: "#38BDF8",
  neonPurple: "#818CF8",
  neonPink: "#F472B6",

  gradient: "linear-gradient(135deg, #8b0086, #9333ea, #38bdf8)",
  glow: "0 0 40px rgba(139,0,134,0.35)",
};

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Invalid credentials");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role?.toLowerCase() || "admin");
      localStorage.setItem("name", data.name || "");

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orbBlue} />
      <div style={styles.orbPurple} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={styles.card}
      >
        <div style={styles.brand}>
          Insur<span style={styles.brandAccent}>AI</span>
        </div>

        <h2 style={styles.title}>Admin Control</h2>
        <p style={styles.subtitle}>
          Govern InsurAI infrastructure with zero-trust security
        </p>

        {error && <div style={styles.alert}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  ...styles.input,
                  paddingRight: "3rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eye}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div style={styles.forgot}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={styles.linkBtn}
            >
              Back to main portal
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: theme.glow }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={styles.submit}
          >
            {loading ? "Authenticating..." : "Access Admin Panel"}
          </motion.button>
        </form>

        <small style={styles.secure}>
          🔐 Enterprise-grade security • JWT Protected
        </small>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: theme.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Inter, system-ui",
    padding: "1rem",
  },

  orbBlue: {
    position: "absolute",
    width: 420,
    height: 420,
    background: "rgba(147,51,234,0.2)",
    filter: "blur(150px)",
    top: "10%",
    left: "-12%",
  },

  orbPurple: {
    position: "absolute",
    width: 420,
    height: 420,
    background: "rgba(248,113,113,0.2)",
    filter: "blur(170px)",
    bottom: "8%",
    right: "-10%",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    padding: "2.8rem",
    background: theme.surface,
    backdropFilter: "blur(18px)",
    border: `1px solid ${theme.border}`,
    borderRadius: 24,
    color: theme.textPrimary,
    zIndex: 2,
  },

  brand: {
    fontSize: "1.6rem",
    fontWeight: 800,
    textAlign: "center",
  },

  brandAccent: {
    background: theme.gradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  title: {
    marginTop: "1rem",
    fontSize: "1.8rem",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: theme.textSecondary,
    marginBottom: "2rem",
  },

  alert: {
    background: "rgba(220,53,69,0.08)",
    borderRadius: 12,
    padding: "0.85rem 1rem",
    color: "#F87171",
    fontSize: "0.9rem",
    marginBottom: "1.2rem",
  },

  field: {
    marginBottom: "1.3rem",
  },

  input: {
    width: "100%",
    padding: "0.9rem 1rem",
    borderRadius: 12,
    background: "rgba(2,6,23,0.6)",
    color: theme.textPrimary,
    border: `1px solid ${theme.border}`,
    outline: "none",
    fontSize: "0.95rem",
  },

  eye: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: theme.textSecondary,
    cursor: "pointer",
  },

  forgot: {
    textAlign: "right",
    marginBottom: "1.5rem",
  },

  linkBtn: {
    background: "none",
    border: "none",
    color: theme.neonBlue,
    cursor: "pointer",
    fontSize: "0.85rem",
  },

  submit: {
    width: "100%",
    padding: "0.9rem",
    borderRadius: 14,
    border: "none",
    background: theme.gradient,
    color: "#020617",
    fontWeight: 700,
    cursor: "pointer",
  },

  secure: {
    display: "block",
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.75rem",
    color: theme.textSecondary,
  },
};
