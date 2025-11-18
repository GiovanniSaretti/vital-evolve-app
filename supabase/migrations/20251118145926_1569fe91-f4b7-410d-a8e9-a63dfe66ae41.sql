-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('patient', 'professional', 'admin');

-- Create enum for profession types
CREATE TYPE public.profession_type AS ENUM (
  'nutricionista',
  'fisioterapeuta',
  'educador_fisico',
  'cardiologista',
  'endocrinologista',
  'clinico_geral',
  'psicologo',
  'nefrologista',
  'ortopedista',
  'personal_trainer',
  'outro'
);

-- Create enum for attendance mode
CREATE TYPE public.attendance_mode AS ENUM ('presencial', 'online', 'hibrido');

-- Create enum for patient status
CREATE TYPE public.patient_status AS ENUM ('pending', 'active', 'rejected', 'inactive');

-- Create enum for prescription type
CREATE TYPE public.prescription_type AS ENUM (
  'plano_alimentar',
  'plano_treino',
  'fisioterapia',
  'reabilitacao_cardiaca',
  'plano_comportamental',
  'plano_geral'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create health_professionals table
CREATE TABLE public.health_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birthdate DATE,
  gender TEXT,
  cpf TEXT,
  profession profession_type NOT NULL,
  license_number TEXT NOT NULL,
  license_state TEXT NOT NULL,
  experience_years INTEGER,
  specialties TEXT[],
  attendance_mode attendance_mode DEFAULT 'presencial',
  clinic_name TEXT,
  clinic_address TEXT,
  clinic_hours TEXT,
  document_url TEXT,
  selfie_url TEXT,
  verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.health_professionals ENABLE ROW LEVEL SECURITY;

-- Create professional_patients relationship table
CREATE TABLE public.professional_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.health_professionals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status patient_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(professional_id, patient_id)
);

ALTER TABLE public.professional_patients ENABLE ROW LEVEL SECURITY;

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.health_professionals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type prescription_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  objective TEXT,
  duration_days INTEGER,
  rules TEXT,
  content JSONB,
  pdf_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.health_professionals(id) ON DELETE SET NULL,
  exam_type TEXT NOT NULL,
  exam_date DATE NOT NULL,
  file_url TEXT,
  notes TEXT,
  professional_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for health_professionals
CREATE POLICY "Professionals can view their own profile"
ON public.health_professionals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Professionals can update their own profile"
ON public.health_professionals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view verified professionals"
ON public.health_professionals FOR SELECT
USING (verified = true);

CREATE POLICY "Professionals can insert their own profile"
ON public.health_professionals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for professional_patients
CREATE POLICY "Professionals can view their patients"
ON public.professional_patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.health_professionals
    WHERE id = professional_patients.professional_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Patients can view their professionals"
ON public.professional_patients FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can request professional"
ON public.professional_patients FOR INSERT
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Professionals can update patient status"
ON public.professional_patients FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.health_professionals
    WHERE id = professional_patients.professional_id
    AND user_id = auth.uid()
  )
);

-- RLS Policies for prescriptions
CREATE POLICY "Professionals can create prescriptions"
ON public.prescriptions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.health_professionals
    WHERE id = prescriptions.professional_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can view their prescriptions"
ON public.prescriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.health_professionals
    WHERE id = prescriptions.professional_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Patients can view their prescriptions"
ON public.prescriptions FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Professionals can update their prescriptions"
ON public.prescriptions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.health_professionals
    WHERE id = prescriptions.professional_id
    AND user_id = auth.uid()
  )
);

-- RLS Policies for exams
CREATE POLICY "Patients can manage their exams"
ON public.exams FOR ALL
USING (auth.uid() = patient_id);

CREATE POLICY "Professionals can view patient exams"
ON public.exams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.health_professionals hp
    JOIN public.professional_patients pp ON pp.professional_id = hp.id
    WHERE hp.user_id = auth.uid()
    AND pp.patient_id = exams.patient_id
    AND pp.status = 'active'
  )
);

CREATE POLICY "Professionals can update exam analysis"
ON public.exams FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.health_professionals hp
    JOIN public.professional_patients pp ON pp.professional_id = hp.id
    WHERE hp.user_id = auth.uid()
    AND pp.patient_id = exams.patient_id
    AND pp.status = 'active'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_health_professionals_updated_at
BEFORE UPDATE ON public.health_professionals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_professional_patients_updated_at
BEFORE UPDATE ON public.professional_patients
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically assign patient role on profile creation
CREATE OR REPLACE FUNCTION public.assign_default_patient_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'patient')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_assign_patient_role
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.assign_default_patient_role();