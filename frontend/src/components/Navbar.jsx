import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Sun, Moon, LogIn, UserPlus, LogOut, User, Bell, Trash2, CheckCheck, MessageSquare, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { 
  updateProfile, 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteNotification, 
  deleteAllNotifications 
} from '../services/api';

const Navbar = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const { user, isAuthenticated, logout, updateProfileState } = useAuth();
  
  const [locating, setLocating] = useState(false);
  const [guestLoc, setGuestLoc] = useState(() => {
    const saved = localStorage.getItem('guestLocation');
    return saved ? JSON.parse(saved) : null;
  });

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const notifRef = useRef(null);
  const socketRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set up socket listener & fetch initial notifications
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const token = localStorage.getItem('token');
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        if (res.data.status === 'success') {
          setNotifications(res.data.data.notifications);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();

    // Socket.io Real-time Event Listeners
    socket.on('new_notification', (newNotif) => {
      setNotifications(prev => {
        // Consolidate unread messages from same sender
        if (newNotif.type === 'message' && newNotif.sender) {
          const filtered = prev.filter(n => !(n.type === 'message' && n.sender && n.sender._id === newNotif.sender._id && !n.isRead));
          return [newNotif, ...filtered];
        }
        return [newNotif, ...prev];
      });
    });

    socket.on('notifications_updated', () => {
      fetchNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationRead(notif._id);
        setNotifications(prev => 
          prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
        );
      } catch (err) {
        console.error('Error marking notification read:', err);
      }
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const handleDeleteNotif = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };

  const getDisplayLocation = () => {
    if (user) {
      const area = user.area || '';
      const city = user.city || '';
      const state = user.state || '';
      if (city || state) {
        return area ? `${area}, ${city}, ${state}` : `${city}, ${state}`;
      }
      if (user.location) {
        const locArea = user.location.block || '';
        const locCity = user.location.city || '';
        const locState = user.location.district || '';
        if (locCity || locState) {
          return locArea ? `${locArea}, ${locCity}, ${locState}` : `${locCity}, ${locState}`;
        }
      }
    } else if (guestLoc) {
      const { area, city, state } = guestLoc;
      return area ? `${area}, ${city}, ${state}` : `${city}, ${state}`;
    }
    return 'Select Location'; // Fallback default
  };

  const handleLocationClick = async () => {
    if (locating) return;
    setLocating(true);

    try {
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser.'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      const { latitude, longitude } = position.coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      const address = data.address || {};
      
      const area = address.suburb || address.neighbourhood || address.village || address.town || address.hamlet || address.road || '';
      const city = address.city || address.city_district || address.state_district || address.county || '';
      const state = address.state || '';
      
      if (isAuthenticated && user) {
        // Logged-in user: save to DB profile
        const res = await updateProfile({ area, city, state });
        if (res.data.status === 'success') {
          updateProfileState(res.data.data.user);
        }
      } else {
        // Guest user: save to local storage & state
        const newLoc = { area, city, state, latitude, longitude };
        setGuestLoc(newLoc);
        localStorage.setItem('guestLocation', JSON.stringify(newLoc));
      }
    } catch (err) {
      console.error('Error getting location:', err);
      let errMsg = 'Failed to detect location.';
      if (err.code === 1) {
        errMsg = 'Location access denied. Please grant GPS/location permission to detect your current location.';
      } else if (err.code === 2) {
        errMsg = 'Location unavailable. Please make sure your device GPS is on and active.';
      } else if (err.code === 3) {
        errMsg = 'Location request timed out. Please try again.';
      } else if (err.message) {
        errMsg = err.message;
      }
      alert(errMsg);
    } finally {
      setLocating(false);
    }
  };

  return (
    <header className="navbar animate-fade-down">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-label">Shramik Connect</span>
          <span className="navbar-brand-title">On-Demand Labour Booking</span>
        </Link>
        <div className="navbar-actions">
          <div className="location-pill" onClick={handleLocationClick} title="Click to auto-detect location">
            {locating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={{ display: 'inline-flex' }}
                >
                  <MapPin size={14} />
                </motion.div>
                <span>Locating...</span>
              </>
            ) : (
              <>
                <MapPin size={14} />
                <span>{getDisplayLocation()}</span>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/profile" className="nav-auth-btn login-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.8rem' }}>
                  <Avatar user={user} size="sm" showBadge={false} border={false} />
                  <span>{user?.name?.split(' ')[0]}</span>
                </Link>
              </motion.div>

              {/* Notification Bell & Dropdown */}
              <div className="notification-bell-container" ref={notifRef}>
                <motion.button 
                  whileHover={{ scale: 1.08 }} 
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsOpen(!isOpen)}
                  className={`btn-notification ${unreadCount > 0 ? 'has-unread' : ''}`}
                  title="Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </motion.button>

                {isOpen && (
                  <div className="notifications-dropdown glass-card animate-fade-in">
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      <div className="notifications-header-actions">
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="btn-notif-action" title="Mark all as read">
                            <CheckCheck size={12} />
                            <span>Mark read</span>
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button onClick={handleClearAll} className="btn-notif-action danger" title="Clear all">
                            <Trash2 size={12} />
                            <span>Clear all</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="notifications-list">
                      {notifications.length === 0 ? (
                        <div className="notifications-empty">
                          <Bell size={24} className="empty-bell-icon" />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif._id} className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}>
                            <Link 
                              to={notif.link || '#'} 
                              onClick={() => handleNotificationClick(notif)} 
                              className="notification-item-content"
                            >
                              <div className="notification-icon-wrapper">
                                {notif.type === 'message' ? (
                                  <MessageSquare size={14} className="icon-notif-message" />
                                ) : (
                                  <Calendar size={14} className="icon-notif-booking" />
                                )}
                              </div>
                              <div className="notification-details">
                                <h4 className="notification-title">{notif.title}</h4>
                                <p className="notification-msg">{notif.message}</p>
                                <span className="notification-time">{formatTimeAgo(notif.createdAt)}</span>
                              </div>
                            </Link>
                            <button onClick={(e) => handleDeleteNotif(notif._id, e)} className="btn-delete-notif" title="Delete">
                              &times;
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button onClick={logout} className="nav-auth-btn signup-btn" style={{ border: 'none' }}>
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="nav-auth-btn login-btn">
                  <LogIn size={15} />
                  <span>Log In</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="nav-auth-btn signup-btn">
                  <UserPlus size={15} />
                  <span>Sign Up</span>
                </Link>
              </motion.div>
            </>
          )}

          <button className="btn-theme" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {(!isAuthenticated || user?.role === 'admin') && (
            <Link to="/admin" className="btn-admin" style={isAdmin ? { background: 'var(--teal-800)' } : {}}>
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
