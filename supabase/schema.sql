create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('TPZ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  delivery_address text not null check (char_length(delivery_address) between 1 and 500),
  phone text not null check (char_length(phone) between 3 and 40),
  email text,
  payment_method text not null check (payment_method in ('Cash on Delivery', 'Advance payment')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled')),
  total_amount integer not null check (total_amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  title text not null,
  quantity integer not null check (quantity between 1 and 1000),
  unit_price integer not null check (unit_price >= 0),
  line_total integer not null check (line_total >= 0)
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;

create or replace function public.create_tapzy_order(p_order jsonb, p_items jsonb)
returns table (id uuid, order_number text, total_amount integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  created_order public.orders;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 then
    raise exception 'Order must contain items';
  end if;

  insert into public.orders (
    customer_name,
    delivery_address,
    phone,
    email,
    payment_method,
    status,
    total_amount
  )
  values (
    p_order->>'customer_name',
    p_order->>'delivery_address',
    p_order->>'phone',
    nullif(p_order->>'email', ''),
    p_order->>'payment_method',
    'pending',
    (p_order->>'total_amount')::integer
  )
  returning * into created_order;

  insert into public.order_items (order_id, product_id, title, quantity, unit_price, line_total)
  select
    created_order.id,
    item->>'product_id',
    item->>'title',
    (item->>'quantity')::integer,
    (item->>'unit_price')::integer,
    (item->>'line_total')::integer
  from jsonb_array_elements(p_items) as item;

  return query select created_order.id, created_order.order_number, created_order.total_amount;
end;
$$;

revoke all on function public.create_tapzy_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_tapzy_order(jsonb, jsonb) to service_role;
