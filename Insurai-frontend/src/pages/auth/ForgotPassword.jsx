import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

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
    <>
      {/* ANIMATIONS & GLOBAL STYLES */}
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

        .glass-box {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
          animation: fadeUp 0.8s ease;
        }

        .form-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(37,99,235,0.45);
        }
      `}</style>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(-45deg, #0f172a, #1e3a8a, #2563eb, #0f172a)",
          backgroundSize: "400% 400%",
          animation: "gradientMove 16s ease infinite",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        <div
          className="glass-box shadow-lg"
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "42px",
            borderRadius: "22px",
          }}
        >
          {/* HEADER */}
          <div className="text-center mb-4">
            <div
              style={{
                width: "78px",
                height: "78px",
                margin: "0 auto 18px",
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, #2563eb, #1e40af)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "28px",
                boxShadow: "0 14px 35px rgba(37,99,235,0.45)",
              }}
            >
              🔐
            </div>
            <h3 className="fw-bold mb-1">Forgot Password</h3>
            <p className="text-muted">
              Securely reset your account password
            </p>
          </div>

          {/* INFO MESSAGE */}
          <div
            className="mb-4"
            style={{
              background: "rgba(37,99,235,0.08)",
              padding: "12px 16px",
              borderRadius: "12px",
              color: "#2563eb",
              fontSize: "0.9rem",
            }}
          >
            We’ll send a secure password reset link to your registered email.
          </div>

          {/* ERROR */}
          {error && (
            <div
              className="mb-3"
              style={{
                background: "rgba(220,38,38,0.1)",
                color: "#dc2626",
                padding: "12px",
                borderRadius: "10px",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {message && (
            <div
              className="mb-3"
              style={{
                background: "rgba(22,163,74,0.1)",
                color: "#16a34a",
                padding: "12px",
                borderRadius: "10px",
                fontSize: "0.9rem",
              }}
            >
              {message}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Email Address
              </label>
              <input
                type="email"
                className="form-control form-input"
                placeholder="you@insurai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  borderRadius: "12px",
                  padding: "12px",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn submit-btn w-100 fw-semibold"
              style={{
                background:
                  "linear-gradient(135deg, #2563eb, #1e40af)",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px",
                border: "none",
                transition: "0.3s ease",
              }}
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center mt-4">
            <button
              className="btn btn-link p-0 text-decoration-none fw-semibold"
              style={{ color: "#2563eb" }}
              onClick={() => navigate("/employee/login")}
            >
              ← Back to Login
            </button>

            <div className="mt-3 text-muted" style={{ fontSize: "0.8rem" }}>
              🔒 Secure • Encrypted • Trusted
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
