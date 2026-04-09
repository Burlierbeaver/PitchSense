import Anthropic from "@anthropic-ai/sdk";
import { VCPersona } from "@prisma/client";

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface SimMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const PERSONA_PROMPTS: Record<VCPersona, string> = {
  GROWTH: `You are a growth-stage VC partner at a top-tier fund. You obsess over SaaS metrics: ARR, MoM growth, NRR, CAC, LTV, payback period. You want to see a clear path to $100M ARR. You are direct, numbers-driven, and quickly skeptical of hand-wavy market size claims. If a founder can't give you a specific number, you push hard.`,

  DEEP_TECH: `You are a deep-tech VC who backs founders building defensible technology. You probe for: What's the core IP? What's the 10-year moat? Why can't Google/AWS replicate this in 18 months? You're comfortable with long timelines but need to believe the technical differentiation is real. You ask highly specific technical questions.`,

  SEED_STAGE: `You are a seed-stage investor who bets on founders and vision before product-market fit. You evaluate founder-market fit, team dynamics, and whether the founder has an obsessive, contrarian insight. You're more forgiving of missing traction but you want to feel the founder's conviction and hear how they think about risk.`,

  SKEPTIC: `You are the hardest partner in the room. You challenge every assumption, poke every number, and look for reasons NOT to invest. You're not mean — you're rigorous. You ask: "Why now?", "Why you?", "What happens if X doesn't work?". You've been burned by founders who overpromise, and you want to know what the bear case is.`,

  STRATEGIC: `You are a corporate VC investing on behalf of a Fortune 500. You care about strategic fit: can this company become a partner, acquisition target, or distribution channel for your parent? You ask about enterprise sales cycles, existing customer relationships, and compliance/security posture.`,
};

export async function simulateInvestorResponse(
  pitchTranscript: string,
  persona: VCPersona,
  conversationHistory: SimMessage[],
  founderMessage: string
): Promise<string> {
  const systemPrompt = `${PERSONA_PROMPTS[persona]}

You have just heard the following startup pitch:
---
${pitchTranscript.slice(0, 3000)}
---

Now you are in a Q&A session with the founder. Ask ONE focused question or make ONE pointed observation per turn. Stay in character. Be concise — 2-4 sentences max per response. Never break character or refer to yourself as an AI.`;

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: founderMessage },
  ];

  const response = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: systemPrompt,
    messages,
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}

export async function generateOpeningQuestion(
  pitchTranscript: string,
  persona: VCPersona
): Promise<string> {
  const systemPrompt = `${PERSONA_PROMPTS[persona]}

You have just heard the following startup pitch:
---
${pitchTranscript.slice(0, 3000)}
---

Ask your single most important opening question — the one thing you need answered most. Be direct. 2-3 sentences max.`;

  const response = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    system: systemPrompt,
    messages: [{ role: "user", content: "Please ask your opening question." }],
  });

  const content = response.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
