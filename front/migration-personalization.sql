-- Migration script to add personalization support
-- This script adds the new personalizacion field to students table
-- and the new name_a and name_o fields to achievements table

BEGIN;

-- Add personalizacion field to students table
ALTER TABLE students 
ADD COLUMN personalizacion VARCHAR(1) DEFAULT NULL 
CHECK (personalizacion IN ('A', 'O'));

-- Add comment for documentation
COMMENT ON COLUMN students.personalizacion IS 'Personalization preference: A (feminine), O (masculine), NULL (not defined)';

-- Add personalized name fields to achievements table
ALTER TABLE achievements 
ADD COLUMN name_a VARCHAR(100) NULL,
ADD COLUMN name_o VARCHAR(100) NULL;

-- Add comments for documentation
COMMENT ON COLUMN achievements.name_a IS 'Optional feminine variant name for personalization';
COMMENT ON COLUMN achievements.name_o IS 'Optional masculine variant name for personalization';

-- Update existing achievements with gendered variants where appropriate
UPDATE achievements SET 
  name_a = 'Estudiante Activa',
  name_o = 'Estudiante Activo'
WHERE name = 'Active Learner';

UPDATE achievements SET 
  name_a = 'Académica',
  name_o = 'Académico'
WHERE name = 'Scholar';

UPDATE achievements SET 
  name_a = 'Dedicada',
  name_o = 'Dedicado'
WHERE name = 'Dedicated';

UPDATE achievements SET 
  name_a = 'Imparable',
  name_o = 'Imparable'
WHERE name = 'Unstoppable';

UPDATE achievements SET 
  name_a = 'Ahorradora',
  name_o = 'Ahorrador'
WHERE name = 'Saver';

UPDATE achievements SET 
  name_a = 'Inversora',
  name_o = 'Inversor'
WHERE name = 'Investor';

UPDATE achievements SET 
  name_a = 'Adinerada',
  name_o = 'Adinerado'
WHERE name = 'Wealthy';

UPDATE achievements SET 
  name_a = 'Millonaria',
  name_o = 'Millonario'
WHERE name = 'Millionaire';

UPDATE achievements SET 
  name_a = 'Destacada Estándar',
  name_o = 'Destacado Estándar'
WHERE name = 'Standard Achiever';

UPDATE achievements SET 
  name_a = 'Favorita del Profesor',
  name_o = 'Favorito del Profesor'
WHERE name = 'Teacher''s Pet';

UPDATE achievements SET 
  name_a = 'Campeona de Clase',
  name_o = 'Campeón de Clase'
WHERE name = 'Class Champion';

COMMIT;

-- Display success message
SELECT 'Personalization migration completed successfully!' as status;
SELECT 'Added personalizacion field to students table' as change_1;
SELECT 'Added name_a and name_o fields to achievements table' as change_2;
SELECT 'Updated existing achievements with gendered variants' as change_3;

-- Show updated achievements with personalized names
SELECT 
  name as default_name,
  name_a as feminine_variant,
  name_o as masculine_variant
FROM achievements 
WHERE name_a IS NOT NULL OR name_o IS NOT NULL
ORDER BY name;
