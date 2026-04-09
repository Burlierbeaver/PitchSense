import { prisma } from "../lib/prisma";
import { transcribeAudio, estimateWordCount, estimateDuration } from "./transcription";
import { analyzePitch } from "./feedback";

export interface PitchJobData {
  pitchId: string;
  userId: string;
}

export async function processPitchJob(data: PitchJobData): Promise<void> {
  const { pitchId } = data;

  const pitch = await prisma.pitch.findUniqueOrThrow({ where: { id: pitchId } });

  try {
    // ── Step 1: Transcribe if audio ──────────────────────────
    let transcript = pitch.rawText ?? "";

    if (pitch.mode === "AUDIO" && pitch.fileKey) {
      await prisma.pitch.update({
        where: { id: pitchId },
        data: { status: "TRANSCRIBING" },
      });

      transcript = await transcribeAudio(pitch.fileKey);

      await prisma.pitch.update({
        where: { id: pitchId },
        data: { transcript, status: "ANALYZING" },
      });
    } else if (pitch.mode === "FILE" && pitch.fileKey) {
      // PDF text extraction would happen here (e.g. via pdf-parse)
      // For now we mark as analyzing with whatever text was extracted at upload
      await prisma.pitch.update({
        where: { id: pitchId },
        data: { status: "ANALYZING" },
      });
    } else {
      await prisma.pitch.update({
        where: { id: pitchId },
        data: { transcript, status: "ANALYZING" },
      });
    }

    // ── Step 2: Analyze with Claude ──────────────────────────
    if (!transcript || transcript.trim().length < 50) {
      throw new Error("Transcript too short to analyze — minimum 50 characters.");
    }

    const feedback = await analyzePitch(transcript);

    const wc = estimateWordCount(transcript);
    const dur = estimateDuration(wc);

    // ── Step 3: Persist results ──────────────────────────────
    await prisma.pitch.update({
      where: { id: pitchId },
      data: {
        status: "COMPLETE",
        score: feedback.score,
        scoreDimensions: feedback.scoreDimensions,
        strengths: feedback.strengths,
        gaps: feedback.gaps,
        investorQuestions: feedback.investorQuestions,
        detailedFeedback: feedback.detailedFeedback,
        wordCount: wc,
        durationSeconds: dur,
      },
    });

    console.log(`[processor] ✓ Pitch ${pitchId} complete. Score: ${feedback.score}`);
  } catch (err) {
    await prisma.pitch.update({
      where: { id: pitchId },
      data: { status: "FAILED" },
    });
    throw err;
  }
}
