/**
 * 04-chains/01-lcel-basics.ts
 * ───────────────────────────
 * LCEL (LangChain Expression Language): The core way to compose chains.
 * Uses .pipe() to connect components: prompt → model → parser.
 * Every component is a "Runnable" with .invoke(), .batch(), .stream().
 *
 * Run: npx ts-node --esm src/04-chains/01-lcel-basics.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 200,
});

// ── 1. Basic chain: prompt → model → parser ─────────────────────────
const chain = ChatPromptTemplate.fromMessages([
  ["system", "You are an expert in {subject}."],
  ["human", "{question}"],
])
  .pipe(model)                    // Pass formatted messages to model
  .pipe(new StringOutputParser()); // Extract string from AIMessage

const result = await chain.invoke({
  subject: "TypeScript",
  question: "What are generics?",
});

console.log("=== Basic Chain ===");
console.log(result);

// ── 2. Chain methods — every chain supports these ───────────────────

// .invoke() — single input, single output
const single = await chain.invoke({
  subject: "Python",
  question: "What is a list comprehension?",
});
console.log("\n=== invoke() ===");
console.log(single);

// .batch() — multiple inputs in parallel
const batch = await chain.batch([
  { subject: "JavaScript", question: "What is hoisting?" },
  { subject: "Rust", question: "What is ownership?" },
]);
console.log("\n=== batch() ===");
batch.forEach((res, i) => console.log(`${i + 1}:`, res.slice(0, 100), "..."));

// ── 3. Chaining with .pipe() is just composition ───
// You can also use RunnableSequence explicitly:
import { RunnableSequence } from "@langchain/core/runnables";

const explicitChain = RunnableSequence.from([
  ChatPromptTemplate.fromMessages([
    ["system", "Translate the following to {language}."],
    ["human", "{text}"],
  ]),
  model,
  new StringOutputParser(),
]);

const translated = await explicitChain.invoke({
  language: "French",
  text: "Hello, how are you today?",
});

console.log("\n=== RunnableSequence ===");
console.log(translated);
