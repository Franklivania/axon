import ImageBackground from "@/components/layout/img-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { BookOpen, Rocket } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center">
      <div className="absolute w-screen h-full">
        <ImageBackground />
      </div>

      <header className="relative flex w-full items-center justify-between p-3 md:p-6">
        <h1 className="font-mono text-2xl">AXON</h1>
        <ThemeToggle />
      </header>

      <section className="relative w-full max-w-2xl m-auto flex flex-col items-center justify-center gap-3 lg:mt-32">
        <span className="w-max whitespace-nowrap flex items-center gap-2 px-3 py-px rounded-2xl bg-green-300/15 border border-green-500 dark:text-green-300 text-green-800">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <p className="text-sans">Built for the Solana Agentic Era.</p>
        </span>

        <article className="space-y-5 md:my-7">
          <h1 className="w-max whitespace-nowrap text-lg md:text-4xl lg:text-6xl font-mono font-bold text-center">
            Autonomous Liquidity
            <div className="text-primary">Human Understanding</div>
          </h1>

          <p className="text-center">
            Axon is the neural bridge for AI agents on Solana. A secure,
            programmable vault designed for autonomous signing, sandboxed
            execution, and independent capital management—without ever losing
            the safety of human-defined guardrails.
          </p>
        </article>

        <div className="w-max flex items-center gap-4 mx-auto">
          <Button size="lg" className="rounded-full" asChild>
            <Link href="/start">
              Get Started
              <Rocket />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="rounded-full bg-background"
            asChild
          >
            <Link href="/docs">
              Read Docs
              <BookOpen />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
