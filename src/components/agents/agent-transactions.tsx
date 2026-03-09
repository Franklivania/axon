"use client";

import { Transaction } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight } from "lucide-react";

function truncateSig(sig: string) {
  if (sig.length <= 16) return sig;
  return `${sig.slice(0, 8)}...${sig.slice(-6)}`;
}

interface AgentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export function AgentTransactions({
  transactions,
  isLoading,
}: AgentTransactionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No transactions yet.
      </p>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Signature</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <a
                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {truncateSig(tx.signature)}
                    <ArrowUpRight className="h-3 w-3 shrink-0" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      tx.status === "success"
                        ? "text-green-400 border-green-500/30 bg-green-500/10"
                        : "text-red-400 border-red-500/30 bg-red-500/10"
                    }
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(tx.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
