import { NextResponse } from "next/server";
import { AgentService } from "@/lib/services/agent-service";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params here based on Next.js 15+ patterns for dynamic routes
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    const agent = await AgentService.getAgentById(id);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
