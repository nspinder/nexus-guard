import { verifyAuth } from '@clerk/backend';

// Clerk middleware - verifies JWT from Clerk
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    if (!clerkSecretKey) {
      console.error('CLERK_SECRET_KEY not configured');
      return res.status(500).json({ error: 'Auth configuration error' });
    }

    // Verify the token with Clerk
    const auth = await verifyAuth({
      token,
      secretKey: clerkSecretKey,
    });

    req.auth = {
      userId: auth.claims.sub, // Clerk user ID
      email: auth.claims.email,
    };

    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
