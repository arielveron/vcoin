-- Migration script to add groups functionality
-- This script adds the new groups table and modifies students table to include group_id

BEGIN;

-- Create groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_number INTEGER NOT NULL, -- Human-readable identifier (not the database ID)
    name VARCHAR(255) NOT NULL,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true, -- Can be enabled/disabled like students and classes
    calculated_average_vcoin_amount INTEGER DEFAULT 0, -- For scheduled calculations
    calculated_average_achievement_points INTEGER DEFAULT 0, -- For scheduled calculations
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- Last calculation timestamp
    calculation_status VARCHAR(20) DEFAULT 'pending' CHECK (calculation_status IN ('pending', 'calculating', 'completed', 'error')), -- Calculation status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(group_number, class_id), -- Group number unique within each class
    UNIQUE(name, class_id) -- Group name unique within each class
);

-- Add group_id to students table (nullable - students can exist without groups)
ALTER TABLE students 
ADD COLUMN group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_groups_class_id ON groups(class_id);
CREATE INDEX idx_groups_is_enabled ON groups(is_enabled);
CREATE INDEX idx_groups_calculated_at ON groups(calculated_at);
CREATE INDEX idx_groups_calculation_status ON groups(calculation_status);
CREATE INDEX idx_groups_enabled_calculated ON groups(is_enabled, calculated_at); -- Composite index for scheduled calculations
CREATE INDEX idx_students_group_id ON students(group_id);

-- Add comments for documentation
COMMENT ON TABLE groups IS 'Student groups within classes for organization and competition tracking';
COMMENT ON COLUMN groups.group_number IS 'Human-readable group identifier unique within each class (e.g., 1, 2, 3)';
COMMENT ON COLUMN groups.name IS 'Group display name unique within each class (e.g., "Team Alpha", "Los Inversores")';
COMMENT ON COLUMN groups.is_enabled IS 'Whether group is active for calculations and competitions';
COMMENT ON COLUMN groups.calculated_average_vcoin_amount IS 'Cached average VCoin amount for group members (updated by scheduled calculations)';
COMMENT ON COLUMN groups.calculated_average_achievement_points IS 'Cached average achievement points for group members (updated by scheduled calculations)';
COMMENT ON COLUMN groups.calculated_at IS 'Last time group averages were calculated';
COMMENT ON COLUMN groups.calculation_status IS 'Status of last calculation attempt for monitoring';
COMMENT ON COLUMN students.group_id IS 'Optional reference to group - students can exist without groups';

-- Insert sample groups for existing classes (optional - for development/testing)
-- Class 1 (Programación 2024) - 2 groups
INSERT INTO groups (group_number, name, class_id, is_enabled) VALUES 
(1, 'Los Programadores', 1, true),
(2, 'Team Debug', 1, true);

-- Class 2 (Finanzas Básicas) - 1 group  
INSERT INTO groups (group_number, name, class_id, is_enabled) VALUES 
(1, 'Inversores Pro', 2, true);

-- Class 3 (Matemáticas Avanzadas) - 1 group
INSERT INTO groups (group_number, name, class_id, is_enabled) VALUES 
(1, 'Los Matemáticos', 3, true);

-- Optional: Assign some existing students to groups for testing
-- Students 1001 and 1002 (María García and Carlos López) to group 1 in class 1
UPDATE students SET group_id = 1 WHERE registro IN (1001, 1002) AND class_id = 1;

-- Student 1003 (Ana Rodríguez) to group 2 in class 1  
UPDATE students SET group_id = 2 WHERE registro = 1003 AND class_id = 1;

-- Students in class 2 to group 3
UPDATE students SET group_id = 3 WHERE class_id = 2;

-- Students in class 3 to group 4
UPDATE students SET group_id = 4 WHERE class_id = 3;

COMMIT;
