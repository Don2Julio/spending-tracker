-- ============================================================
-- Spending Tracker — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Categories table
create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  emoji         text default '',
  budget_limit  numeric not null,
  reset_period  text not null check (reset_period in ('Weekly', 'Monthly', 'Annually')),
  last_reset    timestamptz not null default now(),
  created_at    timestamptz default now()
);

-- Entries (individual spending records)
create table if not exists entries (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references categories(id) on delete cascade not null,
  user_id       uuid references auth.users(id) on delete cascade not null,
  amount        numeric not null,
  note          text default '',
  date          timestamptz not null default now(),
  created_at    timestamptz default now()
);

-- ── Row Level Security (each user only sees their own data) ──────────────────

alter table categories enable row level security;
alter table entries    enable row level security;

-- Categories policies
create policy "Users can view own categories"
  on categories for select using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on categories for insert with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on categories for update using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on categories for delete using (auth.uid() = user_id);

-- Entries policies
create policy "Users can view own entries"
  on entries for select using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on entries for insert with check (auth.uid() = user_id);

create policy "Users can delete own entries"
  on entries for delete using (auth.uid() = user_id);

-- ── Real-time ─────────────────────────────────────────────────────────────────
-- Enable real-time on both tables so changes sync instantly across devices

alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table entries;
