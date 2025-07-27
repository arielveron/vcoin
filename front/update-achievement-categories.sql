-- Migration script to update achievements to use category_id instead of category_name
-- This script will update existing achievements that have category_name in trigger_config

-- Update the "Exam Master" achievement to use category_id
UPDATE achievements 
SET trigger_config = JSONB_SET(
    trigger_config - 'category_name',
    '{category_id}',
    (
        SELECT to_jsonb(ic.id)
        FROM investment_categories ic 
        WHERE ic.name = 'Standard' -- Using Standard as default since we don't know the exact category
        LIMIT 1
    )
)
WHERE name = 'Exam Master'
AND trigger_config ? 'category_name';

-- If you have specific category names, you can update them accordingly
-- For example, if you have an "Exams" category:
-- UPDATE achievements 
-- SET trigger_config = JSONB_SET(
--     trigger_config - 'category_name',
--     '{category_id}',
--     (
--         SELECT to_jsonb(ic.id)
--         FROM investment_categories ic 
--         WHERE ic.name = 'Exams'
--         LIMIT 1
--     )
-- )
-- WHERE trigger_config ->> 'category_name' = 'Exams';

-- Add more updates as needed for other achievements with category_name
