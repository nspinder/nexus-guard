import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import { analyzeMessageForScam } from '../services/scamAnalyzer.js';
import { sendScamAlertEmail } from '../services/emailNotifier.js';
import { getRiskLevel } from '../utils/riskLevel.js';

export const imessageRouter = express.Router();

// Analyze iMessage for scam
imessageRouter.post('/analyze', verifyToken, async (req, res) => {
  const { userId, email } = req.auth;
  const { sender, messageText, iMessageId } = req.body;

  if (!sender || !messageText || !iMessageId) {
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

    // Check if this message already exists (avoid duplicates)
    const existingMessage = await req.app.locals.prisma.iMessage.findUnique({
      where: { iMessageId },
    });

    if (existingMessage) {
      return res.status(409).json({ error: 'Message already analyzed' });
    }

    // Analyze with Claude
    const analysis = await analyzeMessageForScam(req.app.locals.anthropic, {
      sender,
      messageText,
    });

    // Get risk level based on user's thresholds
    const riskLevel = getRiskLevel(analysis.probability, {
      lowRiskThreshold: user.lowRiskThreshold,
      mediumRiskThreshold: user.mediumRiskThreshold,
      highRiskThreshold: user.highRiskThreshold,
    });

    // Store message record
    const message = await req.app.locals.prisma.iMessage.create({
      data: {
        userId: user.id,
        sender,
        messageText,
        iMessageId,
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
          type: 'imessage',
          entityId: message.id,
          scamScore: analysis.probability,
          alertSentAt: new Date(),
        },
      });

      // Emit real-time WebSocket event
      req.app.locals.io.to(`user:${user.id}`).emit('scam_detected', {
        type: 'imessage',
        probability: analysis.probability,
        riskLevel: riskLevel.level,
        color: riskLevel.color,
        sender,
        messageText: messageText.substring(0, 100),
        timestamp: new Date(),
      });

      // Send email notification (async, don't wait)
      sendScamAlertEmail(user.email, {
        type: 'imessage',
        probability: analysis.probability,
        riskLevel: riskLevel.level,
        sender,
        subject: `[${riskLevel.level.toUpperCase()}] iMessage from ${sender}`,
      }).catch((error) => {
        console.error('Failed to send alert email:', error);
      });
    }

    res.json({
      message,
      analysis: {
        ...analysis,
        risk: riskLevel.level,
        color: riskLevel.color,
      },
      shouldAlert: riskLevel.shouldAlert,
    });
  } catch (error) {
    console.error('iMessage analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get iMessage history
imessageRouter.get('/history', verifyToken, async (req, res) => {
  const { userId, email } = req.auth;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const user = await req.app.locals.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const messages = await req.app.locals.prisma.iMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await req.app.locals.prisma.iMessage.count({
      where: { userId: user.id },
    });

    res.json({ messages, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete iMessage
imessageRouter.delete('/:messageId', verifyToken, async (req, res) => {
  const { userId, email } = req.auth;
  const { messageId } = req.params;

  try {
    const message = await req.app.locals.prisma.iMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const user = await req.app.locals.prisma.user.findUnique({
      where: { email },
    });

    if (message.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await req.app.locals.prisma.iMessage.delete({
      where: { id: messageId },
    });

    await req.app.locals.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'IMESSAGE_DELETED',
        resourceType: 'IMESSAGE',
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
