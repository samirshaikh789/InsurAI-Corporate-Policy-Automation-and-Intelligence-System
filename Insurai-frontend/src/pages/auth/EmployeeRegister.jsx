import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

/* ======================
   DESIGN TOKENS
====================== */
const theme = {
  bg: "#020617",
  surface: "rgba(15,23,42,0.65)",
  border: "rgba(148,163,184,0.15)",

  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",

  neonBlue: "#38BDF8",
  neonPurple: "#818CF8",
  neonPink: "#F472B6",

  gradient: "linear-gradient(135deg, #38BDF8, #818CF8, #F472B6)",
  glow: "0 0 40px rgba(56,189,248,0.35)",
};

export default function EmployeeRegister() {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!employeeId || !name || !email || !password) {
      setMessage("All fields are required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setMessage("Enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employeeId.trim(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registration successful! Redirecting...");
        setTimeout(() => navigate("/employee/login"), 2000);
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch {
      setMessage("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* BACKGROUND GLOWS */}
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

        <h2 style={styles.title}>Create Employee Account</h2>
        <p style={styles.subtitle}>
          Secure onboarding for AI-powered insurance platform
        </p>

        {message && (
          <div
            style={{
              ...styles.alert,
              color: message.includes("successful") ? "#16A34A" : "#DC2626",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <input
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...styles.input, paddingRight: "3rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eye}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: theme.glow }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            type="submit"
            style={styles.submit}
          >
            {loading ? "Creating account..." : "Create Account"}
          </motion.button>
        </form>

        <p style={styles.footer}>
          Already registered?{" "}
          <Link to="/employee/login" style={styles.link}>
            Sign in
          </Link>
        </p>

        <small style={styles.secure}>
          🔐 Enterprise Security • GDPR Compliant
        </small>
      </motion.div>
    </div>
  );
}

/* ======================
   STYLES
====================== */
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
  },

  orbBlue: {
    position: "absolute",
    width: 400,
    height: 400,
    background: "rgba(56,189,248,0.25)",
    filter: "blur(140px)",
    top: "10%",
    left: "-10%",
  },

  orbPurple: {
    position: "absolute",
    width: 400,
    height: 400,
    background: "rgba(129,140,248,0.25)",
    filter: "blur(160px)",
    bottom: "10%",
    right: "-10%",
  },

  card: {
    width: "100%",
    maxWidth: 460,
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
    fontSize: "1.7rem",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: theme.textSecondary,
    marginBottom: "1.8rem",
    fontSize: "0.9rem",
  },

  alert: {
    textAlign: "center",
    marginBottom: "1rem",
    fontSize: "0.85rem",
  },

  input: {
    width: "100%",
    padding: "0.9rem 1rem",
    marginBottom: "1.2rem",
    borderRadius: 12,
    background: "rgba(2,6,23,0.6)",
    color: theme.textPrimary,
    border: `1px solid ${theme.border}`,
    outline: "none",
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

  submit: {
    width: "100%",
    padding: "0.9rem",
    borderRadius: 14,
    border: "none",
    background: theme.gradient,
    color: "#020617",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "0.5rem",
  },

  footer: {
    marginTop: "1.5rem",
    textAlign: "center",
    fontSize: "0.85rem",
    color: theme.textSecondary,
  },

  link: {
    color: theme.neonBlue,
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
