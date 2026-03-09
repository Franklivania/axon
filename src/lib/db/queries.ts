import { eq, and } from "drizzle-orm";
import { db } from "./client";
import { agents, wallets, transactions, logs } from "./schema";

/** Agents */

export async function createAgentQuery(
  name: string,
  walletAddress: string,
  strategy: string,
  intervalMs: number,
  id?: string // Task 10: accept pre-generated ID to eliminate temp-file rename hack
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any = {
    name,
    walletAddress,
    strategy,
    intervalMs,
    status: "active",
  };
  if (id) values.id = id;

  const [agent] = await db.insert(agents).values(values).returning();
  return agent;
}

export async function getAgentsQuery() {
  return await db.select().from(agents);
}

export async function getAgentByIdQuery(id: string) {
  const [agent] = await db.select().from(agents).where(eq(agents.id, id));
  return agent;
}

export async function updateAgentStatusQuery(id: string, status: string) {
  const [agent] = await db
    .update(agents)
    .set({ status })
    .where(eq(agents.id, id))
    .returning();
  return agent;
}

export async function updateAgentConfigQuery(id: string, intervalMs: number) {
  const [agent] = await db
    .update(agents)
    .set({ intervalMs })
    .where(eq(agents.id, id))
    .returning();
  return agent;
}

/** Wallets */

export async function createWalletRecordQuery(
  agentId: string,
  address: string,
  encrypted_key?: string // Task 1: passed at INSERT time for DatabaseKeyStore mode
) {
  const [wallet] = await db
    .insert(wallets)
    .values({
      agentId,
      address,
      encrypted_key: encrypted_key ?? null,
    })
    .returning();
  return wallet;
}

export async function getWalletByAgentIdQuery(agentId: string) {
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.agentId, agentId));
  return wallet;
}

/** Transactions */

export async function recordTransactionQuery(
  agentId: string,
  walletAddress: string,
  signature: string,
  status: string
) {
  const [tx] = await db
    .insert(transactions)
    .values({
      agentId,
      walletAddress,
      signature,
      status,
    })
    .returning();
  return tx;
}

export async function getTransactionsQuery() {
  return await db.select().from(transactions);
}

/** Logs */

export async function insertLogQuery(
  action: string,
  message: string,
  agentId?: string
) {
  const [log] = await db
    .insert(logs)
    .values({
      action,
      message,
      agentId: agentId || null,
    })
    .returning();
  return log;
}

export async function getLogsQuery(limit: number = 100) {
  return await db.select().from(logs).limit(limit);
}

/** Execution Locks (Task 3) */

/**
 * Atomically acquires the execution lock for an agent.
 * Uses a single UPDATE ... WHERE execution_lock=false RETURNING * which is
 * atomic at the PostgreSQL level — no transaction wrapper needed.
 *
 * Returns the updated agent row if the lock was acquired, or null if it was
 * already held by another worker.
 */
export async function acquireExecutionLockQuery(agent_id: string) {
  const [agent] = await db
    .update(agents)
    .set({ execution_lock: true })
    .where(and(eq(agents.id, agent_id), eq(agents.execution_lock, false)))
    .returning();
  return agent ?? null;
}

/**
 * Releases the execution lock AND records the current timestamp as
 * last_execution_at. Call this only when the agent actually ran.
 */
export async function releaseExecutionLockQuery(agent_id: string) {
  const [agent] = await db
    .update(agents)
    .set({ execution_lock: false, last_execution_at: new Date() })
    .where(eq(agents.id, agent_id))
    .returning();
  return agent;
}

/**
 * Releases the execution lock WITHOUT updating last_execution_at.
 * Call this when the agent was skipped (interval not yet elapsed).
 */
export async function releaseExecutionLockOnlyQuery(agent_id: string) {
  const [agent] = await db
    .update(agents)
    .set({ execution_lock: false })
    .where(eq(agents.id, agent_id))
    .returning();
  return agent;
}

/**
 * Returns all active agents that are not currently locked.
 * The worker calls this each poll cycle instead of filtering in-memory.
 */
export async function getActiveUnlockedAgentsQuery() {
  return await db
    .select()
    .from(agents)
    .where(and(eq(agents.status, "active"), eq(agents.execution_lock, false)));
}

/** Idempotency (Task 4) */

/**
 * Sets the pending_tx field to a unique idempotency key before transaction
 * submission. If the process crashes mid-execution, this prevents a re-run
 * from submitting a duplicate transaction.
 *
 * Known limitation: a crash between setPendingTx and clearPendingTx will
 * leave the agent permanently skipped. Use the stop→start API to reset.
 */
export async function setPendingTxQuery(agent_id: string, key: string) {
  const [agent] = await db
    .update(agents)
    .set({ pending_tx: key })
    .where(eq(agents.id, agent_id))
    .returning();
  return agent;
}

/**
 * Clears the pending_tx field after a transaction is confirmed or has failed.
 * Always called in the engine's finally block.
 */
export async function clearPendingTxQuery(agent_id: string) {
  const [agent] = await db
    .update(agents)
    .set({ pending_tx: null })
    .where(eq(agents.id, agent_id))
    .returning();
  return agent;
}
