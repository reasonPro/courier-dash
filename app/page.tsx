import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0e] text-white relative overflow-hidden flex flex-col">
      {/* Динамічний задній фон (неонові сфери) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Навігація */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:px-12 border-b border-gray-800/50 bg-[#0a0a0e]/80 backdrop-blur-md">
        <div className="text-xl font-black tracking-tight">
          Courier<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Dash</span>
        </div>
        <Link 
          href="/login" 
          className="text-sm font-bold bg-[#1e1e24] hover:bg-[#2a2a35] border border-gray-700 px-5 py-2.5 rounded-full transition-all"
        >
          Увійти
        </Link>
      </nav>

      {/* Головний блок (Hero Section) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-6 mt-12 md:mt-20">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
          Версія 1.0 вже доступна
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight max-w-4xl">
          Керуй своїм доходом <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
            як справжній профі
          </span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Перший дашборд, створений спеціально для кур'єрів. Аналізуй заробіток з Uber, Wolt, Bolt та Glovo, контролюй ефективність (зл/год) та стеж за технічним станом свого транспорту.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            🚀 Почати безкоштовно
          </Link>
        </div>
      </main>

      {/* Блок з картками переваг (Features) */}
      <section className="relative z-10 max-w-6xl mx-auto p-6 my-16 md:my-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Картка 1 */}
        <div className="bg-[#1e1e24]/80 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📈</div>
          <h3 className="text-xl font-bold mb-3 text-white">Розумна аналітика</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Система автоматично вираховує твою реальну ставку за годину та вартість кожного кілометра. Більше жодних підрахунків у блокноті.
          </p>
        </div>

        {/* Картка 2 */}
        <div className="bg-[#1e1e24]/80 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏍️</div>
          <h3 className="text-xl font-bold mb-3 text-white">Віртуальний Гараж</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Додай свій скутер чи мотоцикл. Встанови інтервали ТО, і система сама нагадає, коли час міняти мастило, колодки або ремінь варіатора.
          </p>
        </div>

        {/* Картка 3 */}
        <div className="bg-[#1e1e24]/80 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all duration-300 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📱</div>
          <h3 className="text-xl font-bold mb-3 text-white">Мультиплатформенність</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Зводь доходи з усіх додатків в одну зручну зміну. Наочні графіки покажуть, які дні та додатки приносять найбільший прибуток.
          </p>
        </div>

      </section>

      {/* Футер */}
      <footer className="relative z-10 border-t border-gray-800/50 mt-auto py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} CourierDash. Розроблено для кур'єрів.</p>
      </footer>
    </div>
  );
}