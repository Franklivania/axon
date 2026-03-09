import { NextResponse } from "next/server";
import { AgentService } from "@/lib/services/agent-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId is required" },
        { status: 400 }
      );
    }

    const agent = await AgentService.updateAgentStatus(agentId, "active");

    return NextResponse.json(agent);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error(`[start-agent] Error starting agent: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
