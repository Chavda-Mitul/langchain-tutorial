/**
 * 10-mini-project/chains.ts
 * ─────────────────────────
 * Multi-step research chains: research → analyze → summarize.
 */

import { ChatGroq } from "@langchain/groq";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { analysisPrompt, summaryPrompt } from "./prompts.js";

export function createResearchPipeline(model: ChatGroq) {
  const parser = new StringOutputParser();

  // Step 1: Analyze raw research data
  const analysisChain = analysisPrompt.pipe(model).pipe(parser);

  // Step 2: Summarize the analysis for a target audience
  const summaryChain = summaryPrompt.pipe(model).pipe(parser);

  // Combined pipeline: research → analyze → summarize
  const pipeline = RunnableSequence.from([
    // Input: { research: string, audience: string }
    new RunnableLambda({
      func: async (input: { research: string; audience: string }) => {
        console.log("\n  [Pipeline] Step 1: Analyzing research...");
        const analysis = await analysisChain.invoke({
          research: input.research,
        });
        console.log("  [Pipeline] Step 2: Creating summary...");
        return { analysis, audience: input.audience };
      },
    }),
    summaryChain,
  ]);

  return pipeline;
}
