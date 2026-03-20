"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { BottomNav } from "./_components/bottom-nav";
import { AdminNav } from "./_components/admin-bottom-nav";
import "./globals.css";
import { AIChatModal } from "./_components/chat/AIChatModal";
import { Suspense } from "react";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { usePathname } from "next/navigation";
import { useQueryStates, parseAsBoolean } from "nuqs";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  const [chatParams, setChatParams] = useQueryStates({
    chat_open: parseAsBoolean.withDefault(false),
  });

  return (
    <div className="flex min-h-screen bg-gray-50 text-foreground">
      <main className="flex-1 pb-24">{children}</main>
      {isAdminRoute ? <AdminNav /> : <BottomNav />}
      <AIChatModal
        isOpen={chatParams.chat_open}
        onClose={() => setChatParams({ chat_open: false })}
      />
    </div>
  );
}

function LayoutContentWithSuspense({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          }}
          signInForceRedirectUrl="/login/redirect"
          signInFallbackRedirectUrl="/login/redirect"
          signUpForceRedirectUrl="/login/redirect"
          signUpFallbackRedirectUrl="/login/redirect">
          <NuqsAdapter>
            <LayoutContentWithSuspense>{children}</LayoutContentWithSuspense>
          </NuqsAdapter>
        </ClerkProvider>
      </body>
    </html>
  );
}
