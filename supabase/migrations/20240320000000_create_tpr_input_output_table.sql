-- Create tpr_input_output_records table
CREATE TABLE IF NOT EXISTS tpr_input_output_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    physician_id UUID NOT NULL,
    physician_name TEXT NOT NULL,
    date_of_service DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tpr_sheet_url TEXT,
    new_food_today BOOLEAN DEFAULT FALSE,
    fiber_intake TEXT,
    fluid_intake TEXT,
    parenteral TEXT,
    water_intake TEXT,
    urine_output TEXT,
    stool_date_time TIMESTAMP WITH TIME ZONE,
    stool_consistency TEXT,
    stool_color TEXT,
    stool_amount TEXT,
    stool_straining BOOLEAN DEFAULT FALSE,
    stool_pain BOOLEAN DEFAULT FALSE,
    stool_blood_mucus BOOLEAN DEFAULT FALSE,
    stool_odor TEXT,
    FOREIGN KEY (physician_id) REFERENCES staff(id)
);

-- Create index on full_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_tpr_input_output_full_name ON tpr_input_output_records(full_name);

-- Create index on date_of_service for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_tpr_input_output_date ON tpr_input_output_records(date_of_service);

-- Add RLS policies
ALTER TABLE tpr_input_output_records ENABLE ROW LEVEL SECURITY;

-- Policy for viewing records
CREATE POLICY "Allow viewing own records" ON tpr_input_output_records
    FOR SELECT
    USING (auth.uid() = physician_id);

-- Policy for inserting records
CREATE POLICY "Allow inserting own records" ON tpr_input_output_records
    FOR INSERT
    WITH CHECK (auth.uid() = physician_id);

-- Policy for updating records
CREATE POLICY "Allow updating own records" ON tpr_input_output_records
    FOR UPDATE
    USING (auth.uid() = physician_id)
    WITH CHECK (auth.uid() = physician_id);

-- Policy for deleting records
CREATE POLICY "Allow deleting own records" ON tpr_input_output_records
    FOR DELETE
    USING (auth.uid() = physician_id); 