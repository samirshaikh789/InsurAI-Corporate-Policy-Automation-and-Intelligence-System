import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { CSVLink } from "react-csv";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useMemo } from "react";

// Enhanced Color constants
const COLORS = {
  PRIMARY: '#8b0086',        // Purple
  ACCENT_2: '#d16ba5',       // Bright Orchid
  ACCENT_3: '#b57edc',       // Lavender Mist
  CONTRAST: '#5ce1e6',       // Cyan Aqua
  WARNING: '#f5c518',        // Gold
  SUCCESS: '#00d084',        // Green - NEW
  BACKGROUND: '#ffffffff',   // Light Lavender White
  TEXT_MUTED: '#6b5b6e',     // Grayish Violet
  DARK: '#2b0938ff',         // Dark text
  LIGHT_PURPLE: '#f8f5ff'    // Light Purple Background - NEW
};

export default function AdminReportsAnalytics() {
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [employeeClaimsMap, setEmployeeClaimsMap] = useState({});

  // Colors for charts - updated with theme
  const CHART_COLORS = [COLORS.ACCENT_2, COLORS.CONTRAST, COLORS.ACCENT_3, COLORS.WARNING, "#96CEB4", "#DDA0DD"];
  const STATUS_COLORS = { 
    "Pending": COLORS.WARNING, 
    "Approved": "#28A745", 
    "Rejected": "#DC3545",
    "Processing": COLORS.CONTRAST
  };

  // Fetch data for reports
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      try {
        const [usersRes, claimsRes, policiesRes, hrsRes, agentsRes] = await Promise.all([
          axios.get("http://localhost:8080/auth/employees", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/admin/claims", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/admin/policies", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/hr", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:8080/agent", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setUsers(usersRes.data || []);
        setClaims(claimsRes.data || []);
        setPolicies(policiesRes.data || []);
        setHrs(hrsRes.data || []);
        setAgents(agentsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch report data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on date
  const filterDataByDate = (data, type) => {
    if (dateFilter === "all") return data;
    const now = new Date();
    let filterDate = new Date();

    switch(dateFilter) {
      case "today":
        filterDate.setHours(0,0,0,0);
        break;
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(item => {
      let itemDate;
      if (type === "claims") itemDate = item.claimDate || item.created_at;
      else if (type === "users") itemDate = item.joinDate;
      else if (type === "policies") itemDate = item.created_at;

      return itemDate && new Date(itemDate) >= filterDate;
    });
  };

  const filteredClaims = useMemo(() => filterDataByDate(claims, "claims"), [claims, dateFilter]);
  const filteredUsers = useMemo(() => filterDataByDate(users, "users"), [users, dateFilter]);
  const filteredPolicies = useMemo(() => filterDataByDate(policies, "policies"), [policies, dateFilter]);

  // ==================== CALCULATED METRICS ====================

  const totalPolicies = policies.length;
  const totalEmployees = users.length;

  // Map employeeId (string) to number of claims
  useEffect(() => {
    if (!filteredClaims || filteredClaims.length === 0) {
      setEmployeeClaimsMap({});
      return;
    }

    const map = {};
    filteredClaims.forEach(claim => {
      const empId = claim.employeeId || claim.employee_id;
      if (empId) map[empId] = (map[empId] || 0) + 1;
    });

    setEmployeeClaimsMap(map);
  }, [filteredClaims]);

  // Employees with at least one claim
  const employeesWithClaims = users.filter(user => 
    employeeClaimsMap[user.id] > 0
  ).length;

  // Average claims per employee
  const averageClaimPerEmployee = totalEmployees > 0 
    ? (filteredClaims.length / totalEmployees).toFixed(1) 
    : 0;

  // Average amount per employee
  const averageAmountPerEmployee = totalEmployees > 0
    ? (filteredClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0) / totalEmployees).toFixed(2)
    : 0;

  // HR Reports - calculate workload using **all claims**, ignoring date filter
  const hrWorkload = hrs.map(hr => {
    const hrClaims = claims.filter(
      claim => String(claim.assignedHrId) === String(hr.id)
    );

    const approved = hrClaims.filter(c => c.status === "Approved").length;
    const rejected = hrClaims.filter(c => c.status === "Rejected").length;
    const pending = hrClaims.filter(c => c.status === "Pending").length;
    const total = hrClaims.length;

    return {
      ...hr,
      approved,
      rejected,
      pending,
      total,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0
    };
  });

  // Total agents
  const totalAgents = agents.length;

  // Policy usage
  const policyUsage = policies.map(policy => {
    const policyClaims = filteredClaims.filter(claim => 
      claim.policyId === policy.policyId || claim.policyName === policy.policyName
    );
    const claimCount = policyClaims.length;
    const totalAmount = policyClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0);

    return {
      ...policy,
      claimCount,
      totalAmount,
      avgPerClaim: claimCount > 0 ? (totalAmount / claimCount).toFixed(2) : 0
    };
  });

  // Claims summary
  const totalClaims = filteredClaims.length;
  const claimsByStatus = Object.entries(
    filteredClaims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] }));

  // Monthly trends
  const monthlyClaims = () => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthClaims = filteredClaims.filter(claim => {
        const claimDate = new Date(claim.claimDate || claim.created_at);
        return claimDate.getMonth() === index && claimDate.getFullYear() === currentYear;
      });
      return {
        month,
        claims: monthClaims.length,
        amount: monthClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0)
      };
    });
  };

  // ==================== EXPORT FUNCTIONS ====================

  const downloadFullPDFReport = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('COMPREHENSIVE ADMIN REPORT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${date}`, 105, 28, { align: 'center' });
    doc.text(`Date Filter: ${dateFilter === 'all' ? 'All Time' : dateFilter}`, 105, 34, { align: 'center' });

    let startY = 45;

    // Executive Summary
    doc.setFontSize(12);
    doc.setTextColor(139, 0, 134); // Primary color
    doc.text('EXECUTIVE SUMMARY', 14, startY);
    
    doc.autoTable({
      startY: startY + 5,
      head: [['Metric', 'Count', 'Amount (₹)']],
      body: [
        ['Total Employees', totalEmployees, '-'],
        ['Total HR Users', hrs.length, '-'],
        ['Total Agents', agents.length, '-'],
        ['Total Policies', policies.length, '-'],
        ['Total Claims', totalClaims, `₹${filteredClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0).toFixed(2)}`],
        ['Approved Claims', claimsByStatus.find(s => s.name === 'Approved')?.value || 0, '-'],
        ['Pending Claims', claimsByStatus.find(s => s.name === 'Pending')?.value || 0, '-']
      ],
      theme: 'grid',
      headStyles: { fillColor: [139, 0, 134], textColor: 255 },
      styles: { fontSize: 10 }
    });

    // Employee Summary
    startY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(139, 0, 134);
    doc.text('EMPLOYEE SUMMARY', 14, startY);
    
    doc.autoTable({
      startY: startY + 5,
      head: [['Employee Name', 'Role', 'Claims Count', 'Status']],
      body: users.slice(0, 10).map(user => [
        user.name || 'N/A',
        user.role || 'Employee',
        employeeClaimsMap[user.employeeId || user.name] || 0,
        user.status || 'Active'
      ]),
      theme: 'striped',
      styles: { fontSize: 8 }
    });

    // Claims Summary
    startY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(139, 0, 134);
    doc.text('RECENT CLAIMS ACTIVITY', 14, startY);
    
    doc.autoTable({
      startY: startY + 5,
      head: [['Employee', 'Policy', 'Amount (₹)', 'Date', 'Status', 'Assigned HR']],
      body: filteredClaims.slice(0, 15).map(claim => [
        claim.employeeName || 'N/A',
        claim.policyName || 'N/A',
        `₹${parseFloat(claim.amount || 0).toFixed(2)}`,
        new Date(claim.claimDate).toLocaleDateString(),
        claim.status,
        claim.processedByName || 'Not Assigned'
      ]),
      theme: 'grid',
      styles: { fontSize: 7 }
    });

    // Policy Summary
    startY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(139, 0, 134);
    doc.text('POLICY USAGE SUMMARY', 14, startY);
    
    doc.autoTable({
      startY: startY + 5,
      head: [['Policy Name', 'Type', 'Claims', 'Total Amount (₹)', 'Avg/Claim (₹)']],
      body: policyUsage.map(policy => [
        policy.policyName,
        policy.policyType,
        policy.claimCount,
        `₹${policy.totalAmount.toFixed(2)}`,
        `₹${policy.avgPerClaim}`
      ]),
      theme: 'striped',
      styles: { fontSize: 8 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('Generated by Claims Management System', 105, 295, { align: 'center' });
    }

    doc.save(`admin_comprehensive_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Remove password from employee CSV export
  const getEmployeesForCSV = () => {
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  };

  // Format currency with ₹ symbol
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ 
        height: '60vh', 
        backgroundColor: COLORS.LIGHT_PURPLE 
      }}>
        <div className="spinner-border mb-3" style={{ 
          color: COLORS.PRIMARY, 
          width: '4rem', 
          height: '4rem',
          borderWidth: '0.4rem'
        }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="fw-bold" style={{ color: COLORS.DARK }}>Loading Analytics Dashboard...</h5>
        <p className="text-muted">Please wait while we fetch your data</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ 
      backgroundColor: COLORS.LIGHT_PURPLE, 
      minHeight: '100vh' 
    }}>
      {/* Enhanced Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center pb-3 border-bottom">
            <div>
              <h2 style={{ color: COLORS.DARK }} className="fw-bold mb-1 d-flex align-items-center">
                <i className="bi bi-graph-up-arrow me-3" style={{ 
                  color: COLORS.PRIMARY, 
                  fontSize: '2rem' 
                }}></i>
                Reports & Analytics Dashboard
              </h2>
              <p style={{ color: COLORS.TEXT_MUTED }} className="mb-0 ms-5 ps-2">
                Comprehensive insights across employees, HR, agents, policies, and claims
              </p>
            </div>
            <div className="d-flex flex-column align-items-end">
              <div className="badge px-4 py-2 shadow-sm" style={{ 
                backgroundColor: COLORS.PRIMARY,
                borderRadius: '12px',
                fontSize: '0.9rem'
              }}>
                <i className="bi bi-circle-fill me-2" style={{ fontSize: '8px' }}></i>
                Live Analytics
              </div>
              <small className="text-muted mt-2">
                Last updated: {new Date().toLocaleTimeString()}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Date Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-3">
                  <label className="form-label fw-semibold mb-2" style={{ color: COLORS.DARK }}>
                    <i className="bi bi-calendar-range me-2"></i>
                    Date Range Filter
                  </label>
                  <select 
                    className="form-select" 
                    style={{ borderColor: COLORS.PRIMARY, borderRadius: '10px' }}
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
                <div className="col-md-9">
                  <label className="form-label fw-semibold mb-2" style={{ color: COLORS.DARK }}>
                    <i className="bi bi-speedometer2 me-2"></i>
                    Quick Stats
                  </label>
                  <div className="d-flex gap-2 flex-wrap align-items-center">
                    <span className="badge px-3 py-2 shadow-sm" style={{ 
                      backgroundColor: COLORS.PRIMARY,
                      borderRadius: '10px'
                    }}>
                      <i className="bi bi-people-fill me-2"></i>
                      Employees: {totalEmployees}
                    </span>
                    <span className="badge bg-success px-3 py-2 shadow-sm" style={{ borderRadius: '10px' }}>
                      <i className="bi bi-person-check-fill me-2"></i>
                      HR: {hrs.length}
                    </span>
                    <span className="badge px-3 py-2 shadow-sm" style={{ 
                      backgroundColor: COLORS.CONTRAST,
                      borderRadius: '10px'
                    }}>
                      <i className="bi bi-person-badge-fill me-2"></i>
                      Agents: {totalAgents}
                    </span>
                    <span className="badge px-3 py-2 shadow-sm" style={{ 
                      backgroundColor: COLORS.WARNING,
                      borderRadius: '10px'
                    }}>
                      <i className="bi bi-file-earmark-text-fill me-2"></i>
                      Policies: {totalPolicies}
                    </span>
                    <span className="badge bg-danger px-3 py-2 shadow-sm" style={{ borderRadius: '10px' }}>
                      <i className="bi bi-clipboard-data-fill me-2"></i>
                      Claims: {totalClaims}
                    </span>
                    <span className="badge bg-dark px-3 py-2 shadow-sm" style={{ borderRadius: '10px' }}>
                      <i className="bi bi-currency-rupee me-2"></i>
                      {formatCurrency(filteredClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-fill p-2 shadow-sm" style={{ 
            backgroundColor: 'white',
            borderRadius: '16px'
          }}>
            {[
              { id: "dashboard", label: "Dashboard", icon: "speedometer2" },
              { id: "employees", label: "Employees", icon: "people" },
              { id: "hr", label: "HR", icon: "person-check" },
              { id: "agents", label: "Agents", icon: "person-badge" },
              { id: "policies", label: "Policies", icon: "file-earmark-text" },
              { id: "claims", label: "Claims", icon: "clipboard-data" }
            ].map(tab => (
              <li key={tab.id} className="nav-item">
                <button 
                  className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                  style={{ 
                    backgroundColor: activeTab === tab.id ? COLORS.PRIMARY : 'transparent',
                    color: activeTab === tab.id ? 'white' : COLORS.TEXT_MUTED,
                    borderRadius: '12px',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    transition: 'all 0.3s ease',
                    border: 'none'
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`bi bi-${tab.icon} me-2`}></i>
                  <span className="d-none d-md-inline">{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="row">
          {/* Enhanced Summary Cards */}
          <div className="col-xl-2 col-md-4 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100 hover-card" style={{ 
              borderRadius: '16px',
              borderLeft: `5px solid ${COLORS.PRIMARY}`
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-uppercase mb-1 small fw-bold" style={{ 
                      color: COLORS.PRIMARY,
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}>
                      Employees
                    </div>
                    <div className="h2 mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                      {totalEmployees}
                    </div>
                  </div>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      backgroundColor: `${COLORS.PRIMARY}15` 
                    }}
                  >
                    <i className="bi bi-people-fill fs-3" style={{ color: COLORS.PRIMARY }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100 hover-card" style={{ 
              borderRadius: '16px',
              borderLeft: `5px solid #28A745`
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-uppercase mb-1 small fw-bold" style={{ 
                      color: '#28A745',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}>
                      HR Users
                    </div>
                    <div className="h2 mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                      {hrs.length}
                    </div>
                  </div>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      backgroundColor: '#28A74515' 
                    }}
                  >
                    <i className="bi bi-person-check-fill fs-3 text-success"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100 hover-card" style={{ 
              borderRadius: '16px',
              borderLeft: `5px solid ${COLORS.CONTRAST}`
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-uppercase mb-1 small fw-bold" style={{ 
                      color: COLORS.CONTRAST,
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}>
                      Agents
                    </div>
                    <div className="h2 mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                      {totalAgents}
                    </div>
                  </div>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      backgroundColor: `${COLORS.CONTRAST}15` 
                    }}
                  >
                    <i className="bi bi-person-badge-fill fs-3" style={{ color: COLORS.CONTRAST }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100 hover-card" style={{ 
              borderRadius: '16px',
              borderLeft: `5px solid ${COLORS.WARNING}`
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-uppercase mb-1 small fw-bold" style={{ 
                      color: COLORS.WARNING,
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}>
                      Policies
                    </div>
                    <div className="h2 mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                      {totalPolicies}
                    </div>
                  </div>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      backgroundColor: `${COLORS.WARNING}15` 
                    }}
                  >
                    <i className="bi bi-file-earmark-text-fill fs-3" style={{ color: COLORS.WARNING }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100 hover-card" style={{ 
              borderRadius: '16px',
              borderLeft: `5px solid #DC3545`
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-uppercase mb-1 small fw-bold" style={{ 
                      color: '#DC3545',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}>
                      Claims
                    </div>
                    <div className="h2 mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                      {totalClaims}
                    </div>
                  </div>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      backgroundColor: '#DC354515' 
                    }}
                  >
                    <i className="bi bi-clipboard-data-fill fs-3 text-danger"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-2 col-md-4 col-6 mb-3">
            <div className="card border-0 shadow-sm h-100 hover-card" style={{ 
              borderRadius: '16px',
              borderLeft: `5px solid #6c757d`
            }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-uppercase mb-1 small fw-bold" style={{ 
                      color: '#6c757d',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}>
                      Amount
                    </div>
                    <div className="h5 mb-0 fw-bold" style={{ color: COLORS.DARK, fontSize: '1.2rem' }}>
                      {formatCurrency(filteredClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0))}
                    </div>
                  </div>
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '56px', 
                      height: '56px', 
                      backgroundColor: '#6c757d15' 
                    }}
                  >
                    <i className="bi bi-currency-rupee fs-3 text-secondary"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Charts Row */}
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-white border-0 py-3" style={{ 
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }}>
                <h5 className="mb-0 fw-bold d-flex align-items-center" style={{ color: COLORS.DARK }}>
                  <i className="bi bi-pie-chart me-2" style={{ color: COLORS.PRIMARY }}></i>
                  Claims Status Distribution
                </h5>
              </div>
              <div className="card-body">
                {claimsByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie 
                        data={claimsByStatus} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100}
                        label
                      >
                        {claimsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-pie-chart display-4 mb-3" style={{ color: `${COLORS.PRIMARY}30` }}></i>
                    <p className="text-muted">No claims data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-white border-0 py-3" style={{ 
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }}>
                <h5 className="mb-0 fw-bold d-flex align-items-center" style={{ color: COLORS.DARK }}>
                  <i className="bi bi-bar-chart me-2" style={{ color: COLORS.ACCENT_2 }}></i>
                  Policy Usage Analytics
                </h5>
              </div>
              <div className="card-body">
                {policyUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={policyUsage.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="policyName" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="claimCount" name="Number of Claims" fill={COLORS.ACCENT_2} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-bar-chart display-4 mb-3" style={{ color: `${COLORS.ACCENT_2}30` }}></i>
                    <p className="text-muted">No policy data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-white border-0 py-3" style={{ 
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }}>
                <h5 className="mb-0 fw-bold d-flex align-items-center" style={{ color: COLORS.DARK }}>
                  <i className="bi bi-graph-up me-2" style={{ color: COLORS.ACCENT_3 }}></i>
                  Monthly Claims Trend
                </h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyClaims()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="claims" stroke={COLORS.ACCENT_3} strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Reports Tab */}
      {activeTab === "employees" && (
        <div className="row">
          {users.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body text-center py-5">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      backgroundColor: `${COLORS.PRIMARY}15` 
                    }}
                  >
                    <i className="bi bi-people display-1" style={{ color: COLORS.PRIMARY }}></i>
                  </div>
                  <h4 className="fw-bold mb-2" style={{ color: COLORS.DARK }}>No Employees Found</h4>
                  <p style={{ color: COLORS.TEXT_MUTED }}>
                    No employee data available for the selected date range.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Employee Metrics */}
              <div className="col-md-4 mb-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center" style={{ 
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                  }}>
                    <h5 className="mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                      <i className="bi bi-graph-up me-2" style={{ color: COLORS.PRIMARY }}></i>
                      Employee Metrics
                    </h5>
                    <CSVLink 
                      data={getEmployeesForCSV()} 
                      filename="employee_report.csv"
                      className="btn btn-sm btn-success shadow-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      <i className="bi bi-download me-1"></i>CSV
                    </CSVLink>
                  </div>
                  <div className="card-body">
                    <div className="row text-center g-3">
                      <div className="col-6">
                        <div className="border rounded p-3" style={{ borderRadius: '12px', backgroundColor: `${COLORS.PRIMARY}08` }}>
                          <h3 className="mb-1 fw-bold" style={{ color: COLORS.PRIMARY }}>{totalEmployees}</h3>
                          <small style={{ color: COLORS.TEXT_MUTED }}>Total Employees</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded p-3" style={{ borderRadius: '12px', backgroundColor: '#28A74508' }}>
                          <h3 className="mb-1 fw-bold text-success">{filteredClaims.length}</h3>
                          <small style={{ color: COLORS.TEXT_MUTED }}>Total Claims</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded p-3" style={{ borderRadius: '12px', backgroundColor: `${COLORS.CONTRAST}08` }}>
                          <h3 className="mb-1 fw-bold" style={{ color: COLORS.CONTRAST }}>
                            {averageClaimPerEmployee}
                          </h3>
                          <small style={{ color: COLORS.TEXT_MUTED }}>Avg Claims/Employee</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded p-3" style={{ borderRadius: '12px', backgroundColor: `${COLORS.WARNING}08` }}>
                          <h4 className="mb-1 fw-bold" style={{ color: COLORS.WARNING, fontSize: '1.3rem' }}>
                            {formatCurrency(
                              filteredClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0) / totalEmployees
                            )}
                          </h4>
                          <small style={{ color: COLORS.TEXT_MUTED }}>Avg Amount/Employee</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee List */}
              <div className="col-md-8 mb-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-white border-0 py-3" style={{ 
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                  }}>
                    <h5 className="mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                      <i className="bi bi-list-ul me-2" style={{ color: COLORS.PRIMARY }}></i>
                      Employee Directory
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: `${COLORS.PRIMARY}08` }}>
                          <tr>
                            <th className="border-0 py-3 px-4 fw-bold" style={{ color: COLORS.DARK }}>Name</th>
                            <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Role</th>
                            <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Claims Count</th>
                            <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.slice(0, 10).map(user => (
                            <tr key={user.id || user.employeeId}>
                              <td className="px-4" style={{ color: COLORS.DARK }}>{user.name || 'N/A'}</td>
                              <td><span className="badge bg-secondary px-3 py-2" style={{ borderRadius: '8px' }}>{user.role || 'Employee'}</span></td>
                              <td>
                                <span className="badge px-3 py-2 shadow-sm" style={{ 
                                  backgroundColor: COLORS.PRIMARY,
                                  borderRadius: '8px'
                                }}>
                                  {employeeClaimsMap[user.id] || 0}
                                </span>
                              </td>
                              <td>
                                <span className={`badge px-3 py-2 shadow-sm ${(user.status === 'Active' || !user.status) ? 'bg-success' : 'bg-warning'}`} style={{ borderRadius: '8px' }}>
                                  {user.status || 'Active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* HR Reports Tab */}
      {activeTab === "hr" && (
        <div className="row">
          {hrs.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body text-center py-5">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      backgroundColor: '#28A74515' 
                    }}
                  >
                    <i className="bi bi-person-check display-1 text-success"></i>
                  </div>
                  <h4 className="fw-bold mb-2" style={{ color: COLORS.DARK }}>No HR Users Found</h4>
                  <p style={{ color: COLORS.TEXT_MUTED }}>
                    No HR data available at the moment.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="col-12 mb-4">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center" style={{ 
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px'
                }}>
                  <h5 className="mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                    <i className="bi bi-clipboard-check me-2" style={{ color: COLORS.SUCCESS }}></i>
                    HR Performance Overview
                  </h5>
                  <CSVLink 
                    data={hrWorkload} 
                    filename="hr_report.csv"
                    className="btn btn-sm btn-success shadow-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-download me-1"></i>CSV
                  </CSVLink>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ backgroundColor: `${COLORS.SUCCESS}08` }}>
                        <tr>
                          <th className="border-0 py-3 px-4 fw-bold" style={{ color: COLORS.DARK }}>HR Name</th>
                          <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Approved</th>
                          <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Rejected</th>
                          <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Pending</th>
                          <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Total</th>
                          <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Approval Rate</th>
                          <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Workload</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hrs.map(hr => {
                          const hrClaims = filteredClaims.filter(
                            claim => Number(claim.assignedHrId) === Number(hr.id)
                          );

                          const approved = hrClaims.filter(c => c.status === "Approved").length;
                          const rejected = hrClaims.filter(c => c.status === "Rejected").length;
                          const pending = hrClaims.filter(c => c.status === "Pending").length;
                          const total = hrClaims.length;
                          const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;

                          return (
                            <tr key={hr.hrId || hr.id}>
                              <td className="px-4" style={{ color: COLORS.DARK }}>{hr.name || 'HR User'}</td>
                              <td><span className="badge bg-success px-3 py-2 shadow-sm" style={{ borderRadius: '8px' }}>{approved}</span></td>
                              <td><span className="badge bg-danger px-3 py-2 shadow-sm" style={{ borderRadius: '8px' }}>{rejected}</span></td>
                              <td><span className="badge bg-warning px-3 py-2 shadow-sm" style={{ borderRadius: '8px' }}>{pending}</span></td>
                              <td><span className="badge px-3 py-2 shadow-sm" style={{ backgroundColor: COLORS.PRIMARY, borderRadius: '8px' }}>{total}</span></td>
                              <td><span className="badge px-3 py-2 shadow-sm" style={{ backgroundColor: COLORS.CONTRAST, borderRadius: '8px' }}>{approvalRate}%</span></td>
                              <td>
                                <div className="progress" style={{ height: '10px', borderRadius: '8px' }}>
                                  <div 
                                    className="progress-bar bg-success" 
                                    style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
                                  ></div>
                                  <div 
                                    className="progress-bar bg-danger" 
                                    style={{ width: `${total > 0 ? (rejected / total) * 100 : 0}%` }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Agent Reports Tab */}
      {activeTab === "agents" && (
        <div className="row">
          {agents.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body text-center py-5">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      backgroundColor: `${COLORS.CONTRAST}15` 
                    }}
                  >
                    <i className="bi bi-person-badge display-1" style={{ color: COLORS.CONTRAST }}></i>
                  </div>
                  <h4 className="fw-bold mb-2" style={{ color: COLORS.DARK }}>No Agents Found</h4>
                  <p style={{ color: COLORS.TEXT_MUTED }}>
                    No agent data available at the moment.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="col-md-6 mb-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-body text-center py-5">
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        backgroundColor: `${COLORS.CONTRAST}15` 
                      }}
                    >
                      <i className="bi bi-person-badge display-1" style={{ color: COLORS.CONTRAST }}></i>
                    </div>
                    <h2 className="fw-bold mb-2" style={{ color: COLORS.CONTRAST }}>{totalAgents}</h2>
                    <h5 className="mb-2" style={{ color: COLORS.DARK }}>Total Agents</h5>
                    <p style={{ color: COLORS.TEXT_MUTED }}>Active insurance agents in the system</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-white border-0 py-3" style={{ 
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                  }}>
                    <h5 className="mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                      <i className="bi bi-list-ul me-2" style={{ color: COLORS.CONTRAST }}></i>
                      Agent Directory
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: `${COLORS.CONTRAST}08` }}>
                          <tr>
                            <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Agent Name</th>
                            <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {agents.slice(0, 5).map(agent => (
                            <tr key={agent.agentId || agent.id}>
                              <td style={{ color: COLORS.DARK }}>{agent.name || 'N/A'}</td>
                              <td style={{ color: COLORS.DARK }}>{agent.email || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Policy Reports Tab */}
      {activeTab === "policies" && (
        <div className="row">
          {policies.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body text-center py-5">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      backgroundColor: `${COLORS.WARNING}15` 
                    }}
                  >
                    <i className="bi bi-file-earmark-text display-1" style={{ color: COLORS.WARNING }}></i>
                  </div>
                  <h4 className="fw-bold mb-2" style={{ color: COLORS.DARK }}>No Policies Found</h4>
                  <p style={{ color: COLORS.TEXT_MUTED }}>
                    No policy data available at the moment.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="col-12 mb-4">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center" style={{ 
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px'
                }}>
                  <h5 className="mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                    <i className="bi bi-graph-up-arrow me-2" style={{ color: COLORS.WARNING }}></i>
                    Policy Usage Analytics
                  </h5>
                  <CSVLink 
                    data={policyUsage} 
                    filename="policy_report.csv"
                    className="btn btn-sm btn-success shadow-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-download me-1"></i>CSV
                  </CSVLink>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ backgroundColor: `${COLORS.WARNING}08` }}>
                        <tr>
                          <th className="border-0 py-3 px-4 fw-bold" style={{ color: COLORS.DARK }}>Policy Name</th>
                          <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Type</th>
                          <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Claims Count</th>
                          <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Total Amount</th>
                          <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Avg per Claim</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policyUsage.map(policy => (
                          <tr key={policy.policyId || policy.id}>
                            <td className="px-4" style={{ color: COLORS.DARK }}>{policy.policyName}</td>
                            <td><span className="badge bg-secondary px-3 py-2 shadow-sm" style={{ borderRadius: '8px' }}>{policy.policyType}</span></td>
                            <td><span className="badge px-3 py-2 shadow-sm" style={{ backgroundColor: COLORS.PRIMARY, borderRadius: '8px' }}>{policy.claimCount}</span></td>
                            <td style={{ color: COLORS.DARK, fontWeight: '600' }}>{formatCurrency(policy.totalAmount)}</td>
                            <td style={{ color: COLORS.DARK, fontWeight: '600' }}>{formatCurrency(policy.avgPerClaim)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Claims Reports Tab */}
      {activeTab === "claims" && (
        <div className="row">
          {filteredClaims.length === 0 ? (
            <div className="col-12">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-body text-center py-5">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      backgroundColor: '#DC354515' 
                    }}
                  >
                    <i className="bi bi-clipboard-data display-1 text-danger"></i>
                  </div>
                  <h4 className="fw-bold mb-2" style={{ color: COLORS.DARK }}>No Claims Found</h4>
                  <p style={{ color: COLORS.TEXT_MUTED }}>
                    No claims data available for the selected date range.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Claims Summary */}
              <div className="col-md-4 mb-4">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-white border-0 py-3" style={{ 
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                  }}>
                    <h5 className="mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                      <i className="bi bi-pie-chart me-2" style={{ color: '#DC3545' }}></i>
                      Claims Summary
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center g-3">
                      {claimsByStatus.map(status => (
                        <div key={status.name} className="col-6">
                          <div className="border rounded p-3" style={{ borderRadius: '12px', backgroundColor: `${status.color}08` }}>
                            <h3 className="mb-1 fw-bold" style={{ color: status.color }}>
                              {status.value}
                            </h3>
                            <small style={{ color: COLORS.TEXT_MUTED }}>{status.name}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Claims Activity */}
              <div className="col-md-8 mb-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="card-header bg-white border-0 py-3" style={{ 
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                  }}>
                    <h5 className="mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                      <i className="bi bi-clock-history me-2" style={{ color: '#DC3545' }}></i>
                      Recent Claims Activity
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: '#DC354508' }}>
                          <tr>
                            <th className="border-0 py-3 px-4 fw-bold" style={{ color: COLORS.DARK }}>Employee</th>
                            <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Policy</th>
                            <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Amount</th>
                            <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Date</th>
                            <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Status</th>
                            <th className="border-0 py-3 fw-bold" style={{ color: COLORS.DARK }}>Assigned HR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredClaims.slice(0, 10).map(claim => {
                            const employee = users.find(u => u.id === claim.employeeId);
                            const hr = hrs.find(h => h.id === claim.assignedHrId);

                            return (
                              <tr key={claim.id}>
                                <td className="px-4" style={{ color: COLORS.DARK }}>{employee ? employee.name : `Emp#${claim.employeeId}`}</td>
                                <td style={{ color: COLORS.DARK }}>{claim.policyName || "N/A"}</td>
                                <td style={{ color: COLORS.DARK, fontWeight: '600' }}>{formatCurrency(claim.amount)}</td>
                                <td style={{ color: COLORS.DARK }}>{new Date(claim.claimDate).toLocaleDateString()}</td>
                                <td>
                                  <span
                                    className={`badge px-3 py-2 shadow-sm bg-${
                                      claim.status === "Approved"
                                        ? "success"
                                        : claim.status === "Rejected"
                                        ? "danger"
                                        : "warning"
                                    }`}
                                    style={{ borderRadius: '8px' }}
                                  >
                                    {claim.status}
                                  </span>
                                </td>
                                <td style={{ color: COLORS.DARK }}>{hr ? hr.name : "Not Assigned"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Enhanced Export Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <div className="card-header bg-white border-0 py-3" style={{ 
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}>
              <h5 className="mb-0 fw-bold d-flex align-items-center" style={{ color: COLORS.DARK }}>
                <i className="bi bi-download me-2" style={{ color: COLORS.PRIMARY }}></i>
                Export Reports
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-danger w-100 py-3 shadow-sm hover-lift" 
                    style={{ borderRadius: '12px', fontWeight: '500' }}
                    onClick={downloadFullPDFReport}
                  >
                    <i className="bi bi-file-pdf fs-4 d-block mb-2"></i>
                    <span>Full PDF Report</span>
                  </button>
                </div>
                <div className="col-md-3">
                  <CSVLink 
                    data={getEmployeesForCSV()} 
                    filename="employees_report.csv" 
                    className="btn btn-outline-primary w-100 py-3 shadow-sm text-decoration-none hover-lift" 
                    style={{ borderRadius: '12px', fontWeight: '500' }}
                  >
                    <i className="bi bi-file-spreadsheet fs-4 d-block mb-2"></i>
                    <span>Employees CSV</span>
                  </CSVLink>
                </div>
                <div className="col-md-3">
                  <CSVLink 
                    data={claims} 
                    filename="claims_report.csv" 
                    className="btn btn-outline-success w-100 py-3 shadow-sm text-decoration-none hover-lift" 
                    style={{ borderRadius: '12px', fontWeight: '500' }}
                  >
                    <i className="bi bi-file-spreadsheet fs-4 d-block mb-2"></i>
                    <span>Claims CSV</span>
                  </CSVLink>
                </div>
                <div className="col-md-3">
                  <CSVLink 
                    data={policies} 
                    filename="policies_report.csv" 
                    className="btn btn-outline-warning w-100 py-3 shadow-sm text-decoration-none hover-lift" 
                    style={{ borderRadius: '12px', fontWeight: '500' }}
                  >
                    <i className="bi bi-file-spreadsheet fs-4 d-block mb-2"></i>
                    <span>Policies CSV</span>
                  </CSVLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hover-card {
          transition: all 0.3s ease;
          animation: fadeIn 0.3s ease-in;
        }
        
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .table-hover tbody tr {
          transition: all 0.2s ease;
        }
        
        .table-hover tbody tr:hover {
          background-color: ${COLORS.PRIMARY}08;
          cursor: pointer;
          transform: scale(1.005);
        }
        
        .nav-link {
          transition: all 0.2s ease;
        }
        
        .nav-link:hover:not(.active) {
          background-color: ${COLORS.PRIMARY}10;
          transform: translateY(-2px);
        }
        
        .badge {
          transition: all 0.2s ease;
        }
        
        .badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .btn {
          transition: all 0.2s ease;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .hover-lift {
          transition: all 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.2) !important;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${COLORS.PRIMARY};
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${COLORS.ACCENT_2};
        }

        /* Progress bar animation */
        .progress-bar {
          transition: width 0.6s ease;
        }

        /* Table row animation */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        tbody tr {
          animation: slideIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
}