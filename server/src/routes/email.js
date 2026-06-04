import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import { analyzeEmailForScam } from '../services/scamAnalyzer.js';

export const emailRouter = express.Router();

// Analyze incoming email for scam
emailRouter.post('/analyze', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { sender, subject, bodyPreview } = req.body;

  if (!sender || !subject || !bodyPreview) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || !user.emailConsent) {
      return res.status(403).json({ error: 'Email analysis not consented' });
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

    // If high scam probability, create alert
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
    }

    res.json({
      email,
      analysis,
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
