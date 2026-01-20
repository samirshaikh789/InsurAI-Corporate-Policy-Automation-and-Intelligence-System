import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = ({ employeeData = { name: 'Employee', claims: [], policies: [] } }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your InsurAI assistant. Ask me anything about your claims or policies. 🤖", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

  // Enterprise-grade futuristic styles
  const styles = {
    chatIcon: {
      position: 'fixed',
      bottom: '32px',
      right: '32px',
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #F472B6 100%)',
      color: '#020617',
      borderRadius: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '26px',
      cursor: 'pointer',
      boxShadow: isHovered 
        ? '0 0 40px rgba(56, 189, 248, 0.5), 0 0 80px rgba(129, 140, 248, 0.3)' 
        : '0 8px 32px rgba(56, 189, 248, 0.25)',
      zIndex: 1000,
      border: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isHovered ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
    },
    chatWindow: {
      position: 'fixed',
      bottom: '110px',
      right: '32px',
      width: '420px',
      height: '580px',
      background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(2, 6, 23, 0.99) 100%)',
      borderRadius: '24px',
      boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(56, 189, 248, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1000,
      border: '1px solid rgba(148, 163, 184, 0.15)',
      backdropFilter: 'blur(20px)',
      animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    header: {
      background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #F472B6 100%)',
      color: '#020617',
      padding: '1.5rem 1.75rem',
      fontWeight: '800',
      fontSize: '1.1rem',
      letterSpacing: '-0.01em',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      position: 'relative',
    },
    headerIcon: {
      width: '40px',
      height: '40px',
      background: 'rgba(2, 6, 23, 0.15)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
    },
    headerText: {
      display: 'flex',
      flexDirection: 'column',
    },
    headerTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
    },
    headerSubtitle: {
      fontSize: '0.75rem',
      fontWeight: '500',
      opacity: '0.8',
    },
    headerStatus: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#10B981',
      boxShadow: '0 0 8px #10B981',
      animation: 'pulse 2s infinite',
    },
    body: {
      flex: 1,
      padding: '1.5rem',
      overflowY: 'auto',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    messageWrapper: {
      display: 'flex',
      flexDirection: 'column',
    },
    message: {
      maxWidth: '82%',
      padding: '1rem 1.25rem',
      borderRadius: '18px',
      lineHeight: '1.55',
      whiteSpace: 'pre-wrap',
      fontSize: '0.925rem',
      position: 'relative',
    },
    botMessage: {
      background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(129, 140, 248, 0.08) 100%)',
      color: '#F8FAFC',
      alignSelf: 'flex-start',
      border: '1px solid rgba(56, 189, 248, 0.2)',
      borderBottomLeftRadius: '6px',
    },
    userMessage: {
      background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)',
      color: '#020617',
      alignSelf: 'flex-end',
      borderBottomRightRadius: '6px',
      fontWeight: '500',
    },
    messageTime: {
      fontSize: '0.7rem',
      color: 'rgba(148, 163, 184, 0.7)',
      marginTop: '0.35rem',
      paddingLeft: '0.25rem',
    },
    footer: {
      padding: '1.25rem 1.5rem',
      borderTop: '1px solid rgba(148, 163, 184, 0.1)',
      background: 'rgba(15, 23, 42, 0.6)',
    },
    form: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      padding: '1rem 1.25rem',
      border: '1px solid rgba(148, 163, 184, 0.15)',
      borderRadius: '16px',
      outline: 'none',
      fontSize: '0.925rem',
      background: 'rgba(2, 6, 23, 0.6)',
      color: '#F8FAFC',
      transition: 'all 0.3s ease',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    inputFocused: {
      background: 'rgba(30, 41, 59, 0.8)',
      borderColor: '#38BDF8',
      boxShadow: '0 0 0 3px rgba(56, 189, 248, 0.15)',
    },
    button: {
      padding: '1rem 1.5rem',
      border: 'none',
      background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)',
      color: '#020617',
      borderRadius: '16px',
      cursor: 'pointer',
      fontSize: '0.925rem',
      fontWeight: '700',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      minWidth: '100px',
      justifyContent: 'center',
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(56, 189, 248, 0.4)',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.25rem',
      background: 'rgba(129, 140, 248, 0.1)',
      border: '1px solid rgba(129, 140, 248, 0.2)',
      borderRadius: '18px',
      borderBottomLeftRadius: '6px',
      color: '#818CF8',
      fontSize: '0.875rem',
      alignSelf: 'flex-start',
      maxWidth: '82%',
    },
    loadingDots: {
      display: 'flex',
      gap: '4px',
    },
    loadingDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#818CF8',
      animation: 'bounce 1.4s infinite ease-in-out',
    },
    quickActions: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '0.75rem',
      flexWrap: 'wrap',
    },
    quickAction: {
      padding: '0.5rem 0.875rem',
      background: 'rgba(56, 189, 248, 0.1)',
      border: '1px solid rgba(56, 189, 248, 0.2)',
      borderRadius: '20px',
      color: '#38BDF8',
      fontSize: '0.75rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
  };

  // Inject keyframes styles
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const [inputFocused, setInputFocused] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  const quickActions = [
    "Check claim status",
    "View policies",
    "Contact support"
  ];

  const handleQuickAction = (action) => {
    setInputValue(action);
  };

  return (
    <>
      <div 
        style={styles.chatIcon} 
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isOpen ? '✕' : '💬'}
      </div>

      {isOpen && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <div style={styles.headerIcon}>🤖</div>
            <div style={styles.headerText}>
              <span style={styles.headerTitle}>InsurAI Assistant</span>
              <span style={styles.headerSubtitle}>Powered by AI</span>
            </div>
            <div style={styles.headerStatus}>
              <div style={styles.statusDot}></div>
              Online
            </div>
          </div>
          
          <div style={styles.body} ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div key={index} style={styles.messageWrapper}>
                <div style={{ 
                  ...styles.message, 
                  ...(msg.sender === 'bot' ? styles.botMessage : styles.userMessage) 
                }}>
                  {msg.text}
                </div>
                <div style={{
                  ...styles.messageTime,
                  alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={styles.loading}>
                <div style={styles.loadingDots}>
                  <div style={{ ...styles.loadingDot, animationDelay: '0s' }}></div>
                  <div style={{ ...styles.loadingDot, animationDelay: '0.2s' }}></div>
                  <div style={{ ...styles.loadingDot, animationDelay: '0.4s' }}></div>
                </div>
                <span>InsurAI is thinking...</span>
              </div>
            )}
          </div>
          
          <div style={styles.footer}>
            {messages.length === 1 && (
              <div style={styles.quickActions}>
                {quickActions.map((action, idx) => (
                  <div 
                    key={idx}
                    style={styles.quickAction}
                    onClick={() => handleQuickAction(action)}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(56, 189, 248, 0.2)';
                      e.target.style.borderColor = '#38BDF8';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(56, 189, 248, 0.1)';
                      e.target.style.borderColor = 'rgba(56, 189, 248, 0.2)';
                    }}
                  >
                    {action}
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleSendMessage} style={styles.form}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  ...styles.input,
                  ...(inputFocused ? styles.inputFocused : {}),
                }}
                placeholder="Ask about claims, policies..."
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  ...(buttonHovered && !loading ? styles.buttonHover : {}),
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                disabled={loading}
                onMouseEnter={() => setButtonHovered(true)}
                onMouseLeave={() => setButtonHovered(false)}
              >
                {loading ? (
                  <>
                    <span>...</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;