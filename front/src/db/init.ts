import { pool } from '../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

export const initializeDatabase = async (): Promise<void> => {
  const client = await pool.connect();
  
  try {
    console.log('📋 Reading database schema...');
    
    // Read the SQL initialization file
    const sqlFilePath = join(__dirname, '..', 'scripts', 'init-database.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf8');
    
    // Execute the entire SQL file
    await client.query(sqlContent);
    
    console.log('✅ Database schema initialized successfully');
  } catch (error: unknown) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const seedDatabase = async (): Promise<void> => {
  // The seeding is now handled by the SQL file itself
  console.log('✅ Database seeded with initial data (handled by SQL file)');
};
