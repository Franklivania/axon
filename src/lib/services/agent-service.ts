import { AgentRegistry } from "../agents/agent-registry";

export class AgentService {
  public static async createAgent(name: string, strategy: string, intervalMs: number) {
    return await AgentRegistry.createAgent(name, strategy, intervalMs);
  }

  public static async getAgents() {
    return await AgentRegistry.getAgents();
  }

  public static async getAgentById(id: string) {
    return await AgentRegistry.getAgentById(id);
  }

  public static async updateAgentStatus(id: string, status: string) {
    return await AgentRegistry.updateAgentStatus(id, status);
  }
}
