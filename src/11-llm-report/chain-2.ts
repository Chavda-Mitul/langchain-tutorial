import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatMessagePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { SystemMessage } from "langchain";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { prefault } from "zod/v4";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 700,
});


const getPerfumeInfoPrompt = ChatPromptTemplate.fromMessages([
  [
    "system", 
    `You are an expert Fragrance Analyst. Your task is to synthesize data as found on Fragrantica and Reddit (r/DesiFragranceAddicts). 
    Provide a detailed breakdown for the perfume: {perfume}.
    
    You must include:
    1. Scent Profile: Top, Heart, and Base notes.
    2. Performance: Longevity (hours) and Sillage/Projection.
    3. Community Sentiment: Common pros and cons from Reddit.
    4. Market Value: Is it worth the current retail price?
    5. Alternatives: 2-3 similar fragrances or clones.`
  ],
  ["human", "Gather detailed information for: {perfume}"]
]);

const reviewPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a Senior Fragrance Critic. Based on the raw data provided, generate a sophisticated Buyer's Report.
    
    Your report must follow this structure:
    - **The Hook**: Who is this perfume for? (e.g., The Professional, The Night Owl).
    - **Expectation vs. Reality**: What the wearer will actually experience in the first 4 hours.
    - **The Value Prop**: A critical analysis of the price-to-quality ratio.
    - **Before and after maciration**
    - **The Final Verdict**: A clear 'Buy', 'Sample First', or 'Pass'.
    
    Maintain a tone that is objective, yet passionate about perfumery.`
  ],
  ["human", "Review the following fragrance data and create the report: \n\n {details}"]
]);

const parser = new StringOutputParser();



const chain =  RunnableSequence.from([
    getPerfumeInfoPrompt,
    model,
    parser,
    (details:string) => ({details:details}),
    reviewPrompt,
    model,
    parser
]);

const review = await chain.invoke({
    perfume:'Arabiyat-Prestige/Marwa'
});

console.log(review);



