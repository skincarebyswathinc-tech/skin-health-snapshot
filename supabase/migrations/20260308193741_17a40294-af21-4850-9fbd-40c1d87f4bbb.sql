
-- Clinic accounts table
CREATE TABLE public.clinic_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name text NOT NULL,
  admin_user_id uuid NOT NULL,
  subscription_plan text NOT NULL DEFAULT 'starter',
  max_patients integer NOT NULL DEFAULT 50,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.clinic_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic admins can view their clinic" ON public.clinic_accounts
  FOR SELECT TO authenticated
  USING (auth.uid() = admin_user_id);

CREATE POLICY "Clinic admins can update their clinic" ON public.clinic_accounts
  FOR UPDATE TO authenticated
  USING (auth.uid() = admin_user_id);

CREATE POLICY "Authenticated users can create clinics" ON public.clinic_accounts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = admin_user_id);

-- Clinic patients linking table (links clinics to existing SkinPulse users)
CREATE TABLE public.clinic_patients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid NOT NULL REFERENCES public.clinic_accounts(id) ON DELETE CASCADE,
  patient_user_id uuid NOT NULL,
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  notes text,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(clinic_id, patient_email)
);

ALTER TABLE public.clinic_patients ENABLE ROW LEVEL SECURITY;

-- Clinic admins can manage their patients
CREATE OR REPLACE FUNCTION public.is_clinic_admin(_user_id uuid, _clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinic_accounts
    WHERE id = _clinic_id AND admin_user_id = _user_id
  )
$$;

CREATE POLICY "Clinic admins can view their patients" ON public.clinic_patients
  FOR SELECT TO authenticated
  USING (public.is_clinic_admin(auth.uid(), clinic_id));

CREATE POLICY "Clinic admins can add patients" ON public.clinic_patients
  FOR INSERT TO authenticated
  WITH CHECK (public.is_clinic_admin(auth.uid(), clinic_id));

CREATE POLICY "Clinic admins can update patients" ON public.clinic_patients
  FOR UPDATE TO authenticated
  USING (public.is_clinic_admin(auth.uid(), clinic_id));

CREATE POLICY "Clinic admins can remove patients" ON public.clinic_patients
  FOR DELETE TO authenticated
  USING (public.is_clinic_admin(auth.uid(), clinic_id));

-- Patients can view their own link
CREATE POLICY "Patients can view their own clinic link" ON public.clinic_patients
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_user_id);

-- Trigger for updated_at on clinic_accounts
CREATE TRIGGER update_clinic_accounts_updated_at
  BEFORE UPDATE ON public.clinic_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
