import { generateAnalysis } from './runAnalysisService.js';
import { getGolfData } from './golfAnalysisService.js';
import { getTeeTimesForCourse } from './teeTimeBooker.js';
import cors from "cors";
import express from 'express';
import cron from "node-cron";
import { getLatestRunData } from './dbCalls.js';
import dotenv from "dotenv";

dotenv.config();

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
    let response = await generateAnalysis();
    res.send(response);
});

cron.schedule("0 6 * * *", async () => {
  try {
    console.log("Running scheduled Gemini task at 6am...");
    await generateAnalysis();
    console.log("✅ callGemini finished successfully");
  } catch (err) {
    console.error("❌ Error running callGemini: ", err);
  }
}, {
  timezone: "America/New_York"
});

app.get('/api/todays-runs-summary', async (req, res) => {
    try {
        const data = await getLatestRunData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch today\'s runs and summary', details: err.message });
    }
});

app.get('/get-golf-data', async (req, res) => {
    try {
        const data = await getGolfData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch golf data', details: err.message });
    }
});

app.get('/get-tee-times', async (req, res) => {
    try {
        const { courseName, date } = req.query;
        
        if (!courseName) {
            return res.status(400).json({ error: 'Missing required parameter: courseName' });
        }
        
        const teeTimesData = await getTeeTimesForCourse(courseName, date || new Date().toISOString().split('T')[0]);
        res.json(teeTimesData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tee times', details: err.message });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running ${port}`);
});
