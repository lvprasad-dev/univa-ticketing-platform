create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique,
  mobile text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
alter column email drop not null;

update public.profiles
set email = null
where email = '';

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  city text not null,
  venue text not null,
  event_date timestamptz not null,
  price numeric(10, 2) not null default 0,
  available_tickets integer not null check (available_tickets >= 0),
  banner_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  total_amount numeric(10, 2) not null default 0,
  booking_status text not null default 'confirmed',
  booked_at timestamptz not null default timezone('utc', now()),
  unique (event_id, user_id, booked_at)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, mobile)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'mobile', new.phone)
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = coalesce(excluded.email, public.profiles.email),
    mobile = coalesce(excluded.mobile, public.profiles.mobile),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);

drop policy if exists "Anyone can view events" on public.events;
create policy "Anyone can view events"
on public.events
for select
using (true);

drop policy if exists "Organizers can manage their events" on public.events;
create policy "Organizers can manage their events"
on public.events
for all
using (auth.uid() = organizer_id)
with check (auth.uid() = organizer_id);

drop policy if exists "Users can view their bookings" on public.bookings;
create policy "Users can view their bookings"
on public.bookings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their bookings" on public.bookings;
create policy "Users can create their bookings"
on public.bookings
for insert
with check (auth.uid() = user_id);

