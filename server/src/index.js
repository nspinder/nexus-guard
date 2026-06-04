import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { authRouter } from './routes/auth.js';
import { emailRouter } from './routes/email.js';
import { callRouter } from './routes/call.js';
import { stripeRouter } from './routes/stripe.js';
import { gmailRouter } from './routes/gmail.js';
import { outlookRouter } from './routes/outlook.js';

dotenv.config({ path: '../.env.local' });

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
app.use('/api/stripe', stripeRouter);
app.use('/api/email/gmail', gmailRouter);
app.use('/api/email/outlook', outlookRouter);

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
