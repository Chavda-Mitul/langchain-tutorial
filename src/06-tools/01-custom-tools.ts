/**
 * 06-tools/01-custom-tools.ts
 * ───────────────────────────
 * Tools: Functions that an LLM can call to interact with the world.
 * You define what the tool does, the LLM decides when to use it.
 *
 * Run: npx ts-node --esm src/06-tools/01-custom-tools.ts
 */

import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

// ── 1. Define tools using the `tool()` function ─────────────────────
// This is the recommended way in LangChain v0.3+

const calculatorTool = tool(
  async ({ operation, a, b }) => {
    switch (operation) {
      case "add": return `${a + b}`;
      case "subtract": return `${a - b}`;
      case "multiply": return `${a * b}`;
      case "divide": return b !== 0 ? `${a / b}` : "Error: Division by zero";
      default: return "Unknown operation";
    }
  },
  {
    name: "calculator",
    description: "Perform basic math operations",
    schema: z.object({
      operation: z.enum(["add", "subtract", "multiply", "divide"]),
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    }),
  }
);

const weatherTool = tool(
  async ({ city }) => {
    // Simulated weather data (replace with real API in production)
    const weather: Record<string, string> = {
      "new york": "72°F, Sunny",
      "london": "58°F, Cloudy",
      "tokyo": "68°F, Rainy",
      "bangalore": "82°F, Partly Cloudy",
    };
    return weather[city.toLowerCase()] || `Weather data not available for ${city}`;
  },
  {
    name: "get_weather",
    description: "Get the current weather for a city",
    schema: z.object({
      city: z.string().describe("The city name"),
    }),
  }
);

// ── 2. Test tools directly ──────────────────────────────────────────
console.log("=== Direct Tool Calls ===");
console.log("Calculator:", await calculatorTool.invoke({
  operation: "multiply", a: 7, b: 8
}));
console.log("Weather:", await weatherTool.invoke({ city: "Bangalore" }));

// ── 3. Bind tools to a model ────────────────────────────────────────
// The model can now CHOOSE to call these tools
const modelWithTools = model.bindTools([calculatorTool, weatherTool]);

const response = await modelWithTools.invoke(
  "What is 25 * 4 and what's the weather in Tokyo?"
);

console.log("\n=== Model with Tools ===");
console.log("Content:", response.content);
console.log("Tool calls:", JSON.stringify(response.tool_calls, null, 2));

// ── 4. Execute the tool calls the model made ────────────────────────
if (response.tool_calls && response.tool_calls.length > 0) {
  console.log("\n=== Executing Tool Calls ===");
  for (const tc of response.tool_calls) {
    // Look up and execute the tool the model requested
    let result: string | unknown;
    if (tc.name === "calculator") {
      result = await calculatorTool.invoke(tc.args as any);
    } else if (tc.name === "get_weather") {
      result = await weatherTool.invoke(tc.args as any);
    } else {
      result = `Unknown tool: ${tc.name}`;
    }
    console.log(`${tc.name}(${JSON.stringify(tc.args)}) → ${result}`);
  }
}
