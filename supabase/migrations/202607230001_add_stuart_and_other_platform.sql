alter table public.work_shifts
  add column stuart numeric not null default 0,
  add column orders_stuart integer not null default 0,
  add column tips_stuart numeric not null default 0,
  add column bonuses_stuart numeric not null default 0,
  add column other_income numeric not null default 0,
  add column orders_other integer not null default 0,
  add column tips_other numeric not null default 0,
  add column bonuses_other numeric not null default 0,
  add column other_platform_name text;

alter table public.work_shifts
  add constraint work_shifts_other_platform_name_trimmed
    check (
      other_platform_name is null
      or (
        other_platform_name = btrim(other_platform_name)
        and other_platform_name <> ''
      )
    ),
  add constraint work_shifts_other_metrics_require_name
    check (
      other_platform_name is not null
      or (
        other_income = 0
        and orders_other = 0
        and tips_other = 0
        and bonuses_other = 0
      )
    );
