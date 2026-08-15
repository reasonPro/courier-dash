export const RECOVERY_PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_RECOVERY_ROUTE = "/reset-password";
export const RECOVERY_SESSION_MARKER_KEY =
  "courierdash-password-recovery-active";

const RECOVERY_CALLBACK_PARAMS = [
  "access_token",
  "refresh_token",
  "expires_in",
  "expires_at",
  "token_type",
  "type",
  "code",
  "token",
  "token_hash",
  "error",
  "error_code",
  "error_description",
] as const;

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

type RecoveryAuthError = {
  code?: string | null;
  name?: string | null;
  status?: number | null;
};

type RecoveryMarkerStorage = {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

export type RecoveryUpdateError = "tooShort" | "invalid" | "resetError";
export type RecoveryRequestError = "rateLimit" | "requestError";

export function buildPasswordRecoveryRedirect(origin: string): string {
  const url = new URL(origin);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Password recovery requires an HTTP(S) origin.");
  }

  return new URL(PASSWORD_RECOVERY_ROUTE, `${url.origin}/`).toString();
}

export function isPasswordRecoveryRoute(pathname: string): boolean {
  return pathname === PASSWORD_RECOVERY_ROUTE;
}

export function isPasswordRecoveryCallback(
  search: string,
  hash: string,
): boolean {
  const queryParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  return (
    queryParams.get("type") === "recovery" ||
    hashParams.get("type") === "recovery"
  );
}

export function shouldDetectAuthSessionInUrl(
  url: URL,
  params: Record<string, string>,
): boolean {
  const hasImplicitCallbackParams = Boolean(
    params.access_token ||
      params.error ||
      params.error_description ||
      params.error_code,
  );

  if (!hasImplicitCallbackParams) return false;

  return params.type !== "recovery" || isPasswordRecoveryRoute(url.pathname);
}

export function hasRecoverySessionMarker(
  storage: RecoveryMarkerStorage,
): boolean {
  return storage.getItem(RECOVERY_SESSION_MARKER_KEY) === "true";
}

export function markRecoverySession(storage: RecoveryMarkerStorage): void {
  storage.setItem(RECOVERY_SESSION_MARKER_KEY, "true");
}

export function clearRecoverySessionMarker(
  storage: RecoveryMarkerStorage,
): void {
  storage.removeItem(RECOVERY_SESSION_MARKER_KEY);
}

export function hasRecoveryCallbackParams(
  search: string,
  hash: string,
): boolean {
  const queryParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  return RECOVERY_CALLBACK_PARAMS.some(
    (param) => queryParams.has(param) || hashParams.has(param),
  );
}

export function shouldIsolateRecoverySession(
  pathname: string,
  search: string,
  hash: string,
  authEvent?: string,
  recoverySessionMarked = false,
): boolean {
  return (
    isPasswordRecoveryRoute(pathname) ||
    authEvent === "PASSWORD_RECOVERY" ||
    recoverySessionMarked ||
    isPasswordRecoveryCallback(search, hash)
  );
}

export function classifyRecoveryUpdateError(
  error: RecoveryAuthError,
): RecoveryUpdateError {
  if (error.code === "weak_password") return "tooShort";

  if (
    error.name === "AuthSessionMissingError" ||
    [
      "bad_jwt",
      "jwt_expired",
      "refresh_token_already_used",
      "refresh_token_not_found",
      "session_not_found",
    ].includes(error.code ?? "")
  ) {
    return "invalid";
  }

  return "resetError";
}

export function classifyRecoveryRequestError(
  error: RecoveryAuthError,
): RecoveryRequestError {
  return error.code === "over_email_send_rate_limit"
    ? "rateLimit"
    : "requestError";
}

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
