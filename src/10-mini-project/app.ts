/**
 * 10-mini-project/app.ts
 * ──────────────────────
 * AI Research Assistant — Main application.
 * Combines: Models + Prompts + Chains + Memory + Tools + Agents + Streaming
 *
 * Run: npx ts-node --esm src/10-mini-project/app.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { createResearchAgent } from "./agent.js";
import { createResearchPipeline } from "./chains.js";
import { getSessionMessageCount } from "./memory.js";

// ── Setup ───────────────────────────────────────────────────────────
const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.3,
  maxTokens: 500,
});

const agent = createResearchAgent(model);
const pipeline = createResearchPipeline(model);
const sessionConfig = { configurable: { sessionId: "research-session-1" } };

// ── Helper: Chat with the agent ─────────────────────────────────────
async function chat(message: string): Promise<string> {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`👤 ${message}`);
  console.log("─".repeat(60));

  const result = await agent.invoke({ input: message }, sessionConfig);
  const output = result.output as string;

  console.log(`🤖 ${output}`);
  return output;
}

// ── Helper: Stream a response ───────────────────────────────────────
async function chatStream(message: string): Promise<string> {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`👤 ${message}`);
  console.log("─".repeat(60));
  process.stdout.write("🤖 ");

  let fullResponse = "";
  const stream = await agent.stream({ input: message }, sessionConfig);

  for await (const chunk of stream) {
    if (chunk.output) {
      process.stdout.write(chunk.output as string);
      fullResponse += chunk.output;
    }
  }
  console.log();
  return fullResponse;
}

// ── Main: Run a research session ────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║          AI Research Assistant                          ║");
  console.log("║   Models + Prompts + Chains + Memory + Tools + Agent   ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  // ── Phase 1: Research with agent (tools + memory) ─────────────────
  console.log("\n📌 PHASE 1: Research (Agent + Tools + Memory)");

  await chat("Hi, I'm Mansi. I want to research LangChain and how it compares to other AI frameworks.");

  const research = await chat(
    "Search for information about LangChain. What are its key features and what makes it special?"
  );

  await chat("Also look up what Groq is and how it fits into the AI ecosystem.");

  // Memory test — agent should remember the user's name and context
  await chat("Based on everything we've discussed, what would you recommend I focus on first?");

  // ── Phase 2: Analysis pipeline (sequential chains) ────────────────
  console.log(`\n\n📌 PHASE 2: Analysis Pipeline (Sequential Chains)`);
  console.log("─".repeat(60));

  const analysis = await pipeline.invoke({
    research,
    audience: "developer",
  });

  console.log("\n📋 Final Summary:");
  console.log(analysis);

  // ── Phase 3: Streaming response ───────────────────────────────────
  console.log(`\n\n📌 PHASE 3: Streaming`);

  await chatStream(
    "Give me a quick action plan with 3 steps to get started with LangChain."
  );

  // ── Stats ─────────────────────────────────────────────────────────
  const msgCount = await getSessionMessageCount("research-session-1");
  console.log(`\n\n📊 Session Stats:`);
  console.log(`   Messages in memory: ${msgCount}`);
  console.log(`   Session ID: research-session-1`);
  console.log(`   Model: llama-3.3-70b-versatile`);
  console.log(`\n✅ Research session complete!`);
}

main().catch(console.error);
