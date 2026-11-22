-- Synthetic, rollback-only test; run only on explicitly verified local/Staging.
begin;
insert into auth.users (id, email, aud, role) values
  ('f451cdda-1111-4000-8000-111111111111', 'tax-test-owner@example.invalid', 'authenticated', 'authenticated'),
  ('f451cdda-2222-4000-8000-222222222222', 'tax-test-other@example.invalid', 'authenticated', 'authenticated');
set local role authenticated;
select set_config('request.jwt.claim.sub', 'f451cdda-1111-4000-8000-111111111111', true);
insert into public.tax_settings (user_id, uber_type, uber_val)
values ('f451cdda-1111-4000-8000-111111111111', 'percent', 27.77);
do $$
declare p text; mode text; actual numeric; actual_mode text;
begin
  if not exists (select 1 from public.tax_settings where stuart_type='none' and stuart_val=0 and other_type='none' and other_val=0) then
    raise exception 'New settings defaults failed';
  end if;
  foreach p in array array['uber','wolt','bolt','glovo','stuart','pyszne','other'] loop
    foreach mode in array array['none','percent','fixed_week','fixed_month'] loop
      execute format('update public.tax_settings set %I=$1,%I=$2 where user_id=auth.uid()',p||'_type',p||'_val') using mode,27.77;
      execute format('select %I,%I from public.tax_settings where user_id=auth.uid()',p||'_type',p||'_val') into actual_mode,actual;
      if actual_mode<>mode or actual<>27.77 then raise exception 'Roundtrip failed'; end if;
    end loop;
  end loop;
  update public.tax_settings set uber_type='percent',uber_val=27.77;
  update public.tax_settings set stuart_type='percent',stuart_val=10,other_type='fixed_month',other_val=50;
  if not exists (select 1 from public.tax_settings where uber_type='percent' and uber_val=27.77) then raise exception 'Existing setting overwritten'; end if;
  begin
    update public.tax_settings set stuart_type='invalid';
    raise exception 'Invalid Stuart mode accepted';
  exception when check_violation then null; end;
  begin
    update public.tax_settings set other_type='invalid';
    raise exception 'Invalid Other mode accepted';
  exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claim.sub', 'f451cdda-2222-4000-8000-222222222222', true);
do $$
declare affected integer;
begin
  if exists (select 1 from public.tax_settings where user_id='f451cdda-1111-4000-8000-111111111111') then raise exception 'Cross-owner SELECT allowed'; end if;
  update public.tax_settings set other_val=999 where user_id='f451cdda-1111-4000-8000-111111111111';
  get diagnostics affected = row_count;
  if affected<>0 then raise exception 'Cross-owner UPDATE allowed'; end if;
  begin
    insert into public.tax_settings (user_id) values ('f451cdda-1111-4000-8000-111111111111');
    raise exception 'Cross-owner INSERT allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform 1 from public.tax_settings;
    raise exception 'Anonymous SELECT allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
