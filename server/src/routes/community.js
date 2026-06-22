import express from 'express';
import { verifyToken } from '../middleware/clerk.js';
import communityReports from '../services/communityReports.js';

const router = express.Router();

// Create a new report
router.post('/reports', verifyToken, async (req, res) => {
  try {
    const { type, target, threatType, description, evidence } = req.body;
    const userId = req.auth.userId;
    const prisma = req.app.locals.prisma;

    const result = await communityReports.createReport(prisma, userId, {
      type,
      target,
      threatType,
      description,
      evidence,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.message });
    }

    res.status(201).json({
      success: true,
      data: result.report,
    });
  } catch (error) {
    console.error('Report creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get reports with filters
router.get('/reports', async (req, res) => {
  try {
    const { type, target, status, limit, offset } = req.query;
    const prisma = req.app.locals.prisma;

    const pageLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const pageOffset = Math.max(parseInt(offset) || 0, 0);

    const result = await communityReports.getReports(prisma, {
      type,
      target,
      status,
      limit: pageLimit,
      offset: pageOffset,
    });

    // If user is authenticated, get their votes
    let userVotes = {};
    if (req.headers.authorization) {
      try {
        const userId = req.headers['x-user-id'];
        if (userId && result.reports.length > 0) {
          userVotes = await communityReports.getUserVotes(
            prisma,
            userId,
            result.reports.map(r => r.id)
          );
        }
      } catch (e) {
        // User not authenticated, continue without votes
      }
    }

    res.json({
      success: true,
      data: result.reports,
      total: result.total,
      userVotes,
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Vote on a report
router.post('/reports/:id/vote', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.auth.userId;
    const prisma = req.app.locals.prisma;

    if (!voteType) {
      return res.status(400).json({
        success: false,
        error: 'Vote type is required',
      });
    }

    const result = await communityReports.voteOnReport(prisma, userId, id, voteType);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Search reports
router.get('/reports/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const prisma = req.app.locals.prisma;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const reports = await communityReports.searchReports(prisma, query);

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get reports for a specific target
router.get('/reports/target/:target', async (req, res) => {
  try {
    const { target } = req.params;
    const prisma = req.app.locals.prisma;

    const reports = await prisma.communityReport.findMany({
      where: {
        target: target,
        status: { not: 'false_positive' },
      },
      orderBy: { upvotes: 'desc' },
      include: {
        votes: {
          select: { voteType: true },
        },
      },
    });

    // Format with vote counts
    const formatted = reports.map(report => ({
      ...report,
      upvotes: report.votes.filter(v => v.voteType === 'upvote').length,
      downvotes: report.votes.filter(v => v.voteType === 'downvote').length,
      votes: undefined,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Target reports error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
