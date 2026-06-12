import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, XCircle, ArrowRight, Loader, Mail, AlertCircle } from 'lucide-react';
import { verifyEmail, resendVerificationEmail } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Simple custom confetti helper using framer-motion
const ConfettiExplosion = () => {
  const colors = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
  const particles = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    color: colors[i % colors.length],
    size: Math.random() * 8 + 6,
    shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'triangle',
    // Physics properties
    xStart: 0,
    yStart: 0,
    xEnd: (Math.random() - 0.5) * 400,
    yEnd: Math.random() * -300 - 100, // Shoot up initially
    drift: (Math.random() - 0.5) * 150,
    rotateStart: Math.random() * 360,
    rotateEnd: Math.random() * 720 + 360,
    delay: Math.random() * 0.2,
    duration: Math.random() * 1.5 + 2.0
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {particles.map((p) => {
        const shapeStyle = p.shape === 'circle' 
          ? { borderRadius: '50%' } 
          : p.shape === 'square'
            ? {}
            : { width: 0, height: 0, backgroundColor: 'transparent', borderLeft: `${p.size / 2}px solid transparent`, borderRight: `${p.size / 2}px solid transparent`, borderBottom: `${p.size}px solid ${p.color}` };

        return (
          <motion.div
            key={p.id}
            initial={{ 
              x: '50vw', 
              y: '50vh', 
              scale: 0.2, 
              opacity: 1,
              rotate: p.rotateStart 
            }}
            animate={{
              // Sequence: shoot up, then fall down with gravity
              x: [`50vw`, `calc(50vw + ${p.xEnd}px)`, `calc(50vw + ${p.xEnd + p.drift}px)`],
              y: [`50vh`, `calc(50vh + ${p.yEnd}px)`, `110vh`],
              opacity: [1, 1, 1, 0.8, 0],
              scale: [0.2, 1, 0.8, 0.5, 0],
              rotate: p.rotateEnd
            }}
            transition={{
              duration: p.duration,
              ease: [0.1, 0.8, 0.3, 1], // Custom overshoot / gravity ease
              delay: p.delay
            }}
            style={{
              position: 'absolute',
              width: p.shape === 'triangle' ? 0 : p.size,
              height: p.shape === 'triangle' ? 0 : p.size,
              backgroundColor: p.shape === 'triangle' ? 'transparent' : p.color,
              ...shapeStyle
            }}
          />
        );
      })}
    </div>
  );
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const navigate = useNavigate();
  const { establishSession } = useAuth();

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [emailToResend, setEmailToResend] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token is missing in the URL link.');
        return;
      }

      try {
        // Wait 1.5s to show a clean verifying transition effect
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const res = await verifyEmail(token, email);
        const { token: sessionToken, data } = res.data;
        
        // Save token & user profile in context & localStorage
        establishSession(sessionToken, data.user);
        
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message || 
          'Invalid or expired verification link. Please check your inbox or request a new link.'
        );
      }
    };

    performVerification();
  }, [token, email]);

  // Countdown timer for automatic redirect on success
  useEffect(() => {
    if (status !== 'success') return;
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, navigate]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!emailToResend) return;

    setResendLoading(true);
    setResendSuccess(false);
    setResendError('');

    try {
      await resendVerificationEmail(emailToResend);
      setResendSuccess(true);
      setEmailToResend('');
    } catch (err) {
      setResendError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh', 
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      {status === 'success' && <ConfettiExplosion />}

      <AnimatePresence mode="wait">
        {status === 'verifying' && (
          <motion.div 
            key="verifying"
            className="card auth-shining-card" 
            style={{ width: '100%', maxWidth: '480px', textAlign: 'center', padding: '3rem 2rem' }}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2rem' }}>
              {/* Glowing ring animation */}
              <motion.div 
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  borderRadius: '50%', 
                  border: '3px solid rgba(249, 115, 22, 0.1)',
                  borderTop: '3px solid var(--orange-500)',
                }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <motion.div 
                style={{ 
                  position: 'absolute', 
                  inset: '8px', 
                  borderRadius: '50%', 
                  border: '2px dashed rgba(249, 115, 22, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--orange-500)'
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <Loader size={28} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
              </motion.div>
            </div>
            
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>Verifying Your Email</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Connecting with our servers to secure your account. Please hold on...
            </p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            key="success"
            className="card auth-shining-card" 
            style={{ 
              width: '100%', 
              maxWidth: '480px', 
              textAlign: 'center', 
              padding: '3rem 2rem',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.05)'
            }}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          >
            {/* Success icon with drawing animation and scale burst */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 2rem', 
                color: '#fff',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
              }}
            >
              <motion.svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <motion.path 
                  d="M20 6L9 17L4 12" 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
                />
              </motion.svg>
            </motion.div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: '#10b981' }}>Account Verified!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Your email address has been verified successfully. Welcome to the Shramik Connect community!
            </p>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px dashed var(--border-color)' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                You will be automatically redirected to the dashboard in <span style={{ color: 'var(--orange-500)', fontWeight: 700 }}>{countdown}s</span>...
              </p>
            </div>

            <motion.button 
              onClick={() => navigate('/')} 
              className="btn btn-primary btn-full"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Go to Dashboard <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            key="error"
            className="card" 
            style={{ width: '100%', maxWidth: '480px', padding: '2.5rem 2rem' }}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1rem', 
                color: '#ef4444' 
              }}>
                <XCircle size={36} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Verification Failed</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {errorMessage}
              </p>
            </div>

            {/* Inline Verification Resend Form */}
            <div style={{ 
              borderTop: '1px solid var(--border-color)', 
              paddingTop: '1.5rem', 
              marginTop: '1.5rem' 
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} style={{ color: 'var(--orange-500)' }} /> Need a new link?
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                Enter your email address below to receive another verification email.
              </p>

              {resendSuccess && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} /> New link has been sent to your email.
                </div>
              )}

              {resendError && (
                <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> {resendError}
                </div>
              )}

              <form onSubmit={handleResend} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="yourname@example.com" 
                  value={emailToResend} 
                  onChange={(e) => setEmailToResend(e.target.value)}
                  style={{ flex: 1, margin: 0 }}
                  required
                />
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={resendLoading}
                  style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap', margin: 0 }}
                >
                  {resendLoading ? 'Sending...' : 'Send Link'}
                </button>
              </form>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <Link to="/login" style={{ color: 'var(--orange-500)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyEmail;
