create table if not exists public.payments (
  id bigserial primary key,
  order_id text not null unique,
  user_id uuid not null references public.users(id) on delete cascade,
  amount integer not null check (amount > 0),
  credits integer not null check (credits > 0),
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded')),
  payment_key text,
  fail_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_user_created_at on public.payments(user_id, created_at desc);

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

create or replace function public.confirm_payment(
  p_order_id text,
  p_user_id uuid,
  p_amount integer,
  p_credits integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.payments(order_id, user_id, amount, credits, status)
  values (p_order_id, p_user_id, p_amount, p_credits, 'paid')
  on conflict (order_id) do update
    set status = 'paid',
        amount = excluded.amount,
        credits = excluded.credits,
        updated_at = now();

  update public.users
  set credits = credits + p_credits
  where id = p_user_id;

  insert into public.credit_transactions(user_id, amount, reason)
  values (p_user_id, p_credits, 'payment_confirm');
end;
$$;

create or replace function public.fail_payment(
  p_order_id text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.payments
  set status = 'failed',
      fail_reason = p_reason,
      updated_at = now()
  where order_id = p_order_id;
end;
$$;

create or replace function public.refund_payment(
  p_order_id text,
  p_amount integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_credits integer;
begin
  select user_id, credits into v_user_id, v_credits
  from public.payments
  where order_id = p_order_id;

  if v_user_id is null then
    return;
  end if;

  update public.payments
  set status = 'refunded',
      updated_at = now()
  where order_id = p_order_id;

  update public.users
  set credits = greatest(credits - v_credits, 0)
  where id = v_user_id;

  insert into public.credit_transactions(user_id, amount, reason)
  values (v_user_id, -v_credits, 'payment_refund');
end;
$$;

grant execute on function public.confirm_payment(text, uuid, integer, integer) to authenticated;
grant execute on function public.fail_payment(text, text) to authenticated;
grant execute on function public.refund_payment(text, integer) to authenticated;

