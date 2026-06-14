-- GoodFood — migration 2
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run
-- (Adds a couple of columns missed in the first schema.sql.)

alter table dishes add column if not exists emoji text not null default '🍽️';
alter table orders add column if not exists mascot_message text not null default '';
