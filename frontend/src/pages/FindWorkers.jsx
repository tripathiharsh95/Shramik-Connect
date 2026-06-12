import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Star, MapPin, Briefcase, ShieldCheck, Map as MapIcon, List, Clock, BookOpen, User as UserIcon, Users, Layers, Wallet, Smartphone, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWorkers } from '../services/api';
import LocationSelector from '../components/LocationSelector';
import Avatar from '../components/Avatar';

// Map functionality removed per user request
// Service categories data
export const SERVICE_CATEGORIES = {
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

const WORKFORCE_OPTIONS = [
  { key: 'individual', label: 'Individual Workforce', icon: UserIcon, emoji: '👤' },
  { key: 'team', label: 'Team Workforce', icon: Users, emoji: '👥' },
  { key: 'both', label: 'Both', icon: Layers, emoji: '🔗' },
];

const FindWorkers = () => {
  const { isAuthenticated, user, refreshLocation } = useAuth();
  const navigate = useNavigate();

  // Trigger location refresh on component mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshLocation();
    }
  }, [isAuthenticated]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [search, setSearch] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [workforceType, setWorkforceType] = useState('both');



  // Fetch workers whenever filters change (city, state, search)
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const params = {};
        // Include location filters if set
        if (selectedCity) params.city = selectedCity;
        if (selectedState) params.state = selectedState;
        if (search) params.search = search;
        // Include category filters only when both category and sub-category are selected
        if (selectedCategory) {
          params.category = selectedCategory;
          if (selectedSubCategory) {
            params.subCategory = selectedSubCategory;
          }
        }
        if (workforceType && workforceType !== 'both') {
          params.workerType = workforceType;
        }
        const res = await getWorkers(params);
        setWorkers(res.data.data.workers);
      } catch (err) {
        console.error('Failed to fetch workers:', err);
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchWorkers, 300);
    return () => clearTimeout(debounce);
  }, [selectedCity, selectedState, search, selectedCategory, selectedSubCategory, workforceType]);

  return (
    <div className="container page-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="section-title" style={{ marginRight: '0.5rem' }}>Find Workers</h2>

          {/* ── Workforce Type Toggle ── */}
          <div className="workforce-toggle-container">
            {WORKFORCE_OPTIONS.map(opt => {
              const isActive = workforceType === opt.key;
              const Icon = opt.icon;
              return (
                <motion.button
                  key={opt.key}
                  type="button"
                  className={`workforce-toggle-pill${isActive ? ' active' : ''}`}
                  onClick={() => setWorkforceType(opt.key)}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  {isActive && (
                    <motion.span
                      className="workforce-pill-bg"
                      layoutId="workforcePillBg"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="workforce-pill-content">
                    <Icon size={14} strokeWidth={2.4} />
                    <span>{opt.label}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{workers.length} available</span>
          </div>
        </div>

        <div className="search-bar">
          <div style={{ position: 'relative' }}>
            <SearchIcon size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-20%)', color: 'var(--text-muted)' }} />
            <input className="form-control" placeholder="Search name or skill..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>
          <LocationSelector
            stateValue={selectedState}
            cityValue={selectedCity}
            onStateChange={setSelectedState}
            onCityChange={setSelectedCity}
          />
          <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedState(''); setSelectedCity(''); setSearch(''); setSelectedCategory(''); setSelectedSubCategory(''); }}>Reset</button>
          <select className="form-control" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setSelectedSubCategory(''); }}>
            <option value="">Select Service Category</option>
            {Object.keys(SERVICE_CATEGORIES).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
          <select className="form-control" value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} disabled={!selectedCategory}>
            <option value="">Select Sub Category</option>
            {selectedCategory && SERVICE_CATEGORIES[selectedCategory].map(sub => (<option key={sub} value={sub}>{sub}</option>))}
          </select>
        </div>


      </motion.div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading workers...</p></div>
      ) : (
        <>

          <div className="workers-grid">
            {workers.map((worker, i) => {
              const professionStr = worker.profession || 'General Labour';
              const parts = professionStr.split(' - ');
              const jobCategory = parts[0].trim();
              const workInfo = parts.slice(1).join(' - ').trim();

              return (
                <motion.div 
                  key={worker._id} 
                  className="premium-worker-card"
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ 
                    y: -8, 
                    rotateX: 4, 
                    rotateY: -4, 
                    scale: 1.015,
                    boxShadow: '0 20px 40px rgba(10, 61, 79, 0.16)'
                  }}
                >
                  {/* Header */}
                  <div className="premium-worker-card-header">
                    <Avatar user={worker} size="lg" border={true} showBadge={true} />
                    <div className="premium-worker-header-info">
                      <div className="premium-worker-name-row">
                        <span className="premium-worker-name">{worker.name}</span>
                        {worker.isVerified && (
                          <span className="badge badge-verified" style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>
                            <ShieldCheck size={11} /> Verified
                          </span>
                        )}
                      </div>
                      <div className="premium-worker-profession-container">
                        <div className="premium-worker-profession-tag">
                          {jobCategory}
                        </div>
                        {workInfo && (
                          <div className="premium-worker-profession-info">
                            {workInfo}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                        <div className="premium-worker-availability" style={{ margin: 0 }}>
                          <span className={`pulse-dot ${worker.isAvailable ? '' : 'busy'}`}></span>
                          {worker.isAvailable ? 'Available' : 'Busy'}
                        </div>
                        {worker.workerType && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: worker.workerType === 'team'
                              ? 'linear-gradient(135deg, rgba(245, 158, 66, 0.2), rgba(232, 114, 42, 0.05))'
                              : 'linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(36, 138, 157, 0.05))',
                            border: worker.workerType === 'team'
                              ? '1px solid rgba(245, 158, 66, 0.35)'
                              : '1px solid rgba(34, 211, 238, 0.35)',
                            color: worker.workerType === 'team'
                              ? 'var(--orange-300)'
                              : '#22d3ee',
                            boxShadow: worker.workerType === 'team'
                              ? '0 2px 10px rgba(245, 158, 66, 0.1)'
                              : '0 2px 10px rgba(34, 211, 238, 0.1)',
                            backdropFilter: 'blur(4px)',
                            transition: 'all 0.3s ease'
                          }}>
                            <span style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '14px', 
                              height: '14px', 
                              borderRadius: '50%', 
                              background: worker.workerType === 'team' ? 'rgba(245, 158, 66, 0.25)' : 'rgba(34, 211, 238, 0.25)',
                              marginRight: '0.05rem'
                            }}>
                              {worker.workerType === 'team' ? <Users size={8} /> : <UserIcon size={8} />}
                            </span>
                            <span>{worker.workerType === 'team' ? `Team (${worker.teamRange || '1-5'})` : 'Individual'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating and Quick Stats */}
                  <div className="premium-worker-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <span className="premium-worker-stat-item">
                      <Star size={12} fill="var(--warning)" color="var(--warning)" /> {worker.rating} Rating
                    </span>
                    <span className="premium-worker-stat-item">
                      <Briefcase size={12} /> {worker.jobsCompleted} Jobs Done
                    </span>
                  </div>

                  {/* Profile Details Grid */}
                  <div className="premium-worker-details-grid">
                    <div className="premium-worker-detail-box" title={`Gender: ${worker.gender || 'Not Specified'}`}>
                      <UserIcon size={13} className="premium-worker-detail-icon" />
                      <span style={{ textTransform: 'capitalize' }}>{worker.gender || 'Not Specified'}</span>
                    </div>
                    <div className="premium-worker-detail-box" title={`Experience: ${worker.experienceYears || 0} Years`}>
                      <Clock size={13} className="premium-worker-detail-icon" />
                      <span>{worker.experienceYears || 0} Yrs Exp</span>
                    </div>
                    <div className="premium-worker-detail-box" title={`Qualification: ${worker.qualification || 'Not Specified'}`}>
                      <BookOpen size={13} className="premium-worker-detail-icon" />
                      <span>{worker.qualification || 'Not Specified'}</span>
                    </div>
                    <div className="premium-worker-detail-box location-box" title={`Location: ${worker.area ? `${worker.area}, ` : ''}${worker.city}${worker.state ? `, ${worker.state}` : ''}`}>
                      <MapPin size={13} className="premium-worker-detail-icon" />
                      <span>{worker.area ? `${worker.area}, ` : ''}{worker.city}{worker.state ? `, ${worker.state}` : ''}</span>
                    </div>
                  </div>

                  {/* Bio / About */}
                  <div className="premium-worker-section-container">
                    <div className="premium-worker-section-title">About</div>
                    <div className="premium-worker-bio" title={worker.about || worker.bio || 'Professional worker'}>
                      {worker.about || worker.bio || "Available for high-quality professional labour services."}
                    </div>
                  </div>

                  {/* Skills tags */}
                  {worker.skills && worker.skills.length > 0 && (
                    <div className="premium-worker-section-container">
                      <div className="premium-worker-section-title">Other Skills/ Expertise</div>
                      <div className="premium-worker-skills-list">
                        {worker.skills.slice(0, 5).map(skill => (
                          <span key={skill} className="premium-worker-skill-badge">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer / Pricing & Booking */}
                  <div className="premium-worker-footer">
                    <div className="premium-worker-pricing">
                      <div className="premium-worker-charge-title" style={{ fontSize: worker.workerType === 'team' ? '0.55rem' : '0.7rem' }}>
                        {worker.workerType === 'team' ? 'Charge (per worker)' : 'Charge'}
                      </div>
                      <span className="premium-worker-price">₹{worker.hourlyRate || 0}</span>
                      <span className="premium-worker-price-sub">per {worker.rateType || 'day'}</span>
                    </div>

                    {/* Accepted Payment Methods */}
                    {(() => {
                      const cardPaymentMethods = worker.acceptedPaymentMethods && worker.acceptedPaymentMethods.length > 0
                        ? worker.acceptedPaymentMethods
                        : ['cash'];

                      return (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: '0.2rem',
                          flex: 1,
                          minWidth: 0,
                          margin: '0 0.5rem'
                        }}>
                          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                            Payments
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {cardPaymentMethods.includes('cash') && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontSize: '0.65rem',
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                              }}>
                                <Wallet size={10} style={{ color: 'var(--teal-500)' }} />
                                <span>Cash</span>
                              </div>
                            )}
                            {cardPaymentMethods.includes('upi') && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontSize: '0.65rem',
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                              }}>
                                <Smartphone size={10} style={{ color: 'var(--teal-500)' }} />
                                <span>UPI</span>
                              </div>
                            )}
                            {cardPaymentMethods.includes('bank') && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontSize: '0.65rem',
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                              }}>
                                <Landmark size={10} style={{ color: 'var(--teal-500)' }} />
                                <span>Bank</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <motion.button 
                      className="btn btn-secondary btn-sm" 
                      style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem', fontWeight: '700' }}
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/workers/${worker._id}`)}
                    >
                      View
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {!loading && workers.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>No workers found. Try adjusting your filters or register as a worker!</p>
        </div>
      )}
    </div>
  );
};

export default FindWorkers;
