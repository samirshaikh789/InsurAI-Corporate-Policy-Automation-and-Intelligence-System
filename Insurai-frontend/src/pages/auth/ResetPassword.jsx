import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Reset token is missing.");
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset token is missing.");
      setTokenValid(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8080/auth/reset-password/${token}`,
        { newPassword: password }
      );
      setMessage(res.data || "Password reset successfully!");
      setTokenValid(false);
      setTimeout(() => navigate("/employee/login"), 2000);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 400) {
        setError(typeof data === "string" ? data : "Invalid or expired reset token.");
        setTokenValid(false);
      } else {
        setError("Failed to reset password. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
          className="glass-box shadow-lg p-5"
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "22px",
          }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <div
              style={{
                width: "78px",
                height: "78px",
                margin: "0 auto 18px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #2563eb, #1e40af)",
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
            <h3 className="fw-bold mb-1">Reset Password</h3>
            <p className="text-muted">Create your new secure password</p>
          </div>

          {/* Alerts */}
          {tokenValid && (
            <div
              className="mb-3"
              style={{
                background: "rgba(37,99,235,0.08)",
                color: "#2563eb",
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "0.9rem",
              }}
            >
              Password must be at least 6 characters
            </div>
          )}
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

          {/* Form */}
          {tokenValid && (
            <form onSubmit={handleSubmit}>
              {/** New Password */}
              <div className="mb-3">
                <label className="form-label fw-semibold">New Password</label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-input"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ borderRadius: "12px", padding: "12px 44px" }}
                  />
                  <button
                    type="button"
                    className="btn btn-link position-absolute p-0 border-0"
                    style={{ top: "50%", right: "16px", transform: "translateY(-50%)", opacity: 0.6 }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/** Confirm Password */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Confirm Password</label>
                <div className="position-relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control form-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ borderRadius: "12px", padding: "12px 44px" }}
                  />
                  <button
                    type="button"
                    className="btn btn-link position-absolute p-0 border-0"
                    style={{ top: "50%", right: "16px", transform: "translateY(-50%)", opacity: 0.6 }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn submit-btn w-100 fw-semibold"
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg, #2563eb, #1e40af)",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "14px",
                  border: "none",
                  transition: "0.3s ease",
                }}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>
          )}

          {/* Footer */}
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
