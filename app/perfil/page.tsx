"use client";

import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";
import { Bath, BedDouble, CarFront, LogOut, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

type ProfileData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  plan: string | null;
  bedrooms: number | null;
  parkingSpots: number | null;
  bathrooms: number | null;
  neighborhood: string | null;
  onboardingDone: boolean;
};

function InfoCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-[20px] bg-[#eef1f9] px-4 py-6 min-h-[132px] flex flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#dfe5f7] text-[#14c7c2]">
        {icon}
      </div>

      <div className="text-[18px] font-extrabold text-black leading-none">
        {value}
      </div>

      <div className="mt-2 text-[12px] uppercase text-zinc-500">{label}</div>
    </div>
  );
}

function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md rounded-t-[28px] border border-zinc-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-zinc-400">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20h14V9.5" />
          </svg>
        </Link>

        <Link href="/agenda" className="text-zinc-400">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
        </Link>

        <Link
          href="/chat"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#18c8c3] text-white">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <path d="M12 3v18M3 12h18" />
          </svg>
        </Link>

        <Link href="/analytics" className="text-zinc-400">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <path d="M6 20V10M12 20V4M18 20v-7" />
          </svg>
        </Link>

        <Link href="/perfil" className="text-black">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;

      try {
        const res = await fetch(`http://localhost:8081/profile/${userId}`);
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#f5f5f5] flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-md bg-[#f5f5f5] px-5 pt-6 pb-28">
      <h1 className="text-[24px] font-black tracking-tight text-black">
        FIT.AI
      </h1>

      <div className="mt-10 flex items-center gap-4">
        <img
          src={profile?.image || user?.imageUrl || "/avatar-placeholder.png"}
          alt="Avatar"
          className="h-14 w-14 rounded-full object-cover"
        />

        <div>
          <h2 className="text-[18px] font-bold text-black">
            {profile?.name || user?.fullName || "Usuário"}
          </h2>
          <p className="text-[14px] text-zinc-500">
            {profile?.plan || "Plano Básico"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <InfoCard
          icon={<BedDouble className="h-5 w-5" />}
          value={profile?.bedrooms ?? "-"}
          label="QUARTOS"
        />

        <InfoCard
          icon={<CarFront className="h-5 w-5" />}
          value={profile?.parkingSpots ?? "-"}
          label="VAGA"
        />

        <InfoCard
          icon={<Bath className="h-5 w-5" />}
          value={profile?.bathrooms ?? "-"}
          label="BANHEIROS"
        />

        <InfoCard
          icon={<MapPin className="h-5 w-5" />}
          value={profile?.neighborhood ?? "-"}
          label="BAIRRO"
        />
      </div>

      <div className="mt-8 flex justify-center">
        <SignOutButton>
          <button className="flex items-center gap-2 text-red-500 font-semibold">
            Sair da conta
            <LogOut className="h-4 w-4" />
          </button>
        </SignOutButton>
      </div>

      <BottomBar />
    </div>
  );
}
