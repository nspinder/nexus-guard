import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { authRouter } from './routes/auth.js';
import { emailRouter } from './routes/email.js';
import { callRouter } from './routes/call.js';
import { stripeRouter } from './routes/stripe.js';
import { gmailRouter } from './routes/gmail.js';

dotenv.config({ path: '../.env.local' });

const app = express();
const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Store prisma & anthropic in app context
app.locals.prisma = prisma;
app.locals.anthropic = anthropic;

// Routes
app.use('/api/auth', authRouter);
app.use('/api/email', emailRouter);
app.use('/api/call', callRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/email/gmail', gmailRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'nexus-guard-server' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✓ NexusGuard server running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
