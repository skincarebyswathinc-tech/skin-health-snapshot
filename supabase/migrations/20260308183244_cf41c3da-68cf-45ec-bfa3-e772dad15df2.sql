-- Lifestyle journal logs
CREATE TABLE public.lifestyle_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours numeric(3,1),
  water_intake_liters numeric(3,1),
  stress_level integer,
  diet_quality integer,
  exercise_minutes integer DEFAULT 0,
  sugar_intake_level text DEFAULT 'medium',
  dairy_intake_level text DEFAULT 'medium',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.lifestyle_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs" ON public.lifestyle_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs" ON public.lifestyle_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs" ON public.lifestyle_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own logs" ON public.lifestyle_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_lifestyle_logs_updated_at BEFORE UPDATE ON public.lifestyle_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Skin progress metrics (auto-populated from scans)
CREATE TABLE public.skin_progress_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id uuid REFERENCES public.scans(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  skin_score integer,
  hydration_score integer,
  texture_score integer,
  pigmentation_score integer,
  inflammation_score integer,
  elasticity_score integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.skin_progress_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON public.skin_progress_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.skin_progress_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress" ON public.skin_progress_metrics FOR DELETE TO authenticated USING (auth.uid() = user_id);