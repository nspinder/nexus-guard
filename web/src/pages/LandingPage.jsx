import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, ArrowRight, Menu, X } from 'lucide-react';
import '../styles/LandingPage.css';

export default function LandingPage({ onNavigate, onLogin }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'pricing':
        return <PricingPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <Shield className="brand-icon" />
            <span>NexusGuard</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation Links */}
          <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <button
              onClick={() => handleNavigate('home')}
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate('about')}
              className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
            >
              About
            </button>
            <button
              onClick={() => handleNavigate('pricing')}
              className={`nav-link ${currentPage === 'pricing' ? 'active' : ''}`}
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavigate('contact')}
              className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
            >
              Contact
            </button>
            <button onClick={handleLogin} className="nav-login">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="landing-content">{renderPage()}</main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>NexusGuard</h4>
            <p>Protecting you from scams and fraud, 24/7.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <button onClick={() => handleNavigate('home')}>Home</button>
              </li>
              <li>
                <button onClick={() => handleNavigate('about')}>About</button>
              </li>
              <li>
                <button onClick={() => handleNavigate('pricing')}>Pricing</button>
              </li>
              <li>
                <button onClick={() => handleNavigate('contact')}>Contact</button>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>
                <a href="mailto:support@nexusguard.com">Email Support</a>
              </li>
              <li>
                <a href="#">Documentation</a>
              </li>
              <li>
                <a href="#">FAQ</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 NexusGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function HomePage({ onNavigate }) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Stay Protected From Scams & Fraud</h1>
          <p>NexusGuard analyzes emails, messages, calls, and links in real-time to detect and warn you about threats before you fall victim.</p>
          <button className="cta-button">
            Get Started Free <ArrowRight size={20} />
          </button>
        </div>
        <div className="hero-image">
          <div className="hero-visual">
            <Shield size={120} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Comprehensive Protection</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>URL Scanner</h3>
            <p>Instantly check if links are malicious before clicking</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3>Phone Validator</h3>
            <p>Identify spam and scam phone numbers</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Password Checker</h3>
            <p>Check if your passwords have been compromised</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎙️</div>
            <h3>Voice Analysis</h3>
            <p>Detect deepfakes and scam language in phone calls</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Community Reports</h3>
            <p>Help protect others by reporting threats</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Browser Extension</h3>
            <p>Real-time protection across all websites</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your NexusGuard account in seconds</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Connect</h3>
            <p>Enable our tools for real-time protection</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Stay Safe</h3>
            <p>Get alerts before threats can harm you</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>Trusted by Thousands</h2>
        <div className="testimonials-grid">
          <div className="testimonial">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>"NexusGuard saved me from a phishing attempt. Highly recommended!"</p>
            <strong>- Sarah M.</strong>
          </div>
          <div className="testimonial">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>"Best investment I made for my family's cybersecurity."</p>
            <strong>- James T.</strong>
          </div>
          <div className="testimonial">
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p>"The voice call analysis caught a deepfake scam. Incredible!"</p>
            <strong>- Maria R.</strong>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <h2>Ready to Protect Yourself?</h2>
        <p>Join thousands of users who are staying safe with NexusGuard</p>
        <button className="cta-button-large">Start Free Trial Today</button>
      </section>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About NexusGuard</h1>
        <p>Protecting people from fraud, one scan at a time</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            NexusGuard is dedicated to protecting individuals and businesses from scams, fraud, and cyber threats. We believe everyone deserves access to advanced security tools to stay safe online.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Do</h2>
          <p>
            We provide real-time analysis of emails, messages, phone calls, and URLs to detect scams before they can harm you. Our AI-powered platform uses multiple threat intelligence sources to identify:
          </p>
          <ul>
            <li>Phishing attempts and fraudulent emails</li>
            <li>Malicious and suspicious URLs</li>
            <li>Spam and scam phone numbers</li>
            <li>Compromised passwords</li>
            <li>Deepfake and synthetic voice attacks</li>
            <li>Suspicious communication patterns</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Why NexusGuard?</h2>
          <div className="why-grid">
            <div className="why-card">
              <h3>🚀 Advanced AI</h3>
              <p>Uses Claude AI and multiple threat intelligence APIs for accuracy</p>
            </div>
            <div className="why-card">
              <h3>🛡️ Multi-Layer Protection</h3>
              <p>Analyzes content from multiple angles for comprehensive security</p>
            </div>
            <div className="why-card">
              <h3>🤝 Community Powered</h3>
              <p>Community reports help identify new threats faster</p>
            </div>
            <div className="why-card">
              <h3>⚡ Real-Time</h3>
              <p>Instant analysis before threats can reach you</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Commitment</h2>
          <p>
            We're committed to continuous improvement and staying ahead of emerging threats. Your security is our top priority, and we invest heavily in research and development to keep our protection cutting-edge.
          </p>
        </section>
      </div>
    </div>
  );
}

function PricingPage() {
  return (
    <div className="pricing-page">
      <div className="page-header">
        <h1>Simple, Transparent Pricing</h1>
        <p>Choose the plan that fits your needs</p>
      </div>

      <div className="pricing-grid">
        <div className="pricing-card">
          <div className="pricing-header">
            <h3>Free</h3>
            <p className="price">$0<span>/month</span></p>
          </div>
          <div className="pricing-features">
            <p>✓ URL Scanner (10/month)</p>
            <p>✓ Phone Number Validator (5/month)</p>
            <p>✓ Password Checker (3/month)</p>
            <p>✓ Community Reports (Read-only)</p>
            <p>✗ Voice Call Analysis</p>
            <p>✗ Browser Extension</p>
          </div>
          <button className="pricing-btn">Get Started</button>
        </div>

        <div className="pricing-card featured">
          <div className="pricing-badge">POPULAR</div>
          <div className="pricing-header">
            <h3>Pro</h3>
            <p className="price">$9.99<span>/month</span></p>
          </div>
          <div className="pricing-features">
            <p>✓ Unlimited URL Scanning</p>
            <p>✓ Unlimited Phone Validation</p>
            <p>✓ Unlimited Password Checks</p>
            <p>✓ Community Reports (Full Access)</p>
            <p>✓ Voice Call Analysis</p>
            <p>✓ Browser Extension</p>
          </div>
          <button className="pricing-btn primary">Start Free Trial</button>
        </div>

        <div className="pricing-card">
          <div className="pricing-header">
            <h3>Business</h3>
            <p className="price">$49.99<span>/month</span></p>
          </div>
          <div className="pricing-features">
            <p>✓ Everything in Pro</p>
            <p>✓ Team Management (5 users)</p>
            <p>✓ Advanced Analytics</p>
            <p>✓ Priority Support</p>
            <p>✓ Custom Integration</p>
            <p>✓ API Access</p>
          </div>
          <button className="pricing-btn">Contact Sales</button>
        </div>
      </div>

      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h4>Can I cancel anytime?</h4>
          <p>Yes, cancel your subscription anytime with no penalties. Your account remains active until the end of your billing period.</p>
        </div>
        <div className="faq-item">
          <h4>Is there a free trial?</h4>
          <p>Yes! Pro and Business plans include a 14-day free trial. No credit card required to get started.</p>
        </div>
        <div className="faq-item">
          <h4>What payment methods do you accept?</h4>
          <p>We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
        </div>
      </div>
    </div>
  );
}

function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', subject: '', message: '' });
    alert('Thank you for your message. We will get back to you soon!');
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you. Send us a message!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <h3>📧 Email</h3>
            <p>support@nexusguard.com</p>
            <small>We respond within 24 hours</small>
          </div>
          <div className="info-card">
            <h3>💬 Live Chat</h3>
            <p>Available 24/7 on our platform</p>
            <small>Sign in to access live support</small>
          </div>
          <div className="info-card">
            <h3>📱 Phone</h3>
            <p>+1 (555) 123-4567</p>
            <small>Monday-Friday, 9AM-5PM EST</small>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows="6"
              required
            />
          </div>
          <button type="submit" className="submit-btn">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
