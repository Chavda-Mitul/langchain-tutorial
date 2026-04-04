/**
 * 07-agents/02-agent-with-memory.ts
 * ──────────────────────────────────
 * Agent with conversation memory: Combines tools + memory
 * so the agent remembers previous turns while using tools.
 *
 * Run: npx ts-node --esm src/07-agents/02-agent-with-memory.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createToolCallingAgent, AgentExecutor } from "@langchain/classic/agents";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: 300,
});

// ── 1. Tools ────────────────────────────────────────────────────────
const calculatorTool = tool(
  async ({ expression }) => {
    const result = Function(`"use strict"; return (${expression})`)();
    return `${result}`;
  },
  {
    name: "calculator",
    description: "Evaluate a math expression",
    schema: z.object({
      expression: z.string(),
    }),
  }
);

const notesTool = tool(
  async ({ action, content }) => {
    // Simple in-memory notepad
    const notes: string[] = (globalThis as any).__notes || [];
    (globalThis as any).__notes = notes;

    if (action === "add") {
      notes.push(content || "");
      return `Note added. Total notes: ${notes.length}`;
    }
    if (action === "list") {
      return notes.length > 0
        ? notes.map((n, i) => `${i + 1}. ${n}`).join("\n")
        : "No notes yet.";
    }
    return "Unknown action. Use 'add' or 'list'.";
  },
  {
    name: "notes",
    description: "Add or list personal notes. Actions: 'add' (saves a note) or 'list' (shows all notes).",
    schema: z.object({
      action: z.enum(["add", "list"]),
      content: z.string().optional().describe("Note content (for 'add' action)"),
    }),
  }
);

const tools = [calculatorTool, notesTool];

// ── 2. Prompt with BOTH history and scratchpad ──────────────────────
const prompt = ChatPromptTemplate.fromMessages([
  ["system",
    "You are a helpful assistant with tools and memory. " +
    "You remember the full conversation."
  ],
  new MessagesPlaceholder("chat_history"),      // Conversation memory
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),   // Agent's tool-calling state
]);

// ── 3. Create agent with memory ─────────────────────────────────────
const agent = createToolCallingAgent({ llm: model, tools, prompt });
const executor = new AgentExecutor({ agent, tools, verbose: false });

const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

const agentWithHistory = new RunnableWithMessageHistory({
  runnable: executor,
  getMessageHistory: (sessionId: string) => {
    if (!messageHistories[sessionId]) {
      messageHistories[sessionId] = new InMemoryChatMessageHistory();
    }
    return messageHistories[sessionId];
  },
  inputMessagesKey: "input",
  outputMessagesKey: "output",
  historyMessagesKey: "chat_history",
});

// ── 4. Multi-turn conversation with tools + memory ──────────────────
const config = { configurable: { sessionId: "demo" } };

const conversation = [
  "Hi! I'm Mansi. Please add a note: 'Learn LangChain agents'",
  "Also add: 'Build RAG application'",
  "What notes do I have?",
  "What's my name? And what is 99 * 77?",
  "Add a note with the result of that calculation.",
  "List all my notes now.",
];

console.log("=== Agent with Memory ===\n");

for (const input of conversation) {
  console.log("Human:", input);
  const result = await agentWithHistory.invoke({ input }, config) as { output: string };
  console.log("AI:", result.output, "\n");
}
