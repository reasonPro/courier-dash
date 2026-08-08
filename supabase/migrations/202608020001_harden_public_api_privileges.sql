-- Harden direct and default privileges for CourierDash application roles.
-- RLS, policies, ownership, schema structure, and data remain unchanged.
--
-- PostgreSQL's global default PUBLIC EXECUTE for future functions remains
-- unchanged. Every future function-creating migration must revoke EXECUTE
-- from PUBLIC and application roles in the same transaction, then grant
-- EXECUTE only to the exact roles that require it.

begin;

revoke all privileges on table
  public.profiles,
  public.tax_settings,
  public.work_shifts,
  public.garage_rules,
  public.garage_history
from anon, authenticated, service_role;

grant select (nickname)
on table public.profiles
to anon;

grant select, insert, update
on table
  public.profiles,
  public.tax_settings
to authenticated;

grant select, insert, update, delete
on table
  public.work_shifts,
  public.garage_rules
to authenticated;

grant select, insert
on table public.garage_history
to authenticated;

grant select, insert, update, delete
on table
  public.profiles,
  public.tax_settings,
  public.work_shifts,
  public.garage_rules,
  public.garage_history
to service_role;

revoke all privileges on sequence
  public.work_shifts_id_seq,
  public.garage_rules_id_seq,
  public.garage_history_id_seq
from anon, authenticated, service_role;

grant usage on sequence
  public.work_shifts_id_seq,
  public.garage_rules_id_seq,
  public.garage_history_id_seq
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
