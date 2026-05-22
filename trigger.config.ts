import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? "",
  dirs: ["./trigger"],

  // Use Node.js 22 — latest stable LTS available on Trigger.dev cloud
  runtime: "node-22",

  // I/O-bound task (DB + HTTP) — small-1x (0.5 vCPU / 0.5 GB) is sufficient
  machine: "small-1x",

  // Max actual compute time per run. wait.for() is checkpointed and does NOT
  // count toward this, so 300s covers all real execution even with 30-min waits.
  maxDuration: 300,

  // Exponential backoff retries — disabled in dev to avoid noisy re-runs
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },

  // Keep the worker process alive after a run finishes so the next task
  // starts faster (no cold-start penalty between lead submissions)
  processKeepAlive: {
    enabled: true,
    maxExecutionsPerProcess: 50,
  },

  logLevel: "info",
});
