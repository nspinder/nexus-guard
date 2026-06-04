# Gmail OAuth Integration Setup

This guide walks through setting up Gmail OAuth for automatic email sync.

## Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click **Create Project**
3. Enter "NexusGuard" as project name
4. Wait for project to be created

## Step 2: Enable Gmail API

1. In Google Cloud Console, search for "Gmail API"
2. Click **Gmail API** from results
3. Click **Enable**
4. Wait for it to finish

## Step 3: Create OAuth 2.0 Credentials

1. Go to **Credentials** (left sidebar)
2. Click **+ Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web application**
4. Configure:
   - **Name**: NexusGuard
   - **Authorized redirect URIs**:
     - http://localhost:3001/api/email/gmail/callback
     - (For production: https://yourdomain.com/api/email/gmail/callback)
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

Update `.env.local`:

```env
# Gmail OAuth - Replace with your credentials
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-xxxxxxxx

# Backend URL
BACKEND_URL=http://localhost:3001
```

## Step 5: Add Test Users (For Google OAuth Consent Screen)

1. Go to **OAuth consent screen** in Google Cloud Console
2. Select **External** for User type
3. Fill in:
   - **App name**: NexusGuard
   - **User support email**: your-email@gmail.com
   - **Developer contact**: your-email@gmail.com
4. Click **Save and Continue**
5. On Scopes page: No additional scopes needed (we only need read access)
6. On Test users page: Add your Google account as a test user
7. Complete the setup

## Step 6: Test Gmail Connection

1. Start both servers:
   ```bash
   cd server && npm run dev
   cd web && npm run dev
   ```

2. Log in to NexusGuard
3. Go to Settings → Privacy & Consent
4. Click "Connect Gmail"
5. You'll be redirected to Google login
6. Grant permissions
7. You should be redirected back with "Connected"

## What We Access

- **Read emails** from your Gmail inbox
- **Sender, subject, and content** for scam analysis
- **NO modifications** to your emails
- **NO access** to your password

## Automatic Email Sync

Once connected:
- Last 30 days of emails are imported
- New emails are automatically analyzed as they arrive
- Each email is scored for scam probability
- Scam detected alerts are sent in real-time

## Troubleshooting

### "Invalid OAuth Consent Screen"
- Complete the consent screen setup in Google Cloud Console
- Make sure to add yourself as a test user

### "Redirect URI mismatch"
- Verify `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` are correct
- Ensure redirect URI matches exactly in Google Cloud Console

### Emails not syncing
- Check that Gmail permission was granted
- Try "Sync Now" button in Settings
- Check server logs for errors

## Production Setup

Before going live:

1. Set up **OAuth consent screen** as "Internal" (or get approval for "External")
2. Add production redirect URI to Google Cloud:
   - https://yourdomain.com/api/email/gmail/callback
3. Update `.env` with production Gmail credentials
4. Test with a few emails first
5. Monitor sync logs in production

## Revoking Access

To revoke Gmail access:
1. Go to https://myaccount.google.com/permissions
2. Find "NexusGuard"
3. Click and select "Remove access"

You can reconnect anytime.
