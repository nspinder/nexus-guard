import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle, Mail, Phone, MessageCircle, Lock, ArrowRight } from 'lucide-react';

export default function StartTour() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to NexusGuard',
      description: 'Your AI-powered security companion for emails, calls, and messages',
      icon: '🛡️',
      content: (
        <div className="space-y-4">
          <p className="text-lg text-slate-600">
            NexusGuard protects you from scams, fraud, and malicious content by analyzing:
          </p>
          <ul className="space-y-2">
            <li className="flex gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>Emails for phishing and spam</span>
            </li>
            <li className="flex gap-3">
              <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>Phone calls and numbers for fraud</span>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span>Messages on WhatsApp and iMessage</span>
            </li>
            <li className="flex gap-3">
              <Lock className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>Passwords for breaches</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: 'Analyze Emails',
      description: 'Check emails for phishing, spam, and scams',
      icon: '📧',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Go to <strong>Analyze Email</strong> to:
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-600">
            <li>Paste email content for analysis</li>
            <li>Get AI-powered threat assessment</li>
            <li>See detailed risk scores</li>
            <li>View your email history</li>
          </ul>
          <button
            onClick={() => navigate('/analyze-email')}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            Try Email Analyzer <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      title: 'Validate Phone Numbers',
      description: 'Check if a phone number is associated with spam or fraud',
      icon: '📞',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Go to <strong>Phone Validator</strong> to:
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-600">
            <li>Check phone numbers for spam patterns</li>
            <li>Identify suspicious numbers</li>
            <li>Get carrier information</li>
            <li>See validation history</li>
          </ul>
          <button
            onClick={() => navigate('/phone-validator')}
            className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            Try Phone Validator <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      title: 'Check Passwords',
      description: 'See if your password has been compromised in data breaches',
      icon: '🔐',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Go to <strong>Password Checker</strong> to:
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-600">
            <li>Check if passwords are in breach databases</li>
            <li>Get password strength assessment</li>
            <li>Receive security recommendations</li>
            <li>View check history</li>
          </ul>
          <button
            onClick={() => navigate('/password-checker')}
            className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
          >
            Try Password Checker <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      title: 'Scan URLs',
      description: 'Check if websites are malicious before clicking',
      icon: '🔗',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Go to <strong>URL Scanner</strong> to:
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-600">
            <li>Scan URLs for malware and phishing</li>
            <li>Check against multiple threat databases</li>
            <li>See website safety ratings</li>
            <li>Browse safely without clicking suspicious links</li>
          </ul>
          <button
            onClick={() => navigate('/url-scanner')}
            className="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
          >
            Try URL Scanner <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      title: 'View Your Dashboard',
      description: 'See all your security activity and risk summary',
      icon: '📊',
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Your <strong>Dashboard</strong> shows:
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-600">
            <li>Total items analyzed</li>
            <li>Suspicious items found</li>
            <li>Risk score distribution</li>
            <li>Recent security alerts</li>
            <li>All analysis history</li>
          </ul>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )
    },
    {
      title: 'You\'re All Set!',
      description: 'Start protecting yourself today',
      icon: '✅',
      content: (
        <div className="space-y-4">
          <p className="text-lg text-slate-600 font-semibold">
            You now know how to use all of NexusGuard's features!
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-slate-700">
              <strong>Next steps:</strong>
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600">
              <li>Customize your security settings</li>
              <li>Set up alerts for suspicious activity</li>
              <li>Review your security history regularly</li>
              <li>Share tips with friends and family</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Settings
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Tour Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">{step.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{step.title}</h1>
              <p className="text-slate-600">{step.description}</p>
            </div>
          </div>

          {/* Content */}
          <div className="my-8 py-6 border-y border-slate-200">
            {step.content}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Start Using
            </button>
          </div>

          {/* Dot Navigation */}
          <div className="flex justify-center gap-2 mt-6">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentStep ? 'bg-blue-600 w-8' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
