-- Run this in Supabase SQL Editor.
-- This creates profiles, a credit ledger, generation job tracking, payment tracking, and admin settings.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text,
  role text not null default 'user' check (role in ('user', 'admin', 'owner')),
  credits integer not null default 1 check (credits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount <> 0),
  balance_after integer not null check (balance_after >= 0),
  reason text not null check (reason in ('initial_free', 'purchase', 'generation_spend', 'refund', 'admin_adjustment')),
  source text not null default 'system' check (source in ('system', 'stripe', 'crypto', 'runpod', 'admin')),
  reference_id text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_user_created_idx
on public.credit_ledger (user_id, created_at desc);

create table if not exists public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('image', 'video', 'edit')),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled', 'refunded')),
  companion_id text,
  prompt text,
  source_image_path text,
  output_url text,
  credits_reserved integer not null default 0 check (credits_reserved >= 0),
  credits_spent integer not null default 0 check (credits_spent >= 0),
  runpod_job_id text,
  error_message text,
  cost_estimate_usd numeric(10, 4) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists generation_jobs_user_created_idx
on public.generation_jobs (user_id, created_at desc);

create index if not exists generation_jobs_status_created_idx
on public.generation_jobs (status, created_at desc);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('stripe', 'crypto', 'manual')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed', 'refunded')),
  amount_usd numeric(10, 2) not null check (amount_usd >= 0),
  credits integer not null check (credits > 0),
  currency text not null default 'USD',
  tx_hash text,
  checkout_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_user_created_idx
on public.payments (user_id, created_at desc);

create unique index if not exists payments_tx_hash_unique_idx
on public.payments (tx_hash)
where tx_hash is not null;

create table if not exists public.admin_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.admin_settings (key, value)
values
  ('runpod_enabled', 'false'::jsonb),
  ('daily_spend_limit_usd', '25'::jsonb),
  ('max_jobs_per_user_per_day', '10'::jsonb),
  ('max_queued_jobs_per_user', '2'::jsonb),
  ('image_credit_cost', '1'::jsonb),
  ('video_credit_cost', '2'::jsonb)
on conflict (key) do nothing;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists generation_jobs_touch_updated_at on public.generation_jobs;
create trigger generation_jobs_touch_updated_at
before update on public.generation_jobs
for each row execute function public.touch_updated_at();

drop trigger if exists payments_touch_updated_at on public.payments;
create trigger payments_touch_updated_at
before update on public.payments
for each row execute function public.touch_updated_at();

create or replace function public.create_initial_credit_ledger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.credit_ledger (user_id, amount, balance_after, reason, source, note)
  values (new.id, new.credits, new.credits, 'initial_free', 'system', 'Initial free signup credits')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists profiles_initial_credit_ledger on public.profiles;
create trigger profiles_initial_credit_ledger
after insert on public.profiles
for each row execute function public.create_initial_credit_ledger();

insert into public.credit_ledger (user_id, amount, balance_after, reason, source, note)
select profiles.id, profiles.credits, profiles.credits, 'initial_free', 'system', 'Backfilled initial free signup credits'
from public.profiles
where profiles.credits > 0
  and not exists (
    select 1
    from public.credit_ledger
    where credit_ledger.user_id = profiles.id
      and credit_ledger.reason = 'initial_free'
  );

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.payments enable row level security;
alter table public.admin_settings enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own basic profile" on public.profiles;
create policy "Users can update their own basic profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can read their own credit ledger" on public.credit_ledger;
create policy "Users can read their own credit ledger"
on public.credit_ledger for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their own generation jobs" on public.generation_jobs;
create policy "Users can read their own generation jobs"
on public.generation_jobs for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own queued jobs" on public.generation_jobs;
create policy "Users can create their own queued jobs"
on public.generation_jobs for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own payments" on public.payments;
create policy "Users can read their own payments"
on public.payments for select
to authenticated
using (auth.uid() = user_id);

-- Admin-wide reads/writes are performed only by the Supabase service role from the Next.js backend.
