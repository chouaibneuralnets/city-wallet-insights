CREATE TABLE public.offers_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  weather TEXT NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 20,
  product TEXT NOT NULL DEFAULT 'Café',
  traffic_condition TEXT DEFAULT 'low',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.offers_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view offers_config"
  ON public.offers_config FOR SELECT
  USING (true);

CREATE POLICY "Public can insert offers_config"
  ON public.offers_config FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update offers_config"
  ON public.offers_config FOR UPDATE
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_offers_config_updated_at
  BEFORE UPDATE ON public.offers_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();