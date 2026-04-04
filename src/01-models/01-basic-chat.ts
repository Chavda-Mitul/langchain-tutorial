/**
 * 01-models/01-basic-chat.ts
 * ─────────────────────────
 * Chat Models: The primary way to interact with LLMs in LangChain.
 * They take messages as input and return a message as output.
 *
 * Run: npx ts-node --esm src/01-models/01-basic-chat.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

// ── 1. Basic instantiation ──────────────────────────────────────────
const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",   // Model ID (Groq-hosted)
  temperature: 0.7,                    // 0 = deterministic, 1 = creative
  maxTokens: 256,                      // Max tokens in the response
  // Other useful options:
  // topP: 0.9,                        // Nucleus sampling
  // stop: ["\n"],                     // Stop sequences
  // maxRetries: 2,                    // Auto-retry on failure
});

// ── 2. Simple string invocation ─────────────────────────────────────
const response = await model.invoke("What is LangChain in one sentence?");

console.log("=== Basic Invoke ===");
console.log("Content:", response.content);
console.log("Model:", response.response_metadata?.model);
console.log("Tokens used:", response.usage_metadata);

// ── 3. Batch invocation (multiple prompts at once) ──────────────────
const batchResponses = await model.batch([
  "What is TypeScript?",
  "What is Node.js?",
]);

console.log("\n=== Batch Invoke ===");
batchResponses.forEach((res, i) => {
  console.log(`Response ${i + 1}:`, res.content);
});
