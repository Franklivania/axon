import { NextResponse } from "next/server";
import { AgentService } from "@/lib/services/agent-service";

export async function GET() {
  try {
    const agents = await AgentService.getAgents();
    return NextResponse.json(agents);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error(`[get-agents] Error fetching agents: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
