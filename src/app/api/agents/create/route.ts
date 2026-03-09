import { NextResponse } from "next/server";
import { AgentService } from "@/lib/services/agent-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, strategy, intervalMs } = body;

    // Basic validation
    if (!name || !strategy || !intervalMs) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const agent = await AgentService.createAgent(name, strategy, intervalMs);

    return NextResponse.json(agent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
