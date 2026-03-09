import { AgentTable } from "@/components/agents/agent-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function AgentsPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-mono font-bold">Agents</h1>
        <Button size="sm" asChild>
          <Link href="/start" className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New Agent
          </Link>
        </Button>
      </div>
      <AgentTable />
    </div>
  );
}
