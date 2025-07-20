import { pool } from '@/config/database';
import { 
  InterestRateHistory, 
  InterestRateChange, 
  CurrentInterestRate, 
  CreateInterestRateRequest 
} from '@/types/database';

export class InterestRateHistoryRepository {
  async findAll(): Promise<InterestRateHistory[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, class_id, monthly_interest_rate, effective_date, created_at, updated_at 
        FROM interest_rate_history 
        ORDER BY class_id, effective_date DESC
      `);
      return result.rows.map(row => ({
        ...row,
        monthly_interest_rate: parseFloat(row.monthly_interest_rate)
      }));
    } finally {
      client.release();
    }
  }

  async findByClassId(classId: number): Promise<InterestRateHistory[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, class_id, monthly_interest_rate, effective_date, created_at, updated_at 
        FROM interest_rate_history 
        WHERE class_id = $1
        ORDER BY effective_date DESC, created_at DESC
      `, [classId]);
      return result.rows.map(row => ({
        ...row,
        monthly_interest_rate: parseFloat(row.monthly_interest_rate)
      }));
    } finally {
      client.release();
    }
  }

  async getCurrentRate(classId: number): Promise<CurrentInterestRate | null> {
    const client = await pool.connect();
    try {
      // Get the latest rate from interest_rate_history table instead of current_interest_rates
      const result = await client.query(`
        SELECT class_id, monthly_interest_rate, effective_date, created_at
        FROM interest_rate_history 
        WHERE class_id = $1
        ORDER BY effective_date DESC, created_at DESC
        LIMIT 1
      `, [classId]);
      const row = result.rows[0];
      return row ? {
        ...row,
        monthly_interest_rate: parseFloat(row.monthly_interest_rate)
      } : null;
    } finally {
      client.release();
    }
  }

  async getRateForDate(classId: number, date: Date): Promise<number> {
    const client = await pool.connect();
    try {
      // Get the most recent rate that was effective on or before the given date
      const result = await client.query(`
        SELECT monthly_interest_rate
        FROM interest_rate_history 
        WHERE class_id = $1 AND effective_date <= $2
        ORDER BY effective_date DESC, created_at DESC
        LIMIT 1
      `, [classId, date]);
      
      if (result.rows[0]) {
        return parseFloat(result.rows[0].monthly_interest_rate);
      }
      
      // Fallback: get the earliest rate for the class
      const fallbackResult = await client.query(`
        SELECT monthly_interest_rate
        FROM interest_rate_history 
        WHERE class_id = $1
        ORDER BY effective_date ASC, created_at ASC
        LIMIT 1
      `, [classId]);
      
      return fallbackResult.rows[0] ? parseFloat(fallbackResult.rows[0].monthly_interest_rate) : 0.01;
    } finally {
      client.release();
    }
  }

  async getRateChanges(classId?: number): Promise<InterestRateChange[]> {
    const client = await pool.connect();
    try {
      const whereClause = classId ? 'WHERE class_id = $1' : '';
      const params = classId ? [classId] : [];
      
      const result = await client.query(`
        SELECT 
          id,
          class_id,
          class_name,
          monthly_interest_rate,
          effective_date,
          previous_rate,
          rate_direction,
          created_at,
          updated_at
        FROM interest_rate_changes 
        ${whereClause}
        ORDER BY class_id, effective_date DESC
      `, params);
      
      return result.rows.map(row => ({
        ...row,
        monthly_interest_rate: parseFloat(row.monthly_interest_rate),
        previous_rate: row.previous_rate ? parseFloat(row.previous_rate) : undefined
      }));
    } finally {
      client.release();
    }
  }

  async getLatestRateChange(classId: number): Promise<InterestRateChange | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          id,
          class_id,
          class_name,
          monthly_interest_rate,
          effective_date,
          previous_rate,
          rate_direction,
          created_at,
          updated_at
        FROM interest_rate_changes 
        WHERE class_id = $1
        ORDER BY effective_date DESC, created_at DESC
        LIMIT 1
      `, [classId]);
      
      const row = result.rows[0];
      return row ? {
        ...row,
        monthly_interest_rate: parseFloat(row.monthly_interest_rate),
        previous_rate: row.previous_rate ? parseFloat(row.previous_rate) : undefined
      } : null;
    } finally {
      client.release();
    }
  }

  async create(data: CreateInterestRateRequest): Promise<InterestRateHistory> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO interest_rate_history (class_id, monthly_interest_rate, effective_date) 
        VALUES ($1, $2, $3) 
        RETURNING id, class_id, monthly_interest_rate, effective_date, created_at, updated_at
      `, [data.class_id, data.monthly_interest_rate, data.effective_date]);
      
      const row = result.rows[0];
      return {
        ...row,
        monthly_interest_rate: parseFloat(row.monthly_interest_rate)
      };
    } finally {
      client.release();
    }
  }

  async update(id: number, data: Partial<CreateInterestRateRequest>): Promise<InterestRateHistory | null> {
    const client = await pool.connect();
    try {
      const updates: string[] = [];
      const values: (string | number | Date | undefined)[] = [];
      let paramCount = 1;

      if (data.monthly_interest_rate !== undefined) {
        updates.push(`monthly_interest_rate = $${paramCount++}`);
        values.push(data.monthly_interest_rate);
      }

      if (data.effective_date !== undefined) {
        updates.push(`effective_date = $${paramCount++}`);
        values.push(data.effective_date);
      }

      if (updates.length === 0) {
        return this.findById(id);
      }

      values.push(id);
      const result = await client.query(`
        UPDATE interest_rate_history 
        SET ${updates.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING id, class_id, monthly_interest_rate, effective_date, created_at, updated_at
      `, values);

      const row = result.rows[0];
      return row ? {
        ...row,
        monthly_interest_rate: parseFloat(row.monthly_interest_rate)
      } : null;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM interest_rate_history WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  private async findById(id: number): Promise<InterestRateHistory | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, class_id, monthly_interest_rate, effective_date, created_at, updated_at 
        FROM interest_rate_history 
        WHERE id = $1
      `, [id]);
      
      const row = result.rows[0];
      return row ? {
        ...row,
        monthly_interest_rate: parseFloat(row.monthly_interest_rate)
      } : null;
    } finally {
      client.release();
    }
  }
}
