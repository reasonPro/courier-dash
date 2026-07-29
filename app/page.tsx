"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { AUTH_ROUTES } from "../lib/auth-route-policy";
import { startLandingSessionCheck } from "../lib/landing-session-check";
import { LandingPageContent } from "./components/landing/LandingPageContent";
import { LandingPreloader } from "./components/landing/LandingPreloader";

export default function LandingPage() {
  const router = useRouter();
  const { lang, setLanguage, t } = useLanguage();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("login");

  // Стани полів форми
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return startLandingSessionCheck({
      loadSession: () => supabase.auth.getSession(),
      onPublic: () => setIsCheckingSession(false),
      onRedirect: (redirectTo) => router.replace(redirectTo),
    });
  }, [router]);

  const openModal = (mode: "login" | "register") => {
    setModalMode(mode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNickname("");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    if (modalMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        closeModal();
        router.replace(AUTH_ROUTES.dashboard);
      }
    } else {
      // ПЕРЕВІРКА 1: Паролі збігаються?
      if (password !== confirmPassword) {
        setErrorMsg(t.auth.passwordsNotMatch);
        setIsLoading(false);
        return;
      }

      const cleanNickname = nickname.trim();

      // ПЕРЕВІРКА 2: Нікнейм вільний?
      const { data: existing } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("nickname", cleanNickname);

      if (existing && existing.length > 0) {
        setErrorMsg(t.auth.nicknameTaken);
        setIsLoading(false);
        return;
      }

      // СТВОРЕННЯ: Реєструємо і зберігаємо нікнейм у метадані юзера
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { nickname: cleanNickname }
        }
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Якщо реєстрація автоматично не залогінила (потрібно підтвердити email)
        if (!data.session) {
          setSuccessMsg(t.auth.successRegister);
          setModalMode("login");
          setPassword("");
          setConfirmPassword("");
        } else {
          // Якщо авторизувало одразу - примусово зберігаємо нік в базу
          await supabase.from("profiles").upsert({ id: data.user!.id, nickname: cleanNickname });
          router.replace(AUTH_ROUTES.dashboard);
        }
      }
    }
    setIsLoading(false);
  };

  if (isCheckingSession) {
    return <LandingPreloader label={t.common.loading} />;
  }

  return (
    <>
      <LandingPageContent
        lang={lang}
        onLanguageChange={setLanguage}
        onRegister={() => openModal("register")}
        onSignIn={() => openModal("login")}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-800 bg-[#1e1e24] p-6 shadow-2xl animate-scale-in md:p-8">
            <button onClick={closeModal} className="absolute right-4 top-4 text-lg text-gray-400 transition hover:text-white">✕</button>

            <div className="mb-6 flex border-b border-gray-800 font-bold">
              <button onClick={() => { setModalMode("login"); setErrorMsg(null); }} className={`flex-1 pb-3 text-center transition ${modalMode === "login" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-gray-200"}`}>
                {t.auth.loginTab}
              </button>
              <button onClick={() => { setModalMode("register"); setErrorMsg(null); }} className={`flex-1 pb-3 text-center transition ${modalMode === "register" ? "border-b-2 border-purple-500 text-purple-400" : "text-gray-400 hover:text-gray-200"}`}>
                {t.auth.registerTab}
              </button>
            </div>

            {errorMsg && <div className="mb-4 rounded-lg border border-red-700/50 bg-red-900/30 p-3 text-sm text-red-400">{errorMsg}</div>}
            {successMsg && <div className="mb-4 rounded-lg border border-green-700/50 bg-green-900/30 p-3 text-sm text-green-400">{successMsg}</div>}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {modalMode === "register" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">{t.auth.nicknameLabel}</label>
                  <input 
                    type="text" 
                    required 
                    pattern="^[a-zA-Z0-9_]{3,15}$"
                    title="3-15 символів. Англійські літери, цифри та _"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                    placeholder="FastRider_99"
                    className="w-full rounded-xl border border-gray-700 bg-[#2a2a35] p-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">{t.auth.emailLabel}</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-gray-700 bg-[#2a2a35] p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">{t.auth.passwordLabel}</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-700 bg-[#2a2a35] p-3 text-white focus:border-blue-500 focus:outline-none"
                />
                {modalMode === "login" && (
                  <div className="mt-2 text-right">
                    <Link href="/forgot-password" className="text-sm text-blue-400 transition hover:text-blue-300">
                      {t.passwordRecovery.forgotLink}
                    </Link>
                  </div>
                )}
              </div>

              {modalMode === "register" && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">{t.auth.confirmPasswordLabel}</label>
                  <input 
                    type="password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-700 bg-[#2a2a35] p-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className={`mt-4 w-full rounded-xl py-3.5 font-bold text-white transition ${
                  modalMode === "login" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:from-blue-500 hover:to-blue-400"
                    : "bg-gradient-to-r from-purple-600 to-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:from-purple-500 hover:to-purple-400"
                } ${isLoading && "cursor-not-allowed opacity-70"}`}
              >
                {isLoading ? t.common.loading : (modalMode === "login" ? t.auth.loginBtn : t.auth.registerBtn)}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
