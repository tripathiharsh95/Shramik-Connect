import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resendVerificationEmail } from '../services/api';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePhoneChange = e => {
    const val = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (val.length <= 10) {
      setPhone(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setResendMessage('');
    
    const loginIdentifier = loginMethod === 'email' ? email : `+91${phone}`;
    if (loginMethod === 'phone' && phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    try {
      await login(loginIdentifier, password);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.isEmailVerified === false) {
        setIsUnverified(true);
        setUnverifiedEmail(err.response.data.email || (loginMethod === 'email' ? email : ''));
        setError('Your email address is not verified yet. Please check your inbox.');
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) {
      setError('Cannot resend verification link: Email address is missing.');
      return;
    }
    setResendLoading(true);
    setResendMessage('');
    try {
      await resendVerificationEmail(unverifiedEmail);
      setResendMessage('Verification link resent successfully!');
    } catch (err) {
      setResendMessage(err.response?.data?.message || 'Failed to resend link. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <motion.div className="card auth-shining-card" style={{ width: '100%', maxWidth: '440px' }} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="card-body" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ delay: 0.5, duration: 0.5 }}
              style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal-700), var(--teal-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff' }}>
              <LogIn size={24} />
            </motion.div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to your account</p>
          </div>

          {/* Login Tabs */}
          <div className="login-tabs-container">
            <button 
              type="button" 
              className={`login-tab-btn ${loginMethod === 'email' ? 'active-tab' : ''}`}
              onClick={() => { setLoginMethod('email'); setError(''); setIsUnverified(false); setResendMessage(''); }}
            >
              Email Address
            </button>
            <button 
              type="button" 
              className={`login-tab-btn ${loginMethod === 'phone' ? 'active-tab' : ''}`}
              onClick={() => { setLoginMethod('phone'); setError(''); setIsUnverified(false); setResendMessage(''); }}
            >
              Phone Number
            </button>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
              {isUnverified && (
                <div style={{ marginTop: '0.25rem' }}>
                  <button 
                    type="button" 
                    onClick={handleResend}
                    disabled={resendLoading}
                    style={{ 
                      background: 'var(--orange-500)', 
                      color: 'white', 
                      border: 'none', 
                      padding: '4px 10px', 
                      borderRadius: '4px', 
                      cursor: 'pointer', 
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px'
                    }}
                  >
                    {resendLoading ? 'Resending...' : 'Resend Verification Link'}
                  </button>
                  {resendMessage && (
                    <div style={{ marginTop: '4px', color: resendMessage.includes('successfully') ? '#4ade80' : '#f87171', fontSize: '0.75rem' }}>
                      {resendMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {loginMethod === 'email' ? (
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="phone-input-group">
                  <span className="phone-prefix">+91</span>
                  <input 
                    type="text" 
                    className="form-control phone-input-field" 
                    placeholder="98765 43210" 
                    value={phone} 
                    onChange={handlePhoneChange} 
                    maxLength={10}
                    required 
                  />
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <motion.button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '0.5rem' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--orange-500)', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
