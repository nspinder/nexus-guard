import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import voiceAnalyzer from '../services/voiceAnalyzer.js';

const router = express.Router();

// Analyze a voice call transcript
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { transcription, duration, callerId, callType } = req.body;
    const userId = req.auth.userId;
    const prisma = req.app.locals.prisma;
    const anthropic = req.app.locals.anthropic;

    if (!transcription) {
      return res.status(400).json({
        success: false,
        error: 'Transcription is required',
      });
    }

    // Analyze the call
    const analysis = await voiceAnalyzer.analyzeVoiceCall(
      anthropic,
      transcription,
      { duration, callerId, callType }
    );

    // Store in database
    const result = await prisma.voiceCallAnalysis.create({
      data: {
        userId,
        transcription,
        duration,
        callerId,
        callType,
        scamIndicators: analysis.scamIndicators,
        deepfakeRisk: analysis.deepfakeRisk.score,
        overallRiskScore: analysis.overallRiskScore,
        threatLevel: analysis.threatLevel,
        suspiciousFactors: analysis.suspiciousFactors,
        voicePatterns: analysis.voicePatterns,
        claudeAnalysis: analysis.claudeAnalysis?.analysis,
        recommendation: analysis.recommendation,
      },
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Voice analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get voice call analysis history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const prisma = req.app.locals.prisma;
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);

    const analyses = await prisma.voiceCallAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: pageLimit,
    });

    res.json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    console.error('Voice history error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get high-risk calls
router.get('/alerts', verifyToken, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const prisma = req.app.locals.prisma;

    const alerts = await prisma.voiceCallAnalysis.findMany({
      where: {
        userId,
        threatLevel: { in: ['warning', 'danger'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Voice alerts error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const prisma = req.app.locals.prisma;

    const [total, danger, warning, safe] = await Promise.all([
      prisma.voiceCallAnalysis.count({ where: { userId } }),
      prisma.voiceCallAnalysis.count({
        where: { userId, threatLevel: 'danger' },
      }),
      prisma.voiceCallAnalysis.count({
        where: { userId, threatLevel: 'warning' },
      }),
      prisma.voiceCallAnalysis.count({
        where: { userId, threatLevel: 'none' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        danger,
        warning,
        safe,
      },
    });
  } catch (error) {
    console.error('Voice stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
