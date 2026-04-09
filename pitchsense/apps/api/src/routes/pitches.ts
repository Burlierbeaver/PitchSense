import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { uploadFile } from "../lib/s3";
import { enqueuePitchAnalysis } from "../lib/queue";
import { simulateInvestorResponse, generateOpeningQuestion } from "../services/simulator";
import { VCPersona } from "@prisma/client";

export const pitchRoutes = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } });

// ── POST /pitches — create & enqueue ────────────────────────
pitchRoutes.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const { userId, mode, text } = req.body;

    if (!userId || !mode) {
      return res.status(400).json({ error: "userId and mode are required" });
    }

    // Upsert user in case they're new
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@clerk.temp` },
    });

    let fileKey: string | undefined;

    if (req.file) {
      fileKey = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        mode === "AUDIO" ? "audio" : "decks"
      );
    }

    const pitch = await prisma.pitch.create({
      data: {
        userId,
        mode: mode.toUpperCase() as any,
        status: "PENDING",
        fileKey,
        rawText: text ?? null,
      },
    });

    await enqueuePitchAnalysis(pitch.id, userId);

    return res.status(201).json({ pitchId: pitch.id });
  } catch (err) {
    console.error("[POST /pitches]", err);
    return res.status(500).json({ error: "Failed to create pitch" });
  }
});

// ── GET /pitches — list user's pitches ───────────────────────
pitchRoutes.get("/", async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const pitches = await prisma.pitch.findMany({
    where: { userId: userId as string },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      mode: true,
      status: true,
      score: true,
      createdAt: true,
      wordCount: true,
      durationSeconds: true,
    },
  });

  return res.json(pitches);
});

// ── GET /pitches/:id — full pitch result ─────────────────────
pitchRoutes.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;

  const pitch = await prisma.pitch.findUnique({ where: { id } });
  if (!pitch) return res.status(404).json({ error: "Pitch not found" });
  if (pitch.userId !== userId) return res.status(403).json({ error: "Forbidden" });

  return res.json(pitch);
});

// ── POST /pitches/:id/simulate — start or continue VC sim ────
const SimSchema = z.object({
  userId: z.string(),
  persona: z.nativeEnum(VCPersona),
  sessionId: z.string().optional(),
  founderMessage: z.string().optional(),
});

pitchRoutes.post("/:id/simulate", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = SimSchema.parse(req.body);

    const pitch = await prisma.pitch.findUnique({ where: { id } });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    if (pitch.userId !== body.userId) return res.status(403).json({ error: "Forbidden" });
    if (!pitch.transcript && !pitch.rawText) {
      return res.status(400).json({ error: "Pitch has no transcript yet" });
    }

    const transcript = (pitch.transcript ?? pitch.rawText)!;

    // New session — generate opening question
    if (!body.sessionId) {
      const opening = await generateOpeningQuestion(transcript, body.persona);
      const session = await prisma.simulatorSession.create({
        data: {
          pitchId: id,
          persona: body.persona,
          messages: [{ role: "assistant", content: opening, ts: Date.now() }],
        },
      });
      return res.json({ sessionId: session.id, message: opening });
    }

    // Continuing session
    if (!body.founderMessage) {
      return res.status(400).json({ error: "founderMessage required to continue session" });
    }

    const session = await prisma.simulatorSession.findUniqueOrThrow({
      where: { id: body.sessionId },
    });

    const history = session.messages as any[];
    const vcReply = await simulateInvestorResponse(
      transcript,
      body.persona,
      history,
      body.founderMessage
    );

    const updatedMessages = [
      ...history,
      { role: "user", content: body.founderMessage, ts: Date.now() },
      { role: "assistant", content: vcReply, ts: Date.now() },
    ];

    await prisma.simulatorSession.update({
      where: { id: body.sessionId },
      data: { messages: updatedMessages },
    });

    return res.json({ sessionId: body.sessionId, message: vcReply });
  } catch (err) {
    console.error("[POST /pitches/:id/simulate]", err);
    return res.status(500).json({ error: "Simulation failed" });
  }
});
