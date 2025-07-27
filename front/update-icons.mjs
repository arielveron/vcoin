import { pool } from './src/config/database.ts';
import fs from 'fs';
import path from 'path';

async function updateAchievementIcons() {
  console.log('🔧 Updating achievement icons...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(path.join(process.cwd(), 'update-achievement-icons.sql'), 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    const client = await pool.connect();
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        const result = await client.query(statement.trim());
        if (result.rows) {
          console.log('✅ Result:', result.rowCount, 'rows affected');
          if (result.rows.length > 0) {
            console.log('   Updated achievements:', result.rows);
          }
        }
      }
    }
    
    client.release();
    console.log('🎉 Achievement icons updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating achievement icons:', error);
  } finally {
    await pool.end();
  }
}

updateAchievementIcons();
