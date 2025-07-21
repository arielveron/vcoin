import { pool } from '../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupVCoinWithAdmin() {
  console.log('🚀 Setting up VCoin database with Admin Panel...');

  try {
    const client = await pool.connect();
    
    try {
      console.log('📋 Creating VCoin database schema...');
      
      // Read and execute the main database schema
      const mainSqlPath = join(__dirname, 'init-database.sql');
      const mainSql = readFileSync(mainSqlPath, 'utf-8');
      await client.query(mainSql);
      console.log('✅ VCoin database schema created');

      console.log('🔐 Adding authentication tables...');
      
      // Add NextAuth.js tables directly here instead of reading from file
      const authSql = `
        -- NextAuth.js authentication tables
        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL,
          type VARCHAR(255) NOT NULL,
          provider VARCHAR(255) NOT NULL,
          "providerAccountId" VARCHAR(255) NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at BIGINT,
          id_token TEXT,
          scope TEXT,
          session_state TEXT,
          token_type TEXT,
          UNIQUE(provider, "providerAccountId")
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
          "userId" INTEGER NOT NULL,
          expires TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255) UNIQUE,
          "emailVerified" TIMESTAMPTZ,
          image TEXT
        );

        CREATE TABLE IF NOT EXISTS verification_tokens (
          identifier VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (identifier, token)
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts("userId");
        CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions("userId");
        CREATE INDEX IF NOT EXISTS sessions_session_token_idx ON sessions("sessionToken");
      `;

      await client.query(authSql);
      console.log('✅ Authentication tables created');

      console.log('📊 VCoin setup completed successfully!');
      console.log('');
      console.log('🎯 What was created:');
      console.log('  • VCoin database: classes, students, investments, interest_rate_history');
      console.log('  • Sample data: 3 classes, 6 students, multiple investments');
      console.log('  • Auth tables: users, accounts, sessions, verification_tokens');
      console.log('');
      console.log('🔧 Next steps:');
      console.log('  1. Configure your .env.local with Google OAuth2 credentials');
      console.log('  2. Run: npm run dev');
      console.log('  3. Visit: http://localhost:3000/admin');
      console.log('');
      console.log('📚 See ADMIN_SETUP.md for detailed configuration instructions');

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error setting up VCoin with Admin:', error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  setupVCoinWithAdmin()
    .then(() => {
      console.log('🎉 Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

export { setupVCoinWithAdmin };
