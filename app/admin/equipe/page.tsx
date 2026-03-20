"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Shield,
  User as UserIcon,
  Mail,
  MoreVertical,
  Trash2,
} from "lucide-react";
// Importe o seu AdminNav de onde ele estiver (ajuste o caminho se necessário)
import { AdminNav } from "../../_components/admin-bottom-nav";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminEquipePage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [isAdminLogado, setIsAdminLogado] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [equipe, setEquipe] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  // 1. Verifica se quem está acessando é Admin
  useEffect(() => {
    async function checkAdmin() {
      if (!userId) return;
      try {
        const res = await fetch(`${API_URL}/admin/me?userId=${userId}`);
        const data = await res.json();
        setIsAdminLogado(Boolean(data.isAdmin));
      } catch {
        setIsAdminLogado(false);
      }
    }
    if (isLoaded && userId) {
      checkAdmin();
    }
  }, [isLoaded, userId]);

  // 2. Carrega a lista da equipe
  useEffect(() => {
    async function loadEquipe() {
      try {
        setLoading(true);
        // Exemplo de rota (você precisará criar no Fastify: GET /admin/equipe)
        const res = await fetch(`${API_URL}/admin/equipe?userId=${userId}`);

        if (res.ok) {
          const data = await res.json();
          setEquipe(data);
        } else {
          // Fallback de dados falsos apenas para você ver o visual enquanto não cria a rota
          setEquipe([
            {
              id: "1",
              name: "Paulo da Silva",
              email: "paulo@casasaojose.com.br",
              image:
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
              isAdmin: true,
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              name: "Lucília Mendes",
              email: "lucilia.corretora@gmail.com",
              image:
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
              isAdmin: false,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar equipe:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isAdminLogado) {
      loadEquipe();
    } else if (isAdminLogado === false) {
      setLoading(false);
    }
  }, [isAdminLogado, userId]);

  async function handleRemoverMembro(id: string) {
    if (
      !confirm(
        "Tem certeza que deseja remover este usuário da equipe? Ele perderá o acesso ao painel.",
      )
    )
      return;

    // Aqui entraria a chamada DELETE para sua API
    setEquipe(equipe.filter((membro) => membro.id !== id));
  }

  if (!isLoaded || isAdminLogado === null || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="size-10 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!isAdminLogado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            Acesso negado
          </h2>
          <p className="text-gray-500">
            Você não tem permissão para acessar a gestão de equipe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto">
        <AdminNav />

        {/* CABEÇALHO */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Equipe</h1>
            <p className="text-gray-500 mt-2">
              Gerencie os corretores e administradores da sua imobiliária.
            </p>
          </div>

          <button className="inline-flex items-center justify-center rounded-full bg-teal-500 px-5 py-3 text-sm font-bold text-white hover:bg-teal-600 transition shadow-lg shadow-teal-500/20">
            <Plus className="size-4 mr-2" />
            Convidar membro
          </button>
        </div>

        {/* LISTA DE MEMBROS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipe.map((membro) => (
            <div
              key={membro.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col relative group transition-all hover:shadow-md">
              {/* Botão de Opções (Visível no hover em Desktop) */}
              <button
                onClick={() => handleRemoverMembro(membro.id)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Remover membro">
                <Trash2 size={18} />
              </button>

              <div className="flex items-center gap-4 mb-5">
                {/* Avatar */}
                <div className="relative">
                  {membro.image ? (
                    <img
                      src={membro.image}
                      alt={membro.name || "Usuário"}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-50"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-500 border-2 border-teal-100">
                      <UserIcon size={28} />
                    </div>
                  )}
                  {/* Badge de Cargo */}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                    {membro.isAdmin ? (
                      <div className="bg-purple-100 text-purple-600 p-1 rounded-full">
                        <Shield size={12} />
                      </div>
                    ) : (
                      <div className="bg-blue-100 text-blue-600 p-1 rounded-full">
                        <UserIcon size={12} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                    {membro.name || "Usuário"}
                  </h3>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider mt-1 inline-block px-2 py-0.5 rounded-md ${
                      membro.isAdmin
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600"
                    }`}>
                    {membro.isAdmin ? "Administrador" : "Corretor"}
                  </span>
                </div>
              </div>

              {/* Contato e Detalhes */}
              <div className="bg-gray-50 rounded-2xl p-4 mt-auto">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Mail size={16} className="text-gray-400" />
                  <span className="truncate">{membro.email}</span>
                </div>
              </div>
            </div>
          ))}

          {equipe.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl border border-gray-100 p-12 text-center flex flex-col items-center">
              <div className="bg-gray-50 p-4 rounded-full text-gray-400 mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Nenhum membro encontrado
              </h3>
              <p className="text-gray-500">
                Você é o único na equipe no momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
