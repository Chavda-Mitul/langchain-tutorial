/**
 * 03-output-parsers/02-structured-output.ts
 * ──────────────────────────────────────────
 * Structured Output: Get the model to return data matching a schema.
 * Uses Zod schemas for type-safe, validated output.
 *
 * Run: npx ts-node --esm src/03-output-parsers/02-structured-output.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

// ── 1. .withStructuredOutput() — the recommended approach ───────────
// Define the schema using Zod
const jokeSchema = z.object({
  setup: z.string().describe("The setup of the joke"),
  punchline: z.string().describe("The punchline of the joke"),
  rating: z.number().min(1).max(10).describe("How funny it is, 1-10"),
});

// Bind the schema to the model
const structuredModel = model.withStructuredOutput(jokeSchema);

const joke = await structuredModel.invoke("Tell me a programming joke.");
console.log("=== Structured Output (Joke) ===");
console.log("Setup:", joke.setup);
console.log("Punchline:", joke.punchline);
console.log("Rating:", joke.rating);
console.log("Type of rating:", typeof joke.rating);  // number, not string!

// ── 2. More complex schema ──────────────────────────────────────────
const movieReviewSchema = z.object({
  title: z.string().describe("Movie title"),
  genre: z.enum(["action", "comedy", "drama", "sci-fi", "horror"]),
  sentiment: z.enum(["positive", "negative", "mixed"]),
  score: z.number().min(0).max(100),
  keyPoints: z.array(z.string()).describe("Main points of the review"),
});

const reviewModel = model.withStructuredOutput(movieReviewSchema);

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a movie critic. Analyze the given review."],
  ["human", "{review}"],
]);

const chain = prompt.pipe(reviewModel);

const review = await chain.invoke({
  review: "Inception was mind-blowing! The visuals were stunning and the plot kept me guessing. Nolan is a genius. Only downside was the runtime.",
});

console.log("\n=== Movie Review Analysis ===");
console.log(JSON.stringify(review, null, 2));

// ── 3. withStructuredOutput options ─────────────────────────────────
const strictModel = model.withStructuredOutput(jokeSchema, {
  name: "joke_generator",           // Name for the tool/function
  method: "functionCalling",        // "functionCalling" or "jsonMode"
});

const joke2 = await strictModel.invoke("Tell me a joke about TypeScript.");
console.log("\n=== With Options ===");
console.log(joke2);
