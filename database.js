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

// Initialize tables
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

  db.run(`
    CREATE TABLE IF NOT EXISTS benchmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      score REAL NOT NULL,
      answers TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating benchmarks table:', err.message);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS regulation_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      nip TEXT NOT NULL,
      matched_count INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating regulation_reports table:', err.message);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS carbon_footprint_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      reporting_year INTEGER,
      total_lb REAL NOT NULL,
      total_mb REAL,
      scope1 REAL,
      scope2_lb REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating carbon_footprint_reports table:', err.message);
    }
  });
});

/**
 * Save a new deposit registration to the database
 */
function saveDeposit(deposit) {
  return new Promise((resolve, reject) => {
    const { name, email, phone, company, industry, standard, currency, amount, reference, status = 'PRE-REGISTERED' } = deposit;
    const query = `
      INSERT INTO deposits (name, email, phone, company, industry, standard, currency, amount, reference, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [name, email, phone, company, industry, standard, currency, amount, reference, status], function(err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, ...deposit, status });
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

/**
 * Update the payment status of a deposit by its reference code
 */
function updateDepositStatus(reference, status) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE deposits SET status = ? WHERE reference = ?`, [status, reference], function(err) {
      if (err) {
        return reject(err);
      }
      resolve({ reference, status, changes: this.changes });
    });
  });
}

/**
 * Save a new ESG benchmark assessment to the database
 */
function saveBenchmark(benchmark) {
  return new Promise((resolve, reject) => {
    const { name, email, company, score, answers } = benchmark;
    const query = `
      INSERT INTO benchmarks (name, email, company, score, answers)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(query, [name, email, company, score, answers], function(err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, ...benchmark });
    });
  });
}

/**
 * Save a new regulation search report to the database
 */
function saveRegulationReport(report) {
  return new Promise((resolve, reject) => {
    const { name, email, company, nip, matched_count } = report;
    const query = `
      INSERT INTO regulation_reports (name, email, company, nip, matched_count)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(query, [name, email, company, nip, matched_count], function(err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, ...report });
    });
  });
}

/**
 * Save a new carbon footprint calculation report to the database
 */
function saveCarbonFootprintReport(report) {
  return new Promise((resolve, reject) => {
    const { name, email, company, reporting_year, total_lb, total_mb, scope1, scope2_lb } = report;
    const query = `
      INSERT INTO carbon_footprint_reports (name, email, company, reporting_year, total_lb, total_mb, scope1, scope2_lb)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [name, email, company, reporting_year, total_lb, total_mb, scope1, scope2_lb], function(err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID, ...report });
    });
  });
}

module.exports = {
  saveDeposit,
  getAllDeposits,
  getDepositByReference,
  updateDepositStatus,
  saveBenchmark,
  saveRegulationReport,
  saveCarbonFootprintReport
};
