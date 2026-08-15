"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useLanguage } from "../../context/LanguageContext";
import {
  classifyRecoveryUpdateError,
  clearRecoverySessionMarker,
  hasRecoveryCallbackParams,
  hasRecoverySessionMarker,
  hasRecoveryUrlError,
  markRecoverySession,
  RECOVERY_PASSWORD_MIN_LENGTH,
  validateRecoveryPasswords,
} from "../../lib/password-recovery";
import { syncServerAuthSession } from "../../lib/server-session-client";
import { supabase } from "../../lib/supabase";

type RecoveryState = "checking" | "ready" | "invalid";

function clearRecoveryUrl() {
  if (!window.location.search && !window.location.hash) return;

  window.history.replaceState(
    window.history.state,
    "",
    window.location.pathname,
  );
}

async function clearRecoverySession() {
  clearRecoverySessionMarker(window.localStorage);
  clearRecoveryUrl();
  await supabase.auth.signOut({ scope: "local" });
  await syncServerAuthSession(null);
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [recoveryState, setRecoveryState] =
    useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;
    let recoveryEventReceived = false;
    let recoveryTimeout: number | null = null;
    const recoveryCallbackPresent = hasRecoveryCallbackParams(
      window.location.search,
      window.location.hash,
    );
    const recoverySessionWasMarked = hasRecoverySessionMarker(
      window.localStorage,
    );

    if (recoveryCallbackPresent) {
      markRecoverySession(window.localStorage);
    }

    if (hasRecoveryUrlError(window.location.search, window.location.hash)) {
      clearRecoveryUrl();

      if (recoverySessionWasMarked) {
        void clearRecoverySession();
      } else {
        clearRecoverySessionMarker(window.localStorage);
      }

      const invalidUrlTimer = window.setTimeout(() => {
        if (isActive) setRecoveryState("invalid");
      }, 0);

      return () => {
        isActive = false;
        window.clearTimeout(invalidUrlTimer);
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive || event !== "PASSWORD_RECOVERY" || !session) return;

      recoveryEventReceived = true;
      markRecoverySession(window.localStorage);
      clearRecoveryUrl();
      setRecoveryState("ready");
    });

    const finishRecoveryInitialization = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isActive) return;

      clearRecoveryUrl();

      if (error && recoveryCallbackPresent) {
        void clearRecoverySession();
        setRecoveryState("invalid");
        return;
      }

      if (recoverySessionWasMarked && data.session) {
        recoveryEventReceived = true;
        setRecoveryState("ready");
        return;
      }

      recoveryTimeout = window.setTimeout(() => {
        if (isActive && !recoveryEventReceived) {
          if (hasRecoverySessionMarker(window.localStorage)) {
            void clearRecoverySession();
          }

          setRecoveryState("invalid");
        }
      }, 5000);
    };

    void finishRecoveryInitialization();

    return () => {
      isActive = false;
      if (recoveryTimeout !== null) {
        window.clearTimeout(recoveryTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");

    const validationError = validateRecoveryPasswords(
      password,
      passwordConfirmation,
    );

    if (validationError) {
      setErrorMessage(t.passwordRecovery[validationError]);
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      const recoveryError = classifyRecoveryUpdateError(updateError);

      if (recoveryError === "invalid") {
        await clearRecoverySession();
        setRecoveryState("invalid");
      } else {
        setErrorMessage(t.passwordRecovery[recoveryError]);
      }

      setIsLoading(false);
      return;
    }

    setPassword("");
    setPasswordConfirmation("");
    await clearRecoverySession();

    router.replace("/login?password-reset=success");
  };

  if (recoveryState === "checking") {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 text-gray-300">
        {t.passwordRecovery.checkingLink}
      </div>
    );
  }

  if (recoveryState === "invalid") {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="bg-[#1e1e24] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-white">
            {t.passwordRecovery.invalidTitle}
          </h1>
          <p className="text-gray-400 text-sm mt-3">
            {t.passwordRecovery.invalidDescription}
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href="/forgot-password"
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition"
            >
              {t.passwordRecovery.requestNewLink}
            </Link>
            <Link
              href="/login"
              className="block text-gray-400 hover:text-white text-sm transition"
            >
              {t.passwordRecovery.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-[#1e1e24] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Courier<span className="text-blue-500">Dash</span>
          </h1>
          <h2 className="text-xl font-bold text-white mt-6">
            {t.passwordRecovery.resetTitle}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {t.passwordRecovery.resetDescription}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {errorMessage && (
            <div
              className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="new-password"
              className="block text-sm text-gray-400 mb-1"
            >
              {t.passwordRecovery.newPasswordLabel}
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={RECOVERY_PASSWORD_MIN_LENGTH}
              aria-describedby="password-requirement"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition"
            />
            <p id="password-requirement" className="mt-2 text-xs text-gray-500">
              {t.passwordRecovery.passwordRequirement}
            </p>
          </div>

          <div>
            <label
              htmlFor="confirm-new-password"
              className="block text-sm text-gray-400 mb-1"
            >
              {t.passwordRecovery.confirmPasswordLabel}
            </label>
            <input
              id="confirm-new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={RECOVERY_PASSWORD_MIN_LENGTH}
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg"
          >
            {isLoading
              ? t.passwordRecovery.saving
              : t.passwordRecovery.saveButton}
          </button>
        </form>
      </div>
    </div>
  );
}
