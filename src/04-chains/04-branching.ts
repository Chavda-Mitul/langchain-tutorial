/**
 * 04-chains/04-branching.ts
 * ─────────────────────────
 * Conditional branching: Route inputs to different chains
 * based on logic. Uses RunnableBranch for if/else chain routing.
 *
 * Run: npx ts-node --esm src/04-chains/04-branching.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableBranch, RunnableLambda } from "@langchain/core/runnables";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 200,
});
const parser = new StringOutputParser();

// ── 1. RunnableBranch — conditional routing ─────────────────────────
// Route to different prompts based on the question category

const techPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a senior software engineer. Be technical and precise."],
  ["human", "{question}"],
]).pipe(model).pipe(parser);

const creativePrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a creative writer. Be imaginative and fun."],
  ["human", "{question}"],
]).pipe(model).pipe(parser);

const generalPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant."],
  ["human", "{question}"],
]).pipe(model).pipe(parser);

// Classify the input first
const classifierChain = ChatPromptTemplate.fromMessages([
  ["system", "Classify the question as 'tech', 'creative', or 'general'. Respond with ONLY the category word."],
  ["human", "{question}"],
]).pipe(model).pipe(parser);

// Build the routing chain
const routingChain = new RunnableLambda({
  func: async (input: { question: string }) => {
    const category = await classifierChain.invoke(input);
    const trimmed = category.trim().toLowerCase();
    console.log(`[Router] Category: ${trimmed}`);
    return { question: input.question, category: trimmed };
  },
}).pipe(
  RunnableBranch.from([
    // [condition, chain] pairs — first match wins
    [
      (input: { question: string; category: string }) =>
        input.category.includes("tech"),
      techPrompt,
    ],
    [
      (input: { question: string; category: string }) =>
        input.category.includes("creative"),
      creativePrompt,
    ],
    // Default fallback (required)
    generalPrompt,
  ])
);

// Test with different types of questions
const questions = [
  "What is a REST API?",
  "Write me a haiku about coding",
  "What's the weather like today?",
];

console.log("=== Conditional Routing ===");
for (const question of questions) {
  console.log(`\nQ: ${question}`);
  const answer = await routingChain.invoke({ question });
  console.log(`A: ${answer}`);
}
