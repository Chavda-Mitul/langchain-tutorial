# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript tutorial project for learning LangChain, structured as numbered modules that progressively introduce concepts. Uses Groq (Llama 3.3 70B) as the primary LLM and Google GenAI for embeddings.

## Commands

```bash
# Run a specific tutorial file (the primary workflow)
npx ts-node --esm src/01-models/01-basic-chat.ts

# Run the main entry point
npm run dev

# Build
npm run build
```

Each `.ts` file in `src/` is a standalone, self-contained example meant to be run individually.

## Environment Variables

Requires a `.env` file (see `.env.example`):
- `GROQ_API_KEY` — required for all examples
- `GOOGLE_API_KEY` — required for RAG module (embeddings/vector store)

## Architecture

The project is organized as **10 numbered learning modules**, each building on previous concepts:

| Module | Topic | Key LangChain Concepts |
|--------|-------|----------------------|
| `01-models/` | Chat models | ChatGroq, message types, model config |
| `02-prompts/` | Prompt engineering | PromptTemplate, ChatPromptTemplate, few-shot |
| `03-output-parsers/` | Parsing responses | StringOutputParser, StructuredOutput (Zod), JSON parser |
| `04-chains/` | LCEL composition | `.pipe()`, RunnableSequence, RunnableParallel, branching |
| `05-memory/` | Conversation memory | BufferMemory, WindowMemory, SummaryMemory |
| `06-tools/` | Tool use | Custom tools (DynamicStructuredTool), tool-calling loop |
| `07-agents/` | Agents | Tool-calling agent, AgentExecutor, agent with memory |
| `08-rag/` | RAG pipeline | Document loading, Google GenAI embeddings, MemoryVectorStore |
| `09-streaming/` | Streaming | `.stream()`, callbacks |
| `10-mini-project/` | Capstone app | AI Research Assistant combining all modules |

### Mini-Project Structure (`src/10-mini-project/`)

The capstone is a multi-file AI Research Assistant:
- `app.ts` — Entry point, orchestrates 3 phases: agent research, analysis pipeline, streaming
- `agent.ts` — Creates tool-calling agent with memory (AgentExecutor + RunnableWithMessageHistory)
- `chains.ts` — Sequential analysis pipeline
- `tools.ts` — Custom research tools
- `prompts.ts` — Agent system prompts
- `memory.ts` — Session-based chat history

## Key Patterns

- All files use `import "dotenv/config"` at the top for env loading
- ESM modules throughout (`"type": "module"` in package.json, `.js` extensions in imports)
- Model instantiation: `new ChatGroq({ model: "llama-3.3-70b-versatile", temperature: 0.7 })`
- LCEL chains use `.pipe()` composition: `prompt.pipe(model).pipe(parser)`
