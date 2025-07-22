import { cookies } from 'next/headers';
import { StudentSession } from '@/types/database';
import { StudentAuthService } from './student-auth-service';
import crypto from 'crypto';

const COOKIE_NAME = 'student-session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-key-change-in-production';

interface SecureSessionData {
  studentId: number;
  timestamp: number;
  signature: string;
}

export class SecureStudentSessionService {
  /**
   * Create a secure session with signature validation
   */
  static async createSession(studentSession: StudentSession): Promise<void> {
    const cookieStore = await cookies();
    
    // Create signed session data
    const sessionData: SecureSessionData = {
      studentId: studentSession.student_id,
      timestamp: Date.now(),
      signature: this.createSignature(studentSession.student_id, Date.now())
    };
    
    // Store encrypted session data
    const encryptedData = this.encryptSessionData(sessionData);
    
    cookieStore.set(COOKIE_NAME, encryptedData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });
    
    console.log('🔐 Secure session created for student:', studentSession.student_id);
  }

  /**
   * Get current student session with signature validation
   */
  static async getSession(): Promise<StudentSession | null> {
    try {
      const cookieStore = await cookies();
      const encryptedData = cookieStore.get(COOKIE_NAME)?.value;
      
      console.log('🍪 SecureStudentSessionService.getSession called:', {
        timestamp: new Date().toISOString(),
        cookieExists: !!encryptedData
      });
      
      if (!encryptedData) {
        console.log('❌ No session cookie found');
        return null;
      }

      // Decrypt and validate session data
      const sessionData = this.decryptSessionData(encryptedData);
      if (!sessionData) {
        console.log('❌ Invalid session data - destroying session');
        await this.destroySession();
        return null;
      }

      // Validate signature
      const expectedSignature = this.createSignature(sessionData.studentId, sessionData.timestamp);
      if (sessionData.signature !== expectedSignature) {
        console.log('❌ Session signature validation failed - destroying session');
        await this.destroySession();
        return null;
      }

      // Check session age (7 days max)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      if (Date.now() - sessionData.timestamp > maxAge) {
        console.log('❌ Session expired - destroying session');
        await this.destroySession();
        return null;
      }
      
      console.log('✅ Valid session found for student:', sessionData.studentId);
      
      // Get fresh student data from database
      const studentSession = await StudentAuthService.getStudentSession(sessionData.studentId);
      
      if (!studentSession) {
        console.log('❌ Student not found in database - destroying session');
        await this.destroySession();
        return null;
      }
      
      console.log('📋 Session data retrieved:', {
        student_id: studentSession.student_id,
        name: studentSession.name,
        registro: studentSession.registro,
        class_id: studentSession.class_id
      });
      
      return studentSession;
    } catch (error) {
      console.error('❌ Error in getSession:', error);
      await this.destroySession();
      return null;
    }
  }

  /**
   * Destroy student session
   */
  static async destroySession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    console.log('🗑️ Session destroyed');
  }

  /**
   * Check if there's an active student session
   */
  static async hasActiveSession(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  /**
   * Create a signature for session validation
   */
  private static createSignature(studentId: number, timestamp: number): string {
    const data = `${studentId}:${timestamp}`;
    return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
  }

  /**
   * Encrypt session data
   */
  private static encryptSessionData(data: SecureSessionData): string {
    const cipher = crypto.createCipher('aes-256-cbc', SESSION_SECRET);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt session data
   */
  private static decryptSessionData(encryptedData: string): SecureSessionData | null {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', SESSION_SECRET);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('❌ Failed to decrypt session data:', error);
      return null;
    }
  }
}
