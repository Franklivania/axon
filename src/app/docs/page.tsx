import { ThemeToggle } from "@/components/theme-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

const DOCS = [
  {
    id: "what",
    title: "What is Axon?",
    content: `Axon is an autonomous agent runtime built for the Solana blockchain. It enables software agents to independently control wallets and execute on-chain transactions without requiring human approval for each action.

Agents run on a configurable interval, evaluating their strategy and submitting transactions when conditions are met. All execution happens within strict, human-defined guardrails — agents can only do what their strategy allows.`,
  },
  {
    id: "agents",
    title: "How agents work",
    content: `Each agent is assigned a unique identity and a dedicated Solana wallet at creation time. When an agent is started, it enters an execution loop:

1. The agent evaluates its strategy (e.g., "transfer if balance > X SOL").
2. If conditions are met, the strategy returns a set of transaction instructions.
3. The agent engine compiles those instructions into a versioned transaction.
4. The wallet manager signs and submits the transaction to Solana Devnet.
5. The result is logged for observability.

Agents use idempotency guards and execution locks to prevent duplicate transactions and concurrent execution.`,
  },
  {
    id: "wallets",
    title: "How wallets work",
    content: `Every agent owns exactly one Solana wallet. The wallet's private key is generated at agent creation and immediately encrypted with AES-256-GCM before storage — it is never persisted in plaintext.

Private keys are only decrypted inside the WalletManager at signing time and are never exposed to the agent, logs, or API responses. Wallets can be viewed on Solana Explorer (Devnet) using the wallet address shown in the UI.

To fund an agent wallet, send SOL to the displayed address on Solana Devnet.`,
  },
  {
    id: "running",
    title: "How to run agents",
    content: `To get started with Axon:

1. Go to /start and fill in the agent name, strategy, and execution interval.
2. Click "Create Agent" — the agent and its wallet are provisioned immediately.
3. Go to /agents to see your agent in the table.
4. Click the Play button to set the agent status to "active".
5. The agent will begin executing on its configured interval.
6. Click the Eye icon to open the agent detail page and watch logs and transactions in real time.
7. Click the Pause button to stop the agent at any time.

Logs and transactions refresh automatically every 5 seconds on the detail page.`,
  },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-mono font-bold">Documentation</h1>
        </div>

        <Accordion
          type="multiple"
          defaultValue={DOCS.map((d) => d.id)}
          className="space-y-2"
        >
          {DOCS.map((doc) => (
            <AccordionItem
              key={doc.id}
              value={doc.id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline font-medium">
                {doc.title}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {doc.content}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
  );
}
