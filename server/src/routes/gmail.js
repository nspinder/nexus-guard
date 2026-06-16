import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import {
  createGmailOAuthUrl,
  handleGmailCallback,
  getGmailAuthStatus,
  syncGmailEmails,
} from '../services/gmail.js';
import { google } from 'googleapis';

export const gmailRouter = express.Router();

// Get Gmail OAuth URL
gmailRouter.get('/auth-url', verifyToken, async (req, res) => {
  const { userId } = req.auth;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const authUrl = await createGmailOAuthUrl(user.id);
    res.json({ authUrl });
  } catch (error) {
    console.error('Auth URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gmail OAuth callback
gmailRouter.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  console.log('Gmail callback received:', { code: code ? 'present' : 'missing', state });

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  try {
    const userId = state; // userId was passed as state

    const userEmail = await handleGmailCallback(code, userId, req.app.locals.prisma);
    console.log('Gmail callback success for user:', userId, 'email:', userEmail);

    // Redirect to frontend dashboard with success message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/dashboard?gmail=connected&email=${encodeURIComponent(userEmail)}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Gmail callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/dashboard?gmail=error&message=${encodeURIComponent(error.message)}`;
    console.log('Error redirect to:', redirectUrl);
    res.redirect(redirectUrl);
  }
});

// Check Gmail connection status
gmailRouter.get('/status', verifyToken, async (req, res) => {
  const { userId } = req.auth;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const status = await getGmailAuthStatus(user.id, req.app.locals.prisma);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually sync Gmail emails
gmailRouter.post('/sync', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { daysBack = 30 } = req.body;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.gmailRefreshToken) {
      return res.status(400).json({ error: 'Gmail not connected' });
    }

    // Create OAuth client with stored refresh token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/email/gmail/callback`
    );

    oauth2Client.setCredentials({
      refresh_token: user.gmailRefreshToken,
    });

    // Trigger sync
    await syncGmailEmails(user.id, oauth2Client, req.app.locals.prisma, daysBack);

    res.json({ success: true, message: 'Gmail sync started' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect Gmail
gmailRouter.post('/disconnect', verifyToken, async (req, res) => {
  const { userId } = req.auth;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await req.app.locals.prisma.user.update({
      where: { id: user.id },
      data: {
        gmailRefreshToken: null,
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
