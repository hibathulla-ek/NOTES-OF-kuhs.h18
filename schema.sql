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

-- NEW TABLES --

-- Note Requests
create table if not exists public.note_requests (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  requested_at timestamptz default now(),
  status text default 'pending'
);

alter table public.note_requests enable row level security;

drop policy if exists "Public can insert requests" on public.note_requests;
create policy "Public can insert requests"
on public.note_requests
for insert
with check (true);

-- Site Views
create table if not exists public.site_views (
  id uuid primary key default gen_random_uuid(),
  viewed_at timestamptz default now(),
  page text
);

alter table public.site_views enable row level security;

drop policy if exists "Public can insert views" on public.site_views;
create policy "Public can insert views"
on public.site_views
for insert
with check (true);

-- Questions
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  year text not null,
  paper text not null,
  type text not null,
  exam_year text,
  description text,
  drive_url text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.questions enable row level security;

drop policy if exists "Public can view active questions" on public.questions;
create policy "Public can view active questions"
on public.questions
for select
using (is_active = true);

-- MCQ Settings
create table if not exists public.mcq_settings (
  id uuid primary key default gen_random_uuid(),
  is_public boolean default false
);

-- Seed mcq_settings
insert into public.mcq_settings(is_public) select false where not exists (select 1 from public.mcq_settings);

alter table public.mcq_settings enable row level security;

drop policy if exists "Public can view mcq settings" on public.mcq_settings;
create policy "Public can view mcq settings"
on public.mcq_settings
for select
using (true);

-- MCQs
create table if not exists public.mcqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  subject text not null,
  year text not null,
  paper text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null,
  explanation text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.mcqs enable row level security;

drop policy if exists "Public can view active mcqs" on public.mcqs;
create policy "Public can view active mcqs"
on public.mcqs
for select
using (is_active = true);

-- Downloads log table for 15-downloads rolling limit
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  downloaded_at timestamptz default now() not null,
  file_id uuid not null,
  file_type text not null
);

alter table public.downloads enable row level security;
create index if not exists downloads_ip_time_idx on public.downloads (ip_address, downloaded_at desc);

-- Admin login attempts table for brute-force protection
create table if not exists public.admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ip_address text not null,
  attempted_at timestamptz default now() not null,
  is_successful boolean default false not null
);

alter table public.admin_login_attempts enable row level security;
create index if not exists admin_login_attempts_email_time_idx on public.admin_login_attempts (email, attempted_at desc);
create index if not exists admin_login_attempts_ip_time_idx on public.admin_login_attempts (ip_address, attempted_at desc);

-- Soft delete (Trash / Recycle Bin) support for notes
alter table public.notes add column if not exists deleted_at timestamptz;
create index if not exists notes_deleted_at_idx on public.notes (deleted_at);

drop policy if exists "Public can view active notes" on public.notes;
create policy "Public can view active notes"
on public.notes
for select
using (is_active = true and deleted_at is null);
