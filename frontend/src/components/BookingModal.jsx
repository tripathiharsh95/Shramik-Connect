import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Send, CheckCircle2, AlertCircle, User, Phone, MapPin, FileText, Clock, Briefcase } from 'lucide-react';
import QRCode from 'qrcode';
import { createBooking } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

// Leaflet and React Leaflet imports
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset mapping issue in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const BookingModal = ({ worker, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const dateInputRef = useRef(null);

  // Filter accepted payment methods
  const acceptedMethods = worker.acceptedPaymentMethods && worker.acceptedPaymentMethods.length > 0
    ? worker.acceptedPaymentMethods
    : ['cash'];

  // Parse user phone: strip +91 prefix for display
  const userPhone = user?.phone ? user.phone.replace('+91', '') : '';

  const [form, setForm] = useState({
    scheduledDate: '',      // YYYY-MM-DD or DD-MM-YYYY typed manually
    scheduledTime: '',      // HH:MM typed manually
    ampm: 'AM',
    fullName: user?.name || '',
    phone: userPhone,
    state: user?.state || '',
    city: user?.city || '',
    pinCode: '',
    fullAddress: user?.address || '',
    note: '',
    paymentMode: acceptedMethods[0], // default to first accepted payment option
    upiId: '' // transaction ref ID
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrSrc, setQrSrc] = useState('');
  
  // exact location state
  const [markerPosition, setMarkerPosition] = useState(null);

  // Auto-fill from profile when user context loads
  useEffect(() => {
    if (user) {
      const uPhone = user.phone ? user.phone.replace('+91', '') : '';
      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || uPhone,
        state: prev.state || user.state || '',
        city: prev.city || user.city || '',
        fullAddress: prev.fullAddress || user.address || ''
      }));

      // Initialize marker position if user has coordinates
      if (user.location?.latitude && user.location?.longitude) {
        setMarkerPosition({
          lat: user.location.latitude,
          lng: user.location.longitude
        });
      }
    }
  }, [user]);

  // Generate QR code for UPI transaction
  useEffect(() => {
    if (form.paymentMode === 'upi') {
      const upiAddress = worker.upiId || 'test@upi';
      const upiUri = `upi://pay?pa=${upiAddress}&pn=${encodeURIComponent(worker.name)}&am=${worker.hourlyRate}&cu=INR`;
      QRCode.toDataURL(upiUri)
        .then(url => setQrSrc(url))
        .catch(err => console.error('QR code generation failed', err));
    } else {
      setQrSrc('');
    }
  }, [form.paymentMode, worker.hourlyRate, worker.upiId, worker.name]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      setForm({ ...form, phone: val });
    }
  };

  const handlePinCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 6) {
      setForm({ ...form, pinCode: val });
    }
  };

  // Helper to parse manual date string
  const parseManualDate = (dateStr) => {
    if (!dateStr) return null;
    const cleanStr = dateStr.trim();
    // YYYY-MM-DD
    let match = cleanStr.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    // DD-MM-YYYY or DD/MM/YYYY
    match = cleanStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (match) {
      return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
    }
    // General fallback
    const parsed = new Date(cleanStr);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return null;
  };

  // Helper to parse manual time HH:MM
  const parseManualTime = (timeStr) => {
    if (!timeStr) return null;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        return { h, m };
      }
    }
    return null;
  };

  const getFormattedTime = () => {
    const timeInfo = parseManualTime(form.scheduledTime);
    if (!timeInfo) return form.scheduledTime;
    const { h: hour, m: minute } = timeInfo;
    const hour12 = hour % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${form.ampm}`;
  };

  const buildScheduledDate = () => {
    const parsedDate = parseManualDate(form.scheduledDate);
    if (!parsedDate) throw new Error('Please enter a valid date (e.g. YYYY-MM-DD or DD-MM-YYYY)');

    const dateTest = new Date(parsedDate);
    if (isNaN(dateTest.getTime())) {
      throw new Error('Please enter a valid date (e.g. YYYY-MM-DD or DD-MM-YYYY)');
    }

    if (!form.scheduledTime) {
      return dateTest.toISOString();
    }

    const timeInfo = parseManualTime(form.scheduledTime);
    if (!timeInfo) {
      throw new Error('Please enter a valid time in HH:MM format (e.g. 02:30)');
    }

    let { h: hour, m: minute } = timeInfo;
    if (hour <= 12) {
      if (form.ampm === 'PM' && hour !== 12) hour += 12;
      if (form.ampm === 'AM' && hour === 12) hour = 0;
    }

    const dt = new Date(`${parsedDate}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
    if (isNaN(dt.getTime())) {
      throw new Error('Invalid Date or Time value.');
    }
    return dt.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const scheduledIsoDate = buildScheduledDate();

      const payload = {
        worker: worker._id,
        category: worker.profession || 'General Labour',
        scheduledDate: scheduledIsoDate,
        scheduledTime: getFormattedTime(),
        city: form.city || worker.city,
        area: worker.area || '',
        description: worker.about || worker.bio || '',
        customerName: form.fullName,
        customerPhone: form.phone ? `+91${form.phone}` : '',
        customerState: form.state,
        customerCity: form.city,
        customerPinCode: form.pinCode,
        customerFullAddress: form.fullAddress,
        note: form.note,
        paymentMode: form.paymentMode,
        price: worker.hourlyRate || 0,
        latitude: markerPosition ? markerPosition.lat : undefined,
        longitude: markerPosition ? markerPosition.lng : undefined
      };

      if ((form.paymentMode === 'upi' || form.paymentMode === 'bank') && form.upiId) {
        payload.upiTransactionId = form.upiId;
      }

      await createBooking(payload);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Booking creation failed. Please check date/time and try again.');
    } finally {
      setForm(prev => ({ ...prev, upiId: '' })); // clear txn id
      setLoading(false);
    }
  };

  // Map Click Listener sub-component
  const MapClickSelector = () => {
    useMapEvents({
      click(e) {
        setMarkerPosition(e.latlng);
      }
    });
    return markerPosition ? <Marker position={markerPosition} /> : null;
  };

  // --- Styles ---
  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1.25rem'
  };

  const backdropStyle = {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(6, 10, 16, 0.86)', backdropFilter: 'blur(8px)'
  };

  const ampmBtnStyle = (isActive) => ({
    padding: '0.62rem 0.85rem', fontSize: '0.85rem', fontWeight: 800,
    border: `1.5px solid ${isActive ? 'var(--orange-500, #e8722a)' : 'var(--border-color, rgba(255,255,255,0.15))'}`,
    borderRadius: '10px', cursor: 'pointer',
    background: isActive ? 'var(--orange-500, #e8722a)' : 'transparent',
    color: isActive ? '#fff' : 'var(--text-secondary, #9ca3af)',
    transition: 'all 0.2s'
  });

  const paymentOptionsMap = [
    { id: 'cash', label: '💵 Cash on Completion', icon: '💵' },
    { id: 'upi', label: '📱 UPI Payment', icon: '📱' },
    { id: 'bank', label: '🏦 Bank Transfer', icon: '🏦' }
  ];

  const availableOptions = paymentOptionsMap.filter(opt => acceptedMethods.includes(opt.id));

  // Determine initial coordinates center (default to user coords or India center)
  const defaultLat = user?.location?.latitude || 20.5937;
  const defaultLng = user?.location?.longitude || 78.9629;
  const defaultMapCenter = [defaultLat, defaultLng];

  return (
    <div style={overlayStyle}>
      <style dangerouslySetInnerHTML={{ __html: `
        .booking-modal-card {
          width: 100%;
          max-width: 1120px;
          background: var(--card-bg, #111827);
          border: 2px solid rgba(232, 114, 42, 0.45);
          border-radius: 20px;
          box-shadow: 0 0 30px rgba(232, 114, 42, 0.2), 0 25px 60px rgba(0, 0, 0, 0.7);
          padding: 1.5rem 1.75rem;
          position: relative;
          max-height: 96vh;
          display: flex;
          flex-direction: column;
          color: #f3f4f6;
          animation: modalGlow 3s infinite alternate;
          z-index: 1010;
          overflow-y: auto;
        }
        @keyframes modalGlow {
          0% { border-color: rgba(232, 114, 42, 0.4); box-shadow: 0 0 20px rgba(232, 114, 42, 0.15), 0 20px 50px rgba(0,0,0,0.6); }
          100% { border-color: rgba(232, 114, 42, 0.85); box-shadow: 0 0 35px rgba(232, 114, 42, 0.35), 0 20px 50px rgba(0,0,0,0.6); }
        }
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 10px rgba(232, 114, 42, 0.2); }
          100% { box-shadow: 0 0 22px rgba(232, 114, 42, 0.5); }
        }
        .booking-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.75rem;
          margin-top: 0.5rem;
        }
        @media (max-width: 768px) {
          .booking-form-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }
        .booking-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          font-size: 0.88rem;
          border-radius: 10px;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
          background: var(--bg-primary, #0f172a);
          color: var(--text-primary, #f3f4f6);
          outline: none;
          transition: all 0.2s ease-in-out;
        }
        .booking-input:focus {
          border-color: var(--orange-500, #e8722a);
          box-shadow: 0 0 8px rgba(232, 114, 42, 0.25);
        }
        .booking-section-label {
          font-size: 0.76rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--text-muted, #9ca3af);
          margin-bottom: 0.45rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .booking-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .booking-form-3col {
          display: grid;
          grid-template-columns: 1.2fr 1.2fr 1.2fr;
          gap: 0.75rem;
        }
        /* Leaflet tile layer brightness fix in dark modes */
        .leaflet-container {
          background: #0f172a !important;
          z-index: 1;
        }
      ` }} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={backdropStyle}
      />

      <motion.div
        initial={{ scale: 0.96, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 15, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="booking-modal-card"
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', right: '1rem', top: '1rem',
            background: 'rgba(255,255,255,0.08)', border: 'none',
            color: 'var(--text-secondary, #9ca3af)', cursor: 'pointer',
            padding: '0.35rem', display: 'flex', alignItems: 'center',
            justifyContent: 'center', borderRadius: '50%', zIndex: 10
          }}
          title="Close"
        >
          <X size={16} />
        </button>

        <div>
          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center', padding: '2.5rem 0' }}
            >
              <CheckCircle2 size={56} color="var(--success, #10b981)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>Booking Confirmed!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Navigating to your bookings...</p>
            </motion.div>
          ) : (
            <>
              {/* HEADER: Labour Details */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '0.85rem',
                marginBottom: '0.85rem',
                paddingRight: '2rem'
              }}>
                <Avatar user={worker} size="lg" border={true} showBadge={false} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    margin: 0,
                    background: 'linear-gradient(135deg, #ffffff, var(--orange-500, #e8722a))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.3px',
                    lineHeight: 1.25
                  }}>
                    Book {worker.name}
                  </h3>
                  <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '0.8rem', margin: '0.2rem 0 0', fontWeight: '600' }}>
                    {worker.profession || 'General Labour'} • {worker.city}
                  </p>
                  {(worker.about || worker.bio) && (
                    <p style={{
                      color: 'var(--text-muted, #9ca3af)', fontSize: '0.74rem', margin: '0.3rem 0 0',
                      fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4
                    }}>
                      {worker.about || worker.bio}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
                  padding: '0.55rem 0.85rem', borderRadius: '8px',
                  marginBottom: '0.85rem', display: 'flex', alignItems: 'center',
                  gap: '0.45rem', fontSize: '0.82rem', border: '1px solid rgba(239, 68, 68, 0.25)'
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="booking-form-grid">
                  
                  {/* LEFT COLUMN: Schedule, Profile details, Address, Note */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    
                    {/* Date and Time */}
                    <div>
                      <div className="booking-section-label"><Calendar size={12} /> Scheduled Date & Time</div>
                      <div className="booking-form-row">
                        {/* Date */}
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            name="scheduledDate"
                            placeholder="YYYY-MM-DD"
                            className="booking-input"
                            value={form.scheduledDate}
                            onChange={handleChange}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (dateInputRef.current) {
                                try {
                                  dateInputRef.current.showPicker();
                                } catch (e) {
                                  dateInputRef.current.focus();
                                }
                              }
                            }}
                            style={{
                              padding: '0.62rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'var(--bg-primary, #0f172a)',
                              border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                              borderRadius: '10px',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)'
                            }}
                            title="Open Calendar"
                          >
                            <Calendar size={15} />
                          </button>
                          <input
                            ref={dateInputRef}
                            type="date"
                            style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
                            value={parseManualDate(form.scheduledDate) || ''}
                            onChange={(e) => {
                              setForm(prev => ({ ...prev, scheduledDate: e.target.value }));
                            }}
                          />
                        </div>

                        {/* Time */}
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            name="scheduledTime"
                            className="booking-input"
                            value={form.scheduledTime}
                            onChange={handleChange}
                            placeholder="HH:MM"
                            required
                          />
                          <button type="button" style={ampmBtnStyle(form.ampm === 'AM')}
                            onClick={() => setForm({ ...form, ampm: 'AM' })}>AM</button>
                          <button type="button" style={ampmBtnStyle(form.ampm === 'PM')}
                            onClick={() => setForm({ ...form, ampm: 'PM' })}>PM</button>
                        </div>
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div>
                      <div className="booking-section-label"><User size={12} /> Profile details</div>
                      
                      <div className="booking-form-row" style={{ marginBottom: '0.65rem' }}>
                        <input
                          type="text"
                          name="fullName"
                          className="booking-input"
                          placeholder="Full Name"
                          value={form.fullName}
                          onChange={handleChange}
                          required
                        />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{
                            padding: '0.65rem 0.65rem', fontSize: '0.82rem',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-muted, #9ca3af)',
                            border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                            borderRight: 'none',
                            borderRadius: '10px 0 0 10px',
                            fontWeight: 600
                          }}>+91</span>
                          <input
                            type="text"
                            className="booking-input"
                            style={{ borderRadius: '0 10px 10px 0' }}
                            placeholder="Phone No."
                            value={form.phone}
                            onChange={handlePhoneChange}
                            maxLength={10}
                            required
                          />
                        </div>
                      </div>

                      <div className="booking-form-3col">
                        <input
                          type="text"
                          name="state"
                          className="booking-input"
                          placeholder="State"
                          value={form.state}
                          onChange={handleChange}
                          required
                        />
                        <input
                          type="text"
                          name="city"
                          className="booking-input"
                          placeholder="City"
                          value={form.city}
                          onChange={handleChange}
                          required
                        />
                        <input
                          type="text"
                          className="booking-input"
                          placeholder="Pin Code"
                          value={form.pinCode}
                          onChange={handlePinCodeChange}
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>

                    {/* Full Address */}
                    <div>
                      <div className="booking-section-label"><MapPin size={12} /> Full Address</div>
                      <textarea
                        name="fullAddress"
                        className="booking-input"
                        style={{ resize: 'none', lineHeight: 1.4 }}
                        placeholder="Village name, area name, landmark, house number..."
                        value={form.fullAddress}
                        onChange={handleChange}
                        rows={2}
                        required
                      />
                    </div>

                    {/* Note */}
                    <div>
                      <div className="booking-section-label"><FileText size={12} /> Note / message to labour</div>
                      <textarea
                        name="note"
                        className="booking-input"
                        style={{ resize: 'none', lineHeight: 1.4 }}
                        placeholder="Describe details, special instructions, or key request..."
                        value={form.note}
                        onChange={handleChange}
                        rows={2}
                      />
                    </div>

                  </div>

                  {/* RIGHT COLUMN: Map & Payment details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    
                    {/* Exact Location Map (Satellite Hybrid) */}
                    <div>
                      <div className="booking-section-label"><MapPin size={12} /> My Exact Location (Optional)</div>
                      <div style={{ position: 'relative', height: '260px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <MapContainer
                          center={defaultMapCenter}
                          zoom={user?.location?.latitude ? 14 : 5}
                          style={{ height: '100%', width: '100%' }}
                        >
                          {/* Google Hybrid Satellite Map Layer (shows satellite imagery, country/state/district borders, roads, cities, towns, and local area names) */}
                          <TileLayer
                            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                            attribution="&copy; Google Maps"
                          />
                          <MapClickSelector />
                        </MapContainer>
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          color: '#f3f4f6',
                          fontSize: '0.62rem',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          zIndex: 400,
                          pointerEvents: 'none',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          {markerPosition ? `📍 Pin: ${markerPosition.lat.toFixed(5)}, ${markerPosition.lng.toFixed(5)}` : "🖱️ Click map to set pin"}
                        </div>
                      </div>
                    </div>

                    {/* Payment Option Selector */}
                    <div>
                      <div className="booking-section-label"><Briefcase size={12} /> Payment Mode</div>
                      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${availableOptions.length}, 1fr)`, gap: '1rem' }}>
                        {availableOptions.map((opt) => {
                          const isSelected = form.paymentMode === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, paymentMode: opt.id }))}
                              style={{
                                height: '3.4rem',
                                borderRadius: '12px',
                                border: isSelected ? '2px solid var(--orange-500, #e8722a)' : '1px solid var(--border-color, rgba(255,255,255,0.15))',
                                background: isSelected ? 'rgba(232, 114, 42, 0.12)' : 'var(--bg-primary, #0f172a)',
                                color: isSelected ? 'var(--orange-500, #e8722a)' : 'var(--text-secondary, #9ca3af)',
                                fontWeight: isSelected ? '800' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontSize: '0.78rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.15rem',
                                boxShadow: isSelected ? '0 4px 12px rgba(232, 114, 42, 0.15)' : 'none'
                              }}
                            >
                              <span style={{ fontSize: '1.25rem' }}>{opt.icon}</span>
                              <span style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                                {opt.label.split(' ').slice(1).join(' ')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* UPI Scan details */}
                    {form.paymentMode === 'upi' && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.08))'
                      }}>
                        {qrSrc ? (
                          <img src={qrSrc} alt="UPI QR" style={{ width: '65px', height: '65px', borderRadius: '4px', flexShrink: 0, border: '1px solid #fff' }} />
                        ) : (
                          <div style={{ width: '65px', height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            Loading QR...
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #9ca3af)', margin: '0 0 0.3rem 0', fontWeight: '500' }}>
                            Scan to pay ₹{worker.hourlyRate || 0} via GPay/PhonePe
                          </p>
                          <input
                            type="text"
                            name="upiId"
                            className="booking-input"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                            placeholder="UPI Transaction ID (Required)"
                            value={form.upiId}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Bank transfer details */}
                    {form.paymentMode === 'bank' && (
                      <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem 0.5rem', color: 'var(--text-secondary, #9ca3af)', marginBottom: '0.75rem', lineHeight: 1.35 }}>
                          <div><strong>Bank:</strong> {worker.bankName || 'N/A'}</div>
                          <div><strong>Holder:</strong> {worker.accountHolderName || 'N/A'}</div>
                          <div><strong>A/C:</strong> {worker.accountNumber || 'N/A'}</div>
                          <div><strong>IFSC:</strong> {worker.ifscCode || 'N/A'}</div>
                        </div>
                        <input
                          type="text"
                          name="upiId"
                          className="booking-input"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          placeholder="Bank UTR / Transaction ID (Required)"
                          value={form.upiId}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    )}

                  </div>
                </div>

                {/* Bottom Row: Visit Fee (Left) & Actions (Right) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  marginTop: '1.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '1.25rem'
                }}>
                  {/* Bottom Left: Fixed Price Tag with Pulse Glow */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(232, 114, 42, 0.15), rgba(6, 10, 16, 0.4))',
                    border: '2px solid var(--orange-500, #e8722a)',
                    borderRadius: '14px',
                    padding: '0.6rem 1.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: '0 0 20px rgba(232, 114, 42, 0.3)',
                    animation: 'pulseGlow 2s infinite alternate',
                    flexShrink: 0
                  }}>
                    <Briefcase size={20} color="var(--orange-500, #e8722a)" />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9ca3af', lineHeight: 1, marginLeft: '1.75rem' }}>
                        Fixed
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.1rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f3f4f6', opacity: 0.85, marginRight: '0.35rem', fontFamily: 'Inter, sans-serif' }}>₹</span>
                        <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f3f4f6', fontFamily: 'Outfit, Inter, sans-serif', lineHeight: 1 }}>
                          {worker.hourlyRate || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Right: Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', minWidth: '320px', flex: 1, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-outline"
                      style={{ flex: 1, maxWidth: '140px', fontSize: '0.9rem', padding: '0.65rem 0', borderRadius: '10px' }}
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        flex: 1.5, maxWidth: '200px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '0.4rem',
                        fontSize: '0.9rem', padding: '0.65rem 0', borderRadius: '10px'
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={loading}
                    >
                      {loading ? 'Confirming...' : <><Send size={15} /> Confirm Booking</>}
                    </motion.button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;
