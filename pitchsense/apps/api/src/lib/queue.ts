import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { processPitchJob } from "../services/pitchProcessor";

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// ── Queues ──────────────────────────────────────────────────
export const pitchQueue = new Queue("pitch-analysis", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

// ── Workers ─────────────────────────────────────────────────
export const pitchWorker = new Worker(
  "pitch-analysis",
  async (job: Job) => {
    console.log(`[worker] Processing pitch job ${job.id} for pitch ${job.data.pitchId}`);
    await processPitchJob(job.data);
  },
  { connection, concurrency: 3 }
);

pitchWorker.on("completed", (job) => {
  console.log(`[worker] ✓ Job ${job.id} completed`);
});

pitchWorker.on("failed", (job, err) => {
  console.error(`[worker] ✗ Job ${job?.id} failed:`, err.message);
});

export async function enqueuePitchAnalysis(pitchId: string, userId: string) {
  const job = await pitchQueue.add("analyze", { pitchId, userId }, { jobId: pitchId });
  return job.id;
}
