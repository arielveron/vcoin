import { pool } from '../config/database';
import { Student, CreateStudentRequest, StudentWithInvestments } from '../types/database';

export class StudentRepository {
  async findAll(): Promise<Student[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT s.id, s.name, s.email, s.class_id, s.created_at, s.updated_at
        FROM students s
        ORDER BY s.name
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<Student | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, name, email, class_id, created_at, updated_at 
        FROM students 
        WHERE id = $1
      `, [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async findByClassId(classId: number): Promise<Student[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, name, email, class_id, created_at, updated_at 
        FROM students 
        WHERE class_id = $1
        ORDER BY name
      `, [classId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findWithInvestments(id: number): Promise<StudentWithInvestments | null> {
    const client = await pool.connect();
    try {
      const studentResult = await client.query(`
        SELECT id, registro, name, email, class_id, created_at, updated_at 
        FROM students 
        WHERE id = $1
      `, [id]);

      if (studentResult.rows.length === 0) {
        return null;
      }

      const student = studentResult.rows[0];

      const investmentsResult = await client.query(`
        SELECT id, student_id, fecha, monto, concepto, created_at, updated_at
        FROM investments 
        WHERE student_id = $1
        ORDER BY fecha DESC
      `, [id]);

      const totalResult = await client.query(`
        SELECT COALESCE(SUM(monto), 0) as total_invested
        FROM investments 
        WHERE student_id = $1
      `, [id]);

      return {
        ...student,
        investments: investmentsResult.rows, // Keep as-is since fecha is Date and monto is number
        total_invested: parseFloat(totalResult.rows[0].total_invested)
      };
    } finally {
      client.release();
    }
  }

  async create(data: CreateStudentRequest): Promise<Student> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO students (name, registro, email, class_id) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, registro, name, email, class_id, created_at, updated_at
      `, [data.name, data.registro, data.email, data.class_id]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(id: number, data: Partial<CreateStudentRequest>): Promise<Student | null> {
    const client = await pool.connect();
    try {
      const updates: string[] = [];
      const values: (string | number | undefined)[] = [];
      let paramCount = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(data.name);
      }

      if (data.email !== undefined) {
        updates.push(`email = $${paramCount++}`);
        values.push(data.email);
      }

      if (data.registro !== undefined) {
        updates.push(`registro = $${paramCount++}`);
        values.push(data.registro);
      }

      if (data.class_id !== undefined) {
        updates.push(`class_id = $${paramCount++}`);
        values.push(data.class_id);
      }

      if (updates.length === 0) {
        return this.findById(id);
      }

      values.push(id);
      const result = await client.query(`
        UPDATE students 
        SET ${updates.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING id, registro, name, email, class_id, created_at, updated_at
      `, values);

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM students WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }
}
