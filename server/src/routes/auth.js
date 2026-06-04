import express from 'express';
import { verifyToken } from '../middleware/clerk.js';

export const authRouter = express.Router();

// Sync/create user from Clerk on first login
authRouter.post('/sync', verifyToken, async (req, res) => {
  const { userId, email } = req.auth;

  try {
    const user = await req.app.locals.prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email, // Update email in case it changed
      },
      create: {
        clerkId: userId,
        email,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
authRouter.get('/me', verifyToken, async (req, res) => {
  const { userId } = req.auth;

  try {
    let user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // If user doesn't exist in our DB, create them
    if (!user) {
      user = await req.app.locals.prisma.user.create({
        data: {
          clerkId: userId,
          email: req.auth.email,
        },
      });
    }

    // Get usage stats
    const emailCount = await req.app.locals.prisma.email.count({
      where: { userId: user.id },
    });

    const callCount = await req.app.locals.prisma.callLog.count({
      where: { userId: user.id },
    });

    res.json({
      user,
      stats: {
        emailsAnalyzed: emailCount,
        callsAnalyzed: callCount,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update consent
authRouter.patch('/consent', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { emailConsent, callConsent } = req.body;

  try {
    let user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await req.app.locals.prisma.user.create({
        data: {
          clerkId: userId,
          email: req.auth.email,
        },
      });
    }

    user = await req.app.locals.prisma.user.update({
      where: { id: user.id },
      data: {
        emailConsent: emailConsent !== undefined ? emailConsent : user.emailConsent,
        callConsent: callConsent !== undefined ? callConsent : user.callConsent,
      },
    });

    // Log audit trail
    await req.app.locals.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CONSENT_UPDATED',
        resourceType: 'USER',
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Consent update error:', error);
    res.status(500).json({ error: error.message });
  }
});
