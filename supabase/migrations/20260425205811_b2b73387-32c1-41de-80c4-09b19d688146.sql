-- Add generated_text column as the canonical text seen by Mia's wallet app
ALTER TABLE public.offers_config
  ADD COLUMN IF NOT EXISTS generated_text text;

-- Backfill from the existing 'message' column where available
UPDATE public.offers_config
SET generated_text = message
WHERE generated_text IS NULL AND message IS NOT NULL;

-- Enable realtime on offers_config so Magic Preview + Mia app stay in sync live
ALTER TABLE public.offers_config REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'offers_config'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.offers_config';
  END IF;
END $$;