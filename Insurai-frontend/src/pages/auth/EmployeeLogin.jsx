import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
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

/* ======================
   COMPONENT
====================== */
export default function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z]{2,})+$/.test(email);

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
      const res = await axios.post("http://localhost:8080/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role?.toLowerCase() || "employee");
      localStorage.setItem("name", data.name || "");
      localStorage.setItem("employeeId", data.employeeId || "");
      localStorage.setItem("id", data.id || "");

      navigate("/employee/dashboard", { replace: true });
    } catch (err) {
      if (err.response?.status === 404)
        setErrorEmail("User not found");
      else if (err.response?.status === 401)
        setErrorPassword("Incorrect password");
      else setErrorPassword("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* BACKGROUND GLOW */}
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

        <h2 style={styles.title}>Employee Login</h2>
        <p style={styles.subtitle}>
          Secure access to your AI-powered insurance dashboard
        </p>

        <form onSubmit={handleLogin}>

          {/* EMAIL */}
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

          {/* PASSWORD */}
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
            {errorPassword && <span style={styles.error}>{errorPassword}</span>}
          </div>

          {/* FORGOT */}
          <div style={styles.forgot}>
            <button
              type="button"
              onClick={() => navigate("/employee/forgot-password")}
              style={styles.linkBtn}
            >
              Forgot password?
            </button>
          </div>

          {/* SUBMIT */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: theme.glow }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={styles.submit}
          >
            {loading ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>

        {/* FOOTER */}
        <p style={styles.footer}>
          New employee?{" "}
          <Link to="/employee/register" style={styles.link}>
            Create account
          </Link>
        </p>

        <small style={styles.secure}>
          🔐 JWT Secured • Enterprise Authentication
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
    top: "15%",
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
