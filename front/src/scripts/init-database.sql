-- VCoin Database Schema
-- This script creates the initial database structure for the VCoin investment tracking application

-- Create the database (run this separately if needed)
-- CREATE DATABASE vcoin_db;

-- Connect to the database
-- \c vcoin_db;

-- Enable UUID extension for better ID generation (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for development reset)
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;

-- Create classes table
-- Each class represents a group of students (e.g., different courses, semesters, etc.)
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
-- Each student belongs to a class and can have multiple investments
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investments table
-- Each investment record tracks money invested by a student with date and concept
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fecha DATE NOT NULL, -- Investment date
    monto BIGINT NOT NULL, -- Amount in cents/smallest currency unit
    concepto TEXT NOT NULL, -- Description/concept of the investment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_investments_student_id ON investments(student_id);
CREATE INDEX idx_investments_fecha ON investments(fecha);
CREATE INDEX idx_investments_student_fecha ON investments(student_id, fecha);

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

-- Insert initial test data
-- Create a default class
INSERT INTO classes (name, description) VALUES 
('Programación 2024', 'Clase de programación del año 2024'),
('Finanzas Básicas', 'Curso introductorio de finanzas');

-- Insert test students
INSERT INTO students (name, email, class_id) VALUES 
('Estudiante Ejemplo', 'estudiante@ejemplo.com', 1),
('Ana García', 'ana.garcia@ejemplo.com', 1),
('Carlos López', 'carlos.lopez@ejemplo.com', 2);

-- Insert the existing investment data from pseudo-db
-- Converting the current pseudo-db data to proper database records
INSERT INTO investments (student_id, fecha, monto, concepto) VALUES 
(1, '2025-04-13', 100000, 'Apertura de cuenta'),
(1, '2025-05-07', 630000, 'Parcialito 1'),
(1, '2025-05-15', 100000, 'TP entrega 1'),
(1, '2025-05-28', 850000, 'Parcial Teorico 1'),
(1, '2025-06-01', 100000, 'TP entrega 2'),
(1, '2025-06-05', 750000, 'Parcial Práctico 1'),
(1, '2025-06-25', 650000, 'Parcial Práctico 2');

-- Add some data for other students to test multi-student functionality
INSERT INTO investments (student_id, fecha, monto, concepto) VALUES 
(2, '2025-04-15', 200000, 'Apertura de cuenta'),
(2, '2025-05-10', 450000, 'Primer parcial'),
(3, '2025-04-20', 150000, 'Apertura de cuenta'),
(3, '2025-05-12', 300000, 'Examen inicial');

-- Create a view for easy querying of investment data with student info
CREATE VIEW investments_with_details AS
SELECT 
    i.id,
    i.fecha,
    i.monto,
    i.concepto,
    i.created_at,
    i.updated_at,
    s.id as student_id,
    s.name as student_name,
    s.email as student_email,
    c.id as class_id,
    c.name as class_name
FROM investments i
JOIN students s ON i.student_id = s.id
JOIN classes c ON s.class_id = c.id
ORDER BY i.fecha DESC;

-- Create a view for student totals
CREATE VIEW student_investment_totals AS
SELECT 
    s.id as student_id,
    s.name as student_name,
    s.email as student_email,
    c.name as class_name,
    COALESCE(SUM(i.monto), 0) as total_invested,
    COUNT(i.id) as investment_count
FROM students s
JOIN classes c ON s.class_id = c.id
LEFT JOIN investments i ON s.id = i.student_id
GROUP BY s.id, s.name, s.email, c.name
ORDER BY total_invested DESC;

-- Display summary
SELECT 'Database initialization completed successfully!' as status;
SELECT 'Classes created: ' || COUNT(*) as classes_count FROM classes;
SELECT 'Students created: ' || COUNT(*) as students_count FROM students;
SELECT 'Investments created: ' || COUNT(*) as investments_count FROM investments;
