# Axon

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

> The neural bridge for AI agents on Solana. A secure, programmable vault designed for autonomous signing, sandboxed execution, and independent capital management — without ever losing the safety of human-defined guardrails.

---

## What is Axon?

Axon is a full-stack framework that enables AI agents to autonomously execute transactions on the Solana blockchain. Each agent owns a non-custodial wallet, executes programmable strategies on a schedule, and operates within security boundaries enforced at every layer of the stack.

[Demo Video](https://youtu.be/Fk4ZaOQgXv4)
[X/Twitter Link](https://x.com/Franklivania/status/2031124138807669198?s=20)

---

## Wallet Design

### Keypair Generation

Every agent gets a unique Ed25519 keypair generated via Solana's `Keypair.generate()`. The raw secret key is immediately encrypted before it touches any storage medium — the plaintext private key exists only in memory for the duration of the generation call.

```
Keypair.generate()
    └── secret_key (Uint8Array)
         └── encryptText(Base58(secret_key))  ← AES-256-GCM
              └── stored as: {iv}:{authTag}:{ciphertext}
```

### Pluggable Key Storage

The `IKeyStore` interface abstracts where encrypted keys live. Two backends are provided:

| Backend             | When to use         | Storage location                          |
| ------------------- | ------------------- | ----------------------------------------- |
| `LocalFileKeyStore` | Local development   | `data/wallets/{agent_id}.wallet.enc`      |
| `DatabaseKeyStore`  | Production / Vercel | PostgreSQL `wallets.encrypted_key` column |

Switch backends with the `WALLET_STORAGE` environment variable (`file` or `db`). In serverless environments like Vercel, the filesystem is ephemeral, so the database backend is required for key persistence across deployments.

### WalletManager — the Security Boundary

`WalletManager` is the single class that ever holds a decrypted private key. Its design enforces a strict pattern:

1. `getDecryptedKeypair(agentId)` — retrieves and decrypts the keypair. This is a **private method**. The decrypted `Keypair` object never leaves this method's scope.
2. `executeTransaction(agentId, transaction)` — calls `getDecryptedKeypair` internally, signs the transaction in memory, submits it to the Solana RPC, waits for on-chain confirmation, then returns only the transaction signature.

The decrypted key is never serialized, logged, returned, or stored in any field. It is used and discarded within a single call stack.

---

## Security Considerations

### Encryption at Rest

All private keys are stored encrypted using **AES-256-GCM**, an authenticated encryption scheme that provides both confidentiality and integrity.

- **Key derivation:** The `ENCRYPTION_SECRET` environment variable is hashed with SHA-256 to produce a deterministic 32-byte key.
- **IV:** 16 cryptographically random bytes generated per encryption operation (never reused).
- **Auth tag:** 16-byte GCM authentication tag stored alongside the ciphertext. Decryption fails immediately if the ciphertext has been tampered with.
- **Storage format:** `{iv_hex}:{auth_tag_hex}:{ciphertext_hex}`

### Environment Variables

All secrets are injected via environment variables and validated at startup. Missing variables cause an immediate crash — a fail-secure pattern that prevents the application from running in a degraded, insecure state.

```env
DATABASE_URL=           # Neon PostgreSQL connection string
ENCRYPTION_SECRET=      # 32+ character secret; used to derive AES key
SOLANA_RPC_URL=         # Solana RPC endpoint (devnet or mainnet)
WALLET_STORAGE=         # "file" (dev) or "db" (production)
CRON_SECRET=            # Bearer token protecting the cron endpoint
```

### Log Sanitization

A structured logger (`src/lib/utils/logger.ts`) redacts sensitive field names before any log output reaches the console or database. Fields matching `private_key`, `secret_key`, `seed`, `keypair`, and `decrypted_key` are replaced with `[REDACTED]` via regex pattern matching, regardless of where they appear in logged objects.

### Concurrency & Idempotency

Two mechanisms prevent duplicate or concurrent transaction execution:

**Execution locks** — Before running an agent, the engine performs an atomic PostgreSQL update:

```sql
UPDATE agents SET execution_lock = true
WHERE id = $1 AND execution_lock = false
RETURNING *
```

If the row is not returned, another process already holds the lock and execution is skipped. This prevents two cron invocations from signing two transactions for the same agent simultaneously.

**Pending transaction guard** — Before any network call, `pending_tx` is set to a UUID. If the process crashes and restarts, the agent is skipped until `pending_tx` is manually cleared (via stop → start). This prevents replay of a transaction that may have already landed on-chain.

### Transaction Confirmation

Axon does not use optimistic transaction recording. `WalletManager.executeTransaction()` calls `sendAndConfirmTransaction()` and waits for on-chain confirmation before returning. A transaction is only recorded as "success" after the Solana cluster has confirmed it.

---

## How It Interacts with AI Agents

### Agent as an Autonomous Economic Actor

Each Axon agent is an independent on-chain entity with its own wallet address and SOL balance. The agent has no persistent connection to any user wallet — it controls only the funds explicitly sent to its address.

### The Strategy System

Agents execute pluggable **strategies** — classes that implement a single method:

```typescript
interface Strategy {
  evaluate(agent: Agent): Promise<TransactionInstruction[] | null>;
}
```

A strategy inspects the agent's current state (balance, last execution time, any external signal) and returns either a list of transaction instructions to execute, or `null` to skip this cycle. Critically, **strategies never touch private keys** — they return unsigned instructions only.

Built-in strategies:

| Strategy                 | Behavior                                             |
| ------------------------ | ---------------------------------------------------- |
| `TransferStrategy`       | Transfers 0.001 SOL every cycle if balance allows    |
| `BalanceTriggerStrategy` | Transfers only if balance exceeds 0.05 SOL threshold |

### Execution Flow

```
Cron Trigger (daily / configurable)
    ↓
Fetch active, unlocked agents
    ↓
For each agent:
    ├── Acquire execution lock (atomic SQL)
    ├── Check if interval has elapsed since last_execution_at
    ├── Strategy.evaluate(agent) → TransactionInstruction[]
    ├── TransactionBuilder.compile() → VersionedTransaction
    │   └── Fresh blockhash fetched from RPC
    ├── WalletManager.executeTransaction()
    │   ├── Decrypt keypair (in-memory only)
    │   ├── Sign VersionedTransaction
    │   ├── sendAndConfirmTransaction() → Solana RPC
    │   └── Return signature (key discarded)
    ├── Record transaction (success / failed)
    └── Release execution lock
```

### Agent Lifecycle

1. **Create** — A keypair is generated and encrypted. The agent row and wallet row are inserted into the database. The agent starts in `stopped` status.
2. **Start** — Status is set to `active`. The cron loop will begin executing the agent on its configured interval.
3. **Pause / Stop** — Status updated; the cron loop skips non-active agents.
4. **Delete** — Agent and associated wallet records are removed. The encrypted key is deleted from storage.

### Scheduling

The execution loop runs via a Vercel cron job (`/api/cron/agent-loop`), protected by a bearer token. On the Hobby plan this fires once daily; Pro plans support higher frequencies. Each agent has its own `intervalMs` setting — the loop checks `last_execution_at` and skips agents whose interval has not yet elapsed, so multiple agents can have different execution cadences within the same cron trigger.

---

## Architecture Overview

```
src/
├── app/
│   ├── api/
│   │   ├── agents/          # CRUD + start/stop endpoints
│   │   └── cron/            # Scheduled execution loop
│   └── (pages)/             # Next.js app router pages
├── components/              # React UI components
└── lib/
    ├── agents/
    │   ├── agent-engine.ts       # Execution coordinator
    │   ├── agent-registry.ts     # Agent creation orchestration
    │   └── strategies/           # Pluggable strategy implementations
    ├── wallet/
    │   ├── wallet-manager.ts     # Keypair lifecycle + signing
    │   └── key-store.ts          # Pluggable encrypted key storage
    ├── security/
    │   └── encryption.ts         # AES-256-GCM encrypt / decrypt
    ├── solana/
    │   ├── connection.ts         # RPC connection singleton
    │   └── transaction-builder.ts # Instruction → VersionedTransaction
    ├── db/
    │   ├── schema.ts             # Drizzle ORM table definitions
    │   └── queries.ts            # Data access layer
    └── config/
        └── env.ts                # Startup env validation
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon PostgreSQL database
- A Solana RPC endpoint (devnet or mainnet)

### Install

```bash
npm install
```

### Configure

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

### Database Setup

```bash
npm run db:push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Axon is designed for deployment on Vercel with a Neon PostgreSQL database. Set `WALLET_STORAGE=db` in your Vercel environment to use the database key store, which persists across deployments.

The cron job at `/api/cron/agent-loop` must be configured in `vercel.json` and protected with the `CRON_SECRET` bearer token.
