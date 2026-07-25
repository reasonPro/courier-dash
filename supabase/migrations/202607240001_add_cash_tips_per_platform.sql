begin;

alter table public.work_shifts
  add column cash_tips_uber numeric not null default 0,
  add column cash_tips_wolt numeric not null default 0,
  add column cash_tips_bolt numeric not null default 0,
  add column cash_tips_glovo numeric not null default 0,
  add column cash_tips_stuart numeric not null default 0,
  add column cash_tips_other numeric not null default 0;

alter table public.work_shifts
  add constraint work_shifts_cash_tips_uber_nonnegative
    check (cash_tips_uber >= 0),
  add constraint work_shifts_cash_tips_wolt_nonnegative
    check (cash_tips_wolt >= 0),
  add constraint work_shifts_cash_tips_bolt_nonnegative
    check (cash_tips_bolt >= 0),
  add constraint work_shifts_cash_tips_glovo_nonnegative
    check (cash_tips_glovo >= 0),
  add constraint work_shifts_cash_tips_stuart_nonnegative
    check (cash_tips_stuart >= 0),
  add constraint work_shifts_cash_tips_other_nonnegative
    check (cash_tips_other >= 0),
  add constraint work_shifts_other_cash_tips_require_name
    check (
      other_platform_name is not null
      or cash_tips_other = 0
    );

commit;
