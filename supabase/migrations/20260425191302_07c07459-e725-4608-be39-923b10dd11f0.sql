-- Create redemptions table to track offers sent + accepted (payments)
CREATE TABLE public.redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID REFERENCES public.offers_config(id) ON DELETE SET NULL,
  product TEXT NOT NULL DEFAULT 'Café',
  amount NUMERIC(10,2) NOT NULL DEFAULT 3.50,
  discount_percent INTEGER NOT NULL DEFAULT 20,
  weather TEXT,
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent' | 'accepted'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- Public access policies (demo / hackathon — no auth)
CREATE POLICY "Public can view redemptions"
  ON public.redemptions FOR SELECT
  USING (true);

CREATE POLICY "Public can insert redemptions"
  ON public.redemptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update redemptions"
  ON public.redemptions FOR UPDATE
  USING (true);

-- Auto-update updated_at
CREATE TRIGGER update_redemptions_updated_at
BEFORE UPDATE ON public.redemptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_redemptions_status ON public.redemptions(status);
CREATE INDEX idx_redemptions_created_at ON public.redemptions(created_at DESC);

-- Realtime
ALTER TABLE public.redemptions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.redemptions;