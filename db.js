const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db");

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS weather_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      weather_status TEXT,
      clothes_condition TEXT,
      created_at TEXT
    )
  `);

});

module.exports = db;