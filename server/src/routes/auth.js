import express from 'express';
import { verifyToken } from '../middleware/clerk.js';

export const authRouter = express.Router();

// Helper function to get or create user
async function getOrCreateUser(userId, email, prisma) {
  try {
    // Try to find by userId first (our test ID format)
    let user = await prisma.user.findFirst({
      where: { clerkId: userId },
    });

    // If not found, try to find by email
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    // If still not found, create new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email || `user-${userId}@test.local`,
        },
      });
      console.log(`✓ Created new user: ${user.id}`);
    }

    return user;
  } catch (error) {
    console.error('Get or create user error:', error);
    throw error;
  }
}

// Sync/create user on first login
authRouter.post('/sync', verifyToken, async (req, res) => {
  const { userId, email } = req.auth;

  try {
    const user = await getOrCreateUser(userId, email, req.app.locals.prisma);
    res.json({ user });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
authRouter.get('/me', verifyToken, async (req, res) => {
  const { userId, email } = req.auth;

  try {
    const user = await getOrCreateUser(userId, email, req.app.locals.prisma);

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
  const { userId, email } = req.auth;
  const { emailConsent, callConsent } = req.body;

  try {
    const user = await getOrCreateUser(userId, email, req.app.locals.prisma);

    const updatedUser = await req.app.locals.prisma.user.update({
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

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Consent update error:', error);
    res.status(500).json({ error: error.message });
  }
});
