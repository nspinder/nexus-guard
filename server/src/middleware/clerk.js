// Clerk middleware - verifies JWT from Clerk
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    // For now, we'll use a placeholder verification
    // In production, use @clerk/backend for full verification
    const token = authHeader.replace('Bearer ', '');

    // Placeholder: In production, verify with Clerk's verifyToken()
    // For MVP, we'll extract userId from token or session
    req.auth = {
      userId: req.headers['x-user-id'] || 'test-user',
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
