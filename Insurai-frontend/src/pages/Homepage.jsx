import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* =========================
   FUTURISTIC DESIGN SYSTEM
========================= */
const theme = {
  bg: "#020617",
  surface: "rgba(15,23,42,0.65)",
  border: "rgba(148,163,184,0.15)",

  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",

  neonBlue: "#38BDF8",
  neonPurple: "#818CF8",
  neonPink: "#F472B6",
  neonGreen: "#10B981",

  gradientMain:
    "linear-gradient(135deg, #020617 0%, #020617 40%, #0F172A 100%)",

  gradientNeon:
    "linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #F472B6 100%)",

  glow:
    "0 0 40px rgba(56,189,248,0.35), 0 0 80px rgba(129,140,248,0.15)",
};

/* =========================
   ANIMATIONS
========================= */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const glowHover = {
  whileHover: {
    y: -8,
    boxShadow: theme.glow,
    transition: { duration: 0.3 },
  },
};

const scaleHover = {
  whileHover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  },
  whileTap: {
    scale: 0.98,
  },
};

/* =========================
   MAIN COMPONENT
========================= */
const HomePage = () => {
  const navigate = useNavigate();
   const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (event, sectionId) => {
    event.preventDefault();
    scrollToSection(sectionId);
  };

  return (
    <div style={styles.page}>

      {/* ================= NAVBAR ================= */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={styles.navbar}
      >
        <div style={styles.navContent}>
          <div style={styles.brand}>
            Insur<span style={styles.brandAccent}>AI</span>
          </div>

          <div style={styles.navLinks}>
            <a
              href="#platform"
              style={styles.navLink}
              onClick={(e) => handleNavClick(e, "platform")}
            >
              Platform
            </a>
            <a
              href="#workflow"
              style={styles.navLink}
              onClick={(e) => handleNavClick(e, "workflow")}
            >
              Workflow
            </a>
            <a
              href="#roles"
              style={styles.navLink}
              onClick={(e) => handleNavClick(e, "roles")}
            >
              Roles
            </a>
            <a
              href="#login"
              style={styles.navBtn}
              onClick={(e) => handleNavClick(e, "login")}
            >
              Get Started
            </a>
          </div>
        </div>
      </motion.nav>

      {/* ================= HERO ================= */}
      <section style={styles.hero}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.9 }}
          style={styles.heroContent}
        >
          <h1 style={styles.heroTitle}>
            Insurance, Reinvented with
            <span style={styles.heroGradient}> Artificial Intelligence</span>
          </h1>

          <p style={styles.heroSubtitle}>
            A next-generation insurance platform with automated claims,
            intelligent risk analysis, and enterprise-grade security.
          </p>

          <motion.div
            style={styles.heroActions}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              type="button"
              style={styles.primaryBtn}
              onClick={() => scrollToSection("login")}
            >
              Get Started
            </button>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={() => scrollToSection("workflow")}
            >
              Explore System
            </button>
          </motion.div>
        </motion.div>

        {/* GLOW ORBS */}
        <div style={styles.orbBlue} />
        <div style={styles.orbPurple} />
      </section>

      {/* ================= PLATFORM ================= */}
      <section id="platform" style={styles.section}>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={styles.sectionTitle}
        >
          Platform Capabilities
        </motion.h2>

        <div style={styles.grid}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              {...glowHover}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              style={styles.card}
            >
              <div style={styles.icon}>{f.icon}</div>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardText}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= WORKFLOW ================= */}
      <section id="workflow" style={styles.sectionAlt}>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={styles.sectionTitle}
        >
          Intelligent Workflow
        </motion.h2>

        <div style={styles.workflow}>
          {workflow.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              style={styles.workflowStep}
            >
              <div style={styles.stepIndex}>{i + 1}</div>
              <div>
                <h4 style={styles.stepTitle}>{step.title}</h4>
                <p style={styles.stepText}>{step.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= ROLE SELECTION (NEW) ================= */}
      <section id="login" style={styles.section}>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <h2 style={styles.sectionTitle}>
            Choose Your <span style={styles.heroGradient}>Access Portal</span>
          </h2>
          <p style={{ ...styles.cardText, fontSize: "1.1rem", marginTop: "1rem" }}>
            Select your role to access your personalized dashboard
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={styles.accessGrid}
        >
          {accessActions.map((action, idx) => (
            <motion.div
              key={action.title}
              {...scaleHover}
              transition={{ delay: idx * 0.1 }}
              style={{
                ...styles.accessCard,
                borderColor: action.accent,
              }}
            >
              <div style={styles.accessIcon}>{action.icon}</div>
              <div>
                <p style={styles.accessLabel}>{action.title}</p>
                <p style={styles.accessDesc}>{action.desc}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  ...styles.accessButton,
                  color: action.accent,
                  borderColor: action.accent,
                }}
                onClick={() => navigate(action.path)}
              >
                {action.button}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ================= ROLES INFO ================= */}
      <section id="roles" style={styles.section}>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={styles.sectionTitle}
        >
          Role-Based Architecture
        </motion.h2>

        <div style={styles.grid}>
          {roles.map((r, i) => (
            <motion.div
              key={i}
              {...glowHover}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              style={styles.card}
            >
              <div style={styles.icon}>{r.icon}</div>
              <h3 style={styles.cardTitle}>{r.title}</h3>
              <p style={styles.cardText}>{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <div style={styles.footerBrand}>
              Insur<span style={styles.brandAccent}>AI</span>
            </div>
            <p style={styles.footerText}>
              AI-first infrastructure for automated, intelligent insurance.
            </p>
          </div>

          <div style={styles.footerLinks}>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => scrollToSection("platform")}
            >
              Platform
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => scrollToSection("workflow")}
            >
              Workflow
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => scrollToSection("roles")}
            >
              Roles
            </button>
            <button
              type="button"
              style={styles.footerLink}
              onClick={() => scrollToSection("login")}
            >
              Access
            </button>
          </div>

          <div style={styles.footerMeta}>
            <span>© 2025 InsurAI</span>
            <span>Enterprise Insurance Automation</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* =========================
   DATA
========================= */
const features = [
  { icon: "🧠", title: "AI Claim Engine", desc: "Automated validation and fraud detection using intelligent rules." },
  { icon: "📊", title: "Real-Time Analytics", desc: "Live dashboards for Admin and HR decision making." },
  { icon: "🔐", title: "Zero-Trust Security", desc: "Enterprise-grade authentication and role-based access." },
  { icon: "⚡", title: "Instant Processing", desc: "Optimized backend pipelines for fast approvals." }
];

const workflow = [
  { title: "Policy Creation", text: "Admin defines coverage, premiums, and lifecycle." },
  { title: "Enrollment", text: "Employees select policies aligned to their needs." },
  { title: "Claim Submission", text: "Digital claim filing with incident metadata." },
  { title: "AI Verification", text: "System validates policy and claim authenticity." },
  { title: "Settlement", text: "Approval and disbursement workflow." }
];

const roles = [
  { icon: "👤", title: "Employee", desc: "Claims, policies, and coverage tracking." },
  { icon: "🏢", title: "HR", desc: "Policy allocation and workforce insights." },
  { icon: "🧑‍💼", title: "Agent", desc: "Customer onboarding and assistance." },
  { icon: "⚙️", title: "Admin", desc: "System governance and analytics." }
];

const accessActions = [
   {
    title: "Employee Portal",
    desc: "Manage policies, claims, and support.",
    button: "Employee Login",
    path: "/employee/login",
    icon: "👤",
    accent: theme.neonPurple,
  },
  {
    title: "HR Command",
    desc: "Oversee policies and workforce analytics.",
    button: "HR Login",
    path: "/hr/login",
    icon: "🏢",
    accent: theme.neonPink,
  },
  {
    title: "Agent Desk",
    desc: "Assist customers and process requests.",
    button: "Agent Login",
    path: "/agent/login",
    icon: "🧑‍💼",
    accent: theme.neonGreen,
  },
  {
    title: "Admin Control",
    desc: "Configure systems and monitor analytics.",
    button: "Admin Login",
    path: "/admin/login",
    icon: "⚙️",
    accent: theme.neonPurple,
  },
];

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    fontFamily: "Inter, system-ui, sans-serif",
    background: theme.gradientMain,
    color: theme.textPrimary,
    overflowX: "hidden",
  },

  navbar: {
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 100,
    background: theme.surface,
    backdropFilter: "blur(14px)",
    borderBottom: `1px solid ${theme.border}`,
  },

  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brand: {
    fontSize: "1.6rem",
    fontWeight: 700,
    letterSpacing: "0.5px",
    cursor: "pointer",
  },

  brandAccent: {
    background: theme.gradientNeon,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  navLinks: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  },

  navLink: {
    color: theme.textSecondary,
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 0.3s",
    cursor: "pointer",
  },

  navBtn: {
    background: theme.gradientNeon,
    padding: "0.5rem 1.3rem",
    borderRadius: "10px",
    color: "#020617",
    fontWeight: 700,
    textDecoration: "none",
    transition: "transform 0.3s",
    cursor: "pointer",
  },

  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: "6rem",
  },

  heroContent: {
    maxWidth: "900px",
    textAlign: "center",
    zIndex: 2,
  },

  heroTitle: {
    fontSize: "3.2rem",
    fontWeight: 800,
    lineHeight: 1.2,
  },

  heroGradient: {
    background: theme.gradientNeon,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  heroSubtitle: {
    marginTop: "1.5rem",
    fontSize: "1.15rem",
    color: theme.textSecondary,
  },

  heroActions: {
    marginTop: "2.5rem",
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
  },

  primaryBtn: {
    background: theme.gradientNeon,
    padding: "0.9rem 1.8rem",
    borderRadius: "14px",
    color: "#020617",
    fontWeight: 700,
    textDecoration: "none",
    transition: "transform 0.3s",
    border: "none",
    cursor: "pointer",
  },

  secondaryBtn: {
    border: `1px solid ${theme.border}`,
    padding: "0.9rem 1.8rem",
    borderRadius: "14px",
    color: theme.textPrimary,
    textDecoration: "none",
    transition: "all 0.3s",
    background: "transparent",
    cursor: "pointer",
  },

  orbBlue: {
    position: "absolute",
    width: "420px",
    height: "420px",
    background: "rgba(56,189,248,0.25)",
    filter: "blur(140px)",
    top: "20%",
    left: "-10%",
  },

  orbPurple: {
    position: "absolute",
    width: "420px",
    height: "420px",
    background: "rgba(129,140,248,0.25)",
    filter: "blur(160px)",
    bottom: "10%",
    right: "-10%",
  },

  section: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "6rem 2rem",
  },

  sectionAlt: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "6rem 2rem",
    background: "rgba(15,23,42,0.35)",
    borderRadius: "32px",
  },

  sectionTitle: {
    textAlign: "center",
    fontSize: "2.2rem",
    fontWeight: 700,
    marginBottom: "3.5rem",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "2rem",
  },

  card: {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: "20px",
    padding: "2.2rem",
    backdropFilter: "blur(20px)",
  },

  icon: {
    fontSize: "2.4rem",
    marginBottom: "1rem",
  },

  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
  },

  cardText: {
    fontSize: "0.95rem",
    color: theme.textSecondary,
  },

  workflow: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "grid",
    gap: "1.5rem",
  },

  workflowStep: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  },

  stepIndex: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: theme.gradientNeon,
    color: "#020617",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  stepTitle: {
    fontWeight: 600,
  },

  stepText: {
    fontSize: "0.9rem",
    color: theme.textSecondary,
  },

 accessGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginBottom: "3rem",
  },

 accessCard: {
    background: "rgba(15,23,42,0.6)",
    border: `1px solid ${theme.border}`,
    borderRadius: "18px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
    minHeight: "200px",
  },

 accessIcon: {
    fontSize: "2rem",
  },

 accessLabel: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "0.4rem",
  },

  accessDesc: {
    color: theme.textSecondary,
    fontSize: "0.9rem",
    lineHeight: 1.4,
    marginBottom: "0.6rem",
  },

  roleFeatures: {
    marginBottom: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
  },

  accessButton: {
    marginTop: "auto",
    borderRadius: "12px",
    border: "1px solid transparent",
    background: "transparent",
    fontWeight: 600,
    padding: "0.7rem 1rem",
    cursor: "pointer",
  },

  footer: {
    padding: "3rem 2rem",
    color: theme.textSecondary,
    fontSize: "0.9rem",
    borderTop: `1px solid ${theme.border}`,
    background: "rgba(2,6,23,0.9)",
  },


  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    alignItems: "center",
  },

  footerBrand: {
    fontSize: "1.4rem",
    fontWeight: 700,
    marginBottom: "0.4rem",
  },

  footerText: {
    margin: 0,
    color: theme.textSecondary,
    lineHeight: 1.5,
  },

  footerLinks: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  footerLink: {
    background: "transparent",
    border: `1px solid ${theme.border}`,
    borderRadius: "10px",
    padding: "0.6rem 1rem",
    color: theme.textPrimary,
    cursor: "pointer",
    fontWeight: 500,
  },

  footerMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    alignItems: "flex-end",
  },
};

export default HomePage;
