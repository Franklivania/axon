import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Bot, BookOpen, Plus } from "lucide-react";
import Link from "next/link";

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-mono text-lg font-bold tracking-tight"
            >
              AXON
            </Link>
            <nav className="flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/agents" className="flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5" />
                  Agents
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/start" className="flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  New Agent
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/docs" className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Docs
                </Link>
              </Button>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
