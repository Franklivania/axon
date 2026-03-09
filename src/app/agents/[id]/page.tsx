"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAgentById, fetchLogs, fetchTransactions } from "@/lib/api/client";
import { AgentCards } from "@/components/agents/agent-card";
import { AgentLogs, AgentLogsHeader } from "@/components/agents/agent-logs";
import { AgentTransactions } from "@/components/agents/agent-transactions";
import { EditAgentDialog } from "@/components/agents/edit-agent-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ["agents", id],
    queryFn: () => fetchAgentById(id),
    refetchInterval: 10_000,
  });

  const { data: allLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["logs"],
    queryFn: fetchLogs,
    refetchInterval: 5_000,
  });

  const { data: allTransactions, isLoading: txLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
    refetchInterval: 5_000,
  });

  const agentLogs = allLogs?.filter((l) => l.agentId === id) ?? [];
  const agentTxs = allTransactions?.filter((t) => t.agentId === id) ?? [];

  const handleRefreshLogs = () => {
    queryClient.invalidateQueries({ queryKey: ["logs"] });
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
        <Link
          href="/agents"
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All Agents
        </Link>
      </Button>

      {agentLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      ) : !agent ? (
        <p className="text-muted-foreground">Agent not found.</p>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-mono font-bold">{agent.name}</h1>
            <div className="flex items-center gap-2">
              <EditAgentDialog agent={agent} />
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://explorer.solana.com/address/${agent.walletAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  Explorer
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>

          <AgentCards agent={agent} />

          <Accordion
            type="multiple"
            defaultValue={["logs", "transactions"]}
            className="space-y-2"
          >
            <AccordionItem value="logs" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <AgentLogsHeader onRefresh={handleRefreshLogs} />
              </AccordionTrigger>
              <AccordionContent>
                <AgentLogs logs={agentLogs} isLoading={logsLoading} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="transactions"
              className="border rounded-lg px-4 mb-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <span className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Transactions
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <AgentTransactions
                  transactions={agentTxs}
                  isLoading={txLoading}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
