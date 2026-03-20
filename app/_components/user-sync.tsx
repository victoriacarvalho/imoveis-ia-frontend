"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const hasRun = useRef(false);

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded) return;
      if (!isSignedIn || !user) return;
      if (hasRun.current) return;

      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;

      hasRun.current = true;

      try {
        const response = await fetch(
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

        if (!response.ok) {
          const text = await response.text();
          console.error("Erro ao sincronizar usuário:", text);
        }
      } catch (error) {
        console.error("Erro ao sincronizar usuário:", error);
      }
    }

    syncUser();
  }, [isLoaded, isSignedIn, user]);

  return null;
}
