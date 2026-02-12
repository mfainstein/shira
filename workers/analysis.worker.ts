import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
import {
  ANALYSIS_QUEUE_NAME,
  AnalysisJobData,
  AnalysisJobResult,
} from "../src/lib/pipeline/queue";
import { QUEUE_CONFIG } from "../src/config/pipeline";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const db = new PrismaClient();

async function runAnalysis(
  job: Job<AnalysisJobData>,
  analysisJobId: string
): Promise<AnalysisJobResult> {
  const { PoetryAnalysisAgent } = await import(
    "../src/lib/pipeline/agent"
  );

  const agent = new PoetryAnalysisAgent({
    analysisJobId,
    job,
    db,
  });

  return agent.execute();
}

const worker = new Worker<AnalysisJobData, AnalysisJobResult>(
  ANALYSIS_QUEUE_NAME,
  async (job) => {
    const { analysisJobId } = job.data;
    console.log(`[Worker] Starting analysis job ${analysisJobId}`);

    try {
      await db.analysisJob.update({
        where: { id: analysisJobId },
        data: {
          status: "ACQUIRING",
          startedAt: new Date(),
          jobId: job.id,
        },
      });

      const result = await runAnalysis(job, analysisJobId);

      await db.analysisJob.update({
        where: { id: analysisJobId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          progress: 100,
          totalCost: result.totalCost,
        },
      });

      console.log(`[Worker] Completed analysis job ${analysisJobId}`);
      return result;
    } catch (error) {
      console.error(`[Worker] Failed analysis job ${analysisJobId}:`, error);

      await db.analysisJob.update({
        where: { id: analysisJobId },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: QUEUE_CONFIG.concurrency,
  }
);

worker.on("ready", () => {
  console.log("[Worker] Ready and waiting for jobs");
});

worker.on("active", (job) => {
  console.log(`[Worker] Job ${job.id} started`);
});

worker.on("progress", (job, progress) => {
  console.log(`[Worker] Job ${job.id} progress: ${JSON.stringify(progress)}`);
});

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`[Worker] Job ${job?.id} failed:`, error.message);
});

worker.on("error", (error) => {
  console.error("[Worker] Error:", error);
});

async function shutdown() {
  console.log("[Worker] Shutting down...");
  await worker.close();
  await redis.quit();
  await db.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("[Worker] Poetry analysis worker started");
console.log(`[Worker] Concurrency: ${QUEUE_CONFIG.concurrency}`);
