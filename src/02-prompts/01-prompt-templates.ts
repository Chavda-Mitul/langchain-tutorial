/**
 * 02-prompts/01-prompt-templates.ts
 * ──────────────────────────────────
 * PromptTemplate: Reusable templates with variable substitution.
 * Separates the prompt structure from the dynamic data.
 *
 * Run: npx ts-node --esm src/02-prompts/01-prompt-templates.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 200,
});

// ── 1. Basic PromptTemplate ──
const template1 = PromptTemplate.fromTemplate(
  "Explain {topic} to a {audience} in 2-3 sentences."
);

// Format it to see the final string
const formatted = await template1.format({
  topic: "async/await",
  audience: "beginner",
});
console.log("=== Formatted Prompt ===");
console.log(formatted);

// Pipe it to a model
const chain1 = template1.pipe(model);
const res1 = await chain1.invoke({
  topic: "closures",
  audience: "5-year-old",
});
console.log("\n=== Response ===");
console.log(res1.content);

// ── 2. Template with explicit input variables ───────────────────────
const template2 = new PromptTemplate({
  template: "Translate '{text}' from {source} to {target}.",
  inputVariables: ["text", "source", "target"],  // Must match placeholders
});

const chain2 = template2.pipe(model);
const res2 = await chain2.invoke({
  text: "Hello, how are you?",
  source: "English",
  target: "Spanish",
});
console.log("\n=== Translation ===");
console.log(res2.content);

// ── 3. Partial templates (pre-fill some variables) ──────────────────
const baseTemplate = PromptTemplate.fromTemplate(
  "You are a {role}. Answer this: {question}"
);

// Pre-fill "role", now only "question" is needed
const teacherPrompt = await baseTemplate.partial({ role: "math teacher" });
const chain3 = teacherPrompt.pipe(model);
const res3 = await chain3.invoke({ question: "What is the Pythagorean theorem?" });

console.log("\n=== Partial Template ===");
console.log(res3.content);
