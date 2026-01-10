import React, { useState } from "react";
import axios from "axios";

export default function AgentRegister({ onBack }) {
  const [newAgent, setNewAgent] = useState({ name: "", email: "", password: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z]{2,})+$/.test(email);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const handleRegisterAgent = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(newAgent.email)) {
      setError("Enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin login required");

      const res = await axios.post(
        "http://localhost:8080/admin/agent/register",
        newAgent,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(res.data);
      setError("");
      setNewAgent({ name: "", email: "", password: "" });
      setPasswordStrength(0);
    } catch (err) {
      setError(err.response?.data || err.message);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-page">
      <div className="agent-card">
        {/* Header */}
        <div className="agent-header">
          <div>
            <h2>Register Agent</h2>
            <p>Create and manage insurance agents securely</p>
          </div>
          <span className="admin-pill">ADMIN</span>
        </div>

        {/* Alerts */}
        {success && <div className="alert success">{success}</div>}
        {error && <div className="alert error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleRegisterAgent} className="agent-form">
          <div className="field">
            <input
              type="text"
              required
              value={newAgent.name}
              onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            />
            <label>Full Name</label>
          </div>

          <div className="field">
            <input
              type="email"
              required
              value={newAgent.email}
              onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
            />
            <label>Email Address</label>
          </div>

          <div className="field password-field">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newAgent.password}
              onChange={(e) => {
                setNewAgent({ ...newAgent, password: e.target.value });
                checkPasswordStrength(e.target.value);
              }}
            />
            <label>Password</label>
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Strength Bar */}
          {newAgent.password && (
            <div className="strength">
              <div className="bar">
                <div
                  className={`fill ${
                    passwordStrength >= 75
                      ? "strong"
                      : passwordStrength >= 50
                      ? "medium"
                      : "weak"
                  }`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
              <small>
                {passwordStrength >= 75
                  ? "Strong"
                  : passwordStrength >= 50
                  ? "Medium"
                  : "Weak"}{" "}
                Password
              </small>
            </div>
          )}

          {/* Buttons */}
          <div className="actions">
            <button type="submit" disabled={loading || passwordStrength < 50}>
              {loading ? "Registering..." : "Register Agent"}
            </button>
            <button type="button" className="ghost" onClick={onBack}>
              Back
            </button>
          </div>
        </form>
      </div>

      {/* CSS */}
      <style>{`
        .agent-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a, #020617);
          padding: 2rem;
          animation: fade 0.6s ease;
        }

        .agent-card {
          width: 100%;
          max-width: 520px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(18px);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
          color: #fff;
        }

        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .agent-header h2 {
          font-size: 1.8rem;
          margin-bottom: 0.2rem;
        }

        .agent-header p {
          opacity: 0.7;
          font-size: 0.9rem;
        }

        .admin-pill {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .alert {
          padding: 0.8rem 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .alert.success { background: rgba(34,197,94,0.2); }
        .alert.error { background: rgba(239,68,68,0.2); }

        .agent-form .field {
          position: relative;
          margin-bottom: 1.6rem;
        }

        .field input {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: none;
          outline: none;
          background: rgba(255,255,255,0.15);
          color: white;
        }

        .field label {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          font-size: 0.85rem;
          opacity: 0.6;
          pointer-events: none;
          transition: 0.3s;
        }

        .field input:focus + label,
        .field input:not(:placeholder-shown) + label {
          top: -8px;
          font-size: 0.7rem;
          opacity: 1;
        }

        .password-field span {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
        }

        .strength {
          margin-bottom: 1.5rem;
        }

        .bar {
          height: 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 6px;
          overflow: hidden;
        }

        .fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .fill.strong { background: #22c55e; }
        .fill.medium { background: #facc15; }
        .fill.weak { background: #ef4444; }

        .actions {
          display: flex;
          gap: 1rem;
        }

        button {
          flex: 1;
          padding: 0.9rem;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
        }

        button.ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
        }

        @keyframes fade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
