const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new Database("weather.db");

db.exec(`
CREATE TABLE IF NOT EXISTS weather_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_value INTEGER NOT NULL,
    weather_status TEXT NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

const insertWeather = db.prepare(`
INSERT INTO weather_logs
(sensor_value, weather_status)
VALUES (?, ?)
`);

const latestWeather = db.prepare(`
SELECT *
FROM weather_logs
ORDER BY id DESC
LIMIT 1
`);

const historyWeather = db.prepare(`
SELECT *
FROM weather_logs
ORDER BY id DESC
LIMIT 50
`);

app.post("/weather", (req, res) => {
    try {
        const { sensor_value, weather_status } = req.body;

        if (
            sensor_value === undefined ||
            !weather_status
        ) {
            return res.status(400).json({
                success: false,
                message: "Data tidak lengkap"
            });
        }

        const result = insertWeather.run(
            sensor_value,
            weather_status
        );

        res.json({
            success: true,
            id: result.lastInsertRowid
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.get("/api/status", (req, res) => {
    try {
        const row = latestWeather.get();

        res.json(row || {});
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

app.get("/api/history", (req, res) => {
    try {
        const rows = historyWeather.all();

        res.json(rows);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Server berjalan di port ${PORT}`
    );
});