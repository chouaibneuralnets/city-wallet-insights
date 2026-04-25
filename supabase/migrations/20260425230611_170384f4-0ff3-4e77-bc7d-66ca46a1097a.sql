
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  profile TEXT NOT NULL,
  action TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT 'newcomers',
  status TEXT NOT NULL DEFAULT 'sending',
  is_mia BOOLEAN NOT NULL DEFAULT false,
  offer_id UUID,
  redemption_id UUID,
  amount NUMERIC,
  source TEXT NOT NULL DEFAULT 'ai-scan',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view activity_logs"
  ON public.activity_logs FOR SELECT USING (true);

CREATE POLICY "Public can insert activity_logs"
  ON public.activity_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update activity_logs"
  ON public.activity_logs FOR UPDATE USING (true);

CREATE TRIGGER trg_activity_logs_updated_at
  BEFORE UPDATE ON public.activity_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_activity_logs_occurred_at ON public.activity_logs (occurred_at DESC);
CREATE INDEX idx_activity_logs_redemption_id ON public.activity_logs (redemption_id);

ALTER TABLE public.activity_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
