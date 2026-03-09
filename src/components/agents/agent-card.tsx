"use client";

import { Agent } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ArrowUpRight, Bot, Wallet } from "lucide-react";

function StatusBadge({ status }: { status: Agent["status"] }) {
  const variants: Record<Agent["status"], string> = {
    active: "bg-green-500/15 text-green-400 border-green-500/30",
    paused: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    stopped: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${variants[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function formatStrategy(s: string) {
  return s === "transfer_strategy"
    ? "Transfer Strategy"
    : "Balance Trigger Strategy";
}

function formatInterval(ms: number) {
  if (ms < 60_000) return `${ms / 1000}s`;
  return `${ms / 60_000}m`;
}

interface AgentCardsProps {
  agent: Agent;
}

export function AgentCards({ agent }: AgentCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Agent Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-muted-foreground" />
            Agent Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{agent.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Strategy</span>
            <Badge variant="secondary" className="font-mono text-xs">
              {formatStrategy(agent.strategy)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Interval</span>
            <span className="text-sm font-mono">
              {formatInterval(agent.intervalMs)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={agent.status} />
          </div>
          {agent.last_execution_at && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Last run
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(agent.last_execution_at).toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Address</span>
            <p className="font-mono text-xs break-all text-foreground">
              {agent.walletAddress}
            </p>
          </div>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a
              href={`https://explorer.solana.com/address/${agent.walletAddress}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              View on Solana Explorer
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">
            Balance available on-chain via explorer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
