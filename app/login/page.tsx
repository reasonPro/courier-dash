"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (isLogin) {
      // Логіка входу
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setErrorMsg("Помилка входу: перевір email та пароль.");
      else router.push("/work");
    } else {
      // Логіка реєстрації
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) setErrorMsg("Помилка реєстрації: " + error.message);
      else {
        alert("Реєстрація успішна! Тепер ти можеш увійти.");
        setIsLogin(true);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="bg-[#1e1e24] border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Декоративний фон */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Courier<span className="text-blue-500">Dash</span>
          </h1>
          <p className="text-gray-400 text-sm">Твій персональний фінансовий помічник</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="твоя@пошта.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Пароль (мінімум 6 символів)</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-[#2a2a35] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg mt-4"
          >
            {isLoading ? "Зачекай..." : (isLogin ? "Увійти в систему" : "Створити акаунт")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            {isLogin ? "Ще немає акаунта? Зареєструйся" : "Вже є акаунт? Увійди"}
          </button>
        </div>
      </div>
    </div>
  );
}