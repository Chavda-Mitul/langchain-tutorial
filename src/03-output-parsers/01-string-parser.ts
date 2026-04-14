/**
 * 03-output-parsers/01-string-parser.ts
 * ──────────────────────────────────────
 * Output Parsers: Transform raw model output into structured data.
 * StringOutputParser extracts just the text content from a message.
 *
 * Run: npx ts-node --esm src/03-output-parsers/01-string-parser.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 200,
});

// ── 1. Without parser — returns full AIMessage object ──
const raw = await model.invoke("What is TypeScript?");
console.log("=== Without Parser ===");
console.log("Type:", typeof raw);           // object (AIMessage)
console.log("Content:", raw.content);       // The actual text

// ── 2. With StringOutputParser — returns just the string ──
const parser = new StringOutputParser();

const chain = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Be concise."],
  ["human", "{question}"],
])
  .pipe(model)
  .pipe(parser);     // Extracts .content as a string

const result = await chain.invoke({ question: "What is TypeScript?" });
console.log("\n=== With StringOutputParser ===");
console.log("Type:", typeof result);        // string
console.log("Content:", result);            // Just the text, no wrapper
