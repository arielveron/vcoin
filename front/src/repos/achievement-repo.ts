import { pool } from '@/config/database';
import { 
  Achievement, 
  StudentAchievement, 
  CreateAchievementRequest,
  AchievementWithProgress 
} from '@/types/database';

export class AchievementRepository {
  // Achievement CRUD
  async findAll(activeOnly = false): Promise<Achievement[]> {
    const client = await pool.connect();
    try {
      const whereClause = activeOnly ? 'WHERE is_active = true' : '';
      const result = await client.query(`
        SELECT id, name, description, category, rarity, icon_config, 
               trigger_type, trigger_config, celebration_config, points, 
               sort_order, is_active, created_at, updated_at
        FROM achievements
        ${whereClause}
        ORDER BY category, sort_order, points
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<Achievement | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, name, description, category, rarity, icon_config, 
               trigger_type, trigger_config, celebration_config, points, 
               sort_order, is_active, created_at, updated_at
        FROM achievements
        WHERE id = $1
      `, [id]);
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async create(data: CreateAchievementRequest): Promise<Achievement> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO achievements (
          name, description, category, rarity, icon_config, 
          trigger_type, trigger_config, celebration_config, 
          points, sort_order, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
        data.name,
        data.description,
        data.category,
        data.rarity,
        JSON.stringify(data.icon_config),
        data.trigger_type,
        data.trigger_config ? JSON.stringify(data.trigger_config) : null,
        data.celebration_config ? JSON.stringify(data.celebration_config) : JSON.stringify({ animation: 'confetti', duration: 3000 }),
        data.points || 0,
        data.sort_order || 0,
        data.is_active ?? true
      ]);
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(id: number, data: Partial<CreateAchievementRequest>): Promise<Achievement | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE achievements
        SET 
          name = COALESCE($2, name),
          description = COALESCE($3, description),
          category = COALESCE($4, category),
          rarity = COALESCE($5, rarity),
          icon_config = COALESCE($6, icon_config),
          trigger_type = COALESCE($7, trigger_type),
          trigger_config = COALESCE($8, trigger_config),
          celebration_config = COALESCE($9, celebration_config),
          points = COALESCE($10, points),
          sort_order = COALESCE($11, sort_order),
          is_active = COALESCE($12, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [
        id,
        data.name,
        data.description,
        data.category,
        data.rarity,
        data.icon_config ? JSON.stringify(data.icon_config) : null,
        data.trigger_type,
        data.trigger_config ? JSON.stringify(data.trigger_config) : null,
        data.celebration_config ? JSON.stringify(data.celebration_config) : null,
        data.points,
        data.sort_order,
        data.is_active
      ]);
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      // First check if there are any student achievements for this achievement
      const studentAchievements = await client.query(`
        SELECT COUNT(*) as count FROM student_achievements WHERE achievement_id = $1
      `, [id]);
      
      if (parseInt(studentAchievements.rows[0].count) > 0) {
        throw new Error('Cannot delete achievement that has been unlocked by students');
      }

      const result = await client.query(`
        DELETE FROM achievements WHERE id = $1
      `, [id]);
      
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  // Student achievement tracking
  async getStudentAchievements(studentId: number): Promise<AchievementWithProgress[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          a.*,
          sa.unlocked_at,
          sa.seen,
          CASE WHEN sa.student_id IS NOT NULL THEN true ELSE false END as unlocked,
          ap.current_value,
          CASE 
            WHEN a.trigger_config->>'value' IS NOT NULL 
            THEN (a.trigger_config->>'value')::numeric 
            ELSE NULL 
          END as required_value,
          CASE 
            WHEN a.trigger_config->>'value' IS NOT NULL AND ap.current_value IS NOT NULL
            THEN LEAST(100, (ap.current_value / (a.trigger_config->>'value')::numeric * 100))
            ELSE 0
          END as progress
        FROM achievements a
        LEFT JOIN student_achievements sa 
          ON a.id = sa.achievement_id AND sa.student_id = $1
        LEFT JOIN achievement_progress ap
          ON a.id = ap.achievement_id AND ap.student_id = $1
        WHERE a.is_active = true
        ORDER BY 
          CASE WHEN sa.student_id IS NOT NULL THEN 0 ELSE 1 END,
          a.category, a.sort_order, a.points
      `, [studentId]);
      
      return result.rows.map(row => ({
        ...row,
        unlocked: Boolean(row.unlocked),
        progress: Number(row.progress) || 0,
        current_value: Number(row.current_value) || 0,
        required_value: row.required_value ? Number(row.required_value) : undefined
      }));
    } finally {
      client.release();
    }
  }

  async unlockAchievement(studentId: number, achievementId: number, metadata?: Record<string, unknown>): Promise<StudentAchievement> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO student_achievements (student_id, achievement_id, metadata)
        VALUES ($1, $2, $3)
        ON CONFLICT (student_id, achievement_id) DO NOTHING
        RETURNING *
      `, [studentId, achievementId, metadata ? JSON.stringify(metadata) : null]);
      
      if (result.rows.length === 0) {
        // Already unlocked, fetch existing
        const existing = await client.query(`
          SELECT * FROM student_achievements
          WHERE student_id = $1 AND achievement_id = $2
        `, [studentId, achievementId]);
        return existing.rows[0];
      }
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async markAchievementSeen(studentId: number, achievementId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE student_achievements
        SET seen = true
        WHERE student_id = $1 AND achievement_id = $2
      `, [studentId, achievementId]);
    } finally {
      client.release();
    }
  }

  async markCelebrationShown(studentId: number, achievementId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE student_achievements
        SET celebration_shown = true
        WHERE student_id = $1 AND achievement_id = $2
      `, [studentId, achievementId]);
    } finally {
      client.release();
    }
  }

  async getUnseenAchievements(studentId: number): Promise<Achievement[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT a.*
        FROM achievements a
        JOIN student_achievements sa ON a.id = sa.achievement_id
        WHERE sa.student_id = $1 AND sa.seen = false
        ORDER BY sa.unlocked_at DESC
      `, [studentId]);
      
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Progress tracking
  async updateProgress(studentId: number, achievementId: number, value: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO achievement_progress (student_id, achievement_id, current_value)
        VALUES ($1, $2, $3)
        ON CONFLICT (student_id, achievement_id) 
        DO UPDATE SET current_value = $3, last_updated = CURRENT_TIMESTAMP
      `, [studentId, achievementId, value]);
    } finally {
      client.release();
    }
  }

  // Statistics
  async getStudentStats(studentId: number): Promise<{
    total_points: number;
    achievements_unlocked: number;
    achievements_total: number;
    by_category: { category: string; count: number }[];
    by_rarity: { rarity: string; count: number }[];
  }> {
    const client = await pool.connect();
    try {
      const [statsResult, categoryResult, rarityResult] = await Promise.all([
        client.query(`
          SELECT 
            COALESCE(SUM(a.points), 0) as total_points,
            COUNT(sa.achievement_id) as achievements_unlocked,
            (SELECT COUNT(*) FROM achievements WHERE is_active = true) as achievements_total
          FROM student_achievements sa
          JOIN achievements a ON sa.achievement_id = a.id
          WHERE sa.student_id = $1
        `, [studentId]),
        
        client.query(`
          SELECT a.category, COUNT(*) as count
          FROM student_achievements sa
          JOIN achievements a ON sa.achievement_id = a.id
          WHERE sa.student_id = $1
          GROUP BY a.category
        `, [studentId]),
        
        client.query(`
          SELECT a.rarity, COUNT(*) as count
          FROM student_achievements sa
          JOIN achievements a ON sa.achievement_id = a.id
          WHERE sa.student_id = $1
          GROUP BY a.rarity
        `, [studentId])
      ]);
      
      return {
        total_points: Number(statsResult.rows[0]?.total_points || 0),
        achievements_unlocked: Number(statsResult.rows[0]?.achievements_unlocked || 0),
        achievements_total: Number(statsResult.rows[0]?.achievements_total || 0),
        by_category: categoryResult.rows,
        by_rarity: rarityResult.rows
      };
    } finally {
      client.release();
    }
  }

  // Helper method to check if achievement is already unlocked
  async isAchievementUnlocked(studentId: number, achievementId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 1 FROM student_achievements
        WHERE student_id = $1 AND achievement_id = $2
      `, [studentId, achievementId]);
      
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }

  async revokeAchievement(studentId: number, achievementId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
        DELETE FROM student_achievements
        WHERE student_id = $1 AND achievement_id = $2
      `, [studentId, achievementId]);
    } finally {
      client.release();
    }
  }
}
