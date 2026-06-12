import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, Briefcase, ShieldCheck, MapPin, Clock, BookOpen, User as UserIcon, Users, ShoppingCart, CalendarDays, Check, AlertCircle, MessageCircle, Wallet, Smartphone, Landmark, Copy, Share2, X as XIcon } from 'lucide-react';
import { getWorker } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import BookingModal from '../components/BookingModal';
import DirectChatWindow from '../components/DirectChatWindow';

const WorkerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showChat, setShowChat] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const chatSectionRef = useRef(null);


  const handleToggleChat = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowChat(prev => !prev);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopySuccess(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this worker on Shramik Connect: ${worker?.name}`);
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      instagram: `https://www.instagram.com/`,
      x: `https://x.com/intent/tweet?text=${text}&url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
    setShowShareMenu(false);
  };

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        setLoading(true);
        const res = await getWorker(id);
        if (res.data.status === 'success') {
          setWorker(res.data.data.user || res.data.data.worker);
        } else {
          setError('Failed to fetch worker details.');
        }
      } catch (err) {
        console.error('Error fetching worker:', err);
        setError(err.response?.data?.message || 'Worker not found or server error.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const cartKey = user ? `cart_${user._id}` : 'cart_guest';
    const existingCartRaw = localStorage.getItem(cartKey);
    let cart = [];
    
    if (existingCartRaw) {
      try {
        cart = JSON.parse(existingCartRaw);
      } catch (e) {
        cart = [];
      }
    }

    // Check if worker already in cart
    const isAlreadyInCart = cart.some(item => item.worker._id === worker._id);
    if (isAlreadyInCart) {
      showToast('Worker is already in your cart!', 'warning');
      return;
    }

    // Add to cart with date & time
    const cartItem = {
      worker,
      addedAt: new Date().toISOString()
    };
    cart.push(cartItem);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    showToast('Added to cart successfully!');
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="container page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
          <p>Loading worker advertisement...</p>
        </div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="container page-content" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--danger)' }}>⚠️</div>
        <h3 style={{ marginBottom: '1rem' }}>{error || 'Worker details not found'}</h3>
        <button className="btn btn-secondary" onClick={() => navigate('/find')}>
          <ChevronLeft size={16} /> Back to Finder
        </button>
      </div>
    );
  }

  // Parse profession details
  const professionStr = worker.profession || 'General Labour';
  const parts = professionStr.split(' - ');
  const jobCategory = parts[0].trim();
  const workInfo = parts.slice(1).join(' - ').trim();

  const paymentMethods = worker.acceptedPaymentMethods && worker.acceptedPaymentMethods.length > 0
    ? worker.acceptedPaymentMethods
    : ['cash'];

  return (
    <div className="container page-content">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            style={{
              position: 'fixed',
              top: '85px',
              right: '24px',
              zIndex: 1100,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              background: toast.type === 'success' ? 'var(--success-bg)' : toast.type === 'warning' ? 'var(--warning-bg)' : 'var(--danger-bg)',
              color: toast.type === 'success' ? 'var(--success)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--danger)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(46, 204, 113, 0.2)' : toast.type === 'warning' ? 'rgba(243, 156, 18, 0.2)' : 'rgba(231, 76, 60, 0.2)'}`,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(10px)',
              fontWeight: '600'
            }}
          >
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back navigation */}
        <button 
          className="btn btn-ghost" 
          onClick={() => navigate(-1)} 
          style={{ marginBottom: '0.75rem', paddingLeft: 0, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Full-screen Layout Card */}
        <div className="worker-detail-wrapper card" style={{ padding: 0, overflow: 'visible' }}>
          <div className="worker-detail-hero" style={{
            background: 'linear-gradient(135deg, var(--teal-900), var(--teal-700))',
            padding: '1.5rem 2rem',
            position: 'relative',
            borderBottom: '1px solid var(--border-color)',
            borderTopLeftRadius: 'var(--radius-lg)',
            borderTopRightRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            {/* Ambient Background Glow */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-20%',
              width: '80%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(232, 114, 42, 0.12) 0%, transparent 60%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', position: 'relative', zIndex: 2 }}>
              <Avatar user={worker} size="xl" border={true} showBadge={false} />
              
              <div style={{ flex: '1', minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-1px', margin: 0 }}>
                    {worker.name}
                  </h1>
                  {worker.isVerified && (
                    <span className="badge badge-verified" style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', background: 'rgba(46, 204, 113, 0.2)', color: 'var(--success)' }}>
                      <ShieldCheck size={12} /> Verified Professional
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.35rem', color: '#fff' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    {jobCategory}
                  </span>
                  {workInfo && (
                    <span style={{ fontSize: '0.88rem', opacity: 0.85 }}>
                      • {workInfo}
                    </span>
                  )}
                </div>

                {/* Availability and Rating metrics */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fff', fontSize: '0.88rem' }}>
                    <span className={`pulse-dot ${worker.isAvailable ? '' : 'busy'}`} style={{ width: '8px', height: '8px' }} />
                    <span style={{ fontWeight: 600 }}>{worker.isAvailable ? 'Available Now' : 'Currently Engaged'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fff', fontSize: '0.88rem' }}>
                    <Star size={14} fill="var(--warning)" color="var(--warning)" />
                    <span style={{ fontWeight: 700 }}>{worker.rating}</span>
                    <span style={{ opacity: 0.75 }}>Rating</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fff', fontSize: '0.88rem' }}>
                    <Briefcase size={14} />
                    <span style={{ fontWeight: 700 }}>{worker.jobsCompleted}</span>
                    <span style={{ opacity: 0.75 }}>Jobs Completed</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}>
                    {worker.workerType === 'team' ? (
                      <>
                        <Users size={14} color="var(--orange-400)" />
                        <span style={{
                          fontWeight: 700,
                          background: 'rgba(232, 114, 42, 0.2)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          color: 'var(--orange-300)',
                          fontSize: '0.78rem'
                        }}>
                          Team ({worker.teamRange || '1-5'})
                        </span>
                      </>
                    ) : (
                      <>
                        <UserIcon size={14} color="rgba(255,255,255,0.75)" />
                        <span style={{
                          fontWeight: 700,
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          color: '#fff',
                          fontSize: '0.78rem'
                        }}>
                          Individual
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Tag in Hero */}
              <div className="worker-detail-rate-box" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '0.85rem 1.75rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                color: '#fff',
                minWidth: '150px'
              }}>
                <div style={{ fontSize: worker.workerType === 'team' ? '0.52rem' : '0.65rem', fontWeight: 750, textTransform: 'uppercase', opacity: 0.75, letterSpacing: '1px', marginBottom: '0.15rem' }}>
                  {worker.workerType === 'team' ? 'Service Charge (per worker)' : 'Service Charge'}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>₹{worker.hourlyRate || 0}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.75 }}>per {worker.rateType || 'day'}</div>
              </div>
            </div>
          </div>

          {/* Main Body Details Grid */}
          <div className="card-body" style={{ padding: '1.5rem 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Left Column: Essential Details & Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                    Professional Background
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-700)', flexShrink: 0 }}>
                        <Clock size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>EXPERIENCE</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{worker.experienceYears || 0} Years Active</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-700)', flexShrink: 0 }}>
                        <BookOpen size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>QUALIFICATION</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{worker.qualification || 'Experienced Professional'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-700)', flexShrink: 0 }}>
                        <UserIcon size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>GENDER</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'capitalize' }}>{worker.gender || 'Not Specified'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-700)', flexShrink: 0 }}>
                        <MapPin size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>SERVICE REGION</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                          {worker.area ? `${worker.area}, ` : ''}{worker.city}{worker.state ? `, ${worker.state}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Skills Tag Cloud */}
                {worker.skills && worker.skills.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                      Specialized Expertise
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {worker.skills.map(skill => (
                        <span 
                          key={skill} 
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Bio / Statement */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                    About {worker.name.split(' ')[0]}
                  </h3>
                  <div style={{
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-primary)',
                    padding: '0.9rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--orange-500)',
                    whiteSpace: 'pre-line'
                  }}>
                    {worker.about || worker.bio || `${worker.name} is a highly skilled ${jobCategory.toLowerCase()} professional servicing the ${worker.city} area. Dedicated to providing punctual, top-notch quality services.`}
                  </div>
                </div>

                {/* Security and Guarantee Badge */}
                <div style={{
                  border: '1px dashed var(--border-color)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ fontSize: '1.5rem' }}>🛡️</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Shramik Secure Guarantee</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All bookings are verified. In-app payment supports safe transactions.</div>
                  </div>
                </div>

                {/* Accepting Payments Via */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                    Accepting Payments Via
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.25rem' }}>
                    {paymentMethods.includes('cash') && (
                      <motion.div
                        whileHover={{ scale: 1.03, y: -1 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <Wallet size={13} style={{ color: 'var(--teal-500)' }} />
                        <span>Cash</span>
                      </motion.div>
                    )}
                    {paymentMethods.includes('upi') && (
                      <motion.div
                        whileHover={{ scale: 1.03, y: -1 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <Smartphone size={13} style={{ color: 'var(--teal-500)' }} />
                        <span>UPI</span>
                      </motion.div>
                    )}
                    {paymentMethods.includes('bank') && (
                      <motion.div
                        whileHover={{ scale: 1.03, y: -1 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        <Landmark size={13} style={{ color: 'var(--teal-500)' }} />
                        <span>Bank</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer inside details view */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
            }}>
              {/* All action buttons in one row */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                <motion.button
                  onClick={handleAddToCart}
                  className="btn btn-outline btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '700',
                    borderWidth: '2px',
                    fontSize: '0.85rem'
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ShoppingCart size={15} /> Add to Cart
                </motion.button>

                <motion.button
                  onClick={handleBookNow}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '700',
                    background: 'var(--orange-500)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <CalendarDays size={15} /> Book Now
                </motion.button>

                <motion.button
                  onClick={handleToggleChat}
                  className="btn btn-outline btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '700',
                    borderWidth: '2px',
                    borderColor: 'var(--teal-500)',
                    color: 'var(--teal-500)',
                    fontSize: '0.85rem'
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <MessageCircle size={15} /> Chat Now
                </motion.button>

                {/* Thin vertical divider */}
                <div style={{ width: '1px', height: '28px', background: 'var(--border-color)', margin: '0 0.15rem', flexShrink: 0 }} />

                {/* Copy Link */}
                <div style={{ position: 'relative' }}>
                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 10 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 10px)',
                          left: 0,
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '16px',
                          padding: '0.8rem 0.9rem',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(18px)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          minWidth: '170px',
                          zIndex: 200,
                        }}
                      >
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', paddingBottom: '0.3rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.1rem' }}>
                          Share via
                        </div>
                        {[
                          { id: 'whatsapp', label: 'WhatsApp',    emoji: '💬' },
                          { id: 'facebook', label: 'Facebook',    emoji: '📘' },
                          { id: 'x',        label: 'X (Twitter)', emoji: '🐦' },
                          { id: 'telegram', label: 'Telegram',    emoji: '✈️' },
                          { id: 'instagram',label: 'Instagram',   emoji: '📸' },
                        ].map(p => (
                          <motion.button
                            key={p.id}
                            onClick={() => handleShare(p.id)}
                            whileHover={{ x: 3, backgroundColor: 'var(--bg-primary)' }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.55rem',
                              padding: '0.38rem 0.55rem',
                              background: 'transparent', border: 'none',
                              borderRadius: '9px', cursor: 'pointer',
                              color: 'var(--text-primary)', fontSize: '0.82rem',
                              fontWeight: 600, textAlign: 'left', width: '100%',
                            }}
                          >
                            <span style={{ fontSize: '1rem' }}>{p.emoji}</span>
                            <span>{p.label}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Share toggle button */}
                  <motion.button
                    onClick={() => setShowShareMenu(prev => !prev)}
                    title="Share this profile"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: '38px', height: '38px',
                      borderRadius: '50%',
                      background: showShareMenu
                        ? 'var(--orange-500)'
                        : 'linear-gradient(135deg, var(--orange-500), var(--teal-500))',
                      border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff',
                      boxShadow: '0 4px 14px rgba(232,114,42,0.4)',
                      transition: 'background 0.25s',
                    }}
                  >
                    {showShareMenu ? <XIcon size={16} /> : <Share2 size={16} />}
                  </motion.button>
                </div>

                {/* Copy Link */}
                <motion.button
                  onClick={handleCopyLink}
                  title="Copy link"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: '38px', height: '38px',
                    borderRadius: '50%',
                    background: copySuccess
                      ? 'var(--success)'
                      : 'linear-gradient(135deg, var(--teal-500), var(--teal-700))',
                    border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    transition: 'background 0.25s',
                    boxShadow: '0 4px 14px rgba(0,150,136,0.4)',
                  }}
                >
                  {copySuccess ? <Check size={16} /> : <Copy size={16} />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Direct Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <div ref={chatSectionRef} style={{ marginTop: '2rem' }}>
            <DirectChatWindow
              partnerId={worker._id}
              partnerName={worker.name}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal Popup */}
      <AnimatePresence>
        {showBookingModal && (
          <BookingModal
            worker={worker}
            onClose={() => setShowBookingModal(false)}
          />
        )}
      </AnimatePresence>

      {/* intentionally empty — copy & share are inside the card's bottom bar */}
      <div style={{ display: 'none' }}>
        {/* Share Panel */}
        <AnimatePresence>
          {showShareMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '18px',
                padding: '0.85rem 1rem',
                boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                minWidth: '175px',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', paddingBottom: '0.3rem', borderBottom: '1px solid var(--border-color)' }}>
                Share via
              </div>
              {[
                { id: 'whatsapp', label: 'WhatsApp', emoji: '💬', color: '#25D366' },
                { id: 'facebook', label: 'Facebook', emoji: '📘', color: '#1877F2' },
                { id: 'x', label: 'X (Twitter)', emoji: '🐦', color: '#1DA1F2' },
                { id: 'telegram', label: 'Telegram', emoji: '✈️', color: '#2AABEE' },
                { id: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C' },
              ].map(platform => (
                <motion.button
                  key={platform.id}
                  onClick={() => handleShare(platform.id)}
                  whileHover={{ x: 4, backgroundColor: 'var(--bg-primary)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.45rem 0.65rem',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{platform.emoji}</span>
                  <span>{platform.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Copy Link Button */}
        <motion.button
          onClick={handleCopyLink}
          title="Copy link"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: copySuccess ? 'var(--success)' : 'var(--bg-card)',
            border: `2px solid ${copySuccess ? 'var(--success)' : 'var(--border-color)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(12px)',
            color: copySuccess ? '#fff' : 'var(--text-primary)',
            transition: 'background 0.3s, border-color 0.3s, color 0.3s',
          }}
        >
          {copySuccess ? <Check size={18} /> : <Copy size={18} />}
        </motion.button>

        {/* Share Button */}
        <motion.button
          onClick={() => setShowShareMenu(prev => !prev)}
          title="Share this profile"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: showShareMenu ? 'var(--orange-500)' : 'linear-gradient(135deg, var(--orange-500), var(--teal-500))',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 6px 28px rgba(232, 114, 42, 0.45)',
            color: '#fff',
            transition: 'background 0.25s',
          }}
        >
          {showShareMenu ? <XIcon size={20} /> : <Share2 size={20} />}
        </motion.button>
      </div>
    </div>
  );
};

export default WorkerDetail;
