/**
 * 06-tools/02-tool-calling-loop.ts
 * ─────────────────────────────────
 * Tool Calling Loop: The full cycle of model → tool → model.
 * This is how agents work internally — the model calls tools,
 * gets results, and formulates a final answer.
 *
 * Run: npx ts-node --esm src/06-tools/02-tool-calling-loop.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  HumanMessage,
  AIMessage,
  ToolMessage,
  BaseMessage,
} from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

// ── 1. Define tools ─────────────────────────────────────────────────
const searchTool = tool(
  async ({ query }) => {
    // Simulated search results
    const results: Record<string, string> = {
      "langchain": "LangChain is a framework for building LLM applications. Latest version is 0.3.x.",
      "typescript": "TypeScript is a typed superset of JavaScript by Microsoft. Latest: 5.x.",
      "groq": "Groq provides fast LLM inference using custom LPU chips.",
    };
    const key = Object.keys(results).find((k) =>
      query.toLowerCase().includes(k)
    );
    return key ? results[key] : `No results found for: ${query}`;
  },
  {
    name: "search",
    description: "Search for information about a topic",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

const calculatorTool = tool(
  async ({ expression }) => {
    try {
      // Simple eval for demo — use a math library in production
      const result = Function(`"use strict"; return (${expression})`)();
      return String(result);
    } catch {
      return "Error evaluating expression";
    }
  },
  {
    name: "calculator",
    description: "Evaluate a mathematical expression",
    schema: z.object({
      expression: z.string().describe("Math expression like '2 + 3 * 4'"),
    }),
  }
);

const tools = [searchTool, calculatorTool];
const toolMap: Record<string, { invoke: (args: any) => Promise<any> }> = {
  search: searchTool,
  calculator: calculatorTool,
};
const modelWithTools = model.bindTools(tools);

// ── 2. The tool-calling loop ────────────────────────────────────────
async function runWithTools(userMessage: string): Promise<string> {
  const messages: BaseMessage[] = [new HumanMessage(userMessage)];

  console.log(`\nUser: ${userMessage}`);
  console.log("─".repeat(50));

  // Loop: model may call tools multiple times before answering
  let iteration = 0;
  while (iteration < 5) {  // Safety limit
    iteration++;
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    // If no tool calls, we have the final answer
    if (!response.tool_calls || response.tool_calls.length === 0) {
      console.log(`[Final answer after ${iteration} iteration(s)]`);
      return response.content as string;
    }

    // Execute each tool call and add results to messages
    for (const tc of response.tool_calls) {
      console.log(`  → Calling ${tc.name}(${JSON.stringify(tc.args)})`);
      const selectedTool = toolMap[tc.name];
      const result = await selectedTool.invoke(tc.args as any);
      console.log(`  ← Result: ${result}`);

      // ToolMessage links the result back to the tool call via ID
      messages.push(new ToolMessage({
        content: result,
        tool_call_id: tc.id!,
      }));
    }
  }

  return "Max iterations reached";
}

// ── 3. Test it ──────────────────────────────────────────────────────
console.log("=== Tool Calling Loop ===");

const answer1 = await runWithTools("What is LangChain?");
console.log("Answer:", answer1);

const answer2 = await runWithTools("What is 15 * 23 + 42?");
console.log("Answer:", answer2);

const answer3 = await runWithTools(
  "Search for info about Groq and tell me about it."
);
console.log("Answer:", answer3);
