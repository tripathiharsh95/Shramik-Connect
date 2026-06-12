import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDirectMessages, sendDirectMessage } from '../services/api';
import { Send, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';

const DirectChatWindow = ({ partnerId, partnerName, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const pollRef = useRef(null);
  const socketRef = useRef(null);

  // Load messages from database and merge with optimistic ones
  const loadMessages = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await getDirectMessages(partnerId);
      const fetched = res.data.data.messages;

      setMessages(prev => {
        // Keep any local optimistic messages that haven't been saved yet
        const optimistic = prev.filter(m => m._optimistic);
        const merged = [...fetched];

        optimistic.forEach(opt => {
          // Check if this message is already present in the fetched list (matching text, sender and close timestamp)
          const exists = fetched.some(f =>
            (f.sender?._id === opt.sender?._id || f.sender === opt.sender?._id) &&
            f.text === opt.text &&
            Math.abs(new Date(f.createdAt) - new Date(opt.createdAt)) < 15000
          );
          if (!exists) {
            merged.push(opt);
          }
        });

        return merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    } catch (err) {
      console.error('Direct chat load error:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    // 1. Initial REST load
    loadMessages(true);

    // 2. Establish Socket.io connection for real-time delivery
    const token = localStorage.getItem('token');
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      forceNew: true
    });
    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit('join_direct_chat', { partnerId });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on('connect', joinRoom);
    }

    // Listen for incoming messages in real-time
    socket.on('receive_direct_message', (msg) => {
      // Ignore if it's not for the current active conversation
      const isFromOrToPartner = 
        (msg.sender?._id === partnerId && msg.recipient?._id === user?._id) ||
        (msg.sender?._id === user?._id && msg.recipient?._id === partnerId);
      
      if (!isFromOrToPartner) return;

      setMessages(prev => {
        // Avoid duplicates if already present
        if (prev.some(m => m._id === msg._id)) return prev;

        // Filter out the optimistic message matching this new message
        const filtered = prev.filter(m =>
          !(m._optimistic &&
            (m.sender?._id === msg.sender?._id || m.sender === msg.sender?._id) &&
            m.text === msg.text)
        );

        return [...filtered, msg].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    });

    // 3. Setup slow background polling as a robust fallback
    pollRef.current = setInterval(() => {
      loadMessages(false);
    }, 8000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (socketRef.current) {
        socketRef.current.emit('leave_direct_chat', { partnerId });
        socketRef.current.disconnect();
      }
    };
  }, [partnerId, loadMessages, user?._id]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Send message via REST API (saves to DB, emits socket on backend)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    // Optimistically add message to UI immediately
    const optimisticMsg = {
      _id: 'temp_' + Date.now(),
      sender: { _id: user?._id, name: user?.name, role: user?.role },
      recipient: { _id: partnerId, name: partnerName },
      text,
      createdAt: new Date().toISOString(),
      _optimistic: true
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await sendDirectMessage(partnerId, text);
      const savedMsg = res.data.data.message;

      // Replace optimistic message with the real one from DB
      setMessages(prev =>
        prev.map(m => m._id === optimisticMsg._id ? savedMsg : m)
      );
    } catch (err) {
      console.error('Send message error:', err);
      // Remove the optimistic message on failure
      setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
      // Restore input so user can retry
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="direct-chat-container"
    >
      <div className="direct-chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="pulse-dot" style={{ width: '8px', height: '8px' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Chat with {partnerName}</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="direct-chat-close-btn">
            <X size={16} />
          </button>
        )}
      </div>

      <div ref={chatMessagesRef} className="direct-chat-messages">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="spinner-small" />
          </div>
        ) : (
          messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', paddingTop: '3rem' }}>
              No messages yet. Send a message to start the conversation!
            </div>
          ) : (
            (() => {
              let lastDateStr = null;
              return messages.map((msg, i) => {
                const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                const isOptimistic = msg._optimistic;
                
                let showDateSep = false;
                const msgDate = msg.createdAt ? new Date(msg.createdAt) : new Date();
                const currentDateStr = msgDate.toDateString();
                if (currentDateStr !== lastDateStr) {
                  showDateSep = true;
                  lastDateStr = currentDateStr;
                }

                const getRelativeSepStr = (dateVal) => {
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  
                  if (dateVal.toDateString() === today.toDateString()) {
                    return 'Today';
                  } else if (dateVal.toDateString() === yesterday.toDateString()) {
                    return 'Yesterday';
                  } else {
                    return dateVal.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
                  }
                };

                return (
                  <React.Fragment key={msg._id || i}>
                    {showDateSep && (
                      <div className="direct-chat-date-separator">
                        <span>{getRelativeSepStr(msgDate)}</span>
                      </div>
                    )}
                    <div className={`direct-chat-bubble-row ${isMe ? 'me' : 'them'}`}>
                      <div className={`direct-chat-bubble ${isMe ? 'me' : 'them'}`}>
                        <div className="direct-chat-text">{msg.text}</div>
                        <div className="direct-chat-time" style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                          <span>{time}</span>
                          {isMe && (
                            <Check
                              size={13}
                              style={{
                                opacity: isOptimistic ? 0.4 : 0.85,
                                strokeWidth: 2.5
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              });
            })()
          )
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="direct-chat-input-form">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="direct-chat-input"
          disabled={sending}
        />
        <button type="submit" className="direct-chat-send-btn" disabled={sending}>
          <Send size={16} />
        </button>
      </form>
    </motion.div>
  );
};

export default DirectChatWindow;
