import express from 'express';
import Stripe from 'stripe';
import { verifyToken } from '../middleware/clerk.js';
import { createCheckoutSession, handleCheckoutSessionCompleted, handleCustomerSubscriptionDeleted } from '../services/stripe.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeRouter = express.Router();

// Create checkout session for upgrade
stripeRouter.post('/checkout', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { tier } = req.body;

  if (!tier || !['pro', 'enterprise'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const session = await createCheckoutSession(user.id, user.email, tier);

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscription status
stripeRouter.get('/subscription', verifyToken, async (req, res) => {
  const { userId } = req.auth;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      tier: user.subscriptionTier,
      monthlyEmailLimit: user.monthlyEmailLimit,
      monthlyEmailUsage: user.monthlyEmailUsage,
      canAnalyzeEmail: user.monthlyEmailUsage < user.monthlyEmailLimit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook for Stripe events (raw body required)
stripeRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session, req.app.locals.prisma);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleCustomerSubscriptionDeleted(subscription, req.app.locals.prisma);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get pricing info
stripeRouter.get('/pricing', (req, res) => {
  const pricing = {
    tiers: [
      {
        name: 'Free',
        price: 0,
        monthlyEmails: 100,
        monthlyCallAnalysis: 'Unlimited',
        features: [
          '100 emails/month',
          'Unlimited call analysis',
          'Real-time alerts',
          'Basic scam detection',
        ],
      },
      {
        name: 'Pro',
        price: 9.99,
        monthlyEmails: null,
        monthlyCallAnalysis: 'Unlimited',
        features: [
          'Unlimited email analysis',
          'Unlimited call analysis',
          'Real-time alerts',
          'Advanced scam detection',
          'Email integrations (Gmail, Outlook)',
          'Priority support',
        ],
      },
      {
        name: 'Enterprise',
        price: 49.99,
        monthlyEmails: null,
        monthlyCallAnalysis: 'Unlimited',
        features: [
          'Unlimited everything',
          'Advanced analytics',
          'Custom integrations',
          'Dedicated support',
          'SLA guarantee',
        ],
      },
    ],
  };

  res.json(pricing);
});
