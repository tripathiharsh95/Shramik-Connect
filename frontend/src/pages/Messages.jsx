import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getDirectConversations } from '../services/api';
import DirectChatWindow from '../components/DirectChatWindow';
import Avatar from '../components/Avatar';
import { MessageSquare, Search, ChevronLeft } from 'lucide-react';
import { io } from 'socket.io-client';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const pollRef = useRef(null);
  const socketRef = useRef(null);

  // Responsive layout state
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const fetchConversations = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getDirectConversations();
      setConversations(res.data.data.conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Initial REST fetch
    fetchConversations();

    // 2. Establish Socket.io connection for real-time inbox updates
    const token = localStorage.getItem('token');
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      forceNew: true
    });
    socketRef.current = socket;

    socket.on('new_direct_message_notification', (msg) => {
      // Refresh the conversations list when a new message notification arrives
      fetchConversations(false);
    });

    // 3. Setup slow background polling as fallback
    pollRef.current = setInterval(() => {
      fetchConversations(false);
    }, 10000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [fetchConversations]);

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    setMobileShowChat(true);
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
    // Refresh to update latest messages on return
    fetchConversations(false);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.partner?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container page-content">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="messages-page-wrapper"
      >
        {/* Sidebar: Conversations List */}
        <div className={`messages-sidebar ${mobileShowChat ? 'hidden-mobile' : ''}`}>
          <div className="messages-sidebar-header">
            <h2 className="messages-title">Messages</h2>
            <div className="messages-search-wrapper">
              <Search size={16} className="messages-search-icon" />
              <input
                type="text"
                placeholder="Search chats..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="messages-search-input"
              />
            </div>
          </div>

          <div className="messages-list">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <div className="spinner-small" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="messages-empty-list">
                <MessageSquare size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <p>{search ? 'No matches found' : 'No active chats yet'}</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = conv.partner;
                const latest = conv.latestMessage;
                const isSelected = selectedPartner?._id === partner?._id;

                // Format timestamp
                const date = new Date(latest.createdAt);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const getRelativeDateStr = (dateVal) => {
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  
                  if (dateVal.toDateString() === today.toDateString()) {
                    return 'Today';
                  } else if (dateVal.toDateString() === yesterday.toDateString()) {
                    return 'Yesterday';
                  } else {
                    return dateVal.toLocaleDateString([], { month: 'short', day: 'numeric' });
                  }
                };
                const dateStr = getRelativeDateStr(date);

                return (
                  <motion.div
                    key={partner._id}
                    onClick={() => handleSelectPartner(partner)}
                    className={`messages-item ${isSelected ? 'active' : ''}`}
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <Avatar user={partner} size="md" />

                    <div className="messages-item-details">
                      <div className="messages-item-top">
                        <span className="messages-item-name">{partner.name}</span>
                        <div className="messages-item-time-col">
                          <span className="messages-item-time">{timeStr}</span>
                          <span className="messages-item-date">{dateStr}</span>
                        </div>
                      </div>

                      <div className="messages-item-role-badge">
                        <span className={`badge-role ${partner.role}`}>
                          {partner.role === 'worker' ? (partner.profession ? partner.profession.split(' - ')[0] : 'Worker') : 'Customer'}
                        </span>
                      </div>

                      <div className="messages-item-preview">
                        {latest.sender === user?._id || latest.sender?._id === user?._id ? 'You: ' : ''}
                        {latest.text}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Pane */}
        <div className={`messages-chat-pane ${!mobileShowChat ? 'hidden-mobile' : ''}`}>
          {selectedPartner ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Mobile Back Header */}
              <div className="messages-chat-mobile-header">
                <button onClick={handleBackToList} className="btn btn-ghost" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ChevronLeft size={20} /> Back
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Avatar user={selectedPartner} size="sm" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedPartner.name}</span>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <DirectChatWindow
                  partnerId={selectedPartner._id}
                  partnerName={selectedPartner.name}
                  onClose={window.innerWidth > 768 ? null : handleBackToList}
                />
              </div>
            </div>
          ) : (
            <div className="messages-chat-placeholder">
              <div className="messages-placeholder-icon-wrapper animate-float">
                <MessageSquare size={48} style={{ color: 'var(--teal-600)' }} />
              </div>
              <h3>Your Messages</h3>
              <p>Select a contact from the inbox panel on the left to view messages and text in real-time.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Messages;
