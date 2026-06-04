import express from 'express';
import { verifyToken } from '../middleware/clerk.js';

export const authRouter = express.Router();

// Create user on first login
authRouter.post('/signup', verifyToken, async (req, res) => {
  const { email } = req.body;
  const { userId } = req.auth;

  try {
    const user = await req.app.locals.prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email,
      },
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
authRouter.get('/me', verifyToken, async (req, res) => {
  const { userId } = req.auth;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update consent
authRouter.patch('/consent', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { emailConsent, callConsent } = req.body;

  try {
    const user = await req.app.locals.prisma.user.update({
      where: { clerkId: userId },
      data: {
        emailConsent: emailConsent ?? undefined,
        callConsent: callConsent ?? undefined,
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
    res.status(500).json({ error: error.message });
  }
});
