CREATE TABLE IF NOT EXISTS public.dsa_sheet_questions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    section TEXT NOT NULL,
    subgroup TEXT,
    difficulty TEXT NOT NULL,
    practice_links TEXT[] NOT NULL DEFAULT '{}',
    resource_links TEXT[] NOT NULL DEFAULT '{}',
    video_url TEXT NOT NULL DEFAULT '',
    companies TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    section_order INTEGER NOT NULL DEFAULT 0,
    item_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.set_dsa_sheet_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dsa_sheet_questions_set_updated_at ON public.dsa_sheet_questions;
CREATE TRIGGER dsa_sheet_questions_set_updated_at
BEFORE UPDATE ON public.dsa_sheet_questions
FOR EACH ROW
EXECUTE FUNCTION public.set_dsa_sheet_questions_updated_at();

ALTER TABLE public.dsa_sheet_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view dsa sheet questions" ON public.dsa_sheet_questions;
CREATE POLICY "Anyone can view dsa sheet questions"
ON public.dsa_sheet_questions
FOR SELECT
USING (true);
