import { Resend } from 'resend';

let resend = null;

// Initialize Resend only if API key is provided
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'alerts@nexusguard.com';

export async function sendScamAlertEmail(userEmail, scamData) {
  try {
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn('Resend not configured, skipping email notification');
      return { success: false, reason: 'No API key' };
    }

    const { type, probability, sender, phoneNumber, subject } = scamData;

    const emailContent = generateEmailContent(type, probability, sender, phoneNumber, subject);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `🚨 NexusGuard Scam Alert - ${probability}% Suspicious`,
      html: emailContent,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      return { success: false, error: result.error };
    }

    console.log(`✓ Scam alert email sent to ${userEmail}`);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Email notification error:', error);
    return { success: false, error: error.message };
  }
}

function generateEmailContent(type, probability, sender, phoneNumber, subject) {
  const riskColor = probability > 85 ? '#ef4444' : probability > 70 ? '#f97316' : '#eab308';
  const riskLevel = probability > 85 ? 'CRITICAL' : probability > 70 ? 'HIGH' : 'MEDIUM';

  if (type === 'email') {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 24px; }
    .content { padding: 24px; }
    .alert-box {
      border-left: 4px solid ${riskColor};
      background: ${riskColor}15;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .risk-badge {
      display: inline-block;
      background: ${riskColor};
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .detail-item { margin: 12px 0; }
    .label { color: #6b7280; font-size: 12px; }
    .value { color: #1f2937; font-weight: 500; }
    .footer { background: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 12px; }
    a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🚨 Scam Alert</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Potential scam detected in your email</p>
    </div>

    <div class="content">
      <div class="alert-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span>Scam Probability</span>
          <span class="risk-badge">${probability}% - ${riskLevel}</span>
        </div>
        <div style="background: white; border-radius: 4px; height: 8px; overflow: hidden;">
          <div style="background: ${riskColor}; height: 100%; width: ${probability}%;"></div>
        </div>
      </div>

      <h2 style="margin: 0 0 16px 0; color: #1f2937;">Email Details</h2>

      <div class="detail-item">
        <div class="label">FROM</div>
        <div class="value">${sender}</div>
      </div>

      <div class="detail-item">
        <div class="label">SUBJECT</div>
        <div class="value">${subject || '(no subject)'}</div>
      </div>

      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 12px 0; color: #1f2937;">What to do</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin: 8px 0;">Check the sender's email address carefully</li>
          <li style="margin: 8px 0;">Don't click suspicious links</li>
          <li style="margin: 8px 0;">Don't download unexpected attachments</li>
          <li style="margin: 8px 0;">Report to your email provider if it's spam/phishing</li>
        </ul>
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <a href="https://nexusguard.com/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; font-weight: 500;">View in NexusGuard</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0;">This is an automated alert from NexusGuard. <a href="https://nexusguard.com/unsubscribe">Manage notifications</a></p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Phone call alert
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 24px; }
    .content { padding: 24px; }
    .alert-box {
      border-left: 4px solid ${riskColor};
      background: ${riskColor}15;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .risk-badge {
      display: inline-block;
      background: ${riskColor};
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .detail-item { margin: 12px 0; }
    .label { color: #6b7280; font-size: 12px; }
    .value { color: #1f2937; font-weight: 500; font-family: monospace; }
    .footer { background: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 12px; }
    a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">📞 Call Alert</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Suspicious phone call detected</p>
    </div>

    <div class="content">
      <div class="alert-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span>Scam Probability</span>
          <span class="risk-badge">${probability}% - ${riskLevel}</span>
        </div>
        <div style="background: white; border-radius: 4px; height: 8px; overflow: hidden;">
          <div style="background: ${riskColor}; height: 100%; width: ${probability}%;"></div>
        </div>
      </div>

      <h2 style="margin: 0 0 16px 0; color: #1f2937;">Call Details</h2>

      <div class="detail-item">
        <div class="label">PHONE NUMBER</div>
        <div class="value">${phoneNumber}</div>
      </div>

      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <h3 style="margin: 0 0 12px 0; color: #1f2937;">Stay Safe</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin: 8px 0;">Don't answer calls from unknown numbers</li>
          <li style="margin: 8px 0;">Legitimate companies never ask for sensitive info via phone</li>
          <li style="margin: 8px 0;">Hang up and call the company directly using official number</li>
          <li style="margin: 8px 0;">Report to FTC or local authorities if threatened</li>
        </ul>
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <a href="https://nexusguard.com/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; font-weight: 500;">View in NexusGuard</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0;">This is an automated alert from NexusGuard. <a href="https://nexusguard.com/unsubscribe">Manage notifications</a></p>
    </div>
  </div>
</body>
</html>
  `;
}
