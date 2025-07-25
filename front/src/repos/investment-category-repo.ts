import { pool } from '@/config/database';
import { InvestmentCategory, CreateInvestmentCategoryRequest } from '@/types/database';

export class InvestmentCategoryRepository {
  async findAll(activeOnly = false): Promise<InvestmentCategory[]> {
    const client = await pool.connect();
    try {
      const whereClause = activeOnly ? 'WHERE is_active = true' : '';
      const result = await client.query(`
        SELECT 
          id, name, level, text_style, icon_config, 
          is_active, sort_order, created_at, updated_at
        FROM investment_categories 
        ${whereClause}
        ORDER BY sort_order ASC, name ASC
      `);

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        level: row.level,
        text_style: row.text_style,
        icon_config: row.icon_config,
        is_active: row.is_active,
        sort_order: row.sort_order,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<InvestmentCategory | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          id, name, level, text_style, icon_config, 
          is_active, sort_order, created_at, updated_at
        FROM investment_categories 
        WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        level: row.level,
        text_style: row.text_style,
        icon_config: row.icon_config,
        is_active: row.is_active,
        sort_order: row.sort_order,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } finally {
      client.release();
    }
  }

  async create(data: CreateInvestmentCategoryRequest): Promise<InvestmentCategory> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO investment_categories (name, level, text_style, icon_config, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, level, text_style, icon_config, is_active, sort_order, created_at, updated_at
      `, [
        data.name,
        data.level,
        JSON.stringify(data.text_style || {}),
        data.icon_config ? JSON.stringify(data.icon_config) : null,
        data.is_active ?? true,
        data.sort_order ?? 0
      ]);

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        level: row.level,
        text_style: row.text_style,
        icon_config: row.icon_config,
        is_active: row.is_active,
        sort_order: row.sort_order,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } finally {
      client.release();
    }
  }

  async update(id: number, data: Partial<CreateInvestmentCategoryRequest>): Promise<InvestmentCategory | null> {
    const client = await pool.connect();
    try {
      const updates: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name);
      }
      if (data.level !== undefined) {
        updates.push(`level = $${paramIndex++}`);
        values.push(data.level);
      }
      if (data.text_style !== undefined) {
        updates.push(`text_style = $${paramIndex++}`);
        values.push(JSON.stringify(data.text_style));
      }
      if (data.icon_config !== undefined) {
        updates.push(`icon_config = $${paramIndex++}`);
        values.push(data.icon_config ? JSON.stringify(data.icon_config) : null);
      }
      if (data.is_active !== undefined) {
        updates.push(`is_active = $${paramIndex++}`);
        values.push(data.is_active);
      }
      if (data.sort_order !== undefined) {
        updates.push(`sort_order = $${paramIndex++}`);
        values.push(data.sort_order);
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(`
        UPDATE investment_categories 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, name, level, text_style, icon_config, is_active, sort_order, created_at, updated_at
      `, values);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        level: row.level,
        text_style: row.text_style,
        icon_config: row.icon_config,
        is_active: row.is_active,
        sort_order: row.sort_order,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      // Check if category is in use
      const usageCheck = await client.query(`
        SELECT COUNT(*) as count FROM investments WHERE category_id = $1
      `, [id]);

      if (parseInt(usageCheck.rows[0].count) > 0) {
        throw new Error('Cannot delete category that is in use by investments');
      }

      const result = await client.query(`
        DELETE FROM investment_categories WHERE id = $1
      `, [id]);

      return result.rowCount !== null && result.rowCount > 0;
    } finally {
      client.release();
    }
  }
}
