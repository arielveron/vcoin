import { pool } from '../config/database';
import { Group, GroupWithClass, GroupWithStudents, GroupWithDetails, CreateGroupRequest, Student } from '../types/database';

export class GroupRepository {
  async findAll(): Promise<Group[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, group_number, name, class_id, is_enabled,
               calculated_average_vcoin_amount, calculated_average_achievement_points,
               calculated_at, calculation_status, created_at, updated_at
        FROM groups
        ORDER BY class_id, group_number
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<Group | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, group_number, name, class_id, is_enabled,
               calculated_average_vcoin_amount, calculated_average_achievement_points,
               calculated_at, calculation_status, created_at, updated_at
        FROM groups 
        WHERE id = $1
      `, [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async findByClassId(classId: number): Promise<Group[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, group_number, name, class_id, is_enabled,
               calculated_average_vcoin_amount, calculated_average_achievement_points,
               calculated_at, calculation_status, created_at, updated_at
        FROM groups 
        WHERE class_id = $1
        ORDER BY group_number
      `, [classId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findWithClass(): Promise<GroupWithClass[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT g.id, g.group_number, g.name, g.class_id, g.is_enabled,
               g.calculated_average_vcoin_amount, g.calculated_average_achievement_points,
               g.calculated_at, g.calculation_status, g.created_at, g.updated_at,
               c.name as class_name
        FROM groups g
        JOIN classes c ON g.class_id = c.id
        ORDER BY c.name, g.group_number
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findWithStudents(groupId: number): Promise<GroupWithStudents | null> {
    const client = await pool.connect();
    try {
      // Get group details
      const groupResult = await client.query(`
        SELECT id, group_number, name, class_id, is_enabled,
               calculated_average_vcoin_amount, calculated_average_achievement_points,
               calculated_at, calculation_status, created_at, updated_at
        FROM groups 
        WHERE id = $1
      `, [groupId]);

      if (groupResult.rows.length === 0) {
        return null;
      }

      const group = groupResult.rows[0];

      // Get students in the group
      const studentsResult = await client.query(`
        SELECT id, registro, name, email, class_id, group_id, password_hash, 
               personalizacion, created_at, updated_at
        FROM students 
        WHERE group_id = $1
        ORDER BY name
      `, [groupId]);

      return {
        ...group,
        students: studentsResult.rows,
        student_count: studentsResult.rows.length
      };
    } finally {
      client.release();
    }
  }

  async findWithDetails(): Promise<GroupWithDetails[]> {
    const client = await pool.connect();
    try {
      // Get all groups with class names
      const groupsResult = await client.query(`
        SELECT g.id, g.group_number, g.name, g.class_id, g.is_enabled,
               g.calculated_average_vcoin_amount, g.calculated_average_achievement_points,
               g.calculated_at, g.calculation_status, g.created_at, g.updated_at,
               c.name as class_name
        FROM groups g
        JOIN classes c ON g.class_id = c.id
        ORDER BY c.name, g.group_number
      `);

      if (groupsResult.rows.length === 0) {
        return [];
      }

      // Get all students for these groups
      const groupIds = groupsResult.rows.map(g => g.id);
      const studentsResult = await client.query(`
        SELECT id, registro, name, email, class_id, group_id, password_hash,
               personalizacion, created_at, updated_at
        FROM students 
        WHERE group_id = ANY($1)
        ORDER BY group_id, name
      `, [groupIds]);

      // Group students by group_id
      const studentsByGroup = new Map<number, Student[]>();
      for (const student of studentsResult.rows) {
        if (!studentsByGroup.has(student.group_id)) {
          studentsByGroup.set(student.group_id, []);
        }
        studentsByGroup.get(student.group_id)!.push(student);
      }

      // Combine groups with their students
      return groupsResult.rows.map(group => ({
        ...group,
        students: studentsByGroup.get(group.id) || [],
        student_count: studentsByGroup.get(group.id)?.length || 0
      }));
    } finally {
      client.release();
    }
  }

  async findEnabledByClassId(classId: number): Promise<Group[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, group_number, name, class_id, is_enabled,
               calculated_average_vcoin_amount, calculated_average_achievement_points,
               calculated_at, calculation_status, created_at, updated_at
        FROM groups 
        WHERE class_id = $1 AND is_enabled = true
        ORDER BY group_number
      `, [classId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findEnabledGroups(): Promise<Group[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, group_number, name, class_id, is_enabled,
               calculated_average_vcoin_amount, calculated_average_achievement_points,
               calculated_at, calculation_status, created_at, updated_at
        FROM groups 
        WHERE is_enabled = true
        ORDER BY class_id, group_number
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getEnabledCount(classId?: number): Promise<number> {
    const client = await pool.connect();
    try {
      const query = classId 
        ? 'SELECT COUNT(*) FROM groups WHERE is_enabled = true AND class_id = $1'
        : 'SELECT COUNT(*) FROM groups WHERE is_enabled = true';
      
      const params = classId ? [classId] : [];
      const result = await client.query(query, params);
      return parseInt(result.rows[0].count);
    } finally {
      client.release();
    }
  }

  async create(data: CreateGroupRequest): Promise<Group> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO groups (group_number, name, class_id, is_enabled)
        VALUES ($1, $2, $3, $4)
        RETURNING id, group_number, name, class_id, is_enabled,
                  calculated_average_vcoin_amount, calculated_average_achievement_points,
                  calculated_at, calculation_status, created_at, updated_at
      `, [
        data.group_number,
        data.name,
        data.class_id,
        data.is_enabled ?? true
      ]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(id: number, data: Partial<CreateGroupRequest>): Promise<Group | null> {
    const client = await pool.connect();
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (data.group_number !== undefined) {
        updates.push(`group_number = $${paramCount++}`);
        values.push(data.group_number);
      }
      if (data.name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(data.name);
      }
      if (data.class_id !== undefined) {
        updates.push(`class_id = $${paramCount++}`);
        values.push(data.class_id);
      }
      if (data.is_enabled !== undefined) {
        updates.push(`is_enabled = $${paramCount++}`);
        values.push(data.is_enabled);
      }

      if (updates.length === 0) {
        return this.findById(id);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(`
        UPDATE groups 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, group_number, name, class_id, is_enabled,
                  calculated_average_vcoin_amount, calculated_average_achievement_points,
                  calculated_at, calculation_status, created_at, updated_at
      `, values);

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async updateEnabledStatus(id: number, isEnabled: boolean): Promise<Group | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE groups 
        SET is_enabled = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, group_number, name, class_id, is_enabled,
                  calculated_average_vcoin_amount, calculated_average_achievement_points,
                  calculated_at, calculation_status, created_at, updated_at
      `, [isEnabled, id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async updateCalculation(
    id: number, 
    vCoinAmount: number,
    achievementPoints: number,
    status: 'completed' | 'error' = 'completed'
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE groups 
        SET calculated_average_vcoin_amount = $1,
            calculated_average_achievement_points = $2,
            calculated_at = NOW(),
            calculation_status = $3,
            updated_at = NOW()
        WHERE id = $4
      `, [vCoinAmount, achievementPoints, status, id]);
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      // First, set group_id to NULL for all students in this group
      await client.query(`
        UPDATE students 
        SET group_id = NULL 
        WHERE group_id = $1
      `, [id]);

      // Then delete the group
      const result = await client.query(`
        DELETE FROM groups 
        WHERE id = $1
      `, [id]);

      return (result.rowCount ?? 0) > 0;
    } finally {
      client.release();
    }
  }

  async checkGroupNumberExists(classId: number, groupNumber: number, excludeId?: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const query = excludeId 
        ? 'SELECT COUNT(*) FROM groups WHERE class_id = $1 AND group_number = $2 AND id != $3'
        : 'SELECT COUNT(*) FROM groups WHERE class_id = $1 AND group_number = $2';
      
      const params = excludeId ? [classId, groupNumber, excludeId] : [classId, groupNumber];
      const result = await client.query(query, params);
      return parseInt(result.rows[0].count) > 0;
    } finally {
      client.release();
    }
  }

  async checkGroupNameExists(classId: number, name: string, excludeId?: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const query = excludeId 
        ? 'SELECT COUNT(*) FROM groups WHERE class_id = $1 AND name = $2 AND id != $3'
        : 'SELECT COUNT(*) FROM groups WHERE class_id = $1 AND name = $2';
      
      const params = excludeId ? [classId, name, excludeId] : [classId, name];
      const result = await client.query(query, params);
      return parseInt(result.rows[0].count) > 0;
    } finally {
      client.release();
    }
  }

  async getNextGroupNumber(classId: number): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT COALESCE(MAX(group_number), 0) + 1 as next_number
        FROM groups 
        WHERE class_id = $1
      `, [classId]);
      return result.rows[0].next_number;
    } finally {
      client.release();
    }
  }
}
