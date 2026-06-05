import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import { analyzeEmailForScam } from '../services/scamAnalyzer.js';
import { resetMonthlyEmailUsage } from '../services/stripe.js';
import { sendScamAlertEmail } from '../services/emailNotifier.js';

export const emailRouter = express.Router();

// Analyze incoming email for scam
emailRouter.post('/analyze', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { sender, subject, bodyPreview } = req.body;

  if (!sender || !subject || !bodyPreview) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get or create user
    let user = await req.app.locals.prisma.user.findFirst({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await req.app.locals.prisma.user.create({
        data: {
          clerkId: userId,
          email: req.auth.email || `user-${userId}@test.local`,
        },
      });
    }

    if (!user.emailConsent) {
      return res.status(403).json({ error: 'Email analysis not consented' });
    }

    // Check monthly limit
    const monthlyLimit = await resetMonthlyEmailUsage(user.id, req.app.locals.prisma);

    if (user.monthlyEmailUsage >= monthlyLimit && monthlyLimit > 0) {
      return res.status(429).json({
        error: 'Monthly email limit reached',
        tier: user.subscriptionTier,
        monthlyLimit,
        used: user.monthlyEmailUsage,
        upgradeUrl: '/api/stripe/checkout',
      });
    }

    // Analyze with Claude
    const analysis = await analyzeEmailForScam(
      req.app.locals.anthropic,
      { sender, subject, bodyPreview }
    );

    // Store email record
    const email = await req.app.locals.prisma.email.create({
      data: {
        userId: user.id,
        sender,
        subject,
        bodyPreview,
        scamScore: analysis.probability,
        claudeReasoning: analysis.reasoning,
        alertSent: analysis.probability > 70,
      },
    });

    // Increment usage (for free tier tracking)
    await req.app.locals.prisma.user.update({
      where: { id: user.id },
      data: {
        monthlyEmailUsage: {
          increment: 1,
        },
      },
    });

    // If high scam probability, create alert and send notifications
    if (analysis.probability > 70) {
      await req.app.locals.prisma.alert.create({
        data: {
          userId: user.id,
          type: 'email',
          entityId: email.id,
          scamScore: analysis.probability,
          alertSentAt: new Date(),
        },
      });

      // Emit real-time WebSocket event
      req.app.locals.io.to(`user:${user.id}`).emit('scam_detected', {
        type: 'email',
        probability: analysis.probability,
        sender,
        subject,
        timestamp: new Date(),
      });

      // Send email notification (async, don't wait)
      sendScamAlertEmail(user.email, {
        type: 'email',
        probability: analysis.probability,
        sender,
        subject,
      }).catch((error) => {
        console.error('Failed to send alert email:', error);
      });
    }

    res.json({
      email,
      analysis,
      monthlyUsage: {
        used: user.monthlyEmailUsage + 1,
        limit: monthlyLimit,
      },
    });
  } catch (error) {
    console.error('Email analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's emails with scores
emailRouter.get('/history', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const emails = await req.app.locals.prisma.email.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await req.app.locals.prisma.email.count({
      where: { userId: user.id },
    });

    res.json({ emails, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete email (for GDPR compliance)
emailRouter.delete('/:emailId', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { emailId } = req.params;

  try {
    const email = await req.app.locals.prisma.email.findUnique({
      where: { id: emailId },
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (email.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await req.app.locals.prisma.email.delete({
      where: { id: emailId },
    });

    // Log audit trail
    await req.app.locals.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'EMAIL_DELETED',
        resourceType: 'EMAIL',
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
