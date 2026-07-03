"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function LandingPage() {
  const router = useRouter();
  const { lang, setLanguage, t } = useLanguage();

  // Стан перевірки сесії для авто-входу
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Стани модального вікна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"login" | "register">("login");

  // Стани полів форми
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // АВТО-ВХІД: Якщо користувач вже авторизований, одразу пускаємо в кабінет
  useEffect(() => {
    const checkActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/work");
      } else {
        setIsCheckingSession(false);
      }
    };
    checkActiveSession();
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
        router.push("/work");
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(t.auth.successRegister);
        setModalMode("login");
      }
    }
    setIsLoading(false);
  };

  // Поки йде фонова перевірка сесії, показуємо нейтральний екран завантаження
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] text-white flex items-center justify-center font-medium">
        {t.common.loading}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-white relative overflow-hidden flex flex-col">
      {/* Стилі для плавних анімацій появи вікна */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}} />

      {/* Динамічний задній фон */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Навігація */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:px-12 border-b border-gray-800/50 bg-[#0a0a0e]/80 backdrop-blur-md">
        <div className="text-xl font-black tracking-tight">
          {t.landing.navLogo}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Dash</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-[#1e1e24] p-1 rounded-full border border-gray-700 text-xs font-bold">
            {(["pl", "uk", "en", "ru"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-2.5 py-1 rounded-full uppercase transition-all ${
                  lang === l 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button 
            onClick={() => openModal("login")}
            className="text-sm font-bold bg-[#1e1e24] hover:bg-[#2a2a35] border border-gray-700 px-5 py-2.5 rounded-full transition-all"
          >
            {t.landing.navBtn}
          </button>
        </div>
      </nav>

      {/* Головний блок (Hero Section) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-6 mt-12 md:mt-20">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
          {t.landing.badge}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight max-w-4xl">
          {t.landing.heroTitle1} <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
            {t.landing.heroTitle2}
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          {t.landing.heroDesc}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => openModal("register")}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {t.landing.startBtn}
          </button>
        </div>
      </main>

      {/* Блок переваг */}
      <section className="relative z-10 max-w-6xl mx-auto p-6 my-16 md:my-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e1e24]/80 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📈</div>
          <h3 className="text-xl font-bold mb-3 text-white">{t.landing.feat1Title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{t.landing.feat1Desc}</p>
        </div>

        <div className="bg-[#1e1e24]/80 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏍️</div>
          <h3 className="text-xl font-bold mb-3 text-white">{t.landing.feat2Title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{t.landing.feat2Desc}</p>
        </div>

        <div className="bg-[#1e1e24]/80 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all duration-300 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📱</div>
          <h3 className="text-xl font-bold mb-3 text-white">{t.landing.feat3Title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{t.landing.feat3Desc}</p>
        </div>
      </section>

      {/* МОДАЛЬНЕ ВІКНО З ПЛАВНОЮ АНІМАЦІЄЮ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden p-6 md:p-8 relative shadow-2xl animate-scale-in">
            
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-lg"
            >
              ✕
            </button>

            <div className="flex border-b border-gray-800 mb-6 font-bold">
              <button 
                onClick={() => { setModalMode("login"); setErrorMsg(null); }}
                className={`flex-1 pb-3 text-center transition ${modalMode === "login" ? "text-blue-400 border-b-2 border-blue-500" : "text-gray-400 hover:text-gray-200"}`}
              >
                {t.auth.loginTab}
              </button>
              <button 
                onClick={() => { setModalMode("register"); setErrorMsg(null); }}
                className={`flex-1 pb-3 text-center transition ${modalMode === "register" ? "text-purple-400 border-b-2 border-purple-500" : "text-gray-400 hover:text-gray-200"}`}
              >
                {t.auth.registerTab}
              </button>
            </div>

            {errorMsg && <div className="bg-red-900/30 border border-red-700/50 text-red-400 p-3 rounded-lg text-sm mb-4">{errorMsg}</div>}
            {successMsg && <div className="bg-green-900/30 border border-green-700/50 text-green-400 p-3 rounded-lg text-sm mb-4">{successMsg}</div>}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{t.auth.emailLabel}</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">{t.auth.passwordLabel}</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-3.5 mt-2 rounded-xl font-bold transition text-white ${
                  modalMode === "login" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                    : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                } ${isLoading && "opacity-70 cursor-not-allowed"}`}
              >
                {isLoading ? t.common.loading : (modalMode === "login" ? t.auth.loginBtn : t.auth.registerBtn)}
              </button>
            </form>

          </div>
        </div>
      )}

      <footer className="relative z-10 border-t border-gray-800/50 mt-auto py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} CourierDash. {t.landing.footer}</p>
      </footer>
    </div>
  );
}