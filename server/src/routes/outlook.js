import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import {
  createOutlookOAuthUrl,
  handleOutlookCallback,
  getOutlookAuthStatus,
  syncOutlookEmails,
  refreshOutlookToken,
} from '../services/outlook.js';

export const outlookRouter = express.Router();

// Get Outlook OAuth URL
outlookRouter.get('/auth-url', verifyToken, async (req, res) => {
  const { userId } = req.auth;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const authUrl = createOutlookOAuthUrl(user.id);
    res.json({ authUrl });
  } catch (error) {
    console.error('Auth URL error:', error.message);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// Outlook OAuth callback
outlookRouter.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  try {
    const userId = state; // userId was passed as state

    const userEmail = await handleOutlookCallback(code, userId, req.app.locals.prisma);

    // Redirect to frontend dashboard with success message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?outlook=connected&email=${encodeURIComponent(userEmail)}`);
  } catch (error) {
    console.error('Outlook callback error:', error.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?outlook=error`);
  }
});

// Check Outlook connection status
outlookRouter.get('/status', verifyToken, async (req, res) => {
  const { userId } = req.auth;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const status = await getOutlookAuthStatus(user.id, req.app.locals.prisma);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually sync Outlook emails
outlookRouter.post('/sync', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { daysBack = 30 } = req.body;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.outlookRefreshToken) {
      return res.status(400).json({ error: 'Outlook not connected' });
    }

    // Refresh access token
    const accessToken = await refreshOutlookToken(user.id, req.app.locals.prisma);

    // Trigger sync
    await syncOutlookEmails(user.id, accessToken, req.app.locals.prisma, daysBack);

    res.json({ success: true, message: 'Outlook sync started' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect Outlook
outlookRouter.post('/disconnect', verifyToken, async (req, res) => {
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
        outlookRefreshToken: null,
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
