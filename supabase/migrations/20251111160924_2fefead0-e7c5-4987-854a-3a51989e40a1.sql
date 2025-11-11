-- Create storage buckets for meal photos and progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('meal-photos', 'meal-photos', true),
  ('progress-photos', 'progress-photos', true);

-- RLS policies for meal-photos bucket
CREATE POLICY "Users can view their own meal photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own meal photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own meal photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own meal photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for progress-photos bucket
CREATE POLICY "Users can view their own progress photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own progress photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own progress photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own progress photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);