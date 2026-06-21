import { useState } from 'react';
import { Check } from 'lucide-react';
import { loadStripe } from '@stripe/js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    monthlyEmails: '100',
    description: 'Perfect to get started',
    features: [
      '100 emails/month',
      'Unlimited call analysis',
      'Real-time alerts',
      'Basic scam detection',
      'Browser notifications',
    ],
    cta: 'Current Plan',
    tier: 'free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    monthlyEmails: 'Unlimited',
    description: 'Most popular for active users',
    features: [
      'Unlimited email analysis',
      'Unlimited call analysis',
      'Real-time alerts',
      'Advanced scam detection',
      'Gmail & Outlook integration',
      'Email notifications',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    tier: 'pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$49.99',
    monthlyEmails: 'Unlimited',
    description: 'For organizations',
    features: [
      'Unlimited everything',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Team management',
      'API access',
    ],
    cta: 'Contact Sales',
    tier: 'enterprise',
    highlighted: false,
  },
];

export default function PricingPlans({ currentTier, authToken, onClose }) {
  const [loading, setLoading] = useState(null);

  const isValidRedirectUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleUpgrade = async (tier) => {
    if (tier === 'free' || !authToken) return;

    setLoading(tier);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.url) {
        if (isValidRedirectUrl(data.url)) {
          window.location.href = data.url;
        } else {
          alert('Invalid checkout URL received');
        }
      } else if (data.error) {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-12 py-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
        <p className="text-475569 text-lg">Choose the perfect plan for your needs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`rounded-lg overflow-hidden transition transform hover:scale-105 ${
              plan.highlighted
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400 ring-2 ring-blue-500/30'
                : 'bg-white/50 border border-e2e8f0'
            }`}
          >
            {plan.highlighted && (
              <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                MOST POPULAR
              </div>
            )}

            <div className="p-8 space-y-6">
              <div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.highlighted ? 'text-white' : 'text-white'
                }`}>
                  {plan.name}
                </h3>
                <p className={plan.highlighted ? 'text-blue-100' : 'text-475569'}>
                  {plan.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className={`text-4xl font-bold ${
                  plan.highlighted ? 'text-white' : 'text-white'
                }`}>
                  {plan.price}
                  <span className="text-lg text-475569">/month</span>
                </div>
                <p className={`text-sm ${
                  plan.highlighted ? 'text-blue-100' : 'text-475569'
                }`}>
                  {plan.monthlyEmails} emails/month
                </p>
              </div>

              <button
                onClick={() => handleUpgrade(plan.tier)}
                disabled={
                  loading === plan.tier ||
                  (currentTier === plan.tier && plan.tier !== 'free')
                }
                className={`w-full py-2 rounded-lg font-medium transition ${
                  currentTier === plan.tier && plan.tier !== 'free'
                    ? 'bg-f1f5f9 text-475569 cursor-default'
                    : plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-f1f5f9 text-white hover:bg-slate-600'
                } ${loading === plan.tier ? 'opacity-75' : ''}`}
              >
                {loading === plan.tier ? 'Loading...' : plan.cta}
              </button>

              <div className="border-t border-cbd5e1 pt-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-white' : 'text-blue-400'
                      }`} />
                      <span className={plan.highlighted ? 'text-white' : 'text-475569'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
        <p className="text-475569">
          All plans include 30-day money-back guarantee and cancel anytime.
        </p>
      </div>
    </div>
  );
}
