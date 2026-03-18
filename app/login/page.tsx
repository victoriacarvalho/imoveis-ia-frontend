"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { LogInIcon } from "lucide-react";

export default function LoginPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.replace("/");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-600 border-t-[#00c1ac] rounded-full animate-spin" />
        <p className="text-[#00c1ac] mt-4 font-medium animate-pulse">
          Entrando...
        </p>
      </div>
    );
  }

  if (userId) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-600 border-t-[#00c1ac] rounded-full animate-spin" />
        <p className="text-[#00c1ac] mt-4 font-medium animate-pulse">
          Redirecionando...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black flex flex-col font-sans">
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <h1 className="text-white text-5xl font-black tracking-tighter mt-8 mb-4">
          IMÓVEIS.AI
        </h1>

        <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
          <img
            src="/hands-house.png"
            alt="Mãos entregando a chave de uma casa"
            className="object-contain w-full h-full drop-shadow-2xl"
          />
        </div>
      </div>

      <div className="bg-[#00c1ac] rounded-t-[2.5rem] px-8 pt-12 pb-8 flex flex-col items-center text-center relative z-10 shadow-[0_-10px_40px_rgba(0,193,172,0.3)]">
        <p className="text-white text-[22px] leading-tight font-medium mb-10 px-2">
          O app que vai transformar a forma como você busca imóveis.
        </p>

        <SignInButton mode="modal" fallbackRedirectUrl="/" forceRedirectUrl="/">
          <Button variant="outline">
            <LogInIcon className="mr-2" />
            Fazer login ou criar conta
          </Button>
        </SignInButton>

        <p className="text-white/80 text-[10px] mt-16 font-medium">
          ©2026 Copyright IMÓVEIS.AI. Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
