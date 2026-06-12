import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Youtube,
  ShieldCheck, CreditCard, Headphones, ThumbsUp, ArrowUp, Apple, Play, ArrowRight
} from 'lucide-react';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${newsletterEmail}`);
    setNewsletterEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      {/* ===== MAIN FOOTER COLUMNS ===== */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">

            {/* --- Brand / Contact Column --- */}
            <div className="footer-brand-col">
              {/* Logo */}
              <div className="footer-logo">
                <div className="footer-logo-icon">S</div>
                <span className="footer-logo-text">
                  Shramik<span className="footer-logo-dot">.</span>Connect
                </span>
              </div>
              <p className="footer-tagline">
                India's most trusted on-demand labour platform — connecting
                skilled workers with people who need them, fast and fair.
              </p>

              {/* Contact details */}
              <ul className="footer-contact-list">
                <li>
                  <MapPin size={15} className="footer-contact-icon" />
                  <span>4th Floor, Workman Tower,<br /> Mahagama, Godda, JHARKHAND, 814154 </span>
                </li>
                <li>
                  <Phone size={15} className="footer-contact-icon" />
                  <a href="tel:+911800123456">+91 1800-123-456</a>
                </li>
                <li>
                  <Mail size={15} className="footer-contact-icon" />
                  <a href="mailto:hello@shramikconnect.in">hello@shramikconnect.in</a>
                </li>
              </ul>
            </div>

            {/* --- Services Column --- */}
            <div className="footer-links-col">
              <h4 className="footer-col-heading">
                <span className="footer-col-accent">▶</span> Services
              </h4>
              <ul className="footer-link-list">
                <li><Link to="/find">Book a Labourer</Link></li>
                <li><Link to="/post">Post a Job</Link></li>
                <li><Link to="/bookings">Track Booking</Link></li>
                <li><Link to="/find">Pricing</Link></li>
                <li><Link to="/">How it works</Link></li>
              </ul>
            </div>

            {/* --- Company Column --- */}
            <div className="footer-links-col">
              <h4 className="footer-col-heading">
                <span className="footer-col-accent">▶</span> Company
              </h4>
              <ul className="footer-link-list">
                <li><a href="#about">About</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#press">Press</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#partners">Partners</a></li>
              </ul>
            </div>

            {/* --- Support Column --- */}
            <div className="footer-links-col">
              <h4 className="footer-col-heading">
                <span className="footer-col-accent">▶</span> Support
              </h4>
              <ul className="footer-link-list">
                <li><a href="#help">Help Center</a></li>
                <li><a href="#safety">Safety</a></li>
                <li><a href="#terms">Terms</a></li>
                <li><a href="#privacy">Privacy</a></li>
                <li><a href="#refund">Refund</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ===== NEWSLETTER ROW ===== */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="footer-newsletter-inner">
            <div className="footer-newsletter-left">
              <h4 className="footer-col-heading">
                <span className="footer-col-accent">▶</span> Newsletter
              </h4>
              <h3 className="footer-newsletter-title">Stay updated with jobs, tips & offers.</h3>
              <p className="footer-newsletter-subtitle">
                Get weekly insights on hiring trends, worker spotlights, and exclusive customer discounts. No spam — ever.
              </p>
            </div>
            <div className="footer-newsletter-right">
              <form onSubmit={handleNewsletterSubmit} className="footer-newsletter-form">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="footer-newsletter-input"
                />
                <button type="submit" className="footer-newsletter-btn">
                  Subscribe <ArrowRight size={16} />
                </button>
              </form>
              <p className="footer-newsletter-policy">
                BY SUBSCRIBING, YOU AGREE TO OUR PRIVACY POLICY.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== APP STORE + TRUST BADGES ROW ===== */}
      <div className="footer-badges-row">
        <div className="container">
          <div className="footer-badges-inner">

            {/* App Store buttons */}
            <div className="footer-store-wrapper">
              <a href="#appstore" className="footer-store-btn" aria-label="Download on App Store">
                <Apple size={22} />
                <div className="footer-store-text">
                  <span className="footer-store-sub">DOWNLOAD ON THE</span>
                  <span className="footer-store-main">App Store</span>
                </div>
              </a>
              <span className="store-coming-soon">(coming soon)</span>
            </div>
            <div className="footer-store-wrapper">
              <a href="#playstore" className="footer-store-btn" aria-label="Get it on Google Play">
                <Play size={20} />
                <div className="footer-store-text">
                  <span className="footer-store-sub">GET IT ON</span>
                  <span className="footer-store-main">Google Play</span>
                </div>
              </a>
              <span className="store-coming-soon">(coming soon)</span>
            </div>

            {/* Trust badges */}
            <div className="footer-trust-badge">
              <ShieldCheck size={22} className="footer-trust-icon" />
              <span>VERIFIED<br />WORKERS</span>
            </div>
            <div className="footer-trust-badge">
              <CreditCard size={22} className="footer-trust-icon" />
              <span>SECURE PAYMENTS</span>
            </div>
            <div className="footer-trust-badge">
              <Headphones size={22} className="footer-trust-icon" />
              <span>24/7 SUPPORT</span>
            </div>
            <div className="footer-trust-badge">
              <ThumbsUp size={22} className="footer-trust-icon" />
              <span>SATISFACTION<br />GUARANTEE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PAYMENT + LANGUAGE ROW ===== */}
      <div className="footer-payments-row">
        <div className="container">
          <div className="footer-payments-inner">
            <div className="footer-payments-left">
              <span className="footer-payments-label">WE ACCEPT:</span>
              {['VISA', 'MC', 'RUPAY', 'UPI', 'PAYTM', 'GPAY'].map((method) => (
                <span key={method} className="footer-payment-chip">{method}</span>
              ))}
            </div>
            <button className="footer-language-btn" aria-label="Select language">
              🌐 English (India) ▾
            </button>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            {/* Copyright */}
            <p className="footer-copyright">
              © 2026 Shramik Connect Pvt. Ltd. All rights reserved.
            </p>

            {/* Social icons */}
            <div className="footer-socials">
              <a href="#facebook" aria-label="Facebook" className="footer-social-link"><Facebook size={18} /></a>
              <a href="#instagram" aria-label="Instagram" className="footer-social-link"><Instagram size={18} /></a>
              <a href="#twitter" aria-label="Twitter" className="footer-social-link"><Twitter size={18} /></a>
              <a href="#linkedin" aria-label="LinkedIn" className="footer-social-link"><Linkedin size={18} /></a>
              <a href="#youtube" aria-label="YouTube" className="footer-social-link"><Youtube size={18} /></a>
            </div>

            {/* Credit */}
            <p className="footer-credit">
              Developed with ❤️ by <strong>Dev Dynasty Team</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ===== GO TO TOP BUTTON ===== */}
      <button
        className="footer-go-top"
        onClick={scrollToTop}
        aria-label="Go to top"
        id="go-to-top-btn"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  );
};

export default Footer;
