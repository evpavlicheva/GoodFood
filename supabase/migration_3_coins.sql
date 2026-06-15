-- GoodFood — migration 3
-- Run this in: Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- Adds the columns needed for the coins / mascot-shop feature:
--   - dishes.coin_value: how many coins a healthy dish earns (1-3), or how
--     many coins a Snacks-category dish costs (1-20). NULL = use the
--     category default.
--   - dishes.is_available: was added earlier without a recorded migration —
--     included here too (with `if not exists`) so this script is safe to run
--     on any environment.

alter table dishes add column if not exists is_available boolean not null default true;
alter table dishes add column if not exists coin_value integer;
