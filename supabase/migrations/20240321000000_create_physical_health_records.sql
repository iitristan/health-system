-- Create physical_health_records table
CREATE TABLE IF NOT EXISTS physical_health_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_name TEXT NOT NULL,
    physician_id UUID NOT NULL,
    physician_name TEXT NOT NULL,
    date_of_service DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- File uploads
    lab_results_url TEXT,
    other_images_urls TEXT[],
    -- Physical Activity Level
    exercise_regularly TEXT,
    medical_conditions TEXT,
    medical_conditions_specify TEXT,
    activities JSONB,
    -- General Appearance
    posture TEXT,
    cleanliness TEXT,
    -- Physical Findings
    eyes_normal BOOLEAN,
    pale_conjunctiva JSONB,
    dry_eyes JSONB,
    muscle_mass_normal BOOLEAN,
    loss_of_muscle_mass TEXT,
    weakness TEXT,
    localized_weakness TEXT,
    associated_symptoms TEXT[],
    possible_causes TEXT[],
    -- Lab Results - Complete Blood Count (CBC)
    hemoglobin TEXT,
    hematocrit TEXT,
    rbc_count TEXT,
    wbc_count TEXT,
    platelets_count TEXT,
    -- Lab Results - Electrolytes
    sodium TEXT,
    potassium TEXT,
    calcium TEXT,
    magnesium TEXT,
    -- Lab Results - Protein and Nutrition
    albumin TEXT,
    globulin TEXT,
    total_protein TEXT,
    direct_bilirubin TEXT,
    indirect_bilirubin TEXT,
    total_bilirubin TEXT,
    -- Lab Results - Glucose and Metabolism
    glucose TEXT,
    urea TEXT,
    creatinine TEXT,
    cholesterol_total TEXT,
    cholesterol_hdl TEXT,
    cholesterol_ldl TEXT,
    triglycerides TEXT,
    hemoglobin_a1c TEXT,
    -- Anthropometric Data
    height TEXT,
    weight TEXT,
    bmi TEXT,
    body_build TEXT,
    signs_of_distress TEXT[],
    mood_behavior TEXT,
    -- Oral Health
    oral_health JSONB,
    -- Nose
    nasal_discharge TEXT,
    mucus_color TEXT,
    mucus_consistency TEXT,
    nose_shape TEXT,
    nasal_obstruction TEXT,
    -- Ears
    external_ear TEXT[],
    ear_canal TEXT,
    hearing TEXT
);

-- Create index on patient_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_physical_health_patient_name ON physical_health_records(patient_name);

-- Create index on date_of_service for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_physical_health_date ON physical_health_records(date_of_service);

-- Add RLS policies
ALTER TABLE physical_health_records ENABLE ROW LEVEL SECURITY;

-- Policy for viewing records (public access)
CREATE POLICY "Allow public viewing of records" ON physical_health_records
    FOR SELECT
    USING (true);

-- Policy for inserting records (public access)
CREATE POLICY "Allow public inserting of records" ON physical_health_records
    FOR INSERT
    WITH CHECK (true);

-- Policy for updating records (public access)
CREATE POLICY "Allow public updating of records" ON physical_health_records
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy for deleting records (public access)
CREATE POLICY "Allow public deleting of records" ON physical_health_records
    FOR DELETE
    USING (true); 