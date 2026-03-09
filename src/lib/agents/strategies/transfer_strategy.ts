import { TransactionInstruction, PublicKey, SystemProgram } from "@solana/web3.js";
import { getBalance } from "../../solana/connection";

export class TransferStrategy {
  /**
   * Evaluates whether to execute a transfer.
   * Transfers 0.001 SOL whenever the wallet has sufficient balance.
   *
   * Strategies return raw TransactionInstruction[] — never a signed or
   * pre-built transaction. AgentEngine compiles them and WalletManager signs.
   *
   * @param agent - The agent data from DB
   * @returns TransactionInstruction[] or null if conditions aren't met
   */
  public static async evaluate(agent: any): Promise<TransactionInstruction[] | null> {
    const lamports_balance = await getBalance(agent.walletAddress);

    // 0.001 SOL transfer amount + 5000 lamport fee buffer
    const transfer_amount = 1_000_000;
    if (lamports_balance < transfer_amount + 5000) return null;

    // Burn address (SystemProgram ID) used as a safe demo recipient
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
