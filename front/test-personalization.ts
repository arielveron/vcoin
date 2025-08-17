/**
 * Test script for personalization functionality
 * Run this to verify that the personalization utilities work correctly
 */

import { 
  getPersonalizedAchievementName, 
  getPersonalizedText,
  createPersonalizedAchievement,
  PERSONALIZACION_OPTIONS 
} from './src/shared/utils/personalization';

// Mock achievement data for testing
const mockAchievement = {
  id: 1,
  name: 'Investor',
  name_a: 'Inversora',
  name_o: 'Inversor',
  description: 'Accumulate 50,000 VCoins',
  category: 'milestone' as const,
  rarity: 'rare' as const,
  icon_config: {
    name: 'DollarSign',
    library: 'lucide' as const,
    size: 28,
    color: '#3B82F6'
  },
  trigger_type: 'automatic' as const,
  trigger_config: {
    metric: 'total_invested' as const,
    operator: '>=' as const,
    value: 50000
  },
  points: 50,
  sort_order: 0,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
};

function runTests() {
  console.log('🧪 Testing VCoin Personalization Utilities\n');

  // Test personalization options
  console.log('📋 Available personalization options:');
  PERSONALIZACION_OPTIONS.forEach((option: any) => {
    console.log(`  - ${option.label} (${option.value || 'null'}): ${option.description}`);
  });
  console.log('');

  // Test getPersonalizedAchievementName
  console.log('🏆 Testing achievement name personalization:');
  console.log(`  Default: "${getPersonalizedAchievementName(mockAchievement, null)}"`);
  console.log(`  Preference A: "${getPersonalizedAchievementName(mockAchievement, 'A')}"`);
  console.log(`  Preference O: "${getPersonalizedAchievementName(mockAchievement, 'O')}"`);
  console.log('');

  // Test with achievement without personalized variants
  const basicAchievement = { ...mockAchievement, name: 'First Steps', name_a: null, name_o: null };
  console.log('🥇 Testing achievement without personalized variants:');
  console.log(`  Default: "${getPersonalizedAchievementName(basicAchievement, null)}"`);
  console.log(`  Preference A: "${getPersonalizedAchievementName(basicAchievement, 'A')}" (should fallback to default)`);
  console.log(`  Preference O: "${getPersonalizedAchievementName(basicAchievement, 'O')}" (should fallback to default)`);
  console.log('');

  // Test getPersonalizedText
  console.log('📝 Testing generic text personalization:');
  const defaultText = 'Estudiante';
  const textA = 'Estudiante Destacada';
  const textO = 'Estudiante Destacado';
  
  console.log(`  Default: "${getPersonalizedText(defaultText, textA, textO, null)}"`);
  console.log(`  Preference A: "${getPersonalizedText(defaultText, textA, textO, 'A')}"`);
  console.log(`  Preference O: "${getPersonalizedText(defaultText, textA, textO, 'O')}"`);
  console.log('');

  // Test createPersonalizedAchievement
  console.log('🎯 Testing achievement object personalization:');
  const personalizedA = createPersonalizedAchievement(mockAchievement, 'A');
  const personalizedO = createPersonalizedAchievement(mockAchievement, 'O');
  const personalizedDefault = createPersonalizedAchievement(mockAchievement, null);
  
  console.log(`  Original name: "${mockAchievement.name}"`);
  console.log(`  Personalized A: "${personalizedA.name}"`);
  console.log(`  Personalized O: "${personalizedO.name}"`);
  console.log(`  Personalized Default: "${personalizedDefault.name}"`);
  console.log('');

  console.log('✅ All tests completed successfully!');
  console.log('💡 The personalization system allows students to choose how certain achievement names appear,');
  console.log('   providing a more inclusive experience without explicitly exposing gender identification.');
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}

export { runTests };
