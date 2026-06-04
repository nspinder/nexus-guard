# Outlook OAuth Integration Setup

This guide walks through setting up Outlook/Microsoft 365 OAuth for automatic email sync.

## Step 1: Register Application in Azure

1. Go to https://portal.azure.com
2. Search for "App registrations" and click it
3. Click **New registration**
4. Enter:
   - **Name**: NexusGuard
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
5. Click **Register**
6. Copy the **Application (client) ID** and **Directory (tenant) ID**

## Step 2: Create Client Secret

1. In app registration, go to **Certificates & secrets** (left sidebar)
2. Click **New client secret**
3. Add description: "NexusGuard backend"
4. Copy the **Value** (not ID)

## Step 3: Configure API Permissions

1. In app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Click **Delegated permissions**
5. Search for and add:
   - `Mail.Read`
   - `offline_access`
6. Click **Grant admin consent** if available

## Step 4: Configure Redirect URI

1. In app registration, go to **Authentication** (left sidebar)
2. Click **Add a platform** → **Web**
3. Add Redirect URIs:
   - `http://localhost:3001/api/email/outlook/callback` (for development)
   - `https://yourdomain.com/api/email/outlook/callback` (for production)
4. Enable **Access tokens** checkbox
5. Click **Configure**

## Step 5: Configure Environment Variables

Update `.env.local`:

```env
# Outlook OAuth - Replace with your credentials from Azure
OUTLOOK_CLIENT_ID=xxxxx-xxxxx-xxxxx-xxxxx
OUTLOOK_CLIENT_SECRET=XXXXXXX~xxxxxxxx_xxxxxxxx-xx
```

## Step 6: Test Outlook Connection

1. Start both servers:
   ```bash
   cd server && npm run dev
   cd web && npm run dev
   ```

2. Log in to NexusGuard
3. Go to Settings → Privacy & Consent
4. Click "Connect Outlook"
5. You'll be redirected to Microsoft login
6. Grant permissions
7. You should be redirected back with "Connected"

## What We Access

- **Read emails** from your Outlook inbox
- **Sender, subject, and content** for scam analysis
- **NO modifications** to your emails
- **NO access** to your password

## Automatic Email Sync

Once connected:
- Last 30 days of emails are imported
- New emails are analyzed for scams
- Each email receives a scam probability score
- High-risk alerts are sent in real-time

## Revoking Access

To revoke Outlook access:
1. Go to https://myapps.microsoft.com
2. Find NexusGuard in your apps
3. Click the three dots and select **Remove**

You can reconnect anytime.

## Troubleshooting

### "Invalid redirect URI"
- Verify redirect URI in Azure matches exactly
- Ensure `OUTLOOK_CLIENT_ID` and `OUTLOOK_CLIENT_SECRET` are correct

### Emails not syncing
- Verify Mail.Read permission was granted
- Try "Sync Now" button in Settings
- Check server logs for errors
- Ensure your inbox has emails from the last 30 days

### "Access denied"
- Verify your Microsoft account has an Outlook mailbox
- Check that admin hasn't restricted app access
- Try disconnecting and reconnecting

## Production Setup

Before going live:

1. Register your app in production Azure tenant if different
2. Update redirect URI to production domain
3. Update `.env` with production credentials
4. Add production domain to Azure app registration
5. Test with a few emails first
6. Monitor sync logs

## Multiple Email Accounts

You can connect both Gmail and Outlook simultaneously:
1. Connect Gmail first
2. Go back to Settings
3. Connect Outlook
4. Both email accounts will be analyzed for scams

## Support

If you have issues:
1. Check Azure app registration permissions
2. Verify client ID and secret match
3. Ensure redirect URI is exact match
4. Check browser console for error messages
5. Review server logs for API errors
