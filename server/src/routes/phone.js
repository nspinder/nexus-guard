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
    const userId = req.auth.userId;
    const prisma = req.app.locals.prisma;

    await prisma.phoneValidation.create({
      data: {
        userId,
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
    const userId = req.auth.userId;
    const prisma = req.app.locals.prisma;
    const limit = parseInt(req.query.limit) || 50;

    const validations = await prisma.phoneValidation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    res.json({
      success: true,
      data: validations,
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
