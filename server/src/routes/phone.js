import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import phoneValidator from '../services/phoneValidator.js';

const router = express.Router();

router.post('/validate', verifyToken, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
    }

    const result = await phoneValidator.validatePhoneNumber(phoneNumber);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    // Store validation in database if needed
    const { email } = req.auth;
    const prisma = req.app.locals.prisma;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    await prisma.phoneValidation.create({
      data: {
        userId: user.id,
        phoneNumber: result.phoneNumber,
        formatted: result.formattedNumber,
        country: result.countryCode.country,
        carrier: result.carrier,
        riskLevel: result.riskLevel,
        threatLevel: result.threatLevel,
        isSpam: result.isSpam,
        flags: result.flags,
        warnings: result.warnings,
      },
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Phone validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/history', verifyToken, async (req, res) => {
  try {
    const { email } = req.auth;
    const prisma = req.app.locals.prisma;
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);
    const pageOffset = Math.max(parseInt(req.query.offset) || 0, 0);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validations = await prisma.phoneValidation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: pageLimit,
      skip: pageOffset,
    });

    const total = await prisma.phoneValidation.count({
      where: { userId: user.id },
    });

    res.json({
      success: true,
      data: validations,
      total,
    });
  } catch (error) {
    console.error('Phone history error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
