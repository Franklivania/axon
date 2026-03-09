"use client";

import { useState } from "react";
import { Log } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, ClipboardCopy, Copy, Terminal, RefreshCw } from "lucide-react";

function formatLog(log: Log) {
  return `[${new Date(log.createdAt).toLocaleTimeString()}] [${log.action}] ${log.message}`;
}

function CopyRowButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
      title="Copy line"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

interface AgentLogsProps {
  logs: Log[];
  isLoading: boolean;
}

export function AgentLogs({ logs, isLoading }: AgentLogsProps) {
  const [allCopied, setAllCopied] = useState(false);

  function handleCopyAll() {
    const text = logs.map(formatLog).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No logs yet. Start the agent to see activity.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5 text-muted-foreground"
          onClick={handleCopyAll}
        >
          {allCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" /> Copied
            </>
          ) : (
            <>
              <ClipboardCopy className="h-3.5 w-3.5" /> Copy all
            </>
          )}
        </Button>
      </div>

      <div className="max-h-96 overflow-y-auto rounded-md border bg-muted/30 p-2 space-y-1 font-mono text-xs">
        {logs.map((log) => (
          <div
            key={log.id}
            className="group flex items-start gap-3 py-1 px-2 rounded hover:bg-muted/50 transition-colors"
          >
            <span className="text-muted-foreground whitespace-nowrap shrink-0">
              {new Date(log.createdAt).toLocaleTimeString()}
            </span>
            <Badge variant="outline" className="text-xs py-0 px-1.5 shrink-0">
              {log.action}
            </Badge>
            <span className="text-foreground break-all flex-1">
              {log.message}
            </span>
            <CopyRowButton text={formatLog(log)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentLogsHeader({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <div className="flex items-center justify-between w-full">
      <span className="flex items-center gap-2">
        <Terminal className="h-4 w-4" />
        Logs
      </span>
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="h-6 w-6 p-0"
          title="Refresh logs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
