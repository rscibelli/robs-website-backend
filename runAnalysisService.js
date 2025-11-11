import { callGemini, callGeminiWithGarminTool, callGeminiWithSchema } from "./geminiService.js";
import { insertInSummary, insertRun } from "./dbCalls.js";

const MAX_ATTEMPTS = 5;

const runSchema = {
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
};

async function generateAnalysis() {
  const collectRunsPrompt = `
    Look up my last 10 activities using the Garmin MCP. Gather the following fields from each, you can just keep the final response as a string:
    - date
    - name
    - distance
    - time
    - averagePace
    - caloriesBurned
    - averageHeartRate
  `;
  const convertToImperialPrompt = "Convert this data into imperial units (miles, min:sec per mile) and return valid JSON. Data: ";
  const analyzePrompt = `You are a running coach. Analyze the following data, 
  tell my what I did right and tell me some things I can do to improve in my training. 
  Return just a plain text summary. Data: `;

  let runsMetric = "";
  let runsImperial = "";
  let summary = "";

  for (let attempt = 0; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      runsMetric = await callGeminiWithGarminTool(collectRunsPrompt);
      console.log("Runs: ", runsMetric);
      runsImperial = await callGeminiWithSchema(convertToImperialPrompt + runsMetric, runSchema);

      validateRunData(runsImperial);

      summary = await callGemini(analyzePrompt + runsImperial);
    } catch (err) {
      console.error(`AI calls or validation failed on attempt ${attempt + 1}: `, err);
      if (attempt === MAX_ATTEMPTS) {
        throw new Error("Max attempts reached. Unable to get valid run data.");
      }
      continue;
    }
    break;
  }

  console.log(summary);

  let runsJson;
  try {
    runsJson = JSON.parse(runsImperial);
  } catch (err) {
    console.error("Failed to parse runs JSON:", err);
    return { error: "Invalid JSON from AI" };
  }

  const date = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  )
  const summaryDto = await insertInSummary(date, summary);

  for (const run of runsJson) {
    const { runDate, name, distance, time, pace, caloriesBurned, averageHeartRate } = run;
    await insertRun(summaryDto.insertId, runDate, date, name, distance, time, pace, caloriesBurned, averageHeartRate);
  }

  console.log("Finished generating analysis and storing in DB.");

  return {
    runs: runsJson,
    summary: summary,
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