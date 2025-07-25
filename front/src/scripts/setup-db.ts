import { testConnection, closePool } from '../config/database';
import { initializeDatabase, seedDatabase } from '../db/init';

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Could not connect to database');
      console.log('Please ensure PostgreSQL is running and check your .env.local configuration');
      process.exit(1);
    }

    // Initialize database schema
    console.log('📋 Initializing database schema...');
    await initializeDatabase();

    // Seed with initial data
    console.log('🌱 Seeding database with initial data...');
    await seedDatabase();

    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('Database structure:');
    console.log('- classes: Contains class information');
    console.log('- students: Contains student information linked to classes');
    console.log('- investments: Contains investment records linked to students');
    console.log('- investment_categories: Contains visual categories for investments');
    console.log('- interest_rate_history: Contains historical interest rate changes');
    console.log('- users: Contains admin users for NextAuth.js authentication');
    console.log('- accounts: Contains OAuth provider accounts for NextAuth.js');
    console.log('- sessions: Contains user sessions for NextAuth.js');
    console.log('- verification_tokens: Contains verification tokens for NextAuth.js');
    console.log('');
    console.log('Initial data created:');
    console.log('- 3 classes with different settings and timezones');
    console.log('- 6 demo students across different classes');
    console.log('- Sample investment records for each student');
    console.log('- 1 default investment category (Standard)');
    console.log('- Historical interest rate changes for each class');
    console.log('- Authentication tables ready for NextAuth.js (no demo users)');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };
