import { PgBoss } from "pg-boss";
import Sentry from "./sentry";
import { registerClassifyWorker } from "./classify-ticket";
import { registerAutoResolveWorker } from "./auto-resolve-ticket";
import { registerSendEmailWorker } from "./send-email";

const isQueueEnabled = process.env.ENABLE_JOB_QUEUE === "true";

let bossInstance: PgBoss | null = null;

if (isQueueEnabled && process.env.DATABASE_URL) {
  try {
    bossInstance = new PgBoss({
      connectionString: process.env.DATABASE_URL,
    });
    bossInstance.on("error", (error) => {
      Sentry.captureException(error);
      console.error("pg-boss error:", error);
    });
  } catch (e) {
    console.warn("Could not initialize pg-boss:", e);
  }
}

// Fallback safe boss for local dev
const safeDummyBoss: any = {
  send: async (queue: string, data: any) => {
    console.log(`[JobQueue Local] Job '${queue}' received:`, data);
    return null;
  },
  createQueue: async () => {},
  work: async () => {},
  start: async () => {},
  stop: async () => {},
  on: () => {},
};

const boss = bossInstance || safeDummyBoss;

export { boss };

export async function startQueue(): Promise<void> {
  if (!isQueueEnabled || !bossInstance) {
    console.log("ℹ️ Background job queue running in local mode (set ENABLE_JOB_QUEUE=true for pg-boss)");
    return;
  }

  await boss.start();
  await registerClassifyWorker(boss);
  await registerAutoResolveWorker(boss);
  await registerSendEmailWorker(boss);
  console.log("Job queue started");
}

export async function stopQueue(): Promise<void> {
  if (bossInstance) {
    await bossInstance.stop({ graceful: true, timeout: 30000 });
  }
}
