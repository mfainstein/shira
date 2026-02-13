import { Queue, QueueEvents } from "bullmq";
import { redis } from "@/lib/redis";
import { QUEUE_CONFIG } from "@/config/pipeline";

export const ANALYSIS_QUEUE_NAME = "poetry-analysis";

export const analysisQueue = new Queue(ANALYSIS_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: QUEUE_CONFIG.maxRetries,
    backoff: {
      type: "exponential",
      delay: QUEUE_CONFIG.backoffDelay,
    },
    removeOnComplete: { count: 100, age: 24 * 3600 },
    removeOnFail: { count: 200, age: 7 * 24 * 3600 },
  },
});

export const queueEvents = new QueueEvents(ANALYSIS_QUEUE_NAME, {
  connection: redis,
});

export interface AnalysisJobData {
  analysisJobId: string;
  poemId: string;
  params: {
    acquisitionMode: "found" | "ai_generated";
    topic?: string;
    language: "EN" | "HE";
    artStyle: "MINIMALIST" | "DALLE";
    sourceModel?: string;
  };
}

export interface AnalysisJobResult {
  poemId: string;
  analysesCompleted: number;
  artGenerated: boolean;
  audioGenerated: boolean;
  comparisonGenerated: boolean;
  totalCost: number;
}

export async function scheduleAnalysis(
  data: AnalysisJobData,
  options?: { delay?: number; priority?: number }
): Promise<string> {
  const job = await analysisQueue.add("analyze", data, {
    delay: options?.delay,
    priority: options?.priority,
  });
  return job.id!;
}

export async function getQueueStatus() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    analysisQueue.getWaitingCount(),
    analysisQueue.getActiveCount(),
    analysisQueue.getCompletedCount(),
    analysisQueue.getFailedCount(),
    analysisQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed,
  };
}

export async function cancelJob(jobId: string): Promise<boolean> {
  const job = await analysisQueue.getJob(jobId);
  if (!job) return false;

  const state = await job.getState();
  if (state === "active") {
    await job.updateProgress({ cancelled: true });
    return true;
  }
  if (state === "waiting" || state === "delayed") {
    await job.remove();
    return true;
  }
  return false;
}

export async function retryJob(jobId: string): Promise<boolean> {
  const job = await analysisQueue.getJob(jobId);
  if (!job) return false;

  const state = await job.getState();
  if (state === "failed") {
    await job.retry();
    return true;
  }
  return false;
}

export async function obliterateQueue() {
  await analysisQueue.obliterate({ force: true });
}
