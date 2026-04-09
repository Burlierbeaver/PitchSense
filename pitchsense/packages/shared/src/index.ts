// Pitch
export type PitchMode = "FILE" | "AUDIO" | "TEXT";
export type PitchStatus = "PENDING" | "TRANSCRIBING" | "ANALYZING" | "COMPLETE" | "FAILED";

export type VCPersona =
  | "GROWTH"
  | "DEEP_TECH"
  | "SEED_STAGE"
  | "SKEPTIC"
  | "STRATEGIC";

export type Plan = "FREE" | "PRO" | "TEAM";

export interface ScoreDimensions {
  narrative: number;
  marketSize: number;
  teamCredibility: number;
  traction: number;
  financials: number;
  askClarity: number;
}

export interface PitchSummary {
  id: string;
  mode: PitchMode;
  status: PitchStatus;
  score: number | null;
  createdAt: string;
  wordCount: number | null;
  durationSeconds: number | null;
}

export interface PitchDetail extends PitchSummary {
  transcript: string | null;
  scoreDimensions: ScoreDimensions | null;
  strengths: string[];
  gaps: string[];
  investorQuestions: string[];
  detailedFeedback: string | null;
}

export interface SimMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

// API response shapes
export interface CreatePitchResponse {
  pitchId: string;
}

export interface SimulateResponse {
  sessionId: string;
  message: string;
}

// Plan limits
export const PLAN_LIMITS: Record<Plan, { pitchesPerMonth: number; simulatorSessions: number }> = {
  FREE: { pitchesPerMonth: 3, simulatorSessions: 1 },
  PRO: { pitchesPerMonth: 30, simulatorSessions: 10 },
  TEAM: { pitchesPerMonth: 999, simulatorSessions: 999 },
};
