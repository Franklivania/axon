import { CreateAgentForm } from "@/components/forms/create-agent-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot } from "lucide-react";
import Link from "next/link";

export default function StartPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-12">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Create Agent
            </CardTitle>
            <CardDescription>
              Configure a new autonomous agent. It will receive its own Solana
              wallet upon creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateAgentForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
