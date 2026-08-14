# Private admin dashboard

`/admin` is a private, unlinked CourierDash owner dashboard. It uses the existing Supabase Auth session and admits only the exact Production owner UID. Unauthenticated requests are redirected to the existing login flow; authenticated non-owner requests receive `404`.

## Security boundaries

- The Server Component checks a validated Supabase user before returning the page.
- `/api/admin/metrics` repeats the user and owner-UID check.
- `public.get_admin_dashboard_metrics()` independently checks `auth.uid()` before reading aggregate sources.
- The browser receives only the documented aggregate JSON. Email, profile fields, user IDs, earnings, expenses, routes, shifts, or individual records are not returned.
- No service-role credential is shipped to the browser. The server calls the RPC with the current user's JWT.
- `/admin` is intentionally absent from navigation, sitemap, and public links.

## Activity model

Migration `202608150001_create_admin_analytics.sql` adds `public.app_activity_daily`, keyed by `(user_id, activity_date)`. The date is computed in `Europe/Warsaw`. A successful heartbeat or successful Work, Garage, or Expenses mutation upserts only timestamps/area flags. No existing business table is rewritten and no trigger is attached to Auth, Work, Garage, or Expenses tables.

The client attempts a session heartbeat at most once every five minutes per signed-in user/browser. The database suppresses duplicate session updates inside one minute. Multiple tabs still resolve to one user/day row, and `online now` counts distinct users with a heartbeat during the last ten minutes. Analytics failure is best-effort and never blocks Auth or business-data saves.

Heartbeat and data-activity history begins only after this migration and its client tracking are deployed; it is intentionally not backfilled. Total/new-user and feature-adoption metrics use the existing canonical Auth and business rows.

## Metric definitions

- **Online now:** distinct authorized users whose `last_seen_at` is within ten minutes.
- **Total users:** count of Auth users.
- **New users:** Auth users created since the current Warsaw week/month began.
- **Active users:** users with a heartbeat/activity row today, within seven calendar days, or within thirty calendar days.
- **Data-active users:** users with at least one successful Work, Garage, or Expenses create/update marker in the same periods.
- **Adoption:** distinct users with at least one Work row, one Garage rule/history row, or one enabled Expenses setting/expense row; percentage uses total Auth users as denominator.
- **Returning users:** users active on at least two different calendar days during the last thirty days.
- **Week/month comparisons:** elapsed part of the current period compared with the same-length start of the immediately previous period. Both zero values yield `0%`; a positive current value over zero previous returns `null` (new baseline), not an infinite percentage.
- **30-day chart:** distinct active users per Warsaw calendar date, including zero-value dates.

The dashboard is read-only. If the aggregate RPC is unavailable or returns an unexpected shape, the UI reports an unavailable state rather than exposing raw database errors.
