import { getWalletByAgentIdQuery } from "../db/queries";
import { getBalance } from "../solana/connection";

export class WalletService {
  /**
   * Retrieves a wallet DB record and its SOL balance
   */
  public static async getAgentWalletWithBalance(agentId: string) {
    const wallet = await getWalletByAgentIdQuery(agentId);
    if (!wallet) return null;

    const lamports = await getBalance(wallet.address);

    return {
      ...wallet,
      balanceLamports: lamports,
      balanceSol: lamports / 1000000000,
    };
  }
}
