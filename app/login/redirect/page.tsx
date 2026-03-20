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
        router.replace("/login");
        return;
      }

      const email = user.primaryEmailAddress?.emailAddress;

      if (!email) {
        router.replace("/");
        return;
      }

      try {
        const syncResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/profile/sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              email,
              name: user.fullName ?? user.firstName ?? null,
              image: user.imageUrl ?? null,
            }),
          },
        );

        if (!syncResponse.ok) {
          console.error("Erro ao sincronizar usuário");
          router.replace("/");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/me?email=${encodeURIComponent(email)}`,
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
