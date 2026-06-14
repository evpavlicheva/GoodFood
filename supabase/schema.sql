-- GoodFood — Supabase schema
-- Run this once in: Supabase Dashboard → SQL Editor → New query → paste → Run

-- ───────────────────────────────────────────────
-- Dishes (menu)
-- ───────────────────────────────────────────────
create table if not exists dishes (
  id text primary key,
  category text not null,
  name text not null,
  name_ru text not null default '',
  mascot_tip text not null default '',
  mascot_tip_ru text not null default '',
  prep_time integer not null default 0,
  calories integer not null default 0,
  protein integer not null default 0,
  fat integer not null default 0,
  carbs integer not null default 0,
  fun_fact text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- Orders
-- ───────────────────────────────────────────────
create table if not exists orders (
  id text primary key,
  child_name text not null default '',
  status text not null default 'received',
  items jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- Cart (per-device, synced via a device id stored in the browser)
-- ───────────────────────────────────────────────
create table if not exists carts (
  device_id text primary key,
  items jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────
-- Row Level Security
-- This app has no real user accounts yet, so for now we allow the
-- anon key to read/write everything. Tighten this once Supabase Auth
-- is added for the admin side.
-- ───────────────────────────────────────────────
alter table dishes enable row level security;
alter table orders enable row level security;
alter table carts enable row level security;

create policy "dishes: anyone can read/write" on dishes
  for all using (true) with check (true);

create policy "orders: anyone can read/write" on orders
  for all using (true) with check (true);

create policy "carts: anyone can read/write" on carts
  for all using (true) with check (true);

-- ───────────────────────────────────────────────
-- Storage bucket for dish photos
-- ───────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('dish-images', 'dish-images', true)
on conflict (id) do nothing;

create policy "dish-images: public read" on storage.objects
  for select using (bucket_id = 'dish-images');

create policy "dish-images: anyone can upload" on storage.objects
  for insert with check (bucket_id = 'dish-images');

create policy "dish-images: anyone can update" on storage.objects
  for update using (bucket_id = 'dish-images');

create policy "dish-images: anyone can delete" on storage.objects
  for delete using (bucket_id = 'dish-images');
