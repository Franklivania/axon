import { NextResponse } from "next/server";
import { TransactionService } from "@/lib/services/transaction-service";

export async function GET() {
  try {
    const transactions = await TransactionService.getTransactions();
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
