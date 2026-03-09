import { Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { encryptText, decryptText } from "../security/encryption";
import { sendAndConfirmTransaction } from "../solana/connection";
import { getKeyStore } from "./key-store";
import bs58 from "bs58";

export class WalletManager {
  /**
   * Generates a new Solana keypair and returns the wallet address alongside
   * the AES-encrypted private key WITHOUT persisting it anywhere.
   *
   * The caller (AgentRegistry) is responsible for storing the encrypted key
   * via the appropriate IKeyStore or by embedding it in the wallet DB record.
   * This method exists to break the chicken-and-egg ordering problem between
   * wallet creation and DB row insertion.
   *
   * @returns wallet_address (Base58) and encrypted_key (AES ciphertext)
   */
  public static generateEncryptedWallet(): {
    wallet_address: string;
    encrypted_key: string;
  } {
    const keypair = Keypair.generate();
    const wallet_address = keypair.publicKey.toBase58();
    const secret_key_base58 = bs58.encode(keypair.secretKey);
    const encrypted_key = encryptText(secret_key_base58);
    return { wallet_address, encrypted_key };
  }

  /**
   * Creates a new Solana wallet, encrypts the private key, and stores it
   * via the configured IKeyStore (file or database).
   *
   * @param agent_id - The ID of the agent that owns the wallet
   * @returns Base58 string of the wallet address
   */
  public static async createWallet(agent_id: string): Promise<string> {
    const { wallet_address, encrypted_key } = this.generateEncryptedWallet();
    await getKeyStore().saveEncryptedKey(agent_id, encrypted_key);
    return wallet_address;
  }

  /**
   * Retrieves and decrypts a wallet's keypair via the configured IKeyStore.
   * The decrypted key NEVER leaves this method.
   * NEVER expose this outside of the WalletManager.
   *
   * @param agent_id - The ID of the agent
   * @returns The decrypted Solana Keypair
   */
  private static async getDecryptedKeypair(agent_id: string): Promise<Keypair> {
    try {
      const encrypted_secret = await getKeyStore().loadEncryptedKey(agent_id);
      const decrypted_secret_base58 = decryptText(encrypted_secret);
      const secret_key_bytes = bs58.decode(decrypted_secret_base58);
      return Keypair.fromSecretKey(secret_key_bytes);
    } catch (error: any) {
      throw new Error(
        `Failed to retrieve or decrypt wallet for agent ${agent_id}: ${error.message}`
      );
    }
  }

  /**
   * Signs and submits a transaction on behalf of an agent, then waits for
   * on-chain confirmation before returning the signature.
   *
   * @param agentId - The agent ID owning the wallet
   * @param transaction - The unsigned transaction to execute
   * @returns The confirmed transaction signature (txid)
   */
  public static async executeTransaction(
    agentId: string,
    transaction: Transaction | VersionedTransaction
  ): Promise<string> {
    const keypair = await this.getDecryptedKeypair(agentId);

    if ("version" in transaction) {
      // Versioned transaction
      transaction.sign([keypair]);
      return await sendAndConfirmTransaction(transaction);
    } else {
      // Legacy transaction — blockhash must be set by the transaction builder
      transaction.partialSign(keypair);
      return await sendAndConfirmTransaction(transaction);
    }
  }
}
