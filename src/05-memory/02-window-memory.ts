/**
 * 05-memory/02-window-memory.ts
 * ─────────────────────────────
 * Window Memory: Keep only the last N messages to limit token usage.
 * Useful for long conversations where you don't need full history.
 *
 * Run: npx ts-node --esm src/05-memory/02-window-memory.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  InMemoryChatMessageHistory,
} from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { trimMessages } from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 150,
});

// ── 1. trimMessages — limit history to last N tokens or messages ────
const trimmer = trimMessages({
  maxTokens: 500,                       // Max tokens to keep in history
  strategy: "last",                     // Keep the "last" messages
  tokenCounter: (msgs) =>               // Simple token counter (chars / 4)
    msgs.reduce((sum, m) => sum + Math.ceil(String(m.content).length / 4), 0),
  includeSystem: true,                  // Always keep the system message
  allowPartial: false,                  // Don't cut messages in half
});

// ── 2. Build the chain with trimming ────────────────────────────────
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Be very concise."],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

const chainWithHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: (sessionId: string) => {
    if (!messageHistories[sessionId]) {
      messageHistories[sessionId] = new InMemoryChatMessageHistory();
    }
    return messageHistories[sessionId];
  },
  inputMessagesKey: "input",
  historyMessagesKey: "history",
});

// ── 3. Simulate a long conversation ────────────────────────────────
const config = { configurable: { sessionId: "window-demo" } };

const messages = [
  "My name is Mansi.",
  "I live in India.",
  "I'm a software developer.",
  "I love TypeScript.",
  "I'm learning LangChain.",
  "My favorite food is biryani.",
  "I have a cat named Luna.",
  "What do you remember about me? List everything.",
];

console.log("=== Window Memory Demo ===\n");

for (const msg of messages) {
  console.log("Human:", msg);
  const response = await chainWithHistory.invoke({ input: msg }, config);
  console.log("AI:", response, "\n");
}

// ── 4. Show the trimming in action ──────────────────────────────────
const allMessages = await messageHistories["window-demo"].getMessages();
console.log(`\n=== Total messages stored: ${allMessages.length} ===`);

// Trim and see what remains
const trimmed = await trimmer.invoke(allMessages);
console.log(`Messages after trimming: ${trimmed.length}`);
trimmed.forEach((msg) => {
  console.log(`  ${msg._getType()}: ${String(msg.content).slice(0, 60)}...`);
});
