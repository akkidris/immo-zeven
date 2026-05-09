-- ImmoAgent Pro - Database Schema
-- Run this in Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- Hauptobjekte
create table if not exists objects (
  id uuid primary key default uuid_generate_v4(),
  url text unique not null,
  source text not null default 'manual',
  status text not null default 'active',

  title text,
  description text,
  city text,
  postal_code text,
  address text,
  lat numeric,
  lng numeric,

  price numeric,
  living_area numeric,
  plot_area numeric,
  units integer,
  rooms integer,
  year_built integer,
  year_renovated integer,
  energy_class text,
  annual_rent numeric,
  is_rented boolean,

  price_per_sqm numeric,
  factor numeric,
  brutto_yield numeric,
  netto_yield numeric,
  monthly_rate numeric,
  cashflow_monthly numeric,
  score integer,
  rating text,

  raw_data jsonb,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_checked_at timestamptz,
  expired_at timestamptz
);

create index if not exists objects_status_idx on objects(status);
create index if not exists objects_score_idx on objects(score desc);
create index if not exists objects_city_idx on objects(city);

-- Analyse-Verlauf (jede Re-Analyse)
create table if not exists analyses (
  id uuid primary key default uuid_generate_v4(),
  object_id uuid not null references objects(id) on delete cascade,
  price numeric,
  annual_rent numeric,
  score integer,
  cashflow_monthly numeric,
  raw_data jsonb,
  analyzed_at timestamptz not null default now()
);

create index if not exists analyses_object_idx on analyses(object_id, analyzed_at desc);

-- Check History (24h Pings)
create table if not exists check_history (
  id uuid primary key default uuid_generate_v4(),
  object_id uuid not null references objects(id) on delete cascade,
  status_code integer,
  is_alive boolean,
  checked_at timestamptz not null default now()
);

create index if not exists check_history_object_idx on check_history(object_id, checked_at desc);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists objects_updated_at on objects;
create trigger objects_updated_at before update on objects
  for each row execute function set_updated_at();
