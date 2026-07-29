import type { Session, User } from "@supabase/supabase-js";

export const AUTH_ROUTES = {
  dashboard: "/work",
  home: "/",
  login: "/login",
} as const;

export type AuthRouteKind = "login" | "protected" | "public";
export type AuthRedirect =
  | typeof AUTH_ROUTES.dashboard
  | typeof AUTH_ROUTES.login
  | null;

type SessionResult = {
  data: { session: Session | null };
  error: unknown;
};

type LoadSession = () => Promise<SessionResult>;

type AuthRouteCheck = {
  redirectTo: AuthRedirect;
  user: User | null;
};

export function getAuthRedirect(
  routeKind: AuthRouteKind,
  isAuthenticated: boolean,
): AuthRedirect {
  if (routeKind === "protected") {
    return isAuthenticated ? null : AUTH_ROUTES.login;
  }

  return isAuthenticated ? AUTH_ROUTES.dashboard : null;
}

export async function checkAuthRoute(
  routeKind: AuthRouteKind,
  loadSession: LoadSession,
): Promise<AuthRouteCheck> {
  try {
    const { data, error } = await loadSession();
    const user = error ? null : data.session?.user ?? null;

    return {
      redirectTo: getAuthRedirect(routeKind, Boolean(user)),
      user,
    };
  } catch {
    return {
      redirectTo: getAuthRedirect(routeKind, false),
      user: null,
    };
  }
}
