import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";

async function main() {
  const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 100
});

const prompt = PromptTemplate.fromTemplate(
  "You are Osho. Explain {topic} in a meaningful way within 100 tokens."
);

const chain = prompt.pipe(model);

const response = await chain.invoke({ topic: "TypeScript" });
console.log(response.content);
}

main();