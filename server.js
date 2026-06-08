const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database/weather.db");

// Membuat tabel jika belum ada
db.run(`
CREATE TABLE IF NOT EXISTS weather_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_value INTEGER,
    weather_status TEXT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

/*
  API MENERIMA DATA DARI ESP32
*/
app.post("/weather", (req, res) => {
    const { sensor_value, weather_status } = req.body;

    if (
        sensor_value === undefined ||
        weather_status === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Data tidak lengkap"
        });
    }

    db.run(
        `
        INSERT INTO weather_logs
        (sensor_value, weather_status)
        VALUES (?, ?)
        `,
        [sensor_value, weather_status],
        function(err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });
        }
    );
});

/*
  API STATUS TERBARU
*/
app.get("/api/status", (req, res) => {

    db.get(
        `
        SELECT *
        FROM weather_logs
        ORDER BY id DESC
        LIMIT 1
        `,
        [],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(row || {});
        }
    );
});

/*
  API RIWAYAT DATA
*/
app.get("/api/history", (req, res) => {

    db.all(
        `
        SELECT *
        FROM weather_logs
        ORDER BY id DESC
        LIMIT 50
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server berjalan pada port ${PORT}`);
});