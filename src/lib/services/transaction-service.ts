import { getTransactionsQuery, getLogsQuery } from "../db/queries";

export class TransactionService {
  public static async getTransactions() {
    return await getTransactionsQuery();
  }

  public static async getLogs(limit: number = 100) {
    return await getLogsQuery(limit);
  }
}
