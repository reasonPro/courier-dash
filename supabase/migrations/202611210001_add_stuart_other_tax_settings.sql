-- Additive only: stable platform settings, no changes to existing tax values or RLS.
-- Apply schema before deploying the seven-platform settings writer.
begin;

alter table public.tax_settings
  add column stuart_type text not null default 'none',
  add column stuart_val numeric not null default 0,
  add column other_type text not null default 'none',
  add column other_val numeric not null default 0,
  add constraint tax_settings_stuart_type_valid
    check (stuart_type in ('none', 'percent', 'fixed_week', 'fixed_month')),
  add constraint tax_settings_other_type_valid
    check (other_type in ('none', 'percent', 'fixed_week', 'fixed_month'));

commit;
