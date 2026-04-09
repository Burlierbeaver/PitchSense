import Anthropic from "@anthropic-ai/sdk";

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface FeedbackResult {
  score: number;
  scoreDimensions: {
    narrative: number;
    marketSize: number;
    teamCredibility: number;
    traction: number;
    financials: number;
    askClarity: number;
  };
  strengths: string[];
  gaps: string[];
  investorQuestions: string[];
  detailedFeedback: string;
}

const SYSTEM_PROMPT = `You are a senior venture capitalist with 20 years of experience evaluating startups across seed to Series B. 
You have reviewed thousands of pitch decks and heard countless pitches.
Your job is to give founders brutally honest, actionable feedback — the kind you'd give a founder you genuinely want to succeed.

When analyzing a pitch, you evaluate:
1. Narrative clarity — does the story compel? is the problem vivid?
2. Market size — TAM/SAM/SOM clarity, bottom-up or top-down, credibility
3. Team credibility — founder-market fit, relevant experience, gaps
4. Traction — evidence of demand, growth metrics, customer quotes
5. Financials — unit economics, burn rate, runway, projections sanity
6. Ask clarity — round size, use of funds, milestones to hit

Always respond with valid JSON only — no markdown fences, no preamble.`;

const ANALYSIS_PROMPT = (transcript: string) => `
Analyze the following startup pitch and return a JSON object with this exact shape:

{
  "score": <overall 0-100 fundability score>,
  "scoreDimensions": {
    "narrative": <0-100>,
    "marketSize": <0-100>,
    "teamCredibility": <0-100>,
    "traction": <0-100>,
    "financials": <0-100>,
    "askClarity": <0-100>
  },
  "strengths": [<3-5 specific strengths as strings>],
  "gaps": [<3-5 critical gaps or red flags as strings>],
  "investorQuestions": [<5-7 hard questions a skeptical VC would ask>],
  "detailedFeedback": "<3-4 paragraphs of detailed markdown feedback covering the narrative arc, biggest risks, and specific recommendations>"
}

PITCH TRANSCRIPT:
---
${transcript}
---
`;

export async function analyzePitch(transcript: string): Promise<FeedbackResult> {
  const message = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: ANALYSIS_PROMPT(transcript) }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");

  try {
    return JSON.parse(content.text) as FeedbackResult;
  } catch {
    throw new Error(`Failed to parse Claude feedback JSON: ${content.text.slice(0, 200)}`);
  }
}
