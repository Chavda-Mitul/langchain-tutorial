/**
 * 07-agents/01-tool-calling-agent.ts
 * ───────────────────────────────────
 * Agents: LLMs that decide which tools to use and in what order.
 * Uses createToolCallingAgent — the modern, recommended agent type.
 * The agent automatically handles the tool-calling loop.
 *
 * Run: npx ts-node --esm src/07-agents/01-tool-calling-agent.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { createToolCallingAgent, AgentExecutor } from "@langchain/classic/agents";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

// ── 1. Define tools ─────────────────────────────────────────────────
const calculatorTool = tool(
  async ({ expression }) => {
    try {
      const result = Function(`"use strict"; return (${expression})`)();
      return `Result: ${result}`;
    } catch {
      return "Error: Could not evaluate expression";
    }
  },
  {
    name: "calculator",
    description: "Evaluate mathematical expressions. Input should be a valid math expression like '2 + 3 * 4'.",
    schema: z.object({
      expression: z.string().describe("The math expression to evaluate"),
    }),
  }
);

const dateTimeTool = tool(
  async () => {
    return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  },
  {
    name: "get_datetime",
    description: "Get the current date and time in IST",
    schema: z.object({}),
  }
);

const dictionaryTool = tool(
  async ({ word }) => {
    // Simulated dictionary
    const definitions: Record<string, string> = {
      "ephemeral": "lasting for a very short time",
      "ubiquitous": "present, appearing, or found everywhere",
      "pragmatic": "dealing with things sensibly and realistically",
      "verbose": "using more words than needed",
    };
    return definitions[word.toLowerCase()] || `Definition not found for: ${word}`;
  },
  {
    name: "dictionary",
    description: "Look up the definition of a word",
    schema: z.object({
      word: z.string().describe("The word to look up"),
    }),
  }
);

const tools = [calculatorTool, dateTimeTool, dictionaryTool];

// ── 2. Create the agent prompt ──────────────────────────────────────
// Must include: system message, agent_scratchpad placeholder, and human input
const prompt = ChatPromptTemplate.fromMessages([
  ["system",
    "You are a helpful assistant with access to tools. " +
    "Use tools when needed. Always show your work."
  ],
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),  // Required — agent's working memory
]);

// ── 3. Create the agent + executor ──────────────────────────────────
const agent = createToolCallingAgent({
  llm: model,
  tools,
  prompt,
});

const executor = new AgentExecutor({
  agent,
  tools,
  verbose: true,         // Show agent's reasoning in console
  maxIterations: 5,      // Safety limit on tool-calling loops
  // returnIntermediateSteps: true,  // Include tool calls in output
});

// ── 4. Run the agent ────────────────────────────────────────────────
console.log("=== Tool Calling Agent ===\n");

// Simple tool use
const result1 = await executor.invoke({
  input: "What is 42 * 17 + 123?",
});
console.log("\nAnswer:", result1.output);

// Multiple tools in one query
const result2 = await executor.invoke({
  input: "What time is it now, and what does 'ephemeral' mean?",
});
console.log("\nAnswer:", result2.output);

// Question that doesn't need tools
const result3 = await executor.invoke({
  input: "What is the capital of France?",
});
console.log("\nAnswer:", result3.output);
