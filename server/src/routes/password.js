import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import passwordChecker from '../services/passwordChecker.js';

const router = express.Router();

router.post('/check', verifyToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
      });
    }

    if (password.length < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid password',
      });
    }

    const result = await passwordChecker.checkPasswordBreach(password);

    // Store check in database if needed
    const userId = req.auth.userId;
    const prisma = req.app.locals.prisma;

    await prisma.passwordCheck.create({
      data: {
        userId,
        isBreach: result.isBreach,
        breachCount: result.breachCount,
        isCommon: result.isCommon,
        strength: result.strengthLevel,
        riskLevel: result.riskLevel,
        threatLevel: result.threatLevel,
      },
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Password check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const prisma = req.app.locals.prisma;
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);

    const checks = await prisma.passwordCheck.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: pageLimit,
    });

    res.json({
      success: true,
      data: checks,
    });
  } catch (error) {
    console.error('Password history error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
