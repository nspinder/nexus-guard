import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Link, Phone, Lock, Mic, Users } from 'lucide-react';
import '../styles/WhereToStart.css';

export default function WhereToStart() {
  const navigate = useNavigate();

  const routeMap = {
    dashboard: '/dashboard',
    'url-scanner': '/url-scanner',
    'phone-validator': '/phone-validator',
    'password-checker': '/password-checker',
    'how-to': '/how-to',
  };

  const handleNavigate = (route) => {
    navigate(routeMap[route] || '/');
  };

  return (
    <div className="guide-page">
      <div className="guide-header">
        <h1>Where to Start with NexusGuard</h1>
        <p>Your beginner's guide to staying safe online</p>
      </div>

      <div className="guide-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Welcome to Your Security Journey</h2>
          <p>
            NexusGuard is designed to protect you from scams and fraud in real-time. Whether you're checking a suspicious link, verifying a phone number, or analyzing a voice call, we've got you covered. This guide will walk you through everything you need to know.
          </p>
        </section>

        {/* Core Features Overview */}
        <section className="features-intro">
          <h2>Our 6 Core Protection Tools</h2>
          <div className="features-intro-grid">
            <div className="feature-intro-card">
              <div className="feature-intro-icon">🔗</div>
              <h3>URL Scanner</h3>
              <p>Check if links are safe before clicking them. Perfect for emails, messages, and social media.</p>
            </div>
            <div className="feature-intro-card">
              <div className="feature-intro-icon">📞</div>
              <h3>Phone Validator</h3>
              <p>Identify spam and scam phone numbers. Works with international numbers and Brazilian carriers.</p>
            </div>
            <div className="feature-intro-card">
              <div className="feature-intro-icon">🔐</div>
              <h3>Password Checker</h3>
              <p>Check if your passwords have been compromised in data breaches. Get strength analysis too.</p>
            </div>
            <div className="feature-intro-card">
              <div className="feature-intro-icon">🎙️</div>
              <h3>Voice Analysis</h3>
              <p>Analyze phone call transcripts for scam language and deepfake indicators.</p>
            </div>
            <div className="feature-intro-card">
              <div className="feature-intro-icon">🤝</div>
              <h3>Community Reports</h3>
              <p>See what threats others have reported and help protect your community.</p>
            </div>
            <div className="feature-intro-card">
              <div className="feature-intro-icon">🌐</div>
              <h3>Browser Extension</h3>
              <p>Get real-time link protection while browsing the web.</p>
            </div>
          </div>
        </section>

        {/* Quick Start Steps */}
        <section className="quick-start">
          <h2>Quick Start: Your First 5 Minutes</h2>
          <div className="steps-list">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Customize Your Alert Thresholds</h3>
                <p>Go to Dashboard → Settings to set your risk levels. You control what triggers alerts:</p>
                <ul>
                  <li>Low Risk: Green (informational only)</li>
                  <li>Medium Risk: Orange (warning)</li>
                  <li>High Risk: Red (critical alert)</li>
                </ul>
                <button className="learn-btn" onClick={() => handleNavigate('dashboard')}>
                  Go to Dashboard <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Try Your First URL Scan</h3>
                <p>Go to URLs section and paste a link you want to check. You'll get instant results showing:</p>
                <ul>
                  <li>Safety status (Safe, Warning, or Malicious)</li>
                  <li>Threat categories detected</li>
                  <li>Scan details from multiple sources</li>
                </ul>
                <button className="learn-btn" onClick={() => handleNavigate('url-scanner')}>
                  Try URL Scanner <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Check a Phone Number</h3>
                <p>Have a suspicious caller? Go to Phones and enter the number. We'll check if it's:</p>
                <ul>
                  <li>Known spam or scam number</li>
                  <li>Spoofed (fake caller ID)</li>
                  <li>From a legitimate business</li>
                </ul>
                <button className="learn-btn" onClick={() => handleNavigate('phone-validator')}>
                  Try Phone Validator <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Verify Your Passwords</h3>
                <p>Go to Passwords and check if any of your accounts have been compromised. We also check:</p>
                <ul>
                  <li>Password strength</li>
                  <li>Common password patterns</li>
                  <li>Recommendations for better security</li>
                </ul>
                <button className="learn-btn" onClick={() => handleNavigate('password-checker')}>
                  Check Passwords <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Common Scenarios */}
        <section className="common-scenarios">
          <h2>Common Scenarios & Solutions</h2>
          <div className="scenarios-grid">
            <div className="scenario-card">
              <h3>📧 You Receive a Suspicious Email</h3>
              <p><strong>What to do:</strong></p>
              <ol>
                <li>Copy any links from the email</li>
                <li>Go to URLs in NexusGuard</li>
                <li>Paste the link and scan it</li>
                <li>If dangerous, don't click it and report to your email provider</li>
              </ol>
            </div>

            <div className="scenario-card">
              <h3>📞 You Get a Call from a Unknown Number</h3>
              <p><strong>What to do:</strong></p>
              <ol>
                <li>Don't answer yet</li>
                <li>Go to Phones in NexusGuard</li>
                <li>Enter the phone number</li>
                <li>If high risk, let it go to voicemail</li>
              </ol>
            </div>

            <div className="scenario-card">
              <h3>🔐 You Hear About a Data Breach</h3>
              <p><strong>What to do:</strong></p>
              <ol>
                <li>Go to Passwords section</li>
                <li>Check the passwords you use</li>
                <li>If breached, change the password immediately</li>
                <li>Use our strength checker to create a new one</li>
              </ol>
            </div>

            <div className="scenario-card">
              <h3>🎙️ You're in a Suspicious Phone Call</h3>
              <p><strong>What to do:</strong></p>
              <ol>
                <li>Ask the caller to verify their identity first</li>
                <li>Hang up if they refuse or pressure you</li>
                <li>Go to Voice in NexusGuard</li>
                <li>Paste the call transcript and analyze it</li>
              </ol>
            </div>

            <div className="scenario-card">
              <h3>🤝 You Want to Help Others</h3>
              <p><strong>What to do:</strong></p>
              <ol>
                <li>Go to Community section</li>
                <li>Create a report with the threat details</li>
                <li>Include evidence (screenshots, details)</li>
                <li>Your report helps protect thousands of users</li>
              </ol>
            </div>

            <div className="scenario-card">
              <h3>🌐 You're Browsing and See a Suspicious Link</h3>
              <p><strong>What to do:</strong></p>
              <ol>
                <li>Install our Browser Extension</li>
                <li>It automatically checks links as you browse</li>
                <li>Unsafe links get a warning badge</li>
                <li>Click for detailed analysis without leaving the page</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Pro Tips */}
        <section className="pro-tips">
          <h2>Pro Tips for Maximum Protection</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <CheckCircle size={24} className="tip-icon" />
              <h3>Be Suspicious of Urgency</h3>
              <p>Scammers often create artificial urgency ("Act now!" "Limited time!"). Take your time to verify.</p>
            </div>

            <div className="tip-card">
              <CheckCircle size={24} className="tip-icon" />
              <h3>Never Give Personal Info on Calls</h3>
              <p>Legitimate companies never ask for passwords, SSN, or credit cards over the phone. Hang up and call them back.</p>
            </div>

            <div className="tip-card">
              <CheckCircle size={24} className="tip-icon" />
              <h3>Check URLs Before Clicking</h3>
              <p>Hover over links to see the actual URL. Even if the text looks legitimate, the link might go elsewhere.</p>
            </div>

            <div className="tip-card">
              <CheckCircle size={24} className="tip-icon" />
              <h3>Use Unique Passwords</h3>
              <p>If one account is breached, unique passwords prevent attackers from accessing your other accounts.</p>
            </div>

            <div className="tip-card">
              <CheckCircle size={24} className="tip-icon" />
              <h3>Trust Your Instincts</h3>
              <p>If something feels off, it probably is. Use NexusGuard to verify, then trust what we find.</p>
            </div>

            <div className="tip-card">
              <CheckCircle size={24} className="tip-icon" />
              <h3>Check Community Reports</h3>
              <p>See what threats others have reported. If thousands report a number as spam, it probably is.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-items">
            <div className="faq-item">
              <h3>Q: Is my data safe with NexusGuard?</h3>
              <p>A: Yes. We use industry-standard encryption and never sell your data. Your privacy is our top priority. We only process the information you specifically analyze.</p>
            </div>

            <div className="faq-item">
              <h3>Q: How accurate are your threat detections?</h3>
              <p>A: We use multiple threat intelligence sources and AI analysis. While no system is 100% accurate, our accuracy is consistently above 95%. Always use common sense too.</p>
            </div>

            <div className="faq-item">
              <h3>Q: Can I use NexusGuard on my phone?</h3>
              <p>A: Yes! You can use the web version on any device. We also have mobile apps for iPhone and Android.</p>
            </div>

            <div className="faq-item">
              <h3>Q: What does "Community Report" mean?</h3>
              <p>A: When thousands of users report the same number or URL as dangerous, it appears in our Community Reports section. You can see and contribute to these reports.</p>
            </div>

            <div className="faq-item">
              <h3>Q: Do you work with law enforcement?</h3>
              <p>A: We work with law enforcement to report serious fraud patterns. We may be contacted if your report is part of a larger investigation.</p>
            </div>

            <div className="faq-item">
              <h3>Q: What's the difference between Medium and High risk?</h3>
              <p>A: You control the thresholds in Settings. A Medium risk warning means proceed with caution. High risk means we strongly recommend avoiding the link/number/password.</p>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="next-steps">
          <h2>Ready to Get Started?</h2>
          <div className="next-steps-grid">
            <button className="next-step-btn" onClick={() => handleNavigate('dashboard')}>
              <Shield size={24} />
              <span>View Dashboard</span>
            </button>
            <button className="next-step-btn" onClick={() => handleNavigate('how-to')}>
              <ArrowRight size={24} />
              <span>Read How-To Guides</span>
            </button>
            <button className="next-step-btn" onClick={() => handleNavigate('url-scanner')}>
              <Link size={24} />
              <span>Scan a URL</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
