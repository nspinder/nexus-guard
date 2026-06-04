# NexusGuard - Scam Detection Platform

A real-time AI-powered scam detection system for emails and phone calls. Uses Claude API to analyze messages and alert users of potential phishing and fraud attempts.

## Features (Phase 1)

- **Email Analysis**: Analyze incoming emails for scam probability using Claude API
- **Call Analysis**: Assess incoming calls based on metadata (caller ID, phone number, duration)
- **Real-time Alerts**: Get notified immediately if a message is likely a scam (>70% email, >75% call)
- **Privacy-First**: No audio recording, metadata-only analysis for calls
- **User Consent**: Explicit opt-in for email and call analysis
- **Data Retention**: Automatic deletion of analysis data (configurable 30-365 days)
- **GDPR/CCPA Compliant**: Full compliance with privacy regulations

## Project Structure

```
nexus-guard/
├── server/           # Node.js + Express backend
│   ├── src/
│   │   ├── index.js  # Server entry point
│   │   ├── routes/   # API routes (auth, email, call)
│   │   ├── services/ # Business logic (scam analyzer)
│   │   └── middleware/ # Auth, middleware
│   ├── prisma/       # Database schema
│   └── package.json
├── web/              # React frontend
│   ├── src/
│   │   ├── pages/    # Dashboard, Login
│   │   ├── components/ # Email/Call analyzers, alerts
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
├── .env.local        # Environment variables (not committed)
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../web
npm install
```

### 2. Set Up Database

```bash
# Create PostgreSQL database
createdb nexus_guard

# Push Prisma schema
cd server
npx prisma db push

# Open Prisma Studio (optional)
npx prisma studio
```

### 3. Configure Environment

The `.env.local` file already contains:
- `ANTHROPIC_API_KEY` - Claude API key
- `DATABASE_URL` - PostgreSQL connection
- Other placeholders for OAuth (will set up later)

### 4. Start the Application

```bash
# Terminal 1: Start backend (from /server)
npm run dev
# Runs on http://localhost:3001

# Terminal 2: Start frontend (from /web)
npm run dev
# Runs on http://localhost:3000
```

## Phase 1 API Endpoints

### Auth
- `POST /api/auth/signup` - Create new user
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/consent` - Update consent preferences

### Email Analysis
- `POST /api/email/analyze` - Analyze email for scams
- `GET /api/email/history` - Get user's email analysis history
- `DELETE /api/email/:emailId` - Delete email record (GDPR)

### Call Analysis
- `POST /api/call/analyze` - Analyze call for scams
- `GET /api/call/history` - Get user's call analysis history
- `DELETE /api/call/:callId` - Delete call record (GDPR)

## Next Steps (Phase 2)

- [ ] Implement Clerk authentication
- [ ] Set up Stripe for subscription management
- [ ] Add Gmail OAuth integration for email sync
- [ ] Implement Outlook OAuth integration
- [ ] Build iOS call detection (CallKit)
- [ ] Build Android call detection (Telecom Framework)
- [ ] Add WebSocket support for real-time alerts
- [ ] Implement SMS/text message integration
- [ ] Fine-tune Claude model with scam data
- [ ] Deploy to production (Vercel for frontend, Cloud Run/Railway for backend)

## Database Schema

See `server/prisma/schema.prisma` for full schema. Key tables:
- **User** - User accounts and consent preferences
- **Email** - Analyzed emails with scam scores
- **CallLog** - Analyzed calls with scam scores
- **Alert** - Real-time scam alerts sent to users
- **AuditLog** - Audit trail for compliance

## Compliance Notes

- **GDPR**: Includes data retention, deletion, and consent management
- **CCPA**: Right to deletion and data access
- **TCPA**: Call recording restrictions (user consent required)
- **Email**: Metadata only, no permanent storage of email bodies

## Testing

Test the email analyzer by submitting this sample phishing email:
```
From: support@bank-secure.com
Subject: Verify Your Account Immediately
Body: Your account has suspicious activity. Click here to verify your identity within 24 hours or your account will be locked.
```

Expected: High scam probability (>70%), red flags for urgency and spoofed email.

## License

Proprietary - NexusGuard
