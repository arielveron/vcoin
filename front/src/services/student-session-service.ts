import { cookies } from 'next/headers';
import { StudentSession } from '@/types/database';
import { StudentAuthService } from './student-auth-service';

const COOKIE_NAME = 'student-session';

export class StudentSessionService {
  /**
   * Create a new student session
   */
  static async createSession(studentSession: StudentSession): Promise<void> {
    const cookieStore = await cookies();
    
    // Store just the student ID in the cookie for simplicity
    cookieStore.set(COOKIE_NAME, studentSession.student_id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });
  }

  /**
   * Get current student session
   */
  static async getSession(): Promise<StudentSession | null> {
    try {
      const cookieStore = await cookies();
      const studentIdStr = cookieStore.get(COOKIE_NAME)?.value;
      
      if (!studentIdStr) {
        return null;
      }

      const studentId = parseInt(studentIdStr);
      if (isNaN(studentId)) {
        return null;
      }
      
      // Get fresh student data from database
      const studentSession = await StudentAuthService.getStudentSession(studentId);
      return studentSession;
    } catch (error) {
      // Invalid session or student not found
      return null;
    }
  }

  /**
   * Destroy student session
   */
  static async destroySession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  }

  /**
   * Check if there's an active student session
   */
  static async hasActiveSession(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }
}
