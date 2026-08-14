begin;

-- Minimal, isolated activity telemetry for the private CourierDash dashboard.
-- Existing Work, Garage, Expenses and Auth rows are never rewritten and no
-- triggers are attached to existing tables.
create table public.app_activity_daily (
  user_id uuid not null
    references auth.users (id)
    on delete cascade,
  activity_date date not null,
  first_seen_at timestamp with time zone not null,
  last_seen_at timestamp with time zone not null,
  work_activity_at timestamp with time zone,
  garage_activity_at timestamp with time zone,
  expenses_activity_at timestamp with time zone,
  constraint app_activity_daily_pkey
    primary key (user_id, activity_date),
  constraint app_activity_daily_seen_order
    check (last_seen_at >= first_seen_at)
);

create index app_activity_daily_date_idx
  on public.app_activity_daily (activity_date desc);

create index app_activity_daily_last_seen_idx
  on public.app_activity_daily (last_seen_at desc);

alter table public.app_activity_daily enable row level security;

-- Direct table access remains closed. These policies are defense in depth for
-- any future grant and still limit a courier to their own activity row.
create policy "Users can insert own activity"
  on public.app_activity_daily
  as permissive
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own activity"
  on public.app_activity_daily
  as permissive
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all privileges
on table public.app_activity_daily
from public, anon, authenticated, service_role;

create function public.record_app_activity(p_area text default 'session')
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_now timestamp with time zone := statement_timestamp();
  v_activity_date date := timezone('Europe/Warsaw', v_now)::date;
begin
  if v_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'ANALYTICS_AUTH_REQUIRED';
  end if;

  if p_area is null or p_area not in ('session', 'work', 'garage', 'expenses') then
    raise exception using
      errcode = '22023',
      message = 'ANALYTICS_INVALID_AREA';
  end if;

  insert into public.app_activity_daily as activity (
    user_id,
    activity_date,
    first_seen_at,
    last_seen_at,
    work_activity_at,
    garage_activity_at,
    expenses_activity_at
  ) values (
    v_user_id,
    v_activity_date,
    v_now,
    v_now,
    case when p_area = 'work' then v_now end,
    case when p_area = 'garage' then v_now end,
    case when p_area = 'expenses' then v_now end
  )
  on conflict (user_id, activity_date) do update
  set
    last_seen_at = excluded.last_seen_at,
    work_activity_at = case
      when p_area = 'work' then excluded.last_seen_at
      else activity.work_activity_at
    end,
    garage_activity_at = case
      when p_area = 'garage' then excluded.last_seen_at
      else activity.garage_activity_at
    end,
    expenses_activity_at = case
      when p_area = 'expenses' then excluded.last_seen_at
      else activity.expenses_activity_at
    end
  where
    p_area <> 'session'
    or activity.last_seen_at <= excluded.last_seen_at - interval '1 minute';
end;
$function$;

revoke all privileges
on function public.record_app_activity(text)
from public, anon, authenticated, service_role;

grant execute
on function public.record_app_activity(text)
to authenticated;

create function public.get_admin_dashboard_metrics()
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $function$
declare
  v_owner_id constant uuid := '284cae3b-046c-4595-8f74-d826df4c1939'::uuid;
  v_now timestamp with time zone := statement_timestamp();
  v_today date := timezone('Europe/Warsaw', v_now)::date;
  v_week_start date := date_trunc('week', timezone('Europe/Warsaw', v_now))::date;
  v_month_start date := date_trunc('month', timezone('Europe/Warsaw', v_now))::date;
  v_previous_week_start date;
  v_previous_week_end date;
  v_previous_month_start date;
  v_previous_month_end date;
  v_total_users bigint;
  v_online_now bigint;
  v_new_week bigint;
  v_new_month bigint;
  v_active_today bigint;
  v_active_7 bigint;
  v_active_30 bigint;
  v_data_today bigint;
  v_data_7 bigint;
  v_data_30 bigint;
  v_work_users bigint;
  v_garage_users bigint;
  v_expenses_users bigint;
  v_returning_30 bigint;
  v_current_week bigint;
  v_previous_week bigint;
  v_current_month bigint;
  v_previous_month bigint;
  v_activity_30 jsonb;
begin
  if auth.uid() is distinct from v_owner_id then
    raise exception using
      errcode = '42501',
      message = 'ADMIN_FORBIDDEN';
  end if;

  v_previous_week_start := v_week_start - 7;
  v_previous_week_end := v_previous_week_start + (v_today - v_week_start);
  v_previous_month_start := (v_month_start - interval '1 month')::date;
  v_previous_month_end := least(
    v_previous_month_start + (v_today - v_month_start),
    v_month_start - 1
  );

  select count(*) into v_total_users from auth.users;

  select count(distinct user_id)
  into v_online_now
  from public.app_activity_daily
  where last_seen_at >= v_now - interval '10 minutes';

  select count(*)
  into v_new_week
  from auth.users
  where created_at >= (v_week_start::timestamp at time zone 'Europe/Warsaw');

  select count(*)
  into v_new_month
  from auth.users
  where created_at >= (v_month_start::timestamp at time zone 'Europe/Warsaw');

  select
    count(distinct user_id) filter (where activity_date = v_today),
    count(distinct user_id) filter (where activity_date >= v_today - 6),
    count(distinct user_id) filter (where activity_date >= v_today - 29)
  into v_active_today, v_active_7, v_active_30
  from public.app_activity_daily;

  select
    count(distinct user_id) filter (
      where activity_date = v_today
        and (
          work_activity_at is not null
          or garage_activity_at is not null
          or expenses_activity_at is not null
        )
    ),
    count(distinct user_id) filter (
      where activity_date >= v_today - 6
        and (
          work_activity_at is not null
          or garage_activity_at is not null
          or expenses_activity_at is not null
        )
    ),
    count(distinct user_id) filter (
      where activity_date >= v_today - 29
        and (
          work_activity_at is not null
          or garage_activity_at is not null
          or expenses_activity_at is not null
        )
    )
  into v_data_today, v_data_7, v_data_30
  from public.app_activity_daily;

  select count(distinct user_id)
  into v_work_users
  from public.work_shifts;

  select count(*)
  into v_garage_users
  from (
    select user_id from public.garage_rules
    union
    select user_id from public.garage_history
  ) as garage_users;

  select count(*)
  into v_expenses_users
  from (
    select user_id
    from public.expense_settings
    where enabled
    union
    select user_id from public.expenses
  ) as expenses_users;

  select count(*)
  into v_returning_30
  from (
    select user_id
    from public.app_activity_daily
    where activity_date >= v_today - 29
    group by user_id
    having count(distinct activity_date) >= 2
  ) as returning_users;

  select count(distinct user_id)
  into v_current_week
  from public.app_activity_daily
  where activity_date between v_week_start and v_today;

  select count(distinct user_id)
  into v_previous_week
  from public.app_activity_daily
  where activity_date between v_previous_week_start and v_previous_week_end;

  select count(distinct user_id)
  into v_current_month
  from public.app_activity_daily
  where activity_date between v_month_start and v_today;

  select count(distinct user_id)
  into v_previous_month
  from public.app_activity_daily
  where activity_date between v_previous_month_start and v_previous_month_end;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'date', activity_days.day_value::date::text,
        'users', coalesce(activity_counts.user_count, 0)
      )
      order by activity_days.day_value
    ),
    '[]'::jsonb
  )
  into v_activity_30
  from generate_series(
    v_today - 29,
    v_today,
    interval '1 day'
  ) as activity_days(day_value)
  left join (
    select activity_date, count(distinct user_id) as user_count
    from public.app_activity_daily
    where activity_date >= v_today - 29
    group by activity_date
  ) as activity_counts
    on activity_counts.activity_date = activity_days.day_value::date;

  return jsonb_build_object(
    'timezone', 'Europe/Warsaw',
    'generatedAt', v_now,
    'onlineNow', v_online_now,
    'totalUsers', v_total_users,
    'newUsers', jsonb_build_object(
      'week', v_new_week,
      'month', v_new_month
    ),
    'activeUsers', jsonb_build_object(
      'today', v_active_today,
      'days7', v_active_7,
      'days30', v_active_30
    ),
    'dataActiveUsers', jsonb_build_object(
      'today', v_data_today,
      'days7', v_data_7,
      'days30', v_data_30
    ),
    'adoption', jsonb_build_object(
      'work', jsonb_build_object(
        'count', v_work_users,
        'percent', case
          when v_total_users = 0 then 0
          else round(v_work_users * 100.0 / v_total_users, 1)
        end
      ),
      'garage', jsonb_build_object(
        'count', v_garage_users,
        'percent', case
          when v_total_users = 0 then 0
          else round(v_garage_users * 100.0 / v_total_users, 1)
        end
      ),
      'expenses', jsonb_build_object(
        'count', v_expenses_users,
        'percent', case
          when v_total_users = 0 then 0
          else round(v_expenses_users * 100.0 / v_total_users, 1)
        end
      )
    ),
    'returningUsers', jsonb_build_object(
      'days30', v_returning_30
    ),
    'comparisons', jsonb_build_object(
      'week', jsonb_build_object(
        'current', v_current_week,
        'previous', v_previous_week,
        'percentChange', case
          when v_previous_week = 0 and v_current_week = 0 then 0
          when v_previous_week = 0 then null
          else round((v_current_week - v_previous_week) * 100.0 / v_previous_week, 1)
        end
      ),
      'month', jsonb_build_object(
        'current', v_current_month,
        'previous', v_previous_month,
        'percentChange', case
          when v_previous_month = 0 and v_current_month = 0 then 0
          when v_previous_month = 0 then null
          else round((v_current_month - v_previous_month) * 100.0 / v_previous_month, 1)
        end
      )
    ),
    'activity30', v_activity_30
  );
end;
$function$;

revoke all privileges
on function public.get_admin_dashboard_metrics()
from public, anon, authenticated, service_role;

grant execute
on function public.get_admin_dashboard_metrics()
to authenticated;

commit;
