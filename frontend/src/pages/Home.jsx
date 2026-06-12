import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ShieldCheck, Users, Wrench, Zap, Hammer, Star, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

const Home = () => {
  return (
    <div>
      {/* ===== HERO WITH BACKGROUND IMAGE ===== */}
      <section className="hero-v2">
        <div className="hero-v2-overlay"></div>
        <div className="hero-v2-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }} />
          ))}
        </div>
        <div className="hero-v2-content">
          <motion.div className="hero-v2-badge" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <Star size={14} fill="currentColor" /> Trusted by 10,000+ families
          </motion.div>
          <motion.h1 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            Book trusted workers<br /><span className="hero-v2-highlight">in minutes.</span>
          </motion.h1>
          <motion.p initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45, duration: 0.7 }}>
            Connect instantly with verified, highly-rated professionals for plumbing, electrical, carpentry, construction & more.
          </motion.p>
          <motion.div className="hero-v2-buttons" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}>
            <Link to="/find" className="hero-btn-primary">
              <span>Find Workers</span> <ArrowRight size={18} />
            </Link>
            <Link to="/post" className="hero-btn-secondary">
              <span>Post Job Request</span> <ChevronRight size={18} />
            </Link>
          </motion.div>
          <motion.div className="hero-v2-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }}>
            <div className="hero-stat">
              <span className="hero-stat-value">5,000+</span>
              <span className="hero-stat-label">Workers</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">50,000+</span>
              <span className="hero-stat-label">Jobs Done</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">4.8★</span>
              <span className="hero-stat-label">Avg Rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <div className="container">
        <motion.div className="features-grid" variants={container} initial="hidden" animate="show" style={{ marginTop: '3rem' }}>
          <motion.div className="feature-card" variants={item}>
            <div className="feature-icon"><Clock size={24} /></div>
            <h3 className="feature-title">Quick Dispatch</h3>
            <p className="feature-desc">Book workers by city and area for faster arrival and less waiting.</p>
          </motion.div>
          <motion.div className="feature-card" variants={item}>
            <div className="feature-icon"><ShieldCheck size={24} /></div>
            <h3 className="feature-title">Verified Profiles</h3>
            <p className="feature-desc">Ratings, completed jobs, and expertise details build confidence before booking.</p>
          </motion.div>
          <motion.div className="feature-card" variants={item}>
            <div className="feature-icon"><Users size={24} /></div>
            <h3 className="feature-title">Flexible Hiring</h3>
            <p className="feature-desc">Direct booking or job post mode with cash and online payment options.</p>
          </motion.div>
        </motion.div>

        {/* ===== TRUST SECTION ===== */}
        <motion.div className="trust-section" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} viewport={{ once: true }}>
          <div>
            <div className="trust-label">Peace of Mind</div>
            <h2 className="trust-title">Built for families and working professionals</h2>
            <p className="trust-desc">From urgent repairs to regular household support, Shramik Connect keeps everything organized in one booking timeline.</p>
            <Link to="/find" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
              Browse Workers <ArrowRight size={16} />
            </Link>
          </div>
          <div className="trust-image">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '3rem' }}>
                <motion.div animate={{ rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 4 }}><Wrench size={48} /></motion.div>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}><Zap size={48} /></motion.div>
                <motion.div animate={{ rotate: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 3.5 }}><Hammer size={48} /></motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ===== CATEGORIES ===== */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="section-header">
            <h2 className="section-title">Popular Categories</h2>
            <Link to="/find" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>View all <ChevronRight size={14} /></Link>
          </div>
          <div className="categories-grid">
            {['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Masonry', 'Loading'].map((cat, i) => (
              <Link to="/find" key={cat}>
                <motion.div className="category-card" whileHover={{ scale: 1.06, y: -6 }} whileTap={{ scale: 0.97 }}>
                  <div className="category-emoji">
                    {['🔧', '⚡', '🪚', '🎨', '🧱', '📦'][i]}
                  </div>
                  <div className="category-name">{cat}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
