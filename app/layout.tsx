"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { BottomNav } from "./_components/bottom-nav";
import { AdminNav } from "./_components/admin-bottom-nav";
import "./globals.css";
import { AIChatModal } from "./_components/chat/AIChatModal";
import { useState, Suspense } from "react";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { usePathname } from "next/navigation";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body>
        <ClerkProvider
          localization={{
            ...ptBR,
            signIn: {
              start: {
                title: "Bem-vindo à Imóveis.AI",
                subtitle: "Acesse sua conta para continuar",
              },
            },
          }}>
          <NuqsAdapter>
            <div className="flex min-h-screen bg-gray-50 text-foreground">
              <main className="flex-1">{children}</main>

              <Suspense fallback={null}>
                {isAdminRoute ? <AdminNav /> : <BottomNav />}
              </Suspense>

              <Suspense fallback={null}>
                <AIChatModal
                  isOpen={isChatOpen}
                  onClose={() => setIsChatOpen(false)}
                />
              </Suspense>
            </div>
          </NuqsAdapter>
        </ClerkProvider>
      </body>
    </html>
  );
}
