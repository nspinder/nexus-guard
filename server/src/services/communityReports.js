async function createReport(prisma, userId, reportData) {
  const { type, target, threatType, description, evidence } = reportData;

  // Validate inputs
  if (!type || !target || !threatType || !description) {
    throw new Error('Missing required fields');
  }

  if (!['url', 'phone', 'email'].includes(type)) {
    throw new Error('Invalid report type');
  }

  if (!['phishing', 'malware', 'spam', 'scam', 'other'].includes(threatType)) {
    throw new Error('Invalid threat type');
  }

  try {
    // Check if user already reported this
    const existing = await prisma.communityReport.findUnique({
      where: {
        userId_target_type: {
          userId,
          target,
          type,
        },
      },
    });

    if (existing) {
      return { success: false, message: 'You already reported this' };
    }

    // Create the report
    const report = await prisma.communityReport.create({
      data: {
        userId,
        type,
        target,
        threatType,
        description,
        evidence: evidence || null,
      },
    });

    return { success: true, report };
  } catch (error) {
    if (error.code === 'P2002') {
      return { success: false, message: 'You already reported this' };
    }
    throw error;
  }
}

async function getReports(prisma, filters = {}) {
  const { type, target, status, limit = 50, offset = 0 } = filters;

  const where = {};
  if (type) where.type = type;
  if (target) where.target = target;
  if (status) where.status = status;

  const [reports, total] = await Promise.all([
    prisma.communityReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: {
        votes: {
          select: { voteType: true },
        },
      },
    }),
    prisma.communityReport.count({ where }),
  ]);

  // Format reports with vote counts
  const formatted = reports.map(report => ({
    ...report,
    upvotes: report.votes.filter(v => v.voteType === 'upvote').length,
    downvotes: report.votes.filter(v => v.voteType === 'downvote').length,
    votes: undefined, // Remove detailed votes array
  }));

  return { reports: formatted, total };
}

async function voteOnReport(prisma, userId, reportId, voteType) {
  if (!['upvote', 'downvote'].includes(voteType)) {
    throw new Error('Invalid vote type');
  }

  try {
    // Check if user already voted
    const existing = await prisma.communityVote.findUnique({
      where: {
        userId_reportId: {
          userId,
          reportId,
        },
      },
    });

    if (existing) {
      // Update vote
      if (existing.voteType === voteType) {
        // Remove vote if same type
        await prisma.communityVote.delete({
          where: { id: existing.id },
        });
      } else {
        // Change vote
        await prisma.communityVote.update({
          where: { id: existing.id },
          data: { voteType },
        });
      }
    } else {
      // Create new vote
      await prisma.communityVote.create({
        data: {
          userId,
          reportId,
          voteType,
        },
      });
    }

    // Recalculate votes
    const votes = await prisma.communityVote.findMany({
      where: { reportId },
      select: { voteType: true },
    });

    const upvotes = votes.filter(v => v.voteType === 'upvote').length;
    const downvotes = votes.filter(v => v.voteType === 'downvote').length;

    // Update report vote counts
    await prisma.communityReport.update({
      where: { id: reportId },
      data: {
        upvotes,
        downvotes,
      },
    });

    return { success: true, upvotes, downvotes };
  } catch (error) {
    if (error.code === 'P2025') {
      throw new Error('Report not found');
    }
    throw error;
  }
}

async function getUserVotes(prisma, userId, reportIds) {
  const votes = await prisma.communityVote.findMany({
    where: {
      userId,
      reportId: { in: reportIds },
    },
    select: {
      reportId: true,
      voteType: true,
    },
  });

  const voteMap = {};
  votes.forEach(vote => {
    voteMap[vote.reportId] = vote.voteType;
  });

  return voteMap;
}

async function searchReports(prisma, query) {
  // Search for reports by target (URL, phone, email)
  const reports = await prisma.communityReport.findMany({
    where: {
      target: {
        contains: query,
        mode: 'insensitive',
      },
      status: { not: 'false_positive' },
    },
    orderBy: { upvotes: 'desc' },
    take: 10,
  });

  return reports;
}

export default {
  createReport,
  getReports,
  voteOnReport,
  getUserVotes,
  searchReports,
};
