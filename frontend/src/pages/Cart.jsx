import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, CalendarDays, Trash2, ShieldCheck, MapPin, Star, Briefcase, Clock, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import BookingModal from '../components/BookingModal';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const cartKey = user ? `cart_${user._id}` : 'cart_guest';

  // Load cart items on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, [cartKey]);

  // Remove worker from cart
  const handleRemove = (workerId) => {
    const updatedCart = cartItems.filter(item => item.worker._id !== workerId);
    setCartItems(updatedCart);
    localStorage.setItem(cartKey, JSON.stringify(updatedCart));
  };

  const formatAddedDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="container page-content">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '45px',
              height: '45px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--warning-bg)',
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingCart size={22} />
            </div>
            <div>
              <h2 className="section-title" style={{ margin: 0 }}>My Cart</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Your selected and saved workers</p>
            </div>
          </div>
          <span className="badge badge-info" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
            {cartItems.length} Saved {cartItems.length === 1 ? 'Worker' : 'Workers'}
          </span>
        </div>

        {cartItems.length === 0 ? (
          /* Empty State */
          <motion.div 
            className="card"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              textAlign: 'center', 
              padding: '5rem 2rem', 
              maxWidth: '600px', 
              margin: '0 auto',
              borderStyle: 'dashed',
              borderWidth: '2px'
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.7 }}>🛒</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Cart is Empty</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
              Save profiles of professional workers you are interested in hiring later.
            </p>
            <motion.button 
              className="btn btn-primary"
              onClick={() => navigate('/find')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '0.8rem 2rem', fontWeight: '700' }}
            >
              Explore Workers
            </motion.button>
          </motion.div>
        ) : (
          /* Cart List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cartItems.map((item, index) => {
              const worker = item.worker;
              const professionStr = worker.profession || 'General Labour';
              const parts = professionStr.split(' - ');
              const jobCategory = parts[0].trim();
              const workInfo = parts.slice(1).join(' - ').trim();

              return (
                <motion.div
                  key={worker._id}
                  className="card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ borderColor: 'var(--teal-600)' }}
                  style={{ position: 'relative' }}
                >
                  <div className="card-body" style={{ padding: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    
                    {/* Left side: Avatar + Professional details */}
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: '1', minWidth: '300px' }}>
                      <Avatar user={worker} size="lg" border={true} showBadge={false} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h3 
                            onClick={() => navigate(`/workers/${worker._id}`)}
                            style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, cursor: 'pointer', transition: 'color 0.2s' }}
                            className="cart-worker-name"
                          >
                            {worker.name}
                          </h3>
                          {worker.isVerified && (
                            <span className="badge badge-verified" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>
                              <ShieldCheck size={11} /> Verified
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--teal-700)' }}>{jobCategory}</span>
                          {workInfo && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• {workInfo}</span>}
                        </div>

                        {/* Location & Stats */}
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <MapPin size={12} /> {worker.area ? `${worker.area}, ` : ''}{worker.city}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Star size={12} fill="var(--warning)" color="var(--warning)" /> {worker.rating} Rating
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Briefcase size={12} /> {worker.jobsCompleted} Jobs Completed
                          </span>
                        </div>

                        {/* Added Timestamp */}
                        <div style={{
                          marginTop: '0.85rem',
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)',
                          background: 'var(--bg-primary)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          border: '1px solid var(--border-light)'
                        }}>
                          <Clock size={12} />
                          <span>Added on: <strong style={{ color: 'var(--text-secondary)' }}>{formatAddedDate(item.addedAt)}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Charge Rate */}
                    <div style={{ minWidth: '110px' }}>
                      <div style={{ fontSize: worker.workerType === 'team' ? '0.55rem' : '0.7rem', fontWeight: 750, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                        {worker.workerType === 'team' ? 'Charge (per worker)' : 'Charge'}
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>₹{worker.hourlyRate || 0}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per {worker.rateType || 'day'}</div>
                    </div>

                    {/* Right side: Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => navigate(`/workers/${worker._id}`)}
                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}
                      >
                        View Post
                      </button>

                      <motion.button 
                        className="btn btn-secondary"
                        onClick={() => setSelectedWorker(worker)}
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <CalendarDays size={14} /> Book Now
                      </motion.button>

                      <button 
                        onClick={() => handleRemove(worker._id)}
                        style={{
                          background: 'transparent',
                          border: '1.5px solid var(--border-color)',
                          color: 'var(--danger)',
                          borderRadius: 'var(--radius-sm)',
                          width: '38px',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        title="Remove from cart"
                        className="cart-remove-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedWorker && (
          <BookingModal
            worker={selectedWorker}
            onClose={() => setSelectedWorker(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
