CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    title TEXT NOT NULL,
    portfolio_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- This app uses a privileged server-side Supabase key.
-- Keep that key secret and never put it in public frontend files.
-- The server-side key bypasses RLS; add authentication/authorization before deployment.
