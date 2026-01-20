import React, { useState } from "react";
import "../Dashboard.css";

export default function EmployeeSupport({ 
  agentsAvailability, 
  selectedAgentId, 
  setSelectedAgentId, 
  showNotificationAlert 
}) {
  const [activeFaq, setActiveFaq] = useState("");
  const [expandedFaqs, setExpandedFaqs] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const faqs = [
    {
      id: "submitClaim",
      question: "How to submit a claim?",
      answer: "Log in to your Employee Dashboard, navigate to 'Submit New Claim', fill in the claim details, attach required documents, and submit. Ensure all fields are correctly filled for faster processing.",
      icon: "bi-file-text",
      category: "Claims"
    },
    {
      id: "processingTime",
      question: "Claim processing time",
      answer: "Claims are processed Monday to Saturday. Standard claims are reviewed within 48 hours. Urgent claims are prioritized and processed as quickly as possible.",
      icon: "bi-clock",
      category: "Claims"
    },
    {
      id: "requiredDocs",
      question: "Required documents",
      answer: "You will need: Contract form, Claim form, Hospital bills, Medical reports, Supporting receipts, ID proof. Ensure all documents are legible and complete.",
      icon: "bi-file-earmark",
      category: "Claims"
    },
    {
      id: "trackClaim",
      question: "Can I track my claim status?",
      answer: "Yes, all submitted claims can be tracked in real-time via the 'My Claims' section in your dashboard. You'll receive status updates at every stage of the process.",
      icon: "bi-truck",
      category: "Tracking"
    },
    {
      id: "contactAssistance",
      question: "Who can I contact for assistance?",
      answer: "You can contact our insurance agents via callback request, live chat (coming soon), or email support@insurai.com. Our team is available Monday-Friday 9AM-6PM.",
      icon: "bi-person",
      category: "Support"
    },
    {
      id: "urgentAssistance",
      question: "What if I need urgent assistance?",
      answer: "For urgent medical emergencies, call 1-800-INSURAI (1-800-467-8724). Available 24/7 for emergency claims and immediate assistance.",
      icon: "bi-exclamation-triangle",
      category: "Emergency"
    },
    {
      id: "policyCoverage",
      question: "What does my policy cover?",
      answer: "Your policy covers hospitalization, surgical procedures, medication, and diagnostic tests. Check your policy document for specific coverage details and limits.",
      icon: "bi-shield-check",
      category: "Policy"
    },
    {
      id: "renewalProcess",
      question: "How to renew my policy?",
      answer: "Policy renewal is automatic. You'll receive a notification 30 days before expiry. No action required unless you wish to make changes to your coverage.",
      icon: "bi-arrow-repeat",
      category: "Policy"
    }
  ];

  const requiredDocuments = [
    { name: "Contract Form", mandatory: true },
    { name: "Claim Form", mandatory: true },
    { name: "Hospital Bills", mandatory: true },
    { name: "Medical Reports", mandatory: true },
    { name: "Supporting Receipts", mandatory: true },
    { name: "ID Proof", mandatory: true },
    { name: "Doctor's Prescription", mandatory: false },
    { name: "Discharge Summary", mandatory: false }
  ];

  const supportCategories = [
    { name: "Claims", count: 3, icon: "bi-file-text", color: "#38BDF8" },
    { name: "Policy", count: 2, icon: "bi-shield-check", color: "#818CF8" },
    { name: "Tracking", count: 1, icon: "bi-truck", color: "#10B981" },
    { name: "Support", count: 2, icon: "bi-headset", color: "#F472B6" }
  ];

  const toggleFaq = (faqId) => {
    setExpandedFaqs(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    );
  };

  const getAvailableAgentsCount = () => {
    return agentsAvailability.filter(a => a.available).length;
  };

  // Inline styles matching Homepage theme
  const styles = {
    container: {
      padding: '2rem',
      minHeight: '100vh',
      position: 'relative',
      zIndex: 1,
      background: 'linear-gradient(135deg, #020617 0%, #0F172A 50%, #020617 100%)',
      overflow: 'hidden',
    },
    backgroundOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(56, 189, 248, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(129, 140, 248, 0.08) 0%, transparent 50%)',
      pointerEvents: 'none',
      zIndex: 0,
    },
    contentWrapper: {
      position: 'relative',
      zIndex: 1,
    },
    header: {
      marginBottom: '2.5rem',
    },
    headerTitle: {
      fontSize: '2rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #F472B6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem',
      letterSpacing: '-0.02em',
    },
    headerSubtitle: {
      color: '#94A3B8',
      fontSize: '1rem',
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2rem',
      marginBottom: '2rem',
    },
    card: {
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
      borderRadius: '24px',
      border: '1px solid rgba(148, 163, 184, 0.12)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(20px)',
    },
    cardHover: {
      borderColor: 'rgba(148, 163, 184, 0.25)',
      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
      transform: 'translateY(-4px)',
    },
    cardHeader: {
      background: 'rgba(30, 41, 59, 0.5)',
      padding: '1.5rem 2rem',
      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
    },
    cardHeaderIcon: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: 'rgba(56, 189, 248, 0.15)',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      color: '#38BDF8',
    },
    cardTitle: {
      fontSize: '1.15rem',
      fontWeight: '700',
      color: '#F8FAFC',
      margin: 0,
    },
    cardBody: {
      padding: '2rem',
    },
    iconLarge: {
      width: '80px',
      height: '80px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2.25rem',
      margin: '0 auto 1.5rem',
      background: 'rgba(56, 189, 248, 0.1)',
      border: '1px solid rgba(56, 189, 248, 0.2)',
    },
    description: {
      textAlign: 'center',
      color: '#94A3B8',
      fontSize: '0.95rem',
      lineHeight: '1.7',
      marginBottom: '2rem',
    },
    statusCard: {
      background: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '14px',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.75rem',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusInfo: {
      display: 'flex',
      flexDirection: 'column',
    },
    statusTitle: {
      fontSize: '0.95rem',
      fontWeight: '600',
      color: '#F8FAFC',
      marginBottom: '0.25rem',
    },
    statusSubtext: {
      fontSize: '0.8rem',
      color: '#94A3B8',
    },
    badge: {
      padding: '0.5rem 1rem',
      borderRadius: '50px',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    badgeAvailable: {
      background: 'rgba(16, 185, 129, 0.2)',
      color: '#10B981',
      border: '1px solid rgba(16, 185, 129, 0.3)',
    },
    badgeLimited: {
      background: 'rgba(251, 146, 60, 0.2)',
      color: '#FB923C',
      border: '1px solid rgba(251, 146, 60, 0.3)',
    },
    select: {
      width: '100%',
      padding: '1rem 1.25rem',
      background: 'rgba(15, 23, 42, 0.8)',
      border: '1px solid rgba(148, 163, 184, 0.15)',
      borderRadius: '14px',
      color: '#F8FAFC',
      fontSize: '0.95rem',
      cursor: 'pointer',
      marginBottom: '1.25rem',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2394A3B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      backgroundSize: '12px',
    },
    selectLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#94A3B8',
      marginBottom: '0.75rem',
    },
    btnPrimary: {
      width: '100%',
      padding: '1rem 1.5rem',
      background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)',
      border: 'none',
      borderRadius: '14px',
      color: '#020617',
      fontSize: '0.95rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    btnSecondary: {
      width: '100%',
      padding: '1rem 1.5rem',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(148, 163, 184, 0.15)',
      borderRadius: '14px',
      color: '#F8FAFC',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    btnSuccess: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: 'white',
    },
    btnDanger: {
      background: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)',
      color: 'white',
    },
    helpText: {
      textAlign: 'center',
      marginTop: '1rem',
      fontSize: '0.8rem',
      color: '#64748B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      marginBottom: '2rem',
    },
    categoryBtn: {
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(148, 163, 184, 0.12)',
      borderRadius: '12px',
      padding: '1rem',
      color: '#F8FAFC',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      textAlign: 'left',
    },
    categoryCount: {
      marginLeft: 'auto',
      background: 'rgba(129, 140, 248, 0.2)',
      color: '#818CF8',
      padding: '0.2rem 0.6rem',
      borderRadius: '50px',
      fontSize: '0.7rem',
      fontWeight: '700',
    },
    faqItem: {
      background: 'rgba(15, 23, 42, 0.5)',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      borderRadius: '14px',
      marginBottom: '0.75rem',
      overflow: 'hidden',
      transition: 'all 0.25s ease',
    },
    faqQuestion: {
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      color: '#F8FAFC',
      fontSize: '0.9rem',
      fontWeight: '500',
      background: 'transparent',
      border: 'none',
      width: '100%',
      textAlign: 'left',
    },
    faqAnswer: {
      padding: '0 1.25rem 1.25rem',
      color: '#94A3B8',
      fontSize: '0.875rem',
      lineHeight: '1.7',
      borderTop: '1px solid rgba(148, 163, 184, 0.1)',
      paddingTop: '1rem',
    },
    channelsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    channelCard: {
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
      borderRadius: '24px',
      border: '1px solid rgba(148, 163, 184, 0.12)',
      padding: '2rem',
      textAlign: 'center',
      transition: 'all 0.3s ease',
    },
    channelIcon: {
      width: '72px',
      height: '72px',
      borderRadius: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      margin: '0 auto 1.5rem',
    },
    channelTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#F8FAFC',
      marginBottom: '0.5rem',
    },
    channelDesc: {
      color: '#94A3B8',
      fontSize: '0.875rem',
      lineHeight: '1.6',
      marginBottom: '1.5rem',
    },
    channelInfo: {
      background: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1.5rem',
      border: '1px solid rgba(148, 163, 184, 0.1)',
    },
    emergencyCard: {
      background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
      border: '1px solid rgba(251, 146, 60, 0.3)',
      borderRadius: '24px',
      padding: '2rem 2.5rem',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: '2rem',
      alignItems: 'center',
    },
    emergencyIcon: {
      fontSize: '3.5rem',
      color: '#FB923C',
    },
    emergencyTitle: {
      fontSize: '1.35rem',
      fontWeight: '700',
      color: '#F8FAFC',
      marginBottom: '0.5rem',
    },
    emergencyPhone: {
      fontSize: '1.75rem',
      fontWeight: '800',
      color: '#FB923C',
      marginBottom: '0.5rem',
    },
    emergencyAvailability: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#94A3B8',
      fontSize: '0.9rem',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '2rem',
    },
    modalContent: {
      background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
      border: '1px solid rgba(148, 163, 184, 0.15)',
      borderRadius: '24px',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '85vh',
      overflow: 'hidden',
      boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
    },
    modalHeader: {
      background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #F472B6 100%)',
      padding: '1.5rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalTitle: {
      color: '#020617',
      fontSize: '1.25rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      margin: 0,
    },
    modalClose: {
      background: 'rgba(2, 6, 23, 0.2)',
      border: 'none',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#020617',
      fontSize: '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    modalBody: {
      padding: '2rem',
      maxHeight: 'calc(85vh - 140px)',
      overflowY: 'auto',
    },
    modalFooter: {
      padding: '1.25rem 2rem',
      borderTop: '1px solid rgba(148, 163, 184, 0.1)',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
    },
    emptyIcon: {
      fontSize: '4rem',
      color: '#64748B',
      marginBottom: '1rem',
    },
  };

  const renderContactAgentCard = () => (
    <div 
      style={{
        ...styles.card,
        ...(hoveredCard === 'agent' ? styles.cardHover : {})
      }}
      onMouseEnter={() => setHoveredCard('agent')}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardHeaderIcon}>
          <i className="bi bi-headset"></i>
        </div>
        <h3 style={styles.cardTitle}>Contact Insurance Agent</h3>
      </div>
      <div style={styles.cardBody}>
        <div style={{ ...styles.iconLarge, background: 'rgba(129, 140, 248, 0.15)', borderColor: 'rgba(129, 140, 248, 0.25)' }}>
          <i className="bi bi-headset" style={{ color: '#818CF8' }}></i>
        </div>
        <p style={styles.description}>
          Get personalized assistance with your claims and policies from our expert insurance agents.
        </p>

        {/* Agent Availability Status */}
        <div style={styles.statusCard}>
          <div style={styles.statusInfo}>
            <span style={styles.statusTitle}>Agent Availability</span>
            <span style={styles.statusSubtext}>
              {getAvailableAgentsCount()} of {agentsAvailability.length} agents online
            </span>
          </div>
          <div style={{
            ...styles.badge,
            ...(getAvailableAgentsCount() > 0 ? styles.badgeAvailable : styles.badgeLimited)
          }}>
            {getAvailableAgentsCount() > 0 ? '● Available' : '● Limited'}
          </div>
        </div>

        {/* Agent Selection */}
        {agentsAvailability.length > 0 ? (
          <>
            <label style={styles.selectLabel}>
              Select Agent <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              style={styles.select}
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              <option value="">Choose an agent...</option>
              {agentsAvailability.map((a) => (
                <option
                  key={a.id}
                  value={a.agent.id}
                  disabled={!a.available}
                >
                  {a.agent.name} • {a.available ? "🟢 Online" : "🔴 Offline"}
                  {a.agent.specialization && ` • ${a.agent.specialization}`}
                </option>
              ))}
            </select>

            <button
              style={{
                ...styles.btnPrimary,
                opacity: !selectedAgentId ? 0.5 : 1,
                cursor: !selectedAgentId ? 'not-allowed' : 'pointer',
              }}
              disabled={!selectedAgentId}
              onClick={() => showNotificationAlert("Agent callback requested. They will contact you soon.", "success")}
              onMouseEnter={(e) => {
                if (selectedAgentId) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 0 40px rgba(56, 189, 248, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="bi bi-telephone"></i> Request Callback
            </button>

            <p style={styles.helpText}>
              <i className="bi bi-info-circle"></i>
              Typically respond within 2-4 hours
            </p>
          </>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <i className="bi bi-person-x"></i>
            </div>
            <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>No agents available currently</p>
            <button
              style={styles.btnSecondary}
              onClick={() => showNotificationAlert("Our team will contact you as soon as an agent becomes available.", "info")}
            >
              <i className="bi bi-bell"></i> Notify Me
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderFaqsCard = () => (
    <div 
      style={{
        ...styles.card,
        ...(hoveredCard === 'faq' ? styles.cardHover : {})
      }}
      onMouseEnter={() => setHoveredCard('faq')}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div style={styles.cardHeader}>
        <div style={{ ...styles.cardHeaderIcon, background: 'rgba(244, 114, 182, 0.15)', borderColor: 'rgba(244, 114, 182, 0.25)' }}>
          <i className="bi bi-lightbulb" style={{ color: '#F472B6' }}></i>
        </div>
        <h3 style={styles.cardTitle}>FAQs & Resources</h3>
      </div>
      <div style={styles.cardBody}>
        <div style={{ ...styles.iconLarge, background: 'rgba(251, 191, 36, 0.15)', borderColor: 'rgba(251, 191, 36, 0.25)' }}>
          <i className="bi bi-lightbulb" style={{ color: '#FBBF24' }}></i>
        </div>
        <p style={styles.description}>
          Find answers to common questions about your insurance benefits and claim processes.
        </p>

        {/* FAQ Categories */}
        <label style={styles.selectLabel}>Browse by Category</label>
        <div style={styles.categoryGrid}>
          {supportCategories.map((category, index) => (
            <button
              key={index}
              style={styles.categoryBtn}
              onClick={() => setActiveFaq(category.name)}
              onMouseEnter={(e) => {
                e.target.style.background = `rgba(56, 189, 248, 0.1)`;
                e.target.style.borderColor = category.color;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(15, 23, 42, 0.6)';
                e.target.style.borderColor = 'rgba(148, 163, 184, 0.12)';
              }}
            >
              <i className={`bi ${category.icon}`} style={{ color: category.color }}></i>
              {category.name}
              <span style={styles.categoryCount}>{category.count}</span>
            </button>
          ))}
        </div>

        {/* Quick FAQ Links */}
        <label style={styles.selectLabel}>Quick Questions</label>
        <div>
          {faqs.slice(0, 4).map((faq) => (
            <div key={faq.id} style={{
              ...styles.faqItem,
              borderColor: expandedFaqs.includes(faq.id) ? 'rgba(56, 189, 248, 0.3)' : 'rgba(148, 163, 184, 0.1)',
            }}>
              <button
                style={styles.faqQuestion}
                onClick={() => toggleFaq(faq.id)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className={`bi ${faq.icon}`} style={{ color: '#38BDF8' }}></i>
                  {faq.question}
                </span>
                <i className={`bi ${expandedFaqs.includes(faq.id) ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ color: '#64748B' }}></i>
              </button>
              {expandedFaqs.includes(faq.id) && (
                <div style={styles.faqAnswer}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View All FAQs Button */}
        <button
          style={{ ...styles.btnPrimary, marginTop: '1.5rem' }}
          onClick={() => setActiveFaq("allFaqs")}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 0 40px rgba(56, 189, 248, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <i className="bi bi-search"></i> View All FAQs
        </button>
      </div>
    </div>
  );

  const renderSupportChannels = () => (
    <div style={styles.channelsGrid}>
      {/* Live Chat Support */}
      <div 
        style={{
          ...styles.channelCard,
          ...(hoveredCard === 'chat' ? styles.cardHover : {})
        }}
        onMouseEnter={() => setHoveredCard('chat')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div style={{ 
          ...styles.channelIcon, 
          background: 'rgba(16, 185, 129, 0.15)', 
          border: '1px solid rgba(16, 185, 129, 0.25)' 
        }}>
          <i className="bi bi-chat-dots" style={{ color: '#10B981' }}></i>
        </div>
        <h4 style={styles.channelTitle}>Live Chat Support</h4>
        <p style={styles.channelDesc}>
          Chat with our support team for immediate assistance with your queries.
        </p>
        
        <div style={styles.channelInfo}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#FBBF24' }}>
            <i className="bi bi-clock"></i>
            <span style={{ fontSize: '0.85rem' }}>Monday - Friday, 9AM - 6PM</span>
          </div>
        </div>

        <button
          style={{ ...styles.btnPrimary, ...styles.btnSuccess }}
          onClick={() => showNotificationAlert("Live chat feature coming soon! Stay tuned for updates.", "info")}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <i className="bi bi-chat"></i> Start Live Chat
        </button>
      </div>

      {/* Email Support */}
      <div 
        style={{
          ...styles.channelCard,
          ...(hoveredCard === 'email' ? styles.cardHover : {})
        }}
        onMouseEnter={() => setHoveredCard('email')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div style={{ 
          ...styles.channelIcon, 
          background: 'rgba(56, 189, 248, 0.15)', 
          border: '1px solid rgba(56, 189, 248, 0.25)' 
        }}>
          <i className="bi bi-envelope" style={{ color: '#38BDF8' }}></i>
        </div>
        <h4 style={styles.channelTitle}>Email Support</h4>
        <p style={styles.channelDesc}>
          Send detailed queries via email and get comprehensive responses.
        </p>

        <div style={styles.channelInfo}>
          <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#F8FAFC', marginBottom: '0.25rem' }}>
            support@insurai.com
          </h5>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>We respond within 24 hours</span>
        </div>

        <button
          style={styles.btnPrimary}
          onClick={() => window.location = "mailto:support@insurai.com?subject=Insurance Support Query"}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 0 40px rgba(56, 189, 248, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <i className="bi bi-send"></i> Send Email
        </button>
      </div>
    </div>
  );

  const renderEmergencyAssistance = () => (
    <div style={styles.emergencyCard}>
      <div style={styles.emergencyIcon}>
        <i className="bi bi-exclamation-triangle"></i>
      </div>
      <div>
        <h3 style={styles.emergencyTitle}>Emergency Assistance</h3>
        <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          For urgent medical emergencies requiring immediate claim processing:
        </p>
        <div style={styles.emergencyPhone}>1-800-INSURAI (1-800-467-8724)</div>
        <div style={styles.emergencyAvailability}>
          <i className="bi bi-clock"></i>
          Available 24/7 for emergency claims and immediate assistance
        </div>
      </div>
      <button
        style={{ ...styles.btnPrimary, ...styles.btnDanger, minWidth: '160px', padding: '1.25rem 2rem' }}
        onClick={() => showNotificationAlert("Emergency line: 1-800-467-8724. Please use this number only for genuine emergencies.", "warning")}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 0 30px rgba(251, 146, 60, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <i className="bi bi-telephone"></i> Call Now
      </button>
    </div>
  );

  const renderAllFaqsModal = () => (
    <div style={styles.modal} onClick={() => setActiveFaq("")}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            <i className="bi bi-question-circle"></i>
            Frequently Asked Questions
          </h2>
          <button 
            style={styles.modalClose}
            onClick={() => setActiveFaq("")}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(2, 6, 23, 0.3)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(2, 6, 23, 0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
        </div>
        <div style={styles.modalBody}>
          {faqs.map((faq) => (
            <div key={faq.id} style={{ ...styles.faqItem, marginBottom: '1rem' }}>
              <div style={{ ...styles.faqQuestion, cursor: 'default', padding: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className={`bi ${faq.icon}`} style={{ color: '#38BDF8' }}></i>
                  <span style={{ fontWeight: '600' }}>{faq.question}</span>
                </span>
                <span style={{
                  background: 'rgba(129, 140, 248, 0.2)',
                  color: '#818CF8',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '50px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                }}>{faq.category}</span>
              </div>
              <div style={{ ...styles.faqAnswer, background: 'rgba(56, 189, 248, 0.03)' }}>
                {faq.answer}
              </div>
            </div>
          ))}
          
          {/* Required Documents Section */}
          <div style={{ ...styles.faqItem, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ ...styles.faqQuestion, cursor: 'default', padding: '1.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="bi bi-file-earmark-check" style={{ color: '#10B981' }}></i>
                <span style={{ fontWeight: '600' }}>Required Documents Checklist</span>
              </span>
            </div>
            <div style={{ ...styles.faqAnswer, background: 'rgba(16, 185, 129, 0.03)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {requiredDocuments.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className={`bi ${doc.mandatory ? 'bi-check-circle-fill' : 'bi-info-circle'}`} 
                       style={{ color: doc.mandatory ? '#10B981' : '#38BDF8' }}></i>
                    <span style={{ color: doc.mandatory ? '#F8FAFC' : '#94A3B8', fontWeight: doc.mandatory ? '500' : '400' }}>
                      {doc.name}
                    </span>
                    {doc.mandatory && <span style={{ color: '#EF4444', fontSize: '0.8rem' }}>*</span>}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-info-circle"></i>
                * Mandatory documents for claim processing
              </p>
            </div>
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button 
            style={{ ...styles.btnSecondary, width: 'auto', padding: '0.875rem 2rem' }}
            onClick={() => setActiveFaq("")}
          >
            <i className="bi bi-x-circle"></i> Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Background Overlay */}
      <div style={styles.backgroundOverlay}></div>
      
      {/* Content Wrapper */}
      <div style={styles.contentWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Get Support</h1>
          <p style={styles.headerSubtitle}>Multiple ways to get help with your insurance needs</p>
        </div>

        {/* Main Support Cards */}
        <div style={styles.mainGrid}>
          {renderContactAgentCard()}
          {renderFaqsCard()}
        </div>

        {/* Support Channels */}
        {renderSupportChannels()}

        {/* Emergency Assistance */}
        <div style={{ marginBottom: '2rem' }}>
          {renderEmergencyAssistance()}
        </div>

        {/* Responsive styles for smaller screens */}
        <style>{`
          @media (max-width: 1024px) {
            .support-main-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 768px) {
            .support-channels-grid {
              grid-template-columns: 1fr !important;
            }
            .emergency-card {
              grid-template-columns: 1fr !important;
              text-align: center !important;
              gap: 1.5rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}