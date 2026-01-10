import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function HrLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z]{2,})+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorEmail("");
    setErrorPassword("");

    if (!validateEmail(email)) {
      setErrorEmail("Enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/hr/login", {
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
      localStorage.setItem("role", "hr");
      localStorage.setItem("name", data.name);
      localStorage.setItem("id", data.id);

      navigate("/hr/dashboard");
    } catch (err) {
      setErrorPassword(err.message);
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

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .glass-card {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          animation: fadeSlide 0.9s ease;
        }

        .hr-input:focus {
          border-color: #1e3c72;
          box-shadow: 0 0 0 3px rgba(30,60,114,0.15);
        }

        .hr-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(30,60,114,0.45);
        }
      `}</style>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #1e3c72)",
          backgroundSize: "400% 400%",
          animation: "gradientFlow 15s ease infinite",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <div
          className="glass-card shadow-lg"
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
                width: "80px",
                height: "80px",
                margin: "0 auto 18px",
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, #1e3c72, #2a5298)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 12px 30px rgba(30,60,114,0.4)",
              }}
            >
              👥
            </div>
            <h3 className="fw-bold mb-1">HR Portal</h3>
            <p className="text-muted">
              Secure Human Resource Management Access
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className={`form-control hr-input ${
                  errorEmail ? "is-invalid" : ""
                }`}
                placeholder="hr@insurai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ borderRadius: "12px", padding: "12px" }}
                required
              />
              {errorEmail && (
                <small className="text-danger">{errorEmail}</small>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control hr-input ${
                    errorPassword ? "is-invalid" : ""
                  }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    borderRadius: "12px",
                    padding: "12px 44px 12px 12px",
                  }}
                  required
                />
                <button
                  type="button"
                  className="btn position-absolute top-50 end-0 translate-middle-y me-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁
                </button>
              </div>
              {errorPassword && (
                <small className="text-danger">{errorPassword}</small>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn hr-btn w-100 fw-semibold"
              style={{
                background:
                  "linear-gradient(135deg, #1e3c72, #2a5298)",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px",
                border: "none",
                transition: "0.3s ease",
              }}
            >
              {loading ? "Signing in..." : "Access HR Dashboard"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center mt-4">
            <Link
              to="/"
              className="fw-semibold text-decoration-none"
              style={{ color: "#1e3c72" }}
            >
              ← Back to Home
            </Link>

            <div className="mt-3 text-muted" style={{ fontSize: "0.8rem" }}>
              🔐 Secure HR Portal • Role-Based Access
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
