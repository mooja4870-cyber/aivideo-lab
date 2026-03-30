-- Enable extension for UUID generation
create extension if not exists pgcrypto;

-- Core user profile table linked to Supabase Auth
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  credits integer not null default 3 check (credits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'processing', 'complete', 'failed')),
  topic text not null,
  language text not null default 'ko',
  script_json jsonb,
  video_r2_key text,
  thumbnail_r2_key text,
  duration_sec integer,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_jobs_user_id_created_at on public.jobs(user_id, created_at desc);
create index if not exists idx_jobs_status_created_at on public.jobs(status, created_at desc);

create table if not exists public.credit_transactions (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_credit_transactions_user_id_created_at
  on public.credit_transactions(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists trg_jobs_updated_at on public.jobs;
create trigger trg_jobs_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

-- Automatically create application user profile when auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, credits)
  values (new.id, new.email, 3)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Atomic credit deduction + job creation
create or replace function public.create_job_with_credit(
  p_user_id uuid,
  p_topic text,
  p_language text default 'ko'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job_id uuid;
begin
  update public.users
  set credits = credits - 1
  where id = p_user_id
    and credits > 0;

  if not found then
    raise exception 'INSUFFICIENT_CREDITS';
  end if;

  insert into public.jobs (user_id, status, topic, language)
  values (p_user_id, 'queued', p_topic, p_language)
  returning id into v_job_id;

  insert into public.credit_transactions (user_id, job_id, amount, reason)
  values (p_user_id, v_job_id, -1, 'job_create');

  return v_job_id;
end;
$$;

grant execute on function public.create_job_with_credit(uuid, text, text) to authenticated;

-- Row Level Security
alter table public.users enable row level security;
alter table public.jobs enable row level security;
alter table public.credit_transactions enable row level security;

drop policy if exists users_select_self on public.users;
create policy users_select_self
on public.users
for select
to authenticated
using (id = auth.uid());

drop policy if exists users_update_self on public.users;
create policy users_update_self
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists jobs_select_own on public.jobs;
create policy jobs_select_own
on public.jobs
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists jobs_insert_own on public.jobs;
create policy jobs_insert_own
on public.jobs
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists jobs_update_own on public.jobs;
create policy jobs_update_own
on public.jobs
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists credit_transactions_select_own on public.credit_transactions;
create policy credit_transactions_select_own
on public.credit_transactions
for select
to authenticated
using (user_id = auth.uid());

-- Realtime publication for job status streaming
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'jobs'
  ) then
    alter publication supabase_realtime add table public.jobs;
  end if;
end;
$$;
