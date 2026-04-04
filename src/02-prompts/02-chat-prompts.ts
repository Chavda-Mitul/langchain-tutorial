/**
 * 02-prompts/02-chat-prompts.ts
 * ─────────────────────────────
 * ChatPromptTemplate: Templates specifically for chat models.
 * Produces an array of messages (system, human, AI) instead of a single string.
 *
 * Run: npx ts-node --esm src/02-prompts/02-chat-prompts.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 200,
});

// ── 1. Basic ChatPromptTemplate ─────────────────────────────────────
const chatPrompt1 = ChatPromptTemplate.fromMessages([
  ["system", "You are a {role}. Be concise."],
  ["human", "{question}"],
]);

const chain1 = chatPrompt1.pipe(model);
const res1 = await chain1.invoke({
  role: "senior TypeScript developer",
  question: "What's the difference between interface and type?",
});

console.log("=== Basic Chat Prompt ===");
console.log(res1.content);

// ── 2. Using explicit message template classes ──────────────────────
const chatPrompt2 = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "You are an expert in {language}."
  ),
  HumanMessagePromptTemplate.fromTemplate(
    "What are the top 3 features of {language}?"
  ),
]);

const chain2 = chatPrompt2.pipe(model);
const res2 = await chain2.invoke({ language: "TypeScript" });

console.log("\n=== Explicit Message Templates ===");
console.log(res2.content);

// ── 3. MessagesPlaceholder — inject dynamic message history ─────────
// This is KEY for conversation memory!
const chatPrompt3 = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant."],
  new MessagesPlaceholder("history"),   // Dynamic messages go here
  ["human", "{input}"],
]);

const chain3 = chatPrompt3.pipe(model);
const res3 = await chain3.invoke({
  history: [
    new HumanMessage("My name is Mansi."),
    new AIMessage("Nice to meet you, Mansi! How can I help you today?"),
  ],
  input: "What's my name?",
});

console.log("\n=== With Message History ===");
console.log(res3.content);
