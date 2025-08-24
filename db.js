const sqlite3 = require('sqlite3').verbose();

// Create or open the database file
const db = new sqlite3.Database('./chat.db');

// Optional: create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room TEXT,
      user TEXT,
      text TEXT,
      ts INTEGER
    )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS archived_messages (
    room TEXT,
    user TEXT,
    text TEXT,
    ts INTEGER,
    deleted_at INTEGER
  )
`);


  db.run(`
    CREATE TABLE IF NOT EXISTS archived_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room TEXT,
      user TEXT,
      text TEXT,
      ts INTEGER,
      deleted_at INTEGER
    )
  `);
});

module.exports = db;


