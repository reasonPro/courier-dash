import { requireAdminPageAccess } from "../../lib/admin-auth.server"
import { AdminDashboard } from "./AdminDashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  await requireAdminPageAccess()
  return <AdminDashboard />
}
