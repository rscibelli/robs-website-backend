import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function insertInSummary(date, summaryText) {
    const [result] = await db.execute(
        "INSERT INTO summary (insertDate, summary) VALUES (?, ?)",
        [date, summaryText]
    );
    return result;
}

async function insertRun(
  summaryId,
  runDate,
  insertDate,
  name,
  distance,
  time,
  pace,
  caloriesBurned,
  averageHeartRate
) {
  const sql = `
    INSERT INTO runs (
      summary_id,
      runDate,
      insertDate,
      name,
      distance,
      time,
      pace,
      caloriesBurned,
      averageHeartRate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.execute(sql, [
    summaryId,
    runDate,
    insertDate,
    name,
    distance,
    time,
    pace,
    caloriesBurned,
    averageHeartRate
  ]);
}

async function getTodaysRunsAndSummary() {
    // Get today's date in YYYY-MM-DD format (assuming runDate is stored as DATE or string in that format)
    const today = new Date().toISOString().slice(0, 10);
    const [runs] = await db.execute("SELECT * FROM runs WHERE DATE(runDate) = ? ORDER BY runDate DESC", [today]);
    if (runs.length === 0) {
        return { runs: [], summary: null };
    }
    // Assume all today's runs have the same summary_id (if not, you may want to adjust this logic)
    const summaryId = runs[0].summary_id;
    const [summaryRows] = await db.execute("SELECT * FROM summary WHERE id = ?", [summaryId]);
    const summary = summaryRows.length > 0 ? summaryRows[0] : null;
    return { runs, summary };
}

export { insertInSummary, insertRun, getTodaysRunsAndSummary };