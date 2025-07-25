import { pool } from '@/config/database';
import { Investment, CreateInvestmentRequest, InvestmentWithStudent } from '@/types/database';

export class InvestmentRepository {
  async findAll(): Promise<Investment[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, student_id, fecha, monto, concepto, category_id, created_at, updated_at
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
        SELECT id, student_id, fecha, monto, concepto, category_id, created_at, updated_at 
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
        SELECT id, student_id, fecha, monto, concepto, category_id, created_at, updated_at
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
          i.category_id,
          i.created_at,
          i.updated_at,
          s.name as student_name,
          s.email as student_email,
          c.name as class_name,
          ic.id as category_id_full,
          ic.name as category_name,
          ic.level as category_level,
          ic.text_style as category_text_style,
          ic.icon_config as category_icon_config,
          ic.is_active as category_is_active,
          ic.sort_order as category_sort_order,
          ic.created_at as category_created_at,
          ic.updated_at as category_updated_at
        FROM investments i
        JOIN students s ON i.student_id = s.id
        JOIN classes c ON s.class_id = c.id
        LEFT JOIN investment_categories ic ON i.category_id = ic.id
        ORDER BY i.fecha DESC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        student_id: row.student_id,
        fecha: row.fecha,
        monto: row.monto,
        concepto: row.concepto,
        category_id: row.category_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        student_name: row.student_name,
        student_email: row.student_email,
        class_name: row.class_name,
        category: row.category_id_full ? {
          id: row.category_id_full,
          name: row.category_name,
          level: row.category_level,
          text_style: row.category_text_style,
          icon_config: row.category_icon_config,
          is_active: row.category_is_active,
          sort_order: row.category_sort_order,
          created_at: row.category_created_at,
          updated_at: row.category_updated_at
        } : null
      }));
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

  async getTotalInvestmentAmount(): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT COALESCE(SUM(monto), 0) as total
        FROM investments
      `);
      return parseFloat(result.rows[0].total);
    } finally {
      client.release();
    }
  }

  async create(data: CreateInvestmentRequest): Promise<Investment> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO investments (student_id, fecha, monto, concepto, category_id) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, student_id, fecha, monto, concepto, category_id, created_at, updated_at
      `, [data.student_id, data.fecha, data.monto, data.concepto, data.category_id]);
      
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

      if (data.category_id !== undefined) {
        updates.push(`category_id = $${paramCount++}`);
        values.push(data.category_id);
      }

      if (updates.length === 0) {
        return this.findById(id);
      }

      values.push(id);
      const result = await client.query(`
        UPDATE investments 
        SET ${updates.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING id, student_id, fecha, monto, concepto, category_id, created_at, updated_at
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
