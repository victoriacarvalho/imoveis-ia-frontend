"use client";

import { SignInButton } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    // Container principal: fundo preto, altura total da tela, centralizado
    <div className="max-w-md mx-auto min-h-screen bg-black flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <h1 className="text-white text-5xl font-black tracking-tighter mt-8 mb-4">
          IMÓVEIS.AI
        </h1>

        <div className="relative w-full max-w-[820px] aspect-square flex items-center justify-center">
          <img
            src="/hands-house.png"
            alt="Mãos entregando a chave de uma casa"
            className="object-contain w-full h-full drop-shadow-2xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&auto=format&fit=crop&bg=000000";
              (e.target as HTMLImageElement).className =
                "object-cover w-48 h-48 rounded-full grayscale opacity-50";
            }}
          />
        </div>
      </div>

      <div className="bg-[#00c1ac] rounded-t-[2.5rem] px-8 pt-12 pb-8 flex flex-col items-center text-center relative z-10 shadow-[0_-10px_40px_rgba(0,193,172,0.3)]">
        <p className="text-white text-[22px] leading-tight font-medium mb-10 px-2">
          O app que vai transformar a forma como você busca imóveis.
        </p>

        <SignInButton mode="modal" fallbackRedirectUrl="/">
          <button className="flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-4 px-8 rounded-full w-full max-w-[320px] shadow-lg hover:scale-105 active:scale-95 transition-all">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Fazer login com Google
          </button>
        </SignInButton>

        <p className="text-white/80 text-[10px] mt-16 font-medium">
          ©2026 Copyright IMÓVEIS.AI. Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
