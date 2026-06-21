import React, { useState } from 'react';
import { Mail, MessageSquare, HelpCircle, Phone, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function GetHelp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just show success message
    setSubmitted(true);
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: '',
      });
      setSubmitted(false);
    }, 3000);
  };

  const faqs = [
    {
      question: 'How do I analyze an email?',
      answer: 'Go to "Analyze Email" and paste the email content. NexusGuard will analyze it for phishing, spam, and scam indicators.',
    },
    {
      question: 'Is my data safe with NexusGuard?',
      answer: 'Yes! We use end-to-end encryption and never store your personal data on our servers. All analysis is done securely.',
    },
    {
      question: 'Can I check phone numbers?',
      answer: 'Absolutely! Use our Phone Validator to check if a number is associated with spam or fraud. It checks against multiple databases.',
    },
    {
      question: 'How often is the threat database updated?',
      answer: 'Our threat databases are updated in real-time, pulling from VirusTotal, spam databases, and other security sources.',
    },
    {
      question: 'Do you offer browser extensions?',
      answer: 'Yes, we have browser extensions for Chrome and Firefox that scan emails and URLs in real-time.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and other digital payment methods. Your Free plan has full access to basic features.',
    },
  ];

  const supportChannels = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Get detailed responses within 24 hours',
      contact: 'support@nexusguard.com',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Chat with our team instantly',
      contact: 'Available 9 AM - 6 PM EST',
      color: 'bg-green-50 border-green-200',
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Support',
      description: 'Call our support team',
      contact: '+1 (555) 123-GUARD (4827)',
      color: 'bg-purple-50 border-purple-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Get Help & Support</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            We're here to help. Choose your preferred way to contact us or browse our FAQs.
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportChannels.map((channel, idx) => (
            <div
              key={idx}
              className={`${channel.color} border rounded-lg p-6 text-center hover:shadow-lg transition`}
            >
              <div className="flex justify-center mb-4 text-blue-600">
                {channel.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{channel.title}</h3>
              <p className="text-sm text-slate-600 mb-4">{channel.description}</p>
              <p className="font-semibold text-slate-900">{channel.contact}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Message sent!</p>
                  <p className="text-sm text-green-800">We'll get back to you within 24 hours.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General Question</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing & Subscription</option>
                  <option value="report">Report a Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="security">Security Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-md transition"
              >
                <summary className="flex items-center justify-between font-semibold text-slate-900">
                  <span>{faq.question}</span>
                  <span>+</span>
                </summary>
                <p className="mt-3 text-slate-600 text-sm">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Hours of Operation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-slate-900">Support Team</p>
              <p className="text-slate-600">Monday - Friday: 9 AM - 6 PM EST</p>
              <p className="text-slate-600">Saturday: 10 AM - 4 PM EST</p>
              <p className="text-slate-600">Sunday: Closed</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Emergency Support</p>
              <p className="text-slate-600">Security issues: 24/7 response</p>
              <p className="text-slate-600">Email: security@nexusguard.com</p>
              <p className="text-slate-600">Phone: +1 (555) 123-SECURE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
