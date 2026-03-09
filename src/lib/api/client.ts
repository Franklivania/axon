export interface Agent {
  id: string;
  name: string;
  walletAddress: string;
  strategy: string;
  intervalMs: number;
  status: "active" | "paused" | "stopped";
  execution_lock: boolean;
  last_execution_at: string | null;
  pending_tx: string | null;
  createdAt: string;
}

export interface Log {
  id: number;
  agentId: string | null;
  action: string;
  message: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  agentId: string;
  walletAddress: string;
  signature: string;
  status: "success" | "failed";
  createdAt: string;
}

export interface CreateAgentPayload {
  name: string;
  strategy: string;
  intervalMs: number;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAgents(): Promise<Agent[]> {
  return apiFetch<Agent[]>("/api/agents");
}

export async function fetchAgentById(id: string): Promise<Agent> {
  return apiFetch<Agent>(`/api/agents/${id}`);
}

export async function createAgent(payload: CreateAgentPayload): Promise<Agent> {
  return apiFetch<Agent>("/api/agents/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function startAgent(agentId: string): Promise<Agent> {
  return apiFetch<Agent>("/api/agents/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId }),
  });
}

export async function stopAgent(agentId: string): Promise<Agent> {
  return apiFetch<Agent>("/api/agents/stop", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId }),
  });
}

export async function updateAgentInterval(
  id: string,
  intervalMs: number
): Promise<Agent> {
  return apiFetch<Agent>(`/api/agents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intervalMs }),
  });
}

export async function fetchLogs(): Promise<Log[]> {
  return apiFetch<Log[]>("/api/logs");
}

export async function fetchTransactions(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>("/api/transactions");
}
