-- Migration v2 - mehr Felder für Profi-Analyse
-- Run im Supabase SQL Editor

alter table objects add column if not exists warm_rent numeric;
alter table objects add column if not exists heating_type text;
alter table objects add column if not exists heating_year integer;
alter table objects add column if not exists energy_kwh numeric;
alter table objects add column if not exists commercial_share numeric;
alter table objects add column if not exists last_major_renovation integer;
alter table objects add column if not exists features text[];
alter table objects add column if not exists images text[];
alter table objects add column if not exists og_image text;
alter table objects add column if not exists manual_override jsonb;
alter table objects add column if not exists user_notes text;
