import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, AlertCircle, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LocationSelector from '../components/LocationSelector';
import { getRandomAvatar } from '../components/Avatar';
import { resendVerificationEmail } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '', about: '', city: '', area: '', hourlyRate: '', rateType: 'day', gender: 'male', age: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handlePhoneChange = e => {
    const val = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (val.length <= 10) {
      setForm({ ...form, phone: val });
    }
  };

  const handleAgeChange = e => {
    const val = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (val.length <= 2) {
      setForm({ ...form, age: val });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone && form.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    // State/city required for all registration
    if (!selectedState || !selectedCity) {
      setError('Please select both state and city.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const randomAvatar = getRandomAvatar(form.gender);
      const payload = { 
        ...form, 
        avatar: randomAvatar,
        phone: form.phone ? `+91${form.phone}` : '', 
        city: selectedCity, 
        state: selectedState 
      };
      await register(payload);
      setRegisteredEmail(form.email);
      setIsRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      await resendVerificationEmail(registeredEmail);
      setResendMessage('Verification email resent successfully!');
    } catch (err) {
      setResendMessage(err.response?.data?.message || 'Failed to resend email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 0' }}>
        <motion.div className="card auth-shining-card" style={{ width: '100%', maxWidth: '520px' }} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="card-body" style={{ padding: '3rem 2.5rem', textAlign: 'center' }}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
              style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.2))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1.5rem', 
                color: 'var(--orange-500)',
                border: '2px solid rgba(249, 115, 22, 0.3)',
                boxShadow: '0 0 20px rgba(249, 115, 22, 0.15)'
              }}
            >
              <Mail size={36} />
            </motion.div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Verify Your Email</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              We've sent a verification link to <br />
              <strong style={{ color: 'var(--orange-500)', fontSize: '1.05rem' }}>{registeredEmail}</strong>. <br />
              Please check your inbox and click the verification button to activate your account.
            </p>

            {resendMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  background: resendMessage.includes('successfully') ? 'rgba(74, 222, 128, 0.1)' : 'var(--danger-bg)', 
                  color: resendMessage.includes('successfully') ? '#4ade80' : 'var(--danger)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  marginBottom: '1.5rem', 
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {resendMessage.includes('successfully') && <CheckCircle2 size={16} />}
                {resendMessage}
              </motion.div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <motion.button 
                onClick={handleResend} 
                className="btn btn-primary btn-full" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                disabled={resendLoading}
              >
                {resendLoading ? 'Resending...' : 'Resend Verification Link'}
              </motion.button>

              <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 0' }}>
      <motion.div className="card auth-shining-card" style={{ width: '100%', maxWidth: '520px' }} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="card-body" style={{ padding: '2.5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ delay: 0.3, duration: 1, repeat: 2 }}
              style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange-500), var(--orange-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff' }}>
              <UserPlus size={24} />
            </motion.div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.3rem' }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join as a customer or worker</p>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">I want to...<span style={{ color: '#e57373', marginLeft: '4px' }}>*</span></label>
              <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                <option value="customer">Hire Workers (Customer)</option>
                <option value="worker">Find Jobs (Worker)</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name<span style={{ color: '#e57373', marginLeft: '4px' }}>*</span></label>
                <input type="text" name="name" className="form-control" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number<span style={{ color: '#e57373', marginLeft: '4px' }}>*</span></label>
                <div className="phone-input-group">
                  <span className="phone-prefix">+91</span>
                  <input 
                    type="text" 
                    name="phone" 
                    className="form-control phone-input-field" 
                    placeholder="98765 43210" 
                    value={form.phone} 
                    onChange={handlePhoneChange} 
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group">
                <label className="form-label">Gender<span style={{ color: '#e57373', marginLeft: '4px' }}>*</span></label>
                <select name="gender" className="form-control" value={form.gender} onChange={handleChange} required>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Age<span style={{ color: '#e57373', marginLeft: '4px' }}>*</span></label>
                <input 
                  type="text" 
                  name="age" 
                  className="form-control" 
                  placeholder="25" 
                  value={form.age} 
                  onChange={handleAgeChange} 
                  maxLength={2}
                  required 
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email<span style={{ color: '#e57373', marginLeft: '4px' }}>*</span></label>
              <input type="email" name="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password<span style={{ color: '#e57373', marginLeft: '4px' }}>*</span></label>
              <input type="password" name="password" className="form-control" placeholder="Min 8 characters" value={form.password} onChange={handleChange} required minLength={8} />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Location (State and City)<span style={{ color: '#e57373', marginLeft: '4px' }}>*</span></label>
              <LocationSelector
                stateValue={selectedState}
                cityValue={selectedCity}
                onStateChange={setSelectedState}
                onCityChange={setSelectedCity}
              />
            </div>
            <motion.button type="submit" className="btn btn-primary btn-full btn-lg" style={{ marginTop: '0.5rem' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Register Now'}
            </motion.button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--orange-500)', fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
