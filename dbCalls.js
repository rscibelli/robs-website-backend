import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function insertInSummary(date, summaryText) {
    const db = createDatabaseConnection();
    const [result] = await db.execute(
        "INSERT INTO summary (insertDate, summary) VALUES (?, ?)",
        [date, summaryText]
    );
    db.destroy();
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
    const db = createDatabaseConnection();

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
    db.destroy();
}

async function getRunsByDate(date) {
    const db = createDatabaseConnection();
    
    const [summaryRows] = await db.execute(
        "SELECT * FROM summary WHERE DATE(insertDate) = ? LIMIT 1",
        [date]
    );

    if (summaryRows.length === 0) {
        return { runs: [], summary: null };
    }

    const summary = summaryRows[0];
    const summaryId = summary.id;

    const [runs] = await db.execute(
        "SELECT * FROM runs WHERE summary_id = ? ORDER BY runDate DESC",
        [summaryId]
    );
    db.destroy();

    return { runs, summary };
}

async function createDatabaseConnection() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    return db;
}

export { insertInSummary, insertRun, getRunsByDate };