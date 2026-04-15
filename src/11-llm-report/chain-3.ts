import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatMessagePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { SystemMessage } from "langchain";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableLambda, RunnableParallel, RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 500,
});

const fragranticaPrompt = PromptTemplate.fromTemplate(`
  You are an expert perfumer. Search for the fragrance "{perfume_name}" on Fragrantica.
  Extract the following structured data:
  - Top, Middle, and Base notes.
  - Sillage and Longevity ratings.
  - Fragrance family (e.g., Woody, Oriental).
  Return only the technical breakdown.
`);

const redditPrompt = PromptTemplate.fromTemplate(`
  You are a fragrance community researcher. Search Reddit (r/fragrance, r/DesiFragranceAddicts) 
  for "{perfume_name}". 
  Identify:
  - Recent "batch" issues or reformulations.
  - "Compliment factor" according to real users.
  - Common complaints (e.g., "synthetic opening").
  Return a summary of user sentiment.
`);


const analysisPrompt = PromptTemplate.fromTemplate(`
  PERFUME ANALYSIS REPORT: {perfume_name}
  
  FRAGRANTICA DATA:
  {fragrantica_data}
  
  REDDIT SENTIMENT:
  {reddit_data}
  
  TASK: Compare the technical data with real-world usage. 
  Point out if the "notes" listed match the "smell" people describe. 
  Is it worth the current market price?
`);


const parser = new StringOutputParser();


const chainFragnetica = fragranticaPrompt.pipe(model).pipe(parser);

const chainFragneticaWithFallback = chainFragnetica.withFallbacks({
  fallbacks: [RunnableLambda.from(() => "Could not retrieve Fragnetica sentiment at this time.")],
});

const chainReddit = redditPrompt.pipe(model).pipe(parser);

const chainRedditWithFallback = chainReddit.withFallbacks({
  fallbacks: [RunnableLambda.from(() => "Could not retrieve Reddit sentiment at this time.")],
});


// STEP 1: Run both research chains in parallel.
// Keys here must match the variables analysisPrompt expects.
// perfume_name is passed through unchanged so the final prompt can reuse it.
const runParallel = RunnableParallel.from({
  fragrantica_data: chainFragneticaWithFallback,
  reddit_data: chainRedditWithFallback,
  perfume_name: new RunnablePassthrough()
});

// STEP 2: Feed the merged object { fragrantica_data, reddit_data, perfume_name }
// straight into analysisPrompt → model → parser.
const fullChain = RunnableSequence.from([
  runParallel,
  analysisPrompt,
  model,
  parser,
]);

const result = await fullChain.invoke({ perfume_name: "Kenzo Homme Intense EDT" });
console.log(result);