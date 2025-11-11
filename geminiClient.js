import { GoogleGenAI, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { insertInSummary, insertRun } from "./dbCalls.js";
import dotenv from "dotenv";

dotenv.config();

const MAX_ATTEMPTS = 5;

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

async function generateAnalysis() {

  const prompt = `
    Look up my last 10 activities using the Garmin MCP. Gather the following fields from each, you can just keep the final response as a string:
    - date
    - name
    - distance
    - time
    - averagePace
    - caloriesBurned
    - averageHeartRate
  `;

  const runsMetric = "";

  for (let attempt = 0; attempt <= MAX_ATTEMPTS; attempt++) {
    const response1 = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [mcpToTool(client)],
      },
    });

    runsMetric = response1.text;

    console.log("Response from Gemini: ", response1);
    console.log("Runs: ", runsMetric);

    try {
      validateRunData(runsMetric);
    } catch (err) {
      console.error(`Validation failed on attempt ${attempt + 1}: `, err);
      if (attempt === MAX_ATTEMPTS) {
        throw new Error("Max attempts reached. Unable to get valid run data.");
      }
      continue;
    }
    break;
  }
  

  const response2 = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:
      `Convert this data into imperial units (miles, min/mile) and return valid JSON. Data: ${runsMetric}`,
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

  const response3 = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:
      `You are a running coach. Analyze the following data, tell my what I did right and tell me some things 
      I can do to improve in my training. Return just a plain text summary. Data: ${runsImperial}`,
  });

  const summaryText = response3.text;

  let runsJson;
  try {
    runsJson = JSON.parse(runsImperial);
  } catch (err) {
    console.error("Failed to parse runs JSON:", err);
    return { error: "Invalid JSON from AI" };
  }

  console.log(runsImperial)
  console.log(runsJson)
  console.log(summaryText)

  const date = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  )
  const summary = await insertInSummary(date, summaryText);

  console.log("Summary: ", summary);

  for (const run of runsJson) {
    const { runDate, name, distance, time, pace, caloriesBurned, averageHeartRate } = run;

    await insertRun(summary.insertId, runDate, date, name, distance, time, pace, caloriesBurned, averageHeartRate);
  }

  return {
    runs: runsJson,
    summary: summaryText,
  };
}

function validateRunData(runs) {
  let runsJson = JSON.parse(runs);

  if (runsJson.length !== 10) {
    throw new Error("Expected 10 runs, got " + runsJson.length);
  }

  if (runsJson.some(run => !run.runDate || !run.name || !run.distance || !run.time || !run.pace || !run.caloriesBurned || !run.averageHeartRate)) {
    throw new Error("One or more runs are missing required fields");
  }
}

export { generateAnalysis };