"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function LoginRedirectPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    async function resolveRedirect() {
      if (!isLoaded) return;
      if (hasRun.current) return;
      hasRun.current = true;

      if (!isSignedIn || !user) {
        router.replace("/sign-in");
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(
          `${apiUrl}/me?clerkId=${encodeURIComponent(user.id)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          router.replace("/");
          return;
        }

        const data = await response.json();

        if (data?.isAdmin === true) {
          router.replace("/admin/interesses");
          return;
        }

        router.replace("/");
      } catch (error) {
        console.error("Erro ao verificar admin:", error);
        router.replace("/");
      }
    }

    resolveRedirect();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">
      Redirecionando...
    </div>
  );
}
