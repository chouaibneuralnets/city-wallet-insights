-- Create system_state table as single source of truth for cross-project state
CREATE TABLE public.system_state (
  id TEXT NOT NULL PRIMARY KEY,
  current_temp INTEGER,
  weather_condition TEXT,
  city TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_state ENABLE ROW LEVEL SECURITY;

-- Public read access (other projects must be able to read official state)
CREATE POLICY "Public can view system_state"
ON public.system_state
FOR SELECT
USING (true);

-- Public insert (weather service performs upserts)
CREATE POLICY "Public can insert system_state"
ON public.system_state
FOR INSERT
WITH CHECK (true);

-- Public update (weather service performs upserts)
CREATE POLICY "Public can update system_state"
ON public.system_state
FOR UPDATE
USING (true);

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_system_state_updated_at
BEFORE UPDATE ON public.system_state
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for cross-project synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_state;

-- Seed canonical row for Stuttgart weather
INSERT INTO public.system_state (id, current_temp, weather_condition, city, description)
VALUES ('stuttgart_weather', NULL, NULL, 'Stuttgart', NULL);
