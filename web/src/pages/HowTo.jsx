import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Link, Phone, Lock, Mic, Users, Globe } from 'lucide-react';
import '../styles/HowTo.css';

export default function HowTo() {
  const navigate = useNavigate();
  const [expandedGuide, setExpandedGuide] = useState(0);

  const routeMap = {
    'url-scanner': '/url-scanner',
    'phone-validator': '/phone-validator',
    'password-checker': '/password-checker',
    'voice-analyzer': '/voice-analyzer',
    'community-reports': '/community-reports',
    dashboard: '/dashboard',
  };

  const handleNavigate = (route) => {
    navigate(routeMap[route] || '/');
  };

  const toggleGuide = (index) => {
    setExpandedGuide(expandedGuide === index ? -1 : index);
  };

  const guides = [
    {
      title: 'URL Scanner: Check Links Safely',
      icon: Link,
      steps: [
        {
          num: 1,
          title: 'Open the URL Scanner',
          description: 'Go to URLs in the main navigation menu.'
        },
        {
          num: 2,
          title: 'Paste Your Link',
          description: 'Copy a suspicious link and paste it into the input field. Works with HTTP and HTTPS URLs.'
        },
        {
          num: 3,
          title: 'Click Scan',
          description: 'Click the Scan button or press Enter. Analysis takes 2-5 seconds.'
        },
        {
          num: 4,
          title: 'Review Results',
          description: 'You\'ll see the safety status: Safe (green), Warning (orange), or Malicious (red). The report shows threat categories found.'
        },
        {
          num: 5,
          title: 'Check Your History',
          description: 'All your scans are saved. View your scan history to see what you\'ve checked before.'
        }
      ],
      tips: [
        'Always check links in suspicious emails before clicking',
        'Shortened URLs (bit.ly, tinyurl) can hide dangerous links - always scan them',
        'Real companies never ask you to verify accounts via email links',
        'Hover over links in emails to see the actual URL before scanning'
      ]
    },
    {
      title: 'Phone Validator: Identify Spam Calls',
      icon: Phone,
      steps: [
        {
          num: 1,
          title: 'Open Phone Validator',
          description: 'Go to Phones in the main navigation menu.'
        },
        {
          num: 2,
          title: 'Enter the Phone Number',
          description: 'Type the phone number in the input field. Include country code if international (e.g., +55 for Brazil, +1 for USA).'
        },
        {
          num: 3,
          title: 'Click Validate',
          description: 'Click the Validate button. We check against spam databases and carrier information.'
        },
        {
          num: 4,
          title: 'Check the Risk Level',
          description: 'Safe (green) = legitimate number. Warning (orange) = possibly spam. High Risk (red) = known scam number.'
        },
        {
          num: 5,
          title: 'See Carrier Details',
          description: 'Results show the carrier (Vivo, Claro, etc.), area code, and risk factors detected.'
        },
        {
          num: 6,
          title: 'Report Bad Numbers',
          description: 'If you want to warn others, go to Community and create a report for this number.'
        }
      ],
      tips: [
        'Scammers often spoof numbers that look local to your area',
        'If a "bank" calls asking for your password, hang up and call them back directly',
        '555 numbers (US) are fictional - never legitimate for real businesses',
        'Save trusted numbers in your contacts to identify changes quickly'
      ]
    },
    {
      title: 'Password Checker: Protect Your Accounts',
      icon: Lock,
      steps: [
        {
          num: 1,
          title: 'Open Password Checker',
          description: 'Go to Passwords in the main navigation menu.'
        },
        {
          num: 2,
          title: 'Enter Your Password',
          description: 'Type the password you want to check. We never store it or send it over the internet unsecurely.'
        },
        {
          num: 3,
          title: 'Click Check',
          description: 'The system checks against a database of 500M+ compromised passwords using privacy-first hashing.'
        },
        {
          num: 4,
          title: 'See Breach Status',
          description: 'Safe (green) = not found in breaches. Warning (orange) = found 1-5 times. High Risk (red) = found 50+ times.'
        },
        {
          num: 5,
          title: 'Check Password Strength',
          description: 'Get a strength score and recommendations: use uppercase, numbers, special characters, and make it long (12+ characters).'
        },
        {
          num: 6,
          title: 'Create a Strong Password',
          description: 'Use our recommendations to create a new password. Consider a password manager like Bitwarden or 1Password.'
        }
      ],
      tips: [
        'Never reuse passwords across multiple accounts',
        'Common passwords (password123, qwerty) are the first ones hackers try',
        'A 12-character password is 100x harder to crack than a 6-character one',
        'If one of your accounts is breached, change the password immediately across other sites'
      ]
    },
    {
      title: 'Voice Analysis: Detect Scam Calls',
      icon: Mic,
      steps: [
        {
          num: 1,
          title: 'Record or Save the Call',
          description: 'Record the suspicious phone call or get the transcript. Many phones allow easy recording in call settings.'
        },
        {
          num: 2,
          title: 'Open Voice Analyzer',
          description: 'Go to Voice in the main navigation menu.'
        },
        {
          num: 3,
          title: 'Paste the Transcript',
          description: 'Paste the call transcript or recording details into the input field. Include what was said and by whom.'
        },
        {
          num: 4,
          title: 'Click Analyze',
          description: 'Our AI analyzes the content for 40+ scam phrases and deepfake indicators. Takes 3-10 seconds.'
        },
        {
          num: 5,
          title: 'Review the Analysis',
          description: 'See detected scam language, urgency tactics, requests for personal info, and deepfake probability.'
        },
        {
          num: 6,
          title: 'Take Action',
          description: 'If high risk: report to authorities. If warning level: be cautious and verify independently.'
        }
      ],
      tips: [
        'Scammers use urgency: "Act now!", "Your account will be closed!", "You\'re under investigation!"',
        'They request info you shouldn\'t give: passwords, SSN, credit card numbers, PIN codes',
        'Listen for signs of deepfake: unnatural pauses, robotic speech, background noise consistency',
        'Real companies never threaten legal action over the phone without sending official paperwork first'
      ]
    },
    {
      title: 'Community Reports: Help Others',
      icon: Users,
      steps: [
        {
          num: 1,
          title: 'Open Community Reports',
          description: 'Go to Community in the main navigation menu.'
        },
        {
          num: 2,
          title: 'View Recent Reports',
          description: 'See what threats the community has reported recently: URLs, phone numbers, emails, etc.'
        },
        {
          num: 3,
          title: 'Vote on Reports',
          description: 'Click thumbs up if you\'ve seen the threat too, or thumbs down if you think it\'s safe.'
        },
        {
          num: 4,
          title: 'Create a New Report',
          description: 'Click "Report a Threat" and provide details: the target (URL/phone/email), threat type, and description.'
        },
        {
          num: 5,
          title: 'Include Evidence',
          description: 'Add screenshots, details, or context. The more detail, the more helpful to others.'
        },
        {
          num: 6,
          title: 'Submit Your Report',
          description: 'Click Submit. Your report is reviewed and helps protect thousands of users.'
        }
      ],
      tips: [
        'Before creating a report, check if someone else already reported it',
        'Include as much detail as possible: exact URL, phone number, where you found it, what happened',
        'Screenshot scam messages or emails if possible',
        'Your reports are anonymous but help create a safer community for everyone'
      ]
    },
    {
      title: 'Browser Extension: Real-Time Protection',
      icon: Globe,
      steps: [
        {
          num: 1,
          title: 'Install the Extension',
          description: 'Go to the Browser Extension section in NexusGuard and click "Install" for your browser (Chrome, Firefox, Safari, Edge).'
        },
        {
          num: 2,
          title: 'Grant Permissions',
          description: 'The extension asks to access links on websites you visit. This is only used for security analysis.'
        },
        {
          num: 3,
          title: 'See Safety Badges',
          description: 'As you browse, links get automatic safety badges. Green = safe, Orange = warning, Red = malicious.'
        },
        {
          num: 4,
          title: 'Click for Details',
          description: 'Click any badge to see detailed threat analysis without leaving the current page.'
        },
        {
          num: 5,
          title: 'Configure Settings',
          description: 'Click the extension icon in your toolbar to set alert preferences and customize protection levels.'
        },
        {
          num: 6,
          title: 'Stay Protected',
          description: 'The extension runs automatically. You get protection across all websites you visit.'
        }
      ],
      tips: [
        'The extension works on social media, email, forums, and all websites',
        'It doesn\'t slow down browsing - runs efficiently in the background',
        'You can whitelist trusted sites if you get false positives',
        'Keep the extension updated for the latest threat intelligence'
      ]
    }
  ];

  return (
    <div className="guide-page">
      <div className="guide-header">
        <h1>How-To Guides</h1>
        <p>Step-by-step instructions for every NexusGuard feature</p>
      </div>

      <div className="guide-content">
        <section className="guides-intro">
          <p>
            Each feature in NexusGuard is designed to be simple and intuitive. Click on any guide below to learn exactly how to use it, plus pro tips from our security experts.
          </p>
        </section>

        <section className="guides-section">
          {guides.map((guide, index) => {
            const IconComponent = guide.icon;
            const isExpanded = expandedGuide === index;

            return (
              <div key={index} className="guide-card">
                <div
                  className="guide-card-header"
                  onClick={() => toggleGuide(index)}
                >
                  <div className="guide-card-title">
                    <IconComponent size={24} className="guide-icon" />
                    <h3>{guide.title}</h3>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={24} />
                  ) : (
                    <ChevronDown size={24} />
                  )}
                </div>

                {isExpanded && (
                  <div className="guide-card-content">
                    <div className="steps-section">
                      <h4>Step-by-Step Guide</h4>
                      <div className="steps-detailed">
                        {guide.steps.map((step) => (
                          <div key={step.num} className="detailed-step">
                            <div className="step-num-large">{step.num}</div>
                            <div className="step-details">
                              <h5>{step.title}</h5>
                              <p>{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="tips-section">
                      <h4>💡 Pro Tips</h4>
                      <ul className="tips-list">
                        {guide.tips.map((tip, tipIndex) => (
                          <li key={tipIndex}>{tip}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="try-now-section">
                      <p>Ready to try it?</p>
                      <button
                        className="try-btn"
                        onClick={() => {
                          const featureMap = {
                            0: 'url-scanner',
                            1: 'phone-validator',
                            2: 'password-checker',
                            3: 'voice-analyzer',
                            4: 'community-reports',
                            5: 'home'
                          };
                          handleNavigate(featureMap[index]);
                        }}
                      >
                        Try {guide.title.split(':')[0]} Now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Troubleshooting Section */}
        <section className="troubleshooting">
          <h2>Troubleshooting</h2>
          <div className="troubleshooting-items">
            <div className="trouble-item">
              <h3>My scan says a site is malicious but I trust it</h3>
              <p>This can happen with new websites that haven't been verified yet. Check the threat details. If you're sure it's safe, you can whitelist it. Contact us if you believe it's a false positive.</p>
            </div>

            <div className="trouble-item">
              <h3>Phone validation shows spam but I called them before</h3>
              <p>Phone numbers can be spoofed or recycled. If you called them directly (not via their website) and verified the number, it's likely safe. Always call the official number from the company's website instead.</p>
            </div>

            <div className="trouble-item">
              <h3>Password shows as breached but I haven't used it</h3>
              <p>If you created this password and haven't used it anywhere, it likely means someone guessed it or it appears in a hacker's wordlist. Change it immediately if you have used it anywhere.</p>
            </div>

            <div className="trouble-item">
              <h3>Voice analysis seems wrong about my transcript</h3>
              <p>Transcription errors can affect analysis. Make sure the transcript accurately represents the call. Provide as much context as possible for better results.</p>
            </div>

            <div className="trouble-item">
              <h3>Browser extension not showing badges</h3>
              <p>Check that it's enabled in your browser's extension settings. Some websites block extensions. Try refreshing the page. Make sure you've granted permission to access that website.</p>
            </div>

            <div className="trouble-item">
              <h3>I'm getting too many alerts</h3>
              <p>Go to Dashboard → Settings and adjust your alert thresholds. You can increase the bar for what triggers an alert based on your comfort level.</p>
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="video-tutorials">
          <h2>Video Tutorials</h2>
          <p>Watch video guides for visual learners (videos coming soon)</p>
          <div className="video-grid">
            <div className="video-card placeholder">
              <div className="play-button">▶</div>
              <p>URL Scanner Demo - 2 min</p>
            </div>
            <div className="video-card placeholder">
              <div className="play-button">▶</div>
              <p>Phone Validation Guide - 3 min</p>
            </div>
            <div className="video-card placeholder">
              <div className="play-button">▶</div>
              <p>Staying Safe Online - 5 min</p>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="support-section">
          <h2>Still Need Help?</h2>
          <p>Can't find what you're looking for?</p>
          <div className="support-options">
            <button className="support-btn">📧 Email Support</button>
            <button className="support-btn">💬 Live Chat</button>
            <button className="support-btn">📚 Knowledge Base</button>
          </div>
        </section>
      </div>
    </div>
  );
}
