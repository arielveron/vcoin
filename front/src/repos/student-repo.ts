import { pool } from '../config/database';
import { Student, CreateStudentRequest, StudentWithInvestments } from '../types/database';

export class StudentRepository {
  async findAll(): Promise<Student[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT s.id, s.registro, s.name, s.email, s.class_id, s.password_hash, s.created_at, s.updated_at
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
        SELECT id, registro, name, email, class_id, password_hash, created_at, updated_at 
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
        SELECT id, registro, name, email, class_id, password_hash, created_at, updated_at 
        FROM students 
        WHERE class_id = $1
        ORDER BY name
      `, [classId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findByIds(ids: number[]): Promise<Student[]> {
    if (ids.length === 0) return [];
    
    const client = await pool.connect();
    try {
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
      const result = await client.query(`
        SELECT id, registro, name, email, class_id, password_hash, created_at, updated_at 
        FROM students 
        WHERE id IN (${placeholders})
        ORDER BY name
      `, ids);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findWithInvestments(id: number): Promise<StudentWithInvestments | null> {
    const client = await pool.connect();
    try {
      const studentResult = await client.query(`
        SELECT id, registro, name, email, class_id, password_hash, created_at, updated_at 
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
        RETURNING id, registro, name, email, class_id, password_hash, created_at, updated_at
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
        RETURNING id, registro, name, email, class_id, password_hash, created_at, updated_at
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

  /**
   * Get paginated students with optional class filter and sorting
   */
  async findPaginated(
    page: number, 
    limit: number, 
    filters?: { classId?: number; searchText?: string; sortField?: string; sortDirection?: string }
  ): Promise<{ students: Student[]; total: number }> {
    const client = await pool.connect();
    try {
      const offset = (page - 1) * limit;
      const whereConditions: string[] = [];
      const params: (string | number)[] = [];
      let paramIndex = 1;

      // Build WHERE conditions
      if (filters?.classId) {
        whereConditions.push(`s.class_id = $${paramIndex++}`);
        params.push(filters.classId);
      }

      if (filters?.searchText && filters.searchText.trim()) {
        whereConditions.push(`(
          s.name ILIKE $${paramIndex} OR 
          s.registro::text ILIKE $${paramIndex}
        )`);
        params.push(`%${filters.searchText.trim()}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? 
        `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Build ORDER BY clause with support for different sort fields
      let orderByClause = 'ORDER BY s.name'; // Default sort
      
      if (filters?.sortField && filters?.sortDirection) {
        const direction = filters.sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        
        switch (filters.sortField) {
          case 'name':
            orderByClause = `ORDER BY s.name ${direction}`;
            break;
          case 'email':
            orderByClause = `ORDER BY s.email ${direction}`;
            break;
          case 'registro':
            orderByClause = `ORDER BY s.registro ${direction}`;
            break;
          case 'class_name':
            // For class name sorting, we need to join with classes table
            orderByClause = `ORDER BY (SELECT c.name FROM classes c WHERE c.id = s.class_id) ${direction}`;
            break;
          case 'created_at':
            orderByClause = `ORDER BY s.created_at ${direction}`;
            break;
          case 'investment_count':
            // For investment count sorting, we need a subquery
            orderByClause = `ORDER BY (
              SELECT COUNT(*) 
              FROM investments i 
              WHERE i.student_id = s.id
            ) ${direction}`;
            break;
          default:
            // Fallback to name sorting for unknown fields
            orderByClause = `ORDER BY s.name ${direction}`;
            break;
        }
      }
      
      // Get total count first
      const countQuery = `
        SELECT COUNT(*) as total
        FROM students s
        ${whereClause}
      `;
      
      const countResult = await client.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total, 10);

      // Get paginated results
      const dataQuery = `
        SELECT s.id, s.registro, s.name, s.email, s.class_id, s.password_hash, s.created_at, s.updated_at
        FROM students s
        ${whereClause}
        ${orderByClause}
        LIMIT $${paramIndex++} OFFSET $${paramIndex}
      `;
      
      const dataParams = [...params, limit, offset];
      const dataResult = await client.query(dataQuery, dataParams);

      return {
        students: dataResult.rows,
        total
      };
    } finally {
      client.release();
    }
  }

  /**
   * Get total count of students with optional class filter
   */
  async getCount(classId?: number): Promise<number> {
    const client = await pool.connect();
    try {
      const whereClause = classId ? 'WHERE class_id = $1' : '';
      const params = classId ? [classId] : [];
      
      const result = await client.query(`
        SELECT COUNT(*) as total
        FROM students
        ${whereClause}
      `, params);
      
      return parseInt(result.rows[0].total, 10);
    } finally {
      client.release();
    }
  }
}
