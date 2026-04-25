-- Configure REPLICA IDENTITY FULL to send old values on updates
ALTER TABLE public.offers_config REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.offers_config;