ALTER TABLE public.members ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
