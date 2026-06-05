// Clerk middleware - verifies auth from frontend
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    // For development, we'll accept any bearer token
    // In production, you would verify with Clerk's API
    const token = authHeader.replace('Bearer ', '');

    // Extract userId from header (sent by frontend)
    const userId = req.headers['x-user-id'] || req.body?.userId;

    if (!token || !userId) {
      return res.status(401).json({ error: 'Missing auth credentials' });
    }

    req.auth = {
      userId,
      email: req.headers['x-user-email'],
    };

    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
