import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Subscription tiers: free = 100 emails/month, pro = unlimited
const TIERS = {
  free: { name: 'Free', monthlyEmails: 100, priceId: null },
  pro: { name: 'Pro', monthlyEmails: null, priceId: process.env.STRIPE_PRO_PRICE_ID },
  enterprise: { name: 'Enterprise', monthlyEmails: null, priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID },
};

export async function createCheckoutSession(userId, userEmail, tier) {
  try {
    if (!TIERS[tier] || !TIERS[tier].priceId) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [
        {
          price: TIERS[tier].priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
      metadata: {
        userId,
        tier,
      },
    });

    return session;
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
}

export async function getOrCreateCustomer(userId, userEmail, prisma) {
  try {
    // Check if user already has Stripe customer ID
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        userId,
      },
    });

    // Update user with Stripe customer ID
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    return customer.id;
  } catch (error) {
    console.error('Create customer error:', error);
    throw error;
  }
}

export async function handleCheckoutSessionCompleted(session, prisma) {
  try {
    const { metadata } = session;
    const { userId, tier } = metadata;

    if (!userId || !tier) {
      console.error('Missing metadata in session:', session.id);
      return;
    }

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        stripeSubscriptionId: session.subscription,
        monthlyEmailLimit: TIERS[tier].monthlyEmails || 0,
        monthlyEmailUsage: 0,
        emailUsageResetDate: new Date(),
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: `SUBSCRIPTION_UPGRADED_${tier.toUpperCase()}`,
        resourceType: 'SUBSCRIPTION',
      },
    });

    console.log(`✓ Subscription created for user ${userId} - tier: ${tier}`);
  } catch (error) {
    console.error('Checkout session error:', error);
    throw error;
  }
}

export async function handleCustomerSubscriptionDeleted(subscription, prisma) {
  try {
    const customerId = subscription.customer;

    // Find user with this customer
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // Downgrade to free
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'free',
        stripeSubscriptionId: null,
        monthlyEmailLimit: TIERS.free.monthlyEmails,
        monthlyEmailUsage: 0,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SUBSCRIPTION_CANCELLED',
        resourceType: 'SUBSCRIPTION',
      },
    });

    console.log(`✓ Subscription cancelled for user ${user.id}`);
  } catch (error) {
    console.error('Subscription deleted error:', error);
    throw error;
  }
}

export async function resetMonthlyEmailUsage(userId, prisma) {
  const today = new Date();
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Reset if a month has passed since last reset
  if (!user.emailUsageResetDate || new Date(user.emailUsageResetDate).getMonth() !== today.getMonth()) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyEmailUsage: 0,
        emailUsageResetDate: today,
      },
    });
  }

  return user.monthlyEmailLimit;
}

export function getTierLimits() {
  return TIERS;
}
