const { Pool } = require('pg');
require('dotenv').config();

// Neon DB connection configuration
// Neon DB requires special settings for serverless environment
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20, // maximum number of connections in pool
    idleTimeoutMillis: 30000, // time to wait before closing inactive connection
    connectionTimeoutMillis: 20000, // connection timeout (increased for Neon cold start)
    statement_timeout: 30000, // query execution timeout (30 seconds)
    // For Neon DB it's important to keep connections active
    allowExitOnIdle: false, // don't close pool when there are no active connections
});

// Database connection check
pool.on('connect', (client) => {
    // Connection established
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Don't terminate process, as this may be a temporary error
});

// Function to "warm up" connection (warmup) - important for Neon DB
async function warmupConnection() {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
    } catch (error) {
        console.error('Failed to warmup database connection:', error.message);
        return false;
    }
}

// Function to execute queries with retry mechanism
const query = async (text, params, retries = 3) => {
    const start = Date.now();
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await pool.query(text, params);
            return res;
        } catch (error) {
            lastError = error;
            const isConnectionError = error.code === 'ECONNREFUSED' || 
                                     error.code === 'ETIMEDOUT' ||
                                     error.message.includes('timeout') ||
                                     error.message.includes('Connection terminated');
            
            if (isConnectionError && attempt < retries) {
                // Exponential delay before retry
                await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)));
                // Try to "warm up" connection before retry
                if (attempt === 1) {
                    await warmupConnection();
                }
                continue;
            }
            
            console.error('Query error:', error.message, 'Query:', text.substring(0, 100));
            throw error;
        }
    }
    
    throw lastError;
};

// Function to get client from pool
const getClient = async () => {
    try {
        return await pool.connect();
    } catch (error) {
        // Try to warm up connection on error
        await warmupConnection();
        return await pool.connect();
    }
};

// Initialize connection when module loads
warmupConnection().catch(() => {
    // Initial warmup failed, but continuing
});

module.exports = {
    query,
    getClient,
    pool,
    warmupConnection
};

