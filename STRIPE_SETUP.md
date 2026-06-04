# Stripe Integration Setup

This guide walks through setting up Stripe for subscription management.

## Step 1: Create a Stripe Account

1. Go to https://stripe.com and create an account
2. Complete identity verification

## Step 2: Create Products and Prices

1. In Stripe Dashboard, go to **Products** → **Add product**

### Create "Pro" Product
- **Name**: NexusGuard Pro
- **Pricing Model**: Recurring
- **Price**: $9.99
- **Billing Period**: Monthly
- **Copy the Price ID** (starts with `price_`)

### Create "Enterprise" Product
- **Name**: NexusGuard Enterprise
- **Pricing Model**: Recurring
- **Price**: $49.99
- **Billing Period**: Monthly
- **Copy the Price ID** (starts with `price_`)

## Step 3: Get API Keys

1. In Stripe Dashboard, go to **Developers** → **API Keys**
2. Copy:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

## Step 4: Configure Environment Variables

Update `.env.local`:

```env
# Stripe - Replace with your actual keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

## Step 5: Set Up Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter: `http://localhost:3001/api/stripe/webhook` (for development)
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

For production, update webhook URL to your domain.

## Step 6: Test Checkout

1. Start both servers:
   ```bash
   cd server && npm run dev
   cd web && npm run dev
   ```

2. Log in to your NexusGuard account
3. Go to Settings and click "Upgrade to Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
5. You should see your subscription updated

## Stripe Test Cards

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Expiry: Any future date, any CVC

## Production Deployment

Before going live:

1. Switch to Live API Keys in Stripe Dashboard
2. Update `.env` with live keys (not test keys)
3. Update webhook URL to production domain
4. Update `FRONTEND_URL` in `.env` to production domain
5. Test with small transaction amounts first
6. Enable email receipts in Stripe Dashboard

## Troubleshooting

### Webhook not working
- Check webhook URL in Stripe Dashboard
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Check server logs for errors
- For local testing, use Stripe CLI: `stripe listen --forward-to localhost:3001/api/stripe/webhook`

### Checkout redirects to blank page
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set
- Restart frontend server
- Check browser console for errors

### Subscription not created
- Verify `STRIPE_SECRET_KEY` is correct
- Ensure price IDs exist in Stripe
- Check webhook events in Stripe Dashboard
