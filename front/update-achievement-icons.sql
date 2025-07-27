-- Fix achievement icons that don't exist in the libraries
-- Run this to update existing achievement records

UPDATE achievements 
SET icon_config = '{"name": "Flame", "library": "lucide", "size": 28, "color": "#EF4444", "animationClass": "animate-pulse"}'
WHERE icon_config::text LIKE '%"Fire"%' 
AND icon_config::text LIKE '%heroicons-solid%';

UPDATE achievements 
SET icon_config = '{"name": "Zap", "library": "lucide", "size": 32, "color": "#F59E0B", "animationClass": "animate-bounce"}'
WHERE icon_config::text LIKE '%"Lightning"%' 
AND icon_config::text LIKE '%heroicons-solid%';

UPDATE achievements 
SET icon_config = '{"name": "Award", "library": "lucide", "size": 28, "color": "#06B6D4"}'
WHERE icon_config::text LIKE '%"Certificate"%' 
AND icon_config::text LIKE '%tabler%';

-- Check what achievements were updated
SELECT id, name, icon_config 
FROM achievements 
WHERE icon_config::text LIKE '%lucide%' 
AND (icon_config::text LIKE '%Flame%' OR icon_config::text LIKE '%Zap%' OR icon_config::text LIKE '%Award%');
