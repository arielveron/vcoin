import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AchievementEngine } from '@/services/achievement-engine';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const studentId = parseInt(formData.get('studentId') as string);
    const achievementId = parseInt(formData.get('achievementId') as string);

    if (!studentId || !achievementId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: studentId and achievementId' 
      }, { status: 400 });
    }

    const achievementEngine = new AchievementEngine();
    const result = await achievementEngine.unlockManualAchievement(studentId, achievementId);

    if (result) {
      return NextResponse.json({ 
        success: true, 
        data: result,
        message: `Achievement "${result.name}" awarded successfully!`
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to award achievement. It may already be unlocked or not exist.' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error awarding achievement:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
