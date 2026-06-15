-- GoodFood — migration 4
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- Adds tables for push notifications:
--   - push_subscriptions: one row per browser/device subscription. `role`
--     is 'child' (tied to a profile_name) or 'parent' (the shared admin
--     inbox — profile_name is left blank).
--   - notification_schedules: one row per child profile_name, with a list
--     of "HH:MM" reminder times (24h, evaluated in NOTIFICATION_TIMEZONE)
--     and a `last_sent` map so each time only fires once per day.

create extension if not exists pgcrypto;

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('child', 'parent')),
  profile_name text not null default '',
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_profile_idx
  on push_subscriptions (role, profile_name);

create table if not exists notification_schedules (
  profile_name text primary key,
  times text[] not null default '{}',
  enabled boolean not null default true,
  last_sent jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;
alter table notification_schedules enable row level security;

create policy "push_subscriptions: anyone can read/write" on push_subscriptions
  for all using (true) with check (true);

create policy "notification_schedules: anyone can read/write" on notification_schedules
  for all using (true) with check (true);
