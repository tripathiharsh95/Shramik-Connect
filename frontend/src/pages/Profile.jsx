import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Mail, Phone, MapPin, Briefcase, Wrench, 
  Check, Plus, X, Sparkles, BookOpen, Clock, ShieldCheck, 
  Upload, AlertCircle, Save, Landmark, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import Avatar, { DEFAULT_AVATARS, getAvatarKeysForGender, AVATAR_LABELS } from '../components/Avatar';
import LocationSelector from '../components/LocationSelector';
const Profile = () => {
  const { user, updateProfileState } = useAuth();
  
  // Basic states
  const [form, setForm] = useState({
    name: '',
    phone: '',
    secondaryPhone: '', // Added secondaryPhone
    gender: '',
    qualification: '',
    address: '',
    city: '',
    state: '',
    area: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const [avatar, setAvatar] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // States for LocationSelector
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Hydrate form on mount or user change
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone ? user.phone.replace('+91', '') : '',
        secondaryPhone: user.secondaryPhone ? user.secondaryPhone.replace('+91', '') : '',
        gender: user.gender || '',
        qualification: user.qualification || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        area: user.area || '',
        bankName: user.bankName || '',
        accountHolderName: user.accountHolderName || '',
        accountNumber: user.accountNumber || '',
        ifscCode: user.ifscCode || '',
        upiId: user.upiId || ''
      });
      setAvatar(user.avatar || '');
      setSelectedState(user.state || '');
      setSelectedCity(user.city || '');
    }
  }, [user]);

  // Sync state/city selectors with form values
  useEffect(() => {
    setForm(prev => ({ ...prev, state: selectedState, city: selectedCity }));
  }, [selectedState, selectedCity]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhoneChange = (e, fieldName) => {
    const val = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (val.length <= 10) {
      setForm(prev => ({ ...prev, [fieldName]: val }));
    }
  };

  // Skills handlers removed

  // Custom Image Upload (Base64)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (form.phone && form.phone.length !== 10) {
      setErrorMsg('Primary phone number must be exactly 10 digits.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (form.secondaryPhone && form.secondaryPhone.length !== 10) {
      setErrorMsg('Secondary phone number must be exactly 10 digits.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        phone: form.phone ? `+91${form.phone}` : '',
        secondaryPhone: form.secondaryPhone ? `+91${form.secondaryPhone}` : '',
        avatar
      };

      const res = await updateProfile(payload);
      if (res.data.status === 'success') {
        updateProfileState(res.data.data.user);
        setSuccessMsg('Profile updated successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Hide message after 4s
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update profile.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading user profile...</p>
      </div>
    );
  }

  const isWorker = user?.role === 'worker';

  return (
    <div className="container page-content animate-fade-up">
      {/* Messages */}
      {successMsg && (
        <motion.div 
          className="alert alert-success animate-fade-down"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Check size={18} /> {successMsg}
        </motion.div>
      )}

      {errorMsg && (
        <motion.div 
          className="alert alert-danger animate-fade-down"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <AlertCircle size={18} /> {errorMsg}
        </motion.div>
      )}

      <div className="profile-grid">
        
        {/* LEFT COLUMN: HERO CARD */}
        <div className="profile-sidebar-col">
          <div className="card profile-hero-card">
            <div className="profile-hero-bg"></div>
            <div className="card-body profile-hero-body">
              
              {/* Avatar Box with Wrench/Briefcase Overlay */}
              <div className="profile-avatar-wrapper">
                <Avatar user={{ ...user, avatar, gender: form.gender }} size="xl" showBadge={true} border={true} />
                <button 
                  type="button" 
                  onClick={() => setShowAvatarModal(true)} 
                  className="btn-change-avatar"
                  title="Change Profile Picture"
                >
                  <Upload size={16} />
                </button>
              </div>

              <h2 className="profile-hero-name">{form.name || user.name}</h2>
              
              {/* Role Tags */}
              <div className="profile-role-tag-container">
                {isWorker ? (
                  <span className="profile-role-tag role-tag-worker">
                    <Wrench size={12} />
                    <span>Labour / Worker</span>
                  </span>
                ) : (
                  <span className="profile-role-tag role-tag-customer">
                    <Briefcase size={12} />
                    <span>Job Poster / Employer</span>
                  </span>
                )}
              </div>

              {/* Verified status or other elements */}
              <div className="profile-quick-stats">
                <div className="stat-pill">
                  <Mail size={12} />
                  <span>{user.email}</span>
                </div>
                {form.phone && (
                  <div className="stat-pill">
                    <Phone size={12} />
                    <span>{form.phone}</span>
                  </div>
                )}
                {(selectedState || selectedCity) && (
                  <div className="stat-pill">
                    <MapPin size={12} />
                    <span>{selectedCity ? `${selectedCity}, ` : ''}{selectedState}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL FORMS */}
        <div className="profile-main-col">
          <div className="card">
            <div className="card-body" style={{ padding: '2.5rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <Sparkles size={20} className={isWorker ? 'text-orange' : 'text-teal'} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Account & Profile Details</h3>
              </div>

              <form onSubmit={handleSubmit}>
                
                {/* 1. Core Profile Details */}
                <h4 className="profile-form-section-title">Personal Information</h4>
                
                <div className="profile-form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      className="form-control" 
                      value={form.name} 
                      onChange={handleChange} 
                      placeholder="Enter full name" 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address <Lock size={12} style={{ marginLeft: '4px', opacity: 0.7 }} /></label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={user.email} 
                      disabled 
                      style={{ opacity: 0.75, cursor: 'not-allowed', background: 'var(--border-light)' }} 
                    />
                  </div>
                </div>

                <div className="profile-form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="phone-input-group">
                      <span className="phone-prefix">+91</span>
                      <input 
                        type="text" 
                        name="phone" 
                        className="form-control phone-input-field" 
                        placeholder="98765 43210" 
                        value={form.phone} 
                        onChange={(e) => handlePhoneChange(e, 'phone')} 
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Secondary Phone (Optional)</label>
                    <div className="phone-input-group">
                      <span className="phone-prefix">+91</span>
                      <input 
                        type="text" 
                        name="secondaryPhone" 
                        className="form-control phone-input-field" 
                        placeholder="87654 32109" 
                        value={form.secondaryPhone} 
                        onChange={(e) => handlePhoneChange(e, 'secondaryPhone')} 
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-form-row">
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select 
                      name="gender" 
                      className="form-control" 
                      value={form.gender} 
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Prefer not to say</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <select 
                      name="qualification" 
                      className="form-control" 
                      value={form.qualification} 
                      onChange={handleChange}
                    >
                      <option value="">Select Qualification</option>
                      <option value="None">None / Basic Literacy</option>
                      <option value="Primary School">Primary School</option>
                      <option value="High School">High School (10th/12th)</option>
                      <option value="ITI Certified">ITI Certified (Technical)</option>
                      <option value="Diploma">Diploma Holder</option>
                      <option value="Graduate">University Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                  </div>
                </div>

                {/* 2. Address & Location */}
                <h4 className="profile-form-section-title" style={{ marginTop: '2rem' }}>Location Details</h4>
                <div className="form-group">
                  <label className="form-label">State and City</label>
                  <LocationSelector 
                    stateValue={selectedState} 
                    cityValue={selectedCity} 
                    onStateChange={setSelectedState} 
                    onCityChange={setSelectedCity} 
                  />
                </div>
                <div className="profile-form-row">
                  <div className="form-group">
                    <label className="form-label">Sub-locality / Area</label>
                    <input 
                      type="text" 
                      name="area" 
                      className="form-control" 
                      value={form.area} 
                      onChange={handleChange} 
                      placeholder="e.g. Indiranagar, HSR Layout" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Local Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      className="form-control" 
                      value={form.address} 
                      onChange={handleChange} 
                      placeholder="Enter street, house number, etc." 
                    />
                  </div>
                </div>

                {/* 3. My Payment Details */}
                <h4 className="profile-form-section-title" style={{ marginTop: '2rem' }}>My Payment Details</h4>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '1rem' }}>
                    <Landmark size={18} style={{ color: 'var(--text-secondary)' }} />
                    <span>For Bank Transfer / IMPS / NEFT</span>
                  </div>
                  
                  <div className="profile-form-row">
                    <div className="form-group">
                      <label className="form-label">Bank Name</label>
                      <input 
                        type="text" 
                        name="bankName" 
                        className="form-control" 
                        value={form.bankName} 
                        onChange={handleChange} 
                        placeholder="e.g. State Bank of India" 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Account Holder Name</label>
                      <input 
                        type="text" 
                        name="accountHolderName" 
                        className="form-control" 
                        value={form.accountHolderName} 
                        onChange={handleChange} 
                        placeholder="e.g. John Doe" 
                      />
                    </div>
                  </div>

                  <div className="profile-form-row" style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Account Number</label>
                      <input 
                        type="text" 
                        name="accountNumber" 
                        className="form-control" 
                        value={form.accountNumber} 
                        onChange={handleChange} 
                        placeholder="e.g. 123456789012" 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">IFSC Code</label>
                      <input 
                        type="text" 
                        name="ifscCode" 
                        className="form-control" 
                        value={form.ifscCode} 
                        onChange={handleChange} 
                        placeholder="e.g. SBIN0001234" 
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: '600', fontSize: '1rem' }}>
                    <CreditCard size={18} style={{ color: 'var(--text-secondary)' }} />
                    <span>For UPI (Phonepay, Paytm, Gpay etc ...)</span>
                  </div>
                  
                  <div className="profile-form-row">
                    <div className="form-group">
                      <label className="form-label">UPI ID</label>
                      <input 
                        type="text" 
                        name="upiId" 
                        className="form-control" 
                        value={form.upiId} 
                        onChange={handleChange} 
                        placeholder="e.g. username@upi" 
                      />
                    </div>
                    <div className="form-group"></div>
                  </div>
                </div>



                {/* Submit Button */}
                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <motion.button 
                    type="submit" 
                    className={`btn ${isWorker ? 'btn-primary' : 'btn-secondary'} btn-lg`}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ width: '100%', maxWidth: '240px', gap: '0.6rem' }}
                  >
                    <Save size={18} />
                    {loading ? 'Saving Changes...' : 'Save Profile'}
                  </motion.button>
                </div>

              </form>
            </div>
          </div>
        </div>

      </div>

      {/* AVATAR SELECTOR MODAL */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="avatar-modal-overlay" onClick={() => setShowAvatarModal(false)}>
            <motion.div 
              className="avatar-modal-card card" 
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card-body">
                <div className="avatar-modal-header">
                  <h3 style={{ fontWeight: 800, fontSize: '1.3rem' }}>Select Profile Picture</h3>
                  <button onClick={() => setShowAvatarModal(false)} className="btn-close-modal">
                    <X size={20} />
                  </button>
                </div>

                <div className="avatar-modal-section">
                  <h5 className="avatar-modal-subtitle">Choose a Default Avatar</h5>
                  
                  <div className="avatar-defaults-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Male Avatars – scrollable row */}
                    <div className="avatar-gender-group">
                      <div className="avatar-group-label">Male Avatars</div>
                      <div className="avatar-group-row avatar-scroll-row">
                        {getAvatarKeysForGender('male').map(key => (
                          <div 
                            key={key}
                            className={`avatar-selection-item ${avatar === key ? 'active-selection' : ''}`}
                            onClick={() => { setAvatar(key); setForm(prev => ({ ...prev, gender: 'male' })); }}
                          >
                            <Avatar user={{ role: user.role, avatar: key, gender: 'male' }} size="lg" showBadge={false} border={false} />
                            <span>{AVATAR_LABELS[key]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Female Avatars – scrollable row */}
                    <div className="avatar-gender-group">
                      <div className="avatar-group-label">Female Avatars</div>
                      <div className="avatar-group-row avatar-scroll-row">
                        {getAvatarKeysForGender('female').map(key => (
                          <div 
                            key={key}
                            className={`avatar-selection-item ${avatar === key ? 'active-selection' : ''}`}
                            onClick={() => { setAvatar(key); setForm(prev => ({ ...prev, gender: 'female' })); }}
                          >
                            <Avatar user={{ role: user.role, avatar: key, gender: 'female' }} size="lg" showBadge={false} border={false} />
                            <span>{AVATAR_LABELS[key]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Neutral Avatar */}
                    <div className="avatar-gender-group">
                      <div className="avatar-group-label">Neutral / Other</div>
                      <div className="avatar-group-row" style={{ justifyContent: 'center' }}>
                        <div 
                          className={`avatar-selection-item ${avatar === 'neutral' ? 'active-selection' : ''}`}
                          onClick={() => { setAvatar('neutral'); }}
                        >
                          <Avatar user={{ role: user.role, avatar: 'neutral' }} size="lg" showBadge={false} border={false} />
                          <span>Default</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="avatar-modal-divider"><span>OR</span></div>

                <div className="avatar-modal-section">
                  <h5 className="avatar-modal-subtitle">Upload Custom Picture</h5>
                  <div className="upload-dropzone">
                    <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>PNG, JPG up to 2MB</span>
                    <input 
                      type="file" 
                      id="custom-avatar-file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                    />
                    <label htmlFor="custom-avatar-file" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                      Choose File
                    </label>
                  </div>
                </div>

                <div className="avatar-modal-footer">
                  <button type="button" onClick={() => setShowAvatarModal(false)} className="btn btn-primary btn-full">
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
