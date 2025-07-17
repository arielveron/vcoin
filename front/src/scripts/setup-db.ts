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
    console.log('');
    console.log('Initial data created:');
    console.log('- Default class: "Programación 1"');
    console.log('- Demo student: "Estudiante Demo"');
    console.log('- 7 investment records migrated from pseudo-db');

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
