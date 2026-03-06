# SKILLS.md

This file describes the capabilities available to agents within the Axon system.

Agents use these skills to interact with their wallets and execute transactions on Solana.

All skills are executed through the wallet manager interface.

Agents do not hold private keys.

---

# Wallet Skills

### create_wallet

Creates a new Solana wallet for an agent.

Returns:

- wallet_address

Private keys are encrypted and stored securely.

---

### get_balance

Retrieves the SOL balance of the agent wallet.

Returns:

- lamports
- SOL equivalent

---

### get_token_balances

Returns SPL token balances for the wallet.

Returns:

- token_mint
- token_balance

---

# Transaction Skills

### transfer_sol

Transfers SOL from the agent wallet to a recipient.

Parameters:

```

recipient_address
amount_lamports

```

Returns:

```

transaction_signature

```

---

### transfer_spl_token

Transfers an SPL token from the agent wallet.

Parameters:

```

token_mint
recipient_address
amount

```

Returns:

```

transaction_signature

```

---

### execute_transaction

Executes a custom Solana transaction built from instructions.

Parameters:

```

instructions[]

```

Returns:

```

transaction_signature

```

---

# Observation Skills

### get_transaction_status

Retrieves transaction confirmation status.

Returns:

```

confirmed
pending
failed

```

---

### get_wallet_address

Returns the wallet address assigned to the agent.

---

# Logging Skills

Agents must log all actions.

Examples:

```

balance_check
transfer_requested
transaction_submitted
transaction_confirmed

```

Logs are stored and displayed in the Axon dashboard.

---

# Network

All transactions operate on **Solana Devnet**.

RPC Endpoint:

```

[https://api.devnet.solana.com](https://api.devnet.solana.com)

```

Explorer:

```

[https://explorer.solana.com/?cluster=devnet](https://explorer.solana.com/?cluster=devnet)

```

---

# Execution Model

Agents operate in periodic loops.

Example flow:

```

agent_tick
↓
evaluate_strategy
↓
generate_instruction
↓
wallet.execute
↓
log_result

```

Multiple agents may run simultaneously.

Each agent operates independently.

---

# Security Constraints

Agents cannot:

- access private keys
- sign transactions directly
- modify wallet storage
- bypass wallet execution APIs

All transactions must pass through the wallet manager.
