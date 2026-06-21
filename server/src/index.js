import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { authRouter } from './routes/auth.js';
import { emailRouter } from './routes/email.js';
import { callRouter } from './routes/call.js';
import { callsRouter } from './routes/calls.js';
import { stripeRouter } from './routes/stripe.js';
import { gmailRouter } from './routes/gmail.js';
import { outlookRouter } from './routes/outlook.js';
import { whatsappRouter } from './routes/whatsapp.js';
import { imessageRouter } from './routes/imessage.js';
import preferencesRouter from './routes/preferences.js';
import urlScanRouter from './routes/urlScan.js';
import phoneRouter from './routes/phone.js';
import passwordRouter from './routes/password.js';
import communityRouter from './routes/community.js';
import voiceRouter from './routes/voice.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '../../');
const envPath = path.join(projectRoot, '.env.local');

console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.warn('Warning: .env.local not found at', envPath);
} else {
  console.log('✓ .env.local loaded successfully');
  // Manually set environment variables from parsed result
  if (result.parsed) {
    Object.assign(process.env, result.parsed);
  }
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Store prisma, anthropic, & io in app context
app.locals.prisma = prisma;
app.locals.anthropic = anthropic;
app.locals.io = io;

// WebSocket connection handling
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`✓ User ${userId} connected`);
  }

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected`);
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/email', emailRouter);
app.use('/api/call', callRouter);
app.use('/api/calls', callsRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/email/gmail', gmailRouter);
app.use('/api/email/outlook', outlookRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/imessage', imessageRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/url', urlScanRouter);
app.use('/api/phone', phoneRouter);
app.use('/api/password', passwordRouter);
app.use('/api/community', communityRouter);
app.use('/api/voice', voiceRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'nexus-guard-server' });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`✓ NexusGuard server running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
