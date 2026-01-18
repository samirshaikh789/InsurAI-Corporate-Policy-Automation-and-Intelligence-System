import React, { useState, useMemo } from "react";
import { Pie, Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const COLORS = {
  PRIMARY: '#8b0086',
  ACCENT_2: '#d16ba5',
  ACCENT_3: '#b57edc',
  CONTRAST: '#5ce1e6',
  WARNING: '#f5c518',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  BACKGROUND: '#fafafa',
  CARD_BG: '#ffffff',
  TEXT_DARK: '#1f2937',
  TEXT_MUTED: '#6b7280',
  BORDER: '#e5e7eb',
  HOVER: '#f3f4f6'
};

export default function AdminUserManagement({ 
  users = [], 
  setActiveTab,
  onEditUser,
  onDeleteUser,
  onStatusChange 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showExportMenu, setShowExportMenu] = useState(false);

  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const totalEmployees = users.filter(user => user.role === "Employee").length;
    const totalAgents = users.filter(user => user.role === "Agent").length;
    const totalHR = users.filter(user => user.role === "HR").length;
    const activeUsers = users.filter(user => user.status === "Active").length;
    const inactiveUsers = users.filter(user => user.status === "Inactive").length;
    const recentlyAdded = users.filter(user => {
      if (!user.createdAt) return false;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return new Date(user.createdAt) > sevenDaysAgo;
    }).length;

    return { 
      totalUsers, 
      totalEmployees, 
      totalAgents, 
      totalHR, 
      activeUsers, 
      inactiveUsers,
      recentlyAdded,
      activeRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
    };
  }, [users]);

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const filteredUsers = useMemo(() => {
    return sortedUsers.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [sortedUsers, searchTerm, roleFilter, statusFilter]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(currentUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;
    
    switch(action) {
      case 'activate':
        selectedUsers.forEach(id => onStatusChange?.(id, 'Active'));
        setSelectedUsers([]);
        break;
      case 'deactivate':
        selectedUsers.forEach(id => onStatusChange?.(id, 'Inactive'));
        setSelectedUsers([]);
        break;
      case 'delete':
        if (window.confirm(`Delete ${selectedUsers.length} users?`)) {
          selectedUsers.forEach(id => onDeleteUser?.(id));
          setSelectedUsers([]);
        }
        break;
    }
  };

  const handleExport = (format) => {
    const dataToExport = selectedUsers.length > 0 
      ? users.filter(u => selectedUsers.includes(u.id))
      : filteredUsers;

    if (format === 'csv') {
      const headers = ['Name', 'Email', 'Role', 'Status'];
      const csv = [
        headers.join(','),
        ...dataToExport.map(u => `${u.name},${u.email},${u.role},${u.status}`)
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      a.click();
    } else if (format === 'json') {
      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.json';
      a.click();
    }
    setShowExportMenu(false);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "HR": return "bg-primary";
      case "Agent": return "bg-info";
      case "Employee": return "bg-success";
      default: return "bg-secondary";
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === "Active" ? "bg-success" : "bg-warning";
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "HR": return "bi-person-badge";
      case "Agent": return "bi-headset";
      case "Employee": return "bi-person";
      default: return "bi-person";
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const roleDistributionData = {
    labels: ['Employees', 'Agents', 'HR'],
    datasets: [{
      data: [userStats.totalEmployees, userStats.totalAgents, userStats.totalHR],
      backgroundColor: [COLORS.ACCENT_3, COLORS.CONTRAST, COLORS.ACCENT_2],
      borderColor: [COLORS.ACCENT_3, COLORS.CONTRAST, COLORS.ACCENT_2],
      borderWidth: 2,
    }],
  };

  const statusDistributionData = {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [userStats.activeUsers, userStats.inactiveUsers],
      backgroundColor: [COLORS.SUCCESS, COLORS.WARNING],
      borderColor: [COLORS.SUCCESS, COLORS.WARNING],
      borderWidth: 2,
    }],
  };

  const roleComparisonData = {
    labels: ['Employees', 'Agents', 'HR'],
    datasets: [{
      label: 'User Count',
      data: [userStats.totalEmployees, userStats.totalAgents, userStats.totalHR],
      backgroundColor: [COLORS.ACCENT_3, COLORS.CONTRAST, COLORS.ACCENT_2],
      borderRadius: 8,
    }],
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Total Users',
      data: [65, 78, 90, 105, 120, userStats.totalUsers],
      borderColor: COLORS.PRIMARY,
      backgroundColor: `${COLORS.PRIMARY}20`,
      tension: 0.4,
      fill: true,
    }],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: COLORS.TEXT_MUTED,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        cornerRadius: 8
      }
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: COLORS.BORDER },
        ticks: { color: COLORS.TEXT_MUTED }
      },
      x: {
        grid: { display: false },
        ticks: { color: COLORS.TEXT_MUTED }
      }
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          color: COLORS.TEXT_MUTED,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        cornerRadius: 8
      }
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: COLORS.BORDER },
        ticks: { color: COLORS.TEXT_MUTED }
      },
      x: {
        grid: { display: false },
        ticks: { color: COLORS.TEXT_MUTED }
      }
    }
  };

  return (
    <div style={{ backgroundColor: COLORS.BACKGROUND, minHeight: '100vh', padding: '24px' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ color: COLORS.TEXT_DARK, fontWeight: '700', margin: '0 0 8px 0', fontSize: '28px' }}>
              User Management
            </h2>
            <p style={{ color: COLORS.TEXT_MUTED, margin: 0, fontSize: '15px' }}>
              Manage system users, roles, and permissions
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              style={{
                backgroundColor: COLORS.PRIMARY,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(139, 0, 134, 0.2)',
                transition: 'all 0.2s'
              }}
              onClick={() => setActiveTab("registerHR")}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <i className="bi bi-person-plus"></i>
              Add HR
            </button>
            <button
              style={{
                backgroundColor: 'white',
                color: COLORS.PRIMARY,
                border: `2px solid ${COLORS.PRIMARY}`,
                borderRadius: '10px',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onClick={() => setActiveTab("registerAgent")}
              onMouseOver={(e) => e.target.style.backgroundColor = COLORS.HOVER}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              <i className="bi bi-person-plus"></i>
              Add Agent
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { title: 'Total Users', value: userStats.totalUsers, icon: 'bi-people-fill', color: COLORS.PRIMARY, subtitle: 'All system users' },
          { title: 'Active Users', value: userStats.activeUsers, icon: 'bi-check-circle-fill', color: COLORS.SUCCESS, subtitle: `${userStats.activeRate}% active rate` },
          { title: 'Employees', value: userStats.totalEmployees, icon: 'bi-person-fill', color: COLORS.ACCENT_3, subtitle: 'Employee accounts' },
          { title: 'Recent', value: userStats.recentlyAdded, icon: 'bi-clock-fill', color: COLORS.CONTRAST, subtitle: 'Added this week' }
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: COLORS.CARD_BG,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${stat.color}`,
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: COLORS.TEXT_MUTED, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>
                  {stat.title}
                </p>
                <h3 style={{ color: COLORS.TEXT_DARK, fontSize: '32px', fontWeight: '700', margin: '0 0 4px 0' }}>
                  {stat.value}
                </h3>
                <p style={{ color: COLORS.TEXT_MUTED, fontSize: '12px', margin: 0 }}>
                  {stat.subtitle}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className={stat.icon} style={{ fontSize: '24px', color: stat.color }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { title: 'Role Distribution', chart: <Pie data={roleDistributionData} options={pieChartOptions} />, icon: 'bi-pie-chart-fill' },
          { title: 'User Growth', chart: <Line data={userGrowthData} options={lineChartOptions} />, icon: 'bi-graph-up' },
          { title: 'Status Overview', chart: <Doughnut data={statusDistributionData} options={doughnutChartOptions} />, icon: 'bi-circle-half' }
        ].map((item, idx) => (
          <div key={idx} style={{
            backgroundColor: COLORS.CARD_BG,
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h6 style={{ color: COLORS.TEXT_DARK, fontWeight: '600', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className={item.icon} style={{ color: COLORS.PRIMARY }}></i>
              {item.title}
            </h6>
            <div style={{ height: '280px' }}>
              {item.chart}
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div style={{
        backgroundColor: COLORS.CARD_BG,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: selectedUsers.length > 0 ? '16px' : '0' }}>
          <div>
            <label style={{ color: COLORS.TEXT_DARK, fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
              Search Users
            </label>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-search" style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: COLORS.TEXT_MUTED
              }}></i>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.PRIMARY}
                onBlur={(e) => e.target.style.borderColor = COLORS.BORDER}
              />
            </div>
          </div>

          <div>
            <label style={{ color: COLORS.TEXT_DARK, fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
              Role Filter
            </label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${COLORS.BORDER}`,
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="All">All Roles</option>
              <option value="Employee">Employee</option>
              <option value="Agent">Agent</option>
              <option value="HR">HR</option>
            </select>
          </div>

          <div>
            <label style={{ color: COLORS.TEXT_DARK, fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${COLORS.BORDER}`,
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <button
              onClick={resetFilters}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: `1px solid ${COLORS.BORDER}`,
                borderRadius: '10px',
                backgroundColor: 'white',
                color: COLORS.TEXT_DARK,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = COLORS.HOVER}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              <i className="bi bi-arrow-clockwise"></i> Reset
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{
                  padding: '10px 16px',
                  border: `1px solid ${COLORS.PRIMARY}`,
                  borderRadius: '10px',
                  backgroundColor: 'white',
                  color: COLORS.PRIMARY,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className="bi bi-download"></i> Export
              </button>
              {showExportMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 10,
                  minWidth: '150px'
                }}>
                  <button onClick={() => handleExport('csv')} style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <i className="bi bi-filetype-csv"></i> Export CSV
                  </button>
                  <button onClick={() => handleExport('json')} style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    <i className="bi bi-filetype-json"></i> Export JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div style={{
            backgroundColor: `${COLORS.PRIMARY}10`,
            padding: '12px 16px',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <span style={{ color: COLORS.TEXT_DARK, fontSize: '14px', fontWeight: '600' }}>
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleBulkAction('activate')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: COLORS.SUCCESS,
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className="bi bi-check-circle"></i> Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: COLORS.WARNING,
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className="bi bi-pause-circle"></i> Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: COLORS.DANGER,
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users Table/Grid */}
      <div style={{
        backgroundColor: COLORS.CARD_BG,
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${COLORS.BORDER}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h5 style={{ margin: 0, color: COLORS.TEXT_DARK, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="bi bi-people-fill" style={{ color: COLORS.PRIMARY }}></i>
            All Users
            <span style={{
              backgroundColor: COLORS.PRIMARY,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {filteredUsers.length}
            </span>
          </h5>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: COLORS.TEXT_MUTED, fontSize: '13px' }}>
              {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <select
              value={usersPerPage}
              onChange={(e) => { setUsersPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
              style={{
                padding: '6px 12px',
                border: `1px solid ${COLORS.BORDER}`,
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${viewMode === 'table' ? COLORS.PRIMARY : COLORS.BORDER}`,
                  borderRadius: '8px',
                  backgroundColor: viewMode === 'table' ? `${COLORS.PRIMARY}15` : 'white',
                  color: viewMode === 'table' ? COLORS.PRIMARY : COLORS.TEXT_MUTED,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <i className="bi bi-table"></i>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${viewMode === 'grid' ? COLORS.PRIMARY : COLORS.BORDER}`,
                  borderRadius: '8px',
                  backgroundColor: viewMode === 'grid' ? `${COLORS.PRIMARY}15` : 'white',
                  color: viewMode === 'grid' ? COLORS.PRIMARY : COLORS.TEXT_MUTED,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <i className="bi bi-grid-3x3-gap"></i>
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: COLORS.HOVER }}>
                <tr>
                  <th style={{ padding: '16px 24px', textAlign: 'left' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      color: COLORS.TEXT_DARK,
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    User {sortConfig.key === 'name' && <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>}
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      color: COLORS.TEXT_DARK,
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Email {sortConfig.key === 'email' && <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>}
                  </th>
                  <th
                    onClick={() => handleSort('role')}
                    style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      color: COLORS.TEXT_DARK,
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Role {sortConfig.key === 'role' && <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>}
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      color: COLORS.TEXT_DARK,
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    Status {sortConfig.key === 'status' && <i className={`bi bi-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>}
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    color: COLORS.TEXT_DARK,
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: `1px solid ${COLORS.BORDER}`,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.HOVER}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${
                              user.role === 'HR' ? COLORS.ACCENT_2 :
                              user.role === 'Agent' ? COLORS.CONTRAST :
                              COLORS.ACCENT_3
                            }, ${
                              user.role === 'HR' ? COLORS.PRIMARY :
                              user.role === 'Agent' ? COLORS.PRIMARY :
                              COLORS.ACCENT_2
                            })`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '16px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: COLORS.TEXT_DARK, fontWeight: '600', fontSize: '14px' }}>
                            {user.name}
                          </div>
                          <div style={{ color: COLORS.TEXT_MUTED, fontSize: '12px' }}>
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: COLORS.TEXT_DARK, fontSize: '14px' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: 
                          user.role === 'HR' ? `${COLORS.ACCENT_2}20` :
                          user.role === 'Agent' ? `${COLORS.CONTRAST}20` :
                          `${COLORS.SUCCESS}20`,
                        color:
                          user.role === 'HR' ? COLORS.ACCENT_2 :
                          user.role === 'Agent' ? COLORS.CONTRAST :
                          COLORS.SUCCESS
                      }}>
                        <i className={getRoleIcon(user.role)}></i>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: user.status === 'Active' ? `${COLORS.SUCCESS}20` : `${COLORS.WARNING}20`,
                        color: user.status === 'Active' ? COLORS.SUCCESS : COLORS.WARNING
                      }}>
                        <i className={user.status === 'Active' ? 'bi-check-circle-fill' : 'bi-pause-circle-fill'}></i>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => onEditUser?.(user)}
                          style={{
                            padding: '8px 12px',
                            border: `1px solid ${COLORS.PRIMARY}`,
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: COLORS.PRIMARY,
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = COLORS.PRIMARY;
                            e.target.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = COLORS.PRIMARY;
                          }}
                          title="Edit User"
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          onClick={() => onStatusChange?.(user.id, user.status === 'Active' ? 'Inactive' : 'Active')}
                          style={{
                            padding: '8px 12px',
                            border: `1px solid ${COLORS.SUCCESS}`,
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: COLORS.SUCCESS,
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = COLORS.SUCCESS;
                            e.target.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = COLORS.SUCCESS;
                          }}
                          title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          <i className={user.status === 'Active' ? 'bi-pause-fill' : 'bi-play-fill'}></i>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          style={{
                            padding: '8px 12px',
                            border: `1px solid ${COLORS.DANGER}`,
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: COLORS.DANGER,
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = COLORS.DANGER;
                            e.target.style.color = 'white';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = COLORS.DANGER;
                          }}
                          title="Delete User"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <i className="bi bi-inbox" style={{ fontSize: '64px', color: COLORS.TEXT_MUTED, opacity: 0.3 }}></i>
                        <div>
                          <h5 style={{ color: COLORS.TEXT_DARK, margin: '0 0 8px 0' }}>No users found</h5>
                          <p style={{ color: COLORS.TEXT_MUTED, margin: 0 }}>
                            {users.length === 0 
                              ? "No users in the system yet. Add your first user to get started."
                              : "Try adjusting your search or filter criteria"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {currentUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    backgroundColor: 'white',
                    border: `1px solid ${COLORS.BORDER}`,
                    borderRadius: '12px',
                    padding: '20px',
                    transition: 'all 0.3s',
                    position: 'relative'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${
                          user.role === 'HR' ? COLORS.ACCENT_2 :
                          user.role === 'Agent' ? COLORS.CONTRAST :
                          COLORS.ACCENT_3
                        }, ${
                          user.role === 'HR' ? COLORS.PRIMARY :
                          user.role === 'Agent' ? COLORS.PRIMARY :
                          COLORS.ACCENT_2
                        })`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '32px',
                        margin: '0 auto 16px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <h6 style={{ color: COLORS.TEXT_DARK, fontWeight: '600', margin: '0 0 4px 0' }}>
                      {user.name}
                    </h6>
                    <p style={{ color: COLORS.TEXT_MUTED, fontSize: '13px', margin: 0 }}>
                      {user.email}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor:
                        user.role === 'HR' ? `${COLORS.ACCENT_2}20` :
                        user.role === 'Agent' ? `${COLORS.CONTRAST}20` :
                        `${COLORS.SUCCESS}20`,
                      color:
                        user.role === 'HR' ? COLORS.ACCENT_2 :
                        user.role === 'Agent' ? COLORS.CONTRAST :
                        COLORS.SUCCESS
                    }}>
                      <i className={getRoleIcon(user.role)}></i> {user.role}
                    </span>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: user.status === 'Active' ? `${COLORS.SUCCESS}20` : `${COLORS.WARNING}20`,
                      color: user.status === 'Active' ? COLORS.SUCCESS : COLORS.WARNING
                    }}>
                      <i className={user.status === 'Active' ? 'bi-check-circle-fill' : 'bi-pause-circle-fill'}></i> {user.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => onEditUser?.(user)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: `1px solid ${COLORS.PRIMARY}`,
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: COLORS.PRIMARY,
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      <i className="bi bi-pencil-fill"></i> Edit
                    </button>
                    <button
                      onClick={() => onStatusChange?.(user.id, user.status === 'Active' ? 'Inactive' : 'Active')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        border: `1px solid ${COLORS.SUCCESS}`,
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: COLORS.SUCCESS,
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      <i className={user.status === 'Active' ? 'bi-pause-fill' : 'bi-play-fill'}></i>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(user)}
                      style={{
                        padding: '10px 12px',
                        border: `1px solid ${COLORS.DANGER}`,
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: COLORS.DANGER,
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              ))}
              {currentUsers.length === 0 && (
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '60px 24px',
                  textAlign: 'center'
                }}>
                  <i className="bi bi-inbox" style={{ fontSize: '64px', color: COLORS.TEXT_MUTED, opacity: 0.3 }}></i>
                  <h5 style={{ color: COLORS.TEXT_DARK, margin: '16px 0 8px' }}>No users found</h5>
                  <p style={{ color: COLORS.TEXT_MUTED, margin: 0 }}>
                    {users.length === 0 
                      ? "No users in the system yet."
                      : "Try adjusting your filters"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: '20px 24px',
            borderTop: `1px solid ${COLORS.BORDER}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <span style={{ color: COLORS.TEXT_MUTED, fontSize: '14px' }}>
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: '8px',
                  backgroundColor: currentPage === 1 ? COLORS.HOVER : 'white',
                  color: currentPage === 1 ? COLORS.TEXT_MUTED : COLORS.TEXT_DARK,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <i className="bi bi-chevron-left"></i>
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
                      padding: '8px 16px',
                      border: `1px solid ${currentPage === pageNum ? COLORS.PRIMARY : COLORS.BORDER}`,
                      borderRadius: '8px',
                      backgroundColor: currentPage === pageNum ? COLORS.PRIMARY : 'white',
                      color: currentPage === pageNum ? 'white' : COLORS.TEXT_DARK,
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      minWidth: '44px'
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
                  padding: '8px 16px',
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: '8px',
                  backgroundColor: currentPage === totalPages ? COLORS.HOVER : 'white',
                  color: currentPage === totalPages ? COLORS.TEXT_MUTED : COLORS.TEXT_DARK,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <>
          <div
            onClick={() => setDeleteConfirm(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
          ></div>
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              zIndex: 1001,
              maxWidth: '500px',
              width: '90%',
              overflow: 'hidden'
            }}
          >
            <div style={{
              background: `linear-gradient(135deg, ${COLORS.DANGER}, ${COLORS.ACCENT_2})`,
              padding: '24px',
              color: 'white'
            }}>
              <h5 style={{ margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '24px' }}></i>
                Confirm Delete
              </h5>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ color: COLORS.TEXT_DARK, fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                Are you sure you want to delete <strong style={{ color: COLORS.DANGER }}>{deleteConfirm.name}</strong>?
              </p>
              <p style={{ color: COLORS.TEXT_MUTED, fontSize: '13px', margin: 0, padding: '12px', backgroundColor: `${COLORS.DANGER}10`, borderRadius: '8px' }}>
                <i className="bi bi-info-circle"></i> This action cannot be undone. All user data will be permanently removed.
              </p>
            </div>
            <div style={{
              padding: '16px 24px',
              borderTop: `1px solid ${COLORS.BORDER}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: '10px 24px',
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: '10px',
                  backgroundColor: 'white',
                  color: COLORS.TEXT_DARK,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteUser?.(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '10px',
                  backgroundColor: COLORS.DANGER,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <i className="bi bi-trash-fill"></i> Delete User
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}