"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function AdminAutoRedirect() {
  const { isLoaded, isSignedIn, user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const checkingRef = useRef(false);

  useEffect(() => {
    async function checkAdminAndRedirect() {
      if (!isLoaded) return;
      if (!isSignedIn || !user) return;
      if (checkingRef.current) return;

      if (pathname.startsWith("/admin")) return;
      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/sign-up")
      ) {
        return;
      }

      const email = user.primaryEmailAddress?.emailAddress;

      if (!email) return;

      checkingRef.current = true;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/me?email=${encodeURIComponent(email)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data?.isAdmin === true) {
          router.replace("/admin/interesses");
        }
      } catch (error) {
        console.error("Erro ao verificar admin:", error);
      } finally {
        checkingRef.current = false;
      }
    }

    checkAdminAndRedirect();
  }, [isLoaded, isSignedIn, user, pathname, router]);

  return null;
}
