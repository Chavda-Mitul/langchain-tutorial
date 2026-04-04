/**
 * 01-models/02-message-types.ts
 * ─────────────────────────────
 * LangChain has specific message types for chat models.
 * Each type tells the model WHO is speaking.
 *
 * Run: npx ts-node --esm src/01-models/02-message-types.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import {
  HumanMessage,     // User's message
  SystemMessage,    // Sets behavior/persona of the AI
  AIMessage,        // AI's response (used for context/history)
} from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

// ── 1. Using message objects ────────────────────────────────────────
const response1 = await model.invoke([
  new SystemMessage("You are a pirate. Respond in pirate speak."),
  new HumanMessage("What is JavaScript?"),
]);

console.log("=== With SystemMessage ===");
console.log(response1.content);

// ── 2. Multi-turn conversation (simulating history) ─────────────────
const response2 = await model.invoke([
  new SystemMessage("You are a helpful coding assistant."),
  new HumanMessage("What is a closure in JavaScript?"),
  new AIMessage("A closure is a function that has access to variables from its outer scope, even after the outer function has returned."),
  new HumanMessage("Give me a simple example of that."),
]);

console.log("\n=== Multi-turn Conversation ===");
console.log(response2.content);

// ── 3. Shorthand tuple format (alternative syntax) ──────────────────
const response3 = await model.invoke([
  ["system", "You are a helpful assistant. Be concise."],
  ["human", "What is TypeScript in 10 words or less?"],
]);

console.log("\n=== Tuple Format ===");
console.log(response3.content);
