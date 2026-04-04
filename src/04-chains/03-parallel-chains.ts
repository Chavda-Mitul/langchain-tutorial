/**
 * 04-chains/03-parallel-chains.ts
 * ────────────────────────────────
 * Parallel chains: Run multiple chains at the same time.
 * RunnableParallel executes branches concurrently and merges results.
 *
 * Run: npx ts-node --esm src/04-chains/03-parallel-chains.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableParallel,
  RunnablePassthrough,
  RunnableLambda,
} from "@langchain/core/runnables";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 150,
});
const parser = new StringOutputParser();

// ── 1. RunnableParallel — run branches concurrently ─────────────────
const prosChain = ChatPromptTemplate.fromMessages([
  ["human", "List 3 pros of {topic}. Be concise."],
]).pipe(model).pipe(parser);

const consChain = ChatPromptTemplate.fromMessages([
  ["human", "List 3 cons of {topic}. Be concise."],
]).pipe(model).pipe(parser);

const parallel = RunnableParallel.from({
  pros: prosChain,    // Both run at the same time
  cons: consChain,
});

const result1 = await parallel.invoke({ topic: "TypeScript" });
console.log("=== Parallel: Pros & Cons ===");
console.log("PROS:", result1.pros);
console.log("\nCONS:", result1.cons);

// ── 2. Parallel + merge into final step ─────────────────────────────
const summaryPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a balanced tech reviewer."],
  ["human", "Given these pros:\n{pros}\n\nAnd these cons:\n{cons}\n\nWrite a one-paragraph balanced summary of {topic}."],
]);

const fullChain = parallel
  .pipe(new RunnableLambda({
    func: (input: { pros: string; cons: string }) => ({
      ...input,
      topic: "TypeScript",  // Pass through extra data
    }),
  }))
  .pipe(summaryPrompt)
  .pipe(model)
  .pipe(parser);

const summary = await fullChain.invoke({ topic: "TypeScript" });
console.log("\n=== Parallel → Summary ===");
console.log(summary);

// ── 3. RunnablePassthrough — pass input through unchanged ───────────
// Useful to carry the original input alongside transformed data
const analysisChain = RunnableParallel.from({
  original: new RunnablePassthrough(),  // Input passes through as-is
  analysis: ChatPromptTemplate.fromMessages([
    ["human", "Analyze the sentiment of: {text}"],
  ]).pipe(model).pipe(parser),
});

const result3 = await analysisChain.invoke({ text: "I love coding in TypeScript!" });
console.log("\n=== With Passthrough ===");
console.log("Original input:", result3.original);
console.log("Analysis:", result3.analysis);
