/**
 * 05-memory/03-summary-memory.ts
 * ──────────────────────────────
 * Summary Memory: Summarize old conversation into a compact form.
 * Keeps recent messages + a summary of older ones.
 * Best for very long conversations where you need context but not details.
 *
 * Run: npx ts-node --esm src/05-memory/03-summary-memory.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  BaseMessage,
} from "@langchain/core/messages";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 200,
});

// ── 1. Build a summarization chain ──────────────────────────────────
const summarizePrompt = ChatPromptTemplate.fromMessages([
  ["system",
    "Progressively summarize the conversation, adding to the previous summary. " +
    "Return a concise summary in 2-3 sentences."
  ],
  ["human",
    "Current summary:\n{summary}\n\nNew messages:\n{new_messages}\n\nNew summary:"
  ],
]);

const summarizeChain = summarizePrompt.pipe(model).pipe(new StringOutputParser());

// ── 2. Manual summary memory implementation ─────────────────────────
class SummaryMemory {
  private summary = "";
  private recentMessages: BaseMessage[] = [];
  private maxRecent = 4;  // Keep last 4 messages + summary of the rest

  async addMessages(human: string, ai: string) {
    this.recentMessages.push(new HumanMessage(human));
    this.recentMessages.push(new AIMessage(ai));

    // When too many recent messages, summarize older ones
    if (this.recentMessages.length > this.maxRecent * 2) {
      const toSummarize = this.recentMessages.splice(
        0,
        this.recentMessages.length - this.maxRecent
      );
      const newMsgsText = toSummarize
        .map((m) => `${m._getType()}: ${m.content}`)
        .join("\n");

      this.summary = await summarizeChain.invoke({
        summary: this.summary || "No summary yet.",
        new_messages: newMsgsText,
      });
      console.log(`  [Summary updated: "${this.summary.slice(0, 80)}..."]`);
    }
  }

  getMessages(): BaseMessage[] {
    const messages: BaseMessage[] = [];
    if (this.summary) {
      messages.push(
        new SystemMessage(`Previous conversation summary: ${this.summary}`)
      );
    }
    messages.push(...this.recentMessages);
    return messages;
  }
}

// ── 3. Use it in a conversation ─────────────────────────────────────
const memory = new SummaryMemory();

const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Be concise."],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

const chatChain = chatPrompt.pipe(model).pipe(new StringOutputParser());

const questions = [
  "Hi, I'm Mansi. I work at a startup in Bangalore.",
  "We're building an AI-powered code review tool.",
  "Our stack is TypeScript, React, and Node.js.",
  "We use PostgreSQL for the database.",
  "I'm specifically working on the LangChain integration.",
  "What tech stack am I using? Summarize what you know about me.",
];

console.log("=== Summary Memory Demo ===\n");

for (const question of questions) {
  const history = memory.getMessages();
  const response = await chatChain.invoke({ input: question, history });
  await memory.addMessages(question, response);

  console.log("Human:", question);
  console.log("AI:", response, "\n");
}
