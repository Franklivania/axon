# AGENTS.md

This document defines how software agents interact with the Axon wallet system.

Agents in Axon are autonomous execution units that control Solana wallets and
perform transactions without human approval.

Agents DO NOT hold private keys directly. All transaction signing is handled
by the wallet execution layer.

---

# Agent Model

Each agent owns a single wallet.

User
└ Agent
└ Wallet

Agents are responsible for:

- evaluating strategy conditions
- generating transaction instructions
- requesting execution from the wallet manager

Agents are NOT responsible for:

- key storage
- transaction signing
- RPC communication

Those responsibilities belong to the wallet layer.

---

# Agent Capabilities

Agents may:

- query wallet balance
- read token balances
- generate Solana transaction instructions
- request transaction execution
- log actions and decisions

Agents may NOT:

- access private keys
- sign transactions
- modify wallet storage
- bypass wallet execution APIs

---

# Wallet Execution Interface

Agents interact with the wallet system through a controlled interface.

Example:

wallet.execute(instruction)

Available operations:

create_wallet(agent_id)

get_balance(wallet_address)

transfer_sol(wallet_address, recipient, lamports)

transfer_spl_token(wallet_address, mint, recipient, amount)

execute_transaction(instructions)

---

# Strategy Execution

Agent behavior is defined in code strategies.

Location:

lib/agents/strategies/

Example strategies:

transfer_strategy.ts
liquidity_strategy.ts
arb_strategy.ts

Strategies produce instructions that are passed to the wallet manager.

---

# Agent Execution Loop

Agents run in a periodic loop.

Execution flow:

agent_tick()
↓
evaluate_strategy()
↓
generate_instruction()
↓
wallet.execute()
↓
log_result()

Agents must never block the runtime or perform long synchronous operations.

---

# Logging

Every agent action must generate logs.

Examples:

[agent] balance_check
[agent] decision_transfer
[wallet] transaction_sent
[wallet] transaction_confirmed

Logs are used for debugging and dashboard visualization.

---

# Security Model

Private keys are encrypted and stored by the wallet manager.

Agents cannot access private keys.

Wallet signing is isolated from agent logic.

All transactions pass through the wallet execution layer.

---

# Multi-Agent Operation

Multiple agents may run simultaneously.

Each agent has:

- its own wallet
- its own strategy
- its own execution loop
- independent balances

Agents must not interfere with each other.

---

# Supported Networks

Development environment uses Solana devnet.

RPC endpoint:

https://api.devnet.solana.com

Transactions should always include devnet explorer links in logs.

Example:

https://explorer.solana.com/tx/<signature>?cluster=devnet
