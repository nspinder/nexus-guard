import React from 'react';
import { Chrome, Download, CheckCircle, Shield, Zap, Lock } from 'lucide-react';

export default function BrowserExtension() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: 'Real-Time URL Scanning',
      description: 'Automatic scanning of all links on websites as you browse'
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: 'Visual Safety Indicators',
      description: 'Green checkmark for safe, red warning for suspicious links'
    },
    {
      icon: <Lock className="w-6 h-6 text-green-500" />,
      title: 'Privacy First',
      description: 'No tracking, no data collection, fully encrypted'
    },
  ];

  const browsers = [
    {
      name: 'Chrome',
      icon: '🔵',
      url: 'https://chrome.google.com/webstore/detail/nexusguard',
      status: 'Available',
    },
    {
      name: 'Firefox',
      icon: '🔶',
      url: 'https://addons.mozilla.org/firefox/addon/nexusguard',
      status: 'Available',
    },
    {
      name: 'Edge',
      icon: '🔵',
      url: 'https://microsoftedge.microsoft.com/addons/detail/nexusguard',
      status: 'Available',
    },
    {
      name: 'Safari',
      icon: '🧭',
      url: 'https://apps.apple.com/app/nexusguard',
      status: 'Coming Soon',
    },
  ];

  const installSteps = [
    {
      step: 1,
      title: 'Open Your Browser Store',
      description: 'Click on the appropriate store link below based on your browser'
    },
    {
      step: 2,
      title: 'Click "Add to Browser"',
      description: 'Find the extension and click the install/add button'
    },
    {
      step: 3,
      title: 'Grant Permissions',
      description: 'Review and approve the extension permissions when prompted'
    },
    {
      step: 4,
      title: 'Start Using',
      description: 'The extension is ready! Hover over links to see safety scores'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Chrome className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Browser Extension</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get real-time protection while browsing the web. Scan URLs instantly and stay safe from malicious links.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-3">
                {feature.icon}
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
              </div>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Installation Steps */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Installation Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {installSteps.map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
                {item.step < 4 && (
                  <div className="hidden md:block absolute top-6 -right-3 w-6 h-1 bg-blue-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop App Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-8 mb-12 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Desktop App for Mac</h2>
          </div>
          <p className="text-slate-600 mb-6">
            Monitor FaceTime calls, WhatsApp calls, and iMessages in real-time. Get instant alerts for suspicious conversations with live transcription and AI analysis.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-3xl mb-2">📞</div>
              <h3 className="font-bold text-slate-900 mb-2">Call Monitoring</h3>
              <p className="text-sm text-slate-600">Detects and records FaceTime & WhatsApp calls with real-time transcription</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-3xl mb-2">📨</div>
              <h3 className="font-bold text-slate-900 mb-2">Message Analysis</h3>
              <p className="text-sm text-slate-600">Monitors incoming iMessages and analyzes them for scam indicators</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="text-3xl mb-2">🚨</div>
              <h3 className="font-bold text-slate-900 mb-2">Live Alerts</h3>
              <p className="text-sm text-slate-600">Get instant notifications when threats are detected during calls</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-6 border-l-4 border-blue-600">
            <h3 className="font-bold text-slate-900 mb-2">Quick Start:</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 text-sm">
              <li>Clone or download from: <code className="bg-slate-100 px-2 py-1 rounded">git clone https://github.com/nspinder/nexus-guard.git</code></li>
              <li>Run: <code className="bg-slate-100 px-2 py-1 rounded">cd nexus-guard/desktop && npm install</code></li>
              <li>Configure .env with your API keys and backend URL</li>
              <li>Launch: <code className="bg-slate-100 px-2 py-1 rounded">npm start</code></li>
              <li>Follow the setup wizard to grant permissions</li>
            </ol>
          </div>

          <div className="flex gap-4">
            <a
              href="https://github.com/nspinder/nexus-guard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <Download className="w-5 h-5" />
              Get from GitHub
            </a>
            <a
              href="/how-to"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-semibold"
            >
              📖 View Setup Guide
            </a>
          </div>
        </div>

        {/* Browser Downloads */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Browser</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {browsers.map((browser, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition text-center"
              >
                <div className="text-4xl mb-3">{browser.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{browser.name}</h3>
                <p className={`text-sm font-semibold mb-4 ${
                  browser.status === 'Available' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {browser.status}
                </p>
                {browser.status === 'Available' ? (
                  <a
                    href={browser.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Install
                  </a>
                ) : (
                  <button disabled className="inline-flex items-center gap-2 px-4 py-2 bg-slate-300 text-slate-600 rounded-lg font-semibold opacity-50 cursor-not-allowed">
                    Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                <span>Is the extension free?</span>
                <span>+</span>
              </summary>
              <p className="mt-3 text-slate-600">Yes! The browser extension is completely free to use. All link scanning and safety features are included.</p>
            </details>

            <details className="bg-white rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                <span>Does it track my browsing?</span>
                <span>+</span>
              </summary>
              <p className="mt-3 text-slate-600">No. We never track your browsing history. All scanning is done locally on your device for maximum privacy.</p>
            </details>

            <details className="bg-white rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                <span>What data is stored?</span>
                <span>+</span>
              </summary>
              <p className="mt-3 text-slate-600">We only store anonymized threat data. No personal information or browsing history is ever stored.</p>
            </details>

            <details className="bg-white rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                <span>How often is the threat database updated?</span>
                <span>+</span>
              </summary>
              <p className="mt-3 text-slate-600">The database updates in real-time, checking against VirusTotal, Google Safe Browsing, and our spam database.</p>
            </details>

            <details className="bg-white rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                <span>Can I disable it for specific sites?</span>
                <span>+</span>
              </summary>
              <p className="mt-3 text-slate-600">Yes! You can whitelist sites or disable the extension temporarily from the extension settings.</p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
