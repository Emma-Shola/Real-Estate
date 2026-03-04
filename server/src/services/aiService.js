const OpenAI = require('openai');

const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.1:8b';
const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const fallbackLeadAnalysis = {
  score: 5,
  classification: 'Warm',
  reasoning: 'Fallback score because AI provider is unavailable.',
};

const fallbackLeadResponse =
  'Thank you for your inquiry. Could you share your ideal move-in timeline and preferred property type?';

const fallbackDescription = ({ bedrooms, location, price, features }) => ({
  seoDescription: `Discover this ${bedrooms}-bedroom property in ${location} listed at ${price}. Features include ${features}.`,
  socialCaption: `${bedrooms}BR in ${location} at ${price}. DM for details.`,
});

const safeParseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  }
};

const runOllamaPrompt = async (prompt, temperature = 0.5) => {
  const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaModel,
      stream: false,
      options: { temperature },
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data?.message?.content || '';
};

const runOpenAIPrompt = async (prompt, temperature = 0.5) => {
  if (!openaiClient) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const completion = await openaiClient.chat.completions.create({
    model: openaiModel,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  });

  return completion.choices[0]?.message?.content || '';
};

const runPrompt = async (prompt, temperature = 0.5) => {
  if (provider === 'ollama') {
    return runOllamaPrompt(prompt, temperature);
  }
  return runOpenAIPrompt(prompt, temperature);
};

const analyzeLead = async ({ budget, preferredLocation, message }) => {
  const prompt = `You are a real estate sales analyst.
Score this lead from 1-10 based on seriousness.
Also classify as: Cold, Warm, or Hot.

Lead Details:
Budget: ${budget || 'N/A'}
Preferred Location: ${preferredLocation || 'N/A'}
Message: ${message || 'N/A'}

Respond in JSON:
{
  "score": number,
  "classification": string,
  "reasoning": string
}`;

  try {
    const text = await runPrompt(prompt, 0.2);
    return safeParseJson(text);
  } catch (error) {
    console.error('analyzeLead failed:', error.message);
    return fallbackLeadAnalysis;
  }
};

const generateLeadResponse = async ({ message, budget, preferredLocation }) => {
  const prompt = `You are a professional real estate agent.
Write a polite and persuasive response to this inquiry:

Lead message: ${message || 'N/A'}
Budget: ${budget || 'N/A'}
Location preference: ${preferredLocation || 'N/A'}

Also suggest follow-up questions.`;

  try {
    return await runPrompt(prompt, 0.5);
  } catch (error) {
    console.error('generateLeadResponse failed:', error.message);
    return fallbackLeadResponse;
  }
};

const generatePropertyDescription = async ({ bedrooms, location, price, features }) => {
  const prompt = `Generate output in JSON with keys seoDescription and socialCaption.
Property details:
Bedrooms: ${bedrooms}
Location: ${location}
Price: ${price}
Features: ${features}`;

  try {
    const text = await runPrompt(prompt, 0.6);
    return safeParseJson(text);
  } catch (error) {
    console.error('generatePropertyDescription failed:', error.message);
    return fallbackDescription({ bedrooms, location, price, features });
  }
};

const generateChatbotReply = async ({ message, propertyContext }) => {
  const prompt = `You are a helpful real estate assistant for website visitors.
Answer briefly and clearly, and encourage the user to share contact details for follow-up.
If the user asks pricing/availability questions, suggest booking an inspection.

Property context (optional): ${propertyContext || 'N/A'}
Visitor message: ${message}`;

  try {
    const text = await runPrompt(prompt, 0.4);
    return text || 'Thanks for your question. Could you share your preferred location and budget?';
  } catch (error) {
    console.error('generateChatbotReply failed:', error.message);
    return 'Thanks for reaching out. Please share your budget, preferred location, and timeline, and an agent will follow up.';
  }
};

module.exports = {
  analyzeLead,
  generateLeadResponse,
  generatePropertyDescription,
  generateChatbotReply,
};
