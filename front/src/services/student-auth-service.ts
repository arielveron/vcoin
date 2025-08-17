import bcrypt from 'bcrypt';
import { pool } from '@/config/database';
import { StudentLoginRequest, StudentSession, StudentPasswordChangeRequest, StudentProfileUpdateRequest } from '@/types/database';

export class StudentAuthService {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Authenticate a student using class_id, registro, and password
   */
  static async authenticateStudent(credentials: StudentLoginRequest): Promise<StudentSession | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT s.id, s.registro, s.name, s.email, s.class_id, s.password_hash, c.name as class_name
        FROM students s
        JOIN classes c ON s.class_id = c.id
        WHERE s.class_id = $1 AND s.registro = $2
      `, [credentials.class_id, credentials.registro]);

      const student = result.rows[0];
      if (!student || !student.password_hash) {
        return null; // Student not found or no password set
      }

      const isPasswordValid = await bcrypt.compare(credentials.password, student.password_hash);
      if (!isPasswordValid) {
        return null; // Invalid password
      }

      return {
        student_id: student.id,
        registro: student.registro,
        name: student.name,
        email: student.email,
        class_id: student.class_id,
        class_name: student.class_name
      };
    } finally {
      client.release();
    }
  }

  /**
   * Hash a password for storage
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Set password for a student (used by admin)
   */
  static async setStudentPassword(studentId: number, password: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const hashedPassword = await this.hashPassword(password);
      const result = await client.query(`
        UPDATE students 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [hashedPassword, studentId]);

      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Change student password (used by student in profile)
   */
  static async changeStudentPassword(studentId: number, request: StudentPasswordChangeRequest): Promise<{ success: boolean; error?: string }> {
    const client = await pool.connect();
    try {
      // First verify current password
      const result = await client.query(`
        SELECT password_hash FROM students WHERE id = $1
      `, [studentId]);

      const student = result.rows[0];
      if (!student || !student.password_hash) {
        return { success: false, error: 'Student not found or no password set' };
      }

      const isCurrentPasswordValid = await bcrypt.compare(request.current_password, student.password_hash);
      if (!isCurrentPasswordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(request.new_password);

      // Update password
      const updateResult = await client.query(`
        UPDATE students 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [hashedNewPassword, studentId]);

      return { success: updateResult.rowCount !== null && updateResult.rowCount > 0 };
    } finally {
      client.release();
    }
  }

  /**
   * Update student profile (email and/or password)
   */
  static async updateStudentProfile(studentId: number, request: StudentProfileUpdateRequest): Promise<{ success: boolean; error?: string }> {
    const client = await pool.connect();
    try {
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      // If updating password, verify current password first
      if (request.password && request.current_password) {
        const passwordCheck = await client.query(`
          SELECT password_hash FROM students WHERE id = $1
        `, [studentId]);

        const student = passwordCheck.rows[0];
        if (!student || !student.password_hash) {
          return { success: false, error: 'Student not found or no password set' };
        }

        const isCurrentPasswordValid = await bcrypt.compare(request.current_password, student.password_hash);
        if (!isCurrentPasswordValid) {
          return { success: false, error: 'Current password is incorrect' };
        }

        const hashedNewPassword = await this.hashPassword(request.password);
        updates.push(`password_hash = $${paramCount++}`);
        values.push(hashedNewPassword);
      }

      // Update email if provided
      if (request.email !== undefined) {
        updates.push(`email = $${paramCount++}`);
        values.push(request.email);
      }

      // Update personalization if provided
      if (request.personalizacion !== undefined) {
        updates.push(`personalizacion = $${paramCount++}`);
        values.push(request.personalizacion);
      }

      if (updates.length === 0) {
        return { success: false, error: 'No updates provided' };
      }

      // Add updated_at
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Add student ID for WHERE clause
      values.push(studentId);
      
      const updateResult = await client.query(`
        UPDATE students 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
      `, values);

      return { success: updateResult.rowCount !== null && updateResult.rowCount > 0 };
    } finally {
      client.release();
    }
  }

  /**
   * Get student session data by ID
   */
  static async getStudentSession(studentId: number): Promise<StudentSession | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT s.id, s.registro, s.name, s.email, s.class_id, s.personalizacion, c.name as class_name
        FROM students s
        JOIN classes c ON s.class_id = c.id
        WHERE s.id = $1
      `, [studentId]);

      const student = result.rows[0];
      if (!student) {
        return null;
      }

      return {
        student_id: student.id,
        registro: student.registro,
        name: student.name,
        email: student.email,
        class_id: student.class_id,
        class_name: student.class_name,
        personalizacion: student.personalizacion
      };
    } finally {
      client.release();
    }
  }

  /**
   * Check if student has password set
   */
  static async hasPassword(studentId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT password_hash FROM students WHERE id = $1
      `, [studentId]);

      const student = result.rows[0];
      return !!(student && student.password_hash);
    } finally {
      client.release();
    }
  }
}
