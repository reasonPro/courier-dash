import { cookies } from "next/headers"

import {
  getUserFromAccessToken,
  SERVER_AUTH_COOKIE,
} from "../../../../lib/admin-auth.server"

export const dynamic = "force-dynamic"

function bearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) return null
  const token = authorization.slice("Bearer ".length).trim()
  return token || null
}

export async function POST(request: Request) {
  const accessToken = bearerToken(request)
  if (!accessToken || !(await getUserFromAccessToken(accessToken))) {
    return new Response(null, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set(SERVER_AUTH_COOKIE, accessToken, {
    httpOnly: true,
    maxAge: 60 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
  return new Response(null, { status: 204 })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(SERVER_AUTH_COOKIE)
  return new Response(null, { status: 204 })
}
