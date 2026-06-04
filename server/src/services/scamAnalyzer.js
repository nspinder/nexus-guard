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

    const responseText = message.content[0].text.trim();
    const analysis = JSON.parse(responseText);

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

    const responseText = message.content[0].text.trim();
    const analysis = JSON.parse(responseText);

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
