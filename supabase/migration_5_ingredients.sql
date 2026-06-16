-- GoodFood — migration 5
-- Run in Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- Adds:
--   - dishes.ingredients  text[]  — list of ingredients (filled by AI or manually)
--   - unavailable_ingredients     — parent toggles individual ingredients off/on

alter table dishes
  add column if not exists ingredients text[] not null default '{}';

create table if not exists unavailable_ingredients (
  name       text primary key,
  created_at timestamptz not null default now()
);

alter table unavailable_ingredients enable row level security;

create policy "unavailable_ingredients: anyone can read/write"
  on unavailable_ingredients for all using (true) with check (true);
