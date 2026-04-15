import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { ChatMessagePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { SystemMessage } from "langchain";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";


const model = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    maxTokens:400,
    temperature:0.7
});


const prompt1 = ChatPromptTemplate.fromMessages([
   ["system", "You are a expert in {topic} you have to research on this topic and gater info."],
   ["human", "{question}"],
]);

const prompt2 = PromptTemplate.fromTemplate("You to  create a detailed summary of the researed topic. {data}");

// ── 2. With StringOutputParser — returns just the string ──
const parser = new StringOutputParser();


const chain = RunnableSequence.from([
  prompt1,                                    // 1. Fill system/human template with { topic, question }
  model,                                      // 2. LLM researches the topic → AIMessage
  parser,                                     // 3. Extract plain string from AIMessage
  (research: string) => ({ data: research }), // 4. Wrap string so prompt2 can read {data}
  prompt2,                                    // 5. Fill summary template
  model,                                      // 6. LLM writes the summary → AIMessage
  parser,                                     // 7. Extract final string
]);

// ── Visualize the chain ──
const graph = chain.getGraph();

console.log("=== Simple Text Diagram ===");
const nodeNames = Object.values(graph.nodes).map((n: any) => n.data?.name ?? n.data?.id ?? "step");
console.log(nodeNames.join("\n   ↓\n"));

console.log("\n=== Mermaid Diagram (paste into https://mermaid.live) ===");
console.log(graph.drawMermaid());

// // ── Run the chain ──
const result = await chain.invoke({
    topic:'Quantum computers in IT',
    question: 'future of the quantum computer in tech for job what benifit i will get if i join start learning this on my own'
})
// console.log("\n=== Result ===");
console.log(result);

