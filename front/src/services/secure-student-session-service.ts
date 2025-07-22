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
    
    // Always clear any existing session first (including legacy sessions)
    cookieStore.delete(COOKIE_NAME);
    
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
  }

  /**
   * Get current student session with signature validation
   */
  static async getSession(): Promise<StudentSession | null> {
    try {
      const cookieStore = await cookies();
      const encryptedData = cookieStore.get(COOKIE_NAME)?.value;
      
      if (!encryptedData) {
        return null;
      }

      // Decrypt and validate session data
      const sessionData = this.decryptSessionData(encryptedData);
      if (!sessionData) {
        return null;
      }

      // Validate signature
      const expectedSignature = this.createSignature(sessionData.studentId, sessionData.timestamp);
      if (sessionData.signature !== expectedSignature) {
        return null;
      }

      // Check session age (7 days max)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      if (Date.now() - sessionData.timestamp > maxAge) {
        return null;
      }
      
      // Get fresh student data from database
      const studentSession = await StudentAuthService.getStudentSession(sessionData.studentId);
      
      if (!studentSession) {
        return null;
      }
      
      return studentSession;
    } catch {
      // Cannot destroy session from page components - user will need to log in again
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
   * Check if there's an invalid session that needs clearing
   * This method only reads, doesn't modify cookies
   */
  static async hasInvalidSession(): Promise<boolean> {
    try {
      const cookieStore = await cookies();
      const encryptedData = cookieStore.get(COOKIE_NAME)?.value;
      
      if (!encryptedData) {
        return false; // No session cookie = no invalid session
      }

      // Try to decrypt and validate
      const sessionData = this.decryptSessionData(encryptedData);
      if (!sessionData) {
        return true; // Can't decrypt = invalid session
      }

      // Validate signature
      const expectedSignature = this.createSignature(sessionData.studentId, sessionData.timestamp);
      if (sessionData.signature !== expectedSignature) {
        return true; // Invalid signature = invalid session
      }

      // Check if expired
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - sessionData.timestamp > maxAge) {
        return true; // Expired = invalid session
      }

      return false; // Session is valid
    } catch {
      return true; // Any error = treat as invalid session
    }
  }

  /**
   * Check if there's an active student session
   */
  static async hasActiveSession(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session !== null;
    } catch {
      // If there's any error reading the session, treat as no active session
      return false;
    }
  }

  /**
   * Create a signature for session validation
   */
  private static createSignature(studentId: number, timestamp: number): string {
    const data = `${studentId}:${timestamp}`;
    return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
  }

  /**
   * Encrypt session data using AES-256-GCM
   */
  private static encryptSessionData(data: SecureSessionData): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(SESSION_SECRET, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt session data using AES-256-GCM
   */
  private static decryptSessionData(encryptedData: string): SecureSessionData | null {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        return null;
      }
      
      const [ivHex, authTagHex, encrypted] = parts;
      
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(SESSION_SECRET, 'salt', 32);
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }
}
