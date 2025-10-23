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
    return await db.execute(
        "INSERT INTO summary (date, summary) VALUES (?, ?)",
        [date, summaryText]
    );
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


export { insertInSummary, insertRun };