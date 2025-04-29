-- Create storage bucket for TPR sheets
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'tpr-sheets') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('tpr-sheets', 'tpr-sheets', true);
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads to TPR sheets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to TPR sheets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to TPR sheets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes to TPR sheets" ON storage.objects;

-- Create storage policies for TPR sheets bucket
CREATE POLICY "Allow public uploads to TPR sheets"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'tpr-sheets');

CREATE POLICY "Allow public access to TPR sheets"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'tpr-sheets');

CREATE POLICY "Allow public updates to TPR sheets"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'tpr-sheets');

CREATE POLICY "Allow public deletes to TPR sheets"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'tpr-sheets'); 