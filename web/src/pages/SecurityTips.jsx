import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Lock, Eye, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';

export default function SecurityTips() {
  const navigate = useNavigate();

  const tips = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Security',
      color: 'bg-blue-50 border-blue-200',
      tips: [
        'Never share your phone number with unknown callers',
        'Be suspicious of calls asking for personal information',
        'Don\'t use 555-xxxx numbers (they\'re fictional)',
        'Verify caller identity by hanging up and calling back',
        'Report spam calls to your provider',
      ]
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Safety',
      color: 'bg-green-50 border-green-200',
      tips: [
        'Check sender email addresses carefully',
        'Hover over links to see the real URL before clicking',
        'Never click links in unsolicited emails',
        'Be wary of urgent requests for passwords or PII',
        'Look for grammar and spelling errors',
      ]
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Password Security',
      color: 'bg-purple-50 border-purple-200',
      tips: [
        'Use unique passwords for each account',
        'Make passwords at least 12 characters long',
        'Include uppercase, lowercase, numbers, and symbols',
        'Change passwords regularly',
        'Use a password manager to store securely',
      ]
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Browsing Safely',
      color: 'bg-orange-50 border-orange-200',
      tips: [
        'Only visit websites with "https://" (secure)',
        'Look for the padlock icon in the address bar',
        'Avoid clicking suspicious ads or pop-ups',
        'Keep your browser updated',
        'Use a VPN on public Wi-Fi networks',
      ]
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: 'Phishing Prevention',
      color: 'bg-red-50 border-red-200',
      tips: [
        'Never give personal info to unverified sources',
        'Banks never ask for passwords via email',
        'Verify suspicious emails by contacting the company directly',
        'Look for mismatched domains (e.g., "paypa1.com")',
        'Report phishing emails to the company',
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'General Safety',
      color: 'bg-indigo-50 border-indigo-200',
      tips: [
        'Enable two-factor authentication (2FA)',
        'Keep your devices updated with latest patches',
        'Review account activity regularly',
        'Be cautious with oversharing on social media',
        'Back up important data regularly',
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Security Tips & Best Practices</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Learn how to protect yourself from scams, fraud, and cyber threats
          </p>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className={`${tip.color} border rounded-lg p-6 shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-blue-600">{tip.icon}</div>
                <h3 className="text-lg font-bold text-slate-900">{tip.title}</h3>
              </div>
              <ul className="space-y-2">
                {tip.tips.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to Protect Yourself?</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Use NexusGuard's tools to analyze emails, phone calls, and messages for potential threats in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
