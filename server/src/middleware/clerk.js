import tokenService from '../services/tokenService.js';

// Verify token validity
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');

    // Verify token with token service
    const verification = tokenService.verify(token);

    if (!verification.valid) {
      return res.status(401).json({ error: verification.error || 'Invalid token' });
    }

    // Attach auth data to request
    req.auth = {
      userId: verification.userId,
      email: verification.email,
    };

    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
