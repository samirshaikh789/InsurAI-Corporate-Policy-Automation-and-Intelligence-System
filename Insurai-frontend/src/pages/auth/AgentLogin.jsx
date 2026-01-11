import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const theme = {
  bg: "#020617",
  surface: "rgba(15,23,42,0.65)",
  border: "rgba(148,163,184,0.15)",

  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",

  neonBlue: "#38BDF8",
  neonPurple: "#818CF8",
  neonGreen: "#10B981",

  gradient: "linear-gradient(135deg, #087f5b, #10b981, #38bdf8)",
  glow: "0 0 40px rgba(8,127,91,0.35)",
};

export default function AgentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (value) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z]{2,})+$/.test(value);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorEmail("");
    setErrorPassword("");

    if (!validateEmail(email)) {
      setErrorEmail("Enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/agent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("token", data.token || "");
        localStorage.setItem("role", "agent");
        localStorage.setItem("agentId", data.agentId || "");
        localStorage.setItem("agentName", data.name || "");

        navigate("/agent/dashboard", { replace: true });
      } else {
        if (response.status === 401) setErrorPassword("Invalid password");
        else if (response.status === 404) setErrorEmail("Agent not found");
        else setErrorPassword("Login failed");
      }
    } catch (err) {
      setErrorPassword("Network error. Try again later.");
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

        <h2 style={styles.title}>Agent Login</h2>
        <p style={styles.subtitle}>
          Assist customers with a unified AI workspace
        </p>

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                borderColor: errorEmail ? "#DC2626" : theme.border,
              }}
            />
            {errorEmail && <span style={styles.error}>{errorEmail}</span>}
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
                  borderColor: errorPassword ? "#DC2626" : theme.border,
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
            {errorPassword && (
              <span style={styles.error}>{errorPassword}</span>
            )}
          </div>

          <div style={styles.forgot}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={styles.linkBtn}
            >
              Back to home portal
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: theme.glow }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={styles.submit}
          >
            {loading ? "Signing in..." : "Access Agent Console"}
          </motion.button>
        </form>

        <p style={styles.footer}>
          New field agent?{" "}
          <Link to="/agent/register" style={styles.link}>
            Register here
          </Link>
        </p>

        <small style={styles.secure}>
          🔒 Secure AI-powered agent portal
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
    background: "rgba(16,185,129,0.2)",
    filter: "blur(150px)",
    top: "12%",
    left: "-12%",
  },

  orbPurple: {
    position: "absolute",
    width: 420,
    height: 420,
    background: "rgba(56,189,248,0.25)",
    filter: "blur(160px)",
    bottom: "10%",
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
    fontSize: "0.95rem",
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

  error: {
    color: "#DC2626",
    fontSize: "0.8rem",
    marginTop: "0.4rem",
    display: "block",
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

  footer: {
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.85rem",
    color: theme.textSecondary,
  },

  link: {
    color: theme.neonGreen,
    textDecoration: "none",
    fontWeight: 600,
  },

  secure: {
    display: "block",
    marginTop: "1rem",
    textAlign: "center",
    fontSize: "0.75rem",
    color: theme.textSecondary,
  },
};
