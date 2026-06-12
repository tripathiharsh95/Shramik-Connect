import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, RefreshCw } from 'lucide-react';
import { askChatbot } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Inline Markdown Parser for premium styling
const parseInlineMarkdown = (text) => {
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const splitParts = text.split(regex);
  
  return splitParts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

const renderMessageText = (text) => {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} style={{ margin: '0.8rem 0 0.4rem 0', fontWeight: '800', fontSize: '0.95rem', color: 'var(--orange-400)' }}>
          {line.replace('### ', '')}
        </h4>
      );
    }
    if (line.startsWith('#### ')) {
      return (
        <h5 key={idx} style={{ margin: '0.6rem 0 0.3rem 0', fontWeight: '800', fontSize: '0.85rem', color: 'var(--teal-400)' }}>
          {line.replace('#### ', '')}
        </h5>
      );
    }
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const cleanText = line.trim().replace(/^[\*\-]\s+/, '');
      return (
        <li key={idx} style={{ marginLeft: '1rem', listStyleType: 'disc', fontSize: '0.82rem', marginBottom: '0.25rem', lineHeight: '1.4' }}>
          {parseInlineMarkdown(cleanText)}
        </li>
      );
    }
    if (/^\d+\.\s+/.test(line.trim())) {
      const cleanText = line.trim().replace(/^\d+\.\s+/, '');
      return (
        <li key={idx} style={{ marginLeft: '1rem', listStyleType: 'decimal', fontSize: '0.82rem', marginBottom: '0.25rem', lineHeight: '1.4' }}>
          {parseInlineMarkdown(cleanText)}
        </li>
      );
    }
    if (!line.trim()) {
      return <div key={idx} style={{ height: '0.35rem' }} />;
    }
    return (
      <p key={idx} style={{ margin: '0.25rem 0', fontSize: '0.82rem', lineHeight: '1.4' }}>
        {parseInlineMarkdown(line)}
      </p>
    );
  });
};

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const SUGGESTED_QUESTIONS = [
    "I need an electrician near me.",
    "How do I book a labour?",
    "What is the service charge?"
  ];

  // Scroll to bottom on message list change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now() + Math.random(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Map frontend messages to backend history structure
      const history = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await askChatbot(text.trim(), history);
      
      const botMessage = {
        id: Date.now() + Math.random(),
        sender: 'bot',
        text: res.data.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMessage = {
        id: Date.now() + Math.random(),
        sender: 'bot',
        text: "😔 Oops! I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Do you want to reset your conversation history?")) {
      setMessages([]);
    }
  };

  return (
    <>
      {/* ── FLOATING CHAT BUTTON (Static / Fixed position with 3D animation) ── */}
      <motion.button
        className="chatbot-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ 
          scale: 1.15, 
          rotate: [0, -10, 10, 0],
          boxShadow: '0 12px 30px rgba(232, 114, 42, 0.6), inset 0 2px 4px rgba(255,255,255,0.5)'
        }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          y: [0, -6, 0]
        }}
        transition={{ 
          y: {
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut'
          },
          scale: { type: 'spring', stiffness: 260, damping: 20, delay: 1 },
          opacity: { delay: 1 }
        }}
        style={{
          position: 'fixed',
          bottom: '108px',
          right: '24px',
          zIndex: 1000,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, var(--orange-400) 0%, var(--orange-500) 50%, var(--teal-600) 100%)',
          color: '#fff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 8px rgba(0,0,0,0.3)',
          outline: 'none',
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <MessageSquare size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── HOVER TOOLTIP (Popup window appearing from right side of the icon) ── */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              position: 'fixed',
              right: '92px',
              bottom: '116px',
              zIndex: 1000,
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(232, 114, 42, 0.35)',
              padding: '8px 16px',
              borderRadius: '12px 12px 0px 12px',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <Sparkles size={13} style={{ color: 'var(--orange-400)' }} />
            <span>AI Assistant</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHAT WINDOW PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-panel"
            initial={{ opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            style={{
              position: 'fixed',
              zIndex: 1001,
              width: '370px',
              height: '520px',
              bottom: '178px',
              right: '24px',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {/* Header */}
            <div
              className="chatbot-header"
              style={{
                background: 'linear-gradient(135deg, rgba(232, 114, 42, 0.95) 0%, rgba(26, 107, 122, 0.95) 100%)',
                padding: '1rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Shramik AI Bot <Sparkles size={11} fill="#fff" />
                  </h4>
                  <span style={{ fontSize: '0.68rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span className="pulse-dot" style={{ width: '6px', height: '6px', background: '#10b981', display: 'inline-block', borderRadius: '50%' }}></span>
                    Online • Powered by Gemini
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {messages.length > 0 && (
                  <button 
                    onClick={handleClearChat}
                    title="Clear Conversation"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex'
                    }}
                  >
                    <RefreshCw size={14} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="chatbot-body"
              style={{
                flex: 1,
                padding: '1.2rem 1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {messages.length === 0 ? (
                <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.8rem', padding: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--bg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--orange-500)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    <Bot size={26} />
                  </div>
                  <h5 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>Welcome to Shramik Connect!</h5>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                    {user ? `Hello ${user.name}! ` : 'Hi there! '}
                    I am your AI assistant. Ask me anything about finding workers, service charges, or how to book a labor.
                  </p>
                  
                  {/* Suggestion Chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '0.6rem' }}>
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        style={{
                          background: 'var(--bg-muted)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '0.5rem 0.8rem',
                          fontSize: '0.76rem',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 650,
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(232, 114, 42, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(232, 114, 42, 0.3)';
                          e.currentTarget.style.color = 'var(--orange-400)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-muted)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <Sparkles size={11} className="text-orange" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m) => {
                    const isBot = m.sender === 'bot';
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          justifyContent: isBot ? 'flex-start' : 'flex-end',
                          alignItems: 'flex-start',
                          gap: '0.5rem'
                        }}
                      >
                        {isBot && (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'var(--orange-500)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            <Bot size={13} />
                          </div>
                        )}
                        <div
                          style={{
                            maxWidth: '82%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: isBot ? '4px 14px 14px 14px' : '14px 14px 4px 14px',
                            background: isBot ? 'var(--bg-muted)' : 'linear-gradient(135deg, var(--orange-600) 0%, var(--orange-500) 100%)',
                            border: isBot ? '1px solid var(--border-color)' : 'none',
                            color: isBot ? 'var(--text-secondary)' : '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                          }}
                        >
                          {isBot ? (
                            <div className="chatbot-markdown">{renderMessageText(m.text)}</div>
                          ) : (
                            <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: '1.4' }}>{m.text}</p>
                          )}
                          <span style={{
                            display: 'block',
                            fontSize: '0.6rem',
                            opacity: 0.6,
                            marginTop: '4px',
                            textAlign: 'right'
                          }}>
                            {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--orange-500)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0
                      }}>
                        <Bot size={13} />
                      </div>
                      <div style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '4px 14px 14px 14px',
                        background: 'var(--bg-muted)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}>
                        <span className="dot-bounce"></span>
                        <span className="dot-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="dot-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              style={{
                padding: '0.8rem 1rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                placeholder="Ask me a question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                style={{
                  flex: 1,
                  background: 'var(--bg-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--orange-500)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              <motion.button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: inputValue.trim() && !isTyping ? 'var(--orange-500)' : 'var(--bg-muted)',
                  color: inputValue.trim() && !isTyping ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputValue.trim() && !isTyping ? 'pointer' : 'default',
                  transition: 'all 0.2s ease'
                }}
              >
                <Send size={14} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;
