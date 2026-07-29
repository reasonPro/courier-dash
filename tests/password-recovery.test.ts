import { describe, expect, it } from "vitest";

import {
  hasPasswordResetSuccess,
  hasRecoveryUrlError,
  RECOVERY_PASSWORD_MIN_LENGTH,
  validateRecoveryPasswords,
} from "../lib/password-recovery";

describe("password recovery helpers", () => {
  it("keeps the current six-character password minimum", () => {
    expect(RECOVERY_PASSWORD_MIN_LENGTH).toBe(6);
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

  it("reduces an arbitrary URL error description to a boolean state", () => {
    const result = hasRecoveryUrlError(
      "",
      "#error_description=%3Cscript%3Eunsafe%3C%2Fscript%3E",
    );

    expect(result).toBe(true);
    expect(typeof result).toBe("boolean");
  });
});
