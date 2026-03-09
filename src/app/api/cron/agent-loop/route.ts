import { NextResponse } from "next/server";
import {
  getActiveUnlockedAgentsQuery,
  acquireExecutionLockQuery,
  releaseExecutionLockQuery,
  releaseExecutionLockOnlyQuery,
} from "@/lib/db/queries";
import { AgentEngine } from "@/lib/agents/agent-engine";
import { Logger } from "@/lib/utils/logger";

// Vercel calls this route on the cron schedule defined in vercel.json.
// Each invocation runs one poll cycle — equivalent to one tick of the worker loop.
export async function GET(request: Request) {
  // Protect the endpoint so only Vercel's cron system can trigger it
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agents = await getActiveUnlockedAgentsQuery();

  await Promise.allSettled(
    agents.map(async (agent) => {
      const locked = await acquireExecutionLockQuery(agent.id);
      if (!locked) return;

      let did_execute = false;
      try {
        const now = Date.now();
        const last_exec = locked.last_execution_at
          ? new Date(locked.last_execution_at).getTime()
          : 0;

        if (now - last_exec < locked.intervalMs) return;

        did_execute = true;
        await AgentEngine.executeAgent(locked);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        await Logger.log("execution_error", `Cron error: ${msg}`, agent.id);
      } finally {
        if (did_execute) {
          await releaseExecutionLockQuery(agent.id);
        } else {
          await releaseExecutionLockOnlyQuery(agent.id);
        }
      }
    })
  );

  return NextResponse.json({ ok: true, agents: agents.length });
}
