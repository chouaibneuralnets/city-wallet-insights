ALTER TABLE public.system_state
  ADD COLUMN IF NOT EXISTS rules_enabled boolean NOT NULL DEFAULT false;

INSERT INTO public.system_state (id, rules_enabled)
VALUES ('global', false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.system_state REPLICA IDENTITY FULL;