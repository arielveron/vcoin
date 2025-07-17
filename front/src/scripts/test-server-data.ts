import { ServerDataService } from '../services/server-data-service';

async function testServerDataService() {
  console.log('🧪 Testing Server Data Service...');
  
  try {
    console.log('1. Testing getTotalInvested...');
    const total = await ServerDataService.getTotalInvested();
    console.log(`   ✅ Total invested: ${total.toLocaleString('es-AR')}`);
    
    console.log('2. Testing getInvestmentsList...');
    const investments = await ServerDataService.getInvestmentsList();
    console.log(`   ✅ Found ${investments.length} investments`);
    
    if (investments.length > 0) {
      console.log('   📊 Sample investment:', {
        fecha: investments[0].fecha,
        monto: investments[0].monto,
        concepto: investments[0].concepto.substring(0, 30) + '...'
      });
    }
    
    console.log('3. Testing getAllStudents...');
    const students = await ServerDataService.getAllStudents();
    console.log(`   ✅ Found ${students.length} students`);
    
    console.log('4. Testing getAllClasses...');
    const classes = await ServerDataService.getAllClasses();
    console.log(`   ✅ Found ${classes.length} classes`);
    
    console.log('');
    console.log('✅ All server data service tests passed!');
    console.log('🎉 Server-side data fetching is working correctly');
    
    return true;
    
  } catch (error) {
    console.error('❌ Server data service test failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testServerDataService().then(() => {
    process.exit(0);
  });
}

export { testServerDataService };
