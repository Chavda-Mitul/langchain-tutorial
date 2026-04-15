import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatMessagePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { SystemMessage } from "langchain";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableBranch, RunnableLambda, RunnableParallel, RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";
import { parse } from "path";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 500,
});

const parser = new StringOutputParser();

// --- 1. THE CLASSIFIER ---
const classificationChain = PromptTemplate.fromTemplate(`
  Classify the following perfume as either "MIDDLE_EASTERN" or "DESIGNER".
  Middle Eastern brands: Lattafa, Afnan, Rasasi, Armaf, Ajmal, etc.
  Designer brands: Chanel, Dior, Armani, Versace, Kenzo, etc.
  
  Perfume: {perfume_name}
  Classification (return only one word):
`).pipe(model).pipe(parser);

// Chain for Middle Eastern (Reddit focus)
const middleEasternChain = PromptTemplate.fromTemplate(`
  You are searching r/DesiFragranceAddicts for {perfume_name}.
  Focus on: Value for money, batch performance in Indian weather, and clones/alternatives.
`).pipe(model).pipe(parser);

// Chain for Designer (Fragrantica focus)
const designerChain = PromptTemplate.fromTemplate(`
  You are searching Fragrantica for {perfume_name}.
  Focus on: Olfactory pyramid (notes), the nose/perfumer, and global popularity.
`).pipe(model).pipe(parser);

const defaultPerfumeChain = PromptTemplate.fromTemplate("General info for {perfume_name}").pipe(model).pipe(parser);

const branch = RunnableBranch.from([
    [
        (input:{category:string; perfume_name:string}) => (input.category.includes('MIDDLE_EASTERN')),
        middleEasternChain
    ],
    [
         (input:{category:string; perfume_name:string}) => (input.category.includes('DESIGNER')),
         designerChain
    ],
    defaultPerfumeChain
]);

// or 
// 1. Define the Router as a Lambda
const router = RunnableLambda.from((input: { category: string; perfume_name: string }) => {
  // Logic is now just clean TypeScript
  if (input.category.toUpperCase().includes("MIDDLE_EASTERN")) {
    return middleEasternChain;
  } 
  if (input.category.toUpperCase().includes("DESIGNER")) {
    return designerChain;
  }
  return designerChain; // Default Fallback
});

const runnableBranchOnCategory = RunnableSequence.from([
    // First, we get the category but keep the perfume_name
  {
    category: classificationChain,
    perfume_name: new RunnablePassthrough()
  },
  router
])

