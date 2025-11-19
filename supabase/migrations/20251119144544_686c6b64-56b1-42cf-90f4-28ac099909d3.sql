-- Remove the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view verified professionals" ON public.health_professionals;

-- Create a more restrictive policy: only authenticated users can view verified professionals
-- Application layer should filter sensitive fields when displaying public profiles
CREATE POLICY "Authenticated users can view verified professionals"
ON public.health_professionals
FOR SELECT
TO authenticated
USING (verified = true);

-- Note: The application should only query/display non-sensitive fields for public profiles:
-- Safe fields: full_name, profession, specialties, clinic_name, attendance_mode, experience_years
-- Sensitive fields to exclude: email, phone, cpf, birthdate, clinic_address, license_number, 
-- license_state, document_url, selfie_url, avatar_url (optional)