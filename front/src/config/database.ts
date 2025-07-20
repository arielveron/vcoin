import { Pool } from 'pg';

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'vcoin',
  host: process.env.DB_HOST || 'raspi42.home.veron.com.ar',
  database: process.env.DB_NAME || 'vcoin',
  password: process.env.DB_PASSWORD || 'secret',
  port: parseInt(process.env.DB_PORT || '5432'),
  // Connection pool settings
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // return an error after this many milliseconds if connection could not be established
};

// Create a connection pool
export const pool = new Pool(dbConfig);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('Database pool has ended');
};
