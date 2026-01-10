import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      localStorage.setItem("role", data.role?.toLowerCase());
      localStorage.setItem("name", data.name);

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* GLOBAL STYLES */}
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .glass-admin {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(22px);
          animation: fadeUp 0.9s ease;
        }

        .admin-input:focus {
          border-color: #8b0086;
          box-shadow: 0 0 0 3px rgba(139,0,134,0.15);
        }

        .admin-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(139,0,134,0.45);
        }
      `}</style>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(-45deg, #1a021f, #2b0938, #8b0086, #3d013c)",
          backgroundSize: "400% 400%",
          animation: "gradientFlow 14s ease infinite",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <div
          className="glass-admin shadow-lg"
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
                  "linear-gradient(135deg, #8b0086, #2b0938)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 12px 30px rgba(139,0,134,0.4)",
              }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>

            <h3 className="fw-bold mb-1">Admin Control</h3>
            <p className="text-muted">
              Secure enterprise administrator access
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div
              className="alert alert-danger"
              style={{
                borderRadius: "12px",
                background: "rgba(220,53,69,0.1)",
                border: "none",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Email
              </label>
              <input
                type="email"
                className="form-control admin-input"
                placeholder="admin@insurai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  borderRadius: "12px",
                  padding: "12px",
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Password
              </label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control admin-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  style={{
                    borderRadius: "12px",
                    padding: "12px 44px 12px 12px",
                  }}
                />
                <button
                  type="button"
                  className="btn position-absolute top-50 end-0 translate-middle-y me-2"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  👁
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn admin-btn w-100 fw-semibold"
              style={{
                background:
                  "linear-gradient(135deg, #8b0086, #2b0938)",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px",
                border: "none",
                transition: "0.3s ease",
              }}
            >
              {loading ? "Authenticating..." : "Access Admin Panel"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center mt-4">
            <button
              className="btn btn-link text-decoration-none fw-semibold"
              style={{ color: "#8b0086" }}
              onClick={() => navigate("/")}
            >
              ← Back to Main Portal
            </button>

            <div
              className="mt-3 text-muted"
              style={{ fontSize: "0.8rem" }}
            >
              🔐 Enterprise-Grade Security • JWT Protected
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
