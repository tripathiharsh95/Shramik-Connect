import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MessageCircle, User, Users } from 'lucide-react';
import { getMyBookings, updateBookingStatus } from '../services/api';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';

const statusBadgeClass = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  in_progress: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-danger',
};

const Bookings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatBookingId, setChatBookingId] = useState(null);
  const tabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(res.data.data.bookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      fetchBookings();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filtered = activeTab === 'all' ? bookings : bookings.filter(b => b.status === activeTab);

  return (
    <div className="container page-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="section-header">
          <h2 className="section-title">My Bookings</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{filtered.length} bookings</span>
        </div>

        <div className="tabs">
          {tabs.map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading bookings...</p></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Calendar size={48} /></div>
                  <p>No {activeTab} bookings found.</p>
                </div>
              ) : (
                filtered.map((booking, i) => {
                  const isCustomer = booking.customer?._id === user?._id || booking.customer === user?._id;
                  const otherPartyName = isCustomer ? booking.worker?.name : (booking.customerName || booking.customer?.name);
                  const relationshipText = isCustomer ? 'Worker' : 'Customer';

                  return (
                    <motion.div key={booking._id} className="booking-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0, marginRight: '1rem' }}>
                          <div className="booking-title" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{booking.category}</span>
                            {otherPartyName && (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #9ca3af)', fontWeight: 500 }}>
                                • {relationshipText}: <strong style={{ color: 'var(--orange-400, #e8722a)' }}>{otherPartyName}</strong>
                              </span>
                            )}
                          </div>
                          <div className="booking-details" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                            <span>{booking.city}, {booking.area}</span>
                            <span>•</span>
                            <span className={`badge ${statusBadgeClass[booking.status] || 'badge-warning'}`}>{booking.status}</span>
                            <span>•</span>
                            <span>₹{booking.price}</span>
                            <span>•</span>
                            <span>{booking.paymentMode === 'upi' ? '📱 UPI' : booking.paymentMode === 'online' ? '💳 Online' : booking.paymentMode === 'bank' ? '🏦 Bank Transfer' : '💵 Cash'}</span>
                            {booking.workerType && (
                              <>
                                <span>•</span>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: booking.workerType === 'team' ? 'rgba(232, 114, 42, 0.12)' : 'rgba(36, 138, 157, 0.12)',
                                  border: booking.workerType === 'team' ? '1px solid rgba(232, 114, 42, 0.25)' : '1px solid rgba(36, 138, 157, 0.25)',
                                  color: booking.workerType === 'team' ? 'var(--orange-400)' : 'var(--teal-600)',
                                  textTransform: 'capitalize'
                                }}>
                                  {booking.workerType === 'team' ? <Users size={10} /> : <User size={10} />}
                                  <span>{booking.workerType === 'team' ? 'Team' : 'Individual'}</span>
                                </span>
                              </>
                            )}
                          </div>

                          {/* Scheduled date & time */}
                          {booking.scheduledDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.45rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              <Calendar size={13} style={{ color: 'var(--orange-500, #e8722a)' }} />
                              <span style={{ fontWeight: 600 }}>
                                Scheduled: {new Date(booking.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} {booking.scheduledTime ? `@ ${booking.scheduledTime}` : ''}
                              </span>
                            </div>
                          )}

                          {/* Address & Contact Info Box */}
                          {(booking.customerFullAddress || booking.customerPhone || (isCustomer && booking.worker?.phone)) && (
                            <div style={{
                              marginTop: '0.6rem',
                              padding: '0.6rem 0.85rem',
                              background: 'rgba(255,255,255,0.02)',
                              borderRadius: '10px',
                              border: '1px solid rgba(255,255,255,0.06)',
                              fontSize: '0.78rem',
                              color: 'var(--text-muted, #9ca3af)',
                              lineHeight: '1.45',
                              maxWidth: '650px'
                            }}>
                              {!isCustomer && booking.customerPhone && (
                                <div style={{ marginBottom: '0.25rem' }}>
                                  <strong>📞 Customer Phone:</strong> <a href={`tel:${booking.customerPhone}`} style={{ color: 'var(--orange-400, #e8722a)', textDecoration: 'none', fontWeight: 600 }}>{booking.customerPhone}</a>
                                </div>
                              )}
                              {isCustomer && booking.worker?.phone && (
                                <div style={{ marginBottom: '0.25rem' }}>
                                  <strong>📞 Worker Phone:</strong> <a href={`tel:${booking.worker.phone}`} style={{ color: 'var(--teal-600)', textDecoration: 'none', fontWeight: 600 }}>{booking.worker.phone}</a>
                                </div>
                              )}
                              {booking.customerFullAddress && (
                                <div style={{ marginBottom: booking.note ? '0.25rem' : '0' }}>
                                  <strong>📍 Location:</strong> {booking.customerFullAddress}, {booking.customerCity || booking.city}, {booking.customerState || ''} {booking.customerPinCode ? `- ${booking.customerPinCode}` : ''}
                                </div>
                              )}
                              {booking.note && (
                                <div style={{ fontStyle: 'italic', color: 'var(--text-secondary, #9ca3af)' }}>
                                  <strong>💬 Note:</strong> "{booking.note}"
                                </div>
                              )}
                            </div>
                          )}

                          {booking.description && <p style={{ marginTop: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{booking.description}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                          {booking.status === 'pending' && (
                            <>
                              {!isCustomer && (
                                <motion.button className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleStatusChange(booking._id, 'confirmed')}>
                                  Confirm
                                </motion.button>
                              )}
                              <motion.button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleStatusChange(booking._id, 'cancelled')}>
                                Cancel
                              </motion.button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <motion.button className="btn btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleStatusChange(booking._id, 'completed')}>
                              Mark Done
                            </motion.button>
                          )}
                          <button className="btn btn-ghost" style={{ padding: '0.3rem' }} onClick={() => setChatBookingId(chatBookingId === booking._id ? null : booking._id)} title="Chat">
                            <MessageCircle size={18} />
                          </button>
                        </div>
                      </div>
                      {chatBookingId === booking._id && (
                        <ChatWindow bookingId={booking._id} onClose={() => setChatBookingId(null)} />
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default Bookings;
