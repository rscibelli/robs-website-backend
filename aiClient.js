import { GoogleGenAI, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { configDotenv } from "dotenv";

const serverParams = new StdioClientTransport({
  command: "uvx",
  args: ["--python", "3.12",
        "--from", "git+https://github.com/Taxuspt/garmin_mcp",
        "garmin-mcp"],
  env: {
    GARMIN_EMAIL: process.env.GARMIN_EMAIL,
    GARMIN_PASSWORD: process.env.GARMIN_PASSWORD
  }
});

const client = new Client(
  {
    name: "example-client",
    version: "1.0.0"
  }
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

await client.connect(serverParams);

async function callGemini() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "pull back myLook up my last 10 runs, find the run name, distance, pace, average heart rate, and evaluation, and organize it in sentances.",
    config: {
      tools: [mcpToTool(client)]
    },
  });

  const response2 = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Evaluate my runs and give my sumary of my performance. Data: " + response.text
  });
  return response2.text;
}

export { callGemini };