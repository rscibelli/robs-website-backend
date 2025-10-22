import { GoogleGenAI, mcpToTool } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

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
  const response1 = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:
      "Look up my last 10 activities, return a JSON array with fields: date, distance_km, pace_min_per_km, heart_rate_avg.",
    config: { tools: [mcpToTool(client)] },
  });

  const runsRaw = response1.text;

  // Step 2: Convert to imperial units (miles, min/mile)
  const response2 = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:
      `Convert this running data into imperial units (miles, min/mile) and return valid JSON. Data: ${runsRaw}`,
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

  // --- Insert summary ---
  const [summaryResult] = await db.execute(
    "INSERT INTO summary (date, summary) VALUES (CURDATE(), ?)",
    [summaryText]
  );

  const summaryId = summaryResult.insertId;

  // --- Insert runs ---
  for (const run of runsJson) {
    const { date, distance_mi, pace_min_per_mile, heart_rate_avg } = run;
    const runData = JSON.stringify(run);

    await db.execute(
      "INSERT INTO runs (summary_id, date, runData) VALUES (?, ?, ?)",
      [summaryId, date, runData]
    );
  }

  // --- Return combined result ---
  return {
    runs: runsJson,
    summary: summaryText,
  };
}

export { callGemini };