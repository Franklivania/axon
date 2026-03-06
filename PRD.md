# Axon — Product Requirements Document

## Overview

Axon is an agent execution infrastructure that enables autonomous software agents to control Solana wallets and execute blockchain transactions without human approval.

The system demonstrates how AI or algorithmic agents can operate as independent actors within the Solana ecosystem.

Axon provides:

- programmatically created wallets
- autonomous transaction execution
- secure key management
- multi-agent orchestration
- observable execution logs
- explorer-verifiable transactions

The system operates entirely on **Solana Devnet**.

---

# Objectives

The primary objective of Axon is to demonstrate that autonomous agents can:

1. Create and control Solana wallets
2. Make independent decisions
3. Execute transactions automatically
4. Operate securely without exposing private keys
5. Run multiple agents concurrently

The system must prove these behaviors in a reproducible environment.

---

# Success Criteria

Axon is considered complete when the following conditions are satisfied:

- Agents can create wallets programmatically
- Wallet private keys are securely encrypted
- Agents can execute transactions without human approval
- Transactions are confirmed on Solana Devnet
- Multiple agents can run simultaneously
- Agent behavior and logs are observable
- Transactions can be verified on Solana Explorer
- Documentation clearly explains architecture and security

---

# Target Users

### Primary Users

Developers exploring autonomous blockchain agents.

### Secondary Users

Hackathon judges evaluating:

- architecture
- security
- scalability
- documentation

---

# Core System Concept

Axon separates agent decision-making from wallet execution.

System model:

```

User
↓
Agent
↓
Wallet Manager
↓
Solana RPC

```

Agents decide **what to do**.

Wallet manager decides **how transactions are executed**.

Private keys are never exposed to agents.

---

# Core Features

## Agent Creation

Users must be able to create agents.

Agent creation includes:

- agent name
- strategy selection
- execution interval

Upon creation:

- a new wallet is generated
- private key is encrypted and stored
- wallet address is assigned to the agent

---

## Agent Wallet Management

Each agent owns exactly one wallet.

Wallet capabilities:

- receive SOL
- send SOL
- hold SPL tokens
- query balances

Wallets must be stored encrypted.

Private keys must never be exposed.

---

## Autonomous Agent Execution

Agents must run periodic execution loops.

Each execution cycle must:

1. evaluate agent strategy
2. determine if an action is required
3. generate transaction instructions
4. request execution from wallet manager

Agents must operate without manual confirmation.

---

## Transaction Execution

Wallet manager must:

- sign transactions
- submit transactions to Solana RPC
- confirm transaction results

Agents must never sign transactions.

All signing must occur inside the wallet manager.

---

## Multi-Agent Support

The system must support multiple active agents.

Each agent must have:

- independent wallet
- independent strategy
- independent execution loop
- isolated transaction history

Agents must not interfere with one another.

---

## Agent Logging

Every agent action must generate logs.

Example logs:

```

[agent: timestamp] execution started
[agent: timestamp] balance check
[agent: timestamp] strategy decision
[wallet: timestamp] transaction submitted
[wallet: timestamp] transaction confirmed

```

Logs must be visible in the dashboard.

Logs must never expose private keys.

---

## Explorer Integration

All transactions must be verifiable on Solana Explorer.

Each transaction must include a link:

```

[https://explorer.solana.com/tx/{signature}?cluster=devnet](https://explorer.solana.com/tx/{signature}?cluster=devnet)

```

This provides external verification of the system.

---

# Security Requirements

Security is a primary design requirement.

The system must enforce the following rules.

## Private Key Protection

Private keys must:

- be encrypted before storage
- never appear in logs
- never be returned via APIs
- never be accessible by agent logic

## Signing Isolation

Only the wallet execution layer may sign transactions.

Agents must not access signing functionality directly.

Valid flow:

```

Agent
↓
Wallet Manager
↓
Transaction Signing

```

## Encrypted Wallet Storage

Wallet files must be encrypted and stored securely.

Storage location:

```

data/wallets/

```

Example file:

```

agent_1.wallet.enc

```

---

# System Architecture

Axon consists of four layers.

### Agent Layer

Handles decision making.

Responsibilities:

- evaluate strategies
- generate instructions
- trigger wallet execution

---

### Wallet Execution Layer

Handles secure wallet operations.

Responsibilities:

- wallet generation
- key encryption
- transaction signing
- transaction submission

---

### Solana Integration Layer

Handles blockchain communication.

Responsibilities:

- RPC connection
- transaction construction
- token operations

---

### Observation Layer

Handles visibility and monitoring.

Responsibilities:

- display agent state
- show logs
- show balances
- display transaction history

---

# Functional Requirements

Axon must support the following operations.

### Wallet Operations

- create wallet
- query SOL balance
- query token balances
- transfer SOL
- transfer SPL tokens

### Agent Operations

- create agent
- start agent
- stop agent
- observe logs
- view transactions

---

# Non-Functional Requirements

### Security

Private keys must always remain encrypted.

### Deterministic Execution

Agent behavior must be reproducible.

### Observability

All agent actions must be logged.

### Scalability

System must support multiple agents simultaneously.

---

# Demonstration Scenario

A working demonstration must include:

1. Create three agents
2. Generate three wallets
3. Fund wallets on Solana Devnet
4. Start agents
5. Agents execute transactions periodically
6. Logs display execution activity
7. Transactions appear on Solana Explorer

This proves the system functions end-to-end.

---

# Deliverables

The repository must include:

- working Next.js application
- open-source code
- clear README instructions
- architecture documentation
- security documentation
- AGENTS.md
- SKILLS.md

The project must run locally and demonstrate autonomous wallet execution.

---

# Definition of Done

Axon is complete when:

- agents can create wallets automatically
- wallets securely store encrypted private keys
- agents execute transactions autonomously
- transactions are confirmed on Solana Devnet
- multiple agents run simultaneously
- logs and actions are observable
- explorer links verify transactions
- documentation explains architecture and security
