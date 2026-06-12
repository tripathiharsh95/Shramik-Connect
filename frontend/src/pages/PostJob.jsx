// PostJob.jsx - Restructured implementation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, AlertCircle, Check, Plus, X, Sparkles, Wrench, Briefcase, Clock, Save } from 'lucide-react';
import { createBooking, getMyBookings, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LocationSelector from '../components/LocationSelector';
import { defaultCityCoords } from '../services/locationData';

const PostJob = () => {
  const navigate = useNavigate();
  // Service categories data (mirrored from FindWorkers)
  const SERVICE_CATEGORIES = {
    "Construction & Civil Work": [
      "House Builder / Raj Mistri - Complete house construction, brick work, plastering and finishing work.",
      "Tiles Mistri - Installation of floor tiles, wall tiles, bathroom tiles with proper leveling.",
      "Marble/Granite Fitter - Cutting, polishing and fitting of marble, granite and stone slabs.",
      "Painter / Whitewash Worker - Wall painting, putty, distemper, texture and waterproofing paint.",
      "POP / False Ceiling Expert - Gypsum board, POP design, false ceiling for home and office.",
      "Shuttering Carpenter - Wooden shuttering work for slab, beam and column casting.",
      "Bar Bender - Cutting, bending and binding steel rods for RCC structure.",
      "General Labour / Beldar - Excavation, material shifting, site cleaning and helper work.",
      "Demolition Worker - Safe demolition of walls, old structures and debris removal."
    ],
    "Wood & Metal Work": [
      "Carpenter / Furniture Mistri - Door, window, modular kitchen, wardrobe and all wood work.",
      "Welder - Iron gate, grill, shed, railing fabrication and welding repair work.",
      "Aluminium Fabricator - Aluminium doors, windows, sliding, partition and ACP work.",
      "Glass Fitter - Glass cutting, fitting for windows, doors, mirrors and tabletops.",
      "Furniture Polisher - Wood polishing, lamination and old furniture restoration."
    ],
    "Electrical & Appliance Repair": [
      "Electrician - House wiring, MCB box, meter fitting, light-fan installation and fault repair.",
      "AC Technician - AC installation, uninstallation, gas filling, servicing and repair.",
      "Refrigerator Repair - Fridge gas charging, compressor repair, cooling issue fixing.",
      "TV Repair Technician - LED, LCD, Smart TV panel and motherboard repair at home.",
      "Washing Machine Mechanic - Top load/front load machine repair and servicing.",
      "Fan/Motor Winding Expert - Ceiling fan, cooler, water motor rewinding and repair.",
      "Geyser/Microwave Repair - Electric geyser, microwave, induction repair service.",
      "RO/Water Purifier Technician - RO installation, filter change, UV/UF repair and service."
    ],
    "Plumbing & Sanitary": [
      "Plumber - Tap, pipe, leakage repair, new bathroom fitting and pipeline work.",
      "Bathroom Fitter - Commode, washbasin, shower, geyser and CP fitting installation.",
      "Septic Tank Cleaner - Septic tank and soak pit cleaning with machine.",
      "Drainage Cleaner - Blocked drain, sewer line and pipeline cleaning service."
    ],
    "Home & Facility Services": [
      "House Cleaner - Full home cleaning, dusting, sweeping, mopping for daily/deep clean.",
      "Bathroom/Toilet Deep Cleaner - Hard stains, tiles, fittings and toilet deep cleaning.",
      "Sofa/Carpet Cleaner - Dry-cleaning and shampooing of sofa, carpet, mattress at home.",
      "Pest Control - Cockroach, termite, bedbug, mosquito and rodent control treatment.",
      "Water Tank Cleaner - Overhead/underground water tank cleaning with anti-bacterial spray.",
      "Gardener / Mali - Plantation, lawn maintenance, cutting, fertilizer and garden setup.",
      "Security Guard - Trained guard for home, office, shop and event security duty.",
      "Loader / Hamal - Loading-unloading, goods shifting and warehouse labour support.",
      "Packers & Movers Helper - Home shifting, packing, loading and rearrangement help."
    ],
    "Others / Miscellaneous": [
      "Driver - Personal, commercial and outstation driver on daily/monthly basis.",
      "Cook / Chef - Home cook, party cook and tiffin service for veg/non-veg.",
      "Car Washer - Doorstep car wash, interior cleaning and polish service.",
      "Cable/DTH Technician - New connection, setup box repair and signal setting.",
      "CCTV/Camera Installer - CCTV camera, DVR, WiFi camera installation and configuration.",
      "Mobile Repair Technician - Phone display, battery, charging and software repair.",
      "Tailor / Darzi - Home visit tailoring, alteration and stitching service.",
      "Dhobi / Ironing Service - Clothes washing, dry-cleaning and ironing pickup-drop.",
      "Event Helper / Tent Labour - Tent, light, chair-table setup for functions and events."
    ]
  };

  const { user, updateProfileState } = useAuth();
  const isWorker = user?.role === 'worker';

  // --- Customer / Employer States ---
  const [form, setForm] = useState({
    subCategory: '',
    scheduledDate: '',
    area: 'Indiranagar',
    description: '',
    paymentMode: 'cash',
    price: '',
    upiId: '',
    workerType: 'individual',
    teamRange: ''
  });

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const [posted, setPosted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Worker / Labour States ---
  const [workerForm, setWorkerForm] = useState({
    profession: '',
    hourlyRate: 0,
    rateType: 'day',
    experienceYears: 0,
    isAvailable: true,
    bio: '',
    about: '',
    acceptedPaymentMethods: ['cash'],
    workerType: 'individual',
    teamRange: ''
  });
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [workerSuccess, setWorkerSuccess] = useState('');
  const [workerError, setWorkerError] = useState('');
  const [workerLoading, setWorkerLoading] = useState(false);
  const [aiBioLoading, setAiBioLoading] = useState(false);

  const allFullSubCategories = Object.values(SERVICE_CATEGORIES).flat();

  useEffect(() => {
    if (!isWorker) {
      fetchBookings();
      if (user) {
        setForm(prev => ({
          ...prev,
          description: prev.description || user.about || user.bio || '',
          area: prev.area || user.area || 'Indiranagar'
        }));
        if (user.state) setSelectedState(user.state);
        if (user.city) setSelectedCity(user.city);
      }
    } else if (user) {
      setWorkerForm({
        profession: user.profession || '',
        hourlyRate: user.hourlyRate || 0,
        rateType: user.rateType || 'day',
        experienceYears: user.experienceYears || 0,
        isAvailable: user.isAvailable !== undefined ? user.isAvailable : true,
        bio: user.bio || '',
        about: user.about || '',
        acceptedPaymentMethods: user.acceptedPaymentMethods && user.acceptedPaymentMethods.length > 0 ? user.acceptedPaymentMethods : ['cash'],
        workerType: user.workerType || 'individual',
        teamRange: user.teamRange || ''
      });
      setSkills(user.skills || []);
    }
  }, [user, isWorker]);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setPosted(res.data.data.bookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  // --- Change Handlers ---
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleWorkerChange = e => {
    const { name, value, type, checked } = e.target;
    setWorkerForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- Skill Handlers ---
  const handleToggleCheckmarkSkill = cleanSkillName => {
    if (skills.includes(cleanSkillName)) {
      setSkills(skills.filter(s => s !== cleanSkillName));
    } else {
      if (skills.length >= 5) {
        setWorkerError('You can select/add up to 5 skills.');
        setTimeout(() => setWorkerError(''), 4000);
        return;
      }
      setSkills([...skills, cleanSkillName]);
    }
  };

  const handleAddSkill = e => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      setNewSkill('');
      return;
    }
    if (skills.length >= 5) {
      setWorkerError('You can select/add up to 5 skills.');
      setTimeout(() => setWorkerError(''), 4000);
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = skillToRemove => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // ── AI Bio Helper Functions ──────────────────────────────────────────────
  const generateFreshBio = ({ jobCategory, expYears, skillsList, workerType, qualification, city }) => {
    const prof = jobCategory || 'skilled professional';
    const expPart =
      expYears === 0 ? 'With a strong foundation in the trade'
      : expYears <= 2 ? `With ${expYears} year${expYears > 1 ? 's' : ''} of hands-on experience`
      : expYears <= 5 ? `With ${expYears} years of practical experience`
      : expYears <= 10 ? `With over ${expYears} years of expertise`
      : `With more than ${expYears} years of industry experience`;
    const skillPart = skillsList.length > 0
      ? ` My core specializations include ${skillsList.length === 1 ? skillsList[0] : skillsList.slice(0, -1).join(', ') + ' and ' + skillsList[skillsList.length - 1]}.`
      : '';
    const qualPart = qualification ? ` I hold a ${qualification} qualification and` : ' I';
    const workerTypePart = workerType === 'team'
      ? ' I lead a dedicated team, handling complex and large-scale projects with coordinated precision.'
      : ' I operate as an independent professional, giving focused personal attention to every assignment.';
    const cityPart = city ? ` Serving clients in ${city} and surrounding areas,` : '';
    return `${expPart} as a ${prof},${qualPart} bring a commitment to quality and reliability to every project.${skillPart}${workerTypePart}${cityPart} I pride myself on punctuality, transparent communication, and delivering results that exceed expectations. Every client deserves top-tier service — and that is the standard I uphold on every job.`;
  };

  const polishExistingBio = (rawBio, { jobCategory, expYears, skillsList }) => {
    let p = rawBio.trim();
    p = p.charAt(0).toUpperCase() + p.slice(1);
    if (!/[.!?]$/.test(p)) p += '.';
    const informalMap = [
      [/\bI am good at\b/gi, 'I specialize in'],
      [/\bI know\b/gi, 'I am proficient in'],
      [/\bI can do\b/gi, 'I am capable of handling'],
      [/\bvery good\b/gi, 'highly skilled'],
      [/\bgood worker\b/gi, 'dedicated professional'],
      [/\bfast worker\b/gi, 'efficient and timely professional'],
      [/\bwork hard\b/gi, 'maintain the highest work standards'],
      [/\bI do\b/gi, 'I handle'],
      [/\bI make\b/gi, 'I deliver'],
    ];
    informalMap.forEach(([pattern, replacement]) => { p = p.replace(pattern, replacement); });
    if (p.length < 120) {
      const extras = [];
      if (jobCategory) extras.push(`As a ${jobCategory} professional`);
      if (expYears > 0) extras.push(`with ${expYears} year${expYears > 1 ? 's' : ''} of experience`);
      if (skillsList.length > 0) extras.push(`specializing in ${skillsList.join(', ')}`);
      if (extras.length > 0) p += ` ${extras.join(', ')}, I am committed to delivering quality results for every client.`;
    }
    return p;
  };

  const handleAIBio = () => {
    const currentBio = (workerForm.about || workerForm.bio || '').trim();
    const profession = workerForm.profession || '';
    const jobCategory = profession.split(' - ')[0].trim();
    const expYears = Number(workerForm.experienceYears) || 0;
    const skillsList = [...skills];
    const workerType = workerForm.workerType;
    const qualification = user?.qualification || '';
    const city = user?.city || '';
    setAiBioLoading(true);
    setTimeout(() => {
      const bio = currentBio
        ? polishExistingBio(currentBio, { jobCategory, expYears, skillsList, qualification })
        : generateFreshBio({ jobCategory, expYears, skillsList, workerType, qualification, city });
      setWorkerForm(prev => ({ ...prev, about: bio }));
      setAiBioLoading(false);
    }, 1400);
  };
  // ─────────────────────────────────────────────────────────────────────────

  // --- Worker Professional Profile Submission ---
  const handleWorkerSubmit = async e => {
    e.preventDefault();
    setWorkerError('');
    setWorkerSuccess('');
    setWorkerLoading(true);

    try {
      const payload = {
        ...workerForm,
        skills,
        isAdPosted: true
      };

      // Backend expects bio and about to be populated appropriately
      if (workerForm.about && !workerForm.bio) {
        payload.bio = workerForm.about.substring(0, 499);
      } else if (workerForm.bio && !workerForm.about) {
        payload.about = workerForm.bio;
      }

      const res = await updateProfile(payload);
      if (res.data.status === 'success') {
        updateProfileState(res.data.data.user);
        setWorkerSuccess('Professional profile published successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setWorkerSuccess(''), 4000);
      }
    } catch (err) {
      setWorkerError(err.response?.data?.message || err.message || 'Failed to update professional profile.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setWorkerLoading(false);
    }
  };

  // --- Customer Booking Requirement Submission ---
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Build payload merging form data with selected location
      const payload = {
        ...form,
        city: selectedCity,
        state: selectedState,
        userId: user?.id,
        category: selectedCategory,
        subCategory: selectedSubCategory
      };

      if (payload.price) payload.price = Number(payload.price);

      if (form.paymentMode === 'upi' && form.upiId) {
        payload.upiTransactionId = form.upiId;
      }
      delete payload.upiId;

      // Normal booking creation (cash or UPI)
      await createBooking(payload);
      // Reset form fields (keep location selectors unchanged)
      setForm({
        ...form,
        description: '',
        scheduledDate: '',
        price: '',
        upiId: '',
        workerType: 'individual',
        teamRange: ''
      });
      fetchBookings();
      navigate('/my-posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const detectedMainCat = (() => {
    if (!workerForm.profession) return '';
    for (const [mainCat, subCats] of Object.entries(SERVICE_CATEGORIES)) {
      if (subCats.includes(workerForm.profession)) {
        return mainCat;
      }
    }
    return '';
  })();

  return (
    <div className="container page-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        
        {/* ========================================================
            1. LABOUR / WORKER PROFILE MANAGEMENT FORM
            ======================================================== */}
        {isWorker ? (
          <div className="card animate-fade-up" style={{ marginBottom: '2rem' }}>
            <div className="card-body" style={{ padding: '2.5rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.2rem' }}>
                <Sparkles size={22} className="text-orange" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Publish Professional Service Profile</h2>
              </div>

              {workerSuccess && (
                <motion.div 
                  className="alert alert-success animate-fade-down"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Check size={18} /> {workerSuccess}
                </motion.div>
              )}

              {workerError && (
                <motion.div 
                  className="alert alert-danger animate-fade-down"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <AlertCircle size={18} /> {workerError}
                </motion.div>
              )}

              <form onSubmit={handleWorkerSubmit}>
                
                <h4 className="profile-form-section-title">Labour Settings & Profession</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                  <div className="form-group">
                    <label className="form-label">Labour Category / Profession</label>
                    <select 
                      name="profession" 
                      className="form-control" 
                      value={workerForm.profession} 
                      onChange={handleWorkerChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {allFullSubCategories.map(prof => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Detected Main Category</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={detectedMainCat} 
                      disabled 
                      placeholder="Auto-detected main category"
                      style={{ background: 'var(--border-light)', cursor: 'not-allowed', fontWeight: 650, color: 'var(--teal-600)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
                  <div className="form-group">
                    <label className="form-label">Work Experience (in Years)</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="number" 
                        name="experienceYears" 
                        className="form-control" 
                        min="0"
                        max="50"
                        value={workerForm.experienceYears} 
                        onChange={handleWorkerChange} 
                        placeholder="e.g. 5" 
                        style={{ paddingLeft: '2.4rem' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>Rate (₹)</label>
                      <div style={{ 
                        display: 'inline-flex', 
                        background: 'var(--bg-primary, #0f172a)', 
                        padding: '0.2rem', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                        gap: '0.15rem' 
                      }}>
                        {[
                          { value: 'day', label: 'Per Day' },
                          { value: 'visit', label: 'Per Visit' },
                          { value: 'hour', label: 'Per Hour' }
                        ].map(opt => {
                          const isSelected = (workerForm.rateType || 'day') === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setWorkerForm(prev => ({ ...prev, rateType: opt.value }))}
                              style={{
                                padding: '0.2rem 0.65rem',
                                fontSize: '0.72rem',
                                fontWeight: 750,
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                background: isSelected 
                                  ? 'linear-gradient(135deg, var(--orange-500, #e8722a), var(--orange-600, #d05b1c))' 
                                  : 'transparent',
                                color: isSelected ? '#fff' : 'var(--text-secondary, #9ca3af)',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isSelected ? '0 2px 6px rgba(232, 114, 42, 0.2)' : 'none',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.95rem' }}>₹</span>
                      <input 
                        type="number" 
                        name="hourlyRate" 
                        className="form-control" 
                        min="0"
                        value={workerForm.hourlyRate} 
                        onChange={handleWorkerChange} 
                        placeholder={`₹ per ${(workerForm.rateType || 'day')}`} 
                        style={{ paddingLeft: '2.4rem' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="isAvailable" 
                      name="isAvailable" 
                      checked={workerForm.isAvailable} 
                      onChange={handleWorkerChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="isAvailable" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                      Currently Available for Booking
                    </label>
                  </div>
                </div>

                {/* Skills Selector Checkbox List */}
                <div className="skills-checkmark-section" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                    Select Skills / Subcategories (Up to 5)
                  </label>
                  
                  <div className="skills-main-category-groups">
                    {Object.entries(SERVICE_CATEGORIES).map(([mainCat, subCats]) => (
                      <div key={mainCat} className="skills-category-group">
                        <div className="skills-group-header">{mainCat}</div>
                        <div className="skills-pills-grid">
                          {subCats.map(sub => {
                            const cleanSub = sub.split(' - ')[0].trim();
                            const isChecked = skills.includes(cleanSub);
                            const isDisabled = !isChecked && skills.length >= 5;
                            
                            return (
                              <button
                                key={cleanSub}
                                type="button"
                                onClick={() => handleToggleCheckmarkSkill(cleanSub)}
                                disabled={isDisabled}
                                className={`skill-pill-choice ${isChecked ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                              >
                                <span className="checkbox-indicator">
                                  {isChecked && <Check size={10} strokeWidth={3} />}
                                </span>
                                <span>{cleanSub}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manual Skills Manager */}
                <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                  <label className="form-label">Or Add Custom Skills Manually</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newSkill} 
                      onChange={e => setNewSkill(e.target.value)} 
                      placeholder="e.g. Pipe welding, Leak repair, Custom furniture" 
                      onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(e); }}
                    />
                    <button type="button" onClick={handleAddSkill} className="btn btn-secondary">
                      <Plus size={18} /> Add
                    </button>
                  </div>
                  
                  {/* Active Skill Tags List */}
                  <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Skills ({skills.length}/5 Selected):</label>
                  <div className="profile-skills-list">
                    {skills.length === 0 ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No skills added. Check options above or type to add custom skills.</span>
                    ) : (
                      skills.map(skill => (
                        <span key={skill} className="skill-badge-edit">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="btn-remove-skill">
                            <X size={10} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Workforce Type Selection - Premium Cards */}
                <div className="workforce-section">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Workforce Type
                  </label>
                  <div className="workforce-grid">
                    <div 
                      className={`workforce-card ${workerForm.workerType === 'individual' ? 'selected' : ''}`}
                      onClick={() => setWorkerForm(prev => ({ ...prev, workerType: 'individual', teamRange: '' }))}
                    >
                      <div className="workforce-card-icon">
                        <Briefcase size={20} />
                      </div>
                      <span className="workforce-card-title">Individual Workforce</span>
                      <p className="workforce-card-desc">Single dedicated worker for standard or personal tasks.</p>
                    </div>

                    <div 
                      className={`workforce-card ${workerForm.workerType === 'team' ? 'selected' : ''}`}
                      onClick={() => setWorkerForm(prev => ({ ...prev, workerType: 'team', teamRange: '1-5' }))}
                    >
                      <div className="workforce-card-icon">
                        <Sparkles size={20} />
                      </div>
                      <span className="workforce-card-title">Team Workforce</span>
                      <p className="workforce-card-desc">Coordinated group of workers for larger/complex projects.</p>
                    </div>
                  </div>

                  {/* Team Range Selector - Dynamic transition with framer-motion */}
                  <AnimatePresence>
                    {workerForm.workerType === 'team' && (
                      <motion.div 
                        className="team-range-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="team-range-label">
                          <Wrench size={14} className="text-orange" />
                          Team Size Range
                        </span>
                        <div className="team-range-grid">
                          {['1-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30+'].map(range => (
                            <button
                              key={range}
                              type="button"
                              className={`team-range-pill ${workerForm.teamRange === range ? 'selected' : ''}`}
                              onClick={() => setWorkerForm(prev => ({ ...prev, teamRange: range }))}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                  {/* Label row with AI button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Professional About / Bio</label>
                    <motion.button
                      type="button"
                      onClick={handleAIBio}
                      disabled={aiBioLoading}
                      whileHover={aiBioLoading ? {} : { scale: 1.06 }}
                      whileTap={aiBioLoading ? {} : { scale: 0.94 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.38rem',
                        padding: '0.38rem 0.95rem',
                        borderRadius: '999px',
                        background: aiBioLoading
                          ? 'var(--bg-primary)'
                          : 'linear-gradient(135deg, #f59e0b, var(--orange-500), var(--teal-500))',
                        backgroundSize: '200% 200%',
                        border: 'none',
                        color: aiBioLoading ? 'var(--text-muted)' : '#fff',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: aiBioLoading ? 'wait' : 'pointer',
                        boxShadow: aiBioLoading ? 'none' : '0 3px 14px rgba(232,114,42,0.4)',
                        letterSpacing: '0.2px',
                        transition: 'all 0.25s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {aiBioLoading ? (
                        <><RefreshCw size={12} style={{ animation: 'spin 0.9s linear infinite' }} /> Writing...</>
                      ) : (workerForm.about) ? (
                        <><Sparkles size={12} /> ✨ Polish with AI</>
                      ) : (
                        <><Sparkles size={12} /> ✨ Generate with AI</>
                      )}
                    </motion.button>
                  </div>

                  {/* Textarea with loading overlay */}
                  <div style={{ position: 'relative' }}>
                    <textarea
                      name="about"
                      className="form-control"
                      value={workerForm.about}
                      onChange={handleWorkerChange}
                      placeholder="Introduce yourself to potential employers, describe your tools, background and specializations..."
                      rows={4}
                      style={{
                        opacity: aiBioLoading ? 0.35 : 1,
                        transition: 'opacity 0.3s',
                        resize: 'vertical',
                        borderColor: aiBioLoading ? 'var(--orange-500)' : undefined,
                      }}
                    />
                    <AnimatePresence>
                      {aiBioLoading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            borderRadius: 'var(--radius-md)',
                            pointerEvents: 'none',
                          }}
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <Sparkles size={26} color="var(--orange-500)" />
                          </motion.div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--orange-500)', letterSpacing: '0.3px' }}>
                            AI is crafting your bio...
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Contextual helper hint */}
                  <p style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '0.4rem', marginBottom: 0, lineHeight: 1.5 }}>
                    💡 {workerForm.about
                      ? 'AI will refine your text into professional, employer-ready language.'
                      : 'Select your skills & experience above, then click "Generate with AI" to auto-fill your bio.'}
                  </p>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', marginBottom: '0.8rem' }}>
                    Accepted Payment Methods
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 650 }}>
                      <input 
                        type="checkbox" 
                        checked={workerForm.acceptedPaymentMethods?.includes('cash')} 
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setWorkerForm(prev => {
                            const methods = checked 
                              ? [...(prev.acceptedPaymentMethods || []), 'cash'] 
                              : (prev.acceptedPaymentMethods || []).filter(m => m !== 'cash');
                            return { ...prev, acceptedPaymentMethods: methods };
                          });
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      💵 Cash on Completion
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 650 }}>
                      <input 
                        type="checkbox" 
                        checked={workerForm.acceptedPaymentMethods?.includes('upi')} 
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setWorkerForm(prev => {
                            const methods = checked 
                              ? [...(prev.acceptedPaymentMethods || []), 'upi'] 
                              : (prev.acceptedPaymentMethods || []).filter(m => m !== 'upi');
                            return { ...prev, acceptedPaymentMethods: methods };
                          });
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      📱 UPI Payment
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 650 }}>
                      <input 
                        type="checkbox" 
                        checked={workerForm.acceptedPaymentMethods?.includes('bank')} 
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setWorkerForm(prev => {
                            const methods = checked 
                              ? [...(prev.acceptedPaymentMethods || []), 'bank'] 
                              : (prev.acceptedPaymentMethods || []).filter(m => m !== 'bank');
                            return { ...prev, acceptedPaymentMethods: methods };
                          });
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      🏦 Bank Transfer / IMPS / NEFT
                    </label>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <motion.button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={workerLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ width: '100%', maxWidth: '260px', gap: '0.6rem' }}
                  >
                    <Save size={18} />
                    {workerLoading ? 'Publishing Profile...' : 'Publish Service Profile'}
                  </motion.button>
                </div>

              </form>
            </div>
          </div>
        ) : (
          /* ========================================================
              2. ORIGINAL CUSTOMER JOB REQUIREMENT POST FORM
              ======================================================== */
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-body">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Post a requirement</h2>

              {error && (
                <div
                  style={{
                    background: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" className="form-control" value={form.category} onChange={handleChange}>
                      <option>Plumbing</option>
                      <option>Electrical</option>
                      <option>Carpentry</option>
                      <option>Painting</option>
                      <option>Masonry</option>
                      <option>Loading</option>
                      <option>Cleaning</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date & Time</label>
                    <input type="datetime-local" name="scheduledDate" className="form-control" value={form.scheduledDate} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">City / State</label>
                  <LocationSelector
                    stateValue={selectedState}
                    cityValue={selectedCity}
                    onStateChange={setSelectedState}
                    onCityChange={setSelectedCity}
                  />
                </div>

                {/* Service Category Select */}
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Service Category</label>
                  <select className="form-control" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); }}>
                    <option value="">Select Service Category</option>
                    {Object.keys(SERVICE_CATEGORIES).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>

                {/* Sub Category Select */}
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Sub Category</label>
                  <select className="form-control" value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} disabled={!selectedCategory}>
                    <option value="">Select Sub Category</option>
                    {selectedCategory && SERVICE_CATEGORIES[selectedCategory].map(sub => (<option key={sub} value={sub}>{sub}</option>))}
                  </select>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Area</label>
                  <input type="text" name="area" className="form-control" placeholder="Enter your area" value={form.area} onChange={handleChange} />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    placeholder="Describe your work in detail"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Payment Mode</label>
                    <select name="paymentMode" className="form-control" value={form.paymentMode} onChange={handleChange}>
                      <option value="cash">💵 Cash on completion</option>
                      <option value="upi">📱 UPI Payment</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget (₹)</label>
                    <input type="number" name="price" className="form-control" placeholder="e.g. 500" value={form.price} onChange={handleChange} />
                  </div>
                </div>

                {/* Workforce Type Selection - Premium Cards */}
                <div className="workforce-section">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Workforce Type Requirement
                  </label>
                  <div className="workforce-grid">
                    <div 
                      className={`workforce-card ${form.workerType === 'individual' ? 'selected' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, workerType: 'individual', teamRange: '' }))}
                    >
                      <div className="workforce-card-icon">
                        <Briefcase size={20} />
                      </div>
                      <span className="workforce-card-title">Individual Workforce</span>
                      <p className="workforce-card-desc">Single dedicated worker for standard or personal tasks.</p>
                    </div>

                    <div 
                      className={`workforce-card ${form.workerType === 'team' ? 'selected' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, workerType: 'team', teamRange: '1-5' }))}
                    >
                      <div className="workforce-card-icon">
                        <Sparkles size={20} />
                      </div>
                      <span className="workforce-card-title">Team Workforce</span>
                      <p className="workforce-card-desc">Coordinated group of workers for larger/complex projects.</p>
                    </div>
                  </div>

                  {/* Team Range Selector - Dynamic transition with framer-motion */}
                  <AnimatePresence>
                    {form.workerType === 'team' && (
                      <motion.div 
                        className="team-range-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="team-range-label">
                          <Wrench size={14} className="text-orange" />
                          Required Team Size Range
                        </span>
                        <div className="team-range-grid">
                          {['1-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30+'].map(range => (
                            <button
                              key={range}
                              type="button"
                              className={`team-range-pill ${form.teamRange === range ? 'selected' : ''}`}
                              onClick={() => setForm(prev => ({ ...prev, teamRange: range }))}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {form.paymentMode === 'upi' && (
                  <div className="form-group" style={{ animation: 'fadeIn 0.3s ease', marginTop: '1rem' }}>
                    <label className="form-label">UPI Transaction ID / Reference</label>
                    <input type="text" name="upiId" className="form-control" placeholder="e.g. 123456789012 or txn_abc123" value={form.upiId} onChange={handleChange} />
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--orange-500)' }}>📲 Pay via UPI</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        Open your UPI app (GPay, PhonePe, Paytm, etc.) → Send payment → Paste the transaction ID above after paying.
                      </p>
                    </div>
                  </div>
                )}

                <motion.button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  style={{ marginTop: '1.5rem' }}
                >
                  {loading ? 'Publishing...' : <><Send size={18} /> Publish Job Request</>}
                </motion.button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            3. POSTED JOBS HISTORY (ONLY VISIBLE TO CUSTOMERS)
            ======================================================== */}
        {!isWorker && (
          <>
            <div className="section-header">
              <h2 className="section-title">Your posted jobs</h2>
              <button className="btn btn-ghost" onClick={fetchBookings}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            {posted.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>No jobs posted yet. Fill in the form above to get started!</p>
              </div>
            ) : (
              posted.map((job, i) => (
                <motion.div
                  key={job._id}
                  className="booking-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="booking-title">{job.category}</div>
                  <div className="booking-details">
                    {job.city}, {job.area} •{' '}
                    <span
                      className={`badge ${job.status === 'completed' ? 'badge-success' : job.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}
                    >
                      {job.status}
                    </span>{' '}
                    • {job.paymentMode === 'upi' ? '📱 UPI' : job.paymentMode === 'online' ? '💳 Online' : job.paymentMode === 'bank' ? '🏦 Bank' : '💵 Cash'} • ₹{job.price}
                  </div>
                  {job.description && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{job.description}</p>
                  )}
                </motion.div>
              ))
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PostJob;
