alter table public.orders drop constraint if exists orders_package_check;
alter table public.orders add constraint orders_package_check check (package in ('single_card', 'business_duo', 'business_trio'));

alter table public.orders drop constraint if exists orders_quantity_check;
alter table public.orders add constraint orders_quantity_check check (quantity in (1, 2, 3));
