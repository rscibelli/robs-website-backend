import { callGemini } from './aiClient.js';
import express from 'express';
import { getTodaysRunsAndSummary } from './dbCalls.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', async (req, res) => {
    let response = await callGemini();
    res.send(response);
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
