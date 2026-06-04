import axios from 'axios';

const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';
const AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0';

export function createOutlookOAuthUrl(userId) {
  const scopes = encodeURIComponent([
    'https://graph.microsoft.com/Mail.Read',
    'offline_access',
  ].join(' '));

  const redirectUri = `${process.env.BACKEND_URL}/api/email/outlook/callback`;

  const url = `${AUTH_URL}/authorize?` +
    `client_id=${process.env.OUTLOOK_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scopes}` +
    `&state=${userId}`;

  return url;
}

export async function handleOutlookCallback(code, userId, prisma) {
  try {
    const redirectUri = `${process.env.BACKEND_URL}/api/email/outlook/callback`;

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      `${AUTH_URL}/token`,
      {
        client_id: process.env.OUTLOOK_CLIENT_ID,
        client_secret: process.env.OUTLOOK_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    // Get user email from Microsoft Graph
    const profileResponse = await axios.get(
      `${GRAPH_API_URL}/me`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userEmail = profileResponse.data.userPrincipalName;

    // Store refresh token
    await prisma.user.update({
      where: { id: userId },
      data: {
        outlookRefreshToken: refresh_token,
      },
    });

    // Trigger email backfill (async)
    syncOutlookEmails(userId, access_token, prisma);

    return userEmail;
  } catch (error) {
    console.error('Outlook callback error:', error);
    throw error;
  }
}

export async function syncOutlookEmails(userId, accessToken, prisma, daysBack = 30) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Calculate date range
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);
    const isoDate = fromDate.toISOString();

    // List emails from last N days
    const messagesResponse = await axios.get(
      `${GRAPH_API_URL}/me/mailFolders/inbox/messages?$filter=receivedDateTime gt ${isoDate}&$top=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const messages = messagesResponse.data.value || [];
    console.log(`Found ${messages.length} emails from last ${daysBack} days`);

    // Store each email
    for (const message of messages) {
      try {
        // Check if already exists
        const exists = await prisma.email.findFirst({
          where: {
            userId: user.id,
            sender: message.from.emailAddress.address,
            subject: message.subject,
            createdAt: {
              gte: new Date(new Date(message.receivedDateTime).getTime() - 60000),
            },
          },
        });

        if (!exists) {
          await prisma.email.create({
            data: {
              userId: user.id,
              sender: message.from.emailAddress.address,
              subject: message.subject,
              bodyPreview: message.bodyPreview || message.body?.content?.substring(0, 500) || '',
              rawEmail: JSON.stringify(message),
            },
          });
        }
      } catch (error) {
        console.error(`Error storing message ${message.id}:`, error.message);
      }
    }

    console.log(`✓ Outlook sync completed for user ${userId}`);
  } catch (error) {
    console.error('Outlook sync error:', error);
    throw error;
  }
}

export async function getOutlookAuthStatus(userId, prisma) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return {
    connected: !!user.outlookRefreshToken,
    email: user.email,
  };
}

export async function refreshOutlookToken(userId, prisma) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user.outlookRefreshToken) {
      throw new Error('No refresh token stored');
    }

    const tokenResponse = await axios.post(
      `${AUTH_URL}/token`,
      {
        client_id: process.env.OUTLOOK_CLIENT_ID,
        client_secret: process.env.OUTLOOK_CLIENT_SECRET,
        refresh_token: user.outlookRefreshToken,
        grant_type: 'refresh_token',
      }
    );

    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}
