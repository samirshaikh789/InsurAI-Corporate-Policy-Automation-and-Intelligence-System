import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminAllClaims = ({ claims = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [hrFilter, setHrFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [claimsPerPage, setClaimsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'claimDate', direction: 'desc' });
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [viewClaim, setViewClaim] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.status === "Approved").length;
    const pendingClaims = claims.filter(c => c.status === "Pending").length;
    const rejectedClaims = claims.filter(c => c.status === "Rejected").length;
    
    const approvalRate = totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0;

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      const monthClaims = claims.filter(claim => {
        const claimDate = new Date(claim.claimDate);
        return claimDate.getMonth() === date.getMonth() && 
               claimDate.getFullYear() === date.getFullYear();
      });

      return {
        month: key,
        claims: monthClaims.length,
        approved: monthClaims.filter(c => c.status === "Approved").length,
        pending: monthClaims.filter(c => c.status === "Pending").length,
      };
    }).reverse();

    return {
      totalClaims,
      approvedClaims,
      pendingClaims,
      rejectedClaims,
      approvalRate,
      monthlyData
    };
  }, [claims]);

  const statusData = [
    { name: 'Approved', value: stats.approvedClaims, color: '#10b981' },
    { name: 'Pending', value: stats.pendingClaims, color: '#f59e0b' },
    { name: 'Rejected', value: stats.rejectedClaims, color: '#ef4444' },
  ];

  const filteredClaims = useMemo(() => {
    let filtered = claims.filter(claim => {
      const matchesSearch = 
        claim.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.employeeIdDisplay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.id?.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === "All" || claim.status === statusFilter;
      const matchesHR = hrFilter === "All" || claim.assignedHrName === hrFilter;

      let matchesDate = true;
      if (dateFilter !== "All") {
        const claimDate = new Date(claim.claimDate);
        const today = new Date();
        switch (dateFilter) {
          case "Today":
            matchesDate = claimDate.toDateString() === today.toDateString();
            break;
          case "This Week":
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            matchesDate = claimDate >= startOfWeek;
            break;
          case "This Month":
            matchesDate = claimDate.getMonth() === today.getMonth() && 
                         claimDate.getFullYear() === today.getFullYear();
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesHR && matchesDate;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'claimDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [claims, searchTerm, statusFilter, dateFilter, hrFilter, sortConfig]);

  const indexOfLastClaim = currentPage * claimsPerPage;
  const indexOfFirstClaim = indexOfLastClaim - claimsPerPage;
  const currentClaims = filteredClaims.slice(indexOfFirstClaim, indexOfLastClaim);
  const totalPages = Math.ceil(filteredClaims.length / claimsPerPage);

  const uniqueHRs = useMemo(() => {
    const hrs = claims.map(claim => claim.assignedHrName).filter(Boolean);
    return [...new Set(hrs)];
  }, [claims]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "⇅";
    return sortConfig.direction === 'asc' ? "↑" : "↓";
  };

  const toggleClaimSelection = (id) => {
    setSelectedClaims(prev =>
      prev.includes(id) ? prev.filter(claimId => claimId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedClaims.length === currentClaims.length) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(currentClaims.map(claim => claim.id));
    }
  };

  const handleExportData = () => {
    const dataToExport = filteredClaims.map(claim => ({
      'Claim ID': claim.id,
      'Employee Name': claim.employeeName,
      'Employee ID': claim.employeeIdDisplay,
      'Policy Name': claim.policyName,
      'Assigned HR': claim.assignedHrName,
      'Status': claim.status,
      'Submitted Date': claim.claimDate ? new Date(claim.claimDate).toLocaleDateString() : 'N/A',
      'Remarks': claim.remarks || '-'
    }));

    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `claims_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkAction = async (action) => {
    if (!action || selectedClaims.length === 0) return;
    
    console.log(`Performing ${action} on claims:`, selectedClaims);
    
    setSelectedClaims([]);
    setBulkAction("");
  };

  const quickActions = [
    {
      icon: "📥",
      label: "Export Data",
      action: handleExportData,
      color: "#10b981",
      bgColor: "#d1fae5",
      description: "Download claims as CSV"
    },
    {
      icon: "📊",
      label: showStats ? "Hide Stats" : "Show Stats",
      action: () => setShowStats(!showStats),
      color: "#3b82f6",
      bgColor: "#dbeafe",
      description: showStats ? "Collapse analytics" : "View analytics dashboard"
    },
    {
      icon: "🔄",
      label: "Refresh",
      action: () => window.location.reload(),
      color: "#f59e0b",
      bgColor: "#fef3c7",
      description: "Reload latest data"
    }
  ];

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDateFilter("All");
    setHrFilter("All");
    setCurrentPage(1);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "danger";
      case "Pending": return "warning";
      default: return "secondary";
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: `1px solid ${color}15`,
      borderLeft: `4px solid ${color}`,
      transition: 'all 0.3s ease',
      cursor: 'default'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: '600', 
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            {title}
          </div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#1e293b',
            marginBottom: '4px'
          }}>
            {value}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            {subtitle}
          </div>
        </div>
        <div style={{
          fontSize: '36px',
          opacity: 0.15,
          lineHeight: 1
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '32px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ 
                fontSize: '32px',
                fontWeight: '800',
                color: '#2b0938',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '36px' }}>📋</span>
                Claims Management
              </h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
                Comprehensive claims administration and analytics dashboard
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📄</span>
                {stats.totalClaims} Total Claims
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {quickActions.map((action, index) => (
            <div 
              key={index}
              onClick={action.action}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  background: action.bgColor,
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  flexShrink: 0
                }}>
                  {action.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '16px',
                    color: '#1e293b',
                    marginBottom: '4px'
                  }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {action.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Dashboard */}
        {showStats && (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <StatCard
                icon="📊"
                title="Total Claims"
                value={stats.totalClaims}
                subtitle="All time submissions"
                color="#3b82f6"
              />
              <StatCard
                icon="✅"
                title="Approved"
                value={stats.approvedClaims}
                subtitle={`${stats.approvalRate.toFixed(1)}% approval rate`}
                color="#10b981"
              />
              <StatCard
                icon="⏳"
                title="Pending"
                value={stats.pendingClaims}
                subtitle="Awaiting review"
                color="#f59e0b"
              />
              <StatCard
                icon="❌"
                title="Rejected"
                value={stats.rejectedClaims}
                subtitle="Not approved"
                color="#ef4444"
              />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '20px'
                }}>
                  Status Distribution
                </h3>
                <div style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          background: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom"
                        height={36}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '20px'
                }}>
                  Monthly Trend
                </h3>
                <div style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          background: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="claims" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        name="Total Claims"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="approved" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Approved"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Filters Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '8px'
              }}>
                🔍 Search Claims
              </label>
              <input
                type="text"
                placeholder="Search by name, ID, policy..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '8px'
              }}>
                📌 Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '8px'
              }}>
                📅 Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                marginBottom: '8px'
              }}>
                👤 Assigned HR
              </label>
              <select
                value={hrFilter}
                onChange={(e) => {
                  setHrFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="All">All HR</option>
                {uniqueHRs.map(hr => (
                  <option key={hr} value={hr}>{hr}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={resetFilters}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#64748b'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                🔄 Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedClaims.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
            borderRadius: '12px',
            padding: '16px 24px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '2px solid #667eea30'
          }}>
            <span style={{ fontWeight: '600', color: '#2b0938' }}>
              ✓ {selectedClaims.length} claim{selectedClaims.length !== 1 ? 's' : ''} selected
            </span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Action...</option>
                <option value="approve">Approve Selected</option>
                <option value="reject">Reject Selected</option>
                <option value="assign">Assign to HR</option>
                <option value="export">Export Selected</option>
              </select>
              {bulkAction && (
                <button
                  onClick={() => handleBulkAction(bulkAction)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        )}

        {/* Claims Table */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ 
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0
              }}>
                📋 Claims List
              </h2>
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {filteredClaims.length}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                Showing {indexOfFirstClaim + 1}-{Math.min(indexOfLastClaim, filteredClaims.length)} of {filteredClaims.length}
              </span>
              <select
                value={claimsPerPage}
                onChange={(e) => {
                  setClaimsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {currentClaims.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '80px 24px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
              }}>
                <div style={{ fontSize: '72px', marginBottom: '16px', opacity: 0.3 }}>
                  📭
                </div>
                <h3 style={{ 
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#475569',
                  marginBottom: '8px'
                }}>
                  No claims found
                </h3>
                <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
                  {claims.length === 0 
                    ? "No claims have been submitted yet."
                    : "Try adjusting your search filters to find what you're looking for"
                  }
                </p>
              </div>
            ) : (
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate',
                borderSpacing: 0
              }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ 
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      width: '50px'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedClaims.length === currentClaims.length && currentClaims.length > 0}
                        onChange={toggleSelectAll}
                        style={{ 
                          width: '18px', 
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#667eea'
                        }}
                      />
                    </th>
                    <th 
                      onClick={() => handleSort('id')}
                      style={{ 
                        padding: '16px 24px',
                        textAlign: 'left',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      Claim ID {getSortIndicator('id')}
                    </th>
                    <th 
                      onClick={() => handleSort('employeeName')}
                      style={{ 
                        padding: '16px 24px',
                        textAlign: 'left',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      Employee {getSortIndicator('employeeName')}
                    </th>
                    <th style={{ 
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Policy
                    </th>
                    <th style={{ 
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Assigned HR
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      style={{ 
                        padding: '16px 24px',
                        textAlign: 'left',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      Status {getSortIndicator('status')}
                    </th>
                    <th style={{ 
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Documents
                    </th>
                    <th 
                      onClick={() => handleSort('claimDate')}
                      style={{ 
                        padding: '16px 24px',
                        textAlign: 'left',
                        fontWeight: '600',
                        fontSize: '13px',
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      Submitted {getSortIndicator('claimDate')}
                    </th>
                    <th style={{ 
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentClaims.map((claim, index) => (
                    <tr 
                      key={claim.id}
                      style={{
                        borderTop: '1px solid #e2e8f0',
                        background: selectedClaims.includes(claim.id) ? '#f0f9ff' : 'white',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => {
                        if (!selectedClaims.includes(claim.id)) {
                          e.currentTarget.style.background = '#f8fafc';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!selectedClaims.includes(claim.id)) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <input
                          type="checkbox"
                          checked={selectedClaims.includes(claim.id)}
                          onChange={() => toggleClaimSelection(claim.id)}
                          style={{ 
                            width: '18px', 
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: '#667eea'
                          }}
                        />
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>
                          #{claim.id}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {claim.employeeIdDisplay || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                          {claim.employeeName || "Unknown"}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          Employee
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ color: '#1e293b' }}>
                          {claim.policyName || "N/A"}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ 
                          color: claim.assignedHrName ? '#1e293b' : '#94a3b8',
                          fontWeight: claim.assignedHrName ? '500' : '400'
                        }}>
                          {claim.assignedHrName || "Not Assigned"}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 
                            claim.status === 'Approved' ? '#d1fae5' :
                            claim.status === 'Rejected' ? '#fee2e2' :
                            claim.status === 'Pending' ? '#fef3c7' : '#e2e8f0',
                          color:
                            claim.status === 'Approved' ? '#065f46' :
                            claim.status === 'Rejected' ? '#991b1b' :
                            claim.status === 'Pending' ? '#92400e' : '#475569'
                        }}>
                          {claim.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {claim.documents?.length > 0 ? (
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button 
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '2px solid #dbeafe',
                                background: '#eff6ff',
                                color: '#1e40af',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              📎 {claim.documents.length}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#94a3b8' }}>No docs</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ color: '#1e293b' }}>
                          {claim.claimDate ? new Date(claim.claimDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : "N/A"}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button 
                          onClick={() => setViewClaim(claim)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                Showing {indexOfFirstClaim + 1} to {Math.min(indexOfLastClaim, filteredClaims.length)} of {filteredClaims.length} entries
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    background: currentPage === 1 ? '#f8fafc' : 'white',
                    color: currentPage === 1 ? '#cbd5e1' : '#475569',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ← Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '2px solid',
                        borderColor: currentPage === pageNum ? '#667eea' : '#e2e8f0',
                        background: currentPage === pageNum 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                          : 'white',
                        color: currentPage === pageNum ? 'white' : '#475569',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minWidth: '40px'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    background: currentPage === totalPages ? '#f8fafc' : 'white',
                    color: currentPage === totalPages ? '#cbd5e1' : '#475569',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Claim Modal */}
        {viewClaim && (
          <div 
            onClick={() => setViewClaim(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '24px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                animation: 'slideUp 0.3s ease-out'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '32px',
                borderRadius: '24px 24px 0 0',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ 
                      fontSize: '28px',
                      fontWeight: '800',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span>📋</span>
                      Claim #{viewClaim.id}
                    </h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
                      Complete claim information and details
                    </p>
                  </div>
                  <button 
                    onClick={() => setViewClaim(null)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: '12px',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '20px',
                      color: 'white',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div style={{ padding: '32px' }}>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '32px',
                  marginBottom: '32px'
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      👤 Claim Information
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                          Employee Name
                        </div>
                        <div style={{ fontSize: '15px', color: '#1e293b', fontWeight: '600' }}>
                          {viewClaim.employeeName}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                          Employee ID
                        </div>
                        <div style={{ fontSize: '15px', color: '#1e293b' }}>
                          {viewClaim.employeeIdDisplay}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                          Policy Name
                        </div>
                        <div style={{ fontSize: '15px', color: '#1e293b' }}>
                          {viewClaim.policyName}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                          Submitted Date
                        </div>
                        <div style={{ fontSize: '15px', color: '#1e293b' }}>
                          {new Date(viewClaim.claimDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={{ 
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📊 Status & Assignment
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                          Current Status
                        </div>
                        <span style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600',
                          background: 
                            viewClaim.status === 'Approved' ? '#d1fae5' :
                            viewClaim.status === 'Rejected' ? '#fee2e2' :
                            viewClaim.status === 'Pending' ? '#fef3c7' : '#e2e8f0',
                          color:
                            viewClaim.status === 'Approved' ? '#065f46' :
                            viewClaim.status === 'Rejected' ? '#991b1b' :
                            viewClaim.status === 'Pending' ? '#92400e' : '#475569'
                        }}>
                          {viewClaim.status}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                          Assigned HR Manager
                        </div>
                        <div style={{ fontSize: '15px', color: '#1e293b' }}>
                          {viewClaim.assignedHrName || 'Not assigned yet'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                          Remarks / Notes
                        </div>
                        <div style={{ 
                          fontSize: '15px', 
                          color: '#1e293b',
                          padding: '12px',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          minHeight: '60px'
                        }}>
                          {viewClaim.remarks || 'No remarks added'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {viewClaim.documents?.length > 0 && (
                  <div>
                    <h3 style={{ 
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📎 Attached Documents
                    </h3>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '12px'
                    }}>
                      {viewClaim.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={`http://localhost:8080${doc}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            background: 'white',
                            textDecoration: 'none',
                            color: '#1e293b',
                            transition: 'all 0.2s',
                            fontWeight: '600'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.background = '#f8fafc';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          <span style={{ fontSize: '24px' }}>📄</span>
                          <span>Document {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{
                padding: '24px 32px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setViewClaim(null)}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#e2e8f0',
                    color: '#475569',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#cbd5e1'}
                  onMouseLeave={e => e.currentTarget.style.background = '#e2e8f0'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminAllClaims;