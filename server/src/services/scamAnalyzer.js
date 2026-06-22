export async function analyzeEmailForScam(anthropic, email) {
  const prompt = `You are a scam detection expert. Analyze this email and provide:
1. Scam probability (0-100)
2. Key red flags (if any)
3. Risk level (low/medium/high)

Email:
From: ${email.sender}
Subject: ${email.subject}
Body: ${email.bodyPreview}

Respond in JSON format only (no other text):
{
  "probability": <number 0-100>,
  "flags": [<list of red flags>],
  "risk": "<low|medium|high>",
  "reasoning": "<brief explanation>"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    if (!message.content || !message.content[0] || !message.content[0].text) {
      throw new Error('Invalid response from Claude API');
    }

    const responseText = message.content[0].text.trim();
    const analysis = JSON.parse(responseText);

    // Validate response structure
    if (typeof analysis.probability !== 'number' || analysis.probability < 0 || analysis.probability > 100) {
      analysis.probability = 30;
    }

    return analysis;
  } catch (error) {
    console.error('Claude API error:', error);
    // Fallback: simple keyword-based scoring
    return {
      probability: 30,
      flags: ['API error - using fallback'],
      risk: 'low',
      reasoning: 'Could not reach Claude API',
    };
  }
}

export async function analyzeCallForScam(anthropic, call) {
  const prompt = `You are a scam detection expert. Analyze this phone call metadata and assess scam probability:

Call Metadata:
Caller ID: ${call.callerId || 'Unknown'}
Phone Number: ${call.phoneNumber}
Call Duration: ${call.callDurationSeconds} seconds

Respond in JSON format only:
{
  "probability": <number 0-100>,
  "flags": [<list of red flags>],
  "risk": "<low|medium|high>",
  "reasoning": "<brief explanation>"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    if (!message.content || !message.content[0] || !message.content[0].text) {
      throw new Error('Invalid response from Claude API');
    }

    const responseText = message.content[0].text.trim();
    const analysis = JSON.parse(responseText);

    // Validate response structure
    if (typeof analysis.probability !== 'number' || analysis.probability < 0 || analysis.probability > 100) {
      analysis.probability = 20;
    }

    return analysis;
  } catch (error) {
    console.error('Claude API error:', error);
    return {
      probability: 20,
      flags: ['API error'],
      risk: 'low',
      reasoning: 'Could not reach Claude API',
    };
  }
}

export async function analyzeMessageForScam(anthropic, message) {
  const prompt = `You are a scam detection expert. Your job is to identify ACTUAL SCAMS and FRAUD attempts, NOT just spam or marketing messages.

A SCAM typically involves:
- Phishing attempts (fake links, credential theft)
- Financial fraud (money transfers, fake payments)
- Identity theft (personal info requests)
- Impersonation (pretending to be authority/company)
- Malware/dangerous links
- Romance/investment scams

Do NOT flag:
- Regular marketing messages
- Legitimate business promotions
- Normal conversation
- Casual greetings or jokes
- Standard customer service

Analyze this WhatsApp message:
From: ${message.sender}
Message: ${message.messageText}

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "probability": <0-100, where 70+ is high risk fraud>,
  "flags": [<specific red flags found, or empty array>],
  "risk": "<low|medium|high>",
  "reasoning": "<brief explanation of why this is or isn't a scam>"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = response.content[0].text.trim();

    // Handle cases where response might have markdown code blocks
    let jsonText = responseText;
    if (responseText.includes('```json')) {
      jsonText = responseText.split('```json')[1].split('```')[0];
    } else if (responseText.includes('```')) {
      jsonText = responseText.split('```')[1].split('```')[0];
    }

    const analysis = JSON.parse(jsonText.trim());

    // Validate the response
    if (typeof analysis.probability !== 'number' || analysis.probability < 0 || analysis.probability > 100) {
      analysis.probability = 0;
    }
    if (!['low', 'medium', 'high'].includes(analysis.risk)) {
      analysis.risk = 'low';
    }
    if (!Array.isArray(analysis.flags)) {
      analysis.flags = [];
    }

    return analysis;
  } catch (error) {
    console.error('Claude API error:', error);
    return {
      probability: 0,
      flags: [],
      risk: 'low',
      reasoning: 'Analysis unavailable',
    };
  }
}
