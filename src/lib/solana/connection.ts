import {
  Connection,
  PublicKey,
  Transaction,
  SendOptions,
  VersionedTransaction,
} from "@solana/web3.js";
import { config } from "../config/env";

// RPC endpoint driven by env config — validated at startup, never hardcoded
const RPC_ENDPOINT = config.solana_rpc_url;

// Use a singleton pattern to avoid creating many connections
class SolanaConnection {
  private static instance: Connection;

  public static getInstance(): Connection {
    if (!SolanaConnection.instance) {
      SolanaConnection.instance = new Connection(RPC_ENDPOINT, "confirmed");
    }
    return SolanaConnection.instance;
  }
}

/**
 * Gets the Solana Devnet Connection
 */
export const getConnection = () => {
  return SolanaConnection.getInstance();
};

/**
 * Queries the SOL balance for a given wallet address.
 *
 * @param address - Base58 string of the wallet address
 * @returns Balance in lamports
 */
export const getBalance = async (address: string): Promise<number> => {
  const connection = getConnection();
  const publicKey = new PublicKey(address);
  return await connection.getBalance(publicKey);
};

/**
 * Sends and confirms a transaction on Devnet
 *
 * @param transaction - The transaction to send
 * @param options - Optional send options
 * @returns The transaction signature
 */
export const sendAndConfirmTransaction = async (
  transaction: Transaction | VersionedTransaction,
  options?: SendOptions
): Promise<string> => {
  const connection = getConnection();

  if ("version" in transaction) {
    // It's a VersionedTransaction
    const signature = await connection.sendTransaction(transaction, options);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
    return signature;
  } else {
    // It's a legacy Transaction
    // In web3.js, if we only have the transaction we use sendRawTransaction
    // Note: we assume the transaction is already fully signed by the wallet manager
    const rawTransaction = transaction.serialize();
    const signature = await connection.sendRawTransaction(
      rawTransaction,
      options
    );
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
    return signature;
  }
};
