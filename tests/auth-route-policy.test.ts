import type { Session } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import {
  AUTH_ROUTES,
  checkAuthRoute,
  getAuthRedirect,
} from "../lib/auth-route-policy";

const authenticatedSession = {
  user: { id: "user-1" },
} as Session;

describe("auth route policy", () => {
  it("keeps the public route available without a session", () => {
    expect(getAuthRedirect("public", false)).toBeNull();
  });

  it("redirects an authenticated user from the public route", () => {
    expect(getAuthRedirect("public", true)).toBe(AUTH_ROUTES.dashboard);
  });

  it("keeps the login route available without a session", () => {
    expect(getAuthRedirect("login", false)).toBeNull();
  });

  it("redirects an authenticated user from the login route", () => {
    expect(getAuthRedirect("login", true)).toBe(AUTH_ROUTES.dashboard);
  });

  it("redirects an unauthenticated user from a protected route", () => {
    expect(getAuthRedirect("protected", false)).toBe(AUTH_ROUTES.login);
  });

  it("allows an authenticated user to continue on a protected route", () => {
    expect(getAuthRedirect("protected", true)).toBeNull();
  });

  it("returns the authenticated user without a redirect", async () => {
    const result = await checkAuthRoute("protected", async () => ({
      data: { session: authenticatedSession },
      error: null,
    }));

    expect(result).toEqual({
      redirectTo: null,
      user: authenticatedSession.user,
    });
  });

  it("treats a session error as unauthenticated on a protected route", async () => {
    const result = await checkAuthRoute("protected", async () => ({
      data: { session: authenticatedSession },
      error: new Error("session unavailable"),
    }));

    expect(result).toEqual({
      redirectTo: AUTH_ROUTES.login,
      user: null,
    });
  });

  it("does not trap a public route in loading when session loading throws", async () => {
    const result = await checkAuthRoute("public", async () => {
      throw new Error("session unavailable");
    });

    expect(result).toEqual({
      redirectTo: null,
      user: null,
    });
  });

  it("redirects a protected route safely when session loading throws", async () => {
    const result = await checkAuthRoute("protected", async () => {
      throw new Error("session unavailable");
    });

    expect(result).toEqual({
      redirectTo: AUTH_ROUTES.login,
      user: null,
    });
  });
});
