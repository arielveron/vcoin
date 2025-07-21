import { NextRequest } from 'next/server';
import { StudentSessionService } from '@/services/student-session-service';

export async function POST(request: NextRequest) {
  try {
    // Destroy the student session
    await StudentSessionService.destroySession();

    return Response.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Student logout error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
