import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import { analyzeCallForScam } from '../services/scamAnalyzer.js';
import { sendScamAlertEmail } from '../services/emailNotifier.js';

export const callRouter = express.Router();

// Analyze incoming call (real-time)
callRouter.post('/analyze', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { callerId, phoneNumber, callDurationSeconds } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || !user.callConsent) {
      return res.status(403).json({ error: 'Call analysis not consented' });
    }

    // Analyze with Claude
    const analysis = await analyzeCallForScam(req.app.locals.anthropic, {
      callerId,
      phoneNumber,
      callDurationSeconds,
    });

    // Store call log
    const callLog = await req.app.locals.prisma.callLog.create({
      data: {
        userId: user.id,
        callerId,
        phoneNumber,
        callDurationSeconds,
        scamScore: analysis.probability,
        claudeReasoning: analysis.reasoning,
        alertSent: analysis.probability > 75,
      },
    });

    // If high scam probability, create alert and send notifications
    if (analysis.probability > 75) {
      await req.app.locals.prisma.alert.create({
        data: {
          userId: user.id,
          type: 'call',
          entityId: callLog.id,
          scamScore: analysis.probability,
          alertSentAt: new Date(),
        },
      });

      // Send email notification (async, don't wait)
      sendScamAlertEmail(user.email, {
        type: 'call',
        probability: analysis.probability,
        phoneNumber,
      }).catch((error) => {
        console.error('Failed to send alert email:', error);
      });
    }

    res.json({
      callLog,
      analysis,
      shouldAlert: analysis.probability > 75,
    });
  } catch (error) {
    console.error('Call analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get call history
callRouter.get('/history', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const calls = await req.app.locals.prisma.callLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await req.app.locals.prisma.callLog.count({
      where: { userId: user.id },
    });

    res.json({ calls, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete call log
callRouter.delete('/:callId', verifyToken, async (req, res) => {
  const { userId } = req.auth;
  const { callId } = req.params;

  try {
    const callLog = await req.app.locals.prisma.callLog.findUnique({
      where: { id: callId },
    });

    if (!callLog) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const user = await req.app.locals.prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (callLog.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await req.app.locals.prisma.callLog.delete({
      where: { id: callId },
    });

    await req.app.locals.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CALL_DELETED',
        resourceType: 'CALL',
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
