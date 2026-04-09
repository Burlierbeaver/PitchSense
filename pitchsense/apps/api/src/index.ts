import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pitchRoutes } from "./routes/pitches";
import { webhookRoutes } from "./routes/webhooks";
import { userRoutes } from "./routes/users";
import { validateApiSecret } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 4000;

// Security
app.use(helmet());
app.use(cors({ origin: process.env.NEXT_PUBLIC_APP_URL, credentials: true }));

// Stripe webhooks need raw body — must come before json()
app.use("/webhooks", webhookRoutes);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// All API routes require internal secret from Next.js BFF
app.use("/pitches", validateApiSecret, pitchRoutes);
app.use("/users", validateApiSecret, userRoutes);

// Health check (no auth)
app.get("/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));

app.listen(PORT, () => {
  console.log(`🚀  PitchSense API running on port ${PORT}`);
});

export default app;
