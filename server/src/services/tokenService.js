import crypto from 'crypto';

class TokenService {
  constructor() {
    // In production, use environment variable for secret
    this.secret = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');
    this.tokens = new Map(); // In-memory store (use Redis in production)
  }

  generate(userId, email) {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Store token with metadata and expiry (24 hours)
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    this.tokens.set(token, {
      userId,
      email,
      createdAt: Date.now(),
      expiresAt,
    });

    return token;
  }

  verify(token) {
    const data = this.tokens.get(token);

    if (!data) {
      return { valid: false, error: 'Token not found' };
    }

    if (data.expiresAt < Date.now()) {
      this.tokens.delete(token);
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, ...data };
  }

  revoke(token) {
    this.tokens.delete(token);
  }

  // Cleanup expired tokens every hour
  startCleanup() {
    setInterval(() => {
      let removed = 0;
      for (const [token, data] of this.tokens.entries()) {
        if (data.expiresAt < Date.now()) {
          this.tokens.delete(token);
          removed++;
        }
      }
      if (removed > 0) {
        console.log(`🧹 Cleaned up ${removed} expired tokens`);
      }
    }, 60 * 60 * 1000); // Every hour
  }
}

export default new TokenService();
