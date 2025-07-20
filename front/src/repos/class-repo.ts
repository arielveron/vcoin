import { pool } from '@/config/database';
import { Class, CreateClassRequest } from '@/types/database';

export class ClassRepository {
  async findAll(): Promise<Class[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, name, description, end_date, timezone, created_at, updated_at 
        FROM classes 
        ORDER BY name
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<Class | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, name, description, end_date, timezone, created_at, updated_at 
        FROM classes 
        WHERE id = $1
      `, [id]);
      const row = result.rows[0];
      return row || null;
    } finally {
      client.release();
    }
  }

  async create(data: CreateClassRequest): Promise<Class> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO classes (name, description, end_date, timezone) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, description, end_date, timezone, created_at, updated_at
      `, [data.name, data.description, data.end_date, data.timezone]);
      const row = result.rows[0];
      return row;
    } finally {
      client.release();
    }
  }

  async update(id: number, data: Partial<CreateClassRequest>): Promise<Class | null> {
    const client = await pool.connect();
    try {
      const updates: string[] = [];
      const values: (string | number | undefined)[] = [];
      let paramCount = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(data.name);
      }

      if (data.description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(data.description);
      }

      if (updates.length === 0) {
        return this.findById(id);
      }

      values.push(id);
      const result = await client.query(`
        UPDATE classes 
        SET ${updates.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING id, name, description, end_date, timezone, created_at, updated_at
      `, values);

      const row = result.rows[0];
      return row || null;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM classes WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }
}
