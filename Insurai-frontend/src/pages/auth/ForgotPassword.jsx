import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* =========================
   THEME (from Homepage)
========================= */
const theme = {
  bg: "#020617",
  surface: "rgba(15,23,42,0.65)",
  border: "rgba(148,163,184,0.15)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  neonBlue: "#38BDF8",
  neonPurple: "#818CF8",
  neonPink: "#F472B6",
  gradientMain: "linear-gradient(135deg, #020617 0%, #020617 40%, #0F172A 100%)",
  gradientNeon: "linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #F472B6 100%)",
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8080/auth/forgot-password",
        { email: email.trim().toLowerCase() }
      );

      setMessage(res.data || "Password reset link sent to your email.");
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Email not found. Please check and try again.");
      } else {
        setError("Unable to send reset link. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.card}>
          
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.iconBox}>🔐</div>
            <h2 style={styles.title}>Forgot Password</h2>
            <p style={styles.subtitle}>Securely reset your account password</p>
          </div>

          {/* Info Message */}
          <div style={styles.infoBox}>
            We'll send a secure password reset link to your registered email.
          </div>

          {/* Error Alert */}
          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          {/* Success Alert */}
          {message && (
            <div style={styles.successBox}>
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                style={styles.input}
                placeholder="you@insurai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              style={styles.backButton}
              onClick={() => navigate("/employee/login")}
            >
              ← Back to Login
            </button>
            <div style={styles.secureText}>
              🔒 Secure • Encrypted • Trusted
            </div>
          </div>
        </div>

        {/* Background Orbs */}
        <div style={styles.orbBlue} />
        <div style={styles.orbPurple} />
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    fontFamily: "Inter, system-ui, sans-serif",
    background: theme.gradientMain,
    minHeight: "100vh",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  container: {
    width: "100%",
    maxWidth: "440px",
    padding: "2rem",
    position: "relative",
  },

  card: {
    background: "rgba(15,23,42,0.85)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${theme.border}`,
    borderRadius: "24px",
    padding: "2.5rem",
    position: "relative",
    zIndex: 2,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },

  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },

  iconBox: {
    width: "80px",
    height: "80px",
    margin: "0 auto 1.2rem",
    borderRadius: "20px",
    background: theme.gradientNeon,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
  },

  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: theme.textPrimary,
    marginBottom: "0.5rem",
  },

  subtitle: {
    color: theme.textSecondary,
    fontSize: "0.95rem",
  },

  infoBox: {
    background: "rgba(56,189,248,0.1)",
    border: `1px solid rgba(56,189,248,0.2)`,
    color: theme.neonBlue,
    padding: "0.9rem 1rem",
    borderRadius: "12px",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
  },

  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#EF4444",
    padding: "0.9rem 1rem",
    borderRadius: "12px",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
  },

  successBox: {
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.2)",
    color: "#22C55E",
    padding: "0.9rem 1rem",
    borderRadius: "12px",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  label: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: theme.textPrimary,
  },

  input: {
    width: "100%",
    padding: "0.9rem 1rem",
    background: "rgba(2,6,23,0.6)",
    border: `1px solid ${theme.border}`,
    borderRadius: "12px",
    color: theme.textPrimary,
    fontSize: "0.95rem",
    outline: "none",
    transition: "all 0.3s",
  },

  submitBtn: {
    marginTop: "0.5rem",
    padding: "1rem",
    background: theme.gradientNeon,
    border: "none",
    borderRadius: "12px",
    color: "#020617",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.2s",
    boxShadow: "0 4px 15px rgba(56,189,248,0.3)",
  },

  footer: {
    marginTop: "2rem",
    textAlign: "center",
  },

  backButton: {
    background: "transparent",
    border: "none",
    color: theme.neonBlue,
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "1rem",
    transition: "color 0.2s",
  },

  secureText: {
    color: theme.textSecondary,
    fontSize: "0.85rem",
  },

  orbBlue: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "rgba(56,189,248,0.15)",
    filter: "blur(100px)",
    top: "-100px",
    left: "-100px",
    zIndex: 0,
  },

  orbPurple: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "rgba(129,140,248,0.15)",
    filter: "blur(100px)",
    bottom: "-100px",
    right: "-100px",
    zIndex: 0,
  },
};
