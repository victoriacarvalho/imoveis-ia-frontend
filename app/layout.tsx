"use client"; // Obrigatório pois o NuqsAdapter e os componentes de navegação são interativos

import { NuqsAdapter } from "nuqs/adapters/next/app"; // Ajustado para Next.js
import { BottomNav } from "./_components/bottom-nav";
import "./globals.css";
import { AIChatModal } from "./_components/chat/AIChatModal";
import { useState } from "react";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body>
        <NuqsAdapter>
          <div className="flex min-h-screen bg-gray-50 text-foreground">
            <main className="flex-1 pb-20 md:pb-0">{children}</main>

            <BottomNav />
            <AIChatModal
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        </NuqsAdapter>
      </body>
    </html>
  );
}
