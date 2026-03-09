import {
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { getConnection } from "./connection";

export class TransactionBuilder {
  /**
   * Builds a VersionedTransaction for transferring native SOL.
   *
   * @param senderAddress - The sender wallet address
   * @param recipientAddress - The recipient wallet address
   * @param lamports - The amount of SOL to send in lamports
   * @returns Unsigned VersionedTransaction
   */
  public static async buildSolTransfer(
    senderAddress: string,
    recipientAddress: string,
    lamports: number
  ): Promise<VersionedTransaction> {
    const sender = new PublicKey(senderAddress);
    const recipient = new PublicKey(recipientAddress);

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: recipient,
      lamports,
    });

    return await this.compileToVersionedTransaction(sender, [
      transferInstruction,
    ]);
  }

  /**
   * Builds a VersionedTransaction for transferring SPL tokens.
   * This assumes the recipient's Associated Token Account (ATA) already exists.
   *
   * @param senderAddress - The sender wallet address
   * @param recipientAddress - The recipient wallet address
   * @param mintAddress - The token mint address
   * @param amount - Raw amount of tokens to transfer
   * @returns Unsigned VersionedTransaction
   */
  public static async buildSplTransfer(
    senderAddress: string,
    recipientAddress: string,
    mintAddress: string,
    amount: number | bigint
  ): Promise<VersionedTransaction> {
    const sender = new PublicKey(senderAddress);
    const recipient = new PublicKey(recipientAddress);
    const mint = new PublicKey(mintAddress);

    // Get the associated token addresses
    const senderATA = await getAssociatedTokenAddress(mint, sender);
    const recipientATA = await getAssociatedTokenAddress(mint, recipient);

    const transferInstruction = createTransferInstruction(
      senderATA,
      recipientATA,
      sender,
      amount
    );

    return await this.compileToVersionedTransaction(sender, [
      transferInstruction,
    ]);
  }

  /**
   * Compiles an array of instructions into an unsigned VersionedTransaction.
   * Accepts either a PublicKey or a Base58 wallet address string.
   * Made public so AgentEngine can compile strategy-returned instructions
   * before handing the transaction to WalletManager for signing and submission.
   */
  public static async compileToVersionedTransaction(
    payer: PublicKey | string,
    instructions: TransactionInstruction[]
  ): Promise<VersionedTransaction> {
    if (typeof payer === "string") payer = new PublicKey(payer);
    const connection = getConnection();
    const latestBlockhash = await connection.getLatestBlockhash("confirmed");

    const messageV0 = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: latestBlockhash.blockhash,
      instructions,
    }).compileToV0Message();

    return new VersionedTransaction(messageV0);
  }
}
