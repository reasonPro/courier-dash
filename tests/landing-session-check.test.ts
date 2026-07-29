import type { Session } from "@supabase/supabase-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_ROUTES } from "../lib/auth-route-policy";
import {
  LANDING_SESSION_TIMEOUT_MS,
  startLandingSessionCheck,
} from "../lib/landing-session-check";

const authenticatedSession = {
  user: { id: "user-1" },
} as Session;

function deferredSession() {
  let resolve!: (value: {
    data: { session: Session | null };
    error: unknown;
  }) => void;

  const promise = new Promise<{
    data: { session: Session | null };
    error: unknown;
  }>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

describe("landing session check", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("redirects a timely authenticated session to the dashboard", async () => {
    const onPublic = vi.fn();
    const onRedirect = vi.fn();

    const dispose = startLandingSessionCheck({
      loadSession: async () => ({
        data: { session: authenticatedSession },
        error: null,
      }),
      onPublic,
      onRedirect,
    });

    await vi.advanceTimersByTimeAsync(0);

    expect(onRedirect).toHaveBeenCalledOnce();
    expect(onRedirect).toHaveBeenCalledWith(AUTH_ROUTES.dashboard);
    expect(onPublic).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    dispose();
  });

  it("shows the Landing for a timely unauthenticated result", async () => {
    const onPublic = vi.fn();
    const onRedirect = vi.fn();

    const dispose = startLandingSessionCheck({
      loadSession: async () => ({
        data: { session: null },
        error: null,
      }),
      onPublic,
      onRedirect,
    });

    await vi.advanceTimersByTimeAsync(0);

    expect(onPublic).toHaveBeenCalledOnce();
    expect(onRedirect).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    dispose();
  });

  it("keeps the public fail-open behavior when session loading rejects", async () => {
    const onPublic = vi.fn();
    const onRedirect = vi.fn();

    const dispose = startLandingSessionCheck({
      loadSession: async () => {
        throw new Error("session unavailable");
      },
      onPublic,
      onRedirect,
    });

    await vi.advanceTimersByTimeAsync(0);

    expect(onPublic).toHaveBeenCalledOnce();
    expect(onRedirect).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    dispose();
  });

  it("shows the Landing after exactly 8 seconds when session loading never settles", async () => {
    const onPublic = vi.fn();
    const onRedirect = vi.fn();

    const dispose = startLandingSessionCheck({
      loadSession: () => new Promise(() => undefined),
      onPublic,
      onRedirect,
    });

    await vi.advanceTimersByTimeAsync(LANDING_SESSION_TIMEOUT_MS - 1);
    expect(onPublic).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(onPublic).toHaveBeenCalledOnce();
    expect(onRedirect).not.toHaveBeenCalled();
    dispose();
  });

  it("ignores an authenticated result that arrives after the timeout", async () => {
    const session = deferredSession();
    const onPublic = vi.fn();
    const onRedirect = vi.fn();

    const dispose = startLandingSessionCheck({
      loadSession: () => session.promise,
      onPublic,
      onRedirect,
    });

    await vi.advanceTimersByTimeAsync(LANDING_SESSION_TIMEOUT_MS);
    session.resolve({ data: { session: authenticatedSession }, error: null });
    await vi.advanceTimersByTimeAsync(0);

    expect(onPublic).toHaveBeenCalledOnce();
    expect(onRedirect).not.toHaveBeenCalled();
    dispose();
  });

  it("clears the timeout and ignores settlement after unmount", async () => {
    const session = deferredSession();
    const onPublic = vi.fn();
    const onRedirect = vi.fn();

    const dispose = startLandingSessionCheck({
      loadSession: () => session.promise,
      onPublic,
      onRedirect,
    });

    expect(vi.getTimerCount()).toBe(1);
    dispose();
    expect(vi.getTimerCount()).toBe(0);

    session.resolve({ data: { session: authenticatedSession }, error: null });
    await vi.advanceTimersByTimeAsync(LANDING_SESSION_TIMEOUT_MS);

    expect(onPublic).not.toHaveBeenCalled();
    expect(onRedirect).not.toHaveBeenCalled();
  });
});
