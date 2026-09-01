-- Migration: Add slug column to notes and backfill existing records

-- 1. Add slug column to public.notes
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Backfill existing notes with URL-friendly slugs from their titles
UPDATE public.notes
SET slug = lower(
  trim(both '-' from 
    regexp_replace(
      regexp_replace(
        lower(title),
        '[^a-z0-9\s-]', '', 'g'
      ),
      '[\s_-]+', '-', 'g'
    )
  )
)
WHERE slug IS NULL OR slug = '';

-- 3. In case any duplicates exist, append first 8 chars of id to make them unique
UPDATE public.notes n1
SET slug = n1.slug || '-' || substr(n1.id::text, 1, 8)
WHERE EXISTS (
  SELECT 1 FROM public.notes n2 
  WHERE n2.slug = n1.slug AND n2.id <> n1.id
);

-- 4. Set NOT NULL and UNIQUE constraint on slug
ALTER TABLE public.notes ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.notes ADD CONSTRAINT notes_slug_unique UNIQUE (slug);

-- 5. Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS notes_slug_idx ON public.notes(slug);
