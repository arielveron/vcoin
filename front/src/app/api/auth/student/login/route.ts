import { NextRequest } from 'next/server';
import { StudentAuthService } from '@/services/student-auth-service';
import { StudentSessionService } from '@/services/student-session-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { class_id, registro, password } = body;

    // Validate input
    if (!class_id || !registro || !password) {
      return Response.json(
        { success: false, error: 'Class ID, registry number, and password are required' },
        { status: 400 }
      );
    }

    // Authenticate student
    const studentSession = await StudentAuthService.authenticateStudent({
      class_id: parseInt(class_id),
      registro: parseInt(registro),
      password
    });

    if (!studentSession) {
      return Response.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    await StudentSessionService.createSession(studentSession);

    return Response.json({
      success: true,
      student: {
        name: studentSession.name,
        class_name: studentSession.class_name
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
