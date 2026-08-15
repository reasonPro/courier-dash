"use client";

import Link from "next/link";
import { useState } from "react";

import { useLanguage } from "../../context/LanguageContext";
import { buildPasswordRecoveryRedirect } from "../../lib/password-recovery";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: buildPasswordRecoveryRedirect(window.location.origin),
    });

    if (error) {
      setErrorMessage(t.passwordRecovery.requestError);
    } else {
      setIsSent(true);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-[#1e1e24] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Courier<span className="text-blue-500">Dash</span>
          </h1>
          <h2 className="text-xl font-bold text-white mt-6">
            {t.passwordRecovery.forgotTitle}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {t.passwordRecovery.forgotDescription}
          </p>
        </div>

        {isSent ? (
          <div
            className="bg-green-500/10 border border-green-500/50 text-green-300 text-sm p-4 rounded-lg text-center"
            role="status"
          >
            {t.passwordRecovery.requestSent}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
                htmlFor="recovery-email"
                className="block text-sm text-gray-400 mb-1"
              >
                {t.passwordRecovery.emailLabel}
              </label>
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg"
            >
              {isLoading
                ? t.passwordRecovery.sending
                : t.passwordRecovery.sendButton}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-gray-400 hover:text-white text-sm transition"
          >
            {t.passwordRecovery.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}
