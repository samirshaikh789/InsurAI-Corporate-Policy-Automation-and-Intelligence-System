
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, CartesianGrid, LineChart, Line, PieChart, Pie, Cell,
  Area, AreaChart
} from "recharts";

// Import child components
import AgentRegister from "../../auth/AgentRegister";
import HrRegister from "../../auth/HRRegister";
import AdminPolicy from "./AdminPolicy";
import AdminAllClaims from './AdminAllClaims';
import AdminReportsAnalytics from "./AdminReportsAnalytics";
import AdminUserManagement from "./AdminUserManagement";
import AdminFraudClaims from "./AdminFraudClaims";
import AdminAuditLogs from "./AdminAuditLogs";

// ============= THEME CONFIGURATION =============
const theme = {
  primary: '#2b0938',
  secondary: '#8b0086',
  accent: '#6a0dad',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  light: '#f8f6fa',
  dark: '#1a0524',
  gradient: 'linear-gradient(135deg, #2b0938 0%, #8b0086 100%)',
  gradientLight: 'linear-gradient(135deg, rgba(43,9,56,0.1) 0%, rgba(139,0,134,0.1) 100%)',
};

const CHART_COLORS = ['#8b0086', '#6a0dad', '#9333ea', '#a855f7', '#c084fc'];

// ============= ANIMATION VARIANTS =============
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: {
    y: -5,
    boxShadow: '0 10px 30px rgba(139,0,134,0.2)',
    transition: { duration: 0.2 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// ============= ANIMATED COUNTER COMPONENT =============
const AnimatedCounter = ({ value, duration = 1500, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) {
      setCount(end);
      return;
    }

    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// ============= PROGRESS CIRCLE COMPONENT =============
const ProgressCircle = ({ percentage, size = 80, strokeWidth = 8, color = theme.secondary }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-circle">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="18"
        fontWeight="bold"
        fill={color}
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
};

// ============= MAIN COMPONENT =============
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(3);

  // Data states
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    cpu: 45,
    memory: 62,
    storage: 38,
    uptime: '99.9%'
  });

  const [newHR, setNewHR] = useState({ name: "", email: "", password: "" });
  const [newAgent, setNewAgent] = useState({ name: "", email: "", password: "" });

  // ============= LOGOUT HANDLER =============
  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  // ============= FETCH USERS =============
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      const [agentsRes, employeesRes, hrsRes] = await Promise.all([
        axios.get("http://localhost:8080/agent", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/auth/employees", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:8080/hr", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const mappedAgents = (agentsRes.data || []).map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
        role: "Agent",
        status: "Active",
        avatar: a.avatar || null
      }));

      const mappedEmployees = (employeesRes.data || []).map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
        role: "Employee",
        status: e.active ? "Active" : "Inactive",
        avatar: e.avatar || null
      }));

      const mappedHRs = (hrsRes.data || []).map(h => ({
        id: h.id,
        name: h.name,
        email: h.email,
        role: "HR",
        status: "Active",
        avatar: h.avatar || null
      }));

      setUsers([...mappedAgents, ...mappedEmployees, ...mappedHRs]);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, []);

  // ============= FETCH CLAIMS =============
  const fetchAllClaims = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [claimsRes, empRes, hrRes, policyRes] = await Promise.all([
        fetch("http://localhost:8080/admin/claims", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8080/auth/employees", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8080/hr", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8080/admin/policies", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const [claimsData, employees, hrs, policiesData] = await Promise.all([
        claimsRes.json(),
        empRes.json(),
        hrRes.json(),
        policyRes.json()
      ]);

      setPolicies(policiesData);

      const mappedClaims = claimsData.map(claim => {
        const employee = employees.find(e => e.id === (claim.employeeId || claim.employee_id));
        const hr = hrs.find(h => h.id === (claim.assignedHrId || claim.assigned_hr_id));
        const policy = policiesData.find(p => p.id === (claim.policyId || claim.policy_id));

        return {
          ...claim,
          employeeName: employee?.name || "Unknown",
          employeeIdDisplay: employee?.employeeId || "N/A",
          documents: claim.documents || [],
          assignedHrName: hr?.name || "Not Assigned",
          policyName: policy?.policyName || "N/A",
          remarks: claim.remarks || "",
        };
      });

      setClaims(mappedClaims);
    } catch (err) {
      console.error("Error fetching claims:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============= REGISTER HANDLERS =============
  const handleRegisterHR = async (hrData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const payload = {
        name: hrData.name,
        email: hrData.email,
        password: hrData.password,
        phoneNumber: hrData.phoneNumber.replace(/\s/g, ""), // ✅ space remove
        hrId: hrData.hrId
      };

    

    await axios.post(
      "http://localhost:8080/admin/hr/register",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    setNewHR({ name: "", email: "", phoneNumber: "", hrId: "", password: "" });
    setActiveTab("users");
    fetchUsers();
  } catch (err) {
    console.error("Register HR error:", err.response?.data || err);
    alert(err.response?.data?.message || "HR registration failed");
  }
};


const handleRegisterAgent = async (agentData) => {
  try {
    const token = localStorage.getItem("token");
    await axios.post("http://localhost:8080/admin/agent/register", agentData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNewAgent({ name: "", email: "", password: "" });
    setActiveTab("users");
    fetchUsers();
  } catch (err) {
    console.error("Failed to register Agent", err);
    alert("Error registering Agent");
  }
};

// ============= INITIAL LOAD =============
useEffect(() => {
  fetchUsers();
  fetchAllClaims();
}, [fetchUsers, fetchAllClaims]);

// ============= CALCULATE STATS =============
const stats = {
  totalUsers: users.length,
  totalHR: users.filter(u => u.role === "HR").length,
  totalAgents: users.filter(u => u.role === "Agent").length,
  totalEmployees: users.filter(u => u.role === "Employee").length,
  activeUsers: users.filter(u => u.status?.toLowerCase() === "active").length,
  totalClaims: claims.length,
  pendingClaims: claims.filter(c => {
    const status = (c.status || c.claimStatus || "").toLowerCase();
    return ["pending", "awaiting", "open", "submitted"].includes(status);
  }).length,
  resolvedClaims: claims.filter(c => {
    const status = (c.status || c.claimStatus || "").toLowerCase();
    return ["resolved", "approved", "closed", "completed"].includes(status);
  }).length,
  highPriority: claims.filter(c => {
    const priority = (c.priority || "").toLowerCase();
    return ["high", "urgent", "critical"].includes(priority);
  }).length,
  totalPolicies: policies.length
};

// ============= RENDER HOME DASHBOARD =============
const renderHomeDashboard = () => {
  const claimsTrendData = [
    { month: 'Jan', claims: 45 },
    { month: 'Feb', claims: 52 },
    { month: 'Mar', claims: 48 },
    { month: 'Apr', claims: 65 },
    { month: 'May', claims: 58 },
    { month: 'Jun', claims: 72 }
  ];

  const userDistributionData = [
    { name: 'Employees', value: stats.totalEmployees },
    { name: 'HR', value: stats.totalHR },
    { name: 'Agents', value: stats.totalAgents }
  ];

  const recentActivities = claims.slice(-6).reverse().map(c => ({
    id: c.id,
    action: `Claim by ${c.employeeName || "Unknown"}`,
    detail: `Policy: ${c.policyName || "N/A"}`,
    time: new Date(c.createdAt || Date.now()).toLocaleString(),
    status: (c.status || "").toLowerCase(),
    icon: "bi-file-earmark-text"
  }));

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-100"
    >
      {/* Header Section */}
      <div className="mb-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="d-flex justify-content-between align-items-center flex-wrap gap-3"
        >
          <div>
            <h2 className="fw-bold mb-1" style={{ color: theme.primary }}>
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard Overview
            </h2>
            <p className="text-muted mb-0">
              Welcome back, Admin. Here's what's happening today.
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="badge fs-6 px-3 py-2 d-flex align-items-center gap-2"
              style={{ background: theme.gradient, color: 'white' }}
            >
              <span className="pulse-dot"></span>
              System Online
            </motion.div>
            <small className="text-muted">
              {new Date().toLocaleString()}
            </small>
          </div>
        </motion.div>
      </div>

      {/* Stats Cards Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="row g-4 mb-4"
      >
        {/* Total Users Card */}
        <motion.div variants={cardVariants} className="col-xl-3 col-md-6">
          <motion.div
            whileHover="hover"
            className="card border-0 shadow-sm h-100 overflow-hidden"
            style={{ background: theme.gradientLight }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1 small">Total Users</p>
                  <h2 className="fw-bold mb-0" style={{ color: theme.primary }}>
                    <AnimatedCounter value={stats.totalUsers} />
                  </h2>
                </div>
                <div className="metric-icon-wrapper" style={{ background: theme.gradient }}>
                  <i className="bi bi-people fs-3 text-white"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Active Users</span>
                <span className="fw-semibold">{stats.activeUsers}</span>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <motion.div
                  className="progress-bar"
                  style={{ background: theme.gradient }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                ></motion.div>
              </div>
              <div className="mt-2 d-flex gap-2 flex-wrap">
                <span className="badge bg-light text-dark small">
                  {stats.totalEmployees} Employees
                </span>
                <span className="badge bg-light text-dark small">
                  {stats.totalHR} HR
                </span>
                <span className="badge bg-light text-dark small">
                  {stats.totalAgents} Agents
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Claims Overview Card */}
        <motion.div variants={cardVariants} className="col-xl-3 col-md-6">
          <motion.div
            whileHover="hover"
            className="card border-0 shadow-sm h-100"
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1 small">Total Claims</p>
                  <h2 className="fw-bold mb-0" style={{ color: theme.info }}>
                    <AnimatedCounter value={stats.totalClaims} />
                  </h2>
                </div>
                <div className="metric-icon-wrapper" style={{ backgroundColor: '#3b82f615' }}>
                  <i className="bi bi-clipboard-data fs-3" style={{ color: theme.info }}></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="text-center flex-fill">
                  <div className="fs-5 fw-bold" style={{ color: theme.warning }}>{stats.pendingClaims}</div>
                  <small className="text-muted">Pending</small>
                </div>
                <div className="vr"></div>
                <div className="text-center flex-fill">
                  <div className="fs-5 fw-bold" style={{ color: theme.success }}>{stats.resolvedClaims}</div>
                  <small className="text-muted">Resolved</small>
                </div>
              </div>
              <div className="progress" style={{ height: '6px' }}>
                <motion.div
                  className="progress-bar bg-success"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.resolvedClaims / Math.max(stats.totalClaims, 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* High Priority Alerts */}
        <motion.div variants={cardVariants} className="col-xl-3 col-md-6">
          <motion.div
            whileHover="hover"
            className="card border-0 shadow-sm h-100"
            style={{ borderLeft: `4px solid ${theme.danger}` }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1 small">Priority Alerts</p>
                  <h2 className="fw-bold mb-0" style={{ color: theme.danger }}>
                    <AnimatedCounter value={stats.highPriority} />
                  </h2>
                </div>
                <div className="metric-icon-wrapper" style={{ backgroundColor: '#ef444415' }}>
                  <i className="bi bi-exclamation-triangle fs-3" style={{ color: theme.danger }}></i>
                </div>
              </div>
              <p className="text-muted small mb-3">
                Requires immediate attention
              </p>
              {stats.highPriority > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-sm w-100"
                  style={{ background: theme.gradient, color: 'white' }}
                  onClick={() => setActiveTab("claims")}
                >
                  Review Now <i className="bi bi-arrow-right ms-1"></i>
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* System Health */}
        <motion.div variants={cardVariants} className="col-xl-3 col-md-6">
          <motion.div
            whileHover="hover"
            className="card border-0 shadow-sm h-100"
          >
            <div className="card-body text-center">
              <p className="text-muted mb-3 small">System Health</p>
              <ProgressCircle
                percentage={parseFloat(systemHealth.uptime)}
                size={100}
                strokeWidth={10}
                color={theme.success}
              />
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">CPU</small>
                  <small className="fw-semibold">{systemHealth.cpu}%</small>
                </div>
                <div className="progress mb-2" style={{ height: '4px' }}>
                  <div className="progress-bar bg-success" style={{ width: `${systemHealth.cpu}%` }}></div>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">Memory</small>
                  <small className="fw-semibold">{systemHealth.memory}%</small>
                </div>
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-bar bg-info" style={{ width: `${systemHealth.memory}%` }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        {/* Claims Trend Chart */}
        <div className="col-lg-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card border-0 shadow-sm"
          >
            <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold" style={{ color: theme.primary }}>
                <i className="bi bi-graph-up me-2"></i>
                Claims Trend
              </h5>
              <div className="btn-group btn-group-sm" role="group">
                <button type="button" className="btn btn-outline-secondary active">6M</button>
                <button type="button" className="btn btn-outline-secondary">1Y</button>
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={claimsTrendData}>
                  <defs>
                    <linearGradient id="claimGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.secondary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={theme.secondary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="claims"
                    stroke={theme.secondary}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#claimGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* User Distribution Pie Chart */}
        <div className="col-lg-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card border-0 shadow-sm h-100"
          >
            <div className="card-header bg-transparent border-0">
              <h5 className="mb-0 fw-semibold" style={{ color: theme.primary }}>
                <i className="bi bi-pie-chart me-2"></i>
                User Distribution
              </h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card border-0 shadow-sm"
      >
        <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-semibold" style={{ color: theme.primary }}>
            <i className="bi bi-clock-history me-2"></i>
            Recent Activity
          </h5>
          <button
            className="btn btn-sm btn-link text-decoration-none"
            style={{ color: theme.secondary }}
            onClick={() => setActiveTab("audit")}
          >
            View All <i className="bi bi-arrow-right"></i>
          </button>
        </div>
        <div className="card-body">
          <div className="activity-timeline">
            {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="activity-item d-flex align-items-start mb-3 p-3 rounded hover-bg"
              >
                <div className="activity-icon me-3">
                  <div
                    className="rounded-circle p-2"
                    style={{
                      backgroundColor: activity.status.includes('pending') ? '#fef3c7' : '#d1fae5',
                      color: activity.status.includes('pending') ? theme.warning : theme.success
                    }}
                  >
                    <i className={`${activity.icon} fs-5`}></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1 fw-semibold">{activity.action}</h6>
                      <p className="text-muted mb-1 small">{activity.detail}</p>
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {activity.time}
                      </small>
                    </div>
                    <span
                      className={`badge ${activity.status.includes('pending') ? 'bg-warning' : 'bg-success'}`}
                    >
                      {activity.status.includes('pending') ? 'Pending' : 'Completed'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-4 text-muted"></i>
                <p className="text-muted mt-3">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============= RENDER CONTENT BASED ON ACTIVE TAB =============
const renderContent = () => {
  if (isLoading && activeTab === "home") {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border" style={{ color: theme.secondary, width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  switch (activeTab) {
    case "home":
      return renderHomeDashboard();

    case "users":
      return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <AdminUserManagement users={users} setActiveTab={setActiveTab} />
        </motion.div>
      );

    case "registerHR":
      return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <HrRegister
            onBack={() => setActiveTab("users")}
            onRegister={handleRegisterHR}
            newHR={newHR}
            setNewHR={setNewHR}
          />
        </motion.div>
      );

    case "registerAgent":
      return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <AgentRegister
            onBack={() => setActiveTab("users")}
            onRegister={handleRegisterAgent}
            newAgent={newAgent}
            setNewAgent={setNewAgent}
          />
        </motion.div>
      );

    case "createPolicy":
      return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <AdminPolicy />
        </motion.div>
      );

    case "claims":
      return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <AdminAllClaims claims={claims} />
        </motion.div>
      );

    case "reports":
      return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <AdminReportsAnalytics />
        </motion.div>
      );

    case "fraud":
      return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <AdminFraudClaims />
        </motion.div>
      );

    case "audit":
      return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <AdminAuditLogs themeColors={theme} />
        </motion.div>
      );

    default:
      return renderHomeDashboard();
  }
};

// ============= SIDEBAR MENU ITEMS =============
const menuItems = [
  { id: "home", icon: "bi-speedometer2", label: "Dashboard", badge: null },
  { id: "users", icon: "bi-people", label: "User Management", badge: stats.totalUsers },
  { id: "registerHR", icon: "bi-person-plus", label: "Register HR", badge: null },
  { id: "registerAgent", icon: "bi-person-badge", label: "Register Agent", badge: null },
  { id: "createPolicy", icon: "bi-file-medical", label: "Policy Management", badge: stats.totalPolicies },
  { id: "claims", icon: "bi-card-list", label: "Claims Overview", badge: stats.pendingClaims },
  { id: "reports", icon: "bi-graph-up", label: "Reports & Analytics", badge: null },
  { id: "fraud", icon: "bi-shield-exclamation", label: "Fraud Detection", badge: stats.highPriority },
  { id: "audit", icon: "bi-list-check", label: "Audit Logs", badge: null },
];

return (
  <div className="admin-dashboard-enhanced">
    {/* ============= HEADER ============= */}
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="dashboard-header shadow-lg"
    >
      <div className="container-fluid">
        <div className="row align-items-center py-3 px-2">
          {/* Left: Brand */}
          <div className="col-md-4 d-flex align-items-center">
            <button
              className="btn btn-link text-white d-md-none me-2 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className="bi bi-list fs-3"></i>
            </button>
            <motion.div
              className="d-flex align-items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="brand-logo-wrapper">
                <i className="bi bi-shield-check fs-2 text-white"></i>
              </div>
              <div>
                <h4 className="mb-0 fw-bold text-white">InsurAI Admin</h4>
                <small className="text-white-50">v2.0 Enterprise</small>
              </div>
            </motion.div>
          </div>

          {/* Center: Search */}
          <div className="col-md-4 d-none d-md-block">
            <div className="search-wrapper position-relative">
              <i className="bi bi-search position-absolute text-white-50"
                style={{ left: '15px', top: '50%', transform: 'translateY(-50%)' }}></i>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '12px',
                  paddingLeft: '45px',
                  color: 'white'
                }}
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="col-md-4 d-flex justify-content-end align-items-center gap-3">
            {/* Notifications */}
            <motion.div
              className="position-relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="btn btn-link text-white p-2 position-relative">
                <i className="bi bi-bell fs-5"></i>
                {notificationCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notificationCount}
                  </span>
                )}
              </button>
            </motion.div>

            {/* User Profile */}
            <div className="dropdown">
              <button
                className="btn btn-link text-white p-0 d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
              >
                <div className="text-end d-none d-lg-block">
                  <div className="fw-semibold small">Admin User</div>
                  <small className="text-white-50">System Administrator</small>
                </div>
                <div className="avatar-wrapper">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'rgba(255,255,255,0.2)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    <i className="bi bi-person-circle fs-4 text-white"></i>
                  </div>
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow">
                <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>Profile</a></li>
                <li><a className="dropdown-item" href="#"><i className="bi bi-gear me-2"></i>Settings</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.header>

    {/* ============= MAIN LAYOUT ============= */}
    <div className="dashboard-main-layout d-flex">
      {/* ============= SIDEBAR ============= */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth > 768) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25 }}
            className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
          >
            <nav className="sidebar-nav p-3">
              {menuItems.map((item, index) => (
                <motion.a
                  key={item.id}
                  href="#"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                  className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <i className={`${item.icon} me-3`}></i>
                  <span className="flex-grow-1">{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span className="badge rounded-pill bg-danger">{item.badge}</span>
                  )}
                </motion.a>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer p-3 border-top">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="pulse-dot small"></span>
                <small className="text-muted">System Online</small>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">v2.0.1 Enterprise</small>
                <i className="bi bi-info-circle text-muted"></i>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ============= CONTENT AREA ============= */}
      <main className="dashboard-content flex-grow-1">
        <div className="content-wrapper p-4">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>
    </div>

    {/* ============= GLOBAL STYLES ============= */}
    <style>{`
        .admin-dashboard-enhanced {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        /* ============= HEADER ============= */
        .dashboard-header {
          background: ${theme.gradient};
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .brand-logo-wrapper {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .search-input::placeholder {
          color: rgba(255,255,255,0.6);
        }

        /* ============= SIDEBAR ============= */
        .dashboard-sidebar {
          width: 280px;
          background: white;
          box-shadow: 2px 0 10px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 80px;
          height: calc(100vh - 80px);
          overflow-y: auto;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          margin-bottom: 4px;
          border-radius: 10px;
          color: #64748b;
          text-decoration: none;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .sidebar-link:hover {
          background: ${theme.gradientLight};
          color: ${theme.primary};
        }

        .sidebar-link.active {
          background: ${theme.gradient};
          color: white;
          box-shadow: 0 4px 12px rgba(139,0,134,0.3);
        }

        .sidebar-link.active i {
          color: white;
        }

        .sidebar-footer {
          background: linear-gradient(to top, #f8f9fa 0%, transparent 100%);
        }

        /* ============= CONTENT ============= */
        .dashboard-content {
          background: transparent;
          overflow-y: auto;
          height: calc(100vh - 80px);
        }

        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* ============= METRIC CARDS ============= */
        .metric-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .card {
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .shadow-hover:hover {
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
        }

        /* ============= PROGRESS CIRCLE ============= */
        .progress-circle {
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
        }

        /* ============= ACTIVITY TIMELINE ============= */
        .activity-item {
          transition: all 0.2s ease;
        }

        .activity-item:hover {
          background: ${theme.gradientLight};
          transform: translateX(5px);
        }

        .activity-icon {
          flex-shrink: 0;
        }

        .hover-bg {
          transition: background 0.2s ease;
        }

        /* ============= PULSE ANIMATION ============= */
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: ${theme.success};
          border-radius: 50%;
          display: inline-block;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16,185,129,0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(16,185,129,0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16,185,129,0);
          }
        }

        /* ============= MOBILE RESPONSIVE ============= */
        @media (max-width: 768px) {
          .dashboard-sidebar {
            position: fixed;
            top: 0;
            left: -280px;
            height: 100vh;
            z-index: 1050;
            transition: left 0.3s ease;
          }

          .dashboard-sidebar.mobile-open {
            left: 0;
          }

          .mobile-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1040;
          }

          .dashboard-content {
            width: 100%;
          }
        }

        /* ============= SCROLLBAR STYLING ============= */
        .dashboard-sidebar::-webkit-scrollbar,
        .dashboard-content::-webkit-scrollbar {
          width: 6px;
        }

        .dashboard-sidebar::-webkit-scrollbar-track,
        .dashboard-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .dashboard-sidebar::-webkit-scrollbar-thumb,
        .dashboard-content::-webkit-scrollbar-thumb {
          background: ${theme.secondary};
          border-radius: 10px;
        }

        /* ============= BADGE VARIANTS ============= */
        .badge {
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        /* ============= DROPDOWN IMPROVEMENTS ============= */
        .dropdown-menu {
          border: none;
          border-radius: 12px;
          padding: 8px;
        }

        .dropdown-item {
          border-radius: 8px;
          padding: 10px 15px;
          transition: all 0.2s ease;
        }

        .dropdown-item:hover {
          background: ${theme.gradientLight};
          color: ${theme.primary};
        }

        /* ============= CHART TOOLTIPS ============= */
        .recharts-tooltip-wrapper {
          outline: none;
        }

        /* ============= BUTTON ENHANCEMENTS ============= */
        .btn {
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        /* ============= LOADING STATE ============= */
        .spinner-border {
          animation: spinner-border 0.75s linear infinite;
        }

        /* ============= ALERTS ============= */
        .alert {
          border-radius: 12px;
          border: none;
        }
      `}</style>
  </div>
);
}