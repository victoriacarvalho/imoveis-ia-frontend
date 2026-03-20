"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryStates, parseAsBoolean } from "nuqs";
import { Home, Building2, Heart, User, Sparkles } from "lucide-react";

export function BottomNavContent() {
  const pathname = usePathname();

  const [, setChatParams] = useQueryStates({
    chat_open: parseAsBoolean.withDefault(false),
  });

  const getIconColor = (path: string) => {
    return pathname === path ? "text-[#3ed4b4]" : "text-gray-300";
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.05)] flex justify-between items-center px-6 h-20 md:hidden z-50">
      <Link href="/" className={getIconColor("/")}>
        <Home className="size-7" />
      </Link>

      <Link href="/sugestoes" className={getIconColor("/sugestoes")}>
        <Building2 className="size-7" />
      </Link>

      <div className="relative -top-6">
        <button
          onClick={() => setChatParams({ chat_open: true })}
          className="flex items-center justify-center w-16 h-16 bg-[#3ed4b4] text-white rounded-full shadow-[0_8px_20px_rgba(62,212,180,0.5)] active:scale-95 transition-transform">
          <Sparkles className="size-8" />
        </button>
      </div>

      <Link href="/favoritos" className={getIconColor("/favoritos")}>
        <Heart className="size-7" />
      </Link>

      <Link href="/perfil" className={getIconColor("/perfil")}>
        <User className="size-7" />
      </Link>
    </nav>
  );
}
