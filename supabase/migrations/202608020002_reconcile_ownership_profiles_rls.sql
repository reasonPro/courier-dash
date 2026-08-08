-- Reconcile work ownership, profile lifecycle, and RLS role boundaries.
-- The migration aborts before mutation when ownership or nickname conflicts
-- would require a manual data decision.

begin;

do $$
begin
  if exists (
    select 1
    from public.work_shifts
    where user_id is null
  ) then
    raise exception 'work_shifts contains rows without an owner';
  end if;

  if exists (
    select 1
    from public.work_shifts shift_row
    left join auth.users auth_user on auth_user.id = shift_row.user_id
    where shift_row.user_id is not null
      and auth_user.id is null
  ) then
    raise exception 'work_shifts contains rows with an unknown owner';
  end if;

  if exists (
    select 1
    from auth.users auth_user
    left join public.profiles own_profile on own_profile.id = auth_user.id
    join public.profiles other_profile
      on other_profile.nickname = nullif(btrim(auth_user.raw_user_meta_data ->> 'nickname'), '')
     and other_profile.id <> auth_user.id
    where own_profile.id is null
  ) then
    raise exception 'profile backfill contains a nickname already owned by another profile';
  end if;

  if exists (
    select 1
    from (
      select nullif(btrim(auth_user.raw_user_meta_data ->> 'nickname'), '') as nickname
      from auth.users auth_user
      left join public.profiles own_profile on own_profile.id = auth_user.id
      where own_profile.id is null
    ) missing_profile
    where missing_profile.nickname is not null
    group by missing_profile.nickname
    having count(*) > 1
  ) then
    raise exception 'profile backfill contains duplicate nickname metadata';
  end if;
end
$$;

alter table public.work_shifts
  alter column user_id drop default,
  alter column user_id set not null;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'nickname'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user_profile()
from public, anon, authenticated, service_role;

drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

insert into public.profiles (id, nickname)
select
  auth_user.id,
  nullif(btrim(auth_user.raw_user_meta_data ->> 'nickname'), '')
from auth.users auth_user
left join public.profiles profile on profile.id = auth_user.id
where profile.id is null
on conflict (id) do nothing;

alter policy "Профілі можуть читати всі"
  on public.profiles
  to anon, authenticated
  using (true);

alter policy "Користувач може створювати свій п"
  on public.profiles
  to authenticated
  with check (auth.uid() = id);

alter policy "Користувач може оновлювати свій п"
  on public.profiles
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

alter policy "Users can view own tax settings"
  on public.tax_settings
  to authenticated
  using (auth.uid() = user_id);

alter policy "Users can insert own tax settings"
  on public.tax_settings
  to authenticated
  with check (auth.uid() = user_id);

alter policy "Users can update own tax settings"
  on public.tax_settings
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter policy "Користувач керує своїм гаражем"
  on public.garage_rules
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Користувач керує своєю історією"
  on public.garage_history;

create policy "Користувач читає свою історію"
  on public.garage_history
  as permissive
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Користувач додає свою історію"
  on public.garage_history
  as permissive
  for insert
  to authenticated
  with check (auth.uid() = user_id);

commit;
