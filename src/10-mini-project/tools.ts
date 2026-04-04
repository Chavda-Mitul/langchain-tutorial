/**
 * 10-mini-project/tools.ts
 * ────────────────────────
 * Custom tools for the AI Research Assistant.
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

// ── Calculator tool ─────────────────────────────────────────────────
export const calculatorTool = tool(
  async ({ expression }) => {
    try {
      const result = Function(`"use strict"; return (${expression})`)();
      return `${expression} = ${result}`;
    } catch {
      return `Error evaluating: ${expression}`;
    }
  },
  {
    name: "calculator",
    description: "Evaluate mathematical expressions like '2 + 3 * 4' or 'Math.sqrt(16)'",
    schema: z.object({
      expression: z.string().describe("The math expression to evaluate"),
    }),
  }
);

// ── Web search simulator ────────────────────────────────────────────
// In production, replace with a real search API (Tavily, SerpAPI, etc.)
export const webSearchTool = tool(
  async ({ query }) => {
    const knowledgeBase: Record<string, string> = {
      "langchain": "LangChain is an open-source framework by Harrison Chase (2022) for building LLM apps. Features: chains, agents, RAG, memory. Supports JS/TS and Python. Latest JS version: 0.3.x. Used by companies like Elastic, Notion, and Replit.",
      "typescript": "TypeScript 5.x (2024) by Microsoft. Key features: static typing, generics, decorators, mapped types, template literals. Used by Angular, Deno, and most modern web frameworks. 90%+ of JS devs prefer it for large projects.",
      "groq": "Groq is an AI inference company using custom LPU (Language Processing Unit) chips. Provides fastest LLM inference available (hundreds of tokens/second). Supports Llama, Mixtral, and Gemma models. Free tier available.",
      "rag": "RAG (Retrieval-Augmented Generation) was introduced by Facebook AI Research in 2020. Combines dense retrieval with seq2seq generation. Reduces hallucination by grounding LLM responses in retrieved documents. Key components: embeddings, vector store, retriever, generator.",
      "agents": "AI agents are LLM-powered systems that can use tools, make decisions, and complete tasks autonomously. Popular frameworks: LangChain agents, AutoGPT, CrewAI, LangGraph. Key pattern: Observe → Think → Act → Repeat.",
      "vector database": "Vector databases store high-dimensional embeddings for similarity search. Popular options: Pinecone (cloud), Chroma (local), Weaviate (hybrid), FAISS (in-memory). Used in RAG, recommendation systems, and image search.",
    };

    const key = Object.keys(knowledgeBase).find((k) =>
      query.toLowerCase().includes(k)
    );
    return key
      ? knowledgeBase[key]
      : `No specific results for "${query}". Try a more specific query about: ${Object.keys(knowledgeBase).join(", ")}`;
  },
  {
    name: "web_search",
    description: "Search the web for current information about a topic. Best for tech topics, frameworks, and AI concepts.",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

// ── Summarizer tool ─────────────────────────────────────────────────
export const summarizerTool = tool(
  async ({ text, style }) => {
    const wordCount = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(Boolean);

    if (style === "bullet_points") {
      return sentences
        .slice(0, 5)
        .map((s) => `• ${s.trim()}`)
        .join("\n");
    }
    if (style === "one_liner") {
      return sentences[0]?.trim() || text.slice(0, 100);
    }
    // brief — first 2-3 sentences
    return sentences.slice(0, 3).map((s) => s.trim()).join(". ") + ".";
  },
  {
    name: "summarizer",
    description: "Summarize a piece of text in different styles",
    schema: z.object({
      text: z.string().describe("The text to summarize"),
      style: z.enum(["brief", "bullet_points", "one_liner"]).describe("Summary style"),
    }),
  }
);

export const allTools = [calculatorTool, webSearchTool, summarizerTool];
