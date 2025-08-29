# VCoin Scheduled Calculations Implementation Plan

## Execu# Create indexes for performance
CREATE INDEX idx_students_calculated_at ON students(calculated_at);
CREATE INDEX idx_students_calculation_status ON students(calculation_status);
CREATE INDEX idx_students_is_enabled ON students(is_enabled);
CREATE INDEX idx_students_enabled_calculated ON students(is_enabled, calculated_at); -- Composite index for filtering enabled students with calculations
CREATE INDEX idx_classes_calculated_at ON classes(calculated_at);
CREATE INDEX idx_classes_is_enabled ON classes(is_enabled);
CREATE INDEX idx_classes_enabled_calculated ON classes(is_enabled, calculated_at); -- Composite index for filtering enabled classes with calculations
CREATE INDEX idx_calculation_logs_execution_id ON calculation_logs(execution_id);
CREATE INDEX idx_calculation_logs_created_at ON calculation_logs(created_at);
CREATE INDEX idx_calculation_logs_status ON calculation_logs(status);mmary

This document outlines the implementation plan for a scheduled task system that calculates and stores current investment amounts for students and class averages to optimize performance by avoiding real-time calculations on every request.

## Current State Analysis

### Existing Calculation System
- **Real-time calculations**: Current amounts are calculated on-demand using `calculateMontoActual()` from `/src/logic/calculations.ts`
- **Compound interest formula**: Monthly → Daily → Seconds conversion with historical rate support
- **Performance bottleneck**: Complex calculations run for every student on dashboard loads
- **Database queries**: Multiple queries per student for investments, class settings, and interest rate history

### Current Database Schema
```sql
-- Existing relevant tables
students (id, name, email, class_id, registro, etc.)
classes (id, name, end_date, timezone, etc.)
investments (id, student_id, fecha, monto, concepto, etc.)
interest_rate_history (id, class_id, monthly_interest_rate, effective_date)
```

## Proposed Solution

### 1. Database Schema Extensions

#### Add Student and Class Enabled Status with Calculated Amounts Storage
```sql
-- Add enabled status to students table (required for filtering calculations)
ALTER TABLE students 
ADD COLUMN is_enabled BOOLEAN DEFAULT true;

-- Add enabled status to classes table (required for filtering calculations)
ALTER TABLE classes 
ADD COLUMN is_enabled BOOLEAN DEFAULT true;

-- Add calculated amount fields to students table
ALTER TABLE students 
ADD COLUMN calculated_current_amount INTEGER DEFAULT 0,
ADD COLUMN calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN calculation_status VARCHAR(20) DEFAULT 'pending' CHECK (calculation_status IN ('pending', 'calculating', 'completed', 'error'));

-- Add calculated averages to classes table (based on enabled students in enabled classes only)
ALTER TABLE classes
ADD COLUMN calculated_average_amount INTEGER DEFAULT 0,
ADD COLUMN enabled_students_count INTEGER DEFAULT 0,
ADD COLUMN calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN calculation_status VARCHAR(20) DEFAULT 'pending' CHECK (calculation_status IN ('pending', 'calculating', 'completed', 'error'));

-- Create calculation log table for audit and monitoring
CREATE TABLE calculation_logs (
    id SERIAL PRIMARY KEY,
    execution_id UUID DEFAULT gen_random_uuid(),
    trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('scheduled', 'manual', 'webhook')),
    trigger_source VARCHAR(255), -- 'cron', 'admin-panel', 'webhook-uuid', etc.
    class_id INTEGER REFERENCES classes(id),
    student_id INTEGER REFERENCES students(id),
    calculation_type VARCHAR(20) NOT NULL CHECK (calculation_type IN ('student', 'class_average', 'full_system')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    execution_time_ms INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_students_calculated_at ON students(calculated_at);
CREATE INDEX idx_students_calculation_status ON students(calculation_status);
CREATE INDEX idx_classes_calculated_at ON classes(calculated_at);
CREATE INDEX idx_calculation_logs_execution_id ON calculation_logs(execution_id);
CREATE INDEX idx_calculation_logs_created_at ON calculation_logs(created_at);
CREATE INDEX idx_calculation_logs_status ON calculation_logs(status);
```

### 2. TypeScript Interface Updates

#### Updated Student Interface
```typescript
// /src/types/database.ts - Updated Student interface
export interface Student {
  id: number;
  registro: number;
  name: string;
  email: string;
  class_id: number;
  password_hash?: string;
  personalizacion?: 'A' | 'O' | null;
  is_enabled: boolean; // NEW: Enable/disable status
  calculated_current_amount: number; // NEW: Stored calculated amount
  calculated_at: Date | null; // NEW: Last calculation timestamp
  calculation_status: 'pending' | 'calculating' | 'completed' | 'error'; // NEW: Calculation status
  created_at: Date;
  updated_at: Date;
}

// Updated Class interface
export interface Class {
  id: number;
  name: string;
  description?: string;
  end_date: Date;
  timezone: string;
  current_monthly_interest_rate?: number;
  is_enabled: boolean; // NEW: Enable/disable status
  calculated_average_amount: number; // NEW: Stored average for enabled students
  enabled_students_count: number; // NEW: Count of enabled students used in average
  calculated_at: Date | null; // NEW: Last calculation timestamp
  calculation_status: 'pending' | 'calculating' | 'completed' | 'error'; // NEW: Calculation status
  created_at: Date;
  updated_at: Date;
}

// New interfaces for calculations
export interface CalculationLog {
  id: number;
  execution_id: string;
  trigger_type: 'scheduled' | 'manual' | 'webhook';
  trigger_source: string;
  class_id?: number;
  student_id?: number;
  calculation_type: 'student' | 'class_average' | 'full_system';
  status: 'started' | 'completed' | 'failed';
  execution_time_ms?: number;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface CreateClassRequest {
  name: string;
  description?: string;
  end_date: Date;
  timezone: string;
  is_enabled?: boolean; // NEW: Optional, defaults to true
}

export interface CreateStudentRequest {
  registro: number;
  name: string;
  email: string;
  class_id: number;
  password?: string;
  is_enabled?: boolean; // NEW: Optional, defaults to true
}
```

### 3. Repository Extensions

#### Student Repository Updates
```typescript
// /src/repos/student-repo.ts - New methods for enabled student filtering
export class StudentRepository {
  // Existing methods...
  
  // NEW: Get enabled students only
  async findEnabledByClassId(classId: number): Promise<Student[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM students 
        WHERE class_id = $1 AND is_enabled = true
        ORDER BY name
      `, [classId]);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // NEW: Paginated enabled students
  async findEnabledPaginated(
    page: number, 
    limit: number, 
    classId?: number
  ): Promise<{ students: Student[]; total: number }> {
    const client = await pool.connect();
    try {
      const offset = (page - 1) * limit;
      const whereClause = classId 
        ? 'WHERE is_enabled = true AND class_id = $3'
        : 'WHERE is_enabled = true';
      const params = classId ? [limit, offset, classId] : [limit, offset];
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM students ${whereClause}`;
      const countResult = await client.query(countQuery, classId ? [classId] : []);
      const total = parseInt(countResult.rows[0].total, 10);
      
      // Get paginated data
      const dataQuery = `
        SELECT * FROM students 
        ${whereClause}
        ORDER BY name
        LIMIT $1 OFFSET $2
      `;
      const dataResult = await client.query(dataQuery, params);
      
      return { students: dataResult.rows, total };
    } finally {
      client.release();
    }
  }

  // NEW: Count enabled students
  async getEnabledCount(classId?: number): Promise<number> {
    const client = await pool.connect();
    try {
      const whereClause = classId ? 'WHERE is_enabled = true AND class_id = $1' : 'WHERE is_enabled = true';
      const params = classId ? [classId] : [];
      
      const result = await client.query(`
        SELECT COUNT(*) as total FROM students ${whereClause}
      `, params);
      
      return parseInt(result.rows[0].total, 10);
    } finally {
      client.release();
    }
  }

  // NEW: Update student enabled status
  async updateEnabledStatus(id: number, isEnabled: boolean): Promise<Student | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE students 
        SET is_enabled = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [isEnabled, id]);
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // NEW: Update calculation fields
  async updateCalculation(
    id: number, 
    amount: number, 
    status: 'completed' | 'error' = 'completed'
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE students 
        SET calculated_current_amount = $1, 
            calculated_at = NOW(), 
            calculation_status = $2,
            updated_at = NOW()
        WHERE id = $3
      `, [amount, status, id]);
    } finally {
      client.release();
    }
  }

  // NEW: Get enabled students in enabled classes only
  async findEnabledInEnabledClassesPaginated(
    page: number, 
    limit: number
  ): Promise<{ students: Student[]; total: number }> {
    const client = await pool.connect();
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM students s
        JOIN classes c ON s.class_id = c.id
        WHERE s.is_enabled = true AND c.is_enabled = true
      `;
      const countResult = await client.query(countQuery);
      const total = parseInt(countResult.rows[0].total, 10);
      
      // Get paginated data
      const dataQuery = `
        SELECT s.* 
        FROM students s
        JOIN classes c ON s.class_id = c.id
        WHERE s.is_enabled = true AND c.is_enabled = true
        ORDER BY s.name
        LIMIT $1 OFFSET $2
      `;
      const dataResult = await client.query(dataQuery, [limit, offset]);
      
      return { students: dataResult.rows, total };
    } finally {
      client.release();
    }
  }

  // NEW: Count enabled students in enabled classes
  async getEnabledCountInEnabledClasses(): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT COUNT(*) as total 
        FROM students s
        JOIN classes c ON s.class_id = c.id
        WHERE s.is_enabled = true AND c.is_enabled = true
      `);
      
      return parseInt(result.rows[0].total, 10);
    } finally {
      client.release();
    }
  }
}

#### Class Repository Updates
```typescript
// /src/repos/class-repo.ts - New methods for enabled class filtering
export class ClassRepository {
  // Existing methods...
  
  // NEW: Get enabled classes only
  async findEnabledClasses(): Promise<Class[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM classes 
        WHERE is_enabled = true
        ORDER BY name
      `);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // NEW: Update class enabled status
  async updateEnabledStatus(id: number, isEnabled: boolean): Promise<Class | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        UPDATE classes 
        SET is_enabled = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [isEnabled, id]);
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // NEW: Update calculation fields
  async updateCalculation(
    id: number, 
    average: number, 
    enabledStudentCount: number,
    status: 'completed' | 'error' = 'completed'
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(`
        UPDATE classes 
        SET calculated_average_amount = $1, 
            enabled_students_count = $2,
            calculated_at = NOW(), 
            calculation_status = $3,
            updated_at = NOW()
        WHERE id = $4
      `, [average, enabledStudentCount, status, id]);
    } finally {
      client.release();
    }
  }

  // NEW: Get enabled classes count
  async getEnabledCount(): Promise<number> {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT COUNT(*) as total FROM classes WHERE is_enabled = true
      `);
      
      return parseInt(result.rows[0].total, 10);
    } finally {
      client.release();
    }
  }
}

### 2. Calculation Service Layer

#### Core Calculation Service
```typescript
// /src/services/calculation-service.ts
export class CalculationService {
  private studentRepo: StudentRepository;
  private classRepo: ClassRepository;
  private investmentRepo: InvestmentRepository;
  private logRepo: CalculationLogRepository;

  // Individual calculation methods
  async calculateStudentAmount(studentId: number, executionId: string): Promise<void>
  async calculateClassAverage(classId: number, executionId: string): Promise<void>
  
  // Batch calculation methods (enabled students in enabled classes only)
  async calculateAllEnabledStudents(executionId: string): Promise<void>
  async calculateAllEnabledClasses(executionId: string): Promise<void>
  async runFullSystemCalculation(triggerSource: string): Promise<string>
  
  // Helper methods
  async getEnabledClasses(): Promise<Class[]>
  async getEnabledStudents(classId?: number): Promise<Student[]>
  private async logCalculation(data: CalculationLogData): Promise<void>
  private async updateStudentCalculation(studentId: number, amount: number): Promise<void>
  private async updateClassCalculation(classId: number, average: number, enabledStudentCount: number): Promise<void>
}
```

#### Calculation Repository
```typescript
// /src/repos/calculation-log-repo.ts
export class CalculationLogRepository {
  async create(data: CreateCalculationLogRequest): Promise<CalculationLog>
  async findByExecutionId(executionId: string): Promise<CalculationLog[]>
  async findRecent(limit: number): Promise<CalculationLog[]>
  async getSystemHealth(): Promise<CalculationSystemHealth>
}
```

### 3. API Endpoint Security Architecture

#### Webhook Security Strategy
```typescript
// /src/app/api/calculations/webhook/[classUuid]/route.ts
export async function POST(
  request: Request,
  { params }: { params: { classUuid: string } }
) {
  // Multi-layer security validation
  const securityResult = await validateWebhookSecurity({
    classUuid: params.classUuid,
    request,
    rateLimitKey: 'calculation-webhook',
    maxRequestsPerHour: 10
  });

  if (!securityResult.isValid) {
    return NextResponse.json(
      { error: securityResult.error },
      { status: securityResult.status }
    );
  }

  // Execute calculation
  const calculationService = new CalculationService();
  const executionId = await calculationService.runFullSystemCalculation(
    `webhook-${params.classUuid}`
  );

  return NextResponse.json({
    success: true,
    executionId,
    message: 'Calculation triggered successfully'
  });
}
```

#### Security Validation Service
```typescript
// /src/services/webhook-security-service.ts
export class WebhookSecurityService {
  async validateClassUuid(uuid: string): Promise<boolean>
  async checkRateLimit(key: string, maxRequests: number): Promise<boolean>
  async validateRequestFingerprint(request: Request): Promise<boolean>
  async logSecurityEvent(event: SecurityEvent): Promise<void>
  
  // Advanced security measures
  async detectAbusePatterns(): Promise<AbuseDetectionResult>
  async implementBackoffStrategy(key: string): Promise<BackoffConfig>
}
```

### 4. Admin Panel Integration

#### Calculation Management Dashboard
```typescript
// /src/app/admin/calculations/page.tsx
export default async function CalculationsAdminPage() {
  const calculationService = new CalculationService();
  const recentLogs = await calculationService.getRecentCalculations();
  const systemHealth = await calculationService.getSystemHealth();

  return (
    <CalculationsAdminClient
      recentLogs={recentLogs}
      systemHealth={systemHealth}
    />
  );
}
```

#### Manual Trigger Controls
```typescript
// /src/app/admin/calculations/actions.ts
export const triggerSystemCalculation = withAdminAuth(async (): Promise<ActionResult<string>> => {
  const calculationService = new CalculationService();
  const executionId = await calculationService.runFullSystemCalculation('admin-manual');
  
  return {
    success: true,
    data: executionId,
    message: 'System calculation triggered successfully'
  };
}, 'trigger system calculation');

export const triggerClassCalculation = withAdminAuth(async (formData: FormData): Promise<ActionResult<string>> => {
  const classId = parseFormNumber(formData, 'classId');
  const calculationService = new CalculationService();
  const executionId = await calculationService.calculateClassAverage(classId, `admin-class-${classId}`);
  
  return {
    success: true,
    data: executionId,
    message: 'Class calculation triggered successfully'
  };
}, 'trigger class calculation');
```

### 5. Scheduled Task Implementation

#### Cron Job Configuration (Production)
```bash
# /etc/crontab or Docker cron
# Run calculations every hour during business hours (9 AM - 8 PM Argentina time)
0 9-20 * * * curl -X POST https://vcoin.domain.com/api/calculations/webhook/[SYSTEM_UUID] -H "Content-Type: application/json"

# Run full system calculation daily at 2 AM Argentina time
0 2 * * * curl -X POST https://vcoin.domain.com/api/calculations/webhook/[SYSTEM_UUID] -H "Content-Type: application/json" -d '{"type":"full_system"}'
```

#### Alternative: Built-in Node.js Scheduler (Development)
```typescript
// /src/services/scheduler-service.ts
export class SchedulerService {
  private static instance: SchedulerService;
  private jobs: Map<string, NodeJS.Timer> = new Map();

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  startHourlyCalculations(): void {
    const job = setInterval(async () => {
      const calculationService = new CalculationService();
      await calculationService.runFullSystemCalculation('scheduled-hourly');
    }, 60 * 60 * 1000); // Every hour

    this.jobs.set('hourly', job);
  }

  startDailyCalculations(): void {
    // Calculate next 2 AM Argentina time
    const nextRun = this.getNext2AM();
    const timeUntilNext = nextRun.getTime() - Date.now();

    setTimeout(() => {
      const calculationService = new CalculationService();
      calculationService.runFullSystemCalculation('scheduled-daily');

      // Set up daily recurring
      const dailyJob = setInterval(async () => {
        await calculationService.runFullSystemCalculation('scheduled-daily');
      }, 24 * 60 * 60 * 1000); // Every 24 hours

      this.jobs.set('daily', dailyJob);
    }, timeUntilNext);
  }

  private getNext2AM(): Date {
    // Implementation for next 2 AM in Argentina timezone
  }
}
```

### 6. Performance Optimizations

#### Batch Processing Strategy
```typescript
// Process enabled students only in batches to avoid memory issues
const BATCH_SIZE = 50;

async calculateAllEnabledStudents(executionId: string): Promise<void> {
  // Get total count of enabled students in enabled classes only
  const totalEnabledStudents = await this.studentRepo.getEnabledCountInEnabledClasses();
  const batches = Math.ceil(totalEnabledStudents / BATCH_SIZE);

  for (let batch = 0; batch < batches; batch++) {
    const offset = batch * BATCH_SIZE;
    // Fetch only enabled students in enabled classes
    const enabledStudents = await this.studentRepo.findEnabledInEnabledClassesPaginated(batch + 1, BATCH_SIZE);
    
    await Promise.all(
      enabledStudents.students.map(student => 
        this.calculateStudentAmount(student.id, executionId)
      )
    );

    // Small delay between batches to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async calculateAllEnabledClasses(executionId: string): Promise<void> {
  // Get only enabled classes
  const enabledClasses = await this.classRepo.findEnabledClasses();
  
  await Promise.all(
    enabledClasses.map(classEntity => 
      this.calculateClassAverage(classEntity.id, executionId)
    )
  );
}

async calculateClassAverage(classId: number, executionId: string): Promise<void> {
  // First check if the class itself is enabled
  const classEntity = await this.classRepo.findById(classId);
  if (!classEntity || !classEntity.is_enabled) {
    console.warn(`Skipping calculation for disabled class ${classId}`);
    return;
  }
  
  // Get only enabled students for this enabled class
  const enabledStudents = await this.studentRepo.findEnabledByClassId(classId);
  
  if (enabledStudents.length === 0) {
    // No enabled students in this enabled class - set average to 0
    await this.updateClassCalculation(classId, 0, 0);
    return;
  }
  
  // Calculate average based on enabled students only
  let totalAmount = 0;
  for (const student of enabledStudents) {
    const studentAmount = await this.calculateStudentCurrentAmount(student.id);
    totalAmount += studentAmount;
  }
  
  const average = totalAmount / enabledStudents.length;
  await this.updateClassCalculation(classId, average, enabledStudents.length);
}
```

#### Database Connection Optimization
```typescript
// Use connection pooling and transaction management
async runFullSystemCalculation(triggerSource: string): Promise<string> {
  const executionId = generateUUID();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Mark all enabled students in enabled classes as calculating
    await client.query(`
      UPDATE students 
      SET calculation_status = $1 
      WHERE is_enabled = true 
      AND class_id IN (SELECT id FROM classes WHERE is_enabled = true)
    `, ['calculating']);
    
    // Mark all enabled classes as calculating
    await client.query('UPDATE classes SET calculation_status = $1 WHERE is_enabled = true', ['calculating']);
    
    // Perform calculations on enabled students in enabled classes only
    await this.calculateAllEnabledStudents(executionId);
    await this.calculateAllEnabledClasses(executionId);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  
  return executionId;
}
```

### 7. Fallback and Error Handling

#### Graceful Degradation
```typescript
// Modified calculation functions to use stored values when available (enabled students/classes only)
export const getStudentCurrentAmount = async (studentId: number): Promise<number> => {
  const student = await studentRepo.findById(studentId);
  
  // Check if student is enabled - if not, return 0 or handle appropriately
  if (!student.is_enabled) {
    console.warn(`Student ${studentId} is disabled - returning 0 amount`);
    return 0;
  }

  // Check if the student's class is enabled
  const classData = await classRepo.findById(student.class_id);
  if (!classData || !classData.is_enabled) {
    console.warn(`Student ${studentId} is in disabled class ${student.class_id} - returning 0 amount`);
    return 0;
  }
  
  // Use stored calculation if recent (less than 2 hours old)
  if (student.calculated_at && 
      student.calculation_status === 'completed' &&
      isWithinHours(student.calculated_at, 2)) {
    return student.calculated_current_amount;
  }
  
  // Fallback to real-time calculation for enabled students in enabled classes
  console.warn(`Using real-time calculation for enabled student ${studentId} - stored calculation outdated`);
  const investments = await investmentRepo.findByStudentId(studentId);
  const classSettings = await classRepo.findSettingsByStudentId(studentId);
  return calculateMontoActual(investments, classSettings);
};

export const getClassAverageAmount = async (classId: number): Promise<{ average: number, enabledStudentCount: number }> => {
  const classData = await classRepo.findById(classId);
  
  // Check if class is enabled
  if (!classData || !classData.is_enabled) {
    console.warn(`Class ${classId} is disabled - returning 0 average`);
    return { average: 0, enabledStudentCount: 0 };
  }
  
  // Use stored calculation if recent (less than 2 hours old)
  if (classData.calculated_at && 
      classData.calculation_status === 'completed' &&
      isWithinHours(classData.calculated_at, 2)) {
    return {
      average: classData.calculated_average_amount,
      enabledStudentCount: classData.enabled_students_count
    };
  }
  
  // Fallback to real-time calculation for enabled students in enabled class only
  console.warn(`Using real-time calculation for enabled class ${classId} average - stored calculation outdated`);
  const enabledStudents = await studentRepo.findEnabledByClassId(classId);
  
  if (enabledStudents.length === 0) {
    return { average: 0, enabledStudentCount: 0 };
  }
  
  let totalAmount = 0;
  for (const student of enabledStudents) {
    const studentAmount = await getStudentCurrentAmount(student.id);
    totalAmount += studentAmount;
  }
  
  return {
    average: totalAmount / enabledStudents.length,
    enabledStudentCount: enabledStudents.length
  };
};
```

#### Error Recovery
```typescript
// Automatic retry mechanism with exponential backoff
async calculateWithRetry<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('All retry attempts failed');
}
```

### 8. Monitoring and Observability

#### Health Check Endpoint
```typescript
// /src/app/api/calculations/health/route.ts
export async function GET() {
  const calculationService = new CalculationService();
  const health = await calculationService.getSystemHealth();
  
  return NextResponse.json({
    status: health.overall_status,
    last_successful_run: health.last_successful_run,
    students_calculated: health.students_calculated,
    classes_calculated: health.classes_calculated,
    average_execution_time: health.average_execution_time,
    error_rate: health.error_rate
  });
}
```

#### Calculation Metrics Dashboard
```typescript
interface CalculationSystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  last_successful_run: Date | null;
  enabled_students_calculated: number;
  enabled_students_total: number;
  disabled_students_total: number;
  enabled_classes_calculated: number;
  enabled_classes_total: number;
  disabled_classes_total: number;
  average_execution_time: number; // milliseconds
  error_rate: number; // percentage
  oldest_calculation: Date | null;
  recent_errors: CalculationError[];
}
```

### 9. Migration Strategy

#### Phase 1: Database Schema Updates
1. Add `is_enabled` column to both students and classes tables with default `true`
2. Add calculated amount fields to students and classes tables
3. Create calculation logs table with audit capabilities
4. Create indexes for performance (including enabled status for both entities)
5. Update TypeScript types to include new fields

#### Phase 2: Repository Layer Updates
1. Add methods to StudentRepository for enabled student filtering:
   - `findEnabledByClassId(classId: number): Promise<Student[]>`
   - `findEnabledPaginated(page: number, limit: number): Promise<PaginatedResult<Student>>`
   - `findEnabledInEnabledClassesPaginated(): Promise<PaginatedResult<Student>>`
   - `getEnabledCount(classId?: number): Promise<number>`
   - `getEnabledCountInEnabledClasses(): Promise<number>`
2. Add methods to ClassRepository for enabled class filtering:
   - `findEnabledClasses(): Promise<Class[]>`
   - `updateEnabledStatus(id: number, isEnabled: boolean): Promise<Class>`
   - `getEnabledCount(): Promise<number>`
3. Create CalculationLogRepository for audit trail

#### Phase 3: Service Implementation
1. Implement CalculationService with enabled student and class filtering
2. Create webhook endpoints with security measures
3. Build admin panel integration for student and class enable/disable
4. Add calculation monitoring and health checks

#### Phase 4: Admin Panel Integration
1. Add enabled/disabled toggle to student and class management
2. Create calculation dashboard with enabled entity metrics
3. Build manual trigger controls for enabled entities only
4. Implement filters for viewing enabled/disabled students and classes

#### Phase 5: Gradual Rollout
1. Deploy database changes and mark all existing students and classes as enabled
2. Run calculations manually via admin panel on enabled entities only
3. Set up scheduled tasks in development environment
4. Monitor performance and error rates
5. Deploy to production with comprehensive monitoring

### 10. Security Considerations

#### Multi-Layer Protection
1. **UUID-based endpoints**: Each class has a unique UUID for webhook access
2. **Rate limiting**: Maximum 10 requests per hour per class UUID
3. **Request fingerprinting**: Track and analyze request patterns
4. **Abuse detection**: Automatic blocking of suspicious activity
5. **Audit logging**: Comprehensive logging of all calculation triggers
6. **IP allowlisting**: Optional restriction to known IP ranges

#### Rate Limiting Configuration
```typescript
const RATE_LIMITS = {
  webhook_per_class_per_hour: 10,
  webhook_per_ip_per_hour: 50,
  manual_admin_per_user_per_hour: 20,
  system_wide_calculations_per_hour: 12
};
```

### 11. Configuration and Environment Variables

```bash
# New environment variables
CALCULATION_SCHEDULER_ENABLED=true
CALCULATION_WEBHOOK_ENABLED=true
CALCULATION_BATCH_SIZE=50
CALCULATION_MAX_RETRIES=3
CALCULATION_RATE_LIMIT_ENABLED=true
CALCULATION_SECURITY_LEVEL=high # low, medium, high
```

### 12. Benefits and Impact

#### Performance Improvements
- **Response time**: Dashboard loads reduce from ~2-5 seconds to ~200-500ms
- **Database load**: Reduce real-time calculation queries by 90%
- **Scalability**: Support for larger numbers of enabled students and classes without performance degradation
- **Selective processing**: Only process enabled students in enabled classes, significantly reducing computational overhead

#### Operational Benefits
- **Predictable load**: Calculations run at scheduled times on enabled entities only
- **Error visibility**: Comprehensive logging and monitoring
- **Manual control**: Admin can trigger calculations and manage student/class status when needed
- **Graceful degradation**: Fallback to real-time calculations for enabled entities when needed
- **Entity management**: Easy enable/disable functionality for managing active participants and classes
- **Flexible deactivation**: Can disable entire classes or individual students as needed

#### Development Benefits
- **Separation of concerns**: Calculation logic separated from display logic
- **Testability**: Calculation service can be tested independently with enabled entity filtering
- **Maintainability**: Clear audit trail, error handling, and entity status management
- **Future-proof**: Easy to extend with additional entity statuses or calculation rules
- **Consistent patterns**: Both students and classes follow the same enabled/disabled pattern

## Implementation Timeline

### Week 1: Foundation & Entity Status Management
- Database schema updates including `is_enabled` field for both students and classes
- Update TypeScript types and repositories for enabled entity filtering
- Basic CalculationService implementation with enabled student and class support
- Unit tests for calculation logic and enabled entity filtering

### Week 2: API and Security
- Webhook endpoints with security (calculations run on enabled entities only)
- Rate limiting implementation and abuse prevention
- Security testing and validation
- Student and class enable/disable admin functionality

### Week 3: Admin Integration & Monitoring
- Admin panel dashboard with enabled entity metrics
- Manual trigger controls for enabled entity calculations
- Student and class status management UI (enable/disable toggle)
- Monitoring and health checks including enabled/disabled entity counts

### Week 4: Deployment and Optimization
- Production deployment with enabled entity filtering
- Scheduled task setup (processes enabled students in enabled classes only)
- Performance monitoring and optimization
- Documentation updates for new entity status management

## Risks and Mitigation

### Risk: Calculation Errors
**Mitigation**: Comprehensive error handling, retry mechanisms, and fallback to real-time calculations

### Risk: Performance Impact
**Mitigation**: Batch processing, connection pooling, and configurable batch sizes

### Risk: Security Vulnerabilities
**Mitigation**: Multi-layer security, rate limiting, and comprehensive audit logging

### Risk: Data Inconsistency
**Mitigation**: Transactional updates, status tracking, and data validation

## Conclusion

This implementation plan provides a comprehensive approach to optimizing VCoin's investment calculation system while maintaining security, reliability, and performance. The phased rollout approach minimizes risks while providing immediate benefits to system performance and user experience.

The solution follows VCoin's existing architectural patterns and integrates seamlessly with the current admin panel and database structure. The multi-layer security approach ensures that the webhook endpoints are protected against abuse while remaining accessible for legitimate scheduled tasks.
