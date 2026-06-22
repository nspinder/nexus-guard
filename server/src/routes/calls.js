import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import { analyzeMessageForScam } from '../services/scamAnalyzer.js';
import { sendScamAlertEmail } from '../services/emailNotifier.js';
import { getRiskLevel } from '../utils/riskLevel.js';

export const callsRouter = express.Router();

// Analyze call transcript for scam
callsRouter.post('/analyze', verifyToken, async (req, res) => {
  const { userId, email } = req.auth;
  const { callerId, transcript, platform = 'whatsapp', duration = 0, startTime } = req.body;

  if (!callerId || !transcript) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get or create user
    let user = await req.app.locals.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await req.app.locals.prisma.user.create({
        data: {
          clerkId: userId,
          email: email || `user-${userId}@test.local`,
        },
      });
    }

    // Analyze with Claude
    const analysis = await analyzeMessageForScam(req.app.locals.anthropic, {
      sender: callerId,
      messageText: transcript, // Analyze transcript as if it were a message
    });

    // Get risk level based on user's thresholds
    const riskLevel = getRiskLevel(analysis.probability, {
      lowRiskThreshold: user.lowRiskThreshold,
      mediumRiskThreshold: user.mediumRiskThreshold,
      highRiskThreshold: user.highRiskThreshold,
    });

    // Store call record
    const callRecord = await req.app.locals.prisma.whatsappMessage.create({
      data: {
        userId: user.id,
        sender: callerId,
        messageText: transcript,
        scamScore: analysis.probability,
        claudeReasoning: analysis.reasoning,
        alertSent: riskLevel.shouldAlert,
      },
    });

    // If alert should be sent based on risk level, create alert and send notifications
    if (riskLevel.shouldAlert) {
      await req.app.locals.prisma.alert.create({
        data: {
          userId: user.id,
          type: 'call',
          entityId: callRecord.id,
          scamScore: analysis.probability,
          alertSentAt: new Date(),
        },
      });

      // Emit real-time WebSocket event
      req.app.locals.io.to(`user:${user.id}`).emit('scam_detected', {
        type: 'call',
        probability: analysis.probability,
        riskLevel: riskLevel.level,
        color: riskLevel.color,
        caller: callerId,
        transcript: transcript.substring(0, 100),
        timestamp: new Date(),
      });

      // Send email notification
      sendScamAlertEmail(user.email, {
        type: 'call',
        probability: analysis.probability,
        riskLevel: riskLevel.level,
        caller: callerId,
        subject: `[${riskLevel.level.toUpperCase()}] Suspicious WhatsApp call from ${callerId}`,
      }).catch((error) => {
        console.error('Failed to send alert email:', error);
      });
    }

    res.json({
      message: callRecord,
      analysis: {
        ...analysis,
        risk: riskLevel.level,
        color: riskLevel.color,
      },
      shouldAlert: riskLevel.shouldAlert,
    });
  } catch (error) {
    console.error('Call analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get call history
callsRouter.get('/history', verifyToken, async (req, res) => {
  const { userId, email } = req.auth;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pageLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const pageOffset = Math.max(parseInt(offset) || 0, 0);

    // Get messages that are marked as calls (longer transcripts)
    const calls = await req.app.locals.prisma.whatsappMessage.findMany({
      where: {
        userId: user.id,
        messageText: { gte: 100 }, // Calls have longer transcripts
      },
      orderBy: { createdAt: 'desc' },
      take: pageLimit,
      skip: pageOffset,
    });

    const total = await req.app.locals.prisma.whatsappMessage.count({
      where: {
        userId: user.id,
        messageText: { gte: 100 },
      },
    });

    res.json({ calls, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
