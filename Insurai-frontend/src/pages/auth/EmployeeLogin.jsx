import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

/* ======================
   DESIGN TOKENS
====================== */
const COLORS = {
  primary: "#2563eb",
  dark: "#020617",
  accent: "#4ecdc4",
  border: "#e5e7eb",
  danger: "#dc3545",
  light: "#f8fafc",
};

export default function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

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
      setErrorEmail("Please enter a valid email address");
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
      if (err.response?.status === 404) {
        setErrorEmail("User not found");
      } else if (err.response?.status === 401) {
        setErrorPassword("Incorrect password");
      } else {
        setErrorPassword("Login failed. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className="d-flex align-items-center justify-content-center"
  style={{
    minHeight: "100vh",
    width: "100vw",
    overflowX: "hidden",
    background:
      "radial-gradient(circle at top, #020617, #0f172a, #020617)",
  }}
>

      <div
        className="card border-0 shadow-lg"
        style={{
          maxWidth: "1000px",
          width: "95%",
          borderRadius: "22px",
          overflow: "hidden",
          background: "rgba(255,255,255,.88)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="row g-0">
          {/* LEFT PANEL */}
          <div
            className="col-md-6 d-none d-md-flex text-white"
            style={{
              background:
                "linear-gradient(135deg, #020617, #1e3a8a, #0369a1)",
            }}
          >
            <div className="p-5 d-flex flex-column justify-content-between">
              <div>
                <h2 className="fw-bold mb-3" style={{ fontSize: "2.6rem" }}>
                  Smart Insurance <br />
                  <span style={{ color: COLORS.accent }}>
                    Powered by AI
                  </span>
                </h2>
                <p style={{ opacity: 0.85 }}>
                  Access analytics, claims, and real-time insights from
                  your enterprise dashboard.
                </p>
              </div>

              <ul className="list-unstyled">
                {[
                  "AI Risk Prediction",
                  "Secure JWT Access",
                  "Enterprise-grade Dashboard",
                ].map((item) => (
                  <li key={item} className="mb-3 d-flex align-items-center">
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        background: COLORS.accent,
                        borderRadius: "50%",
                        marginRight: 12,
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <small style={{ opacity: 0.7 }}>
                Used by 10,000+ professionals worldwide
              </small>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-md-6">
            <div className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold">Welcome Back</h3>
                <p className="text-muted">
                  Login to your InsurAI account
                </p>
              </div>

              <form onSubmit={handleLogin}>
                {/* EMAIL */}
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className={`form-control ${
                      errorEmail ? "is-invalid" : ""
                    }`}
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      background: COLORS.light,
                      borderRadius: "12px",
                    }}
                  />
                  <label>Email address</label>
                  {errorEmail && (
                    <div className="invalid-feedback">
                      {errorEmail}
                    </div>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="form-floating mb-4 position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${
                      errorPassword ? "is-invalid" : ""
                    }`}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      background: COLORS.light,
                      borderRadius: "12px",
                      paddingRight: "45px",
                    }}
                  />
                  <label>Password</label>

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: 14,
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                      opacity: 0.6,
                    }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>

                  {errorPassword && (
                    <div className="invalid-feedback">
                      {errorPassword}
                    </div>
                  )}
                </div>

                <div className="text-end mb-4">
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    style={{ fontSize: "0.85rem" }}
                    onClick={() =>
                      navigate("/employee/forgot-password")
                    }
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  className="btn w-100 fw-semibold"
                  disabled={loading}
                  style={{
                    borderRadius: "14px",
                    padding: "14px",
                    background:
                      "linear-gradient(135deg, #2563eb, #0ea5e9)",
                    color: "#fff",
                    boxShadow:
                      "0 12px 30px rgba(37,99,235,.35)",
                  }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  Don’t have an account?
                </small>
                <br />
                <Link to="/employee/register" className="fw-semibold">
                  Create New Account
                </Link>
              </div>

              <div className="text-center mt-4">
                <small className="text-muted">
                  🔒 Secure JWT Authentication
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



























// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import axios from "axios";

// export default function EmployeeLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errorEmail, setErrorEmail] = useState("");
//   const [errorPassword, setErrorPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const validateEmail = (email) => {
//     const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z]{2,})+$/;
//     return re.test(email);
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorEmail("");
//     setErrorPassword("");

//     if (!validateEmail(email)) {
//       setErrorEmail("Please enter a valid email address");
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await axios.post("http://localhost:8080/auth/login", {
//         email: email.trim().toLowerCase(),
//         password,
//       });

//       const data = res.data;

//       if (!data || !data.token) {
//         throw new Error("Invalid login response: no token found");
//       }

//       // ✅ Store both numeric DB ID and alphanumeric employeeId
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.role?.toLowerCase() || "employee");
//       localStorage.setItem("name", data.name || "");
//       localStorage.setItem("employeeId", data.employeeId || "");
//       localStorage.setItem("id", data.id || "");

//       navigate("/employee/dashboard", { replace: true });
//     } catch (err) {
//       console.error("Login error:", err);

//       if (err.response) {
//         const status = err.response.status;

//         if (status === 404) {
//           setErrorEmail("User not found. Please check your email or register.");
//         } else if (status === 401) {
//           setErrorPassword("Incorrect password. Please try again.");
//         } else {
//           setErrorPassword("Login failed. Please try again later.");
//         }
//       } else {
//         setErrorPassword("Network error. Please check your connection.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="d-flex justify-content-center align-items-center"
//       style={{
//         minHeight: "100vh",
//         width: "100vw",
//         background: "linear-gradient(135deg, #1b262c 0%, #143240 50%, #206c95 100%)",
//         padding: "0",
//         margin: "0",
//         fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//       }}
//     >
//       <div
//         className="card shadow-lg border-0"
//         style={{
//           maxWidth: "1000px",
//           width: "95%",
//           borderRadius: "20px",
//           overflow: "hidden",
//           background: "rgba(255, 255, 255, 0.95)",
//         }}
//       >
//         <div className="row g-0">
//           {/* Left Side - Image & Content */}
//           <div 
//             className="col-md-6 d-none d-md-flex"
//             style={{
//               background: "linear-gradient(135deg, #1b262c 0%, #206c95 100%)",
//               position: "relative",
//               overflow: "hidden",
//             }}
//           >
//             <div className="p-5 d-flex flex-column justify-content-between text-white">
//               {/* Header */}
//               <div>
//                 <div className="d-flex align-items-center mb-4">
//                   <div
//                     style={{
//                       width: "50px",
//                       height: "50px",
//                       background: "rgba(255, 255, 255, 0.1)",
//                       borderRadius: "12px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       backdropFilter: "blur(10px)",
//                       border: "1px solid rgba(255, 255, 255, 0.2)",
//                     }}
//                   >
//                     <svg
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                     >
//                       <path d="M12 2L2 7l10 5 10-5-10-5z" />
//                       <path d="M2 17l10 5 10-5" />
//                       <path d="M2 12l10 5 10-5" />
//                     </svg>
//                   </div>
//                   <h4 className="fw-bold mb-0 ms-3">InsurAI</h4>
//                 </div>

//                 <h2 className="fw-bold mb-3" style={{ fontSize: "2.2rem" }}>
//                   Welcome Back to <br />
//                   <span style={{ color: "#4ecdc4" }}>InsurAI</span> Platform
//                 </h2>
//                 <p className="mb-4" style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "1.1rem", lineHeight: "1.6" }}>
//                   Access your AI-powered insurance dashboard and continue transforming the insurance experience.
//                 </p>
//               </div>

//               {/* Features List */}
//               <div className="mb-5">
//                 <div className="d-flex align-items-center mb-3">
//                   <div
//                     style={{
//                       width: "40px",
//                       height: "40px",
//                       background: "rgba(78, 205, 196, 0.2)",
//                       borderRadius: "10px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       marginRight: "15px",
//                     }}
//                   >
//                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ecdc4" strokeWidth="2">
//                       <path d="M9 12l2 2 4-4" />
//                       <path d="M10 8h4" />
//                       <path d="M12 20h8" />
//                       <path d="M12 20v-4" />
//                     </svg>
//                   </div>
//                   <span style={{ fontSize: "1rem" }}>Real-time Risk Analytics</span>
//                 </div>

//                 <div className="d-flex align-items-center mb-3">
//                   <div
//                     style={{
//                       width: "40px",
//                       height: "40px",
//                       background: "rgba(78, 205, 196, 0.2)",
//                       borderRadius: "10px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       marginRight: "15px",
//                     }}
//                   >
//                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ecdc4" strokeWidth="2">
//                       <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                       <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//                     </svg>
//                   </div>
//                   <span style={{ fontSize: "1rem" }}>Secure Enterprise Access</span>
//                 </div>

//                 <div className="d-flex align-items-center">
//                   <div
//                     style={{
//                       width: "40px",
//                       height: "40px",
//                       background: "rgba(78, 205, 196, 0.2)",
//                       borderRadius: "10px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       marginRight: "15px",
//                     }}
//                   >
//                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ecdc4" strokeWidth="2">
//                       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//                       <circle cx="9" cy="7" r="4" />
//                       <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
//                       <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//                     </svg>
//                   </div>
//                   <span style={{ fontSize: "1rem" }}>Team Collaboration Tools</span>
//                 </div>
//               </div>

//               {/* Bottom Text */}
//               <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.2)", paddingTop: "20px" }}>
//                 <p className="mb-0" style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>
//                   Join 10,000+ insurance professionals worldwide
//                 </p>
//               </div>
//             </div>

//             {/* Decorative Elements */}
//             <div
//               style={{
//                 position: "absolute",
//                 top: "10%",
//                 right: "10%",
//                 width: "100px",
//                 height: "100px",
//                 background: "radial-gradient(circle, rgba(78, 205, 196, 0.3) 0%, transparent 70%)",
//                 borderRadius: "50%",
//               }}
//             />
//             <div
//               style={{
//                 position: "absolute",
//                 bottom: "20%",
//                 left: "5%",
//                 width: "60px",
//                 height: "60px",
//                 background: "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
//                 borderRadius: "50%",
//               }}
//             />
//           </div>

//           {/* Right Side - Form */}
//           <div className="col-md-6">
//             <div className="p-4 p-md-5">
//               {/* Header */}
//               <div className="text-center mb-4">
//                 <div
//                   style={{
//                     width: "70px",
//                     height: "70px",
//                     background: "linear-gradient(135deg, #206c95, #1b262c)",
//                     borderRadius: "16px",
//                     margin: "0 auto 16px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     boxShadow: "0 8px 25px rgba(32, 108, 149, 0.3)",
//                     color: "white",
//                   }}
//                 >
//                   <svg
//                     width="32"
//                     height="32"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
//                     <polyline points="10,17 15,12 10,7" />
//                     <line x1="15" y1="12" x2="3" y2="12" />
//                   </svg>
//                 </div>
//                 <h3 className="fw-bold" style={{ color: "#1b262c" }}>Welcome Back</h3>
//                 <p className="text-muted mb-0">Login to your InsurAI account</p>
//               </div>

//               {/* Login Form */}
//               <form onSubmit={handleLogin}>
//                 <div className="mb-3">
//                   <label className="form-label fw-semibold" style={{ color: "#1b262c", fontSize: "0.9rem" }}>
//                     Email Address
//                   </label>
//                   <div className="position-relative">
//                     <input
//                       type="email"
//                       className={`form-control ${errorEmail ? "is-invalid" : ""}`}
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       required
//                       placeholder="Enter your email"
//                       style={{
//                         borderRadius: "10px",
//                         border: `1px solid ${errorEmail ? "#dc3545" : "#e0e0e0"}`,
//                         padding: "12px 16px 12px 44px",
//                         fontSize: "0.95rem",
//                         transition: "all 0.3s ease",
//                       }}
//                       onFocus={(e) => {
//                         e.target.style.borderColor = "#206c95";
//                         e.target.style.boxShadow = "0 0 0 3px rgba(32, 108, 149, 0.1)";
//                       }}
//                       onBlur={(e) => {
//                         e.target.style.borderColor = errorEmail ? "#dc3545" : "#e0e0e0";
//                         e.target.style.boxShadow = "none";
//                       }}
//                     />
//                     <svg
//                       width="18"
//                       height="18"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       className="position-absolute"
//                       style={{
//                         top: "50%",
//                         left: "16px",
//                         transform: "translateY(-50%)",
//                         color: errorEmail ? "#dc3545" : "#206c95",
//                         opacity: 0.6,
//                       }}
//                     >
//                       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
//                       <polyline points="22,6 12,13 2,6" />
//                     </svg>
//                   </div>
//                   {errorEmail && (
//                     <div className="d-flex align-items-center mt-2" style={{ color: "#dc3545", fontSize: "0.8rem" }}>
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
//                         <circle cx="12" cy="12" r="10" />
//                         <line x1="12" y1="8" x2="12" y2="12" />
//                         <line x1="12" y1="16" x2="12.01" y2="16" />
//                       </svg>
//                       {errorEmail}
//                     </div>
//                   )}
//                 </div>

//                 <div className="mb-4">
//                   <label className="form-label fw-semibold" style={{ color: "#1b262c", fontSize: "0.9rem" }}>
//                     Password
//                   </label>
//                   <div className="position-relative">
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       className={`form-control ${errorPassword ? "is-invalid" : ""}`}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                       placeholder="Enter your password"
//                       style={{
//                         borderRadius: "10px",
//                         border: `1px solid ${errorPassword ? "#dc3545" : "#e0e0e0"}`,
//                         padding: "12px 44px 12px 44px",
//                         fontSize: "0.95rem",
//                         transition: "all 0.3s ease",
//                       }}
//                       onFocus={(e) => {
//                         e.target.style.borderColor = "#206c95";
//                         e.target.style.boxShadow = "0 0 0 3px rgba(32, 108, 149, 0.1)";
//                       }}
//                       onBlur={(e) => {
//                         e.target.style.borderColor = errorPassword ? "#dc3545" : "#e0e0e0";
//                         e.target.style.boxShadow = "none";
//                       }}
//                     />
//                     <svg
//                       width="18"
//                       height="18"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       className="position-absolute"
//                       style={{
//                         top: "50%",
//                         left: "16px",
//                         transform: "translateY(-50%)",
//                         color: errorPassword ? "#dc3545" : "#206c95",
//                         opacity: 0.6,
//                       }}
//                     >
//                       <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                       <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//                     </svg>
//                     <button
//                       type="button"
//                       className="btn btn-link position-absolute p-0 border-0"
//                       style={{
//                         top: "50%",
//                         right: "16px",
//                         transform: "translateY(-50%)",
//                         color: errorPassword ? "#dc3545" : "#206c95",
//                         background: "none",
//                         opacity: 0.6,
//                       }}
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       <svg
//                         width="18"
//                         height="18"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                       >
//                         {showPassword ? (
//                           <>
//                             <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
//                             <line x1="1" y1="1" x2="23" y2="23" />
//                           </>
//                         ) : (
//                           <>
//                             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//                             <circle cx="12" cy="12" r="3" />
//                           </>
//                         )}
//                       </svg>
//                     </button>
//                   </div>
//                   {errorPassword && (
//                     <div className="d-flex align-items-center mt-2" style={{ color: "#dc3545", fontSize: "0.8rem" }}>
//                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="me-1">
//                         <circle cx="12" cy="12" r="10" />
//                         <line x1="12" y1="8" x2="12" y2="12" />
//                         <line x1="12" y1="16" x2="12.01" y2="16" />
//                       </svg>
//                       {errorPassword}
//                     </div>
//                   )}
//                 </div>

//                 {/* Forgot Password Link */}
//                 <div className="text-end mb-4">
//                   <button
//                     type="button"
//                     className="btn btn-link p-0 text-decoration-none"
//                     style={{ 
//                       fontSize: "0.85rem", 
//                       color: "#206c95",
//                       fontWeight: "500",
//                       transition: "color 0.3s ease"
//                     }}
//                     onClick={() => navigate("/employee/forgot-password")}
//                     onMouseEnter={(e) => {
//                       e.target.style.color = "#1b262c";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.color = "#206c95";
//                     }}
//                   >
//                     Forgot Password?
//                   </button>
//                 </div>

//                 <button
//                   type="submit"
//                   className="btn w-100 fw-semibold position-relative"
//                   disabled={loading}
//                   style={{
//                     borderRadius: "10px",
//                     background: "linear-gradient(135deg, #206c95, #1b262c)",
//                     border: "none",
//                     color: "white",
//                     padding: "14px",
//                     fontSize: "1rem",
//                     transition: "all 0.3s ease",
//                     boxShadow: "0 4px 15px rgba(32, 108, 149, 0.3)",
//                     opacity: loading ? 0.7 : 1,
//                   }}
//                   onMouseEnter={(e) => {
//                     if (!loading) {
//                       e.target.style.transform = "translateY(-2px)";
//                       e.target.style.boxShadow = "0 6px 20px rgba(32, 108, 149, 0.4)";
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (!loading) {
//                       e.target.style.transform = "translateY(0)";
//                       e.target.style.boxShadow = "0 4px 15px rgba(32, 108, 149, 0.3)";
//                     }
//                   }}
//                 >
//                   {loading ? (
//                     <>
//                       <span className="spinner-border spinner-border-sm me-2" />
//                       Signing In...
//                     </>
//                   ) : (
//                     "Sign In to Dashboard"
//                   )}
//                 </button>
//               </form>

//               {/* Footer */}
//               <div className="text-center mt-4">
//                 <p className="mb-2 text-muted" style={{ fontSize: "0.9rem" }}>
//                   Don't have an account?
//                 </p>
//                 <Link
//                   to="/employee/register"
//                   className="fw-semibold text-decoration-none"
//                   style={{
//                     color: "#206c95",
//                     fontSize: "0.9rem",
//                     transition: "color 0.3s ease",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.color = "#1b262c";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.color = "#206c95";
//                   }}
//                 >
//                   Create New Account
//                 </Link>
//               </div>

//               {/* Security Badge */}
//               <div className="text-center mt-4 pt-3" style={{ borderTop: "1px solid #e0e0e0" }}>
//                 <div className="d-flex align-items-center justify-content-center">
//                   <svg
//                     width="14"
//                     height="14"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     className="me-2"
//                     style={{ color: "#206c95" }}
//                   >
//                     <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
//                     <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//                   </svg>
//                   <small style={{ color: "#666", fontSize: "0.8rem" }}>
//                     Secure Authentication • JWT Protected
//                   </small>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
