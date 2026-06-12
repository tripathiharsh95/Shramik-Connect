// MyPosts.jsx - Premium 3D Advertisement Listing Page
import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Calendar, Clock, MapPin, BadgeIndianRupee, CreditCard, 
  Megaphone, ShieldCheck, Wrench, Edit3, Trash2, ArrowRight, Star, Landmark,
  RefreshCw, User, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, updateBookingStatus, updateProfile } from '../services/api';
import Avatar from '../components/Avatar';
import { useNavigate } from 'react-router-dom';

// --- Premium 3D Interactive Card Component ---
const ThreeDCard = ({ children, className, style, glowColor = 'rgba(232, 114, 42, 0.15)' }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Rotations mapped from mouse hover offset
  const rotateX = useTransform(y, [-150, 150], [12, -12]);
  const rotateY = useTransform(x, [-150, 150], [-12, 12]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      whileHover={{
        y: -10,
        scale: 1.025,
        boxShadow: `0 25px 50px rgba(0, 0, 0, 0.3), 0 0 30px ${glowColor}`
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      {/* Container holding internal children with independent depth translateZ */}
      <div style={{ transform: 'translateZ(30px)', transformStyle: 'preserve-3d', height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
};

const MyPosts = () => {
  const { user, updateProfileState } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isWorker = user?.role === 'worker';

  useEffect(() => {
    if (!isWorker) {
      fetchMyPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setPosts(res.data.data.bookings);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Could not retrieve active listings. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPost = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this active job post advertisement?')) {
      try {
        await updateBookingStatus(bookingId, 'cancelled');
        fetchMyPosts();
      } catch (err) {
        console.error('Failed to cancel:', err);
      }
    }
  };

  const handleDeleteAd = async () => {
    if (window.confirm('Are you sure you want to delete your active service advertisement?')) {
      try {
        const res = await updateProfile({ isAdPosted: false });
        if (res.data.status === 'success') {
          updateProfileState(res.data.data.user);
        }
      } catch (err) {
        console.error('Failed to delete ad:', err);
      }
    }
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="container page-content">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        
        {/* Header Section */}
        <div className="section-header" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Megaphone size={26} className="text-orange" />
            <h2 className="section-title" style={{ fontSize: '1.7rem', fontWeight: 800 }}>
              {isWorker ? 'My Active Service Advertisement' : 'My Active Requirements'}
            </h2>
          </div>
          {!isWorker && (
            <button className="btn btn-ghost" onClick={fetchMyPosts} style={{ gap: '0.4rem' }}>
              <RefreshCw size={16} /> Refresh
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <p>Loading active running advertisements...</p>
          </div>
        ) : (
          <>
            {/* ========================================================
                1. LABOUR / WORKER ACTIVE RUNNING LISTING (ADVERTISEMENT)
                ======================================================== */}
            {isWorker ? (
              user?.isAdPosted ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
                  <ThreeDCard className="premium-worker-card" glowColor="rgba(232, 114, 42, 0.2)" style={{ maxWidth: '440px', width: '100%', margin: 0 }}>
                  
                  {/* Top Glowing Tag */}
                  <div style={{ transform: 'translateZ(20px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <span className="badge badge-verified" style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Sparkles size={12} fill="#fff" /> Running Advertisement
                    </span>
                    <span className="premium-worker-availability" style={{ margin: 0 }}>
                      <span className={`pulse-dot ${user?.isAvailable ? '' : 'busy'}`}></span>
                      {user?.isAvailable ? 'Available Now' : 'Busy'}
                    </span>
                  </div>

                  {/* Header Details */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', transform: 'translateZ(35px)' }}>
                    <Avatar user={user} size="lg" border={true} showBadge={true} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="premium-worker-name" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{user?.name}</span>
                        {user?.isVerified && (
                          <span className="badge badge-verified" style={{ padding: '0.1rem 0.3rem', fontSize: '0.6rem' }}>
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        <div className="premium-worker-profession-tag" style={{ margin: 0, alignSelf: 'flex-start', background: 'var(--teal-100)', color: 'var(--teal-800)', border: '1px solid var(--teal-600)', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                          {user?.profession?.split(' - ')[0] || 'General Labour'}
                        </div>
                        {user?.workerType && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: user.workerType === 'team'
                              ? 'linear-gradient(135deg, rgba(245, 158, 66, 0.2), rgba(232, 114, 42, 0.05))'
                              : 'linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(36, 138, 157, 0.05))',
                            border: user.workerType === 'team'
                              ? '1px solid rgba(245, 158, 66, 0.35)'
                              : '1px solid rgba(34, 211, 238, 0.35)',
                            color: user.workerType === 'team'
                              ? 'var(--orange-300)'
                              : '#22d3ee',
                            boxShadow: user.workerType === 'team'
                              ? '0 2px 10px rgba(245, 158, 66, 0.1)'
                              : '0 2px 10px rgba(34, 211, 238, 0.1)',
                            backdropFilter: 'blur(4px)'
                          }}>
                            {user.workerType === 'team' ? <Users size={10} /> : <User size={10} />}
                            <span>{user.workerType === 'team' ? `Team (${user.teamRange || '1-5'})` : 'Individual'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ratings / Experience / Charge */}
                  <div className="premium-worker-stats" style={{ transform: 'translateZ(40px)', background: 'var(--bg-muted)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
                    <span className="premium-worker-stat-item" style={{ fontSize: '0.85rem' }}>
                      <Star size={14} fill="var(--warning)" color="var(--warning)" /> {user?.rating || '4.5'} Rating
                    </span>
                    <span className="premium-worker-stat-item" style={{ fontSize: '0.85rem' }}>
                      <Clock size={14} /> {user?.experienceYears || 0} Yrs Experience
                    </span>
                  </div>

                  {/* Skills Grid */}
                  {user?.skills && user.skills.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', transform: 'translateZ(45px)' }}>
                      <div className="premium-worker-section-title" style={{ fontSize: '0.75rem', marginBottom: '0.4rem' }}>Sub-Skills & Specialities</div>
                      <div className="premium-worker-skills-list" style={{ gap: '0.4rem' }}>
                        {user.skills.map(skill => (
                          <span key={skill} className="premium-worker-skill-badge" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio / About */}
                  <div style={{ marginBottom: '1.8rem', transform: 'translateZ(30px)' }}>
                    <div className="premium-worker-section-title" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>Bio Description</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      {user?.about || user?.bio || "Available for high-quality professional labour services."}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="premium-worker-footer" style={{ transform: 'translateZ(50px)', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', marginTop: 'auto', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div className="premium-worker-pricing">
                      <div className="premium-worker-charge-title" style={{ fontSize: user?.workerType === 'team' ? '0.55rem' : '0.7rem' }}>
                        {user?.workerType === 'team' ? 'Standard Charge (per worker)' : 'Standard Charge'}
                      </div>
                      <span className="premium-worker-price">₹{user?.hourlyRate || 0}</span>
                      <span className="premium-worker-price-sub">per {user?.rateType || 'day'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                      <motion.button 
                        onClick={() => navigate('/post')}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, gap: '0.3rem' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit3 size={12} /> Edit Ad
                      </motion.button>
                      <motion.button 
                        onClick={handleDeleteAd}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger)', borderColor: 'rgba(220, 53, 69, 0.3)', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 700, gap: '0.3rem' }}
                        whileHover={{ scale: 1.05, background: 'var(--danger-bg)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 size={12} /> Delete Ad
                      </motion.button>
                    </div>
                  </div>

                </ThreeDCard>
              </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📢</div>
                  <p style={{ color: 'var(--text-muted)' }}>You have no active service advertisements.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/post')} style={{ marginTop: '1rem' }}>
                    Post an Advertisement
                  </button>
                </div>
              )
            ) : (
              /* ========================================================
                  2. CUSTOMER ACTIVE POSTS (RUNNING REQUIREMENTS)
                  ======================================================== */
              <>
                {posts.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📢</div>
                    <p style={{ color: 'var(--text-muted)' }}>You have no running advertisements or active requirements.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/post')} style={{ marginTop: '1rem' }}>
                      Post a Requirement
                    </button>
                  </div>
                ) : (
                  <div className="workers-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {posts.map((post, idx) => {
                      const isPending = post.status === 'pending';
                      const isConfirmed = post.status === 'confirmed';
                      const isCompleted = post.status === 'completed';
                      const isCancelled = post.status === 'cancelled';

                      let glowColor = 'rgba(232, 114, 42, 0.15)';
                      if (isConfirmed) glowColor = 'rgba(0, 180, 216, 0.15)';
                      if (isCompleted) glowColor = 'rgba(40, 167, 69, 0.15)';
                      if (isCancelled) glowColor = 'rgba(220, 53, 69, 0.1)';

                      return (
                        <ThreeDCard 
                          key={post._id} 
                          className="premium-worker-card" 
                          glowColor={glowColor}
                          style={{ margin: 0, display: 'flex', flexDirection: 'column' }}
                        >
                          {/* Card Category Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', transform: 'translateZ(20px)' }}>
                            <div className="premium-worker-profession-tag" style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem' }}>
                              {post.category}
                            </div>
                            <span 
                              className={`badge ${
                                isCompleted ? 'badge-success' : 
                                isCancelled ? 'badge-danger' : 
                                isConfirmed ? 'badge-info' : 'badge-warning'
                              }`}
                              style={{ padding: '0.2rem 0.6rem', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 650 }}
                            >
                              {isPending && <span className="pulse-dot" style={{ background: '#ffc107', width: '6px', height: '6px' }}></span>}
                              {isConfirmed && <span className="pulse-dot" style={{ background: '#00b4d8', width: '6px', height: '6px' }}></span>}
                              {post.status.toUpperCase()}
                            </span>
                          </div>

                          {/* Sub Category Title */}
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.8rem', transform: 'translateZ(30px)' }}>
                            {post.subCategory || 'General Service Assistance'}
                          </h3>

                          {/* Description details */}
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.2rem', flexGrow: 1, transform: 'translateZ(25px)' }}>
                            {post.description || 'No additional work details provided.'}
                          </p>

                          {/* Workforce Type Badge Section */}
                          {post.workerType && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              padding: '0.4rem 0.9rem',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.75px',
                              background: post.workerType === 'team'
                                ? 'linear-gradient(135deg, rgba(245, 158, 66, 0.22), rgba(232, 114, 42, 0.06))'
                                : 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(36, 138, 157, 0.06))',
                              border: post.workerType === 'team'
                                ? '1px solid rgba(245, 158, 66, 0.4)'
                                : '1px solid rgba(34, 211, 238, 0.4)',
                              color: post.workerType === 'team'
                                ? 'var(--orange-300)'
                                : '#22d3ee',
                              boxShadow: post.workerType === 'team'
                                ? '0 6px 20px rgba(245, 158, 66, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
                                : '0 6px 20px rgba(34, 211, 238, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                              backdropFilter: 'blur(8px)',
                              marginBottom: '1.25rem',
                              transform: 'translateZ(30px)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'default'
                            }}>
                              <span style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '18px', 
                                height: '18px', 
                                borderRadius: '50%', 
                                background: post.workerType === 'team' ? 'rgba(245, 158, 66, 0.2)' : 'rgba(34, 211, 238, 0.2)',
                                marginRight: '0.1rem',
                                justifyContent: 'center'
                              }}>
                                {post.workerType === 'team' ? <Users size={11} /> : <User size={11} />}
                              </span>
                              <span>{post.workerType === 'team' ? `Team (${post.teamRange || '1-5'})` : 'Individual'}</span>
                            </div>
                          )}

                          {/* Info Rows */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem', transform: 'translateZ(35px)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <Calendar size={13} className="text-orange" />
                              <span>{formatDateTime(post.scheduledDate)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <MapPin size={13} className="text-orange" />
                              <span>{post.area}, {post.city}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {post.paymentMode === 'online' ? <CreditCard size={13} className="text-teal" /> : post.paymentMode === 'bank' ? <Landmark size={13} className="text-teal" /> : <BadgeIndianRupee size={13} className="text-teal" />}
                              <span style={{ textTransform: 'capitalize' }}>Payment: {post.paymentMode === 'bank' ? 'Bank Transfer' : `${post.paymentMode} Mode`}</span>
                            </div>
                          </div>

                          {/* Footer with Price and Cancel Button */}
                          <div style={{ transform: 'translateZ(45px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Estimated Budget</span>
                              <span style={{ fontSize: '1.2rem', fontWeight: 850, color: 'var(--orange-500)' }}>₹{post.price}</span>
                            </div>
                            
                            {isPending && (
                              <motion.button
                                onClick={() => handleCancelPost(post._id)}
                                className="btn btn-outline btn-sm"
                                style={{ color: 'var(--danger)', borderColor: 'rgba(220, 53, 69, 0.3)', padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.3rem' }}
                                whileHover={{ scale: 1.05, background: 'var(--danger-bg)' }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Trash2 size={12} /> Cancel Ad
                              </motion.button>
                            )}
                          </div>
                        </ThreeDCard>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default MyPosts;
