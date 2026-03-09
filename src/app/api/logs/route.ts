import { NextResponse } from "next/server";
import { TransactionService } from "@/lib/services/transaction-service";
// We use TransactionService or a dedicated LogService for logs.
// Since services encapsulate logic, let's create a method in TransactionService or LoggerService

export async function GET() {
  try {
    const logs = await TransactionService.getLogs();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
