-- LOCAL DRAFT: remote schema verification blocked (Staging INACTIVE).
-- Additive only. Apply to an isolated test database before remote approval.
begin;

alter table public.work_shifts
  add column pyszne numeric not null default 0,
  add column orders_pyszne integer not null default 0,
  add column tips_pyszne numeric not null default 0,
  add column cash_tips_pyszne numeric not null default 0,
  add column bonuses_pyszne numeric not null default 0,
  add constraint work_shifts_cash_tips_pyszne_nonnegative
    check (cash_tips_pyszne >= 0);

alter table public.tax_settings
  add column pyszne_type text not null default 'none',
  add column pyszne_val numeric not null default 0,
  add constraint tax_settings_pyszne_type_valid
    check (pyszne_type in ('none', 'percent', 'fixed_week', 'fixed_month'));

-- Existing ownership, RLS, grants and historical values are unchanged.
-- In particular, Other records are never reclassified as Pyszne.
commit;
