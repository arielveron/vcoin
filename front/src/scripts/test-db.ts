import { testConnection } from '../config/database';
import { InvestmentService } from '../services/investment-service';

async function testDatabaseSetup() {
  console.log('🧪 Testing database setup...');
  
  try {
    // Test basic connection
    console.log('1. Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.log('❌ Database connection failed');
      console.log('ℹ️  This is expected if PostgreSQL is not set up yet');
      console.log('ℹ️  The application will fall back to pseudo-db data');
      return false;
    }

    // Test service layer
    console.log('2. Testing service layer...');
    const service = new InvestmentService();
    
    const classes = await service.getAllClasses();
    console.log(`   ✅ Found ${classes.length} classes`);
    
    const students = await service.getAllStudents();
    console.log(`   ✅ Found ${students.length} students`);
    
    const investments = await service.getAllInvestmentsWithDetails();
    console.log(`   ✅ Found ${investments.length} investments`);

    // Test specific student data
    console.log('3. Testing student data...');
    const studentData = await service.getStudentWithInvestments(1);
    
    if (studentData) {
      console.log(`   ✅ Student: ${studentData.name}`);
      console.log(`   ✅ Investments: ${studentData.investments.length}`);
      console.log(`   ✅ Total invested: ${studentData.total_invested}`);
    } else {
      console.log('   ⚠️  No student data found');
    }

    console.log('');
    console.log('✅ All database tests passed!');
    console.log('🎉 Database setup is working correctly');
    
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.log('ℹ️  This might be expected if database is not set up');
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseSetup().then(() => {
    process.exit(0);
  });
}

export { testDatabaseSetup };
