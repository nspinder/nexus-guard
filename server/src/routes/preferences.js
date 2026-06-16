import express from 'express';
import { verifyToken } from '../middleware/clerk.js';

const router = express.Router();

// GET user preferences
router.get('/', verifyToken, async (req, res) => {
  try {
    const { email } = req.auth;

    const user = await req.app.locals.prisma.user.findUnique({
      where: { email },
      select: {
        lowRiskThreshold: true,
        mediumRiskThreshold: true,
        highRiskThreshold: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      lowRiskThreshold: user.lowRiskThreshold,
      mediumRiskThreshold: user.mediumRiskThreshold,
      highRiskThreshold: user.highRiskThreshold,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// UPDATE user preferences
router.put('/', verifyToken, async (req, res) => {
  try {
    const { email } = req.auth;
    const { lowRiskThreshold, mediumRiskThreshold, highRiskThreshold } = req.body;

    // Validate thresholds
    if (
      typeof lowRiskThreshold !== 'number' ||
      typeof mediumRiskThreshold !== 'number' ||
      typeof highRiskThreshold !== 'number'
    ) {
      return res.status(400).json({ error: 'Invalid threshold values' });
    }

    if (
      lowRiskThreshold < 0 ||
      lowRiskThreshold > 100 ||
      mediumRiskThreshold < 0 ||
      mediumRiskThreshold > 100 ||
      highRiskThreshold < 0 ||
      highRiskThreshold > 100
    ) {
      return res.status(400).json({ error: 'Thresholds must be between 0 and 100' });
    }

    // Ensure proper ordering: low < medium < high
    if (!(lowRiskThreshold < mediumRiskThreshold && mediumRiskThreshold < highRiskThreshold)) {
      return res.status(400).json({
        error: 'Thresholds must be in order: low < medium < high',
      });
    }

    const updated = await req.app.locals.prisma.user.update({
      where: { email },
      data: {
        lowRiskThreshold,
        mediumRiskThreshold,
        highRiskThreshold,
      },
      select: {
        lowRiskThreshold: true,
        mediumRiskThreshold: true,
        highRiskThreshold: true,
      },
    });

    res.json({
      message: 'Preferences updated',
      preferences: updated,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
