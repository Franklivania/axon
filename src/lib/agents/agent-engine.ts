import crypto from "crypto";
import { WalletManager } from "../wallet/wallet-manager";
import {
  insertLogQuery,
  recordTransactionQuery,
  setPendingTxQuery,
  clearPendingTxQuery,
} from "../db/queries";
import { TransactionBuilder } from "../solana/transaction-builder";
import { TransferStrategy } from "./strategies/transfer_strategy";
import { BalanceTriggerStrategy } from "./strategies/balance_trigger_strategy";

export class AgentEngine {
  /**
   * Executes one agent tick: evaluates its strategy, compiles instructions,
   * and submits a transaction through WalletManager.
   *
   * Idempotency (Task 4):
   *   - If agent.pending_tx is already set, a previous cycle submitted a tx that
   *     was not confirmed or cleared. Skip to avoid duplicate submission.
   *   - pending_tx is set before submission and cleared in the finally block so
   *     it always resets after each attempt (success or failure).
   *   - Known limitation: if the process is killed between setPendingTx and
   *     clearPendingTx the agent will be permanently skipped. Use the stop→start
   *     API to reset the field manually.
   *
   * Transaction confirmation (Task 5):
   *   - WalletManager.executeTransaction awaits on-chain confirmation before
   *     returning. The transaction is recorded as "success" only after that.
   *   - Any error during send or confirmation records a "failed" transaction.
   *
   * Strategy isolation (Task 9):
   *   - Strategies return TransactionInstruction[] — not a pre-built tx.
   *   - This engine compiles instructions → VersionedTransaction.
   *   - WalletManager signs and submits. Agents never touch private keys.
   *
   * @param agent - The agent database record (must include pending_tx field)
   */
  public static async executeAgent(agent: any) {
    // Task 4: skip if a previous execution left a pending transaction
    if (agent.pending_tx) {
      await insertLogQuery(
        "execution_skipped",
        `Agent ${agent.name} skipped: pending_tx=${agent.pending_tx} already set. Use stop→start to reset.`,
        agent.id
      );
      return;
    }

    // Task 4: set idempotency key before any network call
    const idempotency_key = crypto.randomUUID();
    await setPendingTxQuery(agent.id, idempotency_key);

    try {
      await insertLogQuery("execution_started", `Agent ${agent.name} execution started`, agent.id);

      // Task 9: evaluate strategy — returns raw instructions, never a signed tx
      let instructions = null;

      switch (agent.strategy) {
        case "transfer_strategy":
          instructions = await TransferStrategy.evaluate(agent);
          break;
        case "balance_trigger_strategy":
          instructions = await BalanceTriggerStrategy.evaluate(agent);
          break;
        default:
          await insertLogQuery("strategy_error", `Unknown strategy: ${agent.strategy}`, agent.id);
          return;
      }

      if (!instructions) {
        await insertLogQuery(
          "strategy_decision",
          `Agent ${agent.name} decided to take no action`,
          agent.id
        );
        return;
      }

      await insertLogQuery("strategy_decision", `Agent ${agent.name} generated instructions`, agent.id);

      // Task 9: compile instructions into VersionedTransaction (blockhash fetched here,
      // not during strategy evaluation, so it is always fresh)
      const transaction = await TransactionBuilder.compileToVersionedTransaction(
        agent.walletAddress,
        instructions
      );

      // Task 5: WalletManager signs and waits for on-chain confirmation before returning
      const signature = await WalletManager.executeTransaction(agent.id, transaction);

      // Task 5: record actual confirmed success — not optimistic
      await recordTransactionQuery(agent.id, agent.walletAddress, signature, "success");
      await insertLogQuery("transaction_sent", `Transaction sent: ${signature}`, agent.id);
      await insertLogQuery(
        "transaction_confirmed",
        `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        agent.id
      );
    } catch (error: any) {
      console.error(`[agent-engine] Error executing agent ${agent.id}: ${error.message}`);
      await insertLogQuery("execution_error", `Error: ${error.message}`, agent.id);
      await recordTransactionQuery(
        agent.id,
        agent.walletAddress,
        error.message.substring(0, 100),
        "failed"
      );
    } finally {
      // Task 4: always clear the idempotency key so the next cycle can run
      await clearPendingTxQuery(agent.id);
    }
  }
}
