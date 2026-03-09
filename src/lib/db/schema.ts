import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
  serial,
  boolean,
  index,
} from "drizzle-orm/pg-core";

// Table: agents
export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    walletAddress: text("wallet_address").notNull(),
    strategy: text("strategy").notNull(),
    intervalMs: integer("interval_ms").notNull(),
    status: text("status").notNull(), // 'active' | 'paused' | 'stopped'
    // Task 3: execution lock prevents concurrent worker dispatch of the same agent
    execution_lock: boolean("execution_lock").default(false).notNull(),
    // Task 3: DB-persisted last execution timestamp (replaces in-memory tracking)
    last_execution_at: timestamp("last_execution_at"),
    // Task 4: idempotency guard — set before tx submission, cleared after confirmation
    pending_tx: text("pending_tx"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("agents_status_idx").on(table.status),
    index("agents_last_execution_idx").on(table.last_execution_at),
  ]
);

// Table: wallets
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agents.id),
  address: text("address").notNull(),
  // Task 1: stores AES-encrypted private key for DatabaseKeyStore mode (null in file mode)
  encrypted_key: text("encrypted_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table: transactions
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .notNull()
      .references(() => agents.id),
    walletAddress: text("wallet_address").notNull(),
    signature: text("signature").notNull(),
    status: text("status").notNull(), // 'success' | 'failed'
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("transactions_agent_id_idx").on(table.agentId)]
);

// Table: logs
export const logs = pgTable(
  "logs",
  {
    id: serial("id").primaryKey(),
    agentId: uuid("agent_id").references(() => agents.id),
    action: text("action").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("logs_agent_id_idx").on(table.agentId)]
);
