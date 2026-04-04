/**
 * 08-rag/03-rag-chain.ts
 * ──────────────────────
 * RAG Step 3: The full RAG pipeline — retrieve → prompt → generate.
 * Combines vector search with an LLM to answer questions grounded in data.
 *
 * Run: npx ts-node --esm src/08-rag/03-rag-chain.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document, type DocumentInterface } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: 300,
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
});

// ── 1. Create knowledge base ────────────────────────────────────────
const docs = [
  new Document({
    pageContent: "LangChain was created by Harrison Chase and first released in October 2022. It quickly became the most popular framework for building LLM applications.",
    metadata: { topic: "history" },
  }),
  new Document({
    pageContent: "LangChain supports multiple LLM providers including OpenAI, Anthropic, Google, Groq, and many more. You can switch providers without changing your application code.",
    metadata: { topic: "providers" },
  }),
  new Document({
    pageContent: "The LCEL (LangChain Expression Language) uses a pipe-based syntax for composing chains. It provides streaming, batching, and parallel execution out of the box.",
    metadata: { topic: "lcel" },
  }),
  new Document({
    pageContent: "LangSmith is the observability platform for LangChain. It provides tracing, debugging, testing, and monitoring for LLM applications in production.",
    metadata: { topic: "langsmith" },
  }),
  new Document({
    pageContent: "LangGraph is a framework for building stateful, multi-actor applications with LLMs. It extends LangChain with graph-based workflows and persistent state.",
    metadata: { topic: "langgraph" },
  }),
];

const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
const retriever = vectorStore.asRetriever({ k: 2 });

// ── 2. RAG prompt ───────────────────────────────────────────────────
const ragPrompt = ChatPromptTemplate.fromMessages([
  ["system",
    "You are a helpful assistant. Answer the question based ONLY on the provided context. " +
    "If the context doesn't contain the answer, say 'I don't have that information.'"
  ],
  ["human",
    "Context:\n{context}\n\nQuestion: {question}"
  ],
]);

// ── 3. Build the RAG chain ──────────────────────────────────────────
// Helper to format retrieved docs into a single string
function formatDocs(docs: DocumentInterface[]): string {
  return docs.map((doc) => doc.pageContent).join("\n\n");
}

const ragChain = RunnableSequence.from([
  {
    // Retrieve docs and format them
    context: retriever.pipe(formatDocs),
    // Pass the question through
    question: new RunnablePassthrough(),
  },
  ragPrompt,
  model,
  new StringOutputParser(),
]);

// ── 4. Ask questions ────────────────────────────────────────────────
const questions = [
  "Who created LangChain?",
  "What LLM providers does LangChain support?",
  "What is LangSmith?",
  "What is the weather today?",  // Not in the knowledge base
];

console.log("=== RAG Chain ===\n");

for (const question of questions) {
  console.log("Q:", question);
  const answer = await ragChain.invoke(question);
  console.log("A:", answer, "\n");
}

// ── 5. RAG with source attribution ──────────────────────────────────
console.log("=== RAG with Sources ===\n");

const question = "What is LCEL?";
const retrievedDocs = await retriever.invoke(question);

// Show which docs were retrieved
console.log("Retrieved documents:");
retrievedDocs.forEach((doc: DocumentInterface, i: number) => {
  console.log(`  ${i + 1}. [${doc.metadata.topic}] ${doc.pageContent.slice(0, 80)}...`);
});

const answerWithContext = await ragPrompt
  .pipe(model)
  .pipe(new StringOutputParser())
  .invoke({
    context: formatDocs(retrievedDocs),
    question,
  });

console.log("\nAnswer:", answerWithContext);
console.log("Sources:", retrievedDocs.map((d: DocumentInterface) => d.metadata.topic).join(", "));
