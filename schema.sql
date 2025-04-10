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
    chief_complaint TEXT,
    past_medical_conditions JSONB DEFAULT '{"occasionalColds": false, "anemia": false, "other": ""}',
    past_surgical_history JSONB DEFAULT '{"hadSurgery": "", "surgeries": []}',
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