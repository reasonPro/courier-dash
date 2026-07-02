import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121212] text-white p-6">
      <h1 className="text-4xl font-bold mb-8">Головний хаб</h1>
      <div className="flex gap-4">
        <Link 
          href="/work" 
          className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition font-medium"
        >
          💼 Робота
        </Link>
        <Link 
          href="/garage" 
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          🛠 Гараж
        </Link>
      </div>
    </main>
  );
}