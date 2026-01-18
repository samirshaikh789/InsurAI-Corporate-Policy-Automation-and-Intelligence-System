import React, { useState, useEffect } from "react";
import api from "../../../api";
import "bootstrap/dist/css/bootstrap.min.css";

// Color constants
const COLORS = {
  PRIMARY: '#8b0086',
  ACCENT_2: '#d16ba5',
  ACCENT_3: '#b57edc',
  CONTRAST: '#5ce1e6',
  WARNING: '#f5c518',
  SUCCESS: '#00d084',
  BACKGROUND: '#ffffffff',
  TEXT_MUTED: '#6b5b6e',
  DARK: '#2b0938ff',
  LIGHT_PURPLE: '#f8f5ff',
  CARD_SHADOW: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)',
};

export default function AdminPolicy() {
  const [policyData, setPolicyData] = useState({
    policyNumber: "",
    policyName: "",
    policyType: "",
    providerName: "",
    coverageAmount: "",
    monthlyPremium: "",
    startDate: "",
    renewalDate: "",
    policyStatus: "Active",
    policyDescription: "",
  });

  const [policies, setPolicies] = useState([]);
  const [message, setMessage] = useState("");
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [viewPolicy, setViewPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [policiesPerPage] = useState(5);
  const [formErrors, setFormErrors] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showFormCard, setShowFormCard] = useState(false);

  // -------------------- Documents --------------------
  const [documents, setDocuments] = useState({
    contract: null,
    terms: null,
    claimForm: null,
    annexure: null,
  });

  const handleDocumentChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    // Validate file size (max 5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      setFormErrors({
        ...formErrors,
        [name]: "File size must be less than 5MB"
      });
      return;
    }
    
    // Clear error if valid
    const newErrors = { ...formErrors };
    delete newErrors[name];
    setFormErrors(newErrors);
    
    setDocuments({ ...documents, [name]: file });
  };

  // -------------------- Input Changes with Validation --------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPolicyData({ ...policyData, [name]: value });
    
    // Clear error for this field
    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  // -------------------- Form Validation --------------------
  const validateForm = () => {
    const errors = {};
    
    if (!policyData.policyNumber.trim()) {
      errors.policyNumber = "Policy number is required";
    }
    
    if (!policyData.policyName.trim()) {
      errors.policyName = "Policy name is required";
    }
    
    if (!policyData.policyType) {
      errors.policyType = "Policy type is required";
    }
    
    if (!policyData.providerName.trim()) {
      errors.providerName = "Provider name is required";
    }
    
    if (!policyData.coverageAmount || policyData.coverageAmount <= 0) {
      errors.coverageAmount = "Valid coverage amount is required";
    }
    
    if (!policyData.monthlyPremium || policyData.monthlyPremium <= 0) {
      errors.monthlyPremium = "Valid monthly premium is required";
    }
    
    if (!policyData.startDate) {
      errors.startDate = "Start date is required";
    }
    
    if (!policyData.renewalDate) {
      errors.renewalDate = "Renewal date is required";
    }
    
    if (policyData.startDate && policyData.renewalDate) {
      if (new Date(policyData.renewalDate) <= new Date(policyData.startDate)) {
        errors.renewalDate = "Renewal date must be after start date";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // -------------------- Convert raw S3 URL to public Supabase URL --------------------
  const formatPublicUrl = (url) => {
    if (!url) return null;
    if (url.includes("/object/public/")) return url;
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      const bucketIndex = pathParts.indexOf("s3") + 1;
      const bucket = pathParts[bucketIndex];
      const filePath = pathParts.slice(bucketIndex + 1).join("/");
      const projectDomain = urlObj.hostname.replace(".storage.", ".");
      return `https://${projectDomain}/storage/v1/object/public/${bucket}/${filePath}`;
    } catch {
      return url;
    }
  };

  // -------------------- Fetch Policies --------------------
  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/policies", );
      const formattedPolicies = response.data.map((p) => ({
        ...p,
        contractUrl: formatPublicUrl(p.contractUrl),
        termsUrl: formatPublicUrl(p.termsUrl),
        claimFormUrl: formatPublicUrl(p.claimFormUrl),
        annexureUrl: formatPublicUrl(p.annexureUrl),
      }));
      setPolicies(formattedPolicies);
      setMessage("");
    } catch (error) {
      console.error("Error fetching policies:", error);
      setMessage(
        error.response?.status === 403
          ? "❌ Forbidden: You are not authorized"
          : "❌ Failed to fetch policies."
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Submit Policy --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage("❌ Please fix the errors in the form");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ Authorization token not found. Please login.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append(
        "policy",
        new Blob([JSON.stringify(policyData)], { type: "application/json" })
      );

      Object.keys(documents).forEach((docKey) => {
        if (documents[docKey]) formData.append(docKey, documents[docKey]);
      });

      await api.post("/admin/policies", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });

      setMessage("✅ Policy saved successfully!");
      resetForm();
      fetchPolicies();
      setShowFormCard(false);
      
      // Auto-dismiss success message
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error saving policy:", error);
      setMessage("❌ Failed to submit policy. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Reset Form --------------------
  const resetForm = () => {
    setPolicyData({
      policyNumber: "",
      policyName: "",
      policyType: "",
      providerName: "",
      coverageAmount: "",
      monthlyPremium: "",
      startDate: "",
      renewalDate: "",
      policyStatus: "Active",
      policyDescription: "",
    });
    setDocuments({ contract: null, terms: null, claimForm: null, annexure: null });
    setEditingPolicyId(null);
    setFormErrors({});
  };

  // -------------------- Edit Policy --------------------
  const handleEdit = (policy) => {
    setPolicyData(policy);
    setEditingPolicyId(policy.id);
    setShowFormCard(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // -------------------- Delete Policy --------------------
  const handleDeleteClick = (policy) => {
    setPolicyToDelete(policy);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!policyToDelete) return;
    
    setLoading(true);
    try {
      await api.delete(`/admin/policies/${policyToDelete.id}`, );
      setMessage("✅ Policy deleted successfully!");
      fetchPolicies();
      setShowDeleteModal(false);
      setPolicyToDelete(null);
      
      // Auto-dismiss success message
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error("Error deleting policy:", error);
      setMessage(
        error.response?.status === 403
          ? "❌ Forbidden: You are not authorized"
          : "❌ Failed to delete policy. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // -------------------- View Policy Modal --------------------
  const handleView = (policy) => setViewPolicy(policy);
  const closeModal = () => setViewPolicy(null);

  // -------------------- Sorting --------------------
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // -------------------- Filter and Search --------------------
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.providerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || policy.policyStatus === statusFilter;
    const matchesType = typeFilter === "All" || policy.policyType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Apply sorting
  const sortedPolicies = [...filteredPolicies].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // -------------------- Pagination --------------------
  const indexOfLastPolicy = currentPage * policiesPerPage;
  const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage;
  const currentPolicies = sortedPolicies.slice(indexOfFirstPolicy, indexOfLastPolicy);
  const totalPages = Math.ceil(sortedPolicies.length / policiesPerPage);

  // -------------------- Statistics --------------------
  const stats = {
    total: policies.length,
    active: policies.filter(p => p.policyStatus === "Active").length,
    inactive: policies.filter(p => p.policyStatus === "Inactive").length,
    health: policies.filter(p => p.policyType === "Health").length,
    life: policies.filter(p => p.policyType === "Life").length,
    accident: policies.filter(p => p.policyType === "Accident").length,
    corporate: policies.filter(p => p.policyType === "Corporate Benefit").length,
    totalCoverage: policies.reduce((sum, p) => sum + parseFloat(p.coverageAmount || 0), 0),
    totalPremium: policies.reduce((sum, p) => sum + parseFloat(p.monthlyPremium || 0), 0),
  };

  // -------------------- Export to CSV --------------------
  const exportToCSV = () => {
    const headers = ["Policy Number", "Policy Name", "Type", "Provider", "Coverage", "Premium", "Status", "Start Date", "Renewal Date"];
    const rows = filteredPolicies.map(p => [
      p.policyNumber,
      p.policyName,
      p.policyType,
      p.providerName,
      p.coverageAmount,
      p.monthlyPremium,
      p.policyStatus,
      p.startDate,
      p.renewalDate
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policies_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // -------------------- Load Policies on Mount --------------------
  useEffect(() => {
    fetchPolicies();
  }, []);

  // -------------------- Auto-dismiss messages --------------------
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="admin-policy-management p-4" style={{ backgroundColor: COLORS.LIGHT_PURPLE, minHeight: '100vh' }}>
      {/* Header Section with Enhanced Design */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h2 style={{ color: COLORS.DARK }} className="fw-bold mb-1 d-flex align-items-center">
            <i className="bi bi-shield-fill-check me-3" style={{ color: COLORS.PRIMARY, fontSize: '2rem' }}></i>
            Policy Management Dashboard
          </h2>
          <p style={{ color: COLORS.TEXT_MUTED }} className="mb-0 ms-5 ps-2">
            Comprehensive insurance policy administration and tracking system
          </p>
        </div>
        <div className="text-end">
          <button 
            className="btn btn-lg shadow-sm"
            style={{ backgroundColor: COLORS.PRIMARY, color: 'white', borderRadius: '12px' }}
            onClick={() => {
              setShowFormCard(!showFormCard);
              if (!showFormCard) {
                resetForm();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <i className={`bi ${showFormCard ? 'bi-x-lg' : 'bi-plus-circle'} me-2`}></i>
            {showFormCard ? 'Cancel' : 'Create New Policy'}
          </button>
        </div>
      </div>

      {/* Global Alert Messages */}
      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show shadow-sm mb-4`} style={{ borderRadius: '12px' }}>
          <div className="d-flex align-items-center">
            <i className={`bi ${message.includes('✅') ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-3 fs-4`}></i>
            <div className="flex-grow-1">{message}</div>
            <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
          </div>
        </div>
      )}

      {/* Enhanced Statistics Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card shadow-sm h-100 border-0" style={{ borderRadius: '16px', borderLeft: `5px solid ${COLORS.PRIMARY}` }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-uppercase mb-1 small fw-bold" style={{ color: COLORS.PRIMARY, letterSpacing: '0.5px' }}>
                    Total Policies
                  </div>
                  <div className="h1 mb-0 fw-bold" style={{ color: COLORS.DARK }}>{stats.total}</div>
                  <div className="small mt-2" style={{ color: COLORS.TEXT_MUTED }}>
                    <i className="bi bi-graph-up me-1"></i>
                    {stats.active} Active
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
                  <i className="bi bi-file-earmark-text fs-3" style={{ color: COLORS.PRIMARY }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card shadow-sm h-100 border-0" style={{ borderRadius: '16px', borderLeft: `5px solid ${COLORS.SUCCESS}` }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-uppercase mb-1 small fw-bold" style={{ color: COLORS.SUCCESS, letterSpacing: '0.5px' }}>
                    Total Coverage
                  </div>
                  <div className="h1 mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                    ₹{(stats.totalCoverage / 10000000).toFixed(1)}Cr
                  </div>
                  <div className="small mt-2" style={{ color: COLORS.TEXT_MUTED }}>
                    <i className="bi bi-shield-check me-1"></i>
                    Across all policies
                  </div>
                </div>
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px', 
                    height: '56px', 
                    backgroundColor: `${COLORS.SUCCESS}15` 
                  }}
                >
                  <i className="bi bi-currency-rupee fs-3" style={{ color: COLORS.SUCCESS }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card shadow-sm h-100 border-0" style={{ borderRadius: '16px', borderLeft: `5px solid ${COLORS.CONTRAST}` }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-uppercase mb-1 small fw-bold" style={{ color: COLORS.CONTRAST, letterSpacing: '0.5px' }}>
                    Monthly Premium
                  </div>
                  <div className="h1 mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                    ₹{(stats.totalPremium / 1000).toFixed(1)}K
                  </div>
                  <div className="small mt-2" style={{ color: COLORS.TEXT_MUTED }}>
                    <i className="bi bi-calendar-check me-1"></i>
                    Total collected
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
                  <i className="bi bi-cash-stack fs-3" style={{ color: COLORS.CONTRAST }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card shadow-sm h-100 border-0" style={{ borderRadius: '16px', borderLeft: `5px solid ${COLORS.ACCENT_2}` }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-uppercase mb-1 small fw-bold" style={{ color: COLORS.ACCENT_2, letterSpacing: '0.5px' }}>
                    Policy Types
                  </div>
                  <div className="h1 mb-0 fw-bold" style={{ color: COLORS.DARK }}>4</div>
                  <div className="small mt-2" style={{ color: COLORS.TEXT_MUTED }}>
                    <i className="bi bi-diagram-3 me-1"></i>
                    Categories available
                  </div>
                </div>
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px', 
                    height: '56px', 
                    backgroundColor: `${COLORS.ACCENT_2}15` 
                  }}
                >
                  <i className="bi bi-grid-3x3-gap fs-3" style={{ color: COLORS.ACCENT_2 }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Form Card - Collapsible */}
      {showFormCard && (
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
          <div className="card-header bg-white py-4 border-0" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="m-0 fw-bold d-flex align-items-center" style={{ color: COLORS.DARK }}>
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: `${COLORS.PRIMARY}15` 
                  }}
                >
                  <i className={`bi ${editingPolicyId ? 'bi-pencil-square' : 'bi-plus-circle'}`} style={{ color: COLORS.PRIMARY }}></i>
                </div>
                {editingPolicyId ? "Edit Policy Details" : "Create New Insurance Policy"}
              </h5>
              <button 
                className="btn btn-sm btn-light rounded-circle"
                onClick={() => {
                  setShowFormCard(false);
                  resetForm();
                }}
                style={{ width: '36px', height: '36px' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              {/* Basic Information Section */}
              <div className="mb-4">
                <h6 className="text-uppercase fw-bold mb-3" style={{ color: COLORS.PRIMARY, fontSize: '0.875rem', letterSpacing: '0.5px' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  Basic Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                      Policy Number <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${formErrors.policyNumber ? 'is-invalid' : ''}`}
                      style={{ borderRadius: '8px' }}
                      name="policyNumber" 
                      value={policyData.policyNumber} 
                      onChange={handleChange} 
                      placeholder="e.g., POL-2024-001"
                    />
                    {formErrors.policyNumber && (
                      <div className="invalid-feedback">{formErrors.policyNumber}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                      Policy Name <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${formErrors.policyName ? 'is-invalid' : ''}`}
                      style={{ borderRadius: '8px' }}
                      name="policyName" 
                      value={policyData.policyName} 
                      onChange={handleChange} 
                      placeholder="Enter descriptive policy name"
                    />
                    {formErrors.policyName && (
                      <div className="invalid-feedback">{formErrors.policyName}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                      Policy Type <span className="text-danger">*</span>
                    </label>
                    <select 
                      className={`form-select ${formErrors.policyType ? 'is-invalid' : ''}`}
                      style={{ borderRadius: '8px' }}
                      name="policyType" 
                      value={policyData.policyType} 
                      onChange={handleChange}
                    >
                      <option value="">Select Policy Type</option>
                      <option value="Health">🏥 Health Insurance</option>
                      <option value="Accident">🚑 Accident Insurance</option>
                      <option value="Life">❤️ Life Insurance</option>
                      <option value="Corporate Benefit">🏢 Corporate Benefit</option>
                    </select>
                    {formErrors.policyType && (
                      <div className="invalid-feedback">{formErrors.policyType}</div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                      Provider Name <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      className={`form-control ${formErrors.providerName ? 'is-invalid' : ''}`}
                      style={{ borderRadius: '8px' }}
                      name="providerName" 
                      value={policyData.providerName} 
                      onChange={handleChange} 
                      placeholder="Enter insurance provider name"
                    />
                    {formErrors.providerName && (
                      <div className="invalid-feedback">{formErrors.providerName}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information Section */}
              <div className="mb-4">
                <h6 className="text-uppercase fw-bold mb-3" style={{ color: COLORS.PRIMARY, fontSize: '0.875rem', letterSpacing: '0.5px' }}>
                  <i className="bi bi-cash-coin me-2"></i>
                  Financial Details
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                      Coverage Amount (₹) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ borderRadius: '8px 0 0 8px' }}>₹</span>
                      <input 
                        type="number" 
                        className={`form-control ${formErrors.coverageAmount ? 'is-invalid' : ''}`}
                        style={{ borderRadius: '0 8px 8px 0' }}
                        name="coverageAmount" 
                        value={policyData.coverageAmount} 
                        onChange={handleChange} 
                        placeholder="1000000"
                      />
                      {formErrors.coverageAmount && (
                        <div className="invalid-feedback">{formErrors.coverageAmount}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                      Monthly Premium (₹) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text" style={{ borderRadius: '8px 0 0 8px' }}>₹</span>
                      <input 
                        type="number" 
                        className={`form-control ${formErrors.monthlyPremium ? 'is-invalid' : ''}`}
                        style={{ borderRadius: '0 8px 8px 0' }}
                        name="monthlyPremium" 
                        value={policyData.monthlyPremium} 
                        onChange={handleChange} 
                        placeholder="5000"
                      />
                      {formErrors.monthlyPremium && (
                        <div className="invalid-feedback">{formErrors.monthlyPremium}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Information Section */}
              <div className="mb-4">
                <h6 className="text-uppercase fw-bold mb-3" style={{ color: COLORS.PRIMARY, fontSize: '0.875rem', letterSpacing: '0.5px' }}>
                  <i className="bi bi-calendar-range me-2"></i>
                  Policy Timeline
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                      Start Date <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="date" 
                      className={`form-control ${formErrors.startDate ? 'is-invalid' : ''}`}
                      style={{ borderRadius: '8px' }}
                      name="startDate" 
                      value={policyData.startDate} 
                      onChange={handleChange} 
                    />
                    {formErrors.startDate && (
                      <div className="invalid-feedback">{formErrors.startDate}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                      Renewal Date <span className="text-danger">*</span>
                    </label>
                    <input 
                      type="date" 
                      className={`form-control ${formErrors.renewalDate ? 'is-invalid' : ''}`}
                      style={{ borderRadius: '8px' }}
                      name="renewalDate" 
                      value={policyData.renewalDate} 
                      onChange={handleChange} 
                    />
                    {formErrors.renewalDate && (
                      <div className="invalid-feedback">{formErrors.renewalDate}</div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                      Policy Status
                    </label>
                    <select 
                      className="form-select"
                      style={{ borderRadius: '8px' }}
                      name="policyStatus" 
                      value={policyData.policyStatus} 
                      onChange={handleChange}
                    >
                      <option value="Active">✓ Active</option>
                      <option value="Inactive">✗ Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mb-4">
                <h6 className="text-uppercase fw-bold mb-3" style={{ color: COLORS.PRIMARY, fontSize: '0.875rem', letterSpacing: '0.5px' }}>
                  <i className="bi bi-card-text me-2"></i>
                  Additional Details
                </h6>
                <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                  Policy Description
                </label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  style={{ borderRadius: '8px' }}
                  name="policyDescription" 
                  value={policyData.policyDescription} 
                  onChange={handleChange}
                  placeholder="Enter comprehensive policy description, benefits, terms, and coverage details..."
                />
              </div>

              {/* Document Uploads Section */}
              <div className="mb-4">
                <h6 className="text-uppercase fw-bold mb-3" style={{ color: COLORS.PRIMARY, fontSize: '0.875rem', letterSpacing: '0.5px' }}>
                  <i className="bi bi-paperclip me-2"></i>
                  Policy Documents (Max 5MB per file)
                </h6>
                <div className="row g-3">
                  {[
                    { key: "contract", label: "Contract Document", icon: "file-earmark-text" },
                    { key: "terms", label: "Terms & Conditions", icon: "file-earmark-ruled" },
                    { key: "claimForm", label: "Claim Form", icon: "file-earmark-medical" },
                    { key: "annexure", label: "Annexure", icon: "file-earmark-plus" }
                  ].map((doc) => (
                    <div key={doc.key} className="col-md-6">
                      <label className="form-label fw-semibold" style={{ color: COLORS.DARK }}>
                        <i className={`bi bi-${doc.icon} me-2`}></i>
                        {doc.label}
                      </label>
                      <input 
                        type="file" 
                        className={`form-control ${formErrors[doc.key] ? 'is-invalid' : ''}`}
                        style={{ borderRadius: '8px' }}
                        name={doc.key} 
                        onChange={handleDocumentChange} 
                        accept=".pdf,.doc,.docx" 
                      />
                      {documents[doc.key] && (
                        <div className="form-text text-success">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          {documents[doc.key].name} selected
                        </div>
                      )}
                      {formErrors[doc.key] && (
                        <div className="invalid-feedback d-block">{formErrors[doc.key]}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-3 pt-3 border-top">
                <button 
                  type="submit" 
                  className="btn btn-lg px-5 shadow-sm"
                  style={{ 
                    backgroundColor: COLORS.PRIMARY, 
                    color: 'white', 
                    borderRadius: '10px',
                    border: 'none'
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {editingPolicyId ? "Updating Policy..." : "Creating Policy..."}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${editingPolicyId ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                      {editingPolicyId ? "Update Policy" : "Create Policy"}
                    </>
                  )}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-lg btn-outline-secondary px-5"
                  style={{ borderRadius: '10px' }}
                  onClick={() => {
                    resetForm();
                    setShowFormCard(false);
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policies List Section */}
      <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
        <div className="card-header bg-white py-4 border-0" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div className="row align-items-center g-3">
            <div className="col-md-4">
              <h5 className="m-0 fw-bold d-flex align-items-center" style={{ color: COLORS.DARK }}>
                <i className="bi bi-list-ul me-2"></i>
                Policy Directory
                <span className="badge ms-2 px-3 py-2" style={{ 
                  backgroundColor: `${COLORS.PRIMARY}15`, 
                  color: COLORS.PRIMARY,
                  borderRadius: '8px'
                }}>
                  {filteredPolicies.length}
                </span>
              </h5>
            </div>
            
            <div className="col-md-8">
              <div className="d-flex gap-2 flex-wrap justify-content-md-end">
                {/* Search */}
                <div className="input-group" style={{ width: '280px' }}>
                  <span className="input-group-text bg-white" style={{ borderRadius: '10px 0 0 10px' }}>
                    <i className="bi bi-search" style={{ color: COLORS.TEXT_MUTED }}></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    style={{ borderRadius: '0 10px 10px 0' }}
                    placeholder="Search policies..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* Filters */}
                <select
                  className="form-select"
                  style={{ width: 'auto', minWidth: '140px', borderRadius: '10px' }}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Status</option>
                  <option value="Active">✓ Active</option>
                  <option value="Inactive">✗ Inactive</option>
                </select>

                <select
                  className="form-select"
                  style={{ width: 'auto', minWidth: '160px', borderRadius: '10px' }}
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="All">All Types</option>
                  <option value="Health">🏥 Health</option>
                  <option value="Accident">🚑 Accident</option>
                  <option value="Life">❤️ Life</option>
                  <option value="Corporate Benefit">🏢 Corporate</option>
                </select>

                {/* View Toggle */}
                <div className="btn-group" role="group">
                  <button 
                    className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ 
                      borderRadius: '10px 0 0 10px',
                      backgroundColor: viewMode === 'table' ? COLORS.PRIMARY : 'white',
                      borderColor: viewMode === 'table' ? COLORS.PRIMARY : '#dee2e6'
                    }}
                    onClick={() => setViewMode('table')}
                  >
                    <i className="bi bi-table"></i>
                  </button>
                  <button 
                    className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ 
                      borderRadius: '0 10px 10px 0',
                      backgroundColor: viewMode === 'grid' ? COLORS.PRIMARY : 'white',
                      borderColor: viewMode === 'grid' ? COLORS.PRIMARY : '#dee2e6'
                    }}
                    onClick={() => setViewMode('grid')}
                  >
                    <i className="bi bi-grid-3x3-gap"></i>
                  </button>
                </div>

                {/* Export Button */}
                <button 
                  className="btn btn-outline-success"
                  style={{ borderRadius: '10px' }}
                  onClick={exportToCSV}
                  title="Export to CSV"
                  disabled={filteredPolicies.length === 0}
                >
                  <i className="bi bi-download me-2"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border mb-3" style={{ color: COLORS.PRIMARY, width: '3rem', height: '3rem' }}></div>
              <p className="fw-semibold" style={{ color: COLORS.TEXT_MUTED }}>Loading policies...</p>
            </div>
          ) : currentPolicies.length === 0 ? (
            <div className="text-center py-5">
              <div 
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  backgroundColor: `${COLORS.ACCENT_3}15` 
                }}
              >
                <i className="bi bi-inbox display-1" style={{ color: COLORS.ACCENT_3 }}></i>
              </div>
              <h4 className="fw-bold mb-2" style={{ color: COLORS.DARK }}>No Policies Found</h4>
              <p style={{ color: COLORS.TEXT_MUTED }} className="mb-4">
                {policies.length === 0 
                  ? "Get started by creating your first insurance policy."
                  : "No policies match your current search or filter criteria."
                }
              </p>
              {policies.length === 0 && (
                <button 
                  className="btn btn-lg shadow-sm"
                  style={{ backgroundColor: COLORS.PRIMARY, color: 'white', borderRadius: '10px' }}
                  onClick={() => setShowFormCard(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Your First Policy
                </button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            // Table View
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr style={{ backgroundColor: `${COLORS.PRIMARY}08` }}>
                    <th 
                      className="border-0 fw-bold cursor-pointer" 
                      style={{ color: COLORS.DARK, cursor: 'pointer' }}
                      onClick={() => handleSort('policyName')}
                    >
                      <div className="d-flex align-items-center">
                        Policy Details
                        <i className={`bi bi-arrow-${sortConfig.key === 'policyName' && sortConfig.direction === 'asc' ? 'down' : 'up'} ms-2`}></i>
                      </div>
                    </th>
                    <th 
                      className="border-0 fw-bold cursor-pointer" 
                      style={{ color: COLORS.DARK, cursor: 'pointer' }}
                      onClick={() => handleSort('coverageAmount')}
                    >
                      <div className="d-flex align-items-center">
                        Coverage
                        <i className={`bi bi-arrow-${sortConfig.key === 'coverageAmount' && sortConfig.direction === 'asc' ? 'down' : 'up'} ms-2`}></i>
                      </div>
                    </th>
                    <th 
                      className="border-0 fw-bold cursor-pointer" 
                      style={{ color: COLORS.DARK, cursor: 'pointer' }}
                      onClick={() => handleSort('monthlyPremium')}
                    >
                      <div className="d-flex align-items-center">
                        Premium
                        <i className={`bi bi-arrow-${sortConfig.key === 'monthlyPremium' && sortConfig.direction === 'asc' ? 'down' : 'up'} ms-2`}></i>
                      </div>
                    </th>
                    <th className="border-0 fw-bold" style={{ color: COLORS.DARK }}>Status</th>
                    <th className="border-0 fw-bold text-center" style={{ color: COLORS.DARK }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPolicies.map((policy, index) => (
                    <tr key={policy.id} className="border-bottom" style={{ 
                      animation: `fadeIn 0.3s ease-in ${index * 0.05}s both`
                    }}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-3 text-white fw-bold shadow-sm flex-shrink-0"
                            style={{
                              backgroundColor: 
                                policy.policyType === "Health" ? COLORS.ACCENT_3 : 
                                policy.policyType === "Life" ? COLORS.CONTRAST : 
                                policy.policyType === "Accident" ? COLORS.WARNING : 
                                COLORS.ACCENT_2,
                              width: "48px",
                              height: "48px",
                              fontSize: '1.2rem'
                            }}
                          >
                            {policy.policyType === "Health" ? "🏥" :
                             policy.policyType === "Life" ? "❤️" :
                             policy.policyType === "Accident" ? "🚑" : "🏢"}
                          </div>
                          <div>
                            <div className="fw-bold mb-1" style={{ color: COLORS.DARK, fontSize: '1rem' }}>
                              {policy.policyName}
                            </div>
                            <div className="small mb-0" style={{ color: COLORS.TEXT_MUTED }}>
                              <span className="badge bg-light text-dark me-2" style={{ fontSize: '0.7rem' }}>
                                #{policy.policyNumber}
                              </span>
                              {policy.policyType}
                            </div>
                            <div className="small" style={{ color: COLORS.TEXT_MUTED }}>
                              <i className="bi bi-building me-1"></i>
                              {policy.providerName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold" style={{ color: COLORS.DARK, fontSize: '1rem' }}>
                          ₹{parseFloat(policy.coverageAmount).toLocaleString('en-IN')}
                        </div>
                        <small style={{ color: COLORS.TEXT_MUTED }}>Coverage Amount</small>
                      </td>
                      <td>
                        <div className="fw-bold" style={{ color: COLORS.DARK, fontSize: '1rem' }}>
                          ₹{parseFloat(policy.monthlyPremium).toLocaleString('en-IN')}
                        </div>
                        <small style={{ color: COLORS.TEXT_MUTED }}>Per Month</small>
                      </td>
                      <td>
                        <span 
                          className="badge shadow-sm px-3 py-2"
                          style={{
                            backgroundColor: policy.policyStatus === "Active" ? `${COLORS.SUCCESS}15` : `${COLORS.WARNING}15`,
                            color: policy.policyStatus === "Active" ? COLORS.SUCCESS : COLORS.WARNING,
                            borderRadius: '8px',
                            fontSize: '0.8rem'
                          }}
                        >
                          <i className={`bi ${policy.policyStatus === "Active" ? "bi-check-circle-fill" : "bi-pause-circle-fill"} me-1`}></i>
                          {policy.policyStatus}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <button 
                            className="btn btn-sm shadow-sm"
                            style={{ 
                              backgroundColor: `${COLORS.PRIMARY}15`, 
                              color: COLORS.PRIMARY, 
                              border: 'none',
                              borderRadius: '8px',
                              width: '36px',
                              height: '36px'
                            }}
                            onClick={() => handleView(policy)}
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button 
                            className="btn btn-sm shadow-sm"
                            style={{ 
                              backgroundColor: `${COLORS.CONTRAST}15`, 
                              color: COLORS.CONTRAST, 
                              border: 'none',
                              borderRadius: '8px',
                              width: '36px',
                              height: '36px'
                            }}
                            onClick={() => handleEdit(policy)}
                            title="Edit Policy"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm shadow-sm"
                            style={{ 
                              backgroundColor: '#fee', 
                              color: '#dc3545', 
                              border: 'none',
                              borderRadius: '8px',
                              width: '36px',
                              height: '36px'
                            }}
                            onClick={() => handleDeleteClick(policy)}
                            title="Delete Policy"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Grid View
            <div className="row g-4">
              {currentPolicies.map((policy, index) => (
                <div key={policy.id} className="col-xl-4 col-md-6" style={{ 
                  animation: `fadeIn 0.3s ease-in ${index * 0.05}s both`
                }}>
                  <div className="card h-100 shadow-sm border-0 hover-card" style={{ borderRadius: '16px', transition: 'all 0.3s ease' }}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                          style={{
                            backgroundColor: 
                              policy.policyType === "Health" ? COLORS.ACCENT_3 : 
                              policy.policyType === "Life" ? COLORS.CONTRAST : 
                              policy.policyType === "Accident" ? COLORS.WARNING : 
                              COLORS.ACCENT_2,
                            width: "60px",
                            height: "60px",
                            fontSize: '1.8rem'
                          }}
                        >
                          {policy.policyType === "Health" ? "🏥" :
                           policy.policyType === "Life" ? "❤️" :
                           policy.policyType === "Accident" ? "🚑" : "🏢"}
                        </div>
                        <span 
                          className="badge px-3 py-2"
                          style={{
                            backgroundColor: policy.policyStatus === "Active" ? `${COLORS.SUCCESS}15` : `${COLORS.WARNING}15`,
                            color: policy.policyStatus === "Active" ? COLORS.SUCCESS : COLORS.WARNING,
                            borderRadius: '8px'
                          }}
                        >
                          {policy.policyStatus}
                        </span>
                      </div>
                      
                      <h5 className="fw-bold mb-1" style={{ color: COLORS.DARK }}>
                        {policy.policyName}
                      </h5>
                      <p className="small mb-2" style={{ color: COLORS.TEXT_MUTED }}>
                        <span className="badge bg-light text-dark me-2">#{policy.policyNumber}</span>
                        {policy.policyType}
                      </p>
                      <p className="small mb-3" style={{ color: COLORS.TEXT_MUTED }}>
                        <i className="bi bi-building me-1"></i>
                        {policy.providerName}
                      </p>
                      
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <div className="p-3" style={{ backgroundColor: `${COLORS.PRIMARY}08`, borderRadius: '12px' }}>
                            <div className="small mb-1" style={{ color: COLORS.TEXT_MUTED }}>Coverage</div>
                            <div className="fw-bold" style={{ color: COLORS.DARK }}>
                              ₹{(parseFloat(policy.coverageAmount) / 100000).toFixed(1)}L
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-3" style={{ backgroundColor: `${COLORS.CONTRAST}08`, borderRadius: '12px' }}>
                            <div className="small mb-1" style={{ color: COLORS.TEXT_MUTED }}>Premium</div>
                            <div className="fw-bold" style={{ color: COLORS.DARK }}>
                              ₹{parseFloat(policy.monthlyPremium).toLocaleString('en-IN')}/mo
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm flex-grow-1 shadow-sm"
                          style={{ 
                            backgroundColor: COLORS.PRIMARY, 
                            color: 'white', 
                            border: 'none',
                            borderRadius: '8px'
                          }}
                          onClick={() => handleView(policy)}
                        >
                          <i className="bi bi-eye me-2"></i>View
                        </button>
                        <button 
                          className="btn btn-sm shadow-sm"
                          style={{ 
                            backgroundColor: `${COLORS.CONTRAST}15`, 
                            color: COLORS.CONTRAST, 
                            border: 'none',
                            borderRadius: '8px'
                          }}
                          onClick={() => handleEdit(policy)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm shadow-sm"
                          style={{ 
                            backgroundColor: '#fee', 
                            color: '#dc3545', 
                            border: 'none',
                            borderRadius: '8px'
                          }}
                          onClick={() => handleDeleteClick(policy)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-white border-0 py-4" style={{ borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="fw-semibold" style={{ color: COLORS.TEXT_MUTED }}>
                Showing {indexOfFirstPolicy + 1} to {Math.min(indexOfLastPolicy, filteredPolicies.length)} of {filteredPolicies.length} policies
              </div>
              <nav>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      style={{ 
                        borderRadius: '8px 0 0 8px',
                        color: COLORS.PRIMARY,
                        border: '1px solid #dee2e6'
                      }}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  
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
                      <li
                        key={pageNum}
                        className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          style={{
                            backgroundColor: currentPage === pageNum ? COLORS.PRIMARY : 'white',
                            borderColor: currentPage === pageNum ? COLORS.PRIMARY : '#dee2e6',
                            color: currentPage === pageNum ? 'white' : COLORS.PRIMARY
                          }}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      style={{ 
                        borderRadius: '0 8px 8px 0',
                        color: COLORS.PRIMARY,
                        border: '1px solid #dee2e6'
                      }}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced View Modal */}
      {viewPolicy && (
        <div 
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(43, 9, 56, 0.7)', backdropFilter: 'blur(4px)' }}
          tabIndex="-1"
          onClick={closeModal}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 py-4" style={{ 
                background: `linear-gradient(135deg, ${COLORS.PRIMARY} 0%, ${COLORS.ACCENT_2} 100%)`,
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px'
              }}>
                <h4 className="modal-title text-white fw-bold d-flex align-items-center">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      width: '50px', 
                      height: '50px',
                      fontSize: '1.5rem'
                    }}
                  >
                    {viewPolicy.policyType === "Health" ? "🏥" :
                     viewPolicy.policyType === "Life" ? "❤️" :
                     viewPolicy.policyType === "Accident" ? "🚑" : "🏢"}
                  </div>
                  {viewPolicy.policyName}
                </h4>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Policy Overview */}
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="p-4 h-100" style={{ backgroundColor: `${COLORS.PRIMARY}08`, borderRadius: '16px' }}>
                      <div className="small text-uppercase fw-bold mb-2" style={{ color: COLORS.PRIMARY, letterSpacing: '0.5px' }}>
                        Policy Information
                      </div>
                      <div className="mb-3">
                        <label className="small fw-semibold mb-1" style={{ color: COLORS.TEXT_MUTED }}>Policy Number</label>
                        <p className="mb-0 fw-bold" style={{ color: COLORS.DARK, fontSize: '1.1rem' }}>
                          {viewPolicy.policyNumber}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="small fw-semibold mb-1" style={{ color: COLORS.TEXT_MUTED }}>Policy Type</label>
                        <p className="mb-0" style={{ color: COLORS.DARK }}>
                          <span className="badge px-3 py-2" style={{ 
                            backgroundColor: `${COLORS.ACCENT_3}15`, 
                            color: COLORS.ACCENT_3,
                            borderRadius: '8px'
                          }}>
                            {viewPolicy.policyType}
                          </span>
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="small fw-semibold mb-1" style={{ color: COLORS.TEXT_MUTED }}>Provider</label>
                        <p className="mb-0 fw-semibold" style={{ color: COLORS.DARK }}>
                          <i className="bi bi-building me-2"></i>
                          {viewPolicy.providerName}
                        </p>
                      </div>
                      <div>
                        <label className="small fw-semibold mb-1" style={{ color: COLORS.TEXT_MUTED }}>Status</label>
                        <p className="mb-0">
                          <span className="badge px-3 py-2" style={{
                            backgroundColor: viewPolicy.policyStatus === "Active" ? `${COLORS.SUCCESS}15` : `${COLORS.WARNING}15`,
                            color: viewPolicy.policyStatus === "Active" ? COLORS.SUCCESS : COLORS.WARNING,
                            borderRadius: '8px'
                          }}>
                            <i className={`bi ${viewPolicy.policyStatus === "Active" ? "bi-check-circle-fill" : "bi-pause-circle-fill"} me-1`}></i>
                            {viewPolicy.policyStatus}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-4 h-100" style={{ backgroundColor: `${COLORS.CONTRAST}08`, borderRadius: '16px' }}>
                      <div className="small text-uppercase fw-bold mb-2" style={{ color: COLORS.CONTRAST, letterSpacing: '0.5px' }}>
                        Financial Details
                      </div>
                      <div className="mb-4">
                        <label className="small fw-semibold mb-1" style={{ color: COLORS.TEXT_MUTED }}>Coverage Amount</label>
                        <p className="mb-0 fw-bold" style={{ color: COLORS.DARK, fontSize: '1.8rem' }}>
                          ₹{parseFloat(viewPolicy.coverageAmount).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="mb-4">
                        <label className="small fw-semibold mb-1" style={{ color: COLORS.TEXT_MUTED }}>Monthly Premium</label>
                        <p className="mb-0 fw-bold" style={{ color: COLORS.DARK, fontSize: '1.5rem' }}>
                          ₹{parseFloat(viewPolicy.monthlyPremium).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <div className="p-2" style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                            <div className="small mb-1" style={{ color: COLORS.TEXT_MUTED }}>Annual Premium</div>
                            <div className="fw-bold" style={{ color: COLORS.DARK }}>
                              ₹{(parseFloat(viewPolicy.monthlyPremium) * 12).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-2" style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                            <div className="small mb-1" style={{ color: COLORS.TEXT_MUTED }}>Coverage Ratio</div>
                            <div className="fw-bold" style={{ color: COLORS.DARK }}>
                              {(parseFloat(viewPolicy.coverageAmount) / parseFloat(viewPolicy.monthlyPremium)).toFixed(0)}x
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-4 p-4" style={{ backgroundColor: `${COLORS.ACCENT_3}08`, borderRadius: '16px' }}>
                  <div className="small text-uppercase fw-bold mb-3" style={{ color: COLORS.ACCENT_3, letterSpacing: '0.5px' }}>
                    <i className="bi bi-calendar-range me-2"></i>
                    Policy Timeline
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            backgroundColor: `${COLORS.SUCCESS}15`,
                            color: COLORS.SUCCESS
                          }}
                        >
                          <i className="bi bi-play-circle-fill fs-4"></i>
                        </div>
                        <div>
                          <label className="small fw-semibold mb-1" style={{ color: COLORS.TEXT_MUTED }}>Start Date</label>
                          <p className="mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                            {new Date(viewPolicy.startDate).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            backgroundColor: `${COLORS.WARNING}15`,
                            color: COLORS.WARNING
                          }}
                        >
                          <i className="bi bi-arrow-repeat fs-4"></i>
                        </div>
                        <div>
                          <label className="small fw-semibold mb-1" style={{ color: COLORS.TEXT_MUTED }}>Renewal Date</label>
                          <p className="mb-0 fw-bold" style={{ color: COLORS.DARK }}>
                            {new Date(viewPolicy.renewalDate).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {viewPolicy.policyDescription && (
                  <div className="mb-4 p-4" style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: `2px solid ${COLORS.PRIMARY}15` }}>
                    <div className="small text-uppercase fw-bold mb-3" style={{ color: COLORS.PRIMARY, letterSpacing: '0.5px' }}>
                      <i className="bi bi-card-text me-2"></i>
                      Policy Description
                    </div>
                    <p className="mb-0" style={{ color: COLORS.DARK, lineHeight: '1.7' }}>
                      {viewPolicy.policyDescription}
                    </p>
                  </div>
                )}

                {/* Documents */}
                <div className="p-4" style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: `2px solid ${COLORS.ACCENT_2}15` }}>
                  <div className="small text-uppercase fw-bold mb-3" style={{ color: COLORS.ACCENT_2, letterSpacing: '0.5px' }}>
                    <i className="bi bi-paperclip me-2"></i>
                    Policy Documents
                  </div>
                  <div className="row g-3">
                    {[
                      { key: "contractUrl", label: "Contract Document", icon: "file-earmark-text" },
                      { key: "termsUrl", label: "Terms & Conditions", icon: "file-earmark-ruled" },
                      { key: "claimFormUrl", label: "Claim Form", icon: "file-earmark-medical" },
                      { key: "annexureUrl", label: "Annexure", icon: "file-earmark-plus" }
                    ].map((doc) =>
                      viewPolicy[doc.key] ? (
                        <div key={doc.key} className="col-md-6">
                          <a
                            href={viewPolicy[doc.key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary w-100 text-start d-flex align-items-center p-3"
                            style={{ 
                              borderRadius: '12px',
                              borderColor: COLORS.PRIMARY,
                              color: COLORS.PRIMARY
                            }}
                          >
                            <i className={`bi bi-${doc.icon} fs-4 me-3`}></i>
                            <div>
                              <div className="fw-semibold">{doc.label}</div>
                              <small style={{ color: COLORS.TEXT_MUTED }}>Click to download</small>
                            </div>
                            <i className="bi bi-download ms-auto"></i>
                          </a>
                        </div>
                      ) : (
                        <div key={doc.key} className="col-md-6">
                          <div 
                            className="p-3 text-center"
                            style={{ 
                              backgroundColor: '#f8f9fa', 
                              borderRadius: '12px',
                              border: '2px dashed #dee2e6'
                            }}
                          >
                            <i className={`bi bi-${doc.icon} fs-4 mb-2`} style={{ color: COLORS.TEXT_MUTED }}></i>
                            <div className="small" style={{ color: COLORS.TEXT_MUTED }}>
                              {doc.label} not available
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4" style={{ backgroundColor: '#f8f9fa', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                <button
                  type="button"
                  className="btn btn-lg px-5"
                  style={{ 
                    backgroundColor: COLORS.PRIMARY, 
                    color: 'white', 
                    borderRadius: '10px',
                    border: 'none'
                  }}
                  onClick={closeModal}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && policyToDelete && (
        <div 
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(43, 9, 56, 0.7)', backdropFilter: 'blur(4px)' }}
          tabIndex="-1"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-body p-5 text-center">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: '#fee',
                    color: '#dc3545'
                  }}
                >
                  <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h4 className="fw-bold mb-3" style={{ color: COLORS.DARK }}>
                  Delete Policy?
                </h4>
                <p style={{ color: COLORS.TEXT_MUTED }} className="mb-4">
                  Are you sure you want to delete <strong>{policyToDelete.policyName}</strong>?
                  <br />
                  This action cannot be undone.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-lg px-5"
                    style={{ 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      borderRadius: '10px',
                      border: 'none'
                    }}
                    onClick={confirmDelete}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-trash me-2"></i>
                        Yes, Delete
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-lg btn-outline-secondary px-5"
                    style={{ borderRadius: '10px' }}
                    onClick={() => {
                      setShowDeleteModal(false);
                      setPolicyToDelete(null);
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations and hover effects */}
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
        }

        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.15) !important;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: ${COLORS.PRIMARY};
          box-shadow: 0 0 0 0.2rem ${COLORS.PRIMARY}33;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn:active {
          transform: translateY(0);
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .page-link {
          transition: all 0.2s ease;
        }

        .page-link:hover {
          transform: translateY(-2px);
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
      `}</style>
    </div>
  );
}