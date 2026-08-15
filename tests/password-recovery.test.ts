import { describe, expect, it } from "vitest";

import {
  buildPasswordRecoveryRedirect,
  classifyRecoveryUpdateError,
  clearRecoverySessionMarker,
  hasRecoveryCallbackParams,
  hasPasswordResetSuccess,
  hasRecoverySessionMarker,
  hasRecoveryUrlError,
  isPasswordRecoveryCallback,
  isPasswordRecoveryRoute,
  markRecoverySession,
  PASSWORD_RECOVERY_ROUTE,
  RECOVERY_PASSWORD_MIN_LENGTH,
  shouldDetectAuthSessionInUrl,
  shouldIsolateRecoverySession,
  validateRecoveryPasswords,
} from "../lib/password-recovery";
import { translations } from "../lib/translations";

describe("password recovery helpers", () => {
  it("keeps the current six-character password minimum", () => {
    expect(RECOVERY_PASSWORD_MIN_LENGTH).toBe(6);
  });

  it.each([
    "https://courier-dash-gamma.vercel.app",
    "https://courier-dash-git-fix-password-recovery.vercel.app",
    "http://localhost:3000",
  ])("builds an exact same-origin reset URL for %s", (origin) => {
    expect(buildPasswordRecoveryRedirect(origin)).toBe(
      `${origin}${PASSWORD_RECOVERY_ROUTE}`,
    );
  });

  it("rejects non-HTTP recovery origins", () => {
    expect(() => buildPasswordRecoveryRedirect("javascript:alert(1)"))
      .toThrowError(/HTTP\(S\) origin/);
  });

  it("requires both password fields", () => {
    expect(validateRecoveryPasswords("", "")).toBe("required");
    expect(validateRecoveryPasswords("secret", "")).toBe("required");
  });

  it("rejects a password shorter than the current policy", () => {
    expect(validateRecoveryPasswords("12345", "12345")).toBe("tooShort");
  });

  it("rejects different passwords", () => {
    expect(validateRecoveryPasswords("123456", "654321")).toBe("mismatch");
  });

  it("accepts matching passwords without changing their value", () => {
    expect(validateRecoveryPasswords(" 12345", " 12345")).toBeNull();
  });

  it("recognizes only the exact login success marker", () => {
    expect(
      hasPasswordResetSuccess(new URLSearchParams("password-reset=success")),
    ).toBe(true);
    expect(
      hasPasswordResetSuccess(new URLSearchParams("password-reset=failed")),
    ).toBe(false);
    expect(hasPasswordResetSuccess(new URLSearchParams())).toBe(false);
  });

  it("recognizes recovery errors in query or hash parameters", () => {
    expect(hasRecoveryUrlError("?error=access_denied", "")).toBe(true);
    expect(hasRecoveryUrlError("", "#error_code=otp_expired")).toBe(true);
    expect(hasRecoveryUrlError("?code=exchange-code", "")).toBe(false);
  });

  it("recognizes implicit, PKCE, and error callback parameters", () => {
    expect(
      hasRecoveryCallbackParams(
        "",
        "#access_token=redacted&refresh_token=redacted&type=recovery",
      ),
    ).toBe(true);
    expect(hasRecoveryCallbackParams("?code=redacted", "")).toBe(true);
    expect(hasRecoveryCallbackParams("?error_code=otp_expired", "")).toBe(
      true,
    );
    expect(hasRecoveryCallbackParams("?next=/work", "#section")).toBe(false);
  });

  it("recognizes only callbacks explicitly marked for password recovery", () => {
    expect(
      isPasswordRecoveryCallback(
        "",
        "#access_token=redacted&type=recovery",
      ),
    ).toBe(true);
    expect(isPasswordRecoveryCallback("?type=recovery", "")).toBe(true);
    expect(isPasswordRecoveryCallback("?type=signup", "")).toBe(false);
    expect(isPasswordRecoveryCallback("?error_code=otp_expired", "")).toBe(
      false,
    );
  });

  it("allows recovery URL detection only on the reset route", () => {
    expect(
      shouldDetectAuthSessionInUrl(
        new URL("https://example.com/reset-password"),
        { access_token: "redacted", type: "recovery" },
      ),
    ).toBe(true);
    expect(
      shouldDetectAuthSessionInUrl(new URL("https://example.com/"), {
        access_token: "redacted",
        type: "recovery",
      }),
    ).toBe(false);
    expect(
      shouldDetectAuthSessionInUrl(new URL("https://example.com/"), {
        access_token: "redacted",
        type: "signup",
      }),
    ).toBe(true);
    expect(
      shouldDetectAuthSessionInUrl(new URL("https://example.com/"), {}),
    ).toBe(false);
    expect(
      shouldDetectAuthSessionInUrl(new URL("https://example.com/"), {
        code: "redacted",
      }),
    ).toBe(false);
  });

  it("isolates recovery routes and events from ordinary app sessions", () => {
    expect(isPasswordRecoveryRoute(PASSWORD_RECOVERY_ROUTE)).toBe(true);
    expect(isPasswordRecoveryRoute("/work")).toBe(false);
    expect(
      shouldIsolateRecoverySession(
        PASSWORD_RECOVERY_ROUTE,
        "",
        "",
        "INITIAL_SESSION",
      ),
    ).toBe(true);
    expect(
      shouldIsolateRecoverySession(
        "/",
        "",
        "#access_token=redacted&type=recovery",
        "INITIAL_SESSION",
      ),
    ).toBe(true);
    expect(
      shouldIsolateRecoverySession(
        "/",
        "?code=redacted",
        "",
        "INITIAL_SESSION",
      ),
    ).toBe(false);
    expect(
      shouldIsolateRecoverySession("/", "", "", "PASSWORD_RECOVERY"),
    ).toBe(true);
    expect(
      shouldIsolateRecoverySession("/work", "", "", "SIGNED_IN"),
    ).toBe(false);
    expect(
      shouldIsolateRecoverySession(
        "/work",
        "",
        "",
        "INITIAL_SESSION",
        true,
      ),
    ).toBe(true);
  });

  it("tracks recovery state without storing any token value", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(hasRecoverySessionMarker(storage)).toBe(false);
    markRecoverySession(storage);
    expect(hasRecoverySessionMarker(storage)).toBe(true);
    expect([...values.values()]).toEqual(["true"]);
    clearRecoverySessionMarker(storage);
    expect(hasRecoverySessionMarker(storage)).toBe(false);
  });

  it("maps weak passwords and invalid sessions without inspecting messages", () => {
    expect(classifyRecoveryUpdateError({ code: "weak_password" })).toBe(
      "tooShort",
    );
    expect(
      classifyRecoveryUpdateError({ name: "AuthSessionMissingError" }),
    ).toBe("invalid");
    expect(
      classifyRecoveryUpdateError({ code: "refresh_token_already_used" }),
    ).toBe("invalid");
    expect(classifyRecoveryUpdateError({ code: "unexpected_failure" })).toBe(
      "resetError",
    );
  });

  it("reduces an arbitrary URL error description to a boolean state", () => {
    const result = hasRecoveryUrlError(
      "",
      "#error_description=%3Cscript%3Eunsafe%3C%2Fscript%3E",
    );

    expect(result).toBe(true);
    expect(typeof result).toBe("boolean");
  });

  it("keeps password recovery translations complete in all web languages", () => {
    const expectedKeys = Object.keys(translations.en.passwordRecovery).sort();

    for (const language of ["pl", "uk", "en", "ru"] as const) {
      expect(Object.keys(translations[language].passwordRecovery).sort()).toEqual(
        expectedKeys,
      );
    }
  });
});
