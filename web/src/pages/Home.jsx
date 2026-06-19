import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Book, Zap, Shield, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css';

export default function Home({ user }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  const [activeTab, setActiveTab] = useState('overview');

  const username = currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>Welcome to NexusGuard, {username}!</h1>
        <p>Your comprehensive fraud and scam detection platform</p>
      </div>

      <div className="home-content">
        {/* Quick Stats */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">🛡️</div>
            <h3>Protected</h3>
            <p>You're now protected against fraud and scams</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <h3>Verified</h3>
            <p>All our security features are verified and tested</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚀</div>
            <h3>Real-Time</h3>
            <p>Instant analysis as you browse and communicate</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤝</div>
            <h3>Community</h3>
            <p>Join thousands protecting each other from threats</p>
          </div>
        </section>

        {/* Get Started Section */}
        <section className="getting-started">
          <div className="section-header">
            <h2>Get Started in 3 Steps</h2>
            <p>Set up your security suite in minutes</p>
          </div>

          <div className="steps-grid">
            <div className="setup-step">
              <div className="step-num">1</div>
              <h3>Enable Protections</h3>
              <p>Set up the features you want to use: URL Scanner, Phone Validator, Password Checker, Voice Analysis, or Browser Extension</p>
              <button className="step-btn">Learn More</button>
            </div>

            <div className="setup-step">
              <div className="step-num">2</div>
              <h3>Customize Settings</h3>
              <p>Adjust alert thresholds and preferences to match your security needs</p>
              <button className="step-btn">Go to Settings</button>
            </div>

            <div className="setup-step">
              <div className="step-num">3</div>
              <h3>Start Scanning</h3>
              <p>Begin analyzing URLs, phone numbers, passwords, and voice calls for threats</p>
              <button className="step-btn">Start Now</button>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="features-overview">
          <div className="section-header">
            <h2>Your Security Toolkit</h2>
            <p>Everything you need to stay safe online</p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">🔗</div>
              <div className="feature-text">
                <h3>URL Scanner</h3>
                <p>Check if links are malicious before clicking them. Scan URLs in real-time with our multi-layer threat detection system.</p>
              </div>
              <button className="feature-btn">
                Try Now <ArrowRight size={16} />
              </button>
            </div>

            <div className="feature-item">
              <div className="feature-icon">📞</div>
              <div className="feature-text">
                <h3>Phone Number Validator</h3>
                <p>Identify spam and scam phone numbers before answering. International support for 100+ countries including Brazil.</p>
              </div>
              <button className="feature-btn">
                Try Now <ArrowRight size={16} />
              </button>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🔐</div>
              <div className="feature-text">
                <h3>Password Breach Checker</h3>
                <p>Check if your passwords have been compromised in known data breaches. Get strength analysis and recommendations.</p>
              </div>
              <button className="feature-btn">
                Try Now <ArrowRight size={16} />
              </button>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🎙️</div>
              <div className="feature-text">
                <h3>Voice Call Analysis</h3>
                <p>Analyze phone call transcripts for scam language and deepfake indicators. Protect yourself from voice-based fraud.</p>
              </div>
              <button className="feature-btn">
                Try Now <ArrowRight size={16} />
              </button>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🤝</div>
              <div className="feature-text">
                <h3>Community Reports</h3>
                <p>View and contribute to community threat reports. Help protect others by reporting scams and fraud attempts.</p>
              </div>
              <button className="feature-btn">
                Try Now <ArrowRight size={16} />
              </button>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🌐</div>
              <div className="feature-text">
                <h3>Browser Extension</h3>
                <p>Get real-time link protection across all websites. Automatic badge injection for suspicious URLs.</p>
              </div>
              <button className="feature-btn">
                Install Now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Learning Resources */}
        <section className="learning-section">
          <div className="section-header">
            <h2>Learn & Understand</h2>
            <p>Master NexusGuard and stay safe online</p>
          </div>

          <div className="resource-cards">
            <div className="resource-card">
              <div className="resource-icon">
                <Book size={32} />
              </div>
              <h3>Where to Start</h3>
              <p>New to NexusGuard? Get a guided tour of all features and learn the basics.</p>
              <button className="resource-btn" onClick={() => navigate('/where-to-start')}>
                Read Guide <ArrowRight size={16} />
              </button>
            </div>

            <div className="resource-card">
              <div className="resource-icon">
                <Zap size={32} />
              </div>
              <h3>How-To Guides</h3>
              <p>Step-by-step instructions for each feature and common tasks.</p>
              <button className="resource-btn" onClick={() => navigate('/how-to')}>
                View Guides <ArrowRight size={16} />
              </button>
            </div>

            <div className="resource-card">
              <div className="resource-icon">
                <Shield size={32} />
              </div>
              <h3>Security Tips</h3>
              <p>Best practices for staying safe from scams, fraud, and cyber threats.</p>
              <button className="resource-btn">
                Learn Tips <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="tips-section">
          <div className="section-header">
            <h2>Daily Security Tips</h2>
          </div>

          <div className="tips-carousel">
            <div className="tip-card">
              <h4>🎯 Phishing Alert</h4>
              <p>Never click links or download attachments from unsolicited emails. Use our URL Scanner to verify links first.</p>
            </div>

            <div className="tip-card">
              <h4>📱 Phone Safety</h4>
              <p>Use our Phone Validator to check unfamiliar numbers before answering calls from unknown callers.</p>
            </div>

            <div className="tip-card">
              <h4>🔐 Password Security</h4>
              <p>Regularly check your passwords with our Password Breach Checker and use unique passwords for each account.</p>
            </div>

            <div className="tip-card">
              <h4>🎙️ Voice Threats</h4>
              <p>Be wary of urgent requests for personal information. Use Voice Analysis to detect deepfakes and scam language.</p>
            </div>
          </div>
        </section>

        {/* Action Items */}
        <section className="action-section">
          <div className="action-card primary">
            <h3>First Time Here?</h3>
            <p>Follow our guided tour to understand all features</p>
            <button className="action-btn">Start Tour</button>
          </div>

          <div className="action-card">
            <h3>Need Help?</h3>
            <p>Check our documentation or contact support</p>
            <button className="action-btn">Get Help</button>
          </div>
        </section>
      </div>
    </div>
  );
}
