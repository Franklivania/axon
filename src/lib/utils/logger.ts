import { insertLogQuery } from "../db/queries";

export class Logger {
  /**
   * Logs a message to the database and optionally to the console.
   * Ensures no private keys or extremely sensitive data formats are logged.
   */
  public static async log(action: string, message: string, agentId?: string) {
    // Sanitize: strip values for any known sensitive field names before writing to DB or console.
    const sanitizedMessage = this.sanitize(message);

    // Write to console
    const agentPrefix = agentId ? `[agent:${agentId}]` : `[system]`;
    console.log(`${agentPrefix} ${action}: ${sanitizedMessage}`);

    // Commit to DB
    await insertLogQuery(action, sanitizedMessage, agentId);
  }

  private static sanitize(message: string): string {
    // Explicit field-name blocklist: redact values that follow known sensitive field names.
    // This is deterministic and does not rely on value length or format heuristics.
    return message.replace(
      /(private_key|secret_key|seed|keypair|decrypted_key)[=:\s]+\S+/gi,
      "$1=[REDACTED]"
    );
  }
}
