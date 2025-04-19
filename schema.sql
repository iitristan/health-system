-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE gender AS ENUM ('Male', 'Female', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE marital_status AS ENUM ('Single', 'Married', 'Divorced', 'Widowed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE employment_status AS ENUM ('Employed', 'Student', 'Unemployed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nurse_specialization AS ENUM (
        'General',
        'Pediatric',
        'Geriatric',
        'Critical Care',
        'Emergency',
        'Operating Room',
        'Community Health'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nurse_qualification AS ENUM (
        'RN',
        'LPN',
        'BSN',
        'MSN',
        'NP',
        'DNP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create nurses table
CREATE TABLE IF NOT EXISTS nurses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    signature VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    age INTEGER,
    gender gender NOT NULL,
    marital_status marital_status,
    employment_status employment_status,
    ethnicity VARCHAR(100),
    address1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    mobile_phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    signature VARCHAR(255),
    mother_name VARCHAR(255),
    mother_date_of_birth DATE,
    mother_age INTEGER,
    mother_occupation VARCHAR(100),
    father_name VARCHAR(255),
    father_date_of_birth DATE,
    father_age INTEGER,
    father_occupation VARCHAR(100),
    siblings_count INTEGER DEFAULT 0,
    siblings_names TEXT[],
    siblings_ages INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vital signs table
CREATE TABLE IF NOT EXISTS vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    temperature DECIMAL(4,1),
    pulse_rate INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    bmi DECIMAL(5,2),
    pain_level INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create health_history table
CREATE TABLE IF NOT EXISTS health_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    chief_complaint TEXT,
    past_medical_conditions JSONB DEFAULT '{
        "occasionalColds": false,
        "anemia": false,
        "other": ""
    }',
    past_surgical_history JSONB DEFAULT '{
        "hadSurgery": "",
        "surgeries": []
    }',
    recent_hospitalization TEXT,
    health_maintenance JSONB DEFAULT '{
        "lastPediatricCheckup": "",
        "lastCBC": "",
        "lastNutritionalAssessment": "",
        "lastVaccination": "",
        "lastDeworming": "",
        "lastEyeExam": "",
        "visionCorrection": "",
        "medications": []
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create health_assessment table
CREATE TABLE IF NOT EXISTS health_assessment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    date_of_service DATE NOT NULL,
    request_related JSONB DEFAULT '[]',
    documentation_sent_to TEXT,
    risk_level VARCHAR(50),
    assessment_time_frame VARCHAR(50),
    sent_by JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create physical_health_records table
CREATE TABLE IF NOT EXISTS physical_health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    date_of_service DATE NOT NULL,
    -- Physical Activity Level
    exercise_regularly TEXT,
    medical_conditions TEXT,
    medical_conditions_specify TEXT,
    activities JSONB, -- Stores array of {name, does, frequency}
    
    -- General Appearance
    posture TEXT,
    cleanliness TEXT,
    
    -- Physical Findings
    eyes_normal BOOLEAN,
    pale_conjunctiva JSONB, -- Stores {present, severity}
    dry_eyes JSONB, -- Stores {present, frequency}
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
    oral_health JSONB, -- Stores {healthy, foul_odor, swollen_gums, bleeding_gums, mouth_ulcers}
    
    -- Nose
    nasal_discharge TEXT,
    mucus_color TEXT,
    mucus_consistency TEXT,
    nose_shape TEXT,
    nasal_obstruction TEXT,
    
    -- Ears
    external_ear TEXT[],
    ear_canal TEXT,
    hearing TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create dietary_nutritional_records table
CREATE TABLE IF NOT EXISTS dietary_nutritional_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    physician_id UUID NOT NULL,
    date_of_service DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Diet Recall
    diet_recall JSONB, -- {day1: {breakfast: string, lunch: string, dinner: string}, ...}
    
    -- Water Intake
    water_intake JSONB, -- {amount: string, temperature: string}
    
    -- Diet History
    diet_history JSONB, -- {
        -- foodGroups: {milk: boolean, fruits: boolean, meat: boolean, bread: boolean, vegetables: boolean, fat: boolean}
        -- junkFood: {breakfast: boolean, lunch: boolean, dinner: boolean, reason: string}
        -- fastFood: {breakfast: boolean, lunch: boolean, dinner: boolean, reason: string}
        -- skippedMeals: {breakfast: boolean, lunch: boolean, dinner: boolean, reason: string}
    -- }
    
    -- Malnutrition Screening
    malnutrition_screening JSONB, -- {
        -- weightLoss: string
        -- appetite: string
        -- foodIntake: string
        -- eatingDifficulty: string
    -- }
    
    -- Appetite Status
    appetite_status JSONB -- {normal: boolean, suppressed: boolean, increased: boolean}
);

-- Create psychosocial_behavioral_records table
CREATE TABLE psychosocial_behavioral_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    physician_id UUID NOT NULL,
    date_of_service DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Food Insecurity
    skipping_meals BOOLEAN,
    limited_access BOOLEAN,
    food_assistance BOOLEAN,
    other_food_insecurity TEXT,
    
    -- Eating Behavior
    appetite TEXT,
    meal_frequency TEXT,
    food_preferences TEXT,
    refuses_food BOOLEAN,
    choking_risk BOOLEAN,
    texture_aversion BOOLEAN,
    
    -- Emotional Health
    parental_bonding TEXT,
    developmental_milestones TEXT,
    trauma_exposure BOOLEAN,
    irritability BOOLEAN,
    apathy BOOLEAN,
    anxiety BOOLEAN
);

-- Create nail_assessment_records table
CREATE TABLE IF NOT EXISTS nail_assessment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    date_of_service DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Nail Shape
    nail_shape_oval BOOLEAN DEFAULT FALSE,
    nail_shape_square BOOLEAN DEFAULT FALSE,
    nail_shape_round BOOLEAN DEFAULT FALSE,
    nail_shape_almond BOOLEAN DEFAULT FALSE,
    nail_shape_squoval BOOLEAN DEFAULT FALSE,
    nail_shape_pointed BOOLEAN DEFAULT FALSE,
    
    -- Nail Length
    nail_length_short BOOLEAN DEFAULT FALSE,
    nail_length_medium BOOLEAN DEFAULT FALSE,
    nail_length_long BOOLEAN DEFAULT FALSE,
    
    -- Nail Texture
    nail_texture_firm BOOLEAN DEFAULT FALSE,
    nail_texture_soft BOOLEAN DEFAULT FALSE,
    nail_texture_brittle BOOLEAN DEFAULT FALSE,
    
    -- Nail Color
    nail_color_pinkish BOOLEAN DEFAULT FALSE,
    nail_color_discolored BOOLEAN DEFAULT FALSE,
    nail_color_yellow BOOLEAN DEFAULT FALSE,
    nail_color_white_spots BOOLEAN DEFAULT FALSE,
    nail_color_blue_purple BOOLEAN DEFAULT FALSE,
    nail_color_other BOOLEAN DEFAULT FALSE,
    
    -- Nail Surface
    nail_surface_smooth BOOLEAN DEFAULT FALSE,
    nail_surface_ridged BOOLEAN DEFAULT FALSE,
    nail_surface_pitted BOOLEAN DEFAULT FALSE,
    nail_surface_grooved BOOLEAN DEFAULT FALSE,
    nail_surface_brittle BOOLEAN DEFAULT FALSE,
    
    -- Nail Hydration
    nail_hydration_hydrated BOOLEAN DEFAULT FALSE,
    nail_hydration_dehydrated BOOLEAN DEFAULT FALSE,
    nail_hydration_brittle BOOLEAN DEFAULT FALSE,
    
    -- Cuticle Condition
    cuticle_condition_intact BOOLEAN DEFAULT FALSE,
    cuticle_condition_overgrown BOOLEAN DEFAULT FALSE,
    cuticle_condition_dry BOOLEAN DEFAULT FALSE,
    cuticle_condition_inflamed BOOLEAN DEFAULT FALSE,
    cuticle_condition_damaged BOOLEAN DEFAULT FALSE,
    
    -- Nail Bed Condition
    nail_bed_condition_pink BOOLEAN DEFAULT FALSE,
    nail_bed_condition_pale BOOLEAN DEFAULT FALSE,
    nail_bed_condition_red BOOLEAN DEFAULT FALSE,
    nail_bed_condition_cyanotic BOOLEAN DEFAULT FALSE,
    nail_bed_condition_capillary_refill TEXT,
    
    -- Nail Disorders
    nail_disorders_onychomycosis BOOLEAN DEFAULT FALSE,
    nail_disorders_paronychia BOOLEAN DEFAULT FALSE,
    nail_disorders_beaus_lines BOOLEAN DEFAULT FALSE,
    nail_disorders_koilonychia BOOLEAN DEFAULT FALSE,
    nail_disorders_leukonychia BOOLEAN DEFAULT FALSE,
    nail_disorders_onycholysis BOOLEAN DEFAULT FALSE,
    
    -- Nail Growth Rate
    nail_growth_rate_moderate BOOLEAN DEFAULT FALSE,
    nail_growth_rate_slow BOOLEAN DEFAULT FALSE,
    nail_growth_rate_rapid BOOLEAN DEFAULT FALSE,
    
    -- Nail Care Routine
    nail_care_routine_trimming TEXT,
    nail_care_routine_polish TEXT,
    nail_care_routine_acrylic TEXT,
    nail_care_routine_harsh_chemicals TEXT,
    
    -- Nail Trauma
    nail_trauma_present BOOLEAN DEFAULT FALSE,
    nail_trauma_description TEXT,
    nail_trauma_evidence TEXT,
    
    -- Nail Injury/Trauma
    nail_injury_trauma_present BOOLEAN DEFAULT FALSE,
    nail_injury_trauma_description TEXT,
    nail_injury_trauma_evidence TEXT
);

-- Create hair_assessment_records table
CREATE TABLE IF NOT EXISTS hair_assessment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    date_of_service DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Hair Type
    hair_type_straight BOOLEAN DEFAULT FALSE,
    hair_type_wavy BOOLEAN DEFAULT FALSE,
    hair_type_curly BOOLEAN DEFAULT FALSE,
    hair_type_oily BOOLEAN DEFAULT FALSE,
    
    -- Hair Texture
    hair_texture_fine BOOLEAN DEFAULT FALSE,
    hair_texture_medium BOOLEAN DEFAULT FALSE,
    hair_texture_coarse BOOLEAN DEFAULT FALSE,
    
    -- Hair Color
    hair_color_natural BOOLEAN DEFAULT FALSE,
    hair_color_dyed BOOLEAN DEFAULT FALSE,
    hair_color_highlights_lowlights BOOLEAN DEFAULT FALSE,
    
    -- Hair Length
    hair_length_short BOOLEAN DEFAULT FALSE,
    hair_length_medium BOOLEAN DEFAULT FALSE,
    hair_length_long BOOLEAN DEFAULT FALSE,
    
    -- Scalp Sensitivity
    scalp_sensitivity_non_sensitive BOOLEAN DEFAULT FALSE,
    scalp_sensitivity_mildly_sensitive BOOLEAN DEFAULT FALSE,
    scalp_sensitivity_moderately_sensitive BOOLEAN DEFAULT FALSE,
    scalp_sensitivity_highly_sensitive BOOLEAN DEFAULT FALSE,
    
    -- Scalp Condition
    scalp_condition_dry BOOLEAN DEFAULT FALSE,
    scalp_condition_oily BOOLEAN DEFAULT FALSE,
    scalp_condition_flaky BOOLEAN DEFAULT FALSE,
    scalp_condition_irritated BOOLEAN DEFAULT FALSE,
    scalp_condition_normal BOOLEAN DEFAULT FALSE,
    
    -- Hair Density
    hair_density_thick BOOLEAN DEFAULT FALSE,
    hair_density_medium BOOLEAN DEFAULT FALSE,
    hair_density_thin BOOLEAN DEFAULT FALSE,
    
    -- Hair Elasticity
    hair_elasticity_elastic BOOLEAN DEFAULT FALSE,
    hair_elasticity_brittle BOOLEAN DEFAULT FALSE,
    hair_elasticity_prone_to_breakage BOOLEAN DEFAULT FALSE,
    
    -- Hair Porosity
    hair_porosity_low BOOLEAN DEFAULT FALSE,
    hair_porosity_normal BOOLEAN DEFAULT FALSE,
    hair_porosity_high BOOLEAN DEFAULT FALSE,
    
    -- Dandruff
    dandruff_present BOOLEAN DEFAULT FALSE,
    dandruff_amount TEXT,
    
    -- Scalp Conditions
    scalp_condition_psoriasis BOOLEAN DEFAULT FALSE,
    scalp_condition_seborrheic_dermatitis BOOLEAN DEFAULT FALSE,
    scalp_condition_acne BOOLEAN DEFAULT FALSE,
    scalp_condition_folliculitis BOOLEAN DEFAULT FALSE,
    scalp_condition_na BOOLEAN DEFAULT FALSE,
    
    -- Hair Loss
    hair_loss_present BOOLEAN DEFAULT FALSE,
    hair_loss_pattern TEXT,
    hair_loss_amount TEXT,
    hair_loss_duration TEXT,
    
    -- Hair Breakage
    hair_breakage_present BOOLEAN DEFAULT FALSE,
    hair_breakage_length TEXT,
    hair_breakage_frequency TEXT,
    hair_breakage_possible_causes TEXT,
    
    -- Split Ends
    split_ends_present BOOLEAN DEFAULT FALSE,
    split_ends_severity_mild BOOLEAN DEFAULT FALSE,
    split_ends_severity_moderate BOOLEAN DEFAULT FALSE,
    split_ends_severity_severe BOOLEAN DEFAULT FALSE,
    split_ends_distribution_localized BOOLEAN DEFAULT FALSE,
    split_ends_distribution_widespread BOOLEAN DEFAULT FALSE,
    
    -- Hair Care Routine
    hair_care_routine_shampoo TEXT,
    hair_care_routine_conditioner TEXT,
    hair_care_routine_styling_products TEXT,
    hair_care_routine_heat_styling TEXT,
    
    -- Hair Growth
    hair_growth_symmetrical BOOLEAN DEFAULT FALSE,
    hair_growth_asymmetrical BOOLEAN DEFAULT FALSE,
    hair_growth_normal_amount BOOLEAN DEFAULT FALSE,
    hair_growth_excessive_amount BOOLEAN DEFAULT FALSE,
    
    -- Body Hair
    body_hair_symmetrical BOOLEAN DEFAULT FALSE,
    body_hair_asymmetrical BOOLEAN DEFAULT FALSE,
    body_hair_normal_amount BOOLEAN DEFAULT FALSE,
    body_hair_excessive_amount BOOLEAN DEFAULT FALSE
);

-- Create skin_assessment_records table
CREATE TABLE IF NOT EXISTS skin_assessment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    physician_name TEXT NOT NULL,
    date_of_service DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Injuries
    pressure_ulcer_present BOOLEAN DEFAULT FALSE,
    pressure_ulcer_body_part TEXT,
    pressure_ulcer_size TEXT,
    pressure_ulcer_color TEXT,
    pressure_ulcer_shape TEXT,
    
    venous_ulcer_present BOOLEAN DEFAULT FALSE,
    venous_ulcer_body_part TEXT,
    venous_ulcer_size TEXT,
    venous_ulcer_color TEXT,
    venous_ulcer_shape TEXT,
    
    diabetic_ulcer_present BOOLEAN DEFAULT FALSE,
    diabetic_ulcer_body_part TEXT,
    diabetic_ulcer_size TEXT,
    diabetic_ulcer_color TEXT,
    diabetic_ulcer_shape TEXT,
    
    arterial_ulcer_present BOOLEAN DEFAULT FALSE,
    arterial_ulcer_body_part TEXT,
    arterial_ulcer_size TEXT,
    arterial_ulcer_color TEXT,
    arterial_ulcer_shape TEXT,
    
    surgical_ulcer_present BOOLEAN DEFAULT FALSE,
    surgical_ulcer_body_part TEXT,
    surgical_ulcer_size TEXT,
    surgical_ulcer_color TEXT,
    surgical_ulcer_shape TEXT,
    
    bruise_hematoma_present BOOLEAN DEFAULT FALSE,
    bruise_hematoma_body_part TEXT,
    bruise_hematoma_size TEXT,
    bruise_hematoma_color TEXT,
    bruise_hematoma_shape TEXT,
    
    abrasion_present BOOLEAN DEFAULT FALSE,
    abrasion_body_part TEXT,
    abrasion_size TEXT,
    abrasion_color TEXT,
    abrasion_shape TEXT,
    
    burn_present BOOLEAN DEFAULT FALSE,
    burn_body_part TEXT,
    burn_size TEXT,
    burn_color TEXT,
    burn_shape TEXT,
    
    rash_present BOOLEAN DEFAULT FALSE,
    rash_body_part TEXT,
    rash_size TEXT,
    rash_color TEXT,
    rash_shape TEXT,
    
    redness_present BOOLEAN DEFAULT FALSE,
    redness_body_part TEXT,
    redness_size TEXT,
    redness_color TEXT,
    redness_shape TEXT,
    
    blister_present BOOLEAN DEFAULT FALSE,
    blister_body_part TEXT,
    blister_size TEXT,
    blister_color TEXT,
    blister_shape TEXT,
    
    trauma_laceration_present BOOLEAN DEFAULT FALSE,
    trauma_laceration_body_part TEXT,
    trauma_laceration_size TEXT,
    trauma_laceration_color TEXT,
    trauma_laceration_shape TEXT,
    
    ostomy_peg_tube_present BOOLEAN DEFAULT FALSE,
    ostomy_peg_tube_body_part TEXT,
    ostomy_peg_tube_size TEXT,
    ostomy_peg_tube_color TEXT,
    ostomy_peg_tube_shape TEXT,
    
    maceration_present BOOLEAN DEFAULT FALSE,
    maceration_body_part TEXT,
    maceration_size TEXT,
    maceration_color TEXT,
    maceration_shape TEXT,
    
    -- Skin Type
    skin_type_normal BOOLEAN DEFAULT FALSE,
    skin_type_dry BOOLEAN DEFAULT FALSE,
    skin_type_oily BOOLEAN DEFAULT FALSE,
    skin_type_combination BOOLEAN DEFAULT FALSE,
    skin_type_sensitive BOOLEAN DEFAULT FALSE,
    
    -- Skin Color
    skin_color_pale BOOLEAN DEFAULT FALSE,
    skin_color_fair BOOLEAN DEFAULT FALSE,
    skin_color_medium BOOLEAN DEFAULT FALSE,
    skin_color_olive BOOLEAN DEFAULT FALSE,
    skin_color_dark BOOLEAN DEFAULT FALSE,
    
    -- Skin Texture
    skin_texture_smooth BOOLEAN DEFAULT FALSE,
    skin_texture_rough BOOLEAN DEFAULT FALSE,
    skin_texture_flaky BOOLEAN DEFAULT FALSE,
    skin_texture_bumpy BOOLEAN DEFAULT FALSE,
    skin_texture_uneven BOOLEAN DEFAULT FALSE,
    
    -- Skin Hydration
    skin_hydration_hydrated BOOLEAN DEFAULT FALSE,
    skin_hydration_dehydrated BOOLEAN DEFAULT FALSE,
    skin_hydration_moist BOOLEAN DEFAULT FALSE,
    skin_hydration_dry BOOLEAN DEFAULT FALSE,
    
    -- Skin Elasticity
    skin_elasticity_elastic BOOLEAN DEFAULT FALSE,
    skin_elasticity_sagging BOOLEAN DEFAULT FALSE,
    skin_elasticity_tight BOOLEAN DEFAULT FALSE,
    skin_elasticity_wrinkled BOOLEAN DEFAULT FALSE,
    
    -- Skin Sensitivity
    skin_sensitivity_non_sensitive BOOLEAN DEFAULT FALSE,
    skin_sensitivity_mildly_sensitive BOOLEAN DEFAULT FALSE,
    skin_sensitivity_moderately_sensitive BOOLEAN DEFAULT FALSE,
    skin_sensitivity_highly_sensitive BOOLEAN DEFAULT FALSE,
    
    -- Pigmentation
    pigmentation_freckles BOOLEAN DEFAULT FALSE,
    pigmentation_age_spots BOOLEAN DEFAULT FALSE,
    pigmentation_sun_spots BOOLEAN DEFAULT FALSE,
    pigmentation_hyperpigmentation BOOLEAN DEFAULT FALSE,
    pigmentation_hypopigmentation BOOLEAN DEFAULT FALSE,
    
    -- Skin Conditions
    skin_condition_acne BOOLEAN DEFAULT FALSE,
    skin_condition_eczema BOOLEAN DEFAULT FALSE,
    skin_condition_psoriasis BOOLEAN DEFAULT FALSE,
    skin_condition_rosacea BOOLEAN DEFAULT FALSE,
    skin_condition_dermatitis BOOLEAN DEFAULT FALSE,
    skin_condition_na BOOLEAN DEFAULT FALSE,
    
    -- Sun Damage
    sun_damage_sunburn BOOLEAN DEFAULT FALSE,
    sun_damage_sunspots BOOLEAN DEFAULT FALSE,
    sun_damage_wrinkles BOOLEAN DEFAULT FALSE,
    sun_damage_texture_changes BOOLEAN DEFAULT FALSE,
    
    -- Elasticity Assessment
    elasticity_assessment_goes_back_within_1_second BOOLEAN DEFAULT FALSE,
    elasticity_assessment_does_not_go_back_within_1_second BOOLEAN DEFAULT FALSE,
    
    -- Temperature Assessment
    temperature_assessment_warmth BOOLEAN DEFAULT FALSE,
    temperature_assessment_cool BOOLEAN DEFAULT FALSE,
    temperature_assessment_abnormal_changes BOOLEAN DEFAULT FALSE,
    
    -- Other Assessment
    other_assessment_sensitive_skin BOOLEAN DEFAULT FALSE,
    other_assessment_medicine_allergy BOOLEAN DEFAULT FALSE,
    other_assessment_skincare_routine TEXT,
    other_assessment_products_used TEXT,
    other_assessment_frequency_of_use TEXT,
    other_assessment_products JSONB,
    other_assessment_physician_notes TEXT,
    other_assessment_allergy_details TEXT,
    other_assessment_diagnosis TEXT,
    other_assessment_medications_and_treatments TEXT
);

-- Create indexes for skin assessment records
DO $$ BEGIN
    CREATE INDEX idx_skin_assessment_records_full_name ON skin_assessment_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_skin_assessment_records_date ON skin_assessment_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_skin_assessment_records_physician ON skin_assessment_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_skin_assessment_records_updated_at
        BEFORE UPDATE ON skin_assessment_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes if they don't exist
DO $$ BEGIN
    CREATE INDEX idx_patients_full_name ON patients(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_vital_signs_full_name ON vital_signs(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_health_history_full_name ON health_history(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_health_history_records_full_name ON health_history_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create index for health assessment table
DO $$ BEGIN
    CREATE INDEX idx_health_assessment_full_name ON health_assessment(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create index on full_name for faster lookups
DO $$ BEGIN
    CREATE INDEX idx_physical_health_records_full_name ON physical_health_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_patients_updated_at
        BEFORE UPDATE ON patients
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_vital_signs_updated_at
        BEFORE UPDATE ON vital_signs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_health_history_updated_at
        BEFORE UPDATE ON health_history
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_health_history_records_updated_at
        BEFORE UPDATE ON health_history_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_health_assessment_updated_at
        BEFORE UPDATE ON health_assessment
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create trigger to update updated_at timestamp
DO $$ BEGIN
    CREATE TRIGGER update_physical_health_records_updated_at
        BEFORE UPDATE ON physical_health_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update age when date_of_birth changes
CREATE OR REPLACE FUNCTION update_patient_age()
RETURNS TRIGGER AS $$
BEGIN
    NEW.age := calculate_age(NEW.date_of_birth);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER update_patient_age_trigger
        BEFORE INSERT OR UPDATE ON patients
        FOR EACH ROW
        EXECUTE FUNCTION update_patient_age();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create function to calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi(weight DECIMAL, height DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN weight / ((height/100) * (height/100));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update BMI when weight or height changes
CREATE OR REPLACE FUNCTION update_vital_signs_bmi()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.weight IS NOT NULL AND NEW.height IS NOT NULL THEN
        NEW.bmi := calculate_bmi(NEW.weight, NEW.height);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER update_vital_signs_bmi_trigger
        BEFORE INSERT OR UPDATE ON vital_signs
        FOR EACH ROW
        EXECUTE FUNCTION update_vital_signs_bmi();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nurses_full_name ON nurses(full_name);
CREATE INDEX IF NOT EXISTS idx_nurses_email ON nurses(email);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_nurses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_nurses_updated_at_trigger
        BEFORE UPDATE ON nurses
        FOR EACH ROW
        EXECUTE FUNCTION update_nurses_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for nail assessment records
DO $$ BEGIN
    CREATE INDEX idx_nail_assessment_records_full_name ON nail_assessment_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_nail_assessment_records_date ON nail_assessment_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_nail_assessment_records_physician ON nail_assessment_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_nail_assessment_records_updated_at
        BEFORE UPDATE ON nail_assessment_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for hair assessment records
DO $$ BEGIN
    CREATE INDEX idx_hair_assessment_records_full_name ON hair_assessment_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_hair_assessment_records_date ON hair_assessment_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_hair_assessment_records_physician ON hair_assessment_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_hair_assessment_records_updated_at
        BEFORE UPDATE ON hair_assessment_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create medication_administration_records table
CREATE TABLE IF NOT EXISTS medication_administration_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    physician_name VARCHAR(255) NOT NULL,
    date_of_service DATE NOT NULL,
    medications JSONB NOT NULL,
    allergies TEXT,
    adverse_drug_effects TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for medication administration records
DO $$ BEGIN
    CREATE INDEX idx_medication_administration_records_full_name ON medication_administration_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_medication_administration_records_date ON medication_administration_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_medication_administration_records_physician ON medication_administration_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_medication_administration_records_updated_at
        BEFORE UPDATE ON medication_administration_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create nurses_notes_records table
CREATE TABLE IF NOT EXISTS nurses_notes_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    physician_name VARCHAR(255) NOT NULL,
    date_of_service DATE NOT NULL,
    
    -- Documentation Details
    documentation_to TEXT,
    risk_level VARCHAR(50),
    assessment_time_frame VARCHAR(50),
    documentation_method VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for nurses notes records
DO $$ BEGIN
    CREATE INDEX idx_nurses_notes_records_full_name ON nurses_notes_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_nurses_notes_records_date ON nurses_notes_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_nurses_notes_records_physician ON nurses_notes_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_nurses_notes_records_updated_at
        BEFORE UPDATE ON nurses_notes_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create extensive_medical_assistance_records table
CREATE TABLE IF NOT EXISTS extensive_medical_assistance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    physician_name VARCHAR(255) NOT NULL,
    date_of_service DATE NOT NULL,
    time_of_service TIME NOT NULL,
    assistance_type VARCHAR(255) NOT NULL,
    medical_condition TEXT,
    symptoms TEXT,
    allergies TEXT,
    current_medications TEXT,
    medical_history TEXT,
    previous_treatments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for extensive medical assistance records
DO $$ BEGIN
    CREATE INDEX idx_extensive_medical_assistance_records_full_name ON extensive_medical_assistance_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_extensive_medical_assistance_records_date ON extensive_medical_assistance_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_extensive_medical_assistance_records_physician ON extensive_medical_assistance_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_extensive_medical_assistance_records_updated_at
        BEFORE UPDATE ON extensive_medical_assistance_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create deworming_records table
CREATE TABLE IF NOT EXISTS deworming_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    physician_name VARCHAR(255) NOT NULL,
    date_of_service DATE NOT NULL,
    time_of_service TIME NOT NULL,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    previous_deworming TEXT,
    allergies TEXT,
    current_medications TEXT,
    symptoms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for deworming records
DO $$ BEGIN
    CREATE INDEX idx_deworming_records_full_name ON deworming_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_deworming_records_date ON deworming_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_deworming_records_physician ON deworming_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_deworming_records_updated_at
        BEFORE UPDATE ON deworming_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create emergency_response_records table
CREATE TABLE IF NOT EXISTS emergency_response_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    physician_name VARCHAR(255) NOT NULL,
    date_of_service DATE NOT NULL,
    time_of_service TIME NOT NULL,
    emergency_type VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    patient_condition TEXT NOT NULL,
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    previous_treatments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for emergency response records
DO $$ BEGIN
    CREATE INDEX idx_emergency_response_records_full_name ON emergency_response_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_emergency_response_records_date ON emergency_response_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_emergency_response_records_physician ON emergency_response_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_emergency_response_records_updated_at
        BEFORE UPDATE ON emergency_response_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create vaccination_records table
CREATE TABLE IF NOT EXISTS vaccination_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    physician_name VARCHAR(255) NOT NULL,
    date_of_service DATE NOT NULL,
    time_of_service TIME NOT NULL,
    vaccine_type VARCHAR(255) NOT NULL,
    previous_vaccinations TEXT,
    allergies TEXT,
    current_medications TEXT,
    health_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for vaccination records
DO $$ BEGIN
    CREATE INDEX idx_vaccination_records_full_name ON vaccination_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_vaccination_records_date ON vaccination_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_vaccination_records_physician ON vaccination_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_vaccination_records_updated_at
        BEFORE UPDATE ON vaccination_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create nutrition_diet_records table
CREATE TABLE IF NOT EXISTS nutrition_diet_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    physician_name VARCHAR(255) NOT NULL,
    date_of_service DATE NOT NULL,
    time_of_service TIME NOT NULL,
    diet_type VARCHAR(255) NOT NULL,
    food_allergies TEXT,
    current_medications TEXT,
    health_conditions TEXT,
    dietary_restrictions TEXT,
    nutritional_goals TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for nutrition diet records
DO $$ BEGIN
    CREATE INDEX idx_nutrition_diet_records_full_name ON nutrition_diet_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_nutrition_diet_records_date ON nutrition_diet_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_nutrition_diet_records_physician ON nutrition_diet_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_nutrition_diet_records_updated_at
        BEFORE UPDATE ON nutrition_diet_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create medical_checkup_records table
CREATE TABLE IF NOT EXISTS medical_checkup_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL REFERENCES patients(full_name) ON DELETE CASCADE,
    physician_id UUID REFERENCES nurses(id),
    physician_name VARCHAR(255) NOT NULL,
    date_of_service DATE NOT NULL,
    time_of_service TIME NOT NULL,
    checkup_type VARCHAR(255) NOT NULL,
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    health_conditions TEXT,
    symptoms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for medical checkup records
DO $$ BEGIN
    CREATE INDEX idx_medical_checkup_records_full_name ON medical_checkup_records(full_name);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_medical_checkup_records_date ON medical_checkup_records(date_of_service);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_medical_checkup_records_physician ON medical_checkup_records(physician_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_medical_checkup_records_updated_at
        BEFORE UPDATE ON medical_checkup_records
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$; 