import { NextResponse } from "next/server";
import { TransactionService } from "@/lib/services/transaction-service";

export async function GET() {
  try {
    const transactions = await TransactionService.getTransactions();
    return NextResponse.json(transactions);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
