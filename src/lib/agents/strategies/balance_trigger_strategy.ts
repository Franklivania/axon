import {
  TransactionInstruction,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { getBalance } from "../../solana/connection";
import { Agent } from "../agent-engine";

export class BalanceTriggerStrategy {
  /**
   * Only executes a transfer when the wallet balance exceeds 0.05 SOL.
   *
   * Strategies return raw TransactionInstruction[] — never a signed or
   * pre-built transaction. AgentEngine compiles them and WalletManager signs.
   *
   * @param agent - The agent data
   * @returns TransactionInstruction[] or null if threshold not met
   */
  public static async evaluate(
    agent: Agent
  ): Promise<TransactionInstruction[] | null> {
    const lamports_balance = await getBalance(agent.walletAddress);

    // Threshold: 0.05 SOL
    const threshold = 50_000_000;
    const transfer_amount = 1_000_000; // 0.001 SOL

    if (lamports_balance < threshold) return null;

    const burn_address = "11111111111111111111111111111111";

    return [
      SystemProgram.transfer({
        fromPubkey: new PublicKey(agent.walletAddress),
        toPubkey: new PublicKey(burn_address),
        lamports: transfer_amount,
      }),
    ];
  }
}
