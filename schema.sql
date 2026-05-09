create extension if not exists pgcrypto;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  year text not null,
  paper text not null,
  keywords text[],
  description text,
  drive_url text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  search_vector tsvector
);

create or replace function public.set_notes_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    to_tsvector(
      'english',
      new.title || ' ' ||
      new.subject || ' ' ||
      coalesce(new.description, '') || ' ' ||
      coalesce(array_to_string(new.keywords, ' '), '')
    );
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists notes_search_vector_trigger on public.notes;

create trigger notes_search_vector_trigger
before insert or update on public.notes
for each row
execute function public.set_notes_search_vector();

create index if not exists notes_search_vector_idx
on public.notes
using gin (search_vector);

alter table public.notes enable row level security;

drop policy if exists "Public can view active notes" on public.notes;

create policy "Public can view active notes"
on public.notes
for select
using (is_active = true);
