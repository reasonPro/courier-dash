export const RECOVERY_PASSWORD_MIN_LENGTH = 6;

export type RecoveryPasswordValidationError =
  | "required"
  | "tooShort"
  | "mismatch"
  | null;

type SearchParamsReader = {
  get: (name: string) => string | null;
};

const RECOVERY_ERROR_PARAMS = [
  "error",
  "error_code",
  "error_description",
] as const;

export function validateRecoveryPasswords(
  password: string,
  confirmation: string,
): RecoveryPasswordValidationError {
  if (!password || !confirmation) return "required";
  if (password.length < RECOVERY_PASSWORD_MIN_LENGTH) return "tooShort";
  if (password !== confirmation) return "mismatch";

  return null;
}

export function hasPasswordResetSuccess(
  searchParams: SearchParamsReader,
): boolean {
  return searchParams.get("password-reset") === "success";
}

export function hasRecoveryUrlError(search: string, hash: string): boolean {
  const queryParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  return RECOVERY_ERROR_PARAMS.some(
    (param) => queryParams.has(param) || hashParams.has(param),
  );
}
