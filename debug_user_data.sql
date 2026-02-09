-- Check user's profile data
SELECT 
    id,
    email,
    age,
    height,
    weight,
    goal,
    training_frequency,
    result_tempo,
    is_onboarded,
    created_at,
    updated_at
FROM profiles
WHERE email = 'liekesneep09@gmail.com';

-- Check user's nutrition targets
SELECT 
    user_id,
    cal_target,
    protein_g,
    carbs_g,
    fat_g,
    bmr,
    tdee,
    activity_factor,
    computed_at
FROM nutrition_targets
WHERE user_id IN (
    SELECT id FROM profiles WHERE email = 'liekesneep09@gmail.com'
);

-- Check for any NULL values that might cause crashes
SELECT 
    p.email,
    p.age IS NULL as age_null,
    p.height IS NULL as height_null,
    p.weight IS NULL as weight_null,
    p.goal IS NULL as goal_null,
    nt.cal_target IS NULL as targets_null
FROM profiles p
LEFT JOIN nutrition_targets nt ON p.id = nt.user_id
WHERE p.email = 'liekesneep09@gmail.com';
