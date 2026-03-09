import { NextResponse } from "next/server";
import { AgentService } from "@/lib/services/agent-service";

export async function GET() {
  try {
    const agents = await AgentService.getAgents();
    return NextResponse.json(agents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
