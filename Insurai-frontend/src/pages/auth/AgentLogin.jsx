import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AgentLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const re =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z]{2,})+$/;
    return re.test(email);
  };

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
      const response = await fetch(
        "http://localhost:8080/agent/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("token", data.token || "");
        localStorage.setItem("role", "AGENT");
        localStorage.setItem("agentId", data.agentId);
        localStorage.setItem("agentName", data.name);

        navigate("/agent/dashboard");
      } else {
        if (response.status === 401)
          setErrorPassword("Invalid password");
        else if (response.status === 404)
          setErrorEmail("Agent not found");
        else setErrorPassword("Login failed");
      }
    } catch (err) {
      setErrorPassword("Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* GLOBAL STYLES */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .glass-card {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.9);
          animation: fadeSlide 0.9s ease-out;
        }

        .input-focus:focus {
          box-shadow: 0 0 0 3px rgba(8,127,91,0.15);
          border-color: #087f5b;
        }

        .btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(8,127,91,0.45);
        }
      `}</style>

      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(-45deg, #010f0c, #087f5b, #020b18, #0a3d2e)",
          backgroundSize: "400% 400%",
          animation: "gradientMove 12s ease infinite",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <div
          className="glass-card shadow-lg border-0"
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "20px",
            padding: "40px",
          }}
        >
          {/* HEADER */}
          <div className="text-center mb-4">
            <div
              style={{
                width: "72px",
                height: "72px",
                margin: "0 auto 16px",
                borderRadius: "18px",
                background:
                  "linear-gradient(135deg, #087f5b, #010f0c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 10px 25px rgba(8,127,91,0.35)",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
              </svg>
            </div>

            <h3 className="fw-bold mb-1">Agent Login</h3>
            <p className="text-muted">
              Secure access to your dashboard
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Email
              </label>
              <input
                type="email"
                className={`form-control input-focus ${
                  errorEmail ? "is-invalid" : ""
                }`}
                placeholder="agent@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ borderRadius: "12px", padding: "12px" }}
              />
              {errorEmail && (
                <small className="text-danger">
                  {errorEmail}
                </small>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Password
              </label>
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control input-focus ${
                    errorPassword ? "is-invalid" : ""
                  }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
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
              {errorPassword && (
                <small className="text-danger">
                  {errorPassword}
                </small>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-glow w-100 fw-semibold"
              style={{
                background:
                  "linear-gradient(135deg, #087f5b, #010f0c)",
                color: "#fff",
                borderRadius: "12px",
                padding: "14px",
                border: "none",
                transition: "0.3s ease",
              }}
            >
              {loading ? "Signing In..." : "Access Dashboard"}
            </button>
          </form>

          {/* FOOTER */}
          <div className="text-center mt-4">
            <Link
              to="/agent/register"
              className="fw-semibold text-decoration-none"
              style={{ color: "#087f5b" }}
            >
              Register as Agent
            </Link>

            <div
              className="mt-3 text-muted"
              style={{ fontSize: "0.8rem" }}
            >
              🔒 Secure AI-Powered Agent Portal
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
