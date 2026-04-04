/**
 * 03-output-parsers/03-json-parser.ts
 * ────────────────────────────────────
 * JsonOutputParser & CommaSeparatedListOutputParser:
 * Parse model output into JSON objects or lists.
 *
 * Run: npx ts-node --esm src/03-output-parsers/03-json-parser.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: 300,
});

// ── 1. JsonOutputParser ─────────────────────────────────────────────
const jsonParser = new JsonOutputParser();

const jsonPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You always respond in valid JSON. No markdown, no code blocks."],
  ["human", "List 3 {language} frameworks with name and description fields. Return as a JSON array."],
]);

const jsonChain = jsonPrompt.pipe(model).pipe(jsonParser);
const frameworks = await jsonChain.invoke({ language: "TypeScript" });

console.log("=== JSON Output ===");
console.log("Parsed type:", typeof frameworks);  // object (parsed JSON)
console.log(JSON.stringify(frameworks, null, 2));

// ── 2. CommaSeparatedListOutputParser ───────────────────────────────
const listParser = new CommaSeparatedListOutputParser();

// getFormatInstructions() returns text you can inject into prompts
console.log("\n=== Format Instructions ===");
console.log(listParser.getFormatInstructions());

const listPrompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant."],
  ["human", "List 5 popular {category}.\n{format_instructions}"],
]);

const listChain = listPrompt.pipe(model).pipe(listParser);
const items = await listChain.invoke({
  category: "programming languages",
  format_instructions: listParser.getFormatInstructions(),
});

console.log("\n=== List Output ===");
console.log("Type:", Array.isArray(items));  // true
console.log("Items:", items);
console.log("First item:", items[0]);
