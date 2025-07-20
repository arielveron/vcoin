import { pool } from '@/config/database';
import { Investment, CreateInvestmentRequest, InvestmentWithStudent } from '@/types/database';

export class InvestmentRepository {
  async findAll(): Promise<Investment[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, student_id, fecha, monto, concepto, created_at, updated_at
        FROM investments 
        ORDER BY fecha DESC
      `);
      
      // Return as-is since PostgreSQL returns fecha as Date and monto as number (INTEGER)
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<Investment | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, student_id, fecha, monto, concepto, created_at, updated_at 
        FROM investments 
        WHERE id = $1
      `, [id]);
      
      // Return as-is since PostgreSQL returns fecha as Date and monto as number
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async findByStudentId(studentId: number): Promise<Investment[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, student_id, fecha, monto, concepto, created_at, updated_at
        FROM investments 
        WHERE student_id = $1
        ORDER BY fecha DESC
      `, [studentId]);
      
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findWithStudentInfo(): Promise<InvestmentWithStudent[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          i.id,
          i.student_id,
          i.fecha,
          i.monto,
          i.concepto,
          i.created_at,
          i.updated_at,
          s.name as student_name,
          s.email as student_email,
          c.name as class_name
        FROM investments i
        JOIN students s ON i.student_id = s.id
        JOIN classes c ON s.class_id = c.id
        ORDER BY i.fecha DESC
      `);
      
      // Return as-is since PostgreSQL returns fecha as Date and monto as number
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getTotalByStudentId(studentId: number): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT COALESCE(SUM(monto), 0) as total
        FROM investments 
        WHERE student_id = $1
      `, [studentId]);
      return parseFloat(result.rows[0].total);
    } finally {
      client.release();
    }
  }

  async create(data: CreateInvestmentRequest): Promise<Investment> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO investments (student_id, fecha, monto, concepto) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, student_id, fecha, monto, concepto, created_at, updated_at
      `, [data.student_id, data.fecha, data.monto, data.concepto]);
      
      // Return as-is since PostgreSQL returns fecha as Date and monto as number
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(id: number, data: Partial<CreateInvestmentRequest>): Promise<Investment | null> {
    const client = await pool.connect();
    try {
      const updates: string[] = [];
      const values: (string | number | Date | undefined)[] = [];
      let paramCount = 1;

      if (data.student_id !== undefined) {
        updates.push(`student_id = $${paramCount++}`);
        values.push(data.student_id);
      }

      if (data.fecha !== undefined) {
        updates.push(`fecha = $${paramCount++}`);
        values.push(data.fecha);
      }

      if (data.monto !== undefined) {
        updates.push(`monto = $${paramCount++}`);
        values.push(data.monto);
      }

      if (data.concepto !== undefined) {
        updates.push(`concepto = $${paramCount++}`);
        values.push(data.concepto);
      }

      if (updates.length === 0) {
        return this.findById(id);
      }

      values.push(id);
      const result = await client.query(`
        UPDATE investments 
        SET ${updates.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING id, student_id, fecha, monto, concepto, created_at, updated_at
      `, values);

      if (!result.rows[0]) return null;
      
      // Return as-is since PostgreSQL returns fecha as Date and monto as number
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM investments WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }
}
