/**
 * 04-chains/02-sequential-chains.ts
 * ──────────────────────────────────
 * Sequential chains: Output of one chain feeds into the next.
 * Use RunnableLambda to transform data between steps.
 *
 * Run: npx ts-node --esm src/04-chains/02-sequential-chains.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableLambda } from "@langchain/core/runnables";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 300,
});
const parser = new StringOutputParser();

// ── 1. Two-step chain: Generate → Critique ──

// Step 1: Generate a short story
const generatePrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a creative writer."],
  ["human", "Write a 2-sentence story about {topic}."],
]);

// Step 2: Critique the story
const critiquePrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a literary critic."],
  ["human", "Critique this story in one sentence:\n\n{story}"],
]);

// Chain them together
const fullChain = generatePrompt
  .pipe(model)
  .pipe(parser)
  // Transform output to match next prompt's input
  .pipe(new RunnableLambda({ func: (story: string) => ({ story }) }))
  .pipe(critiquePrompt)
  .pipe(model)
  .pipe(parser);

const result = await fullChain.invoke({ topic: "a robot learning to paint" });
console.log("=== Generate → Critique ===");
console.log(result);

// ── 2. Three-step chain: Outline → Draft → Improve ─────────────────
const outlinePrompt = ChatPromptTemplate.fromMessages([
  ["system", "Create a brief outline (3 bullet points) for a blog post."],
  ["human", "Topic: {topic}"],
]);

const draftPrompt = ChatPromptTemplate.fromMessages([
  ["system", "Write a short blog paragraph based on this outline."],
  ["human", "{outline}"],
]);

const improvePrompt = ChatPromptTemplate.fromMessages([
  ["system", "Improve this draft. Make it more engaging. Keep it short."],
  ["human", "{draft}"],
]);

const blogChain = outlinePrompt
  .pipe(model)
  .pipe(parser)
  .pipe(new RunnableLambda({ func: (outline: string) => ({outline})}))
  .pipe(draftPrompt)
  .pipe(model)
  .pipe(parser)
  .pipe(new RunnableLambda({ func: (draft: string) => ({draft})}))
  .pipe(improvePrompt)
  .pipe(model)
  .pipe(parser);

console.log("\n=== Three-Step Blog Chain ===");
const blog = await blogChain.invoke({ topic: "Why TypeScript is worth learning" });
console.log("\n--- Final ---");
console.log(blog);
