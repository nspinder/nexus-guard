import { google } from 'googleapis';

const gmail = google.gmail('v1');

export async function createGmailOAuthUrl(userId) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${process.env.BACKEND_URL}/api/email/gmail/callback`
  );

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: userId,
  });

  return url;
}

export async function handleGmailCallback(code, userId, prisma) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/email/gmail/callback`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user email from Gmail
    const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmailClient.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress;

    // Store tokens
    await prisma.user.update({
      where: { id: userId },
      data: {
        gmailRefreshToken: tokens.refresh_token || null,
      },
    });

    // Trigger email backfill (async)
    syncGmailEmails(userId, oauth2Client, prisma);

    return userEmail;
  } catch (error) {
    console.error('Gmail callback error:', error);
    throw error;
  }
}

export async function syncGmailEmails(userId, oauth2Client, prisma, daysBack = 30) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });

    // Calculate date range
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);
    const query = `after:${Math.floor(fromDate.getTime() / 1000)}`;

    // List emails
    const res = await gmailClient.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100,
    });

    const messages = res.data.messages || [];
    console.log(`Found ${messages.length} emails from last ${daysBack} days`);

    // Fetch and store each email
    for (const message of messages) {
      try {
        const msg = await gmailClient.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
        });

        const email = parseGmailMessage(msg.data);

        // Check if already exists
        const exists = await prisma.email.findFirst({
          where: {
            userId: user.id,
            sender: email.from,
            subject: email.subject,
            createdAt: {
              gte: new Date(email.date.getTime() - 60000), // Within 1 minute
            },
          },
        });

        if (!exists) {
          await prisma.email.create({
            data: {
              userId: user.id,
              sender: email.from,
              subject: email.subject,
              bodyPreview: email.text.substring(0, 500),
              rawEmail: JSON.stringify(email), // Store full email
            },
          });
        }
      } catch (error) {
        console.error(`Error fetching message ${message.id}:`, error.message);
      }
    }

    console.log(`✓ Gmail sync completed for user ${userId}`);
  } catch (error) {
    console.error('Gmail sync error:', error.message);
    throw error;
  }
}

function parseGmailMessage(message) {
  const headers = message.payload.headers || [];

  const getHeader = (name) => {
    const header = headers.find(h => h.name === name);
    return header ? header.value : '';
  };

  let body = '';
  if (message.payload.parts) {
    // Multi-part message
    const part = message.payload.parts.find(p => p.mimeType === 'text/plain');
    if (part) {
      body = Buffer.from(part.body.data || '', 'base64').toString('utf-8');
    }
  } else {
    // Simple message
    body = Buffer.from(message.payload.body.data || '', 'base64').toString('utf-8');
  }

  return {
    from: getHeader('From'),
    subject: getHeader('Subject'),
    date: new Date(parseInt(message.internalDate)),
    text: body,
  };
}

export async function getGmailAuthStatus(userId, prisma) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return {
    connected: !!user.gmailRefreshToken,
    email: user.email,
  };
}
