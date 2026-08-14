-- Enforce the owner-approved Expenses V1 upper amount boundary.
-- The existing lower bound and two-decimal scale remain owned by
-- 202608130001_create_expenses_schema.sql.

alter table public.expenses
  add constraint expenses_amount_max_check
  check (amount <= 999999.99)
  not valid;

-- Validation reads existing rows and changes no user data. It fails the
-- migration instead of silently rewriting a non-conforming amount.
alter table public.expenses
  validate constraint expenses_amount_max_check;
