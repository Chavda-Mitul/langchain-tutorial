/**
 * 01-models/03-model-config.ts
 * ────────────────────────────
 * Model configuration: binding default options, swapping models,
 * and using .bind() for reusable configurations.
 *
 * Run: npx ts-node --esm src/01-models/03-model-config.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

// ── 1. Creating a model with different settings ─────────────────────
// Create a separate instance with specific settings for concise answers
const conciseModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: 50,        // Short answers
  stop: ["\n\n"],       // Stop at double newline
});

const response1 = await conciseModel.invoke("What is recursion?");
console.log("=== Concise Model ===");
console.log(response1.content);

// ── 2. .withConfig() — attach metadata for tracing/logging ─────────
const taggedModel = model.withConfig({
  runName: "joke-generator",            // Name shown in traces/logs
  tags: ["tutorial", "jokes"],          // Tags for filtering
  metadata: { version: "1.0" },        // Custom metadata
});

const response2 = await taggedModel.invoke("Tell me a short programming joke.");
console.log("\n=== Tagged Model ===");
console.log(response2.content);

// ── 3. Swapping models at runtime ───────────────────────────────────
// Just create a new instance — LangChain's interface is the same
const fastModel = new ChatGroq({
  model: "llama-3.1-8b-instant",       // Smaller, faster model
  temperature: 0,                       // Deterministic
  maxTokens: 100,
});

const bigModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",    // Larger, more capable
  temperature: 0.7,
  maxTokens: 500,
});

// Same code works with both — that's the power of LangChain's abstraction
for (const [name, m] of [["Fast", fastModel], ["Big", bigModel]] as const) {
  const res = await (m as ChatGroq).invoke("What is 2 + 2? Answer in one word.");
  console.log(`\n${name} model:`, res.content);
}
