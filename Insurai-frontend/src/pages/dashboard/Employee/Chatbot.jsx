import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

/* =========================
   THEME (from Homepage)
========================= */
const theme = {
  bg: "#020617",
  surface: "rgba(15,23,42,0.65)",
  border: "rgba(148,163,184,0.15)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  neonBlue: "#38BDF8",
  neonPurple: "#818CF8",
  gradientNeon: "linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #F472B6 100%)",
};

const Chatbot = ({ employeeData = { name: 'Employee', claims: [], policies: [] } }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your InsurAI assistant. Ask me anything about your claims or policies. 🤖", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Local small talk & greetings
  const getLocalResponse = (input) => {
    if (!input) return null;
    const text = input.toLowerCase().trim();

    if (["hi", "hello", "hey"].includes(text)) 
      return `Hello 👋 ${employeeData.name}! How can I assist you today — claims, policies, or support?`;

    if (text.includes("thank")) 
      return "You're welcome! 😊";

    if (text.includes("bye")) 
      return "Goodbye! Have a great day 👋";

    if (text.includes("how are you")) 
      return "I'm doing great, thank you! How about you?";

    return null; // forward other queries to backend AI
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    const localReply = getLocalResponse(inputValue);
    if (localReply) {
      setMessages(prev => [...prev, { text: localReply, sender: 'bot' }]);
      setLoading(false);
      return;
    }

    // Get JWT token
    const token = localStorage.getItem('token');
    if (!token) {
      setMessages(prev => [...prev, { text: "⚠️ Please log in to use InsurAI.", sender: 'bot' }]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/employee/chatbot',
        { message: userMessage.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const reply = response?.data?.response || "🤖 Sorry, I didn't catch that.";
      const formattedReply = reply.split("\n").map(line => line.trim()).join("\n");

      setMessages(prev => [...prev, { text: formattedReply, sender: 'bot' }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      let msg = "⚠️ Unable to reach InsurAI. Please try again later.";
      if (error.response?.status === 401) msg = "⚠️ Authentication failed. Please log in.";
      else if (error.response?.status === 403) msg = "⚠️ Access forbidden. Please check your permissions.";
      setMessages(prev => [...prev, { text: msg, sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage(e);
  };

  return (
    <>
      {/* Chat Icon */}
      <div 
        style={styles.chatIcon} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={styles.chatWindow}>
          
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.headerIcon}>🤖</span>
            <span>InsurAI Assistant</span>
          </div>

          {/* Messages Body */}
          <div style={styles.body} ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ 
                  ...styles.message, 
                  ...(msg.sender === 'bot' ? styles.botMessage : styles.userMessage) 
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={styles.loading}>
                💭 InsurAI is thinking...
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div style={styles.footer}>
            <form onSubmit={handleSendMessage} style={styles.form}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                style={styles.input}
                placeholder="Ask about claims, policies..."
              />
              <button 
                type="submit" 
                style={styles.button}
                disabled={loading}
              >
                {loading ? '...' : '→'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

/* =========================
   STYLES
========================= */
const styles = {
  chatIcon: {
    position: 'fixed',
    bottom: '25px',
    right: '25px',
    width: '60px',
    height: '60px',
    background: theme.gradientNeon,
    color: theme.bg,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(56,189,248,0.4)',
    zIndex: 1000,
    border: `1px solid ${theme.border}`,
    fontWeight: 'bold',
  },

  chatWindow: {
    position: 'fixed',
    bottom: '100px',
    right: '25px',
    width: '380px',
    height: '520px',
    background: theme.surface,
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000,
    border: `1px solid ${theme.border}`,
  },

  header: {
    background: theme.gradientNeon,
    color: theme.bg,
    padding: '1.2rem',
    fontWeight: 700,
    textAlign: 'center',
    fontSize: '1.05rem',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },

  headerIcon: {
    fontSize: '1.3rem',
  },

  body: {
    flex: 1,
    padding: '1.2rem',
    overflowY: 'auto',
    background: theme.bg,
  },

  message: {
    maxWidth: '80%',
    padding: '0.9rem 1.1rem',
    borderRadius: '16px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
    fontSize: '0.95rem',
  },

  botMessage: {
    background: theme.surface,
    color: theme.textPrimary,
    border: `1px solid ${theme.border}`,
  },

  userMessage: {
    background: theme.gradientNeon,
    color: theme.bg,
    fontWeight: 500,
  },

  footer: {
    padding: '1rem',
    borderTop: `1px solid ${theme.border}`,
    background: theme.surface,
  },

  form: {
    display: 'flex',
    gap: '0.7rem',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    padding: '0.9rem 1rem',
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    outline: 'none',
    fontSize: '0.95rem',
    background: theme.bg,
    color: theme.textPrimary,
    fontFamily: 'inherit',
  },

  button: {
    padding: '0.9rem 1.3rem',
    border: 'none',
    background: theme.gradientNeon,
    color: theme.bg,
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '1.2rem',
    fontWeight: 700,
    transition: 'transform 0.2s',
  },

  loading: {
    fontStyle: 'italic',
    color: theme.neonBlue,
    marginBottom: '1rem',
    padding: '0.9rem',
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    textAlign: 'center',
    fontSize: '0.9rem',
  }
};

export default Chatbot;