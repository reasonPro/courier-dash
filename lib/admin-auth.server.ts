import { createClient, type User } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"

import type { Database } from "./database.types"

export const ADMIN_OWNER_USER_ID = "284cae3b-046c-4595-8f74-d826df4c1939"
export const SERVER_AUTH_COOKIE = "courierdash-server-access-token"

function createServerSupabase(accessToken?: string) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
    },
  )
}

export function isAdminUserId(userId: string): boolean {
  return userId === ADMIN_OWNER_USER_ID
}

export async function getUserFromAccessToken(
  accessToken: string,
): Promise<User | null> {
  const { data, error } = await createServerSupabase().auth.getUser(accessToken)
  return error ? null : data.user
}

export async function getServerAuth(): Promise<{
  accessToken: string | null
  user: User | null
}> {
  const accessToken = (await cookies()).get(SERVER_AUTH_COOKIE)?.value ?? null
  if (!accessToken) return { accessToken: null, user: null }
  return {
    accessToken,
    user: await getUserFromAccessToken(accessToken),
  }
}

export async function requireAdminPageAccess(): Promise<void> {
  const { user } = await getServerAuth()
  if (!user) redirect("/login?next=/admin")
  if (!isAdminUserId(user.id)) notFound()
}

export function createUserScopedServerSupabase(accessToken: string) {
  return createServerSupabase(accessToken)
}
