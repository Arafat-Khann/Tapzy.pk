alter table public.orders drop constraint if exists orders_package_check;
alter table public.orders add constraint orders_package_check check (package in ('single_card', 'business_duo', 'business_trio', 'linkedin_card', 'instagram_card'));

alter table public.orders drop constraint if exists orders_quantity_check;
alter table public.orders add constraint orders_quantity_check check (quantity in (1, 2, 3));

alter table public.orders alter column google_review_url drop not null;
