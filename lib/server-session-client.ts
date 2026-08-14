"use client"

export async function syncServerAuthSession(
  accessToken: string | null,
): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/session", {
      method: accessToken ? "POST" : "DELETE",
      cache: "no-store",
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    })
    return response.ok
  } catch {
    return false
  }
}
