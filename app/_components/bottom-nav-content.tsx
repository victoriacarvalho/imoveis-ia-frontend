"use client";

import Link from "next/link";
import { Home, MessageCircle, Search, Heart } from "lucide-react";
import { usePathname } from "next/navigation";
// importe aqui qualquer useSearchParams / nuqs que você estiver usando
// import { useSearchParams } from "next/navigation";
// import { useQueryStates, parseAsBoolean } from "nuqs";

export function BottomNavContent() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path
      ? "text-teal-500 flex flex-col items-center gap-1"
      : "text-gray-400 hover:text-teal-500 flex flex-col items-center gap-1 transition-colors";
  };

  return (
    <nav className="fixed bottom-0 w-full md:max-w-md bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-6 py-4 flex justify-between items-center z-50">
      <Link href="/">
        <button className={getLinkClass("/")}>
          <Home size={22} />
          <span className="text-[9px] font-bold uppercase mt-0.5">Início</span>
        </button>
      </Link>

      <Link href="/imoveis">
        <button className={getLinkClass("/imoveis")}>
          <Search size={22} />
          <span className="text-[9px] font-bold uppercase mt-0.5">Buscar</span>
        </button>
      </Link>

      <button className="relative -top-5 bg-gray-900 text-white p-4 rounded-full shadow-xl shadow-gray-900/30 hover:bg-gray-800 hover:scale-105 transition-all">
        <MessageCircle size={24} strokeWidth={2.5} />
      </button>

      <Link href="/favoritos">
        <button className={getLinkClass("/favoritos")}>
          <Heart size={22} />
          <span className="text-[9px] font-bold uppercase mt-0.5">
            Favoritos
          </span>
        </button>
      </Link>
    </nav>
  );
}
