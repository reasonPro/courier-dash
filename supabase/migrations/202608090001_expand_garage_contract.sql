begin;

-- Stage 1 is deliberately additive for the deployed Web client. It adds the
-- canonical RPC and normalized-write guards but does not yet restrict the
-- existing authenticated direct INSERT policy for routine history.

do $garage_rule_id_preflight$
begin
  if exists (
    select 1
    from public.garage_history
    where rule_id is not null
      and (
        rule_id::text in ('NaN', 'Infinity', '-Infinity')
        or rule_id <> trunc(rule_id)
        or rule_id < '-9223372036854775808'::numeric
        or rule_id > '9223372036854775807'::numeric
      )
  ) then
    raise exception using
      errcode = 'CDG08',
      message = 'GARAGE_WRITE_FAILED';
  end if;
end;
$garage_rule_id_preflight$;

alter table public.garage_history
  alter column rule_id type bigint
  using rule_id::bigint;

alter table public.garage_rules
  add constraint garage_rules_name_required
    check (name is not null) not valid,
  add constraint garage_rules_user_id_required
    check (user_id is not null) not valid,
  add constraint garage_rules_interval_km_canonical
    check (
      interval_km is not null
      and interval_km::text not in ('NaN', 'Infinity', '-Infinity')
      and interval_km = trunc(interval_km)
      and interval_km between 0 and 2147483647
    ) not valid,
  add constraint garage_rules_last_change_km_canonical
    check (
      last_change_km is not null
      and last_change_km::text not in ('NaN', 'Infinity', '-Infinity')
      and last_change_km = trunc(last_change_km)
      and last_change_km between 0 and 2147483647
    ) not valid;

alter table public.garage_history
  add constraint garage_history_service_type_canonical
    check (
      service_type is not null
      and service_type in ('routine', 'repair')
    ) not valid,
  add constraint garage_history_name_required
    check (name is not null) not valid,
  add constraint garage_history_date_required
    check (date is not null) not valid,
  add constraint garage_history_user_id_required
    check (user_id is not null) not valid,
  add constraint garage_history_odometer_canonical
    check (
      odometer is not null
      and odometer::text not in ('NaN', 'Infinity', '-Infinity')
      and odometer = trunc(odometer)
      and odometer between 0 and 2147483647
    ) not valid,
  add constraint garage_history_cost_canonical
    check (
      cost is not null
      and cost::text not in ('NaN', 'Infinity', '-Infinity')
      and cost >= 0
      and cost = round(cost, 2)
    ) not valid,
  add constraint garage_history_repair_rule_id_null
    check (service_type <> 'repair' or rule_id is null) not valid,
  add constraint garage_history_rule_id_fkey
    foreign key (rule_id)
    references public.garage_rules (id)
    on delete set null
    not valid;

create index garage_history_rule_id_idx
  on public.garage_history (rule_id);

create function public.enforce_garage_history_insert_contract()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if new.service_type is null
    or new.service_type not in ('routine', 'repair') then
    raise exception using
      errcode = 'CDG09',
      message = 'GARAGE_INVALID_HISTORY_TYPE';
  end if;

  if new.service_type = 'repair' and new.rule_id is not null then
    raise exception using
      errcode = 'CDG09',
      message = 'GARAGE_INVALID_HISTORY_TYPE';
  end if;

  if new.service_type = 'routine' then
    if new.rule_id is null then
      raise exception using
        errcode = 'CDG09',
        message = 'GARAGE_INVALID_HISTORY_TYPE';
    end if;

    if not exists (
      select 1
      from public.garage_rules as garage_rule
      where garage_rule.id = new.rule_id
        and garage_rule.user_id = new.user_id
    ) then
      raise exception using
        errcode = 'CDG02',
        message = 'GARAGE_RULE_NOT_FOUND';
    end if;
  end if;

  return new;
end;
$function$;

revoke all privileges
on function public.enforce_garage_history_insert_contract()
from public, anon, authenticated;

create trigger enforce_garage_history_insert_contract
before insert on public.garage_history
for each row
execute function public.enforce_garage_history_insert_contract();

create function public.complete_garage_routine(
  p_rule_id bigint,
  p_expected_last_change_km numeric,
  p_date date,
  p_odometer integer,
  p_cost numeric
)
returns table (
  history_id bigint,
  history_created_at timestamp with time zone,
  rule_id bigint,
  rule_name text,
  service_type text,
  service_date date,
  odometer integer,
  cost numeric,
  interval_km numeric,
  last_change_km numeric,
  next_service_odometer numeric
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_rule_id bigint;
  v_rule_name text;
  v_interval_km numeric;
  v_last_change_km numeric;
  v_history_id bigint;
  v_history_created_at timestamp with time zone;
  v_updated_rows integer;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception using
      errcode = 'CDG01',
      message = 'GARAGE_AUTH_REQUIRED';
  end if;

  if p_date is null then
    raise exception using
      errcode = 'CDG03',
      message = 'GARAGE_INVALID_DATE';
  end if;

  if p_odometer is null or p_odometer < 0 then
    raise exception using
      errcode = 'CDG04',
      message = 'GARAGE_INVALID_ODOMETER';
  end if;

  if p_cost is null
    or p_cost::text in ('NaN', 'Infinity', '-Infinity')
    or p_cost < 0
    or p_cost <> round(p_cost, 2) then
    raise exception using
      errcode = 'CDG05',
      message = 'GARAGE_INVALID_COST';
  end if;

  select
    garage_rule.id,
    garage_rule.name,
    garage_rule.interval_km,
    garage_rule.last_change_km
  into
    v_rule_id,
    v_rule_name,
    v_interval_km,
    v_last_change_km
  from public.garage_rules as garage_rule
  where garage_rule.id = p_rule_id
    and garage_rule.user_id = v_user_id
  for update;

  if not found then
    raise exception using
      errcode = 'CDG02',
      message = 'GARAGE_RULE_NOT_FOUND';
  end if;

  if v_last_change_km is distinct from p_expected_last_change_km then
    raise exception using
      errcode = 'CDG06',
      message = 'GARAGE_CONFLICT';
  end if;

  if v_rule_name is null
    or v_interval_km is null
    or v_interval_km::text in ('NaN', 'Infinity', '-Infinity')
    or v_interval_km <> trunc(v_interval_km)
    or v_interval_km < 0
    or v_interval_km > 2147483647
    or v_last_change_km is null
    or v_last_change_km::text in ('NaN', 'Infinity', '-Infinity')
    or v_last_change_km <> trunc(v_last_change_km)
    or v_last_change_km < 0
    or v_last_change_km > 2147483647 then
    raise exception using
      errcode = 'CDG08',
      message = 'GARAGE_WRITE_FAILED';
  end if;

  insert into public.garage_history (
    service_type,
    name,
    date,
    cost,
    rule_id,
    odometer,
    user_id
  )
  values (
    'routine',
    v_rule_name,
    p_date,
    p_cost,
    v_rule_id,
    p_odometer,
    v_user_id
  )
  returning
    garage_history.id,
    garage_history.created_at
  into
    v_history_id,
    v_history_created_at;

  update public.garage_rules as garage_rule
  set last_change_km = p_odometer
  where garage_rule.id = v_rule_id
    and garage_rule.user_id = v_user_id;

  get diagnostics v_updated_rows = row_count;

  if v_updated_rows <> 1 then
    raise exception using
      errcode = 'CDG08',
      message = 'GARAGE_WRITE_FAILED';
  end if;

  return query
  select
    v_history_id,
    v_history_created_at,
    v_rule_id,
    v_rule_name,
    'routine'::text,
    p_date,
    p_odometer,
    p_cost,
    v_interval_km,
    p_odometer::numeric,
    case
      when v_interval_km = 0 then null
      else p_odometer::numeric + v_interval_km
    end;
end;
$function$;

comment on function public.complete_garage_routine(
  bigint,
  numeric,
  date,
  integer,
  numeric
) is 'Atomically records an owned routine service and advances its rule. Stable SQLSTATE/domain mappings: CDG01 GARAGE_AUTH_REQUIRED; CDG02 GARAGE_RULE_NOT_FOUND; CDG03 GARAGE_INVALID_DATE; CDG04 GARAGE_INVALID_ODOMETER; CDG05 GARAGE_INVALID_COST; CDG06 GARAGE_CONFLICT; CDG08 GARAGE_WRITE_FAILED; CDG09 GARAGE_INVALID_HISTORY_TYPE.';

revoke all privileges
on function public.complete_garage_routine(
  bigint,
  numeric,
  date,
  integer,
  numeric
)
from public, anon, authenticated;

grant execute
on function public.complete_garage_routine(
  bigint,
  numeric,
  date,
  integer,
  numeric
)
to authenticated;

commit;
