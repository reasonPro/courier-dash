import {
  checkAuthRoute,
  type AuthRedirect,
} from "./auth-route-policy";

export const LANDING_SESSION_TIMEOUT_MS = 8_000;

type LandingSessionCheckOptions = {
  loadSession: Parameters<typeof checkAuthRoute>[1];
  onPublic: () => void;
  onRedirect: (redirectTo: Exclude<AuthRedirect, null>) => void;
};

export function startLandingSessionCheck({
  loadSession,
  onPublic,
  onRedirect,
}: LandingSessionCheckOptions): () => void {
  let isActive = true;
  let isComplete = false;

  const timeoutId = setTimeout(() => {
    if (!isActive || isComplete) return;

    isComplete = true;
    onPublic();
  }, LANDING_SESSION_TIMEOUT_MS);

  void checkAuthRoute("public", loadSession).then(({ redirectTo }) => {
    if (!isActive || isComplete) return;

    isComplete = true;
    clearTimeout(timeoutId);

    if (redirectTo) {
      onRedirect(redirectTo);
    } else {
      onPublic();
    }
  });

  return () => {
    isActive = false;
    clearTimeout(timeoutId);
  };
}
