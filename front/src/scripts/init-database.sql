-- VCoin Database Schema
-- This script creates the initial database structure for the VCoin investment tracking application

-- Create the database (run this separately if needed)
-- CREATE DATABASE vcoin;

-- Connect to the database
-- \c vcoin;

-- Enable UUID extension for better ID generation (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for development reset)
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS interest_rate_history CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;

-- Create classes table
-- Each class represents a group of students with their own investment settings
-- Note: monthly_interest_rate is now managed in the interest_rate_history table
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    end_date DATE NOT NULL DEFAULT '2025-07-18',
    timezone VARCHAR(100) NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
-- Each student belongs to a class and can have multiple investments
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    registro INTEGER NOT NULL, -- Student registry number for reference (unique within class)
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL, -- Email (unique within class)
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    password_hash VARCHAR(255), -- For student authentication
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraints per class (same student can exist in different classes)
    UNIQUE(registro, class_id),
    UNIQUE(email, class_id)
);

-- Create investments table
-- Each investment record tracks money invested by a student with date and concept
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fecha DATE NOT NULL, -- Investment date
    monto INTEGER NOT NULL, -- Amount as integer (returns as number in JavaScript)
    concepto TEXT NOT NULL, -- Description/concept of the investment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interest_rate_history table
-- This table tracks the historical changes of interest rates for each class
CREATE TABLE interest_rate_history (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    monthly_interest_rate DECIMAL(10,8) NOT NULL,
    effective_date DATE NOT NULL, -- Date when this rate becomes effective
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_registro ON students(registro);
CREATE INDEX idx_students_registro_class ON students(registro, class_id); -- For student authentication
CREATE INDEX idx_investments_student_id ON investments(student_id);
CREATE INDEX idx_investments_fecha ON investments(fecha);
CREATE INDEX idx_investments_student_fecha ON investments(student_id, fecha);
CREATE INDEX idx_classes_end_date ON classes(end_date);
CREATE INDEX idx_classes_timezone ON classes(timezone);
CREATE INDEX idx_interest_rate_history_class_id ON interest_rate_history(class_id);
CREATE INDEX idx_interest_rate_history_effective_date ON interest_rate_history(effective_date);
CREATE INDEX idx_interest_rate_history_class_effective_date ON interest_rate_history(class_id, effective_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at columns
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interest_rate_history_updated_at BEFORE UPDATE ON interest_rate_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial test data
-- Create classes with specific settings
INSERT INTO classes (name, description, end_date, timezone) VALUES 
('Programación 2024', 'Clase de programación del año 2024 - 3 estudiantes', '2025-07-18', 'America/Argentina/Buenos_Aires'),
('Finanzas Básicas', 'Curso introductorio de finanzas - 2 estudiantes', '2025-08-15', 'America/Sao_Paulo'),
('Matemáticas Avanzadas', 'Curso avanzado de matemáticas - 1 estudiante', '2025-09-30', 'America/Argentina/Buenos_Aires');

-- Insert test students with registro numbers
-- Class 1 (Programación 2024, GMT-3, rate 0.01) - 3 students
INSERT INTO students (registro, name, email, class_id) VALUES 
(1001, 'María García', 'maria.garcia@ejemplo.com', 1),
(1002, 'Carlos López', 'carlos.lopez@ejemplo.com', 1),
(1003, 'Ana Rodríguez', 'ana.rodriguez@ejemplo.com', 1),
-- Class 2 (Finanzas Básicas, GMT-2, rate 0.04) - 2 students  
(2001, 'Pedro Silva', 'pedro.silva@ejemplo.com', 2),
(2002, 'Laura Martínez', 'laura.martinez@ejemplo.com', 2),
-- Class 3 (Matemáticas Avanzadas, GMT-3, rate 0.07) - 1 student
(3001, 'Diego Fernández', 'diego.fernandez@ejemplo.com', 3);

-- Insert investments for each student
-- Student 1001 (María García - Programación)
INSERT INTO investments (student_id, fecha, monto, concepto) VALUES 
(1, '2025-04-13', 100000, 'Apertura de cuenta'),
(1, '2025-05-07', 630000, 'Parcialito 1'),
(1, '2025-05-15', 100000, 'TP entrega 1'),
(1, '2025-05-28', 850000, 'Parcial Teorico 1'),
(1, '2025-06-01', 100000, 'TP entrega 2'),
(1, '2025-06-05', 750000, 'Parcial Práctico 1'),
(1, '2025-06-25', 650000, 'Parcial Práctico 2'),

-- Student 1002 (Carlos López - Programación)  
(2, '2025-04-15', 200000, 'Apertura de cuenta'),
(2, '2025-05-10', 450000, 'Primer parcial'),
(2, '2025-05-20', 300000, 'Trabajo práctico'),
(2, '2025-06-10', 500000, 'Segundo parcial'),

-- Student 1003 (Ana Rodríguez - Programación)
(3, '2025-04-20', 150000, 'Apertura de cuenta'),
(3, '2025-05-12', 350000, 'Evaluación inicial'),
(3, '2025-06-02', 400000, 'Proyecto final'),

-- Student 2001 (Pedro Silva - Finanzas)
(4, '2025-04-10', 250000, 'Apertura de cuenta'),
(4, '2025-05-05', 550000, 'Análisis financiero'),
(4, '2025-05-25', 400000, 'Caso de estudio'),
(4, '2025-06-15', 700000, 'Examen final'),

-- Student 2002 (Laura Martínez - Finanzas)
(5, '2025-04-12', 180000, 'Apertura de cuenta'),
(5, '2025-05-08', 420000, 'Primer módulo'),
(5, '2025-06-08', 320000, 'Segundo módulo'),

-- Student 3001 (Diego Fernández - Matemáticas)
(6, '2025-04-05', 300000, 'Apertura de cuenta'),
(6, '2025-04-25', 800000, 'Álgebra lineal'),
(6, '2025-05-15', 600000, 'Cálculo diferencial'),
(6, '2025-06-05', 900000, 'Proyecto de investigación'),
(6, '2025-06-25', 750000, 'Examen comprensivo');

-- Insert initial interest rate history
-- This creates the base rates and some historical changes to demonstrate the functionality
INSERT INTO interest_rate_history (class_id, monthly_interest_rate, effective_date) VALUES 
-- Class 1 (Programación 2024) - Initial rate and changes
(1, 0.01, '2025-01-01'),   -- Initial rate
(1, 0.015, '2025-05-01'),  -- Rate increased to 1.5%
(1, 0.02, '2025-06-15'),   -- Rate increased again to 2%

-- Class 2 (Finanzas Básicas) - Initial rate and changes  
(2, 0.04, '2025-01-01'),   -- Initial rate
(2, 0.035, '2025-06-01'),  -- Rate decreased to 3.5%

-- Class 3 (Matemáticas Avanzadas) - Initial rate and changes
(3, 0.07, '2025-01-01'),   -- Initial rate
(3, 0.075, '2025-05-15');  -- Rate increased to 7.5%

-- Create views for interest rate management

-- View to get current rates for each class
CREATE VIEW current_interest_rates AS
SELECT DISTINCT ON (class_id)
    class_id,
    monthly_interest_rate,
    effective_date,
    created_at
FROM interest_rate_history
ORDER BY class_id, effective_date DESC, created_at DESC;

-- View to get rate changes with previous rate for comparison
CREATE VIEW interest_rate_changes AS
SELECT 
    irh.id,
    irh.class_id,
    c.name as class_name,
    irh.monthly_interest_rate,
    irh.effective_date,
    LAG(irh.monthly_interest_rate) OVER (PARTITION BY irh.class_id ORDER BY irh.effective_date, irh.created_at) as previous_rate,
    CASE 
        WHEN LAG(irh.monthly_interest_rate) OVER (PARTITION BY irh.class_id ORDER BY irh.effective_date, irh.created_at) IS NULL THEN 'initial'
        WHEN irh.monthly_interest_rate > LAG(irh.monthly_interest_rate) OVER (PARTITION BY irh.class_id ORDER BY irh.effective_date, irh.created_at) THEN 'up'
        WHEN irh.monthly_interest_rate < LAG(irh.monthly_interest_rate) OVER (PARTITION BY irh.class_id ORDER BY irh.effective_date, irh.created_at) THEN 'down'
        ELSE 'same'
    END as rate_direction,
    irh.created_at,
    irh.updated_at
FROM interest_rate_history irh
JOIN classes c ON irh.class_id = c.id
ORDER BY irh.class_id, irh.effective_date DESC, irh.created_at DESC;

-- Create a view for easy querying of investment data with student info and class settings
CREATE VIEW investments_with_details AS
SELECT 
    i.id,
    i.fecha,
    i.monto,
    i.concepto,
    i.created_at,
    i.updated_at,
    s.id as student_id,
    s.registro as student_registro,
    s.name as student_name,
    s.email as student_email,
    c.id as class_id,
    c.name as class_name,
    c.end_date as class_end_date,
    c.timezone as class_timezone,
    cir.monthly_interest_rate as current_monthly_rate
FROM investments i
JOIN students s ON i.student_id = s.id
JOIN classes c ON s.class_id = c.id
LEFT JOIN current_interest_rates cir ON c.id = cir.class_id
ORDER BY i.fecha DESC;

-- Create a view for class settings easy access
CREATE VIEW classes_with_settings AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.end_date,
    c.timezone,
    cir.monthly_interest_rate as current_monthly_interest_rate,
    cir.effective_date as current_rate_effective_date,
    c.created_at,
    c.updated_at
FROM classes c
LEFT JOIN current_interest_rates cir ON c.id = cir.class_id;

-- Create a view for student totals
CREATE VIEW student_investment_totals AS
SELECT 
    s.id as student_id,
    s.registro as student_registro,
    s.name as student_name,
    s.email as student_email,
    c.name as class_name,
    cir.monthly_interest_rate as current_monthly_interest_rate,
    c.timezone,
    c.end_date,
    COALESCE(SUM(i.monto), 0) as total_invested,
    COUNT(i.id) as investment_count
FROM students s
JOIN classes c ON s.class_id = c.id
LEFT JOIN current_interest_rates cir ON c.id = cir.class_id
LEFT JOIN investments i ON s.id = i.student_id
GROUP BY s.id, s.registro, s.name, s.email, c.name, cir.monthly_interest_rate, c.timezone, c.end_date
ORDER BY total_invested DESC;

-- Display summary
SELECT 'Database initialization completed successfully!' as status;
SELECT 'Classes created: ' || COUNT(*) as classes_count FROM classes;
SELECT 'Students created: ' || COUNT(*) as students_count FROM students;
SELECT 'Investments created: ' || COUNT(*) as investments_count FROM investments;
SELECT 'Interest rate history records: ' || COUNT(*) as rate_history_count FROM interest_rate_history;

-- Display current interest rates by class
SELECT 
    c.name as "Class Name",
    cir.monthly_interest_rate as "Current Rate",
    cir.effective_date as "Effective Date"
FROM current_interest_rates cir
JOIN classes c ON cir.class_id = c.id
ORDER BY c.name;

-- Display interest rate changes with direction indicators
SELECT 
    class_name as "Class",
    monthly_interest_rate as "Rate",
    effective_date as "Date",
    rate_direction as "Direction",
    previous_rate as "Previous Rate"
FROM interest_rate_changes
WHERE rate_direction != 'initial'
ORDER BY class_id, effective_date DESC;
