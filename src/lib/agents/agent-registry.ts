import {
  createAgentQuery,
  getAgentsQuery,
  getAgentByIdQuery,
  updateAgentStatusQuery,
  createWalletRecordQuery,
} from "../db/queries";
import { WalletManager } from "../wallet/wallet-manager";
import { getKeyStore } from "../wallet/key-store";
import crypto from "crypto";

export class AgentRegistry {
  /**
   * Orchestrates the creation of a new agent.
   *
   * Flow (Task 10 — eliminates the temp-file rename hack):
   *   1. Pre-generate a UUID so the same ID is used for the DB row AND key storage.
   *   2. Generate the keypair + encrypted key without storing anything yet.
   *   3. Store the encrypted key via the configured IKeyStore.
   *      - File mode: writes to data/wallets/{agent_id}.wallet.enc immediately.
   *      - DB mode:   the key is embedded in the wallet row INSERT (step 5).
   *   4. Insert the agent row using the pre-generated ID.
   *   5. Insert the wallet row with the encrypted_key so DB mode has it at INSERT time.
   *
   * @param name - Human-readable name of the agent
   * @param strategy - Strategy identifier the agent executes
   * @param intervalMs - Execution loop interval in milliseconds
   * @returns The created agent DB record
   */
  public static async createAgent(
    name: string,
    strategy: string,
    intervalMs: number
  ) {
    // Pre-generate the agent ID — used for both DB and key storage
    const agent_id = crypto.randomUUID();

    // Generate keypair + encrypt key without persisting anything yet
    const { wallet_address, encrypted_key } =
      WalletManager.generateEncryptedWallet();

    // Persist encrypted key via key store (file mode writes to disk here;
    // DB mode will persist it via the wallet row INSERT below)
    await getKeyStore().saveEncryptedKey(agent_id, encrypted_key);

    // Insert agent row with the pre-generated ID
    const agent = await createAgentQuery(
      name,
      wallet_address,
      strategy,
      intervalMs,
      agent_id
    );

    // Insert wallet metadata row — encrypted_key is included so DB mode has it
    await createWalletRecordQuery(agent.id, wallet_address, encrypted_key);

    return agent;
  }

  /**
   * Retrieves all agents.
   */
  public static async getAgents() {
    return await getAgentsQuery();
  }

  /**
   * Retrieves a specific agent by ID.
   *
   * @param agentId - The agent ID
   */
  public static async getAgentById(agentId: string) {
    return await getAgentByIdQuery(agentId);
  }

  /**
   * Updates an agent's execution status.
   *
   * @param agentId - The agent ID
   * @param status - The new status ('active', 'paused', 'stopped')
   */
  public static async updateAgentStatus(agentId: string, status: string) {
    return await updateAgentStatusQuery(agentId, status);
  }
}
