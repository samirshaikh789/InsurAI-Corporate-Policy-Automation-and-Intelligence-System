import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function EmployeeRegister() {
  const [employeeId, setEmployeeId] = useState(""); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Basic validation
    if (!employeeId || !name || !email || !password) {
      setMessage("All fields are required");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address");
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
          password: password 
        }), 
      });

      let responseData;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        responseData = await res.json();
      } else {
        const text = await res.text();
        responseData = { message: text };
      }

      if (res.ok) {
        setMessage("Registration successful! Redirecting to login...");
        
        // Store employee info in localStorage
        localStorage.setItem("employeeId", employeeId);
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        if (responseData.token) {
          localStorage.setItem("token", responseData.token);
        }

        // Redirect to login after short delay
        setTimeout(() => {
          navigate("/employee/login");
        }, 2000);
      } else {
        // Handle 400 Bad Request and other errors
        if (res.status === 400) {
          if (responseData.message && responseData.message.toLowerCase().includes("employee")) {
            setMessage("Employee ID already exists. Please use a different ID.");
          } else if (responseData.message && responseData.message.toLowerCase().includes("email")) {
            setMessage("Email address already registered. Please use a different email.");
          } else {
            setMessage(responseData.message || "Invalid registration data. Please check your information.");
          }
        } else {
          setMessage(responseData.message || "Registration failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setMessage("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        width: "100vw",
        overflowX: "hidden",
        background:
          "radial-gradient(circle at top, #020617, #0f172a, #020617)",
      }}
    >
      <div
        className="card shadow-lg border-0 mx-auto"
        style={{
          maxWidth: "1000px",
          width: "95%",
          borderRadius: "22px",
          overflow: "hidden",
        }}
      >
        <div className="row g-0 m-0 w-100">
          {/* LEFT PANEL */}
          <div
            className="col-md-6 d-none d-md-flex"
            style={{
              background:
                "linear-gradient(135deg, #020617, #1e3a8a, #0369a1)",
              color: "white",
            }}
          >
            <div className="p-5 d-flex flex-column justify-content-between">
              <div>
                <h2 className="fw-bold mb-3">
                  Smart Insurance <br />
                  <span style={{ color: "#22d3ee" }}>Powered by AI</span>
                </h2>
                <p className="opacity-75">
                  Create your employee account and access AI-powered
                  insurance analytics.
                </p>

                <ul className="list-unstyled mt-4">
                  <li className="mb-2">✔ Secure JWT Authentication</li>
                  <li className="mb-2">✔ AI Risk Prediction</li>
                  <li className="mb-2">✔ Enterprise Dashboard</li>
                </ul>
              </div>

              <small className="opacity-75">
                Used by 10,000+ professionals worldwide
              </small>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-md-6 bg-light">
            <div className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold">Create Account</h3>
                <p className="text-muted">
                  Register to access InsurAI platform
                </p>
              </div>

              {message && (
                <div
                  className={`alert ${
                    message.includes("successful")
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <input
                  className="form-control mb-3"
                  placeholder="Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />

                <input
                  className="form-control mb-3"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  className="form-control mb-3"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="position-relative mb-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn w-100 text-white fw-semibold"
                  disabled={loading}
                  style={{
                    background:
                      "linear-gradient(135deg, #2563eb, #0ea5e9)",
                  }}
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  Already have an account?{" "}
                  <Link to="/employee/login">Sign in</Link>
                </small>
              </div>

              <div className="text-center mt-3">
                <small className="text-muted">
                  🔐 Secure JWT Authentication
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




