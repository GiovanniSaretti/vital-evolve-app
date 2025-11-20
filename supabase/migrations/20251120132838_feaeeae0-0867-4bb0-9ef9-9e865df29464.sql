-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  professional_id UUID NOT NULL REFERENCES health_professionals(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  appointment_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  professional_id UUID NOT NULL REFERENCES health_professionals(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Appointments RLS policies
CREATE POLICY "Patients can view their appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create appointment requests"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Professionals can view their appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM health_professionals
  WHERE health_professionals.id = appointments.professional_id
  AND health_professionals.user_id = auth.uid()
));

CREATE POLICY "Professionals can update appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM health_professionals
  WHERE health_professionals.id = appointments.professional_id
  AND health_professionals.user_id = auth.uid()
));

-- Conversations RLS policies
CREATE POLICY "Patients can view their conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Professionals can view their conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM health_professionals
  WHERE health_professionals.id = conversations.professional_id
  AND health_professionals.user_id = auth.uid()
));

CREATE POLICY "Professionals can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM health_professionals
  WHERE health_professionals.id = conversations.professional_id
  AND health_professionals.user_id = auth.uid()
));

-- Messages RLS policies
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id 
  OR EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.patient_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM health_professionals
        WHERE health_professionals.id = conversations.professional_id
        AND health_professionals.user_id = auth.uid()
      ))
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.patient_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM health_professionals
        WHERE health_professionals.id = conversations.professional_id
        AND health_professionals.user_id = auth.uid()
      ))
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.patient_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM health_professionals
        WHERE health_professionals.id = conversations.professional_id
        AND health_professionals.user_id = auth.uid()
      ))
  )
);

-- Create indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_conversations_patient ON conversations(patient_id);
CREATE INDEX idx_conversations_professional ON conversations(professional_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;