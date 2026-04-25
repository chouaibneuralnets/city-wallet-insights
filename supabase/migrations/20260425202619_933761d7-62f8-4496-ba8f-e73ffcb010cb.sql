-- Real-time wallet proximity pings (City-Wallet geofence beacon)
CREATE TABLE public.wallet_pings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_mia BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallet_pings_created_at ON public.wallet_pings (created_at DESC);
CREATE INDEX idx_wallet_pings_wallet_id ON public.wallet_pings (wallet_id);

ALTER TABLE public.wallet_pings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view wallet_pings"
  ON public.wallet_pings FOR SELECT
  USING (true);

CREATE POLICY "Public can insert wallet_pings"
  ON public.wallet_pings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update wallet_pings"
  ON public.wallet_pings FOR UPDATE
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_pings;