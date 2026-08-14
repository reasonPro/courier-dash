import { NextResponse } from "next/server"

import {
  createUserScopedServerSupabase,
  getServerAuth,
  isAdminUserId,
} from "../../../../lib/admin-auth.server"
import { parseAdminDashboardMetrics } from "../../../../lib/admin-dashboard"

export const dynamic = "force-dynamic"

export async function GET() {
  const { accessToken, user } = await getServerAuth()
  if (!accessToken || !user) {
    return new Response(null, { status: 401 })
  }
  if (!isAdminUserId(user.id)) {
    return new Response(null, { status: 404 })
  }

  const supabase = createUserScopedServerSupabase(accessToken)
  const { data, error } = await supabase.rpc("get_admin_dashboard_metrics")
  const metrics = error ? null : parseAdminDashboardMetrics(data)
  if (!metrics) {
    return NextResponse.json(
      { code: "ADMIN_METRICS_UNAVAILABLE" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }

  return NextResponse.json(metrics, {
    headers: { "Cache-Control": "no-store" },
  })
}
