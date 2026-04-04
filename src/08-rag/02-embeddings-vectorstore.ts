/**
 * 08-rag/02-embeddings-vectorstore.ts
 * ────────────────────────────────────
 * RAG Step 2: Embed documents and store in a vector store.
 * Embeddings convert text → numbers (vectors). Similar texts have similar vectors.
 * Vector stores enable fast similarity search over these embeddings.
 *
 * Run: npx ts-node --esm src/08-rag/02-embeddings-vectorstore.ts
 */

import "dotenv/config";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document, type DocumentInterface } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// ── 1. Create embeddings model ──────────────────────────────────────
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",   // Google's latest embedding model
  // taskType: "RETRIEVAL_DOCUMENT",  // Optimize for document retrieval
});

// Test embedding a single string
const singleEmbedding = await embeddings.embedQuery("Hello world");
console.log("=== Single Embedding ===");
console.log("Dimensions:", singleEmbedding.length);  // 768 dimensions
console.log("First 5 values:", singleEmbedding.slice(0, 5));

// ── 2. Create documents and split them ──────────────────────────────
const documents = [
  new Document({
    pageContent: "LangChain is a framework for building LLM-powered applications. It provides abstractions for models, prompts, chains, memory, tools, and agents.",
    metadata: { source: "langchain", topic: "overview" },
  }),
  new Document({
    pageContent: "LCEL (LangChain Expression Language) uses the pipe operator to compose chains. Every component is a Runnable with invoke, batch, and stream methods.",
    metadata: { source: "langchain", topic: "lcel" },
  }),
  new Document({
    pageContent: "Agents use LLMs to decide which tools to call. They follow a loop: think, act (call tool), observe (get result), repeat until done.",
    metadata: { source: "langchain", topic: "agents" },
  }),
  new Document({
    pageContent: "RAG (Retrieval-Augmented Generation) retrieves relevant documents and passes them as context to the LLM. This reduces hallucination and grounds answers in real data.",
    metadata: { source: "langchain", topic: "rag" },
  }),
  new Document({
    pageContent: "Vector stores index document embeddings for fast similarity search. When you query, your question is embedded and compared against stored vectors to find the most relevant documents.",
    metadata: { source: "langchain", topic: "vectorstores" },
  }),
];

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 30,
});
const splitDocs = await splitter.splitDocuments(documents);
console.log(`\nSplit into ${splitDocs.length} chunks`);

// ── 3. Create vector store and add documents ────────────────────────
const vectorStore = await MemoryVectorStore.fromDocuments(
  splitDocs,
  embeddings,
);

console.log("\n=== Vector Store Created ===");
console.log("Documents indexed:", splitDocs.length);

// ── 4. Similarity search ────────────────────────────────────────────
const results = await vectorStore.similaritySearch(
  "How do agents work?",
  2,  // Return top 2 results
);

console.log("\n=== Similarity Search: 'How do agents work?' ===");
results.forEach((doc: DocumentInterface, i: number) => {
  console.log(`\nResult ${i + 1}:`);
  console.log("  Content:", doc.pageContent);
  console.log("  Metadata:", doc.metadata);
});

// ── 5. Similarity search with scores ────────────────────────────────
const resultsWithScores = await vectorStore.similaritySearchWithScore(
  "What is RAG?",
  3,
);

console.log("\n=== Search with Scores: 'What is RAG?' ===");
resultsWithScores.forEach(([doc, score]: [DocumentInterface, number], i: number) => {
  console.log(`\nResult ${i + 1} (score: ${score.toFixed(4)}):`);
  console.log("  Content:", doc.pageContent);
});

// ── 6. Use as a retriever (for chains) ──────────────────────────────
const retriever = vectorStore.asRetriever({
  k: 2,                  // Number of documents to retrieve
  // searchType: "similarity",      // Default search type
  // filter: { topic: "agents" },   // Metadata filter (if supported)
});

const retrieved = await retriever.invoke("How to compose chains?");
console.log("\n=== Retriever ===");
retrieved.forEach((doc: DocumentInterface, i: number) => {
  console.log(`${i + 1}:`, doc.pageContent.slice(0, 100) + "...");
});
