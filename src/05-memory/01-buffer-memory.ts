/**
 * 05-memory/01-buffer-memory.ts
 * ─────────────────────────────
 * Conversation Memory: Store and recall conversation history.
 * In LangChain v0.3+, memory is managed via message history stores
 * and the RunnableWithMessageHistory wrapper.
 *
 * Run: npx ts-node --esm src/05-memory/01-buffer-memory.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  InMemoryChatMessageHistory,
} from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 200,
});

// ── 1. Setup: Prompt with a history placeholder ──
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Be concise."],
  new MessagesPlaceholder("history"),   // Conversation history goes here
  ["human", "{input}"],
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

// ── 2. Create a message history store ───────────────────────────────
// Store sessions by ID (e.g., per user)
const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

function getMessageHistory(sessionId: string) {
  if (!messageHistories[sessionId]) {
    messageHistories[sessionId] = new InMemoryChatMessageHistory();
  }
  return messageHistories[sessionId];
}

// ── 3. Wrap chain with message history ──────────────────────────────
const chainWithHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory,
  inputMessagesKey: "input",       // Which input key has the user's message
  historyMessagesKey: "history",   // Which placeholder receives history
});

// ── 4. Have a multi-turn conversation ───────────────────────────────
const config = { configurable: { sessionId: "user-123" } };

console.log("=== Conversation with Memory ===\n");

const q1 = "Hi! My name is Mansi and I'm learning LangChain.";
const a1 = await chainWithHistory.invoke({ input: q1 }, config);
console.log("Human:", q1);
console.log("AI:", a1);

const q2 = "What's my name?";
const a2 = await chainWithHistory.invoke({ input: q2 }, config);
console.log("\nHuman:", q2);
console.log("AI:", a2);  // Should remember "Mansi"

const q3 = "What am I learning?";
const a3 = await chainWithHistory.invoke({ input: q3 }, config);
console.log("\nHuman:", q3);
console.log("AI:", a3);  // Should remember "LangChain"

// ── 5. Different session = fresh memory ─────────────────────────────
const config2 = { configurable: { sessionId: "user-456" } };

const q4 = "What's my name?";
const a4 = await chainWithHistory.invoke({ input: q4 }, config2);
console.log("\n=== Different Session ===");
console.log("Human:", q4);
console.log("AI:", a4);  // Won't know — different session

// ── 6. Inspect stored history ───────────────────────────────────────
const history = await getMessageHistory("user-123").getMessages();
console.log("\n=== Stored Messages (user-123) ===");
history.forEach((msg: BaseMessage) => {
  console.log(`${msg._getType()}: ${(msg.content as string).slice(0, 80)}...`);
});
