/**
 * 09-streaming/02-callbacks.ts
 * ────────────────────────────
 * Callbacks: Hook into chain execution for logging, monitoring,
 * or custom behavior at each step.
 *
 * Run: npx ts-node --esm src/09-streaming/02-callbacks.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import type { Serialized } from "@langchain/core/load/serializable";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 200,
});

// ── 1. Custom callback handler ──────────────────────────────────────
class LoggingHandler extends BaseCallbackHandler {
  name = "logging_handler";

  // Called when a chain starts
  async handleChainStart(chain: Serialized) {
    console.log(`\n[CHAIN START] ${chain.id?.join("/") ?? "unknown"}`);
  }

  // Called when a chain finishes
  async handleChainEnd(_output: any) {
    console.log(`[CHAIN END] Output received`);
  }

  // Called when the LLM starts generating
  async handleLLMStart(llm: Serialized, _prompts: string[]) {
    console.log(`[LLM START] ${llm.id?.join("/") ?? "unknown"}`);
  }

  // Called when the LLM finishes
  async handleLLMEnd(output: any) {
    const tokens = output?.llmOutput?.tokenUsage;
    console.log(`[LLM END] Tokens: ${JSON.stringify(tokens)}`);
  }

  // Called on each new token (streaming)
  async handleLLMNewToken(token: string) {
    // Uncomment to see each token:
    // process.stdout.write(`[TOKEN: "${token}"]`);
  }

  // Called on errors
  async handleLLMError(error: Error) {
    console.error(`[LLM ERROR] ${error.message}`);
  }
}

// ── 2. Use callbacks with a chain ───────────────────────────────────
const chain = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Be concise."],
  ["human", "{question}"],
])
  .pipe(model)
  .pipe(new StringOutputParser());

console.log("=== With Callback Handler ===");

const result = await chain.invoke(
  { question: "What is TypeScript in one sentence?" },
  { callbacks: [new LoggingHandler()] },
);
console.log("Result:", result);

// ── 3. Inline callbacks (quick and simple) ──────────────────────────
console.log("\n=== Inline Callbacks ===");

const result2 = await chain.invoke(
  { question: "What is LCEL?" },
  {
    callbacks: [
      {
        handleLLMStart: async () => console.log("[START] LLM is thinking..."),
        handleLLMEnd: async () => console.log("[END] LLM finished!"),
      },
    ],
  },
);
console.log("Result:", result2);

// ── 4. Timing callback — measure execution time ────────────────────
console.log("\n=== Timing Callback ===");

class TimingHandler extends BaseCallbackHandler {
  name = "timing_handler";
  private startTime = 0;

  async handleChainStart() {
    this.startTime = Date.now();
    console.log("[TIMER] Started...");
  }

  async handleChainEnd() {
    const elapsed = Date.now() - this.startTime;
    console.log(`[TIMER] Completed in ${elapsed}ms`);
  }
}

const result3 = await chain.invoke(
  { question: "Explain closures in JavaScript." },
  { callbacks: [new TimingHandler()] },
);
console.log("Result:", result3);
