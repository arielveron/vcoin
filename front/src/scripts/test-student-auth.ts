import { pool } from '../config/database';

async function testStudentAuth() {
  console.log('🔍 Testing student authentication setup...');
  
  try {
    const client = await pool.connect();
    
    // Check if password_hash column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'students' AND column_name = 'password_hash'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ password_hash column not found in students table');
      console.log('💡 You need to run: npm run setup');
      client.release();
      return false;
    }
    
    console.log('✅ password_hash column exists');
    
    // Check current students data
    const studentsCheck = await client.query(`
      SELECT id, registro, name, email, class_id, password_hash 
      FROM students 
      LIMIT 3
    `);
    
    console.log('📊 Current students:');
    studentsCheck.rows.forEach(student => {
      console.log(`   Student ${student.registro}: ${student.name} - Password set: ${!!student.password_hash}`);
    });
    
    client.release();
    
    if (studentsCheck.rows.every(s => !s.password_hash)) {
      console.log('');
      console.log('⚠️  No students have passwords set yet');
      console.log('💡 Go to Admin → Students and set passwords for students to test login');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Database error:', error);
    return false;
  }
}

testStudentAuth()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
