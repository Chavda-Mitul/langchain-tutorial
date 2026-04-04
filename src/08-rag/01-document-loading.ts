/**
 * 08-rag/01-document-loading.ts
 * ─────────────────────────────
 * RAG Step 1: Load and split documents.
 * Documents are loaded from various sources, then split into
 * smaller chunks for embedding and retrieval.
 *
 * Run: npx ts-node --esm src/08-rag/01-document-loading.ts
 */

import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// ── 1. Creating documents manually ─────────────────────────────────
// Documents have `pageContent` (text) and `metadata` (any info about the source)
const docs = [
  new Document({
    pageContent: "LangChain is a framework for developing applications powered by language models. It provides tools for prompt management, chains, agents, and memory.",
    metadata: { source: "langchain-docs", section: "intro" },
  }),
  new Document({
    pageContent: "TypeScript is a strongly typed programming language that builds on JavaScript. It adds static types, interfaces, and other features that help catch errors early.",
    metadata: { source: "typescript-docs", section: "intro" },
  }),
  new Document({
    pageContent: "Retrieval-Augmented Generation (RAG) combines a retrieval system with a generative model. It first retrieves relevant documents, then uses them as context for the LLM to generate accurate answers.",
    metadata: { source: "ai-handbook", section: "rag" },
  }),
];

console.log("=== Raw Documents ===");
docs.forEach((doc, i) => {
  console.log(`\nDoc ${i + 1}:`);
  console.log("  Content:", doc.pageContent.slice(0, 80) + "...");
  console.log("  Metadata:", doc.metadata);
});

// ── 2. Text splitting ──────────────────────────────────────────────
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 100,           // Max characters per chunk
  chunkOverlap: 20,         // Overlap between chunks (for context continuity)
  separators: ["\n\n", "\n", ". ", " ", ""],  // Split priority order
});

const splitDocs = await splitter.splitDocuments(docs);

console.log("\n=== Split Documents ===");
console.log(`Original: ${docs.length} docs → Split: ${splitDocs.length} chunks`);
splitDocs.forEach((doc, i) => {
  console.log(`\nChunk ${i + 1} (${doc.pageContent.length} chars):`);
  console.log("  Content:", doc.pageContent);
  console.log("  Metadata:", doc.metadata);
});

// ── 3. Splitting a large text string ────────────────────────────────
const longText = `
LangChain Expression Language (LCEL) is a declarative way to compose chains.
Every component in LCEL is a Runnable. Runnables have standard methods like invoke, batch, and stream.
You compose them with pipe(). The output of one becomes the input of the next.
LCEL supports parallel execution with RunnableParallel.
It also supports conditional branching with RunnableBranch.
The key benefit is that every chain automatically gets streaming, batching, and async support for free.
`.trim();

const chunks = await splitter.splitText(longText);
console.log("\n=== Split Text ===");
chunks.forEach((chunk, i) => {
  console.log(`Chunk ${i + 1}: "${chunk}"`);
});
