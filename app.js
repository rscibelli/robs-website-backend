import { callGemini } from './aiClient.js';
import cors from "cors";
import express from 'express';
import cron from "node-cron";
import { getTodaysRunsAndSummary } from './dbCalls.js';

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "https://rscibelli.com",      // your frontend
  "https://www.rscibelli.com",  // optional, in case users hit the www domain
  "http://localhost:3000",      // local dev (Vite, for example)
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin: " + origin));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/generate-summary', async (req, res) => {
    let response = await callGemini();
    res.send(response);
});

cron.schedule("0 6 * * *", async () => {
  try {
    console.log("Running scheduled Gemini task at 6am...");
    await callGemini();
    console.log("✅ callGemini finished successfully");
  } catch (err) {
    console.error("❌ Error running callGemini:", err);
  }
}, {
  timezone: "America/New_York"
});

app.get('/api/todays-runs-summary', async (req, res) => {
    try {
        const data = await getTodaysRunsAndSummary();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch today\'s runs and summary', details: err.message });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
