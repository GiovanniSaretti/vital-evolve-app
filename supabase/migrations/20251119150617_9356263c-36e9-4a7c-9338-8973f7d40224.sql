-- Allow professionals to view their active patients' profiles
CREATE POLICY "Professionals can view active patients profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM health_professionals hp
    JOIN professional_patients pp ON pp.professional_id = hp.id
    WHERE hp.user_id = auth.uid()
      AND pp.patient_id = profiles.id
      AND pp.status = 'active'
  )
);

-- Allow professionals to view their active patients' meals
CREATE POLICY "Professionals can view active patients meals"
ON public.meals
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM health_professionals hp
    JOIN professional_patients pp ON pp.professional_id = hp.id
    WHERE hp.user_id = auth.uid()
      AND pp.patient_id = meals.user_id
      AND pp.status = 'active'
  )
);

-- Allow professionals to view their active patients' medications
CREATE POLICY "Professionals can view active patients medications"
ON public.medications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM health_professionals hp
    JOIN professional_patients pp ON pp.professional_id = hp.id
    WHERE hp.user_id = auth.uid()
      AND pp.patient_id = medications.user_id
      AND pp.status = 'active'
  )
);

-- Allow professionals to view their active patients' workouts
CREATE POLICY "Professionals can view active patients workouts"
ON public.workouts
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM health_professionals hp
    JOIN professional_patients pp ON pp.professional_id = hp.id
    WHERE hp.user_id = auth.uid()
      AND pp.patient_id = workouts.user_id
      AND pp.status = 'active'
  )
);

-- Allow professionals to view their active patients' measurements
CREATE POLICY "Professionals can view active patients measurements"
ON public.measurements
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM health_professionals hp
    JOIN professional_patients pp ON pp.professional_id = hp.id
    WHERE hp.user_id = auth.uid()
      AND pp.patient_id = measurements.user_id
      AND pp.status = 'active'
  )
);

-- Allow professionals to view their active patients' mood logs
CREATE POLICY "Professionals can view active patients mood logs"
ON public.mood_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM health_professionals hp
    JOIN professional_patients pp ON pp.professional_id = hp.id
    WHERE hp.user_id = auth.uid()
      AND pp.patient_id = mood_logs.user_id
      AND pp.status = 'active'
  )
);