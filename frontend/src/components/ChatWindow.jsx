import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getChatMessages } from '../services/api';
import { Send, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatWindow = ({ bookingId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Establish secure socket connection using token
    const token = localStorage.getItem('token');
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      auth: { token },
      forceNew: true,
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    // Join room
    const joinRoom = () => {
      newSocket.emit('join_booking', bookingId);
    };

    if (newSocket.connected) {
      joinRoom();
    } else {
      newSocket.on('connect', joinRoom);
    }

    // Load history
    const loadMessages = async () => {
      try {
        const res = await getChatMessages(bookingId);
        setMessages(res.data.data.messages);
      } catch (err) {
        console.error('Chat load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();

    // Listen for new messages
    const handleMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };
    newSocket.on('receive_message', handleMessage);

    return () => {
      newSocket.off('receive_message', handleMessage);
      newSocket.disconnect();
    };
  }, [bookingId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('send_message', {
      bookingId,
      senderId: user._id,
      text: input.trim()
    });
    setInput('');
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      style={{ marginTop: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>💬 Chat</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
      </div>

      <div style={{ height: '200px', overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {loading ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</div> : (
          messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', paddingTop: '2rem' }}>No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
              return (
                <div key={msg._id || i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: isMe ? 'var(--teal-800)' : 'var(--bg-card)',
                    color: isMe ? '#fff' : 'var(--text-primary)',
                    fontSize: '0.85rem',
                    border: isMe ? 'none' : '1px solid var(--border-color)',
                  }}>
                    {!isMe && <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--orange-500)', marginBottom: '0.15rem' }}>{msg.sender?.name || 'User'}</div>}
                    {msg.text}
                  </div>
                </div>
              );
            })
          )
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid var(--border-color)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '0.7rem 1rem', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem' }}
        />
        <button type="submit" style={{ padding: '0.7rem 1rem', border: 'none', background: 'var(--teal-800)', color: '#fff', cursor: 'pointer' }}>
          <Send size={16} />
        </button>
      </form>
    </motion.div>
  );
};

export default ChatWindow;
