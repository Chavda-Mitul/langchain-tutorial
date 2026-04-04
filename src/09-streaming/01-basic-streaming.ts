/**
 * 09-streaming/01-basic-streaming.ts
 * ───────────────────────────────────
 * Streaming: Get tokens as they're generated, instead of waiting
 * for the full response. Essential for responsive UIs.
 *
 * Run: npx ts-node --esm src/09-streaming/01-basic-streaming.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 300,
});

// ── 1. Basic streaming with .stream() ───────────────────────────────
console.log("=== Basic Streaming ===");

const stream = await model.stream("Tell me a short joke about programming.");

// Each chunk is a partial AIMessage
for await (const chunk of stream) {
  process.stdout.write(chunk.content as string);  // No newline — builds up
}
console.log("\n");

// ── 2. Streaming a full chain ───────────────────────────────────────
console.log("=== Chain Streaming ===");

const chain = ChatPromptTemplate.fromMessages([
  ["system", "You are a storyteller. Be creative."],
  ["human", "Tell a very short story about {topic}."],
])
  .pipe(model)
  .pipe(new StringOutputParser());

// StringOutputParser makes chunks into plain strings
const chainStream = await chain.stream({ topic: "a TypeScript compiler gaining consciousness" });

for await (const chunk of chainStream) {
  process.stdout.write(chunk);
}
console.log("\n");

// ── 3. Collecting stream into final result ──────────────────────────
console.log("=== Collect Stream ===");

let fullResponse = "";
const collectStream = await chain.stream({ topic: "a bug that fixed itself" });

for await (const chunk of collectStream) {
  fullResponse += chunk;
  process.stdout.write(chunk);
}

console.log("\n\nFull response length:", fullResponse.length, "chars");

// ── 4. Stream events — detailed events for each step ────────────────
console.log("\n=== Stream Events ===");

const eventStream = chain.streamEvents(
  { topic: "an AI learning to code" },
  { version: "v2" },  // Event schema version
);

let eventCount = 0;
for await (const event of eventStream) {
  // Events have: event (type), name, data
  if (event.event === "on_llm_stream") {
    // Token-level streaming
    process.stdout.write(event.data.chunk.content || "");
  } else if (event.event === "on_chain_start") {
    eventCount++;
  }
}
console.log(`\n\nTotal chain_start events: ${eventCount}`);
