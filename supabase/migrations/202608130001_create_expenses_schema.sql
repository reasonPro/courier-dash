begin;

create table public.expense_settings (
  user_id uuid primary key
    default auth.uid()
    references auth.users (id)
    on delete cascade,
  enabled boolean not null default false,
  active_categories text[] not null default '{}'::text[],
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint expense_settings_categories_known
    check (
      active_categories <@ array[
        'fuel',
        'rental',
        'maintenance',
        'repair',
        'food_on_shift'
      ]::text[]
      and array_position(active_categories, null) is null
    ),
  constraint expense_settings_enabled_has_category
    check (not enabled or cardinality(active_categories) > 0)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    default auth.uid()
    references auth.users (id)
    on delete cascade,
  category text not null,
  amount numeric not null,
  currency text not null default 'PLN',
  expense_date date not null,
  paid_period_from date,
  paid_period_to date,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint expenses_category_known
    check (
      category in (
        'fuel',
        'rental',
        'maintenance',
        'repair',
        'food_on_shift'
      )
    ),
  constraint expenses_amount_positive_pln
    check (
      amount > 0
      and amount::text not in ('NaN', 'Infinity', '-Infinity')
      and amount = round(amount, 2)
    ),
  constraint expenses_currency_pln
    check (currency = 'PLN'),
  constraint expenses_rental_period_shape
    check (
      (
        category = 'rental'
        and paid_period_from is not null
        and paid_period_to is not null
        and paid_period_to >= paid_period_from
      )
      or (
        category <> 'rental'
        and paid_period_from is null
        and paid_period_to is null
      )
    )
);

create index expenses_user_expense_date_idx
  on public.expenses (user_id, expense_date desc);

create index expenses_user_category_expense_date_idx
  on public.expenses (user_id, category, expense_date desc);

create function public.set_expenses_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

revoke all privileges
on function public.set_expenses_updated_at()
from public, anon, authenticated, service_role;

create trigger set_expense_settings_updated_at
before update on public.expense_settings
for each row
execute function public.set_expenses_updated_at();

create trigger set_expenses_updated_at
before update on public.expenses
for each row
execute function public.set_expenses_updated_at();

alter table public.expense_settings enable row level security;
alter table public.expenses enable row level security;

create policy "Users can view own expense settings"
  on public.expense_settings
  as permissive
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own expense settings"
  on public.expense_settings
  as permissive
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own expense settings"
  on public.expense_settings
  as permissive
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own expense settings"
  on public.expense_settings
  as permissive
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can view own expenses"
  on public.expenses
  as permissive
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses
  as permissive
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses
  as permissive
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses
  as permissive
  for delete
  to authenticated
  using (auth.uid() = user_id);

revoke all privileges on table
  public.expense_settings,
  public.expenses
from anon, authenticated, service_role;

grant select, insert, update, delete
on table
  public.expense_settings,
  public.expenses
to authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke all privileges on tables
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke all privileges on sequences
  from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions
  from anon, authenticated, service_role;

commit;
