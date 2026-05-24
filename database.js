const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'deposits.db');

// Caching DB connection globally in development to prevent too many open connections
let db;
if (process.env.NODE_ENV === 'production') {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err.message);
  });
} else {
  if (!global.cachedDb) {
    global.cachedDb = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('Database connection error:', err.message);
    });
  }
  db = global.cachedDb;
}

// Initialize table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      company TEXT NOT NULL,
      industry TEXT,
      standard TEXT,
      currency TEXT NOT NULL,
      amount REAL NOT NULL,
      reference TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'PENDING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating deposits table:', err.message);
    }
  });
});

/**
 * Save a new deposit registration to the database
 */
function saveDeposit(deposit) {
  return new Promise((resolve, reject) => {
    const { name, email, phone, company, industry, standard, currency, amount, reference } = deposit;
    const query = `
      INSERT INTO deposits (name, email, phone, company, industry, standard, currency, amount, reference)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [name, email, phone, company, industry, standard, currency, amount, reference], function(err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, ...deposit });
    });
  });
}

/**
 * Get all registered deposits (for audit / admin / testing purposes)
 */
function getAllDeposits() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM deposits ORDER BY created_at DESC`, [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

/**
 * Get a specific deposit by its reference code
 */
function getDepositByReference(reference) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM deposits WHERE reference = ?`, [reference], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

module.exports = {
  saveDeposit,
  getAllDeposits,
  getDepositByReference
};
