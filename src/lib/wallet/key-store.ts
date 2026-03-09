import fs from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { wallets } from "../db/schema";

/**
 * Storage abstraction for encrypted Solana wallet private keys.
 *
 * Two implementations are provided:
 *   - LocalFileKeyStore: writes encrypted keys to data/wallets/ on disk (development default)
 *   - DatabaseKeyStore:  stores encrypted keys in the Neon wallets table (serverless / production)
 *
 * The active implementation is selected once at startup via the WALLET_STORAGE env var.
 * WalletManager depends on this interface, never on a concrete implementation.
 */
export interface IKeyStore {
  saveEncryptedKey(agent_id: string, encrypted_key: string): Promise<void>;
  loadEncryptedKey(agent_id: string): Promise<string>;
}

// ---------------------------------------------------------------------------
// Local file implementation
// ---------------------------------------------------------------------------

export class LocalFileKeyStore implements IKeyStore {
  private readonly wallets_dir: string;

  constructor() {
    this.wallets_dir = path.resolve(process.cwd(), "data/wallets");
  }

  private async ensure_directory(): Promise<void> {
    await fs.mkdir(this.wallets_dir, { recursive: true }).catch(() => {
      // Directory already exists — ignore
    });
  }

  async saveEncryptedKey(
    agent_id: string,
    encrypted_key: string
  ): Promise<void> {
    await this.ensure_directory();
    const wallet_path = path.join(this.wallets_dir, `${agent_id}.wallet.enc`);
    await fs.writeFile(wallet_path, encrypted_key, "utf-8");
  }

  async loadEncryptedKey(agent_id: string): Promise<string> {
    const wallet_path = path.join(this.wallets_dir, `${agent_id}.wallet.enc`);
    return await fs.readFile(wallet_path, "utf-8");
  }
}

// ---------------------------------------------------------------------------
// Database implementation
// ---------------------------------------------------------------------------

export class DatabaseKeyStore implements IKeyStore {
  /**
   * Updates the encrypted_key column on the wallets row for agent_id.
   * The wallet row must already exist (created by createWalletRecordQuery)
   * before this is called.
   */
  async saveEncryptedKey(
    agent_id: string,
    encrypted_key: string
  ): Promise<void> {
    await db
      .update(wallets)
      .set({ encrypted_key })
      .where(eq(wallets.agentId, agent_id));
  }

  async loadEncryptedKey(agent_id: string): Promise<string> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.agentId, agent_id));

    if (!wallet?.encrypted_key) {
      throw new Error(`No encrypted key found in DB for agent ${agent_id}`);
    }

    return wallet.encrypted_key;
  }
}

// ---------------------------------------------------------------------------
// Factory (singleton)
// ---------------------------------------------------------------------------

let _key_store_instance: IKeyStore | null = null;

/**
 * Returns the singleton IKeyStore selected by the WALLET_STORAGE env var.
 * Automatically uses DatabaseKeyStore on Vercel or any production environment
 * where the filesystem is read-only. Falls back to LocalFileKeyStore for local dev.
 */
export function getKeyStore(): IKeyStore {
  if (_key_store_instance) return _key_store_instance;
  const useDb =
    process.env.WALLET_STORAGE === "db" ||
    !!process.env.VERCEL ||
    process.env.NODE_ENV === "production";
  _key_store_instance = useDb
    ? new DatabaseKeyStore()
    : new LocalFileKeyStore();
  return _key_store_instance;
}
