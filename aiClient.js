import { GoogleGenAI, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { insertInSummary, insertRun } from "./dbCalls";
import dotenv from "dotenv";

dotenv.config();

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

  const prompt = `
    Look up my last 10 running activities.
    Return a JSON array of objects where each object has the following fields:
    - date (string)
    - name (string, the activity name)
    - distance (string)
    - time (string)
    - pace (string)
    - caloriesBurned (integer)
    - averageHeartRate (integer)
  `

  const response1 = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { 
      tools: [mcpToTool(client)],
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            runDate: { type: "string" },
            name: { type: "string" },
            distance: { type: "string" },
            time: { type: "string" },
            pace: { type: "string" },
            caloriesBurned: { type: "integer" },
            averageHeartRate: { type: "integer" },
          },
          required: ["runDate", "name", "distance", "time", "pace", "caloriesBurned", "averageHeartRate"],
        },
      },
    },
  });

  const runsMetric = response1.text;

  // Step 2: Convert to imperial units (miles, min/mile)
  const response2 = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:
      `Convert this running data into imperial units (miles, min/mile) and return valid JSON. Data: ${runsMetric}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            runDate: { type: "string" },
            name: { type: "string" },
            distance: { type: "string" },
            time: { type: "string" },
            pace: { type: "string" },
            caloriesBurned: { type: "integer" },
            averageHeartRate: { type: "integer" },
          },
          required: ["runDate", "name", "distance", "time", "pace", "caloriesBurned", "averageHeartRate"],
        },
      },
    },
  });

  const runsImperial = response2.text;

  // Step 3: Generate performance summary
  const response3 = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:
      `Analyze the following runs data and give me a summary of my performance over time. Return just a plain text summary. Data: ${runsImperial}`,
  });

  const summaryText = response3.text;

  // --- Parse runs JSON safely ---
  let runsJson;
  try {
    runsJson = JSON.parse(runsImperial);
  } catch (err) {
    console.error("❌ Failed to parse runs JSON:", err);
    return { error: "Invalid JSON from AI" };
  }

  const summary = insertInSummary(summaryText);
  const insertDate = new Date().toISOString().split("T")[0];

  for (const run of runsJson) {
    const { runDate, name, distance, time, pace, caloriesBurned, averageHeartRate } = run;

    await insertRun(summary.insertId, runDate, insertDate, name, distance, time, pace, caloriesBurned, averageHeartRate);
  }


  return {
    runs: runsJson,
    summary: summaryText,
  };
}

export { callGemini };