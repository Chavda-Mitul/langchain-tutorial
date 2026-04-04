/**
 * 02-prompts/03-few-shot.ts
 * ─────────────────────────
 * Few-shot prompting: Teach the model by showing examples.
 * The model learns the pattern from examples and applies it.
 *
 * Run: npx ts-node --esm src/02-prompts/03-few-shot.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import {
  FewShotPromptTemplate,
  PromptTemplate,
} from "@langchain/core/prompts";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: 100,
});

// ── 1. FewShotPromptTemplate (string-based) ─────────────────────────
const examples = [
  { input: "happy", output: "sad" },
  { input: "tall", output: "short" },
  { input: "fast", output: "slow" },
];

const exampleTemplate = new PromptTemplate({
  template: "Input: {input}\nOutput: {output}",
  inputVariables: ["input", "output"],
});

const fewShotPrompt = new FewShotPromptTemplate({
  examples,                           // The examples to learn from
  examplePrompt: exampleTemplate,     // How to format each example
  prefix: "Give the opposite of each input.",  // Before examples
  suffix: "Input: {input}\nOutput:",           // After examples
  inputVariables: ["input"],
});

const formatted = await fewShotPrompt.format({ input: "bright" });
console.log("=== Formatted Few-Shot Prompt ===");
console.log(formatted);

const chain1 = fewShotPrompt.pipe(model);
const res1 = await chain1.invoke({ input: "bright" });
console.log("\nResponse:", res1.content);

// ── 2. Few-shot with chat messages (more natural for chat models) ───
const chatFewShot = ChatPromptTemplate.fromMessages([
  ["system", "You classify the sentiment of text as positive, negative, or neutral."],
  ["human", "I love this product!"],
  ["ai", "positive"],
  ["human", "This is terrible."],
  ["ai", "negative"],
  ["human", "The package arrived on time."],
  ["ai", "neutral"],
  ["human", "{text}"],
]);

const chain2 = chatFewShot.pipe(model);

const testTexts = [
  "This is the best day ever!",
  "I'm not sure about this.",
  "The service was awful.",
];

console.log("\n=== Chat Few-Shot Sentiment ===");
for (const text of testTexts) {
  const res = await chain2.invoke({ text });
  console.log(`"${text}" → ${res.content}`);
}
