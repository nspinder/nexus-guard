# Clerk Authentication Setup

This guide walks through setting up Clerk for NexusGuard authentication.

## Step 1: Create a Clerk Account

1. Go to https://clerk.com and sign up for a free account
2. Create a new application

## Step 2: Get Your API Keys

1. In the Clerk Dashboard, go to **API Keys**
2. Copy your:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

## Step 3: Configure Environment Variables

Update `.env.local` in the project root:

```env
# Replace with your actual Clerk keys from Step 2
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

## Step 4: Enable OAuth Providers (Optional for Phase 2)

In your Clerk Dashboard, go to **Social Connections** to enable:
- Google (recommended)
- GitHub
- Apple

These are optional but improve user signup experience.

## Step 5: Configure Redirect URLs

In Clerk Dashboard under **URLs**:
- Add **Allowed Redirect URLs**: `http://localhost:3000`
- Add **Sign out URL**: `http://localhost:3000`

For production, update these to your domain.

## Step 6: Test Authentication

1. Start both servers:
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev

   # Terminal 2: Frontend
   cd web && npm run dev
   ```

2. Visit http://localhost:3000
3. Click "Sign Up" and create an account
4. You should be logged in and redirected to the dashboard

## Troubleshooting

### "Missing Clerk Configuration"
- Check `.env.local` has `VITE_CLERK_PUBLISHABLE_KEY` set
- Make sure the value starts with `pk_`

### Sign in redirects to blank page
- Add http://localhost:3000 to Clerk Dashboard URLs
- Restart frontend server after updating .env.local

### Backend 401 errors
- Verify `CLERK_SECRET_KEY` is set in `.env.local`
- Restart backend server after updating .env.local

## Next Steps

- Proceed to **Task #2: Stripe Integration** once Clerk is working
- After Clerk + Stripe, add **Gmail OAuth** (Task #3)
