import {
  getActiveUnlockedAgentsQuery,
  acquireExecutionLockQuery,
  releaseExecutionLockQuery,
  releaseExecutionLockOnlyQuery,
} from "../src/lib/db/queries";
import { AgentEngine } from "../src/lib/agents/agent-engine";
import { Logger } from "../src/lib/utils/logger";

// How often the loop polls the DB for runnable agents
const POLL_INTERVAL = 10_000;

/**
 * Attempts to execute a single agent within a DB execution lock.
 *
 * Task 3 — Execution lock:
 *   acquireExecutionLockQuery is an atomic UPDATE ... WHERE execution_lock=false RETURNING *.
 *   If two workers race on the same agent, only one will get a non-null result.
 *   The lock is always released in the finally block, even if the agent throws.
 *
 * Task 8 — Per-agent error isolation:
 *   Any error inside this function is caught and logged. It never propagates to
 *   workerLoop, so a failing agent cannot crash the entire worker or block others.
 *
 * Interval check (Task 3):
 *   last_execution_at is stored in the DB, so the interval is respected across
 *   worker restarts — unlike the previous in-memory tracker.
 *
 * Known limitation: if the worker process is killed while holding an execution_lock
 * the agent will remain locked indefinitely. Use the stop→start API to reset it.
 */
async function process_agent(
  agent: Awaited<ReturnType<typeof getActiveUnlockedAgentsQuery>>[0]
): Promise<void> {
  // Atomic compare-and-set: returns null if another worker beat us to the lock
  const locked_agent = await acquireExecutionLockQuery(agent.id);
  if (!locked_agent) return;

  // Track whether the agent actually ran so we only update last_execution_at
  // when execution occurred (not on interval-skip releases).
  let did_execute = false;

  try {
    // Interval check using the DB-persisted last_execution_at (survives restarts)
    const now = Date.now();
    const last_exec = locked_agent.last_execution_at
      ? new Date(locked_agent.last_execution_at).getTime()
      : 0;

    if (now - last_exec < locked_agent.intervalMs) {
      // Interval has not elapsed yet — release the lock and do nothing
      return;
    }

    did_execute = true;
    console.log(
      `[Worker] Executing agent: ${locked_agent.name} (${locked_agent.id})`
    );
    await AgentEngine.executeAgent(locked_agent);
  } catch (err: unknown) {
    // Per-agent error: log but do NOT rethrow so other agents continue
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Worker] Agent ${agent.id} error: ${msg}`);
    await Logger.log("execution_error", `Worker error: ${msg}`, agent.id);
  } finally {
    // Only update last_execution_at when the agent actually ran
    if (did_execute) {
      await releaseExecutionLockQuery(agent.id);
    } else {
      await releaseExecutionLockOnlyQuery(agent.id);
    }
  }
}

/**
 * Main worker loop. Polls the DB every POLL_INTERVAL ms for active, unlocked
 * agents and processes them concurrently via Promise.allSettled.
 *
 * Promise.allSettled ensures that if process_agent itself throws before its own
 * try/catch (e.g., during acquireExecutionLockQuery), other agents still run.
 */
async function workerLoop(): Promise<void> {
  await Logger.log("system_startup", "Agent execution worker started");

  while (true) {
    try {
      // Fetch only active agents with execution_lock=false
      const agents = await getActiveUnlockedAgentsQuery();

      if (agents.length === 0) {
        console.log("[Worker] No active unlocked agents found. Waiting...");
      }

      // Process all agents concurrently; one failure never stops the others
      await Promise.allSettled(agents.map(process_agent));
    } catch (err: unknown) {
      // Top-level loop error (e.g., DB unreachable) — log and continue
      console.error(
        `[Worker] Loop error: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
}

// Entry point
workerLoop().catch(console.error);
