-- GoodFood — migration 6
-- Run in Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- Adds:
--   - custom_categories — parent-defined extra dish categories

create table if not exists custom_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  name_ru    text not null default '',
  emoji      text not null default '🍴',
  created_at timestamptz not null default now()
);

alter table custom_categories enable row level security;

create policy "custom_categories: anyone can read/write"
  on custom_categories for all using (true) with check (true);
