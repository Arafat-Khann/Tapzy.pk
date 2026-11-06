create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('TPZ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  phone text not null check (char_length(phone) between 10 and 20),
  city text not null check (char_length(city) between 1 and 80),
  complete_address text not null check (char_length(complete_address) between 1 and 500),
  business_name text check (business_name is null or char_length(business_name) <= 120),
  package text not null check (package in ('single_card', 'business_duo')),
  quantity integer not null check (quantity in (1, 2)),
  google_review_url text not null check (char_length(google_review_url) between 12 and 500),
  payment_method text not null check (payment_method in ('cod', 'bank_transfer')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'pending_verification', 'paid', 'failed')),
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled')),
  total_amount integer not null check (total_amount > 0),
  customer_notes text check (customer_notes is null or char_length(customer_notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (order_status, payment_status);

alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;

create or replace function public.set_orders_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
for each row execute function public.set_orders_updated_at();
