import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import tokenService from '../services/tokenService.js';

export const authRouter = express.Router();

// Login endpoint - generates secure token
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // In production, verify password against hashed password in database
    // For MVP, we'll accept the password as-is (use proper auth like Clerk/Auth0)

    // Generate user ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate secure token
    const token = tokenService.generate(userId, email);

    // Get or create user in database
    const user = await getOrCreateUser(userId, email, req.app.locals.prisma);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        clerkId: user.clerkId,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout endpoint - revokes token
authRouter.post('/logout', verifyToken, (req, res) => {
  // Token is passed in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    tokenService.revoke(token);
  }
  res.json({ success: true });
});

// Helper function to get or create user
async function getOrCreateUser(userId, email, prisma) {
  try {
    const userEmail = email || `user-${userId}@test.local`;

    // Try to find by email first (most reliable for MVP)
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    // If not found, create new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: userEmail,
        },
      });
    } else if (user.clerkId !== userId) {
      // Update clerkId if it changed (e.g., different test session)
      user = await prisma.user.update({
        where: { id: user.id },
        data: { clerkId: userId },
      });
    }

    return user;
  } catch (error) {
    console.error('Get or create user error:', error);
    throw error;
  }
}

// Verify token validity
authRouter.get('/verify', verifyToken, async (req, res) => {
  res.json({ valid: true });
});

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
