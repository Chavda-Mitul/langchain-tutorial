/**
 * 10-mini-project/agent.ts
 * ────────────────────────
 * The core research agent — combines model + tools + memory.
 */

import { ChatGroq } from "@langchain/groq";
import { createToolCallingAgent, AgentExecutor } from "@langchain/classic/agents";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { allTools } from "./tools.js";
import { agentPrompt } from "./prompts.js";
import { getMessageHistory } from "./memory.js";

export function createResearchAgent(model: ChatGroq) {
  const agent = createToolCallingAgent({
    llm: model,
    tools: allTools,
    prompt: agentPrompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools: allTools,
    verbose: false,
    maxIterations: 8,
  });

  // Wrap with conversation memory
  const agentWithMemory = new RunnableWithMessageHistory({
    runnable: executor,
    getMessageHistory,
    inputMessagesKey: "input",
    outputMessagesKey: "output",
    historyMessagesKey: "chat_history",
  });

  return agentWithMemory;
}
