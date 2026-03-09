/**
 * Runtime environment variable validation.
 * Validated at module load time — missing variables cause an immediate startup crash.
 * Import this module before any code that depends on env vars.
 */

function require_env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = Object.freeze({
  database_url: require_env("DATABASE_URL"),
  encryption_secret: require_env("ENCRYPTION_SECRET"),
  solana_rpc_url: require_env("SOLANA_RPC_URL"),
});
